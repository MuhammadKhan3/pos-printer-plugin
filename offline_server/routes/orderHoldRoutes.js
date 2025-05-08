const express = require('express');

const orderHoldController = require('./../controllers/orderHoldController');

const orderHoldRouter = express.Router();

orderHoldRouter.route('/').get(orderHoldController.getAllOrders);
orderHoldRouter.route('/get').post(orderHoldController.getOrder);
orderHoldRouter.route('/add').post(orderHoldController.addOrder);
orderHoldRouter.route('/merge').post(orderHoldController.mergeOrders);
orderHoldRouter.route('/deleteAllHoldOrders').delete(orderHoldController.deleteAllOrders);
orderHoldRouter.route('/manage_tables').post(orderHoldController.manage_tables);

module.exports = orderHoldRouter;