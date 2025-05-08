const sqlite = require('sqlite3');
const path = require('path');
const axios=require('axios')
const db = new sqlite.Database(path.join(__dirname, '..', 'db', 'ApiData.db'));
const proxy_config=require(path.join(__dirname,'..','..','config','proxy.config.json'))['offline_server'];
console.log(proxy_config)


exports.getAllLogins = async (req, res) => {

    console.log("---Request in getAllLogins---");
    if(proxy_config.use==='self'){
        console.log('................self....................');

        db.all(`SELECT * FROM logins`, (err, row) => {
            if(err){
                console.log(err);
            }
            else{
                if(row.length === 0){
                    res.send({
                        success: false,
                        massage: "Do not have any data to show!"
                    });
                }
                else{
                    row.forEach(element => {
                        element.apiData = JSON.parse(element.apiData);
                    });
                    res.send({
                        success: true,
                        data : row
                    });
                }
            }
        }); 
    }else{
        console.log('............remote............')
        const body=req.body;
        let data=await axios.get(`${proxy_config.remote_ip}/logins`,body)
        data=await data.data
        res.status(200).json(data);
    }

}

exports.getLogin = async (req, res) => {

    console.log("---Request in getLogin---");
    if(proxy_config.use==='self'){
        console.log('............self............')
        db.get(`SELECT * FROM logins WHERE username = ?`, [req.params.username], (err, row) => {
            if(err){
                console.log(err);
                res.send({
                    success: false,
                    error : err
                });
            }
            else{
                if(row === undefined){
                    res.send({
                        success: false,
                        massage: "Username not found..."
                    });
                }
                else{
                    res.send({
                        success: true,
                        data : {
                            username : row.username,
                            password : row.password,
                            apiData : JSON.parse(row.apiData)  
                        }  
                    });
                }
            }
        }); 
    }else{

        console.log('............remote............')
        const body=req.body;
        const {username}=req.params;
        let data=await axios.get(`${proxy_config.remote_ip}/logins/${username}`,body)
        data=await data.data
        res.status(200).json(data);
    }

}

exports.addLoginData = async (req, res) => {

    console.log("---Request in addLoginData---");
    if(proxy_config.use==='self'){
        console.log('............self............')

        if(req.body.password === 'undefined' || req.body.username === 'undefined'){
            res.send("Username or Password is UNDEFINED!");
        }
        else{
            db.all(`SELECT * FROM logins WHERE username = ?`,[req.body.username], (err, row) => {
                if(err){
                    console.log(err);
                }
                else{
                    if(row.length === 0){
                        db.run(`INSERT INTO logins (username, password, apiData) VALUES (? , ? , ?)`, [req.body.username, req.body.password, JSON.stringify(req.body)], (err) => {
                            if(err){
                                console.log(err);
                                res.send({
                                    success: false,
                                    error : "Can not insert this record.."
                                });
                            }
                            else{
                                res.send({
                                success: true,
                                massage: `New record added...`,
                                data: req.body
                                });
                            }   
                        });   
                    }
                    else{
                        db.run(`UPDATE logins SET username = ?, password = ?, apiData = ? WHERE username = ?`, [req.body.username, req.body.password, JSON.stringify(req.body), req.body.username], (err) => {
                            if(err){
                                console.log(err);
                                res.send({
                                    success: false,
                                    error: err
                                });
                            }
                            else{
                                res.send({
                                    massage: `The login with username : ${req.body.username} is Updated`,
                                    success: true,
                                    UpdatedLogin: req.body
                                });
                            }
                        });
                    }
                }
            });
        }
    }else{
        console.log('............remote............')
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/logins/add`,body)
        data=await data.data
        res.status(200).json(data);
    }

}

exports.deleteLogin = async (req, res) => {

    console.log("---Request in deleteLogin---");

    if(proxy_config.use==='self'){
        console.log('............self............')

        db.all(`DELETE FROM logins WHERE username = ?`, [req.params.username], (err, row) => {
            if(err){
                console.log(err);
                res.send({
                    success: false,
                    error: err
                });
            }
            else{
                res.send({
                    success: true,
                    massage: `The login with username : ${req.params.username} is deleted`
                });
            }
        });
    }else{
        console.log('............remote............')
        const body=req.body;
        const {username}=req.params
        let data=await axios.delete(`${proxy_config.remote_ip}/logins/delete/${username}`,body)
        data=await data.data
        res.status(200).json(data);
    }
}

exports.authenticationLogin  = async (req, res) => {

    console.log("---Request in authenticationLogin---");

    if(proxy_config.use==='self'){
        console.log('............self............')

        db.all(`SELECT * FROM logins WHERE username = ? AND password = ?`,[req.body.username, req.body.password], (err, row) => {
            if(err){
                console.log(err);
            }
            else{
                if(row.length === 0){
                    res.send({
                        success: false,
                        massage: "Invalid Username or Password..."
                    });
                }
                else{
                    res.send({
                        success: true,
                        massage : "login successfully!",
                        data : {
                            username : row[0].username,
                            password : row[0].password,
                            apiData : JSON.parse(row[0].apiData)
                        }
                        
                    });
                }
            }
        });  
    }else{
        console.log('............remote............')
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/logins/authentication`,body)
        data=await data.data
        res.status(200).json(data);
    }
}


