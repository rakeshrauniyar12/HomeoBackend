const Doctor = require("../models/Doctor.js");
const moment = require("moment");
/**
 * Add a new doctor with an optional schedule
 */
const addDoctor = async (req, res) => {
  try {
    const { name, email, phone, specialization, schedule } = req.body;

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

    const doctor = new Doctor({
      name,
      email,
      phone,
      specialization,
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

    for (let doctor of doctors) {
      if (doctor.schedule.length > 0) {
        let schedule = doctor.schedule[0]; // Assuming single schedule per doctor

        if (schedule.endDate === todayDate) {
          console.log(`Doctor ${doctor.name}'s schedule will expire soon.`);
        } else {
          // Remove all time slots from the previous day
          schedule.timeSlots = schedule.timeSlots.filter(
            (slot) => slot.date !== yesterdayDate
          );

          // Update the startDate to today
          schedule.startDate = todayDate;

          await doctor.save();
        }
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

/**
 * Get a doctor by email
 */
const getDoctorByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const doctor = await Doctor.findOne({ email }).populate("appointments");
    if (!doctor) return res.status(404).json({ message: "Doctor not found" });
    res.status(200).json(doctor);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching doctor", error: error.message });
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

/**
 * Get time slots for a doctor by email
 */
// const getTimeSlot = async (req, res) => {
//   try {
//     const { email } = req.params;
//     const doctor = await Doctor.findOne({ email });
//     if (!doctor) return res.status(404).json({ message: "Doctor not found" });
//     res
//       .status(200)
//       .json({ doctorEmail: email, schedule: doctor.schedule || [] });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching time slots", error: error.message });
//   }
// };
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
module.exports = {
  addDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorByEmail,
  getAllDoctors,
  getTimeSlot,
  updateDoctorSchedule,
  getAllAppointmentsByDoctorEmail,
};
