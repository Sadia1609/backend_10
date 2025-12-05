const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = 3000;

const app = express();
app.use(cors());
app.use(express.json())




const uri = "mongodb+srv://missionscic:d5DFOGStt78CukzS@cluster0.e62g5zs.mongodb.net/?appName=Cluster0";


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    await client.connect();


    //database create
    




    app.post('/services', async (req, res)=>{
        const data = req.body;
        console.log(data);
    })



    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
   
   
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('hello, developers')
})

app.listen(port, ()=>{
    console.log(`server is running on ${port}`);
})
