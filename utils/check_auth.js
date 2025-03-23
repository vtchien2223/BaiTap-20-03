let jwt = require('jsonwebtoken');
let constants = require('../utils/constants');
let userController = require('../controllers/users');

module.exports = {
    check_authentication: async function (req, res, next) {
        try {
            if (!req.headers || !req.headers.authorization) {
                return res.status(401).json({ message: "Bạn chưa đăng nhập" });
            }

            let authorization = req.headers.authorization;
            if (authorization.startsWith("Bearer")) {
                let token = authorization.split(" ")[1];
                let result = jwt.verify(token, constants.SECRET_KEY);
                if (result) {
                    let id = result.id;
                    let user = await userController.GetUserById(id);
                    if (!user) {
                        return res.status(401).json({ message: "Tài khoản không tồn tại" });
                    }
                    req.user = user;
                    return next();
                }
            }
            return res.status(401).json({ message: "Token không hợp lệ" });
        } catch (error) {
            return res.status(401).json({ message: "Xác thực thất bại" });
        }
    },

    check_authorization: function (requiredRole) {
        return function (req, res, next) {
            if (!req.user) {
                return res.status(403).json({ message: "Bạn không có quyền" });
            }

            let role = req.user.role.name;
            if (requiredRole.includes(role)) {
                return next();
            }
            return res.status(403).json({ message: "Bạn không có quyền" });
        };
    }
};
