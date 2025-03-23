var express = require('express');
var router = express.Router();
let userController = require('../controllers/users');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let constants = require('../utils/constants');

router.get('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res, next) {
    try {
        let users = await userController.GetAllUser();
        CreateSuccessRes(res, 200, users);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', check_authentication, async function (req, res, next) {
    try {
        if (req.user._id.toString() === req.params.id || constants.MOD_PERMISSION.includes(req.user.role.name)) {
            let user = await userController.GetUserById(req.params.id);
            CreateSuccessRes(res, 200, user);
        } else {
            throw new Error("Bạn không có quyền truy cập thông tin này");
        }
    } catch (error) {
        CreateErrorRes(res, 403, error.message);
    }
});

router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        let body = req.body;
        let newUser = await userController.CreateAnUser(body.username, body.password, body.email, body.role);
        CreateSuccessRes(res, 200, newUser);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        let updateUser = await userController.UpdateUser(req.params.id, req.body);
        CreateSuccessRes(res, 200, updateUser);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        let deleteUser = await userController.DeleteUser(req.params.id);
        CreateSuccessRes(res, 200, deleteUser);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
