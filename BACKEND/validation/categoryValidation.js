const Joi = require('joi');

// security fix: Joi schema for category
const categorySchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow('').optional()
});

module.exports = { categorySchema };
