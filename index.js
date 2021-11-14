const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

//user - colnagoBike
//pass - 0oaHSh3voShbwHx4

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m3bow.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to my server");
});

async function run() {
  try {
    await client.connect();
    // console.log('connected to database');
    const database = client.db("ColnagoBike");
    const productCollection = database.collection("products");
    const orderCollection = database.collection("bookingOrder");
    const reviewCollection = database.collection("review");
    const usersCollection = database.collection("users");

    // Add user Info
    app.post("/adduser", async (req, res) => {
      console.log("called");
      const result = await usersCollection.insertOne(req.body);
      res.send(result);
    });

    // Add user Info
    app.get("/getuser/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });

    //Get Api
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      res.json(products);
    });

    //Post API
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.json(result);
    });

    // Add A Review
    app.post("/addReview", async (req, res) => {
      const result = await reviewCollection.insertOne(req.body);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find({}).toArray();
      res.json(result);
    });

    // Post or Add Product Api
    app.post("/addProduct", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      // console.log('got new Product', req.body);
      res.send("add Product", result);
      res.json(result);
    });

    // My Order
    app.get("/myOrder/:email", async (req, res) => {
      const result = await orderCollection
        .find({
          email: req.params.email,
        })
        .toArray();
      res.send(result);
    });

    /// Get All Order
    app.get("/allOrders", async (req, res) => {
      // console.log("hello");
      const result = await orderCollection.find({}).toArray();
      res.send(result);
    });

    // Delete Order

    app.delete("/deleteOrder/:id", async (req, res) => {
      // console.log(req.params.id);
      const result = await orderCollection.deleteOne({
        _id: ObjectId(req.params.id),
      });
      res.send(result);
    });

    // update status put api
    app.put("/update/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const data = {
        $set: {
          status: "Confirm",
        },
      };
      const result = await orderCollection.updateOne(query, data);
      res.send(result);
    });

    //  make admin
    app.put("/makeAdmin", async (req, res) => {
      const email = req.body.email;

      const result = await usersCollection.updateOne(
        { email },
        {
          $set: { email },
        },
        { upsert: true }
      );
      res.json(result);
    });

    // Book an order
    app.post("/addOrder", (req, res) => {
      orderCollection.insertOne(req.body).then((result) => {
        res.send(result);
      });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(process.env.PORT || port, () => console.log("running"));
