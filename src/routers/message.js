const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

router.get('/messages/:roomId', async (req, res) => {
    const { roomId } = req.params;
    try {
        const messages = await Message.find({ roomId }).sort('timestamp');
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});

module.exports = router;
