const sqlite = require('sqlite3');
const path = require('path');
const axios=require('axios')
const proxy_config=require(path.join('..','..','config','proxy.config.json'))['offline_server'];
const db = new sqlite.Database(path.join(__dirname, '..', 'db', 'ApiData.db'));
console.log(proxy_config)

exports.getAllOrders =async (req, res) => {

    console.log("---Request in getAllOrders---");
    
    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.all(`SELECT * FROM orderData`, (err, row) => {
            if(err){
                console.log(err);
            }
            else{
                if(row.length === 0){
                    res.send({
                        error: "Do not have any data to show!"
                    });
                }
                else{
                    row.forEach(element => {
                        element.data = JSON.parse(element.data);
                    })
                    res.send(row);
                }
            }
        }); 
    
    }else{
        console.log('...............remote...............');
        const body=req.body;
        let data=await axios.get(`${proxy_config.remote_ip}/order`,body)
        data=await data.data
        res.status(200).json(data);
    }

}

exports.addOrder = async (req, res) => {

    console.log("---Request in addOrder---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');

        let orderNo = makeid(5) + '-' + makeid(5);
        var date = new Date(Date.now());
        date = date.toString();
    
        db.run(`INSERT INTO orderData (orderNo, time, terminalId, status, data) VALUES (?, ?, ?, ?, ?)`, [orderNo, date, req.body.terminalId, 'pending', JSON.stringify(req.body)], (err) => {
            if(err){
                console.log(err);
                res.send({
                    error : "Can not insert this order.."
                });
            }
            else{
                res.send({
                    massage: `New order added OrderNO: ${orderNo}`
                });
            }   
        }); 

    }else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/order/add`,body)
        data=await data.data
        res.status(200).json(data);
    }
}

exports.placeOrder = async(req, res) => {

    console.log("---Request in placeOrder---");
    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.all(`SELECT * FROM orderData`, (err, row) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            else{
                if(row.length === 0){
                    res.send({
                        error: "No more Orders in Queue..."
                    });
                }
                else{
                    let check = false;
                    let placedOrderIndex;
                    for(let i=0;i<row.length;i++){
                        if(row[i].status === 'pending'){
                            check = true;
                            db.run(`UPDATE orderData SET status = ? WHERE id = ?`, ['hold', row[i].id], (err, row1) => {
                                if(err){
                                    console.log(err);
                                    res.send(err);
                                }
                            });
                            placedOrderIndex = i;
                            i = row.length;
                        }
                    }
                    
                    if(check){
                        res.send({
                            massage : `OrderNo : ${row[placedOrderIndex].orderNo} is on hold now!`,
                        });
                    }
                    else{
                        res.send({
                            massage : 'No more orders panding...'
                        })
                    }
                }
            }
        }); 

    }else{
        console.log('...............remote...............');
        const body=req.body;
        let data=await axios.get(`${proxy_config.remote_ip}/order/get`,body)
        data=await data.data
        res.status(200).json(data);
    }

}

exports.orderStatusUpdate =async (req, res) => {

    console.log("---Request in orderStatusUpdate---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.run(`UPDATE orderData SET status = ? WHERE orderNo = ?`, [req.body.status, req.body.orderNo], (err) => {
            if(err){
                res.send(err);
            }
            else{
                res.send({
                    massage : `OrderNo : ${req.body.orderNo} status is ${req.body.status} `,
                });
            }
        });

    }else{
        console.log('...............remote...............');
        const body=req.body;
        let data=await axios.patch(`${proxy_config.remote_ip}/order/statusUpdate`,body)
        data=await data.data
        res.status(200).json(data);
    }


}

exports.deleteAllOrders =  async(req, res) => {

    console.log("---Request in deleteAllOrders---");
    if(proxy_config.use==='self'){
        console.log('..............self...............');

        db.all(`DELETE FROM orderData`, (err, row) => {
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
        let data=await axios.delete(`${proxy_config.remote_ip}/order/deleteAll`,body)
        data=await data.data
        res.status(200).json(data);
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