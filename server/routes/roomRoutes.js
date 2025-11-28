const express = require('express');
const router = express.Router();

const roomController = require('../controllers/roomController');

router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomDetail);
router.get('/:id/related', roomController.getRelatedRooms);

module.exports = router;