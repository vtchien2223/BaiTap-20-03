var express = require('express');
var router = express.Router();
let productModel = require('../schemas/product');
let CategoryModel = require('../schemas/category');
let { check_authentication, check_authorization } = require('../utils/check_auth');
let constants = require('../utils/constants');

function buildQuery(obj) {
    let result = {};
    if (obj.name) {
        result.name = new RegExp(obj.name, 'i');
    }
    result.price = { $gte: 0, $lte: 10000 };
    if (obj.price) {
        if (obj.price.$gte) result.price.$gte = obj.price.$gte;
        if (obj.price.$lte) result.price.$lte = obj.price.$lte;
    }
    return result;
}

router.get('/', async function (req, res) {
    let products = await productModel.find(buildQuery(req.query)).populate("category");
    res.status(200).send({ success: true, data: products });
});

router.get('/:id', async function (req, res) {
    try {
        let product = await productModel.findById(req.params.id);
        if (!product) throw new Error("Không tìm thấy sản phẩm");
        res.status(200).send({ success: true, data: product });
    } catch (error) {
        res.status(404).send({ success: false, message: error.message });
    }
});

router.post('/', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res) {
    try {
        let cate = await CategoryModel.findOne({ name: req.body.category });
        if (!cate) throw new Error("Danh mục không hợp lệ");
        
        let newProduct = new productModel({
            name: req.body.name,
            price: req.body.price,
            quantity: req.body.quantity,
            category: cate._id
        });
        await newProduct.save();
        res.status(200).send({ success: true, data: newProduct });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

router.put('/:id', check_authentication, check_authorization(constants.MOD_PERMISSION), async function (req, res) {
    try {
        let updateObj = {};
        let body = req.body;
        if (body.name) updateObj.name = body.name;
        if (body.price) updateObj.price = body.price;
        if (body.quantity) updateObj.quantity = body.quantity;
        if (body.category) {
            let cate = await CategoryModel.findOne({ name: req.body.category });
            if (!cate) throw new Error("Danh mục không hợp lệ");
            updateObj.category = cate._id;
        }
        
        let updatedProduct = await productModel.findByIdAndUpdate(req.params.id, updateObj, { new: true });
        if (!updatedProduct) throw new Error("Không tìm thấy sản phẩm");
        res.status(200).send({ success: true, data: updatedProduct });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

router.delete('/:id', check_authentication, check_authorization(constants.ADMIN_PERMISSION), async function (req, res) {
    try {
        let product = await productModel.findById(req.params.id);
        if (!product) throw new Error("Không tìm thấy sản phẩm");
        
        let deletedProduct = await productModel.findByIdAndUpdate(req.params.id, { isDeleted: true }, { new: true });
        res.status(200).send({ success: true, data: deletedProduct });
    } catch (error) {
        res.status(400).send({ success: false, message: error.message });
    }
});

module.exports = router;
