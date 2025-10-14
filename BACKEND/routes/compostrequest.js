const express = require('express');
const router = express.Router();
const compostRequestController = require('../controllers/compostRequestController');
const { apiLimiter } = require('../middleware/rateLimiter');

// Route to add a new compost request (apply generic API rate limiter)
router.post('/addcompostrequest', apiLimiter, compostRequestController.addCompostRequest);

// Route to get all compost requests
router.get('/getallcompostrequests', compostRequestController.getAllCompostRequests);

// Route to update a compost request by admin
router.put('/updatecompostrequest/:id', compostRequestController.updateCompostRequest);

// Route to update a compost request by user
router.put('/updatemycompostrequest/:id', compostRequestController.updateMyCompostRequest);

// Route to delete a compost request
router.delete('/deletecompostrequest/:id', compostRequestController.deleteCompostRequest);

// Route to get a compost request by user email
router.get('/getcompostrequest/:userEmail', compostRequestController.getCompostRequestByEmail);

module.exports = router;
