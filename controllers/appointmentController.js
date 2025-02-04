const Appointment = require("../models/BookAppointment.js");

exports.addAppointment = async (req, res) => {
  try {
    const { email, startTime } = req.body;

    // Check if an appointment already exists with the same email and startTime
    const existingAppointment = await Appointment.findOne({ email, startTime });

    if (existingAppointment) {
      return res.status(400).json({
        message:
          "Email is already registered at this time. Please visit your appointment page.",
      });
    }

    // Check if the startTime is already booked
    const timeSlotTaken = await Appointment.findOne({ startTime });

    if (timeSlotTaken) {
      return res.status(400).json({
        message:
          "This time slot is already booked. Please choose a different time.",
      });
    }

    // Proceed with booking the appointment
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();

    res.status(201).json({
      message: "Appointment added successfully",
      data: newAppointment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getBookedTimeSlots = async (req, res) => {
  try {
    // Fetch all appointments and only return the 'startTime' field
    const appointments = await Appointment.find({}, "startTime");

    // Map through appointments to get an array of 'startTime'
    const bookedSlots = appointments.map(
      (appointment) => appointment.startTime
    );

    // Send the response with the booked slots
    res.status(200).json({ bookedSlots });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// View an appointment by ID
exports.viewAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ data: appointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update an appointment (can update any field)
exports.updateAppointment = async (req, res) => {
  try {
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res
      .status(200)
      .json({ message: "Appointment updated", data: updatedAppointment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete an appointment
exports.deleteAppointment = async (req, res) => {
  try {
    const deletedAppointment = await Appointment.findByIdAndDelete(
      req.params.id
    );
    if (!deletedAppointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }
    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
