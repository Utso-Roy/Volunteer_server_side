require('dotenv').config(); 
const express = require('express');
const app = express();
const port = 3000;

const { MongoClient, ServerApiVersion } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const database = client.db('volunteerHub')
    const collection = database.collection('volunteerData')






    console.log(" Connected to MongoDB");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
}
run();

app.get('/', (req, res) => {
  res.send('3000 port all ok!');
});

app.listen(port, () => {
  console.log(` Server running at:${port}`);
});
