// models/VetVisit.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const VetVisit = sequelize.define(
  "VetVisit",
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
    visitDate: {
      type: DataTypes.DATEONLY,
      field: "VisitDate",
    },
    visitNotes: {
      type: DataTypes.TEXT,
      field: "VisitNotes",
    },
    weight: {
      type: DataTypes.FLOAT,
      field: "Weight",
    },
  },
  {
    tableName: "vet_visits",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = VetVisit;
