const Joi = require('joi');

// security fix: Joi schema for garbage details
const garbageDetailSchema = Joi.object({
    name: Joi.string().required(),
    contactNumber: Joi.number().required(),
    type: Joi.string().required(), // security fix: type is required
    weight: Joi.number().required(),
    additionalNotes: Joi.string().required(), // security fix: additionalNotes is required
    weightType: Joi.string().allow('').optional() // security fix: allow empty string for weightType
});

module.exports = { garbageDetailSchema };
