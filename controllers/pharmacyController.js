const Pharmacy = require("../models/Pharmacy.js");

// Add a new pharmacy
exports.addPharmacy = async (req, res) => {
  try {
    const newPharmacy = new Pharmacy(req.body);
    await newPharmacy.save();
    res.status(201).json({ message: "Pharmacy added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to add pharmacy", error });
  }
};

// Update payment method for an order
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { pharmacyEmail, orderId, paymentMethod } = req.body;
    const pharmacy = await Pharmacy.findOne({ email: pharmacyEmail });

    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    const orderIndex = pharmacy.orders.findIndex(
      (order) => order._id.toString() === orderId
    );
    if (orderIndex === -1) {
      return res.status(404).json({ message: "Order not found" });
    }

    pharmacy.orders[orderIndex].paymentMethod = paymentMethod;
    await pharmacy.save();
    res.status(200).json({ message: "Payment method updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to update payment method", error });
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
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    res.json(updatedPharmacy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update pharmacy fields' });
  }
};
exports.addOrderToPharmacy = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientName, doctorEmail, medicine} = req.body;

    // Validate paymentMethod
    // if (!['Cash', 'Credit Card', 'Online'].includes(paymentMethod)) {
    //   return res.status(400).json({ message: 'Invalid payment method' });
    // }

    const pharmacy = await Pharmacy.findById(id);

    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy not found' });
    }

    // Create a new order
    const newOrder = {
      patientName,
      doctorEmail,
      medicine,
    };

    // Push the new order into the orders array
    pharmacy.orders.push(newOrder);

    // Save the updated pharmacy
    const updatedPharmacy = await pharmacy.save();

    res.json(updatedPharmacy);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to add order to pharmacy' });
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

    res.status(200).json(pharmacy.orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve orders", error });
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
    res.status(500).json({ message: "Failed to retrieve order", error: error.message });
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
