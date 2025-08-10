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
    // await client.connect();

    const database = client.db('VolunteersData');
    const collection = database.collection('volunteerSingleData');
    const database2 = client.db('Volunteers_PostData');
    const collection2 = database2.collection('volunteer-request');
    const volunteerPostsCollection = database2.collection('volunteerPosts');
    const database3 = client.db('volunteerAddData')
    const volunteerAddData = database3.collection('volunteerAddedData')

    app.get('/volunteerSingleData', async (req, res) => {
      try {
        const data = await collection.find().sort({ deadline: 1 }).limit(6).toArray();
        res.send(data);
      } catch (error) {
        res.status(500).send({ error: "Failed to fetch volunteer data." });
      }
    });

   app.post('/volunteerAddPosts', async (req, res) => {
  try {
    const data = req.body;
    const result = await volunteerAddData.insertOne(data);

    res.status(201).send({
      success: true,
      message: "Volunteer post added successfully.",
      insertedId: result.insertedId,
    });
  } catch (error) {
    console.error("Error adding volunteer post:", error);
    res.status(500).send({
      success: false,
      message: "Failed to add volunteer post.",
      error: error.message,
    });
  }
   });
    


app.get('/volunteerPostData', async (req, res) => {
  try {
    const titleQuery = req.query.title || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    let query = {};
    if (titleQuery) {
      query = { title: { $regex: titleQuery, $options: "i" } };
    }

    const total = await volunteerAddData.countDocuments(query);
    const data = await volunteerAddData.find(query).skip(skip).limit(limit).toArray();

    res.send({
      success: true,
      data,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).send({ success: false, message: "Failed to fetch data" });
  }
});


    
    
    
    app.get('/volunteerAddPosts', async (req, res) => {
      try {
    const data = await volunteerAddData.find().toArray();
    res.status(200).send({
      success: true,
      message: "Volunteer posts retrieved successfully.",
      data: data,
    });
  } catch (error) {
    console.error("Error retrieving volunteer posts:", error);
    res.status(500).send({
      success: false,
      message: "Failed to retrieve volunteer posts.",
      error: error.message,
    });
  }
});
   app.delete('/volunteerAddPosts/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await volunteerAddData.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount > 0) {
      res.send({ success: true, message: "Deleted successfully." });
    } else {
      res.send({ success: false, message: "No matching post found." });
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send({ success: false, message: "Server error." });
  }
});
const { ObjectId } = require('mongodb'); 

app.put('/volunteerAddPosts/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: updatedData,
  };

  try {
    const result = await volunteerAddData.updateOne(filter, updateDoc);

    if (result.modifiedCount > 0) {
      res.send({ success: true, message: 'Post updated successfully' });
    } else {
      res.send({ success: false, message: 'No post was updated' });
    }
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).send({ success: false, message: 'Server error' });
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

    app.get('/volunteerRequest', async (req, res) => {

      const result = await collection2.find().toArray();
      res.send(result)

  
})


app.delete('/volunteerRequest/:id', async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };

  try {
    const result = await collection2.deleteOne(query);
    if (result.deletedCount === 1) {
      res.send({ success: true, message: "Deleted successfully" });
    } else {
      res.status(404).send({ success: false, message: "Post not found" });
    }
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).send({ success: false, message: "Server error" });
  }
});
    app.put('/volunteerRequest/:id', async (req, res) => {
  const id = req.params.id;
  const updatedData = req.body;

  try {
    const result = await collection2.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );

    if (result.modifiedCount > 0) {
      res.send({ success: true, message: "Post updated successfully" });
    } else {
      res.send({ success: false, message: "No changes made or post not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: "Server error" });
  }
});



    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
  }
}
run();

app.get('/', (req, res) => {
  res.send(' 3000 port all ok!');
});

app.listen(port, () => {
  console.log(` Server running at: http://localhost:${port}`);
});
