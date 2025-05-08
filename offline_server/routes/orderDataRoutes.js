const express = require('express');

const orderController = require('./../controllers/orderController');

const orderRouter = express.Router();

orderRouter.route('/add').post(orderController.addOrder);
orderRouter.route('/').get(orderController.getAllOrders);
orderRouter.route('/get').get(orderController.placeOrder);
orderRouter.route('/statusUpdate').patch(orderController.orderStatusUpdate);
orderRouter.route('/deleteAll').delete(orderController.deleteAllOrders);

module.exports = orderRouter;