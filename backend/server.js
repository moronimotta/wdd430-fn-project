require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payment");
const Product = require("./models/Product");
const User = require("./models/User");
const Order = require("./models/Order");
const app = express();

app.use(cors());
app.post("/api/payment/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  console.log("Received Stripe webhook event");
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeSecretKey || !stripeWebhookSecret) {
    return res.status(200).json({ received: true, ignored: true });
  }

  const signature = req.headers["stripe-signature"];
  const stripe = require("stripe")(stripeSecretKey);

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, stripeWebhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        status: "completed",
        stripeSessionId: session.id,
        customerId: session.customer || "",
      });
    }
  }

  res.json({ received: true });
});

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);

async function seedDefaults() {
  const textbookProducts = [
    {
      name: "JavaScript Textbook",
      description: "A practical guide to modern JavaScript and web applications.",
      price: 44.99,
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80",
      stock: 8,
    },
    {
      name: "Angular Development Textbook",
      description: "Covers components, services, routing, and state management.",
      price: 52.5,
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80",
      stock: 6,
    },
    {
      name: "Database Systems Textbook",
      description: "Relational design, MongoDB basics, and backend integration.",
      price: 49.0,
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
      stock: 10,
    },
  ];

  for (const product of textbookProducts) {
    await Product.updateOne({ name: product.name }, { $setOnInsert: product }, { upsert: true });
  }

  const adminEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@bookstore.com";
  const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || "Admin123!";

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: "Store Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });
    console.log(`Seeded admin account: ${adminEmail}`);
  }
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connection successful");
    return seedDefaults();
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
  });

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 3536;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});