const AuthService = require('../services/auth');
const { MSG_TYPES } = require('../constant/types');
const { validateVerifyUser, validateLogin, validateResendOTP, validateResetPassword, validatePasswordChange } = require('../request/user');
const { JsonResponse } = require('../lib/apiResponse');
const UserService = require('../services/user');

/** 
 * Login
 * @param {*} req
 * @param {*} res
*/
exports.login = async(req, res, next) => {
    try{   
        const { error } = validateLogin(req.body)
        if(error) return JsonResponse(res, 400, error.details[0].message)

        let token = await AuthService.login(req.body)
        res.header('x-auth-token', token)
        JsonResponse(res,200,MSG_TYPES.LOGGED_IN,token)
    }catch(error){
        console.log({error})
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}


/** 
 * Verify User
 * @param {*} req
 * @param {*} res
*/
exports.verify = async (req, res, next) => {
    try {
        const { error } = validateVerifyUser(req.body)
        if(error) return JsonResponse(res, 400, error.details[0].message)
        console.log(req.body)

        const {user, token}  = await AuthService.verifyUser(req.body)
        res.header("x-auth-token",token)

        JsonResponse(res, 200, MSG_TYPES.ACCOUNT_VERIFIED,token)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * Resend OTP
 * @param {*} req
 * @param {*} res
*/
exports.resendOtp = async (req, res, next) => {
    try {
        const { error } = validateResendOTP(req.body)
        if(error) return JsonResponse(res, 400, error.details[0].message)

        const {user, otp} = await AuthService.resendOtp(req.body.email)
        JsonResponse(res, 200, MSG_TYPES.UPDATED,user,otp)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * Change Password
 * @param {*} req
 * @param {*} res
*/
exports.passwordChange = async (req, res, next) => {
    try {
        const { error } = validatePasswordChange(req.body)
        if(error) return JsonResponse(res, 400, error.details[0].message)

        const { user } = await AuthService.updatedPassword(req.user,req.body)
        JsonResponse(res, 200, MSG_TYPES.UPDATED, user)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * Recover Password
 * @param {*} req
 * @param {*} res
*/
exports.recover = async (req, res, next) => {
    try {
        const {updateUser} =  await AuthService.recover(req.body.emailPhoneNumber);
        
        return JsonResponse(res, 200, MSG_TYPES.SENT, updateUser)
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}

/** 
 * Reset Password
 * @param {*} req
 * @param {*} res
*/
exports.resetPassword = async(req, res, next) => {
    try {
        const { error } = validateResetPassword(req.body)
        if(error) return JsonResponse(res, 400, error.details[0].message)

        let filter = {
            "passwordRetrive.resetPasswordToken":req.body.token,
            "passwordRetrive.resetPasswordExpires": {$get: new Date()}
        }
        const user = await UserService.getUser(filter);
        if (!user) {
            JsonResponse(res, 401, 'Password otp is invalid');
        }

        const salt = await bcrypt.genSalt(10)
        req.body.password = await bcrypt.hash(req.body.password, salt)
        
        await AuthService.resetPassword(user, req.body.password)

        JsonResponse(res, 200, MSG_TYPES.UPDATED);
    } catch (error) {
        JsonResponse(res, error.statusCode, error.msg)
        next(error)
    }
}