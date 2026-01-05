const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    "https://pet-care-8ba14.web.app",
    "https://pet-care-8ba14.firebaseapp.com",
    "http://localhost:5173",
    "http://localhost:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://missionscic:d5DFOGStt78CukzS@cluster0.e62g5zs.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }

  try {
    await client.connect();
    const database = client.db("petService");
    cachedDb = {
      db: database,
      petServices: database.collection("services"),
      orderCollections: database.collection("orders"),
      usersCollection: database.collection("users")
    };
    console.log("Connected to MongoDB successfully!");
    return cachedDb;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

// Root endpoint
app.get("/", async (req, res) => {
  res.json({ 
    message: "PawMart API Server is running!", 
    timestamp: new Date().toISOString(),
    status: "OK"
  });
});

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "Test endpoint working!", status: "OK" });
});

// Get all services
app.get("/services", async (req, res) => {
  try {
    const { petServices } = await connectToDatabase();
    const { category, search } = req.query;
    const query = {};

    if (category) {
      query.category = { $regex: new RegExp(`^${category}`, "i") };
    }

    if (search) {
      query.name = { $regex: new RegExp(search, "i") };
    }

    const result = await petServices.find(query).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({ error: "Failed to fetch services", details: error.message });
  }
});

// Get recent services
app.get("/recent-services", async (req, res) => {
  try {
    const { petServices } = await connectToDatabase();
    const result = await petServices
      .find()
      .sort({ date: -1 })
      .limit(6)
      .toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching recent services:", error);
    res.status(500).json({ error: "Failed to fetch recent services", details: error.message });
  }
});

// Get service by ID
app.get("/services/:id", async (req, res) => {
  try {
    const { petServices } = await connectToDatabase();
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const result = await petServices.findOne(query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching service:", error);
    res.status(500).json({ error: "Failed to fetch service", details: error.message });
  }
});

// Create new service
app.post("/services", async (req, res) => {
  try {
    const { petServices } = await connectToDatabase();
    const data = req.body;
    data.date = new Date();
    const result = await petServices.insertOne(data);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({ error: "Failed to create service", details: error.message });
  }
});

// Get my services
app.get("/my-services", async (req, res) => {
  try {
    const { petServices } = await connectToDatabase();
    const { email } = req.query;
    const query = { email: email };
    const result = await petServices.find(query).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching my services:", error);
    res.status(500).json({ error: "Failed to fetch my services", details: error.message });
  }
});

// Update service
app.put("/update/:id", async (req, res) => {
  try {
    const { petServices } = await connectToDatabase();
    const data = req.body;
    const { id } = req.params;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: data };
    const result = await petServices.updateOne(filter, updateDoc);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Failed to update service", details: error.message });
  }
});

// Delete service
app.delete("/delete/:id", async (req, res) => {
  try {
    const { petServices } = await connectToDatabase();
    const { id } = req.params;
    const query = { _id: new ObjectId(id) };
    const result = await petServices.deleteOne(query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({ error: "Failed to delete service", details: error.message });
  }
});

// Create order
app.post("/orders", async (req, res) => {
  try {
    const { orderCollections } = await connectToDatabase();
    const data = req.body;
    const result = await orderCollections.insertOne(data);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order", details: error.message });
  }
});

// Get all orders
app.get("/orders", async (req, res) => {
  try {
    const { orderCollections } = await connectToDatabase();
    const result = await orderCollections.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});

// Get orders by email
app.get("/orders/:email", async (req, res) => {
  try {
    const { orderCollections } = await connectToDatabase();
    const { email } = req.params;
    const query = {
      $or: [{ email: email }, { "service.email": email }],
    };
    const result = await orderCollections.find(query).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ error: "Failed to fetch user orders", details: error.message });
  }
});

// Create user
app.post("/users", async (req, res) => {
  try {
    const { usersCollection } = await connectToDatabase();
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await usersCollection.findOne(query);
    if (existingUser) {
      return res.status(200).json({ message: "User already exists" });
    }
    const result = await usersCollection.insertOne(user);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user", details: error.message });
  }
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const { usersCollection } = await connectToDatabase();
    const result = await usersCollection.find().toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users", details: error.message });
  }
});

// Get user by email
app.get("/users/:email", async (req, res) => {
  try {
    const { usersCollection } = await connectToDatabase();
    const email = req.params.email;
    const query = { email: email };
    const result = await usersCollection.findOne(query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user", details: error.message });
  }
});

// Make user admin
app.patch("/users/admin/:id", async (req, res) => {
  try {
    const { usersCollection } = await connectToDatabase();
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: { role: "admin" } };
    const result = await usersCollection.updateOne(filter, updateDoc);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Failed to update user role", details: error.message });
  }
});

// Delete user
app.delete("/users/:id", async (req, res) => {
  try {
    const { usersCollection } = await connectToDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await usersCollection.deleteOne(query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user", details: error.message });
  }
});

// Admin stats
app.get("/admin/stats", async (req, res) => {
  try {
    const { usersCollection, petServices, orderCollections } = await connectToDatabase();
    const users = await usersCollection.estimatedDocumentCount();
    const services = await petServices.estimatedDocumentCount();
    const orders = await orderCollections.estimatedDocumentCount();

    const revenueResult = await orderCollections
      .aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $toDouble: "$service.price" } },
          },
        },
      ])
      .toArray();

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    res.status(200).json({
      users,
      services,
      orders,
      totalRevenue,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ error: "Failed to fetch admin stats", details: error.message });
  }
});

// Update order status
app.patch("/admin/orders/:id", async (req, res) => {
  try {
    const { orderCollections } = await connectToDatabase();
    const id = req.params.id;
    const { status } = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: { status } };
    const result = await orderCollections.updateOne(filter, updateDoc);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status", details: error.message });
  }
});

// Delete order
app.delete("/admin/orders/:id", async (req, res) => {
  try {
    const { orderCollections } = await connectToDatabase();
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await orderCollections.deleteOne(query);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order", details: error.message });
  }
});

// Export the Express API
module.exports = app;