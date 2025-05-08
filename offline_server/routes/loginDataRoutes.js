const express = require('express');

const loginController = require('./../controllers/loginController');

const loginRouter = express.Router();

loginRouter.route('/').get(loginController.getAllLogins);
loginRouter.route('/:username').get(loginController.getLogin);
loginRouter.route('/add').post(loginController.addLoginData);
loginRouter.route('/delete/:username').delete(loginController.deleteLogin);
loginRouter.route('/authentication').post(loginController.authenticationLogin);

module.exports = loginRouter;