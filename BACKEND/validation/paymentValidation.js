const Joi = require('joi');

// security fix: Joi schema for payment
const paymentSchema = Joi.object({
    garbageId: Joi.string().required(),
    amount: Joi.number().required()
});

// security fix: Joi schema for payment update
const paymentUpdateSchema = Joi.object({
    amount: Joi.number().required(),
    status: Joi.string().optional()
});

module.exports = { paymentSchema, paymentUpdateSchema };
