var https = require('https');
var fs = require('fs');
var path = require('path');
const kds_controller=require('./controllers/kds_controller');

const cors = require('cors');
var express =require('express');
const { add_kds_order_validation, get_kds_order_validation, udpate_kds_order_validation } = require('./validations');
var app = express();
const kds_router=express.Router();

var options = {
    key: fs.readFileSync(path.join(__dirname, '../config/ssl/', '', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../config/ssl/', '', 'cert.pem')),
};


app.use(express.json({limit: '100mb'}));

app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

console.log('....running kds orders.....')



app.use('/kds',kds_router)
kds_router.route('/insert_orders').post(add_kds_order_validation,kds_controller.add_kds_order)
kds_router.route('/get_orders').post(get_kds_order_validation,kds_controller.get_kds_order)
kds_router.route('/update_orders').put(udpate_kds_order_validation,kds_controller.update_kds_order_status)
kds_router.route('/delete_orders').delete(kds_controller.delete_orders);
kds_router.route('/clear_orders').post(kds_controller.clear_orders);



https.createServer(options, app).listen(6987, '0.0.0.0');
app.listen(6988);