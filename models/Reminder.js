// models/Reminder.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Reminder = sequelize.define(
  "Reminder",
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
    date: {
      type: DataTypes.DATE,
      field: "Date",
    },
    title: {
      type: DataTypes.STRING(255),
      field: "Title",
    },
    note: {
      type: DataTypes.TEXT,
      field: "Note",
    },
    frequency: {
      type: DataTypes.STRING(50),
      defaultValue: "Once",
      field: "Frequency",
    },
    // Store selected days as JSON array e.g. ["Mon","Wed","Fri"]
    selectedDays: {
      type: DataTypes.JSON,
      defaultValue: [],
      field: "SelectedDays",
    },
  },
  {
    tableName: "reminders",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Reminder;
