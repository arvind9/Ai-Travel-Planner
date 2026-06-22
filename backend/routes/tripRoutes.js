const express = require('express');
const router = express.Router();
const { generateNewTrip, getUserTrips, updateTrip } = require('../controllers/tripController');
const protect = require('../middleware/auth'); // Enforces security enclave data isolation

// Secured pathways mapping to active logged-in users only
router.post('/', protect, generateNewTrip);
router.get('/', protect, getUserTrips);
router.put('/:id', protect, updateTrip);

module.exports = router;