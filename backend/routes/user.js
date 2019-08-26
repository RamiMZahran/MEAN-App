const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

router.post('/signup', async (req, res, next) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  const user = new User({
    email: req.body.email,
    password: hash
  });
  try {
    const result = await user.save();
    res.status(201).json({
      message: 'User Created Successfully',
      result: result
    });
  } catch (err) {
    res.status(500).json({
      message: 'Invalid Authentication Credentials!'
    });
  }
});

router.post('/login', async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(401).json({
      message: 'Invalid Authentication Credentials!'
    });
  }

  try {
    const result = await bcrypt.compare(req.body.password, user.password);
    if (!result) {
      return res.status(401).json({
        message: 'Auth Failed'
      });
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id },
      'oihoihiuonsdouibgcyb',
      { expiresIn: '1h' }
    );
    res.status(200).json({
      token,
      expiresIn: 3600,
      userId: user._id
    });
  } catch (err) {
    return res.status(401).json({
      message: 'Auth Failed'
    });
  }
});

module.exports = router;
