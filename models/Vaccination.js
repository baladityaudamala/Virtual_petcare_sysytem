// models/Vaccination.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Vaccination = sequelize.define(
  "Vaccination",
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "Name",
    },
    dateAdministered: {
      type: DataTypes.DATEONLY,
      field: "DateAdministered",
    },
    nextDueDate: {
      type: DataTypes.DATEONLY,
      field: "NextDueDate",
    },
  },
  {
    tableName: "vaccinations",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Vaccination;
