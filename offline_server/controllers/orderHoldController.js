const sqlite = require('sqlite3');
const path = require('path');
const axios=require('axios')
const db = new sqlite.Database(path.join(__dirname, '..', 'db', 'ApiData.db'));
const proxy_config=require(path.join('..','..','config','proxy.config.json'))['offline_server'];


var add_hold_data_obj = {};

exports.getAllOrders = async(req, res) => {

    console.log("---Request in getAllOrders---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.all(`SELECT * FROM holdOrder`, (err, row) => {
            if(err){
                console.log(err);
            }
            else{
                if(row.length === 0){
                    res.send({
                        massage: "Do not have any data to show!"
                    });
                }
                else{
                    row.forEach(element => {
                        element.holdOrderData = JSON.parse(element.holdOrderData);
                    })
                    res.send(row);
                }
            }
        }); 
        
    }else{
        console.log('...............remote...............');
        
        const body=req.body;
        let data=await axios.get(`${proxy_config.remote_ip}/holdOrder`,body)
        data=await data.data
        res.status(200).json(data);
    }


}


function add_hold_order_data(data){


    return new Promise((resolve, reject) => {

    let sum = 0;
    data.cart_array.forEach(el => {
        sum = el.totalPrice + sum;
    });
   

    manage_tables(data, 'occupied');

    if(data.hold_id === undefined || data.hold_id === '' ){


        let orderNo = makeid(5) + '-' + makeid(5);
 
        var held_date = new Date();
        current_time = tConv24(held_date.getHours() + ':' + held_date.getMinutes());

        data.held_since = current_time;
        data.staff_id = add_hold_data_obj.username;
        data.hold_id = orderNo;
        data.cart_value = sum;

    

    db.run(`INSERT INTO holdOrder (holdNumber, username, businessId, status, holdOrderData, held_since) VALUES (?, ?, ?, ?, ?, ?)`, [orderNo, add_hold_data_obj.username, add_hold_data_obj.business_id, 'hold', JSON.stringify(data), current_time], (err) => {
        if(err){
            console.log(err);
           
        }  

        resolve();
    }); 

}
else{

    db.all(`SELECT * FROM holdOrder WHERE holdNumber = ?`,[data.hold_id], (err_1, row_1) => {

    data.held_since = row_1[0].held_since;

    db.run(`UPDATE holdOrder SET holdOrderData = ? WHERE holdNumber = ?`,[JSON.stringify(data), data.hold_id], (err, row) => {
        if(err){
            console.log(err);
        }

        resolve();

    });


});
}

    });


}


function get_hold_order_data(data){


    return new Promise((resolve, reject) => {

            resolve(data);
        
    });

}

exports.addOrder = async (req, res) => {

    console.log("---Request in addOrder---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');

        add_hold_data_obj = req.body;

        get_hold_order_data(req.body.data).then(row => {
    
            let all_data = row.map(data => {
                return add_hold_order_data(data);
              });
    
              return Promise.all(all_data);
            }).then(hold_data => {
    
                res.send({
                    massage: 'DONE',
                    hold_ids: [0]
                });
    
            });
    
    
            return;
    
    }else{
        console.log('...............remote...............');
        
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/holdOrder/add`,body)
        data=await data.data
        res.status(200).json(data);
    }



}

exports.deleteAllOrders = async (req, res) => {

    console.log("---Request in deleteAllOrders---");

    if(proxy_config.use==='self'){
        console.log('..................self..................')
        db.all(`DELETE FROM holdOrder`, (err, row) => {
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
        let data=await axios.delete(`${proxy_config.remote_ip}/holdOrder/deleteAllHoldOrders`,body)
        data=await data.data
        res.status(200).json(data);
    }
}

exports.getOrder = async (req, res) => {

    console.log("---Request in getOrder---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');

            if(req.body.username === ""|| req.body.username === undefined){
                    db.all(`SELECT * FROM holdOrder WHERE businessId = ?`,[req.body.business_id], (err, row) => {
                    if(err){
                        console.log(err);
                    }
                    else{
                        if(row === undefined){
                            res.send({
                                massage: `Do not have any order with this business_id: ${req.body.business_id}!`
                            });
                        }
                        else{
                            let data = [];
                            row.forEach(element => {
                                element.holdOrderData = JSON.parse(element.holdOrderData);
                                    if(element.status === "hold"){

                                        data.push(element.holdOrderData)

                                        // element.holdOrderData.data.forEach(el => {
                                            // data.push(el);
                                    //     });
                                    }
                                //data.push(element.data);
                            });

                            if(data.length === 0){
                                res.send({
                                    data: [],
                                    hold_orders: 0,
                                    massage : "No orders Found!",
                                    success : false
                                });
                            }
                            else{
                                res.send({
                                    data : data,
                                    hold_orders: data.length,
                                    massage : "order in hold",
                                    success : true
                                });
                            }
                        }
                    }
                }); 
            }
            else{
                db.all(`SELECT * FROM holdOrder WHERE username = ?`,[req.body.username], (err, row) => {
                    if(err){
                        console.log(err);
                    }
                    else{
                        if(row === undefined){
                            res.send({
                                massage: `Do not have any order with this username: ${req.body.username}!`
                            });
                        }
                        else{
                            
                            let data = [];
                            row.forEach(element => {
                                element.holdOrderData = JSON.parse(element.holdOrderData);
                                if(element.status === "hold"){
                                    element.holdOrderData.data.forEach(el => {
                                        data.push(el);
                                    });
                                }
                            });

                            if(data.length === 0){
                                res.send({
                                    data: [],
                                    hold_orders: 0,
                                    massage : "No orders Found!",
                                    success : false
                                });
                            }
                            else{
                                res.send({
                                    data : data,
                                    hold_orders: data.length,
                                    massage : "order in hold",
                                    success : true
                                });
                            }
                        }
                    }
                }); 
            }
    }else{
        console.log('...............remote...............');
    
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/holdOrder/get`,body)
        data=await data.data
        res.status(200).json(data);
    }
}



exports.mergeOrders = async (req, res) => {

    console.log("---Request in mergeOrders---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.all(`SELECT * FROM holdOrder`, (err, row) => {
            if(err){
                console.log(err);
            }
            else{
                if(row.length === 0){
                    res.send({
                        massage: "Do not have any data to show!"
                    });
                }
                else{
                    row.forEach(element => {
                        element.holdOrderData = JSON.parse(element.holdOrderData);
                    })
                    res.send(row);
                }
            }
        }); 
    }else{
        console.log('...............remote...............');
        
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/holdOrder/merge`,body)
        data=await data.data
        res.status(200).json(data);
    }

}



function manage_tables(ord, status){



    if(ord.table_id !== undefined && ord.table_id != ''){

        db.all(`SELECT * FROM metaData WHERE key = ?`, ['rooms'], (err, row) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            else{
                if(row.length > 0){

                    let rooms = JSON.parse(row[0].value);

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


exports.manage_tables = async (req, res) => {
    console.log('...............-----manage_tables-----...............');

    if(proxy_config.use==='self'){
        console.log('...............self...............');

        req = req.body;

        db.all(`SELECT * FROM metaData WHERE key = ?`, ['rooms'], (err, row) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            else{

                    let rooms = JSON.parse(row[0].value);

                    (rooms.dataDump).forEach(function(room){
                     
                            (room.tables).forEach(function(table){
                                if(table.id == req.table_id){
        
                                        table.status = 'vacant';

                                }


                                else if(req.table_id == null){
        
                                    table.status = 'vacant';

                                }


                                else if(req.table_from !== undefined && req.table_to !== undefined){
        
                                    // table.status = 'vacant';

                                }



                            });

                    });

                    db.get(`UPDATE metaData SET value = ? WHERE key = ?`, [JSON.stringify(rooms), 'rooms'], (err, row) => {});


                    res.send({
                        rooms : rooms.dataDump,
                        success : true
                    });

                
            }
        });
    }else{
        console.log('...............remote...............');
        
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/holdOrder/manage_tables`,body)
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