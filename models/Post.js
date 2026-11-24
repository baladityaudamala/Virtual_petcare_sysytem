// models/Post.js
const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Post = sequelize.define(
  "Post",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    petName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ownerName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    image: {
      type: DataTypes.STRING(1000),
    },
    mediaType: {
      type: DataTypes.STRING(50),
      defaultValue: "image",
    },
    caption: {
      type: DataTypes.TEXT,
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: "All",
    },
    repostFrom: {
      type: DataTypes.STRING(255),
    },
  },
  {
    tableName: "posts",
    timestamps: true,
  }
);

module.exports = Post;
