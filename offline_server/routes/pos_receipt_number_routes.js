const express = require('express');

const pos_receipt_number = require('../controllers/pos_receipt_number_controller');

const pos_receipt_number_router = express.Router();

pos_receipt_number_router.route('/get').post(pos_receipt_number.get_pos_receipt_number);
pos_receipt_number_router.route('/reset').post(pos_receipt_number.reset_pos_receipt_number);

module.exports = pos_receipt_number_router;