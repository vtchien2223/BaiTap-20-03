var express = require('express');
var router = express.Router();
let roleController = require('../controllers/roles');
var { CreateSuccessRes, CreateErrorRes } = require('../utils/ResHandler');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let constants = require('../utils/constants');

router.get('/', async function (req, res, next) {
    let roles = await roleController.GetAllRole();
    CreateSuccessRes(res, 200, roles);
});

router.get('/:id', async function (req, res, next) {
    try {
        let role = await roleController.GetRoleById(req.params.id);
        CreateSuccessRes(res, 200, role);
    } catch (error) {
        next(error);
    }
});

router.post('/', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        let newRole = await roleController.CreateRole(req.body.name);
        CreateSuccessRes(res, 200, newRole);
    } catch (error) {
        next(error);
    }
});

router.put('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        let updatedRole = await roleController.UpdateRole(req.params.id, req.body.name);
        CreateSuccessRes(res, 200, updatedRole);
    } catch (error) {
        next(error);
    }
});

router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res, next) {
    try {
        let deletedRole = await roleController.DeleteRole(req.params.id);
        CreateSuccessRes(res, 200, deletedRole);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
