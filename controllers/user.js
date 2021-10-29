const { MSG_TYPES } = require("../constant/types");
const { JsonResponse } = require("../lib/apiResponse");
const { paginate } = require("../utils/index");
const { validateUser } = require("../request/user");
const UserService = require("../services/user");
const InterestService = require('../services/interest');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();

/** 
 * Create User
 * @param {*} req
 * @param {*} res
*/
exports.createUser = async (req, res, next) => {
    try {
        const { error } = validateUser(req.body);
        if (error) return JsonResponse(res, 400, error.details[0].message);

        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);

        let { newUser, otp } = await UserService.create(req.body);
        let body = {
            user: newUser._id,
            interest: req.body.interest
        };
        let interest = await InterestService.create(body);
        JsonResponse(res, 201, MSG_TYPES.CREATED, newUser, otp);
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * get all Users
 * @param {*} req
 * @param {*} res
*/
exports.getAllUser = async (req, res, next) => {
    try {
        const { page, pageSize, skip } = paginate(req);

        const { users, total } = await UserService.getAllUser(skip, pageSize, req.body.filter)

        const meta = {
            total,
            pagination: { pageSize, page }
        }

        JsonResponse(res, 200, MSG_TYPES.FETCHED, users, meta)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * get current user
 * @param {*} req
 * @param {*} res
*/
exports.getMe = async (req, res, next) => {
    try {
        let filter = {
            _id: req.user._id
        };

        const user = await UserService.getUser(filter);

        JsonResponse(res, 200, MSG_TYPES.FETCHED, user)
    } catch (error) {
        console.log({error})
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * get user
 * @param {*} req
 * @param {*} res
*/
exports.getUser = async (req, res, next) => {
    try {
        let filter = {
            _id: req.params.id
        };

        const user = await UserService.getUser(filter)

        JsonResponse(res, 200, MSG_TYPES.FETCHED, user)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * get update user
 * @param {*} req
 * @param {*} res
*/
exports.updateUser = async (req, res) => {
    try {
        const userId = req.user._id

        await UserService.update(userId, req.body);

        return JsonResponse(res, 200, MSG_TYPES.UPDATED);
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * get teminate current user
 * @param {*} req
 * @param {*} res
*/
exports.teminateMe = async (req, res, next) => {
    try {
        const user = await UserService.terminateMe(req.user)

        return JsonResponse(res, 200, MSG_TYPES.DELETED)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}