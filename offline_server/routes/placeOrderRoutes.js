const express = require('express');

const placeOrderController = require('./../controllers/placeOrderController');

const orderPlaceRouter = express.Router();

orderPlaceRouter.route('/').post(placeOrderController.getAllOrders);
orderPlaceRouter.route('/complete').post(placeOrderController.completeOrder);
orderPlaceRouter.route('/add').post(placeOrderController.addOrder);
orderPlaceRouter.route('/deleteAllOrders').delete(placeOrderController.deleteAllOrders);

module.exports = orderPlaceRouter;