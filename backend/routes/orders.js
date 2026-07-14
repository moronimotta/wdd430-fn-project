const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, async (req, res) => {
	try {
		if (req.user.role !== "admin") {
			return res.status(403).json({ message: "Admin access required" });
		}

		const orders = await Order.find().sort({ createdAt: -1 });
		res.json(orders);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

router.post("/", async (req, res) => {
	try {
		const order = new Order(req.body);
		const saved = await order.save();
		res.status(201).json(saved);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

module.exports = router;
