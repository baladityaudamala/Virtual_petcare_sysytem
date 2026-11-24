// models/ChatParticipant.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const ChatParticipant = sequelize.define(
  "ChatParticipant",
  {
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    tableName: "chat_participants",
    timestamps: false,
  }
);

module.exports = ChatParticipant;
