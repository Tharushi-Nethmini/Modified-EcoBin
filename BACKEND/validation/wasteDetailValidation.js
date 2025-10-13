const Joi = require('joi');

// security fix: Joi schema for waste details
const wasteDetailSchema = Joi.object({
    email: Joi.string().email().required(),
    category: Joi.string().required(),
    waste: Joi.string().required(),
    weight: Joi.number().required(),
    weightType: Joi.string().allow('').optional(), // allow empty string for weightType
    route: Joi.string().required()
});

// security fix: Joi schema for multiple waste details
const multipleWasteDetailsSchema = Joi.object({
    wasteDetails: Joi.array().items(wasteDetailSchema).min(1).required()
});

module.exports = {
    wasteDetailSchema,
    multipleWasteDetailsSchema
};
