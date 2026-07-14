const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

router.post("/checkout", async (req, res) => {
	try {
		const { customerName = "", email = "", items = [], user = null } = req.body;

		if (!Array.isArray(items) || items.length === 0) {
			return res.status(400).json({ message: "Cart is empty" });
		}

		const resolvedCustomerName = customerName || user?.name || "Guest";
		const resolvedEmail = email || user?.email || "";

		if (!resolvedEmail) {
			return res.status(400).json({ message: "Email is required for checkout" });
		}

		const essentialItems = items.map((item) => ({
			productId: item.product?._id || item.product?.id || item.productId || "",
			name: item.product?.name || item.name,
			price: Number(item.product?.price ?? item.price ?? 0),
			quantity: Number(item.quantity || 1),
		}));

		if (essentialItems.some((item) => !item.productId)) {
			return res.status(400).json({ message: "Each cart item must include a product id" });
		}

		for (const item of essentialItems) {
			const product = await Product.findById(item.productId);

			if (!product) {
				return res.status(404).json({ message: `Product not found: ${item.name}` });
			}

			if (product.stock < item.quantity) {
				return res.status(400).json({ message: `Not enough stock for ${product.name}` });
			}
		}

		for (const item of essentialItems) {
			await Product.updateOne(
				{ _id: item.productId },
				{ $inc: { stock: -item.quantity } }
			);
		}

		const total = essentialItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

		const order = await Order.create({
			customerId: user?.id || user?._id || "",
			customerName: resolvedCustomerName,
			email: resolvedEmail,
			items: essentialItems,
			total,
			status: "pending",
		});

		if (!process.env.STRIPE_SECRET_KEY) {
			return res.status(201).json({
				message: "Order saved. Stripe is not configured.",
				order,
			});
		}

		const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
		const clientUrl = process.env.CLIENT_URL || "http://localhost:4200";

		const session = await stripe.checkout.sessions.create({
			mode: "payment",
			customer_email: resolvedEmail,
			line_items: essentialItems.map((item) => ({
				price_data: {
					currency: "usd",
					product_data: {
						name: item.name,
					},
					unit_amount: Math.round(item.price * 100),
				},
				quantity: item.quantity,
			})),
			success_url: `${clientUrl}/checkout?success=1`,
			cancel_url: `${clientUrl}/checkout?canceled=1`,
			metadata: {
				orderId: String(order._id),
			},
		});

		order.stripeSessionId = session.id;
		await order.save();

		res.status(201).json({
			message: "Checkout session created",
			sessionId: session.id,
			url: session.url,
			order,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

module.exports = router;
