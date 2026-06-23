const express = require('express');
const router = express.Router();
const { generateNewTrip, getUserTrips, updateTrip } = require('../controllers/tripController');
const protect = require('../middleware/auth'); // Enforces security enclave data isolation
const Trip = require('../models/Trip');

// Secured pathways mapping to active logged-in users only
router.post('/', protect, generateNewTrip);
router.get('/', protect, getUserTrips);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTrip = await Trip.findByIdAndDelete(id);
    
    if (!deletedTrip) {
      return res.status(404).json({ message: "Trip history record not found" });
    }
    
    res.status(200).json({ message: "Trip history entry successfully deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;