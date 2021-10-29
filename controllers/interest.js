const InterestService = require('../services/interest');
const { validateInterest } = require('../request/interest')
const { MSG_TYPES } = require('../constant/types');
const { JsonResponse } = require('../lib/apiResponse');


/** 
 * Add interest
 * @param {*} req
 * @param {*} res
*/
exports.createInterest = async (req, res, next) => {
    try {
        req.body.user = req.user._id;
        
        const {error} = validateInterest(req.body)
        if (error) return JsonResponse(res, 400, error.details[0].message)

        let { createInterest } = await InterestService.create(req.body)
        
        JsonResponse(res, 201, MSG_TYPES.CREATED, createInterest)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}


/** 
 * Get All interests
 * @param {*} req
 * @param {*} res
*/
exports.getAllInterest = async (req, res, next) => {
    try {
        const { page, pageSize, skip } = paginate(req);

        const { interests, total } = await InterestService.getAllInterest(skip, pageSize)

        const meta = {
            total,
            pagination: { pageSize, page }
        }

        JsonResponse(res, 200, MSG_TYPES.FETCHED, interests, total)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * Get Interest
 * @param {*} req
 * @param {*} res
*/
exports.getInterest = async (req, res, next) => {
    try {
        let filter = {
            _id: req.params.id
        }

        const interest = await InterestService.getInterest(filter)

        JsonResponse(res, 200, MSG_TYPES.FETCHED, interest)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * Get Interest by user
 * @param {*} req
 * @param {*} res
*/
exports.getInterestForUser = async (req, res, next) => {
    try {
        let filter = {
            user: req.user._id
        }

        const interest = await InterestService.getInterest(filter)

        JsonResponse(res, 200, MSG_TYPES.FETCHED, interest)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}