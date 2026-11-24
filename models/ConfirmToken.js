// models/ConfirmToken.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const ConfirmToken = sequelize.define(
  "ConfirmToken",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // createdAt is handled by timestamps:true below
    // We manually check expiry (1 hour) in controllers since MySQL has no TTL index
  },
  {
    tableName: "confirm_tokens",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = ConfirmToken;
