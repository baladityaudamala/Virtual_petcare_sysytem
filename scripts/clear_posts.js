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
        console.log("Connected to MongoDB. Clearing posts...");
        try {
            const result = await Post.deleteMany({});
            console.log(`Deleted ${result.deletedCount} posts.`);
        } catch (err) {
            console.error("Error deleting posts:", err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch((err) => {
        console.error("Connection failed:", err);
        process.exit(1);
    });
