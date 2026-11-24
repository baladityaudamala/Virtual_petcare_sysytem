// models/PostTag.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const PostTag = sequelize.define(
  "PostTag",
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
    tag: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "post_tags",
    timestamps: false,
  }
);

module.exports = PostTag;
