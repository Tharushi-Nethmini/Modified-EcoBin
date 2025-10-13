const Joi = require('joi');

// security fix: Joi schema for schedule details
const scheduleDetailSchema = Joi.object({
    address: Joi.string().required(),
    district: Joi.string().required(),
    dateTime: Joi.date().required()
});

module.exports = { scheduleDetailSchema };
