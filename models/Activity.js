// models/Activity.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Activity = sequelize.define(
  "Activity",
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
    activityType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "ActivityType",
    },
    duration: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: "Duration",
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "Date",
    },
    notes: {
      type: DataTypes.TEXT,
      field: "Notes",
    },
  },
  {
    tableName: "activities",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Activity;
