const express = require('express');
const router = express.Router();

const { createTechnology,getTechnologies } = require('../controllers/technology.controller');
const {validateCreateTech} = require('../validations/tech.validation');

router.post('/', validateCreateTech,createTechnology);
router.get('/', getTechnologies);


module.exports = router;
