const Pharmacy = require("../models/Pharmacy.js");
const Appointment = require("../models/Appointment.js");
const OrderCounter = require("../models/OrderCounter.js");
const Remedy = require("../models/Remedies.js");

// Add a new pharmacy
exports.addPharmacy = async (req, res) => {
  try {
    // Check if the email already exists
    const existingPharmacy = await Pharmacy.findOne({ email: req.body.email });

    if (existingPharmacy) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Create a new pharmacy
    const newPharmacy = new Pharmacy(req.body);
    await newPharmacy.save();

    res.status(201).json({ message: "Pharmacy added successfully" });
  } catch (error) {
    // Handle duplicate key errors from MongoDB (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }

    res.status(500).json({ message: "Failed to add pharmacy", error });
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
    console.log("Requ", req.body);
    // Find the pharmacy order by appointmentOrderId
    const pharmacy = await Pharmacy.findOne({ _id: pharmacyId });
    if (!pharmacy) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Find and update the order within the pharmacy
    const order = pharmacy.orders.find(
      (order) => order._id == appointmentOrderId
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
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
          };
        }
        return medicineItem;
      }
    );
    appointment.appointmentOrderId = appointmentOrderId;
    appointment.medicines.pharmacyId = pharmacyId;

    await appointment.save();

    // Mark order as completed
    if(paymentMode==="UPI"){
      order.orderStatus = "Completed";
      order.paymentMode=paymentMode;
      order.paymentStatus="Completed";
      order.orderPaymentId=req.body.orderPaymentId;
      await pharmacy.save();
      res.status(200).json({ message: "Order updated successfully", order });
    }else if(paymentMode==="Cash"){
      order.orderStatus = "Completed";
      order.paymentMode=paymentMode;
      order.paymentStatus="Completed";
      await pharmacy.save();
      res.status(200).json({ message: "Order updated successfully", order });
    }else{
      order.orderStatus = "Completed";
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
    const updates = req.body; // Get the fields to update from the request body

    // Use `findByIdAndUpdate` with `$set` to dynamically update fields
    const updatedPharmacy = await Pharmacy.findByIdAndUpdate(
      id,
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
    const newOrder = {
      orderId: newOrderId,
      appointmentId,
      pharmacyId: pharmacy._id,
      paymentStatus: "Pending", // Default as per schema
      orderStatus: "Pending",
    };

    // Push new order into pharmacy's orders array
    pharmacy.orders.push(newOrder);

    // Save updated pharmacy
    const updatedPharmacy = await pharmacy.save();

    res.json(updatedPharmacy);
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
exports.viewAllOrdersByPharmacyEmail = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ email: req.params.email });

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    const ordersWithAppointments = await Promise.all(
      pharmacy.orders.map(async (order) => {
        const appointment = await Appointment.findOne({
          _id: order.appointmentId,
        });

        return {
          ...order.toObject(), // Convert Mongoose document to plain object
          appointment, // Attach appointment details
        };
      })
    );

    console.log("Order", pharmacy.orders);
    res.status(200).json(ordersWithAppointments);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve orders", error });
  }
};

exports.viewPendingOrdersByPharmacyEmail = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ email: req.params.email });

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const pendingOrders = pharmacy.orders.filter(
      (order) => order.orderStatus === "Pending"
    );

    const ordersWithAppointments = await Promise.all(
      pendingOrders.map(async (order) => {
        const appointment = await Appointment.findOne({
          _id: order.appointmentId,
        });
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

exports.viewCompletedOrdersByPharmacyEmail = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ email: req.params.email });

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const completedOrders = pharmacy.orders.filter(
      (order) => order.orderStatus === "Completed"
    );

    const ordersWithAppointments = await Promise.all(
      completedOrders.map(async (order) => {
        const appointment = await Appointment.findOne({
          _id: order.appointmentId,
        });
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

exports.viewCompletedOrdersByPharmacyId = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findOne({ _id: req.params.id });

    console.log("Pharm", pharmacy);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const completedOrders = pharmacy.orders.filter(
      (order) => order.orderStatus === "Completed"
    );

    const ordersWithAppointments = await Promise.all(
      completedOrders.map(async (order) => {
        const appointment = await Appointment.findOne({
          _id: order.appointmentId,
        });
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

exports.fetchOrderByPharmacyIdAndOrderId = async (req, res) => {
  try {
    const { pharmacyId, orderId } = req.params;

    // Find the pharmacy by ID
    const pharmacy = await Pharmacy.findById(pharmacyId);

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    // Find the specific order in the pharmacy's orders array
    const order = pharmacy.orders.id(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to retrieve order", error: error.message });
  }
};

// Get all pharmacies
exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
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
