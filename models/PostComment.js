// models/PostComment.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const PostComment = sequelize.define(
  "PostComment",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    text: {
      type: DataTypes.TEXT,
    },
    userName: {
      type: DataTypes.STRING(255),
    },
    ownerId: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "post_comments",
    timestamps: true,
    updatedAt: false,
  }
);

module.exports = PostComment;
