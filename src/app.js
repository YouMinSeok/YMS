const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const { authenticateToken } = require(path.join(__dirname, 'utils', 'auth'));
const indexRouter = require(path.join(__dirname, 'routers', 'index'));
const authRouter = require(path.join(__dirname, 'routers', 'auth'));
const profileRouter = require(path.join(__dirname, 'routers', 'profile'));
const friendRouter = require(path.join(__dirname, 'routers', 'friend'));
const messageRouter = require(path.join(__dirname, 'routers', 'message'));
const Message = require(path.join(__dirname, 'models', 'Message'));
const User = require(path.join(__dirname, 'models', 'User'));

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.set('views', path.join(__dirname, '..', 'views'));
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

app.set('socketio', io);

io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    socket.on('user online', async (shortId) => {
        try {
            await User.findOneAndUpdate({ shortId }, { isOnline: true, socketId: socket.id });
            console.log(`User ${shortId} is online`);
        } catch (error) {
            console.error('Error updating user online status:', error);
        }
    });

    socket.on('join room', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('chat message', async (msg) => {
        const roomId = msg.roomId;
        const messageData = {
            roomId: roomId,
            text: msg.text,
            senderId: msg.senderId,
            senderNickname: msg.senderNickname,
            senderAvatar: msg.senderAvatar,
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

    socket.on('logout', async (shortId) => {
        try {
            await User.findOneAndUpdate({ shortId }, { isOnline: false });
            console.log(`User ${shortId} is offline`);
            socket.broadcast.emit('friend offline', shortId);
        } catch (error) {
            console.error('Error updating user offline status:', error);
        }
    });

    socket.on('disconnect', async () => {
        try {
            const user = await User.findOneAndUpdate({ socketId: socket.id }, { isOnline: false });
            if (user) {
                console.log(`User ${user.shortId} disconnected`);
                socket.broadcast.emit('friend offline', user.shortId);
            }
        } catch (error) {
            console.error('Error handling disconnect:', error);
        }
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
