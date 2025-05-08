const express = require('express');

const key_chain_share_controller = require('../controllers/key_chain_share_controller');

const key_chain_share_router = express.Router();

key_chain_share_router.route('/get').post(key_chain_share_controller.get_key_chain);
key_chain_share_router.route('/add').post(key_chain_share_controller.add_key_chain);

module.exports = key_chain_share_router;