const express = require('express');
const router = express.Router();
const movieController = require('../controller/movieController');

router.get('/',movieController.get);
router.get('/query',movieController.getMovies);
router.post('/',movieController.create);

module.exports = router;