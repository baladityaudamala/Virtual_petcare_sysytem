// models/Pet.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Pet = sequelize.define(
  "Pet",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    petName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "PetName",
    },
    birthDate: {
      type: DataTypes.DATEONLY,
      field: "BirthDate",
    },
    petImageLoc: {
      type: DataTypes.STRING(1000),
      field: "PetImageLoc",
    },
    gender: {
      type: DataTypes.STRING(50),
      field: "Gender",
    },
    typeOfPet: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "TypeOfPet",
    },
    breed: {
      type: DataTypes.STRING(100),
      field: "Breed",
    },
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "ParentID",
    },
  },
  {
    tableName: "pets",
    timestamps: true,
  }
);

module.exports = Pet;
