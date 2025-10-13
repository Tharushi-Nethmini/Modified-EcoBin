const Joi = require('joi');

// security fix: Joi schema for compost request
const compostRequestSchema = Joi.object({
    email: Joi.string().email().required(),
    potential: Joi.number().required(),
    amount: Joi.number().required(),
    cost: Joi.number().required(),
    address: Joi.string().required()
});

// security fix: Joi schema for admin update
const compostRequestUpdateSchema = Joi.object({
    email: Joi.string().email().required(),
    amount: Joi.number().required(),
    cost: Joi.number().required(),
    address: Joi.string().required(),
    status: Joi.string().required()
});

module.exports = { compostRequestSchema, compostRequestUpdateSchema };
