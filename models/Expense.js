// models/Expense.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Expense = sequelize.define(
  "Expense",
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
    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: "Category",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "Amount",
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "Date",
    },
    description: {
      type: DataTypes.TEXT,
      field: "Description",
    },
  },
  {
    tableName: "expenses",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = Expense;
