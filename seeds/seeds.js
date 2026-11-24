// seeds/seeds.js — Sequelize version
// Run with: node seeds/seeds.js
// This will clear all tables and insert fresh sample data.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const { sequelize, User, Pet, VetVisit, Medication, Vaccination } = require("../models/index");

async function seed() {
  try {
    console.log("Connecting to MySQL...");
    await sequelize.authenticate();
    
    // Sync tables (create if not exist)
    await sequelize.sync({ force: false });
    console.log("Tables synced.");

    // ── Clear existing seed data ──────────────────────────────────────────────
    // Only delete seed users (by email pattern) so real data is safe
    const seedEmails = ["seed1@admin.com", "seed2@admin.com", "seed3@admin.com"];
    const existingSeeds = await User.findAll({ where: { email: seedEmails } });
    for (const u of existingSeeds) {
      await u.destroy(); // cascades to pets and sub-data
    }
    console.log("Cleared old seed data.");

    // ── Create seed users ─────────────────────────────────────────────────────
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash("password", salt);

    const user1 = await User.create({ email: "seed1@admin.com", password: passwordHash, displayName: "Steve", confirmed: true });
    const user2 = await User.create({ email: "seed2@admin.com", password: passwordHash, displayName: "Kim",   confirmed: true });
    const user3 = await User.create({ email: "seed3@admin.com", password: passwordHash, displayName: "John",  confirmed: true });
    console.log("Created 3 seed users:", user1.id, user2.id, user3.id);

    // ── Create seed pets ──────────────────────────────────────────────────────
    const pet1 = await Pet.create({
      petName: "Snowball",
      birthDate: new Date(),
      petImageLoc: "https://i.pinimg.com/originals/60/3a/e8/603ae8ce7f600eb1f32631509c6b5a76.jpg",
      gender: "male",
      typeOfPet: "Bunny",
      breed: "Holland Lop",
      parentId: user1.id,
    });

    const pet2 = await Pet.create({
      petName: "Gidget",
      birthDate: new Date(),
      petImageLoc: "https://static.wikia.nocookie.net/secretlifeofpets/images/b/b8/Gidget_pomeranian.png",
      gender: "female",
      typeOfPet: "Dog",
      breed: "Pomeranian",
      parentId: user2.id,
    });

    const pet3 = await Pet.create({
      petName: "Chloe",
      birthDate: new Date(),
      petImageLoc: "https://static.wikia.nocookie.net/secretlifeofpets/images/f/f2/Chloe.png",
      gender: "female",
      typeOfPet: "Cat",
      breed: "Russian Blue",
      parentId: user3.id,
    });

    const pet4 = await Pet.create({
      petName: "Norman",
      birthDate: new Date(),
      petImageLoc: "https://static.wikia.nocookie.net/secretlifeofpets/images/2/2e/Norman.png",
      gender: "male",
      typeOfPet: "Guinea Pig",
      breed: "Short Hair",
      parentId: user2.id,
    });
    console.log("Created 4 seed pets:", pet1.id, pet2.id, pet3.id, pet4.id);

    // ── Create seed vet visits ────────────────────────────────────────────────
    await VetVisit.bulkCreate([
      { petId: pet1.id, visitDate: new Date(), visitNotes: "Was a good bunny" },
      { petId: pet2.id, visitDate: new Date(), visitNotes: "Great visit" },
      { petId: pet3.id, visitDate: new Date(), visitNotes: "Great visit" },
      { petId: pet4.id, visitDate: new Date(), visitNotes: "Good visit" },
    ]);

    // ── Create seed medications ───────────────────────────────────────────────
    await Medication.bulkCreate([
      { petId: pet1.id, medicationName: "Bunny Meds",      dueDate: new Date("2024-04-05"), dose: "1 per day" },
      { petId: pet2.id, medicationName: "Dog Meds",        dueDate: new Date("2024-04-05"), dose: "2 per week" },
      { petId: pet3.id, medicationName: "Cat Meds",        dueDate: new Date("2024-04-05"), dose: "1 per week" },
      { petId: pet4.id, medicationName: "Guinea Pig Meds", dueDate: new Date("2024-04-05"), dose: "1 per day" },
    ]);

    // ── Create seed vaccinations ──────────────────────────────────────────────
    await Vaccination.bulkCreate([
      { petId: pet1.id, name: "Rabies",   dateAdministered: new Date("2024-01-01"), nextDueDate: new Date("2025-01-01") },
      { petId: pet2.id, name: "Distemper", dateAdministered: new Date("2024-02-01"), nextDueDate: new Date("2025-02-01") },
    ]);

    console.log("Seed data inserted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seed error:", err);
    process.exit(1);
  }
}

seed();
