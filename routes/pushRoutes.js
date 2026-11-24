// routes/pushRoutes.js — Sequelize version
const router = require("express").Router();
const { Subscription } = require("../models/index");
const webpush = require("web-push");

const publicVapidKey = "BK9M-mGggQw8bsFVWSAflQRwdefprehKMHHim5nKrxqXhyNNfDxzUFEI9Cxh0U2HdtnJD_yAkenopAJOQmV2v-A";
const privateVapidKey = "avSGCDZ69h8tEocPawgHdLoBJ6mMBi5Qnj-5iPHaf1o";

webpush.setVapidDetails(
    "mailto:test@test.com",
    publicVapidKey,
    privateVapidKey
);

router.post("/subscribe", async (req, res) => {
    const subscription = req.body;
    const userId = req.body.userId;

    try {
        // Check if endpoint already exists
        const exists = await Subscription.findOne({ where: { endpoint: subscription.endpoint } });
        if (exists) {
            if (userId && exists.userId !== userId) {
                exists.userId = userId;
                await exists.save();
            }
            return res.status(200).json(exists);
        }

        const newSub = await Subscription.create({
            userId: userId || null,
            endpoint: subscription.endpoint,
            p256dh: subscription.keys && subscription.keys.p256dh,
            auth:   subscription.keys && subscription.keys.auth,
        });

        res.status(201).json({});
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to subscribe" });
    }
});

module.exports = router;
