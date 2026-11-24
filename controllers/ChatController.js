// controllers/ChatController.js — Sequelize version
const { Chat, ChatParticipant, ChatMessage, ChatUnreadCount, User } = require("../models/index");

// Helper: serialize Chat to match frontend expectations (_id alias + messages/participants arrays)
function serializeChat(chat) {
  const c = chat.toJSON ? chat.toJSON() : { ...chat };
  c._id = c.id;
  if (c.participants) c.participants = c.participants.map(p => ({ ...p, _id: p.id }));
  if (c.messages)     c.messages     = c.messages.map(m => ({ ...m, _id: m.id }));
  // Convert unreadCounts array to Map-like object { userId: count }
  if (c.unreadCounts) {
    const ucMap = {};
    c.unreadCounts.forEach(uc => { ucMap[uc.userId] = uc.count; });
    c.unreadCounts = ucMap;
  }
  return c;
}

const CHAT_INCLUDE = [
  { model: User, as: "participants", attributes: ["id", "displayName"], through: { attributes: [] } },
  { model: ChatMessage, as: "messages" },
  { model: ChatUnreadCount, as: "unreadCounts" },
];

module.exports = {
  // Start or get existing chat
  initiateChat: async (req, res) => {
    try {
      const { targetUserId } = req.body;
      const myId = req.user;
      if (!targetUserId) return res.status(400).json({ msg: "Target User ID required" });

      // Check if a chat exists where both users are participants
      const myChats = await ChatParticipant.findAll({ where: { userId: myId } });
      const myChatIds = myChats.map(cp => cp.chatId);

      let existingChatId = null;
      for (const chatId of myChatIds) {
        const other = await ChatParticipant.findOne({ where: { chatId, userId: targetUserId } });
        if (other) { existingChatId = chatId; break; }
      }

      let chat;
      if (existingChatId) {
        chat = await Chat.findByPk(existingChatId, { include: CHAT_INCLUDE });
      } else {
        // Create new chat and add both participants
        chat = await Chat.create({ messages: [] });
        await ChatParticipant.bulkCreate([
          { chatId: chat.id, userId: myId },
          { chatId: chat.id, userId: targetUserId },
        ]);
        chat = await Chat.findByPk(chat.id, { include: CHAT_INCLUDE });
      }

      res.json(serializeChat(chat));
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Get all chats for current user (for Sidebar)
  getUserChats: async (req, res) => {
    try {
      const user = await User.findByPk(req.user, {
        include: [{ model: Chat, as: "chats", include: CHAT_INCLUDE }],
      });
      if (!user) return res.status(404).json({ msg: "User not found" });
      res.json((user.chats || []).map(serializeChat));
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Get specific chat history
  getChatById: async (req, res) => {
    try {
      const chat = await Chat.findByPk(req.params.id, { include: CHAT_INCLUDE });
      if (!chat) return res.status(404).json({ msg: "Chat not found" });
      res.json(serializeChat(chat));
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Add message (HTTP fallback, usually done via Socket)
  addMessage: async (req, res) => {
    try {
      const { text } = req.body;
      const chat = await Chat.findByPk(req.params.id);
      if (!chat) return res.status(404).json({ msg: "Chat not found" });

      await ChatMessage.create({ chatId: chat.id, senderId: req.user, text });
      await chat.update({ lastMessage: text, lastMessageDate: new Date() });

      const full = await Chat.findByPk(chat.id, { include: CHAT_INCLUDE });
      res.json(serializeChat(full));
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Delete Chat
  deleteChat: async (req, res) => {
    try {
      const chat = await Chat.findByPk(req.params.chatId);
      if (!chat) return res.status(404).json({ msg: "Chat not found" });
      await chat.destroy();
      res.status(200).json("Chat deleted");
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },

  // Mark chat as read for current user
  markChatRead: async (req, res) => {
    try {
      const { chatId } = req.params;
      const chat = await Chat.findByPk(chatId);
      if (!chat) return res.status(404).json("Chat not found");

      const userId = String(req.user);
      // Upsert: if row exists update count to 0; if not create with 0
      await ChatUnreadCount.upsert({ chatId: chat.id, userId, count: 0 });

      const full = await Chat.findByPk(chat.id, { include: CHAT_INCLUDE });
      res.json(serializeChat(full));
    } catch (err) {
      res.status(500).json({ msg: err.message });
    }
  },
};
