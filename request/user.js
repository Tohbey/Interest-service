const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const complexityOption = {
    min:6,
    max:20,
    lowerCase:1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 2,
}

function validateUser(body) {
    const userSchema = Joi.object({
        email: Joi.string().email().max(50).required(),
        password: passwordComplexity(complexityOption).required(),
        name: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        countryCode: Joi.string(),
        interest: Joi.string().required()
    });

    return userSchema.validate(body)
}

function validateResendOTP(body){
    const schema = Joi.object({
        phoneNumber: Joi.string().max(50).required(),
    })

    return schema.validate(body)
}

function validateLogin(user){
    const schema = Joi.object({
        emailPhoneNumber: Joi.string().required(),
        password: passwordComplexity(complexityOption).required(),
    })

    return schema.validate(user)
}

function validateVerifyUser(user){
    const schema = Joi.object({
        phoneNumber: Joi.string().required(),
        OTPCode: Joi.string().min(5).max(5).required(),
    })

    return schema.validate(user)
}

function validatePasswordChange(body){
    const schema = Joi.object({
        oldPassword: Joi.string().required(),
        newPassword: passwordComplexity(complexityOption).required(),
    })

    return schema.validate(body)
}


function validateResetPassword(body){
    const schema = Joi.object({
        token: Joi.string().required(),
        password: passwordComplexity(complexityOption).required(),
    })

    return schema.validate(body)
}

module.exports = {
    validateUser,
    validateResendOTP,
    validateLogin,
    validateVerifyUser,
    validatePasswordChange,
    validateResetPassword
}