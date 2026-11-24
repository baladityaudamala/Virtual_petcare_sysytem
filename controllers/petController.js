// controllers/petController.js — Sequelize/MySQL implementation
// Uses Sequelize CRUD on separate normalized tables.
// API response shape remains compatible with the frontend.

const { Pet, VetVisit, Medication, Vaccination, Reminder, Activity, Expense } = require("../models/index");

// Helper: include all sub-tables when fetching a pet.
const PET_INCLUDE = [
  { model: VetVisit,    as: "VetVisits"    },
  { model: Medication,  as: "Medications"  },
  { model: Vaccination, as: "Vaccinations" },
  { model: Reminder,    as: "Reminders"    },
  { model: Activity,    as: "Activities"   },
  { model: Expense,     as: "Expenses"     },
];

// Helper: convert Sequelize pet instance to the JSON shape the frontend expects
// (adds _id alias for id so old frontend references to pet._id still work)
function serializePet(pet) {
  const p = pet.toJSON ? pet.toJSON() : pet;
  p._id = p.id;
  p.PetName = p.petName;
  p.BirthDate = p.birthDate;
  p.PetImageLoc = p.petImageLoc;
  if (typeof p.PetImageLoc === "string") {
    p.PetImageLoc = p.PetImageLoc.replace(/^\.\//, "/");
  }
  p.petImageLoc = p.PetImageLoc;
  p.Gender = p.gender;
  p.TypeOfPet = p.typeOfPet;
  p.Breed = p.breed;
  p.ParentID = p.parentId;
  if (p.VetVisits) p.VetVisits = p.VetVisits.map(v => ({
    ...v,
    _id: v.id,
    VisitDate: v.visitDate,
    VisitNotes: v.visitNotes,
    Weight: v.weight,
  }));
  if (p.Medications) p.Medications = p.Medications.map(m => ({
    ...m,
    _id: m.id,
    MedicationName: m.medicationName,
    DueDate: m.dueDate,
    Dose: m.dose,
    Time: m.time,
  }));
  if (p.Vaccinations) p.Vaccinations = p.Vaccinations.map(v => ({
    ...v,
    _id: v.id,
    Name: v.name,
    DateAdministered: v.dateAdministered,
    NextDueDate: v.nextDueDate,
  }));
  if (p.Reminders) p.Reminders = p.Reminders.map(r => ({
    ...r,
    _id: r.id,
    Date: r.date,
    Title: r.title,
    Note: r.note,
    Frequency: r.frequency,
    SelectedDays: r.selectedDays,
  }));
  if (p.Activities) p.Activities = p.Activities.map(a => ({
    ...a,
    _id: a.id,
    ActivityType: a.activityType,
    Duration: a.duration,
    Date: a.date,
    Notes: a.notes,
  }));
  if (p.Expenses) p.Expenses = p.Expenses.map(e => ({
    ...e,
    _id: e.id,
    Category: e.category,
    Amount: e.amount,
    Date: e.date,
    Description: e.description,
  }));
  return p;
}

function getUserIdFromReq(req) {
  if (req.user === undefined || req.user === null) return null;
  if (typeof req.user === "number" || typeof req.user === "string") return req.user;
  if (typeof req.user === "object") return req.user.id || req.user._id || null;
  return null;
}

module.exports = {
  // ─── PETS ──────────────────────────────────────────────────────────────────
  getPets: async (req, res) => {
    try {
      const dbPets = await Pet.findAll({ include: PET_INCLUDE });
      return res.json(dbPets.map(serializePet));
    } catch (err) {
      console.error("getPets error:", err);
      return res.status(500).json({ error: "Failed to fetch pets" });
    }
  },

  getPetsByUser: async (req, res) => {
    try {
      const userId = req.params.id || getUserIdFromReq(req);
      if (!userId) return res.status(400).json({ error: "Missing user id" });

      const dbPets = await Pet.findAll({
        where: { parentId: userId },
        include: PET_INCLUDE,
      });
      return res.json(dbPets.map(serializePet));
    } catch (err) {
      console.error("getPetsByUser error:", err);
      return res.status(500).json({ error: "Failed to fetch pets for user" });
    }
  },

  getPetByID: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const pet = await Pet.findByPk(id, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });

      return res.json(serializePet(pet));
    } catch (err) {
      console.error("getPetByID error:", err);
      return res.status(500).json({ error: "Failed to fetch pet" });
    }
  },

  createPet: async (req, res) => {
    try {
      const parentId = getUserIdFromReq(req);
      if (!parentId) return res.status(401).json({ error: "Unauthorized: missing user" });

      const pet = await Pet.create({
        petName:    req.body.PetName,
        birthDate:  req.body.BirthDate,
        petImageLoc: req.body.PetImageLoc,
        gender:     req.body.Gender,
        typeOfPet:  req.body.TypeOfPet,
        breed:      req.body.Breed,
        parentId,
      });

      // Fetch with includes so response has all sub-arrays (empty)
      const full = await Pet.findByPk(pet.id, { include: PET_INCLUDE });
      return res.status(201).json(serializePet(full));
    } catch (err) {
      console.error("createPet error:", err);
      return res.status(500).json({ error: "Failed to create pet" });
    }
  },

  updatePet: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const pet = await Pet.findByPk(id);
      if (!pet) return res.status(404).json({ error: "Pet not found" });

      await pet.update({
        petName:    req.body.PetName    || pet.petName,
        birthDate:  req.body.BirthDate  || pet.birthDate,
        petImageLoc: req.body.PetImageLoc || pet.petImageLoc,
        gender:     req.body.Gender     || pet.gender,
        typeOfPet:  req.body.TypeOfPet  || pet.typeOfPet,
        breed:      req.body.Breed      || pet.breed,
      });

      const full = await Pet.findByPk(id, { include: PET_INCLUDE });
      return res.json(serializePet(full));
    } catch (err) {
      console.error("updatePet error:", err);
      return res.status(500).json({ error: "Failed to update pet" });
    }
  },

  delPet: async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) return res.status(400).json({ error: "Missing pet id" });

      const pet = await Pet.findByPk(id);
      if (!pet) return res.status(404).json({ error: "Pet not found" });

      await pet.destroy(); // cascades to all sub-tables
      return res.json({ message: "Pet deleted", pet: serializePet(pet) });
    } catch (err) {
      console.error("delPet error:", err);
      return res.status(500).json({ error: "Failed to delete pet" });
    }
  },

  // ─── VET VISITS ────────────────────────────────────────────────────────────
  addPetVisit: async (req, res) => {
    try {
      const petId = req.params.id;
      if (!petId) return res.status(400).json({ error: "Missing pet id" });

      await VetVisit.create({ petId, visitDate: req.body.VisitDate, visitNotes: req.body.VisitNotes, weight: req.body.Weight });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("addPetVisit error:", err);
      return res.status(500).json({ error: "Failed to add visit" });
    }
  },

  findPetVisit: async (req, res) => {
    try {
      const { id: petId, visitid } = req.params;
      if (!petId || !visitid) return res.status(400).json({ error: "Missing pet id or visit id" });

      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Visit not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("findPetVisit error:", err);
      return res.status(500).json({ error: "Failed to find visit" });
    }
  },

  updatePetVisit: async (req, res) => {
    try {
      const { id: petId, visitid } = req.params;
      if (!petId || !visitid) return res.status(400).json({ error: "Missing ids" });

      const visit = await VetVisit.findByPk(visitid);
      if (!visit) return res.status(404).json({ error: "Visit not found" });

      await visit.update({ visitDate: req.body.VisitDate, visitNotes: req.body.VisitNotes });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("updatePetVisit error:", err);
      return res.status(500).json({ error: "Failed to update visit" });
    }
  },

  delPetVisit: async (req, res) => {
    try {
      const { id: petId, visitid } = req.params;
      if (!petId || !visitid) return res.status(400).json({ error: "Missing ids" });

      await VetVisit.destroy({ where: { id: visitid } });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("delPetVisit error:", err);
      return res.status(500).json({ error: "Failed to delete visit" });
    }
  },

  // ─── MEDICATIONS ───────────────────────────────────────────────────────────
  addPetMed: async (req, res) => {
    try {
      const petId = req.params.id;
      if (!petId) return res.status(400).json({ error: "Missing pet id" });

      await Medication.create({
        petId,
        medicationName: req.body.MedicationName,
        dueDate: req.body.DueDate,
        dose: req.body.Dose,
        time: req.body.Time,
      });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("addPetMed error:", err);
      return res.status(500).json({ error: "Failed to add medication" });
    }
  },

  updatePetMed: async (req, res) => {
    try {
      const { id: petId, medid } = req.params;
      if (!petId || !medid) return res.status(400).json({ error: "Missing ids" });

      const med = await Medication.findByPk(medid);
      if (!med) return res.status(404).json({ error: "Medication not found" });

      await med.update({
        medicationName: req.body.MedicationName,
        dueDate: req.body.DueDate,
        dose: req.body.Dose,
        time: req.body.Time,
      });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("updatePetMed error:", err);
      return res.status(500).json({ error: "Failed to update medication" });
    }
  },

  delPetMed: async (req, res) => {
    try {
      const { id: petId, medid } = req.params;
      if (!petId || !medid) return res.status(400).json({ error: "Missing ids" });

      await Medication.destroy({ where: { id: medid } });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("delPetMed error:", err);
      return res.status(500).json({ error: "Failed to delete medication" });
    }
  },

  // ─── VACCINATIONS ──────────────────────────────────────────────────────────
  addPetVaccination: async (req, res) => {
    try {
      const petId = req.params.id;
      if (!petId) return res.status(400).json({ error: "Missing pet id" });

      await Vaccination.create({
        petId,
        name: req.body.Name,
        dateAdministered: req.body.DateAdministered,
        nextDueDate: req.body.NextDueDate,
      });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("addPetVaccination error:", err);
      return res.status(500).json({ error: "Failed to add vaccination" });
    }
  },

  updatePetVaccination: async (req, res) => {
    try {
      const { id: petId, vaccid } = req.params;
      if (!petId || !vaccid) return res.status(400).json({ error: "Missing ids" });

      const vacc = await Vaccination.findByPk(vaccid);
      if (!vacc) return res.status(404).json({ error: "Vaccination not found" });

      await vacc.update({
        name: req.body.Name,
        dateAdministered: req.body.DateAdministered,
        nextDueDate: req.body.NextDueDate,
      });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("updatePetVaccination error:", err);
      return res.status(500).json({ error: "Failed to update vaccination" });
    }
  },

  delPetVaccination: async (req, res) => {
    try {
      const { id: petId, vaccid } = req.params;
      if (!petId || !vaccid) return res.status(400).json({ error: "Missing ids" });

      await Vaccination.destroy({ where: { id: vaccid } });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("delPetVaccination error:", err);
      return res.status(500).json({ error: "Failed to delete vaccination" });
    }
  },

  // ─── REMINDERS ─────────────────────────────────────────────────────────────
  addPetReminder: async (req, res) => {
    try {
      const petId = req.params.id;
      if (!petId) return res.status(400).json({ error: "Missing pet id" });

      await Reminder.create({
        petId,
        date: req.body.Date,
        title: req.body.Title,
        note: req.body.Note,
        frequency: req.body.Frequency || "Once",
        selectedDays: req.body.SelectedDays || [],
      });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("addPetReminder error:", err);
      return res.status(500).json({ error: "Failed to add reminder" });
    }
  },

  updatePetReminder: async (req, res) => {
    try {
      const { id: petId, reminderid } = req.params;
      if (!petId || !reminderid) return res.status(400).json({ error: "Missing ids" });

      const reminder = await Reminder.findByPk(reminderid);
      if (!reminder) return res.status(404).json({ error: "Reminder not found" });

      await reminder.update({
        date: req.body.Date,
        title: req.body.Title,
        note: req.body.Note,
      });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("updatePetReminder error:", err);
      return res.status(500).json({ error: "Failed to update reminder" });
    }
  },

  delPetReminder: async (req, res) => {
    try {
      const { id: petId, reminderid } = req.params;
      if (!petId || !reminderid) return res.status(400).json({ error: "Missing ids" });

      await Reminder.destroy({ where: { id: reminderid } });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("delPetReminder error:", err);
      return res.status(500).json({ error: "Failed to delete reminder" });
    }
  },

  // ─── ACTIVITIES ────────────────────────────────────────────────────────────
  addPetActivity: async (req, res) => {
    try {
      const petId = req.params.id;
      if (!petId) return res.status(400).json({ error: "Missing pet id" });

      await Activity.create({
        petId,
        activityType: req.body.ActivityType,
        duration: req.body.Duration,
        date: req.body.Date || new Date(),
        notes: req.body.Notes,
      });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("addPetActivity error:", err);
      return res.status(500).json({ error: "Failed to log activity" });
    }
  },

  // ─── EXPENSES ──────────────────────────────────────────────────────────────
  addPetExpense: async (req, res) => {
    try {
      const petId = req.params.id;
      if (!petId) return res.status(400).json({ error: "Missing pet id" });

      await Expense.create({
        petId,
        category: req.body.Category,
        amount: req.body.Amount,
        date: req.body.Date || new Date(),
        description: req.body.Description,
      });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("addPetExpense error:", err);
      return res.status(500).json({ error: "Failed to log expense" });
    }
  },

  deletePetExpense: async (req, res) => {
    try {
      const { id: petId, expenseId } = req.params;
      if (!petId || !expenseId) return res.status(400).json({ error: "Missing required ids" });

      await Expense.destroy({ where: { id: expenseId } });
      const pet = await Pet.findByPk(petId, { include: PET_INCLUDE });
      if (!pet) return res.status(404).json({ error: "Pet not found" });
      return res.json(serializePet(pet));
    } catch (err) {
      console.error("deletePetExpense error:", err);
      return res.status(500).json({ error: "Failed to delete expense" });
    }
  },
};
