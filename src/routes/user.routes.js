const express = require('express');
const router = express.Router();

const { getUsers } = require('../controllers/user.controller');

router.get('/', getUsers);

module.exports = router;
