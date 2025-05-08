const express = require('express');

const metaDataController = require('./../controllers/metaDataController');

const metaDataRouter = express.Router();

metaDataRouter.route('/').get(metaDataController.getAllmetaData);
metaDataRouter.route('/get').post(metaDataController.getmetaData);
metaDataRouter.route('/add').post(metaDataController.addmetaData);
metaDataRouter.route('/delete/:key').delete(metaDataController.deletemetaData);
metaDataRouter.route('/check_connection').get(metaDataController.check_connection);

module.exports = metaDataRouter;
