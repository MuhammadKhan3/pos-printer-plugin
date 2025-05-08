const express = require('express');

const pos_label = require('../controllers/pos_label_controller');

const pos_label_router = express.Router();

pos_label_router.route('/get').post(pos_label.get_label);
pos_label_router.route('/add').post(pos_label.add_label);
pos_label_router.route('/clear').post(pos_label.clear_label);

module.exports = pos_label_router;