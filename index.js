const express = require('express');
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//Middle ware  
app.use(cors())
app.use(express.json())

console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ujahhqg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const inventionCollection = client.db("inventionDB").collection("products");
        const galleryCollection = client.db("inventionDB").collection("gallery");
        const popularCollection = client.db("inventionDB").collection("popular");

        //Gallery Collection
        app.get('/gallery', async (req, res) => {
            const cursor = galleryCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        //Popular Collection
        app.get('/popular', async (req, res) => {
            const cursor = popularCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })


        app.get('/allInvention', async (req, res) => {
            const result = await inventionCollection.find().toArray();

            res.send(result);
        })

        app.get('/allInvention/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await inventionCollection.findOne(query);
            res.send(result);
        })

        app.get('/allCategories/:categories', async (req, res) => {
            const query = { Category: req.params.categories }
            const result = await inventionCollection.find(query).toArray()
            res.send(result);
        })
        app.get('/inventionSearch/:search', async (req, res) => {
            const query = { toyName: req.params.search };
            const result = await inventionCollection.find(query).toArray();
            res.send(result)
        })
        app.get('/myInvention/:email', async (req, res) => {
            const query = { email: req.params.email }
            const result = await inventionCollection.find(query).toArray();
            res.send(result);
        })
        app.post('/postInvention', async (req, res) => {
            const body = req.body;
            const result = await inventionCollection.insertOne(body);
            res.send(result)
        })
        app.delete('/myInvention/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await inventionCollection.deleteOne(query);
            res.send(result)
        })
        app.put('/invention/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateInvention = req.body;
            const user = {
                $set: {

                    sellerName: updateInvention.sellerName,
                    price: updateInvention.price,
                    quantity: updateInvention.quantity,
                    details: updateInvention.details
                }
            }
            const result = await inventionCollection.updateOne(filter, user, options)
            res.send(result);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send("Toy Server is Running")
})
app.listen(port, () => {
    console.log(`Toy Server port on ${port}`);
})