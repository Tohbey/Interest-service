const router = require("express").Router();
const controller = require("../controllers");
const { Auth } = require('../middlewares/auth')

router.post('/', Auth, controller.interest.createInterest)

router.get('/', Auth, controller.interest.getAllInterest)

router.get('/me', Auth, controller.interest.getInterestForUser)

router.get('/:id', Auth, controller.interest.getInterest)

module.exports = router