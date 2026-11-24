// models/Medication.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Medication = sequelize.define(
  "Medication",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    petId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    medicationName: {
      type: DataTypes.STRING(255),
      field: "MedicationName",
    },
    dueDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "DueDate",
    },
    dose: {
      type: DataTypes.STRING(255),
      field: "Dose",
    },
    time: {
      type: DataTypes.STRING(100),
      field: "Time",
    },
  },
  {
    tableName: "medications",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Medication;
