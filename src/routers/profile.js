const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const { authenticateToken } = require('../utils/auth');

const router = express.Router();

function maskEmail(email) {
    const [localPart, domain] = email.split('@');
    const maskedLocalPart = localPart.slice(0, 2) + '****';
    const maskedDomain = domain.split('.').map((part, index) => index === 0 ? '****' : part).join('.');
    return `${maskedLocalPart}@${maskedDomain}`;
}

function maskUsername(username) {
    return username.slice(0, 2) + '****';
}

router.get('/profile', authenticateToken, async (req, res) => {
    if (!res.locals.user) {
        return res.status(401).redirect('/login');
    }

    try {
        const user = res.locals.user;
        const maskedEmail = maskEmail(user.email);
        const maskedUsername = maskUsername(user.username);

        res.render('profile', {
            user: { ...user.toObject(), email: maskedEmail, username: maskedUsername }
        });
    } catch (error) {
        res.status(500).json({ message: '프로필 로드 중 오류가 발생했습니다.' });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.post('/update', upload.single('avatar'), async (req, res) => {
    try {
      const { userId, nickname } = req.body;
      const avatar = req.file ? `/uploads/${req.file.filename}` : null;
  
      if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if nickname has changed
      const isNicknameChanged = nickname && nickname !== user.nickname;
  
      if (isNicknameChanged) {
        // Check if nickname has been changed before
        if (user.lastNicknameChange) {
          return res.status(400).json({ message: '닉네임은 한 번만 변경할 수 있습니다.' });
        }
  
        const nicknameExists = await User.findOne({ nickname });
        if (nicknameExists) {
          return res.status(400).json({ message: '중복된 닉네임입니다. 다른 닉네임을 사용해주세요.' });
        }
  
        user.nickname = nickname;
        user.lastNicknameChange = Date.now(); // Set the lastNicknameChange date
      }
  
      if (avatar) {
        user.avatarUrl = avatar;
      } else if (!user.avatarUrl) {
        user.avatarUrl = '/uploads/default-avatar.png';
      }
  
      await user.save();
      res.json({ avatar: user.avatarUrl, nickname: user.nickname, lastNicknameChange: user.lastNicknameChange });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });


module.exports = router;
