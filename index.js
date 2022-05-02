const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 5000
require('dotenv').config()
const jwt = require('jsonwebtoken');

// tastdb
// 7ek1OWi5zCWorTIx

app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@jwt-test.rhqqp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyToken(token) {
    let email;
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            email = 'invalid email'
        }
        if (decoded) {
            email = decoded
            console.log("from function", decoded)
        }
    });
    return email
}


async function run() {

    try {
        await client.connect();
        const productCollection = client.db("gadget").collection("products");
        const orderCollection = client.db("gadget").collection("orders");

        app.post('/uploadproduct', async (req, res) => {

            const tokenInfo = req.headers.authorization
            //console.log(tokeninfo)
            const [email, accessToken] = tokenInfo?.split(' ')
            console.log(accessToken)

            var decoded = verifyToken(accessToken)
            //console.log('inner upload', decoded.email)

            const product = req.body

            if (email === decoded.email) {
                const result = await productCollection.insertOne(product);
                res.send(result)
            } else {
                res.send("unAuthorized 403")
            }


        })

        //login a user
        app.post("/login", (req, res) => {
            const email = req.body

            const token = jwt.sign(email, process.env.ACCESS_TOKEN);
            res.send({ token })

        })

        //find all product
        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productCollection.find(query)
            const result = await cursor.toArray()
            res.send(result)
        })

        //oder products
        app.post('/orders', async (req, res) => {
            const orderInfo = req.body
            //console.log(orderInfo)
            const result = await orderCollection.insertOne(orderInfo);
            res.send(result)
        })

    } finally {
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('JWT ')
})

app.listen(port, () => {
    console.log(`server running on ${port}`)
})