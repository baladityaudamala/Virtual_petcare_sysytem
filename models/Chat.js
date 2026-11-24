// models/Chat.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Chat = sequelize.define(
  "Chat",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    lastMessage: {
      type: DataTypes.TEXT,
    },
    lastMessageDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "chats",
    timestamps: true,
  }
);

module.exports = Chat;
