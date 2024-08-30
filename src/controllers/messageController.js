import Group from '../models/groupModel.js';
import { getIO } from '../websocket/socket.js';
import Message from '../models/messageModel.js';
import { body, validationResult, param } from 'express-validator';

// Send Message Controller
export async function sendMessage(req, res) {
  try {
    // Validation
    await body('groupId').isMongoId().withMessage('Invalid group ID').run(req);
    await body('content').notEmpty().withMessage('Message content is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(err => err.msg) });
    }

    const { groupId, content } = req.body;

    // Find the group
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Create a new message
    const message = new Message({
      content,
      group: groupId,
      user: req.user.id 
    });

    // Save the message
    await message.save();

    // Emit the new message to the group via socket.io
    const io = getIO();
    io.to(groupId).emit('newMessage', message);

    // Respond with the created message
    res.status(201).json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server error' });
  }
}

// Like Message Controller
export async function likeMessage(req, res) {
  try {
    // Validation
    await param('id').isMongoId().withMessage('Invalid message ID').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array().map(err => err.msg) });
    }

    const { id } = req.params;

    const message = await Message.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Capture the user who liked the message
    const userId = req.user.id;

    // Check if the user has already liked the message
    if (!message.likes.includes(userId)) {
      message.likes.push(userId);
    }
    await message.save();

    // Emit the like event with user information
    const io = getIO();
    const likeData = {
      _id: message._id,
      content: message.content,
      groupId: message.groupId,
      likes: message.likes,
      likedBy: req.user, // Add user information
      likeCount: message.likes.length,
      updatedAt: message.updatedAt,
    };

    io.to(message.groupId).emit('likeMessage', likeData);

    res.json(likeData);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while liking the message', error: error.message });
  }
}

// Get Messages by Group Controller
export async function getMessagesByGroup(req, res) {
  try {
    const { groupId } = req.params;

    // Validate the group ID
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Find messages by group ID and populate the user details
    const messages = await Message.find({ group: groupId })
      .populate('user', 'name _id') // Populate user field with name and ID
      .exec();

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
