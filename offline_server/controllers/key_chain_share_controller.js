const sqlite = require('sqlite3');
const path = require('path');
const axios=require('axios')
const db = new sqlite.Database(path.join(__dirname, '..', 'db', 'ApiData.db'));
const proxy_config=require(path.join(__dirname,'..','..','config','proxy.config.json'))['offline_server'];


var now = new Date();

exports.add_key_chain = async (req, res) => {

    console.log("---Request in add_key_chain---", req.body);

    if(proxy_config.use==='self'){
        console.log('................. self .................')
        db.run('INSERT INTO key_chain_queue (raw_data, k_id) VALUES (?, ?)', [JSON.stringify(req.body.data), req.body.k_id], (err) => {

            res.send({'status': true});
        }); 
    }else{
        console.log('...............remote...............');
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/key_chain_share/add`,body)
        data=await data.data
        res.status(200).json(data);
    }

}


exports.get_key_chain = async (req, res) => {

    console.log("---Request in get_key_chain---");

    if(proxy_config.use==='self'){        
        console.log('...............self...............');

        db.all('SELECT * FROM key_chain_queue WHERE k_id = ? ORDER BY id DESC LIMIT 1 OFFSET 0', [req.body.k_id], (err, row) => {
    
            if(err){
                res.send({'status': false, 'data': {}});
            }
            else{
                if(row.length > 0){   
    
                        res.send({'status': true, 'data': JSON.parse(row[0].raw_data)});
    
                        //db.all(`DELETE FROM key_chain_queue WHERE id = ?`, [row[0].id], (err, row) => {}); 
                    
                }
                else{
                    res.send({'status': false, 'data': {}});
                }
            }
        }); 
    }else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/key_chain_share/get`,body)
        data=await data.data
        res.status(200).json(data);
    }

}
