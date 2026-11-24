// models/ChatUnreadCount.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const ChatUnreadCount = sequelize.define(
  "ChatUnreadCount",
  {
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    // userId stored as string to match the JWT user id
    userId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    tableName: "chat_unread_counts",
    timestamps: false,
  }
);

module.exports = ChatUnreadCount;
