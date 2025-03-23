var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');
let { check_authentication } = require('../utils/check_auth');
let bcrypt = require('bcrypt');

router.post('/login', async function (req, res, next) {
    try {
        let body = req.body;
        let result = await userController.Login(body.username, body.password);
        let token = jwt.sign({ id: result._id, expire: new Date(Date.now() + 24 * 3600 * 1000) }, constants.SECRET_KEY);
        CreateSuccessRes(res, 200, token);
    } catch (error) {
        next(error);
    }
});

router.post('/signup', async function (req, res, next) {
    try {
        let body = req.body;
        let result = await userController.CreateAnUser(body.username, body.password, body.email, 'user');
        let token = jwt.sign({ id: result._id, expire: new Date(Date.now() + 24 * 3600 * 1000) }, constants.SECRET_KEY);
        CreateSuccessRes(res, 200, token);
    } catch (error) {
        next(error);
    }
});

router.get("/me", check_authentication, async function (req, res, next) {
    CreateSuccessRes(res, 200, req.user);
});

router.post('/changepassword', check_authentication, async function (req, res, next) {
    try {
        let body = req.body;
        if (bcrypt.compareSync(body.oldpassword, req.user.password)) {
            req.user.password = body.newpassword;
            await req.user.save();
            CreateSuccessRes(res, 200, req.user);
        } else {
            throw new Error("Mật khẩu cũ không đúng");
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
