const Doctor = require("../models/Doctor.js");
const Appointment = require("../models/Appointment.js");
const moment = require("moment");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const addDoctor = async (req, res) => {
  try {
    const { name, email, phone, specialization, schedule, password } = req.body;
    if (!password) {
      password = "12345";
    }
    // Check if doctor already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor)
      return res.status(400).json({ message: "Doctor already exists" });

    let formattedSchedule = [];
    if (schedule && schedule.length > 0) {
      formattedSchedule = schedule.map(
        ({ startDate, endDate, startTime, endTime }) => ({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          timeSlots: generateTimeSlotsForRange(
            startDate,
            endDate,
            startTime,
            endTime
          ),
        })
      );
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const doctor = new Doctor({
      name,
      email,
      phone,
      specialization,
      password: hashedPassword,
      schedule: formattedSchedule,
    });

    await doctor.save();
    res.status(201).json({ message: "Doctor added successfully", doctor });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error adding doctor", error: error.message });
  }
};

const updateDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.phone) updateData.phone = req.body.phone;
    if (req.body.specialization)
      updateData.specialization = req.body.specialization;

    if (req.body.schedule) {
      updateData.schedule = req.body.schedule.map(
        ({ startDate, endDate, startTime, endTime }) => {
          const formattedStartDate = formatDate(startDate);
          const formattedEndDate = formatDate(endDate);
          return {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            startTime: startTime,
            endTime: endTime,
            timeSlots: generateTimeSlotsForRange(
              formattedStartDate,
              formattedEndDate,
              startTime,
              endTime
            ),
          };
        }
      );
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(doctorId, updateData, {
      new: true,
    });

    if (!updatedDoctor)
      return res.status(404).json({ message: "Doctor not found" });

    res
      .status(200)
      .json({ message: "Doctor updated successfully", updatedDoctor });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating doctor", error: error.message });
  }
};

const generateTimeSlotsForRange = (startDate, endDate, startTime, endTime) => {
  let slots = [];

  // Convert DD-MM-YYYY to Date Object
  const parseDate = (dateStr) => {
    const [day, month, year] = dateStr.split("-");
    return new Date(`${year}-${month}-${day}`);
  };

  let currentDate = parseDate(startDate);
  const finalDate = parseDate(endDate);

  while (currentDate <= finalDate) {
    let daySlots = [];
    let currentTime = new Date(
      currentDate.toISOString().split("T")[0] + `T${startTime}`
    );
    let endTimeObj = new Date(
      currentDate.toISOString().split("T")[0] + `T${endTime}`
    );

    while (currentTime < endTimeObj) {
      // Format date back to DD-MM-YYYY
      const formattedDate = currentDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("-");

      daySlots.push({
        date: formattedDate, // 🔹 Includes the date in the time slot
        time: currentTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        status: "available",
      });

      // Increment time by 30 minutes
      currentTime.setMinutes(currentTime.getMinutes() + 15);
    }

    slots = [...slots, ...daySlots]; // Flatten all time slots into one array
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return slots;
};

// ✅ Fix: Ensure we always format dates correctly (DD-MM-YYYY)
const formatDate = (dateStr) => {
  const [day, month, year] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};
const updateDoctorSchedule = async () => {
  try {
    const todayDate = moment().format("DD-MM-YYYY");
    const yesterdayDate = moment().subtract(1, "day").format("DD-MM-YYYY");
    const doctors = await Doctor.find(); // Fetch all doctors
    const appointments = await Appointment.find({ date: yesterdayDate });

    for (let appointment of appointments) {
      if (appointment.appointmentStatus === "Booked") {
        appointment.appointmentStatus = "Expired";
        await appointment.save();
      }
    }
    for (let doctor of doctors) {
      if (doctor.schedule.length > 0) {
        let schedule = doctor.schedule[0]; // Assuming single schedule per doctor

        // Check if the schedule has expired
        if (
          moment(schedule.endDate, "DD-MM-YYYY").isBefore(
            moment(todayDate, "DD-MM-YYYY")
          )
        ) {
          console.log(`Deleting expired schedule for Doctor ${doctor.name}`);
          doctor.schedule = []; // Remove the schedule
        } else {
          // Remove all time slots from the previous day
          schedule.timeSlots = schedule.timeSlots.filter(
            (slot) => slot.date !== yesterdayDate
          );

          // Update the startDate to today
          schedule.startDate = todayDate;
        }

        await doctor.save();
      }
    }
  } catch (error) {
    console.error("Error updating doctor schedules:", error);
  }
};

/**
 * Delete a doctor by ID
 */
const deleteDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const deletedDoctor = await Doctor.findByIdAndDelete(doctorId);
    if (!deletedDoctor)
      return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting doctor", error: error.message });
  }
};

const getDoctorByToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Get token from request headers

    if (!token) return res.status(401).json({ message: "No token provided" });

    // Verify the token and extract the doctor ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const doctorId = decoded.doctorId;
    // Fetch doctor details (excluding password)
    const doctor = await Doctor.findById(doctorId)
      .select("-password")
      .populate("appointments");

    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    res.status(200).json({ doctor });
  } catch (error) {
    res
      .status(401)
      .json({ message: "Invalid or expired token", error: error.message });
  }
};
/**
 * Get a doctor by email
 */
const getDoctorByEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    // Find doctor by email
    const doctorWithPassword = await Doctor.findOne({ email }).populate(
      "appointments"
    );
    if (!doctorWithPassword)
      return res.status(404).json({ message: "Doctor not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, doctorWithPassword.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign(
      { doctorId: doctorWithPassword._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "1d", // Token expires in 1 day
      }
    );
    const doctor = await Doctor.findOne({ email })
      .select("-password")
      .populate("appointments");
    res.status(200).json({ token, doctor });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

/**
 * Get all doctors
 */
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate("appointments");
    res.status(200).json(doctors);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching doctors", error: error.message });
  }
};

const getTimeSlot = async (req, res) => {
  try {
    const { email, date } = req.params; // Incoming format: yyyy-mm-dd

    const doctor = await Doctor.findOne({ email });
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });

    // Convert incoming date from yyyy-mm-dd to dd-mm-yyyy
    const [year, month, day] = date.split("-");
    const formattedDate = `${day}-${month}-${year}`;

    // Directly access `timeSlots` from schedule[0] (assuming at least one schedule exists)
    if (!doctor.schedule.length || !doctor.schedule[0].timeSlots) {
      return res.status(404).json({ message: "No schedule found" });
    }

    const slotsForDate = doctor.schedule[0].timeSlots.filter(
      (slot) => slot.date === formattedDate
    );

    if (slotsForDate.length === 0) {
      return res
        .status(404)
        .json({ message: "No slots available for this date" });
    }

    res.status(200).json({
      doctorEmail: email,
      startDate: doctor.schedule[0].startDate,
      endDate: doctor.schedule[0].endDate,
      slots: slotsForDate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching time slots", error: error.message });
  }
};

const getAllAppointmentsByDoctorEmail = async (req, res) => {
  const { email } = req.params; // Assuming the email is passed as a parameter

  try {
    // Find the doctor by email and populate the 'appointments' field
    const doctor = await Doctor.findOne({ email }).populate("appointments");

    if (!doctor) {
      return res
        .status(404)
        .json({ message: "Doctor not found with this email." });
    }

    // Extract the appointments from the doctor object
    const appointments = doctor.appointments;

    // Respond with the appointments
    res.status(200).json({
      message: "Appointments retrieved successfully.",
      appointments,
    });
  } catch (error) {
    console.error(
      "Error fetching appointments for doctor with email:",
      email,
      error
    );
    res.status(500).json({
      message:
        "Failed to retrieve appointments for this doctor. Please try again.",
      error: error.message,
    });
  }
};
const getScheduleByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId).select("schedule");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ schedule: doctor.schedule });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
const updateScheduleSlot = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { startTime, startDate, status } = req.body;
    console.log("Received Data:", req.body);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    let slotUpdated = false;
    for (const schedule of doctor.schedule) {
      if (
        new Date(schedule.startDate) <= new Date(startDate) &&
        new Date(startDate) <= new Date(schedule.endDate)
      ) {
        for (const slot of schedule.timeSlots) {
          console.log("Checking Slot:", slot);

          if (
            slot.date === formatDateToDatabase(startDate) &&
            slot.time === convertTo12Hour(startTime)
          ) {
            console.log("Slot Matched, Updating...");
            slot.status = status;
            slotUpdated = true;
            break;
          }
        }
        if (slotUpdated) break;
      }
    }

    if (!slotUpdated) {
      return res.status(404).json({ message: "Time slot not found" });
    }

    await doctor.save();
    res.status(200).json({ message: "Schedule updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const formatDateToDatabase = (dateStr) => {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

const convertTo12Hour = (timeStr) => {
  let [hours, minutes] = timeStr.split(":");
  hours = parseInt(hours);
  let period = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
};
const forgotPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await Doctor.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save updated user
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
module.exports = {
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorByEmail,
  getAllDoctors,
  getTimeSlot,
  updateDoctorSchedule,
  getDoctorByToken,
  getAllAppointmentsByDoctorEmail,
  getScheduleByDoctorId,
  updateScheduleSlot,
  forgotPassword
};
