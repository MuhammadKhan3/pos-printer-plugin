const sqlite = require('sqlite3');
const path = require('path');
const axios=require('axios')
const db = new sqlite.Database(path.join(__dirname, '..', 'db', 'ApiData.db'));
const proxy_config=require(path.join(__dirname,'..','..','config','proxy.config.json'))['offline_server'];

var now = new Date();

exports.add_label = async (req, res) => {

    console.log("---Request in add_label---");
    
    if(proxy_config.use==='self'){
        console.log('...............self...............');
        
        var label_id = '9999' + Math.floor(100000 + Math.random() * 900000);

        db.run('INSERT INTO labels (label_id, raw_data, TIMESTAMP) VALUES (?,?,?)', [label_id, JSON.stringify(req.body.raw_data), req.body.TIMESTAMP], (err) => {
    
            res.send({label_id: label_id});
    
        }); 
    }else{
        console.log('...............remote...............');
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/pos_label/add`,body)
        data=await data.data
        res.status(200).json(data);
    }


}


exports.get_label = async (req, res) => {

    console.log("---Request in get_label---");
    if(proxy_config.use==='self'){
        console.log('...............self...............');
        db.all('SELECT * FROM labels WHERE label_id = "'+req.body.label_id+'" LIMIT 1 OFFSET 0', (err, row) => {

            if(err){
                res.send({'status': false, 'data': {}, 'label_id': 0});
            }
            else{
                if(row.length > 0){   
    
                        res.send({'status': true, 'data': JSON.parse(row[0].raw_data), 'label_id': row[0].label_id});
                    
                }
                else{
                    res.send({'status': false, 'data': {}, 'label_id': 0});
                }
            }
    
        });
    }else{

        console.log('...............remote...............');
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/pos_label/get`,body)
        data=await data.data
        res.status(200).json(data);
    }

 

}


exports.clear_label = async(req, res) => {

    console.log("---Request in clear_label---");
    if(proxy_config.use==='self'){
        var label_id;


        (req.body.data).forEach(function(item){

            if(item.sku != undefined && item.sku != null && item.sku != ''){
                console.log(item?.sku)
                db.run('DELETE FROM labels WHERE label_id = ?', [item.sku], (err) => {});
            }
            
        });
        

        


        res.send({status: true});


    }else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/pos_label/clear`,body)
        data=await data.data
        res.status(200).json(data);
    }
}