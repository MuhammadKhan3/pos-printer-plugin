const bodyParser = require('body-parser');

var cors = require('cors');
const express = require('express');
const path = require('path');

var https = require('https');
var fs = require('fs');

var options = {
    key: fs.readFileSync(path.join(__dirname, '../config/ssl/', '', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../config/ssl/', '', 'cert.pem')),
};



const app = express(); 
app.use(cors());
app.use(express.json({limit: '100mb'}));

const loginRouter = require('./routes/loginDataRoutes');
const metaDataRouter = require('./routes/metaDataRoutes');
const orderDataRouter = require('./routes/orderDataRoutes');
const orderHoldRouter = require('./routes/orderHoldRoutes');
const orderPlaceRouter = require('./routes/placeOrderRoutes');
const pos_receipt_number_router = require('./routes/pos_receipt_number_routes');
const pos_label_router = require('./routes/pos_label_routes');
const key_chain_share_router = require('./routes/key_chain_share_routes');

app.disable('etag');

app.use('/logins', loginRouter);
app.use('/metaData', metaDataRouter);
app.use('/order', orderDataRouter);
app.use('/holdOrder', orderHoldRouter);
app.use('/placeOrder', orderPlaceRouter);
app.use('/pos_receipt_number', pos_receipt_number_router);
app.use('/pos_label', pos_label_router);
app.use('/key_chain_share', key_chain_share_router);
app.use('/pos', express.static(path.join(__dirname, './pos', '', '')));
app.use('/customers', express.static(path.join(__dirname, './customers', '', '')));



https.createServer(options, app).listen(6971, '0.0.0.0');
app.listen(6970);
console.log('Printing Server started on port: 6970');



