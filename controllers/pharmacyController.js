const mongoose = require("mongoose"); // ✅ Import mongoose at the top
const { Pharmacy } = require("../models/Pharmacy.js");
const Appointment = require("../models/Appointment.js");
const OrderCounter = require("../models/OrderCounter.js");
const Remedy = require("../models/Remedies.js");
const { Order } = require("../models/Pharmacy.js");
// Add a new pharmacy
exports.addPharmacy = async (req, res) => {
  console.log("Body", req.body);
  try {
    const existingPharmacy = await Pharmacy.findOne({ email: req.body.email });

    if (existingPharmacy) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new pharmacy
    const newPharmacy = new Pharmacy(req.body);
    await newPharmacy.save();

    res.status(201).json({ message: "Pharmacy added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add pharmacy", error });
  }
};
exports.getAllPharmacyEmails = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find({}, "email"); // only fetch email field
    const emails = pharmacies.map((pharmacy) => pharmacy.email);
    res.status(200).json(emails);
  } catch (error) {
    console.error("Error fetching pharmacy emails:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.updateOrderPharmacy = async (req, res) => {
  try {
    const {
      pharmacyId,
      appointmentId,
      appointmentOrderId,
      remedies,
      totalPrice,
      paymentMode,
    } = req.body;
    console.log("Body", req.body);

    // Find the pharmacy order by appointmentOrderId
    const pharmacy = await Pharmacy.findOne({ _id: pharmacyId });
    if (!pharmacy) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find and update the order within the pharmacy
    const order = await Order.findById(appointmentOrderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    if (order.pharmacyId.toString() !== pharmacyId) {
      return res.status(403).json({ message: "Unauthorized access to order" });
    }
    order.totalPrice = totalPrice;
    order.paymentMode = paymentMode;

    // Update remedy stock
    for (const remedyItem of remedies) {
      const remedy = await Remedy.findById(remedyItem.remediesId);
      console.log("Rem", remedy);
      if (remedy) {
        remedy.quantity -= remedyItem.quantity;
        await remedy.save();
      }
    }

    // Update appointment medicines
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    appointment.medicines.remedies = appointment.medicines.remedies.map(
      (medicineItem) => {
        const updatedRemedy = remedies.find(
          (r) => r.remediesId == medicineItem.remediesId
        );

        console.log("Updated Remedy:", updatedRemedy);

        if (updatedRemedy) {
          return {
            ...medicineItem,
            quantity: updatedRemedy.quantity,
            price: updatedRemedy.price,
            unit: updatedRemedy.unit,
          };
        }
        return medicineItem;
      }
    );
    appointment.appointmentOrderId = appointmentOrderId;
    appointment.medicines.pharmacyId = pharmacyId;

    await appointment.save();

    // Mark order as completed
    if (paymentMode === "UPI") {
      console.log("Payment", paymentMode);
      order.orderStatus = "Completed";
      order.paymentMode = paymentMode;
      order.paymentStatus = "Completed";
      order.orderPaymentId = req.body.orderPaymentId;
      order.orderPaymentImageUrl = req.body.orderPaymentImageUrl;
      await order.save();
      await pharmacy.save();
      res.status(200).json({ message: "Order updated successfully", order });
    } else if (paymentMode === "Cash") {
      order.orderStatus = "Completed";
      order.paymentMode = paymentMode;
      order.paymentStatus = "Completed";
      await order.save();
      await pharmacy.save();
      res.status(200).json({ message: "Order updated successfully", order });
    } else {
      order.orderStatus = "Completed";
      await order.save();
      await pharmacy.save();
      res.status(200).json({ message: "Order updated successfully", order });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updatePharmacyFields = async (req, res) => {
  try {
    const { id } = req.params; // Get the document ID from the request parameters
    const updates = req.body;
    console.log("Update", req.body); // Get the fields to update from the request body
    const objectId = new mongoose.Types.ObjectId(id);
    // Use `findByIdAndUpdate` with `$set` to dynamically update fields
    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
      objectId,
      { $set: updates },
      { new: true, runValidators: true } // Return the updated document and validate input
    );

    if (!updatedPharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    res.json(updatedPharmacy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update pharmacy fields" });
  }
};

exports.deletePharmacyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    const objectId = new mongoose.Types.ObjectId(id);

    // Delete pharmacy by ID
    const deletedPharmacy = await Pharmacy.findByIdAndDelete(objectId);

    if (!deletedPharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    res.status(200).json({ message: "Pharmacy deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ message: "Failed to delete pharmacy" });
  }
};

exports.addOrderToPharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { appointmentId } = req.body;

    // Validate pharmacy existence
    const pharmacy = await Pharmacy.findById(id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    let counter = await OrderCounter.findOneAndUpdate(
      { name: "orderId" },
      { $inc: { value: 1 } }, // Increment the counter
      { new: true, upsert: true } // Create if not exists
    );

    const newOrderId = counter.value;
    const newOrder = new Order({
      orderId: newOrderId,
      appointmentId,
      pharmacyId: pharmacy._id,
      paymentStatus: "Pending", // Default as per schema
      orderStatus: "Pending",
    });

    await newOrder.save();

    // Push order reference
    pharmacy.orders.push(newOrder._id);
    await pharmacy.save();
    res.json({
      message: "Order added to pharmacy",
      pharmacyDetail: pharmacy,
      order: newOrder,
    });
  } catch (error) {
    console.error("Error adding order:", error);
    res.status(500).json({ message: "Failed to add order to pharmacy" });
  }
};

// Get pharmacy by email
exports.getPharmacyByEmail = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ email: req.params.email });

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    res.status(200).json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve pharmacy", error });
  }
};

// View all orders by pharmacy email

// View all orders by pharmacy email
exports.viewAllOrdersByPharmacyEmail = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({
      email: req.params.email,
    }).populate("orders");

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const ordersWithAppointments = await Promise.all(
      pharmacy.orders.map(async (order) => {
        const appointment = await Appointment.findById(order.appointmentId);
        return {
          ...order.toObject(),
          appointment,
        };
      })
    );

    res.status(200).json(ordersWithAppointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve orders", error });
  }
};

// View pending orders
exports.viewPendingOrdersByPharmacyEmail = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({
      email: req.params.email,
    }).populate({
      path: "orders",
      match: { orderStatus: "Pending" },
    });
    console.log("Pha", pharmacy);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const ordersWithAppointments = await Promise.all(
      pharmacy.orders.map(async (order) => {
        const appointment = await Appointment.findById(order.appointmentId);
        return {
          ...order.toObject(),
          appointment,
        };
      })
    );

    res.status(200).json(ordersWithAppointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve pending orders", error });
  }
};

// View completed orders by email
exports.viewCompletedOrdersByPharmacyEmail = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({
      email: req.params.email,
    }).populate({
      path: "orders",
      match: { orderStatus: "Completed" },
    });

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const ordersWithAppointments = await Promise.all(
      pharmacy.orders.map(async (order) => {
        const appointment = await Appointment.findById(order.appointmentId);
        return {
          ...order.toObject(),
          appointment,
        };
      })
    );

    res.status(200).json(ordersWithAppointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve completed orders", error });
  }
};

// View completed orders by pharmacy ID
exports.viewCompletedOrdersByPharmacyId = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id).populate({
      path: "orders",
      match: { orderStatus: "Completed" },
    });

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const ordersWithAppointments = await Promise.all(
      pharmacy.orders.map(async (order) => {
        const appointment = await Appointment.findById(order.appointmentId);
        return {
          ...order.toObject(),
          appointment,
        };
      })
    );

    res.status(200).json(ordersWithAppointments);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve completed orders", error });
  }
};

// Fetch specific order by pharmacy ID and order ID
exports.fetchOrderByPharmacyIdAndOrderId = async (req, res) => {
  try {
    const { pharmacyId, orderId } = req.params;

    // Validate pharmacy exists
    const pharmacy = await Pharmacy.findById(pharmacyId);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    // Check if order belongs to pharmacy
    const isOrderAssociated = pharmacy.orders.some(
      (id) => id.toString() === orderId
    );
    if (!isOrderAssociated) {
      return res
        .status(403)
        .json({ message: "Order does not belong to this pharmacy" });
    }

    // Fetch the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const appointment = await Appointment.findById(order.appointmentId);
    res.status(200).json({
      ...order.toObject(),
      appointment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve order", error: error.message });
  }
};

// Get all pharmacies
exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find()
      .populate("remedies") // populate remedies details
      .populate({
        path: "orders",
        populate: {
          path: "appointmentId", // populate appointment details inside each order
          model: "Appointment",
        },
      });

    res.status(200).json(pharmacies);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve pharmacies", error });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await Pharmacy.findOne({ email });

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
