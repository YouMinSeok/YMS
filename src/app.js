const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const User = require('./models/user');
const { generateToken, verifyToken } = require('./utils/auth');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

// Mongoose connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 유틸리티 함수: 로그인 상태 확인
const getUserFromToken = (req) => {
    const token = req.cookies.token;
    if (!token) return null;

    try {
        return verifyToken(token);
    } catch (error) {
        return null;
    }
};

// 모든 요청에 대해 사용자 정보를 확인하는 미들웨어
app.use((req, res, next) => {
    const user = getUserFromToken(req);
    res.locals.user = user; // 사용자 정보를 로컬 변수에 저장하여 템플릿에서 접근 가능하게 함
    next();
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send('유효하지 않은 사용자 이름입니다.');
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).send('유효하지 않은 비밀번호입니다.');
        }

        const token = generateToken({ username: user.username, email: user.email });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({ message: '로그인이 성공적으로 완료되었습니다.', token });
    } catch (error) {
        console.error('로그인 중 오류가 발생했습니다:', error);
        res.status(500).send('로그인 중 오류가 발생했습니다: ' + error.message);
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    const emailExists = await checkEmail(email);
    if (emailExists) {
        return res.status(400).send('중복된 이메일 주소입니다. 다른 이메일 주소를 사용해주세요.');
    }

    const usernameExists = await checkUsername(username);
    if (usernameExists) {
        return res.status(400).send('중복된 사용자 이름입니다. 다른 사용자 이름을 사용해주세요.');
    }

    if (password.length < 8 || password.length > 12) {
        return res.status(400).send('비밀번호는 8자 이상 12자 이하여야 합니다.');
    }

    try {
        const user = new User({ username, email, password });
        await user.save();
        console.log('User saved:', user);

        const token = generateToken({ username, email });
        res.json({ message: '회원가입이 성공적으로 완료되었습니다.', token });
    } catch (error) {
        console.error('사용자 등록 중 오류가 발생했습니다:', error);
        res.status(500).send('사용자 등록 중 오류가 발생했습니다: ' + error.message);
    }
});

async function checkEmail(email) {
    const existingUser = await User.findOne({ email });
    return !!existingUser;
}

async function checkUsername(username) {
    const existingUser = await User.findOne({ username });
    return !!existingUser;
}

app.post('/check-email', async (req, res) => {
    const { email } = req.body;
    const emailExists = await checkEmail(email);
    if (emailExists) {
        return res.status(400).send('중복된 이메일 주소입니다. 다른 이메일 주소를 사용해주세요.');
    }
    res.status(200).send('사용 가능한 이메일 주소입니다.');
});

app.post('/check-username', async (req, res) => {
    const { username } = req.body;
    const usernameExists = await checkUsername(username);
    if (usernameExists) {
        return res.status(400).send('중복된 사용자 이름입니다. 다른 사용자 이름을 사용해주세요.');
    }
    res.status(200).send('사용 가능한 사용자 이름입니다.');
});

app.get('/verify-token', (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ message: '토큰이 없습니다.' });
    }

    try {
        const payload = verifyToken(token);
        res.status(200).json({ message: '토큰이 유효합니다.', payload });
    } catch (error) {
        console.error('유효하지 않은 토큰입니다:', error);
        res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('token'); // 쿠키에 저장된 토큰 삭제
    res.redirect('/'); // 로그아웃 후 메인 페이지로 리디렉션
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`서버가 포트 ${port}에서 실행 중입니다.`);
});
