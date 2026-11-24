// models/ChatMessage.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const ChatMessage = sequelize.define(
  "ChatMessage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "chat_messages",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = ChatMessage;
