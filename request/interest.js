const Joi = require("joi");

function validateInterest(body){
    const interestSchema = Joi.object({
        name: Joi.string().required(),
        username: Joi.string().required()
    });

    return interestSchema.validate(body)
}

module.exports = {
    validateInterest
}