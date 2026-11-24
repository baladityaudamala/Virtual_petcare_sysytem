// cron/scheduler.js — Sequelize version
const cron = require("node-cron");
const webpush = require("web-push");
const { Pet, Reminder, Subscription } = require("../models/index");

const publicVapidKey = "BK9M-mGggQw8bsFVWSAflQRwdefprehKMHHim5nKrxqXhyNNfDxzUFEI9Cxh0U2HdtnJD_yAkenopAJOQmV2v-A";
const privateVapidKey = "avSGCDZ69h8tEocPawgHdLoBJ6mMBi5Qnj-5iPHaf1o";

webpush.setVapidDetails(
    "mailto:example@yourdomain.org",
    publicVapidKey,
    privateVapidKey
);

const checkReminders = async () => {
    try {
        const now = new Date();
        const daysMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const currentDay = daysMap[now.getDay()];
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();

        console.log(`[Scheduler] Running at ${now.toISOString()} (Local: ${currentHour}:${currentMinute})`);

        // Fetch all pets that have at least 1 reminder (via JOIN — only pets with reminders)
        const pets = await Pet.findAll({
            include: [{ model: Reminder, as: "Reminders", required: true }],
        });

        console.log(`[Scheduler] Found ${pets.length} pets with reminders.`);

        for (const pet of pets) {
            for (const rem of pet.Reminders) {
                let isDue = false;
                const remDate = new Date(rem.date);
                const rHours = remDate.getHours();
                const rMinutes = remDate.getMinutes();

                if (rem.frequency === "Daily") {
                    if (currentHour === rHours && currentMinute === rMinutes) isDue = true;
                } else if (rem.frequency === "Weekly") {
                    const isTodaySelected = rem.selectedDays && rem.selectedDays.includes(currentDay);
                    if (isTodaySelected && currentHour === rHours && currentMinute === rMinutes) isDue = true;
                } else {
                    // Once — check exact date + hour + minute
                    if (
                        now.getFullYear() === remDate.getFullYear() &&
                        now.getMonth()    === remDate.getMonth() &&
                        now.getDate()     === remDate.getDate() &&
                        now.getHours()    === rHours &&
                        now.getMinutes()  === rMinutes
                    ) {
                        isDue = true;
                    }
                }

                if (isDue) {
                    const parentId = String(pet.parentId);
                    const subscriptions = await Subscription.findAll({ where: { userId: parentId } });

                    const payload = JSON.stringify({
                        title: `Reminder: ${rem.title}`,
                        body:  `It's time for ${pet.petName}'s reminder! ${rem.note || ""}`,
                        icon:  `${process.env.SERVER_URL || process.env.RENDER_EXTERNAL_URL || "http://localhost:5000"}/images/paw_logo.PNG`,
                    });

                    for (const sub of subscriptions) {
                        try {
                            await webpush.sendNotification({
                                endpoint: sub.endpoint,
                                keys: { p256dh: sub.p256dh, auth: sub.auth },
                            }, payload);
                        } catch (error) {
                            if (error.statusCode === 410 || error.statusCode === 404) {
                                // Subscription expired — remove it
                                await Subscription.destroy({ where: { id: sub.id } });
                            }
                        }
                    }
                }
            }
        }

    } catch (e) {
        console.error("Error in scheduler:", e);
    }
};

const startScheduler = () => {
    cron.schedule("* * * * *", checkReminders);
    console.log("Scheduler started.");
};

module.exports = { startScheduler };
