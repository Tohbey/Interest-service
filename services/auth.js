const User = require("../models/user")
const { MSG_TYPES } = require('../constant/types');
const bcrypt = require('bcrypt')
const { GenerateOTP, sendOTPByTwilio } = require("../utils/index")
const moment = require("moment");

const saltNumber = 10
class AuthService {

    /**
     * User Login
     * @param {Object} body request body object
    */
    static login(body) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findOne({ 
                    $or: [
                        {
                            email: body.emailPhoneNumber
                        },
                        {
                            phoneNumber: body.emailPhoneNumber
                        }
                    ]
                });

                if (!user) {
                    return reject({ statusCode: 404, msg: MSG_TYPES.ACCOUNT_INVALID })
                }

                const validPassword = await bcrypt.compare(body.password, user.password)
                if (!validPassword) {
                    return reject({ statusCode: 404, msg: MSG_TYPES.INVALID_PASSWORD })
                }

                const token = user.generateAuthToken();
                resolve(token)
            } catch (error) {
                reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error })
            }
        })
    }

    /**
     * Verify user account by OTP code
     * @param {Object} body request body object
    */
    static verifyUser(body) {
        return new Promise(async (resolve, reject) => {
            try {
                const currentDate = new Date();

                const user = await User.findOne({
                    phoneNumber: body.phoneNumber,
                    status: "inactive",
                    "rememberToken.token": body.OTPCode,
                    "rememberToken.expiredDate": { $gte: currentDate },
                })
                if (!user) {
                    return reject({ statusCode: 404, msg: MSG_TYPES.NOT_FOUND })
                }

                await user.updateOne({
                    rememberToken: null,
                    status: "active",
                    emailVerified: true
                })

                let token = user.generateAuthToken();

                resolve({ user, token })
            } catch (error) {
                reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error })
            }
        })
    }

    /**
     * Resend user account by OTP code
     * @param {String} phoneNumber request body object
    */
    static resendOtp(phoneNumber) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findOne({
                    phoneNumber: phoneNumber,
                    status: "inactive"
                })
                if (!user) {
                    reject({ statusCode: 404, msg: MSG_TYPES.NOT_FOUND })
                }

                const otp = GenerateOTP(5)
                const expiredDate = moment().add(20, "minutes");
                let message = "Your verification code is "+otp+ "Please DONT FORGET AGAIN";
                const newToken = {
                    token: otp,
                    expiredDate
                }
                const updateUser = await User.updateOne(
                    { phoneNumber: phoneNumber },
                    {
                        $set: {
                            rememberToken: newToken
                        }
                    }
                )

                await sendOTPByTwilio(message, newUser.phoneNumber);

                resolve({ updateUser, otp })
            } catch (error) {
                return reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error });
            }
        })
    }

    /**
     * Update User Password
     * @param {Object} body request body object
     * @param {Objec} user request body object
    */
    static updatedPassword(user, body) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(user, body)
                const currentUser = await User.findOne({
                    _id: user._id,
                    status: "active"
                })
                if (!currentUser) {
                    reject({ statusCode: 404, msg: MSG_TYPES.ACCOUNT_EXIST })
                }

                const validPassword = await bcrypt.compare(
                    body.oldPassword,
                    currentUser.password
                )
                if (!validPassword) {
                    return reject({ statusCode: 404, msg: MSG_TYPES.ACCOUNT_INVALID });
                }

                const salt = await bcrypt.genSalt(saltNumber);
                const updatedPassword = await bcrypt.hash(body.newPassword, salt);

                const updateUser = await User.updateOne(
                    { _id: user._id },
                    {
                        $set: {
                            password: updatedPassword,
                        },
                    }
                );
                resolve({ updateUser })
            } catch (error) {
                return reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error });
            }
        })
    }

    static recover(body) {
        return new Promise(async (resolve, reject) => {
            try {
                const User = await User.findOne({ 
                    $or: [
                        {
                            email: body.emailPhoneNumber
                        },
                        {
                            phoneNumber: body.emailPhoneNumber
                        }
                    ]
                });

                const otp = GenerateOTP(5)
                const expiredDate = moment().add(20, "minutes");
                let message = "Your verification code is "+otp+ "Please DONT FORGET AGAIN";
                const passwordToken = {
                    createdAt: new Date(),
                    token: otp,
                    expiredDate
                }

                const updateUser = await User.updateOne(
                    { 
                        $or: [
                            {
                                email: body.emailPhoneNumber
                            },
                            {
                                phoneNumber: body.emailPhoneNumber
                            }
                        ]
                    },
                    {
                        $set: {
                            passwordRetrive: passwordToken
                        }
                    }
                )

                await sendOTPByTwilio(message, newUser.phoneNumber);

                resolve({ updateUser })
            } catch (error) {
                return reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error });
            }
        })
    }

    static resetPassword(user, password) {
        return new Promse(async (resolve, reject) => {
            try {
                user.password = password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save();

                resolve({ user })
            } catch (error) {
                return reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error });
            }
        })
    }
}

module.exports = AuthService