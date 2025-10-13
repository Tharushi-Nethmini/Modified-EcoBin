const Joi = require('joi');

// security fix: Joi schema for route details
const routeDetailSchema = Joi.object({
    date: Joi.date().required(),
    route: Joi.string().required(),
    time: Joi.string().required()
});

module.exports = { routeDetailSchema };
