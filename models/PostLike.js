// models/PostLike.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const PostLike = sequelize.define(
  "PostLike",
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
    // userId stored as string because Mongo ObjectId strings are still used in frontend
    userId: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "post_likes",
    timestamps: false,
  }
);

module.exports = PostLike;
