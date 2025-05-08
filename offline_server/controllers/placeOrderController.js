const sqlite = require('sqlite3');
const path = require('path');
const axios=require('axios')
const proxy_config=require(path.join('..','..','config','proxy.config.json'))['offline_server'];
const db = new sqlite.Database(path.join(__dirname, '..', 'db', 'ApiData.db'));


exports.getAllOrders = async (req, res) => {

    console.log("---Request in getOrder---");
    
    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.all(`SELECT * FROM placeOrder WHERE k_id = ? AND status = ?`,[req.body.k_id, 'placed'], (err, row) => {
            if(err){
                console.log(err);
            }
            else{
                if(row.length === 0){
                    res.send({
                        success : false,
                        massage: "Do not have any data to show!"
                    });
                }
                else{
                    let data = [];
                    row.forEach(element => {
                        element.orderData = JSON.parse(element.orderData);
                        if(element.status === 'placed'){
                            element.orderData.hold_id = '';
                            element.orderData.order_number_payex = element.orderNo;
                            data.push(element);
                        }
                    });
    
                    if(data.length === 0){
                        res.send({
                            massage : "No orders Found!",
                            success : false
                        });
                    }
                    else{
                        res.send({
                            data : data,
                            massage : "order placed",
                            success : true
                        });
                    }
                }
            }
        }); 
    }else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/placeOrder`,body)
        data=await data.data
        res.status(200).json(data);
    }
}

exports.addOrder =async (req, res) => {

    console.log("---Request in addOrder---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');

        let orderNo;

        var held_date = new Date();
        current_time = tConv24(held_date.getHours() + ':' + held_date.getMinutes());
    
        let date = held_date.getDay() + "/" + held_date.getMonth() + "/" + held_date.getFullYear();
    
        if(req.body.hold_id === undefined || req.body.hold_id === ""){
            orderNo = makeid(5) + '-' + makeid(5);
        }
        else{
            orderNo = req.body.hold_id;
            db.run(`UPDATE holdOrder SET status = ? WHERE holdNumber = ?`,['placed', req.body.hold_id], (err, row) => {
                if(err){
                    console.log(err);
                }
            });
        }
    
        db.run(`INSERT INTO placeOrder (orderNo, k_id, status, orderData) VALUES (?, ?, ?, ?)`, [orderNo, req.body.k_id, 'placed', JSON.stringify(req.body)], (err) => {
            if(err){
                console.log(err);
                res.send({
                    error : "Can not insert this order.."
                });
            }
            else{
    
                manage_tables(req.body, 'vacant');
    
                res.send({
                    massage: `Order successfully placed`,
                    notifications: [],
                    orderId : orderNo,
                    order_date: date,
                    order_time: current_time,
                    success: true
    
                });
            }   
        }); 
    }else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/placeOrder/add`,body)
        data=await data.data
        res.status(200).json(data);
    }
 
}

exports.deleteAllOrders = async (req, res) => {

    console.log("---Request in deleteAllOrders---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.all(`DELETE FROM placeOrder`, (err, row) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            else{
                res.send({
                    massage: `All Orders deleted`
                });
            }
        });

    }else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.delete(`${proxy_config.remote_ip}/placeOrder/deleteAllOrders`,body)
        data=await data.data
        res.status(200).json(data);
    }
}

exports.completeOrder = async (req, res) => {

    console.log("---Request in completeOrder---");


    //UPDATE orderData SET status = ? WHERE orderNo = ?
    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.run(`UPDATE placeOrder SET status = ? WHERE orderNo = ?`,['expired', req.body.hold_id], (err, row) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            else{
                db.run(`UPDATE holdOrder SET status = ? WHERE holdNumber = ?`,['expired', req.body.hold_id], (err, row) => {
                    if(err){
                        console.log(err);
                        res.send(err);
                    }
                    else{
                        res.send({
                            massage: `OrdersNo ${req.body.hold_id} is completed`
                        });
                    }
                });
            }
        });   

    }else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/placeOrder/complete`,body)
        data=await data.data
        res.status(200).json(data);
    }
}


function manage_tables(ord, status){

    if(ord.table_id !== undefined && ord.table_id != ''){

        db.get(`SELECT * FROM metaData WHERE key = ?`, ['rooms'], (err, row) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            else{
                if(row === undefined){
                 
                }
                else{

                    let rooms = JSON.parse(row.value);

                    (rooms.dataDump).forEach(function(room){

                            (room.tables).forEach(function(table){
                                if(table.id == ord.table_id){
        
                                        table.status = status;

                                }
                            });

                    });

                    db.get(`UPDATE metaData SET value = ? WHERE key = ?`, [JSON.stringify(rooms), 'rooms'], (err, row) => {});

                }
            }
        });

    }

    

}

function makeid(length) {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

 function tConv24(time24) {
    var ts = time24.split(':');
    var H = Number(ts[0]);
    var m = Number(ts[1]);
    var h = (H % 12) || 12;
    h = (h < 10) ? ("0" + h) : h;
    m = (m < 10) ? ("0" + m) : m;
    var ampm = H < 12 ? " AM" : " PM";
    ts = h + ':' + m + ampm;
    return ts;
};