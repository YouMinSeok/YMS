// src/utils/auth.js

const jwt = require('jsonwebtoken');

// 환경 변수에서 시크릿 키 가져오기
const jwtSecret = process.env.JWT_SECRET;

// JWT 생성 함수
function generateToken(payload) {
    return jwt.sign(payload, jwtSecret, { expiresIn: '15m' });
}

// JWT 검증 함수
function verifyToken(token) {
    return jwt.verify(token, jwtSecret);
}

module.exports = { generateToken, verifyToken };
