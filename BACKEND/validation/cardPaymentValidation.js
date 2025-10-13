const Joi = require('joi');

// security fix: Joi schema for card payment
const cardPaymentSchema = Joi.object({
    paymentMethod: Joi.string().valid('online', 'cash').required(),
    cardNumber: Joi.string().when('paymentMethod', {
        is: 'online',
        then: Joi.string().creditCard().required(),
        otherwise: Joi.forbidden()
    }),
    expiryDate: Joi.string().when('paymentMethod', {
        is: 'online',
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
    }),
    cvv: Joi.string().when('paymentMethod', {
        is: 'online',
        then: Joi.string().required(),
        otherwise: Joi.forbidden()
    }),
    saveCard: Joi.boolean().optional()
});

module.exports = { cardPaymentSchema };
