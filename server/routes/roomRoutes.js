const express = require('express');
const router = express.Router();

const roomController = require('../controllers/roomController');

router.get('/', roomController.getAllRooms);
router.get('/available', roomController.getAvailableRooms);
router.get('/:id', roomController.getRoomDetail);
router.get('/:id/related', roomController.getRelatedRooms);

// CRUD
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);

module.exports = router;