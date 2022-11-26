const express = require('express');

const userController = require('../controllers/user');

const isAuth = require('../middleware/is-auth');//jwt auth

const router = express.Router();

// GET /user
router.post('/', userController.getAuth);

module.exports = router;