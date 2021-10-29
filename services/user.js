const User = require("../models/user")
const { MSG_TYPES } = require('../constant/types');
const { GenerateOTP, GenerateToken, sendOTPByTwilio } = require("../utils/index")
const moment = require("moment");

class UserService {
    
    /**
     * Create User 
     * @param {Object} body request body object
    */
    static create(body) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findOne({
                    email: body.email,
                    username: body.username,
                    phoneNumber: body.phoneNumber,
                })

                if (user) {
                    reject({ statusCode: 404, msg: MSG_TYPES.ACCOUNT_EXIST });
                    return;
                }
                const otp = GenerateOTP(5);

                const newUser = new User(body);
                newUser.email.toLowerCase();
                let message = "Your verification code is "+otp;
                newUser.rememberToken.token = otp;
                newUser.rememberToken.expiredDate = moment().add(20, "minutes");

                await newUser.save();

                await sendOTPByTwilio(message, newUser.phoneNumber);

                resolve({ newUser, otp })
            } catch (error) {
                reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error })
            }
        })
    }

    /**
     * Get Users 
     * @param {Number} skip skip
     * @param {Number} pageSize page size
     * @param {Object} filter filter
    */
    static getAllUser(skip, pageSize, filter = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await User.find(filter)
                    .skip(skip).limit(pageSize)

                const total = await User.find(filter).countDocuments()

                resolve({ users, total })
            } catch (error) {
                reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error })
            }
        })
    }

    /**
     * Get User 
     * @param {Object} filter filter
    */
    static getUser(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findOne(filter);

                if (!user) {
                    return reject({ statusCode: 404, msg: MSG_TYPES.NOT_FOUND })
                }
                if (user.status === "terminated") {
                    return reject({ statusCode: 200, mgs: MSG_TYPES.ACCOUNT_UNVERIFIED })
                }

                resolve(user)
            } catch (error) {
                reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error })
            }
        })
    }

    /**
     * Update Users 
     * @param {object} userId user's id
     * @param {Object} userObject updated details
    */
    static update(userId, userObject) {
        return new Promise(async (resolve, reject) => {
            try {
                const user = await User.findById(userId)
                if (!user) {
                    return reject({ statusCode: 404, msg: MSG_TYPES.NOT_FOUND })
                }

                await user.updateOne(
                    {
                        $set: userObject
                    }
                )

                resolve(user)
            } catch (error) {
                reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error })
            }
        })
    }

    /**
     * Terminate User 
     * @param {Object} user user
    */
    static terminateMe(user) {
        return new Promise(async (resolve, reject) => {
            try {
                const currentUser = await User.findOne({
                    _id: user._id,
                    status: "active"
                })
                if (!currentUser) {
                    return reject({ statusCode: 404, msg: MSG_TYPES.NOT_FOUND })
                }

                currentUser.status = "terminated";
                currentUser.save();

                resolve({ msg: MSG_TYPES.DELETED })
            } catch (error) {
                return reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error });
            }
        })
    }
}

module.exports = UserService