const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('index', { user: res.locals.user });
});

router.get('/about', (req, res) => {
    res.render('about', { user: res.locals.user });
});

router.get('/login', (req, res) => {
    res.render('login', { user: null });
});

router.get('/register', (req, res) => {
    res.render('register', { user: null });
});

module.exports = router;
