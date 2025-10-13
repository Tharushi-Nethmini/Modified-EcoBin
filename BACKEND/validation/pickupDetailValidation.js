const Joi = require('joi');

// security fix: Joi schema for pickup detail
const pickupDetailSchema = Joi.object({
    name: Joi.string().required(),
    date: Joi.date().required(),
    location: Joi.string().required(),
    phoneNumber: Joi.string().required()
});

module.exports = { pickupDetailSchema };
