const Joi = require('joi');

// security fix: Joi schema for collection (recycle)
const collectionSchema = Joi.object({
    userName: Joi.string().allow(null, ''),
    userEmail: Joi.string().email().required(),
    items: Joi.array().items(
        Joi.object({
            itemName: Joi.string().required(),
            weight: Joi.number().required(),
            total: Joi.number().required()
        })
    ).required(),
    totalWeight: Joi.number().required(),
    totalPrice: Joi.number().required(),
    paymentType: Joi.string().required(),
    toReceive: Joi.number().required(),
    address: Joi.string().required(),
    district: Joi.string().required(),
    dateTime: Joi.date().required()
});

// security fix: Joi schema for status update
const statusUpdateSchema = Joi.object({
    id: Joi.string().required(),
    status: Joi.string().required()
});

module.exports = { collectionSchema, statusUpdateSchema };
