const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    roomId: { type: String, required: true },
    text: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderNickname: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
