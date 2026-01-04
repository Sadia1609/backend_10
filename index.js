const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = 3000;

const app = express();
// app.use(cors(
//   {
//     origin: [
//       "http://localhost:3000",
//       "https://fluffy-kitsune-1aa129.netlify.app/"
//     ]
//   }
// ));

// app.use(
//   cors({
//     // origin: ["https://pet-care-8ba14.web.app", "http://localhost:5173"],
//     origin: ["http://localhost:5173", "https://paw-mart-two.vercel.app"],

//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

app.use(
  cors({
    origin: true, // ✅ allow all origins (safe for now)
    credentials: true,
  })
);

app.use(express.json());

const uri =
  "mongodb+srv://missionscic:d5DFOGStt78CukzS@cluster0.e62g5zs.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    //database create for petServices
    const database = client.db("petService");
    const petServices = database.collection("services");
    const orderCollections = database.collection("orders");

    //post or save service to database
    app.post("/services", async (req, res) => {
      const data = req.body;
      const date = new Date();
      data.createDate = date;

      console.log(data);

      const result = await petServices.insertOne(data);
      res.send(result);
    });
    // Get latest 6 services
    app.get("/recent-services", async (req, res) => {
      try {
        const result = await petServices
          .find()
          .sort({ _id: -1 })
          .limit(6)
          .toArray();

        res.send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Failed to load recent services" });
      }
    });

    // //get services from database

    app.get("/services", async (req, res) => {
      const { category, search } = req.query;
      const query = {};

      if (category) {
        query.category = { $regex: new RegExp(`^${category}$`, "i") };
      }

      if (search) {
        query.name = { $regex: new RegExp(search, "i") }; // case-insensitive search
      }

      const result = await petServices.find(query).toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params;
      console.log(id);

      const query = { _id: new ObjectId(id) };

      const result = await petServices.findOne(query);
      res.send(result);
    });

    //add api
    app.get("/my-services", async (req, res) => {
      const { email } = req.query;
      const query = { email: email };
      const result = await petServices.find(query).toArray();
      res.send(result);
    });

    //update
    app.put("/update/:id", async (req, res) => {
      const data = req.body;
      const id = req.params;
      const query = { _id: new ObjectId(id) };

      const updateServices = {
        $set: data,
      };

      const result = await petServices.updateOne(query, updateServices);
      res.send(result);
    });

    //delete
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params;
      const query = { _id: new ObjectId(id) };
      const result = await petServices.deleteOne(query);
      res.send(result);
    });

    //orders collections section
    app.post("/orders", async (req, res) => {
      const data = req.body;
      console.log(data);

      //send data in database
      const result = await orderCollections.insertOne(data);
      res.status(201).send(result);
    });

    app.get("/orders", async (req, res) => {
      const result = await orderCollections.find().toArray();
      res.status(200).send(result);
    });

    app.get("/orders/:email", async (req, res) => {
      const { email } = req.params;
      const query = {
        buyerEmail: email,
      };
      const result = await orderCollections.find(query).toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello, developers");
});

// app.listen(port, () => {
//   console.log(`server is running on ${port}`);
// });
module.exports = app;
