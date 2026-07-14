const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
	{
		productId: { type: String, required: true },
		name: { type: String, required: true },
		price: { type: Number, required: true },
		quantity: { type: Number, required: true },
	},
	{ _id: false }
);

const orderSchema = new mongoose.Schema({
	customerId: { type: String },
	customerName: { type: String, required: true },
	email: { type: String, required: true },
	items: { type: [orderItemSchema], required: true },
	total: { type: Number, required: true },
	status: { type: String, default: "pending" },
	stripeSessionId: { type: String },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", orderSchema);
