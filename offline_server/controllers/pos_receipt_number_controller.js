const sqlite = require('sqlite3');
const path = require('path');
const db = new sqlite.Database(path.join(__dirname, '..', 'db', 'ApiData.db'));
const axios=require('axios')
const proxy_config=require(path.join('..','..','config','proxy.config.json'))['offline_server'];

exports.get_pos_receipt_number = async (req, res) => {

    console.log("---Request in get_pos_receipt_number---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.all('SELECT * FROM pos_receipt_number ORDER BY id DESC LIMIT 1 OFFSET 0', (err, row) => {
            if(err){
                console.log(err);
            }
            else{
                if(row.length === 0){

                    db.run('INSERT INTO pos_receipt_number (receipt_number) VALUES (1)', (err) => {}); 

                    res.send({receipt_number: 1});
                }
                else{

                    row[0].receipt_number = (Number(row[0].receipt_number) + 1);

                    db.run('INSERT INTO pos_receipt_number (receipt_number) VALUES ('+row[0].receipt_number+')', (err) => {}); 

                    setTimeout(()=>{
                        res.send({receipt_number: row[0].receipt_number});
                    }, 500);
                    
                }
            }
        });

    }
    else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/pos_receipt_number/get`,body)
        data=await data.data
        res.status(200).json(data);
    }
}


exports.reset_pos_receipt_number =async (req, res) => {

    console.log("---Request in reset_pos_receipt_number---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.run('INSERT INTO pos_receipt_number (receipt_number) VALUES (0)', (err) => {}); 

        res.send({receipt_number: 0});
    
    }else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/pos_receipt_number/reset`,body)
        data=await data.data
        res.status(200).json(data);
    }

 
}