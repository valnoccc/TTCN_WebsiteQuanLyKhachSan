const express = require('express');
const router = express.Router();
const roomTypeController = require('../controllers/roomTypeController');

router.get('/', roomTypeController.getAll);
router.post('/', roomTypeController.create);
router.put('/:id', roomTypeController.update);
router.delete('/:id', roomTypeController.delete);

module.exports = router;