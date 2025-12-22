const mongoose = require("mongoose");
const Post = require("../models/postModel");
require("dotenv").config();

mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/myPet",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
)
    .then(async () => {
        console.log("Connected. Checking latest post...");
        const post = await Post.findOne().sort({ createdAt: -1 });
        console.log("Latest Post:", post);
        mongoose.connection.close();
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
