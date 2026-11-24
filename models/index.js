// models/index.js — Central associations hub
// Import all models and define relationships here
// This file is required once at startup (in server.js) so all associations are set up.

const sequelize = require("./db");

const User           = require("./User");
const ConfirmToken   = require("./ConfirmToken");
const Pet            = require("./Pet");
const VetVisit       = require("./VetVisit");
const Medication     = require("./Medication");
const Vaccination    = require("./Vaccination");
const Reminder       = require("./Reminder");
const Activity       = require("./Activity");
const Expense        = require("./Expense");
const Post           = require("./Post");
const PostTag        = require("./PostTag");
const PostLike       = require("./PostLike");
const PostComment    = require("./PostComment");
const Chat           = require("./Chat");
const ChatParticipant = require("./ChatParticipant");
const ChatMessage    = require("./ChatMessage");
const ChatUnreadCount = require("./ChatUnreadCount");
const Subscription   = require("./Subscription");

// ─── User Associations ────────────────────────────────────────────────────────
User.hasMany(ConfirmToken, { foreignKey: "userId", onDelete: "CASCADE" });
ConfirmToken.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Pet, { foreignKey: "parentId", onDelete: "CASCADE" });
Pet.belongsTo(User, { foreignKey: "parentId" });

// ─── Pet Sub-document Associations ───────────────────────────────────────────
Pet.hasMany(VetVisit,    { foreignKey: "petId", as: "VetVisits",    onDelete: "CASCADE" });
Pet.hasMany(Medication,  { foreignKey: "petId", as: "Medications",  onDelete: "CASCADE" });
Pet.hasMany(Vaccination, { foreignKey: "petId", as: "Vaccinations", onDelete: "CASCADE" });
Pet.hasMany(Reminder,    { foreignKey: "petId", as: "Reminders",    onDelete: "CASCADE" });
Pet.hasMany(Activity,    { foreignKey: "petId", as: "Activities",   onDelete: "CASCADE" });
Pet.hasMany(Expense,     { foreignKey: "petId", as: "Expenses",     onDelete: "CASCADE" });

VetVisit.belongsTo(Pet,    { foreignKey: "petId" });
Medication.belongsTo(Pet,  { foreignKey: "petId" });
Vaccination.belongsTo(Pet, { foreignKey: "petId" });
Reminder.belongsTo(Pet,    { foreignKey: "petId" });
Activity.belongsTo(Pet,    { foreignKey: "petId" });
Expense.belongsTo(Pet,     { foreignKey: "petId" });

// ─── Post Associations ────────────────────────────────────────────────────────
Post.hasMany(PostTag,     { foreignKey: "postId", as: "tags",     onDelete: "CASCADE" });
Post.hasMany(PostLike,    { foreignKey: "postId", as: "likedBy",  onDelete: "CASCADE" });
Post.hasMany(PostComment, { foreignKey: "postId", as: "comments", onDelete: "CASCADE" });

PostTag.belongsTo(Post,     { foreignKey: "postId" });
PostLike.belongsTo(Post,    { foreignKey: "postId" });
PostComment.belongsTo(Post, { foreignKey: "postId" });

// ─── Chat Associations ────────────────────────────────────────────────────────
// Many-to-Many: Chat ↔ User via ChatParticipant
Chat.belongsToMany(User, {
  through: ChatParticipant,
  foreignKey: "chatId",
  otherKey: "userId",
  as: "participants",
});
User.belongsToMany(Chat, {
  through: ChatParticipant,
  foreignKey: "userId",
  otherKey: "chatId",
  as: "chats",
});

Chat.hasMany(ChatMessage,     { foreignKey: "chatId", as: "messages",     onDelete: "CASCADE" });
Chat.hasMany(ChatUnreadCount, { foreignKey: "chatId", as: "unreadCounts", onDelete: "CASCADE" });

ChatMessage.belongsTo(Chat,    { foreignKey: "chatId" });
ChatMessage.belongsTo(User,    { foreignKey: "senderId", as: "sender" });
ChatUnreadCount.belongsTo(Chat, { foreignKey: "chatId" });

module.exports = {
  sequelize,
  User,
  ConfirmToken,
  Pet,
  VetVisit,
  Medication,
  Vaccination,
  Reminder,
  Activity,
  Expense,
  Post,
  PostTag,
  PostLike,
  PostComment,
  Chat,
  ChatParticipant,
  ChatMessage,
  ChatUnreadCount,
  Subscription,
};
