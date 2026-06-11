const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const Notification = require("../models/Notification");
const { protect } = require("../middleware/auth");

// GET /api/messages/conversations  — list all conversations for current user
router.get("/conversations", protect, async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "-password")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages/:conversationId  — get messages in a conversation
router.get("/:conversationId", protect, async (req, res) => {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    })
      .populate("sender", "firstName lastName avatar")
      .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: req.params.conversationId,
        receiver: req.user._id,
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages  — send a message
router.post("/", protect, async (req, res) => {
  try {
    const { receiverId, content, fileUrl, fileName, fileType } = req.body;
    const io = req.app.get("io");

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
      });
    }

    const message = await Message.create({
      conversationId: conversation._id,
      sender: req.user._id,
      receiver: receiverId,
      content,
      fileUrl,
      fileName,
      fileType,
    });

    await message.populate("sender", "firstName lastName avatar");

    // Update conversation
    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessage: message._id,
      lastMessageAt: new Date(),
      $inc: { [`unreadCount.${receiverId}`]: 1 },
    });

    // Create notification
    const notification = await Notification.create({
      recipient: receiverId,
      sender: req.user._id,
      type: "message",
      content: content || "Sent a file",
    });

    res.status(201).json({ message, conversationId: conversation._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/conversation/start  — start or get conversation with a user
router.post("/conversation/start", protect, async (req, res) => {
  try {
    const { userId } = req.body;
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, userId] },
    }).populate("participants", "-password").populate("lastMessage");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, userId],
      });
      await conversation.populate("participants", "-password");
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
