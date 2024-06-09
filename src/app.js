const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { authenticateToken } = require('./utils/auth');
const indexRouter = require('./routers/index');
const authRouter = require('./routers/auth');
const profileRouter = require('./routers/profile');
const friendRouter = require('./routers/friend');
const messageRouter = require('./routers/message');
const Message = require('./models/Message');
const User = require('./models/User');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

const connectWithRetry = async () => {
    console.log('MongoDB connection with retry');
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        setTimeout(connectWithRetry, 5000);
    }
};

connectWithRetry();

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(authenticateToken);

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', friendRouter);
app.use('/', messageRouter);

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('join room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('chat message', async (msg) => {
        const roomId = msg.roomId;
        let senderId;
        try {
            // Check if msg.senderId is a valid ObjectId, if not, generate a new one
            senderId = mongoose.Types.ObjectId.isValid(msg.senderId) ? msg.senderId : new mongoose.Types.ObjectId();
        } catch (error) {
            console.error('Error generating ObjectId for senderId:', error);
            return;
        }

        const messageData = {
            roomId: roomId,
            text: msg.text,
            senderId: senderId,
            senderNickname: msg.senderNickname,
            socketId: socket.id, // socket ID 추가
            timestamp: new Date()
        };

        try {
            const message = new Message(messageData);
            await message.save();
            io.to(roomId).emit('chat message', { ...msg, socketId: socket.id });
            console.log(`Message received in room ${roomId}: ${JSON.stringify(msg)}`);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
