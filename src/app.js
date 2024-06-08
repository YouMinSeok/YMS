// src/app.js
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

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Mongoose connection with retry logic
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

// Session and Passport initialization
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));
app.use(passport.initialize());
app.use(passport.session());

// Middleware: Token verification and user information setting
app.use(authenticateToken);

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', friendRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
