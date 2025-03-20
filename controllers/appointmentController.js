const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const moment = require("moment"); // Install moment.js for

exports.addAppointment = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      consultationType,
      doctorEmail,
      date, // Expected format: "YYYY-MM-DD" from frontend
      startTime,
      medicines,
      age,
      gender,
      password,
    } = req.body;

    // Convert input date to match database format (DD-MM-YYYY)
    const formattedDate = moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");

    // Check if doctor exists
    const doctor = await Doctor.findOne({ email: doctorEmail });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if doctor has schedule for the specified date
    const scheduleForDate = doctor.schedule.find((schedule) => {
      const startDate = moment(schedule.startDate, "DD-MM-YYYY");
      const endDate = moment(schedule.endDate, "DD-MM-YYYY");
      const appointmentDate = moment(formattedDate, "DD-MM-YYYY");
      return appointmentDate.isBetween(startDate, endDate, null, "[]");
    });

    if (!scheduleForDate) {
      return res
        .status(400)
        .json({ message: "Doctor does not have a schedule for this date" });
    }

    // Find the specific time slot for the given date
    const timeSlot = scheduleForDate.timeSlots.find(
      (slot) => slot.date === formattedDate && slot.time === startTime
    );

    if (!timeSlot || timeSlot.status !== "available") {
      return res
        .status(400)
        .json({ message: "This time slot is either booked or unavailable" });
    }

    // Check if the appointment slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorEmail,
      date: formattedDate,
      startTime,
    });

    if (existingAppointment) {
      return res.status(400).json({
        message: "This time slot is already booked with this doctor.",
      });
    }

    // Check if user exists, otherwise create new user
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        firstName,
        lastName,
        email,
        phoneNumber,
        age,
        gender,
        doctorEmail,
        password,
      });
      await user.save();
    }

    // Create new appointment
    const appointment = new Appointment({
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      consultationType,
      doctorEmail:doctor.name,
      date: formattedDate,
      startTime,
      medicines,
    });
    await appointment.save();

    // Link appointment to user
    user.appointments.push(appointment._id);
    user.doctorEmail=doctorEmail;
    await user.save();

    // Link appointment to doctor
    doctor.appointments.push(appointment._id);
    await doctor.save();

    // **Fix: Update only the matching time slot for the correct date**
    await Doctor.updateOne(
      {
        email: doctorEmail,
        "schedule.timeSlots.date": formattedDate, // Match DD-MM-YYYY format
        "schedule.timeSlots.time": startTime,
      },
      {
        $set: { "schedule.$[].timeSlots.$[element].status": "booked" },
      },
      {
        arrayFilters: [
          { "element.time": startTime, "element.date": formattedDate }, // Ensure both date and time match
        ],
      }
    );
    const sortedAppointments = await Appointment.find()
    .sort({ date: -1 }) // Sorting by date in descending order
    .exec();
    res
      .status(201)
      .json({ message: "Appointment booked successfully", sortedAppointments });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update Appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { useremail, id } = req.params;
    const user = await User.findOne({ email:useremail });

    if (!user || !user.appointments.includes(id)) {
      return res
        .status(404)
        .json({ message: "Appointment not found for this user" });
    }
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    const sortedAppointments = await Appointment.find()
    .sort({ date: -1 }) // Sorting by date in descending order
    .exec();
    res.json(sortedAppointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
exports.addMedicineToAppointment = async (req, res) => {
  try {
    const { useremail, id } = req.params;

    // Find user and check if the appointment belongs to them
    const user = await User.findOne({ email: useremail });
    if (!user || !user.appointments.includes(id)) {
      return res
        .status(404)
        .json({ message: "Appointment not found for this user" });
    }

    // Update the appointment with a single medicine object
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { medicine: req.body }, // Directly set the medicine object
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const sortedAppointments = await Appointment.find()
    .sort({ date: -1 }) // Sorting by date in descending order
    .exec();
    res.json(sortedAppointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// Delete Appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const { userId, id } = req.params;
    // Find the appointment
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Find the user and check if the appointment exists
    const user = await User.findById(userId);
    if (!user || !user.appointments.includes(id)) {
      return res
        .status(404)
        .json({ message: "Appointment not found for this user" });
    }

    // Find the doctor and remove the appointment from their list
    const doctor = await Doctor.findOne({ email: appointment.doctorEmail });
    if (doctor) {
      doctor.appointments = doctor.appointments.filter(
        (appId) => appId.toString() !== id
      );

      // Update the doctor's time slot to "available"
      await Doctor.updateOne(
        {
          email: appointment.doctorEmail,
          "schedule.timeSlots.date": appointment.date,
          "schedule.timeSlots.time": appointment.startTime,
        },
        {
          $set: { "schedule.$[].timeSlots.$[element].status": "available" },
        },
        {
          arrayFilters: [
            {
              "element.time": appointment.startTime,
              "element.date": appointment.date,
            },
          ],
        }
      );

      await doctor.save();
    }

    // Remove the appointment from the user's list
    user.appointments = user.appointments.filter(
      (appId) => appId.toString() !== id
    );
    await user.save();

    // Delete the appointment
    await Appointment.findByIdAndDelete(id);

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get All Appointments by User ID
exports.getAllAppointments = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("appointments");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const sortedAppointments = await user.appointments
    .sort({ date: -1 }) // Sorting by date in descending order
    .exec();
    res.json(sortedAppointments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get Appointment by ID and User ID
exports.getAppointmentById = async (req, res) => {
  try {
    const { userId, id } = req.params;
    const user = await User.findById(userId);
    if (!user || !user.appointments.includes(id)) {
      return res
        .status(404)
        .json({ message: "Appointment not found for this user" });
    }
    const appointment = await Appointment.findById(id);
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
