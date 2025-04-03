const Appointment = require("../models/Appointment");
const User = require("../models/User");
const Doctor = require("../models/Doctor");
const AppCounter = require("../models/AppCounter.js");
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
      date,
      startTime,
      age,
      gender,
      medicines,
      password,
    } = req.body;

    console.log("Received Appointment Request:", req.body);

    const userPassword = password || "12345";

    // Convert date format to match database (DD-MM-YYYY)
    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }
    const formattedDate = moment(date, "YYYY-MM-DD").format("DD-MM-YYYY");

    // Check if doctor exists
    const doctor = await Doctor.findOne({ email: doctorEmail });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Ensure doctor has a schedule
    if (!doctor.schedule || doctor.schedule.length === 0) {
      return res
        .status(400)
        .json({ message: "Doctor has no schedule available." });
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
        .json({ message: "Doctor does not have a schedule for this date." });
    }

    // Ensure timeSlots exist
    if (!scheduleForDate.timeSlots || scheduleForDate.timeSlots.length === 0) {
      return res
        .status(400)
        .json({ message: "No available time slots for this date." });
    }

    // Find the specific time slot
    const timeSlot = scheduleForDate.timeSlots.find(
      (slot) => slot.date === formattedDate && slot.time === startTime
    );

    if (!timeSlot || timeSlot.status !== "available") {
      return res
        .status(400)
        .json({ message: "This time slot is either booked or unavailable." });
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
        password: userPassword,
      });
      await user.save();
    }

    const formattedMedicines = medicines || {
      complain: "No complaints",
      remedies: [],
      potency: "Medium",
      duration: "3 Days",
      pharmacyName: "Generic Pharmacy",
      instructions: "Take with water",
      showMedicine: "No",
    };
    let counter = await AppCounter.findOneAndUpdate(
      { name: "appointmentId" },
      { $inc: { value: 1 } }, // Increment the counter
      { new: true, upsert: true } // Create if not exists
    );

    const newAppointmentId = counter.value;
    // Create new appointment
    const appointment = new Appointment({
      appointmentId: newAppointmentId,
      firstName,
      lastName,
      email,
      phoneNumber,
      location,
      consultationType,
      doctorEmail,
      doctorName:doctor.name,
      date: formattedDate,
      startTime,
      medicines: formattedMedicines,
    });

    await appointment.save();
     console.log("After ",appointment)
    // Link appointment to user
    user.appointments.push(appointment._id);
    user.doctorEmail = doctorEmail;
    await user.save();

    // Link appointment to doctor
    doctor.appointments.push(appointment._id);
    await doctor.save();

    // **Fix: Update only the matching time slot for the correct date**
    await Doctor.updateOne(
      { email: doctorEmail, "schedule.timeSlots.date": formattedDate },
      {
        $set: { "schedule.$.timeSlots.$[slot].status": "booked" },
      },
      {
        arrayFilters: [{ "slot.time": startTime, "slot.date": formattedDate }],
      }
    );

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (error) {
    console.error("Error booking appointment:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Appointment
exports.updateAppointment = async (req, res) => {
  try {
    const { useremail, id } = req.params;
    const user = await User.findOne({ email: useremail });

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
      {
        medicines: {
          complain: req.body.complain,
          remedies: req.body.remedies, // Ensure this is structured correctly
          potency: req.body.potency,
          duration: req.body.duration,
          pharmacyName: req.body.pharmacyName,
          pharmacyId: req.body.pharmacyId,
          showMedicine: req.body.showMedicine,
        },
      }, // Directly set the medicine object
      { new: true }
    );

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    const sortedAppointments = await Appointment.find()
      .sort({ date: 1 }) // Sorting by date in descending order
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
