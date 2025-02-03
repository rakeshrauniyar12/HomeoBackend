const Appointment = require("../models/BookAppointment.js");

// Check for overlapping time slots
const isTimeSlotAvailable = async (date, startTime, endTime, excludeId = null) => {
  const query = {
    date,
    $or: [
      { startTime: { $lt: endTime }, endTime: { $gt: startTime } }, // Overlapping condition
    ],
  };

  if (excludeId) {
    query._id = { $ne: excludeId }; // Exclude the current appointment in case of update
  }

  const existingAppointment = await Appointment.findOne(query);
  return !existingAppointment; // Returns true if no overlap
};

// ✅ Book an Appointment
exports.bookAppointment = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, date, startTime } = req.body;

    // Calculate end time (30 minutes after start time)
    let [hours, minutes] = startTime.split(":").map(Number);
    minutes += 30;
    if (minutes >= 60) {
      minutes -= 60;
      hours += 1;
    }
    const endTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

    // Check for time slot availability
    const available = await isTimeSlotAvailable(date, startTime, endTime);
    if (!available) {
      return res.status(400).json({ message: "Time slot is already booked. Please choose another time." });
    }

    const appointment = new Appointment({
      firstName,
      lastName,
      email,
      phoneNumber,
      date,
      startTime,
      endTime,
    });

    await appointment.save();
    res.status(201).json({ message: "Appointment booked successfully", appointment });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ View Appointments by User Email
exports.viewAppointmentsByUserEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const appointments = await Appointment.find({ email });

    if (!appointments.length) {
      return res.status(404).json({ message: "No appointments found for this user." });
    }

    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ View All Appointments
exports.viewAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update Appointment (Partial Updates Supported)
exports.updateAppointmentById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const updateFields = req.body;

    if (updateFields.startTime) {
      // Calculate new end time if startTime is being updated
      let [hours, minutes] = updateFields.startTime.split(":").map(Number);
      minutes += 30;
      if (minutes >= 60) {
        minutes -= 60;
        hours += 1;
      }
      updateFields.endTime = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

      // Check if new time slot is available
      const available = await isTimeSlotAvailable(updateFields.date || req.body.date, updateFields.startTime, updateFields.endTime, appointmentId);
      if (!available) {
        return res.status(400).json({ message: "New time slot is already booked. Please choose another time." });
      }
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(appointmentId, updateFields, { new: true });

    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    res.status(200).json({ message: "Appointment updated successfully", updatedAppointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
