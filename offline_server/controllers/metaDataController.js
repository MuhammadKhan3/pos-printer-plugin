const sqlite = require('sqlite3');
const path = require('path');
const axios=require('axios')
const db = new sqlite.Database(path.join(__dirname, '..', 'db', 'ApiData.db'));
const proxy_config=require(path.join(__dirname,'..','..','config','proxy.config.json'))['offline_server'];

exports.getAllmetaData = async (req, res) => {

    console.log("---Request in getAllmetaData---");

    if(proxy_config.use==='self'){
        console.log('...............self...............')

        db.all(`SELECT * FROM metaData`, (err, row) => {
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
                        element.value = JSON.parse(element.value);
                    })
                    res.send(row);
                }
            }
        }); 

    }else{
        console.log('...............remote...............')
        const body=req.body;
        let data=await axios.get(`${proxy_config.remote_ip}/metaData`,body)
        data=await data.data
        res.status(200).json(data);
    }

}

exports.getmetaData = async (req, res) => {

    console.log("---Request in getmetaData---");

    if(proxy_config.use==='self'){
        console.log('...............self...............');
        
        db.get(`SELECT * FROM metaData WHERE key = ? AND business_id = ?`, [req.body.key, req.body.business_id], (err, row) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            else{
                if(row === undefined){
                    res.send({
                        error: "key not found..."
                    });
                }
                else{
                    res.send(JSON.parse(row.value));
                }
            }
        }); 
    
    }else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/metaData/get`,body)
        data=await data.data
        res.status(200).json(data);
        
    }

}

exports.addmetaData = async (req, res) => {

    console.log("---Request in addmetaData---");
    
    if(proxy_config.use==='self'){
        console.log('...............self...............');

        db.all(`SELECT * FROM metaData WHERE key = ?`,[req.body.key], (err, row) => {
            if(err){
                console.log(err);
            }
            else{
                if(row.length === 0){
                    db.run(`INSERT INTO metaData (key, business_id, value) VALUES (?, ?, ?)`, [req.body.key, req.body.business_id, JSON.stringify(req.body)], (err) => {
                        if(err){
                            console.log(err);
                            res.send({
                                error : "Can not insert this record.."
                            });
                        }
                        else{
                            res.send(req.body);
                        }   
                    }); 
                }
                else{
                    db.run(`UPDATE metaData SET key = ?, business_id = ?, value = ? WHERE key = ?`,[req.body.key, req.body.business_id, JSON.stringify(req.body), req.body.key], (err) => {
                        if(err){
                            console.log(err);
                            res.send(err);
                        }
                        else{
                            res.send(req.body);
                        }
                    });
                }
            }
        });  
    
    }else{
        console.log('...............remote...............');

        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/metaData/add`,body)
        data=await data.data
        res.status(200).json(data);
    }
}

exports.deletemetaData = async (req, res) => {

    console.log("---Request in deletemetaData---");
    if(proxy_config.use==='self'){

        console.log('...............self...............');
        db.all(`DELETE FROM metaData WHERE key = ?`, [req.params.key], (err, row) => {
            if(err){
                console.log(err);
                res.send(err);
            }
            else{
                res.send({
                    massage: `The metaData with key : ${req.params.key} is deleted`
                });
            }
        });
    }else{
        console.log('...............remote...............');
        const body=req.body;
        const {key}=req.params;
        let data=await axios.delete(`${proxy_config.remote_ip}/metaData/delete/${key}`,body)
        data=await data.data
        res.status(200).json(data);
    }
}

exports.check_connection = async (req, res) => {

    console.log("---Request in check_connection---");
    if(proxy_config.use==='self'){
        console.log('...............self.................')
        res.status(200).send({
            status: true,
            message: `Connection is active`
        });
    }else{
        console.log('...............remote...............');
        const body=req.body;
        const {key}=req.params;
        let data=await axios.get(`${proxy_config.remote_ip}/metaData/check_connection`,body)
        data=await data.data
        res.status(200).json(data);
    }
}