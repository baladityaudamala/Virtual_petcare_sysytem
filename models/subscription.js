// models/Subscription.js — Sequelize MySQL model
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    endpoint: {
      type: DataTypes.STRING(500),
      allowNull: false,
      unique: true,
    },
    p256dh: {
      type: DataTypes.TEXT,
    },
    auth: {
      type: DataTypes.TEXT,
    },
  },
  {
    tableName: "subscriptions",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Subscription;
