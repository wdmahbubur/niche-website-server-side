const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

app.get('/', (req, res) => {
    res.send("DroneBazar Server Running");
});

const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.ni4ot.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();

        const database = client.db('DroneBazar');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');

        console.log('enter')

        //Add new product
        app.post('/products', async (req, res) => {
            const data = req.body.data;
            const result = await productsCollection.insertOne(data);
            if (result) {
                res.send(result.insertedId)
            }
        })

        //Get all products
        app.get('/products', async (req, res) => {
            const size = parseInt(req.query.size || 0);
            const result = productsCollection.find({}).limit(size);
            const products = await result.toArray();
            if (products) {
                res.send(products)
            }
        })

        //Get product by id
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            if (product) {
                res.send(product)
            }
        })

        //Insert Order
        app.post('/orders', async (req, res) => {
            const data = req.body.data;
            const result = await ordersCollection.insertOne(data);
            if (result) {
                res.send(result.insertedId)
            }
        })

        //Get orders by id
        app.get('/orders', async (req, res) => {
            const id = req.query.uid;
            const query = { uid: id };
            const orders = await ordersCollection.find(query).toArray();

            if (orders) {
                res.send(orders)
            }
        })

        // Delete orders by id
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);

            if (result.deletedCount === 1) {
                res.send(result.deletedCount === 1)
            }
        })


        // //Get booking by email
        // app.get('/bookings', async (req, res) => {
        //     const userId = req.query.userId;
        //     const date = req.query.date;
        //     const query = { date: date };
        //     const result = booking_appointment.find(query);
        //     const bookings = await result.toArray();
        //     if (bookings) {
        //         res.send(bookings)
        //     }
        // })

        // // Add User information
        // app.post('/users', async (req, res) => {
        //     const data = req.body.data;
        //     const user = await userCollection.insertOne(data);
        //     if (user.insertedId) {
        //         res.send(user.insertedId);
        //     }
        // })

        //save user in database
        app.put('/users', async (req, res) => {
            const user = req.body.data;
            const query = { email: user.email };
            const options = { upsert: true };
            const update = { $set: user };
            const result = await usersCollection.updateOne(query, update, options);
            res.send(result);

        })

        // Get all user
        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const user = await cursor.toArray();
            res.send(user)
        })

        // Get  users by uid
        app.get('/users/:uid', async (req, res) => {
            const id = req.params.uid;
            const query = { uid: id }
            const user = await usersCollection.findOne(query);
            res.send(user)
        })

        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email };
            const update = {
                $set: {
                    role: 'Admin'
                }
            }
            const result = await userCollection.updateOne(query, update);
            res.json(result);


        })
    }
    finally {

    }
}
run().catch(console.dir)


app.listen(port, console.log("Server Running On", port));