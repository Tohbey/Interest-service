const Interest = require("../models/interest")
const { MSG_TYPES } = require('../constant/types');

class InterestService {

    /**
     * Create Interest 
     * @param {Object} body request body object
    */
    static create(body) {
        return new Promise(async (resolve, reject) => {
            try {
                const interest = await Interest.findOne({
                    user: body.user,
                    interest: body.interest
                })
                if (interest) {
                    reject({ statusCode: 404, msg: MSG_TYPES.INTEREST_EXIST });
                    return;
                }

                const createInterest = await Interest.create(body)

                resolve({createInterest})
            } catch (error) {
                reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error })
            }
        })
    }

    /**
     * Get Interest 
     * @param {Number} skip skip
     * @param {Number} pageSize page size
     * @param {Object} filter filter
    */
    static getAllInterest(skip, pageSize, filter = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                const interests = await Interest.find(filter)
                    .skip(skip).limit(pageSize)

                const total = await Interest.find(filter).countDocuments()

                resolve({ interests, total })
            } catch (error) {
                reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error })
            }
        })
    }

    /**
     * Get Interest 
     * @param {Object} filter filter
    */
    static getInterest(filter) {
        return new Promise(async (resolve, reject) => {
            try {
                const interest = await Interest.findOne(filter);

                if (!interest) {
                    return reject({ statusCode: 404, msg: MSG_TYPES.NOT_FOUND })
                }

                resolve(interest)
            } catch (error) {
                reject({ statusCode: 500, msg: MSG_TYPES.SERVER_ERROR, error })
            }
        })
    }
}

module.exports = InterestService