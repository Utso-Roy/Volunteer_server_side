require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); 

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const database = client.db('VolunteersData');
    const collection = database.collection('volunteerSingleData');

    const database2 = client.db('Volunteers_PostData');
    const collection2 = database2.collection('volunteer-request');
    const volunteerPostsCollection = database2.collection('volunteerPosts');

    app.get('/volunteerSingleData', async (req, res) => {
      try {
        const data = await collection.find().sort({ deadline: 1 }).limit(6).toArray();
        res.send(data);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch volunteer data." });
      }
    });

    app.post('/volunteerRequest', async (req, res) => {
      try {
        const request = req.body;

        const result = await collection2.insertOne(request);

        const updateResult = await volunteerPostsCollection.updateOne(
          { _id: new ObjectId(request.postId) },
          { $inc: { volunteersNeeded: -1 } }
        );

        res.send({
          success: true,
          message: 'Volunteer request submitted successfully',
          insertedId: result.insertedId,
          update: updateResult.modifiedCount,
        });
      } catch (error) {
        console.error('Error inserting volunteer request:', error);
        res.status(500).send({
          success: false,
          message: 'Server error',
          error: error.message,
        });
      }
    });

    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
}
run();

app.get('/', (req, res) => {
  res.send('✅ 3000 port all ok!');
});

app.listen(port, () => {
  console.log(` Server running at: http://localhost:${port}`);
});
