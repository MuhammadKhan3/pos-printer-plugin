
var current_scale_reading_active = false;
var gross_val = '0.00';

var https = require('https');
var fs = require('fs');
var path = require('path');
var axios=require('axios')
var proxy_config=require(path.join(__dirname,'..','config','proxy.config.json'))['weight'];


var options = {
    key: fs.readFileSync(path.join(__dirname, '../config/ssl/', '', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../config/ssl/', '', 'cert.pem')),
};


var express = require('express'); 
const cors = require('cors');
var app = express();
app.use(express.json());

app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
var portServer = process.env.PORT || 6965; 


var router = express.Router(); 

router.post('/',async function (req, res) {


        // res.json({ weight: '100.67', status: true });
    
    
     console.log('...............weight api .................')
     if(proxy_config.use==='self'){
        console.log('............self............')

        if(current_scale_reading_active == false){

                current_scale_reading_active = true;

                gross_val = '0.00';

                if(req.body.zero == false){

                        start_serial_connection({command: 'W'});

                        setTimeout(function(){
                                        
                                console.log('Received weight: ', gross_val);
                                
                                res.json({ weight: gross_val, status: true });

                                //      res.json({ weight: '3.67', status: true });

                                current_scale_reading_active = false;
                                        
                                }, 800);

                }else{
                        res.json({ weight: '0.00', status: true });
                

                }

        }


        if(req.body.zero == true){
                process.exit();     
        }
     }else{
        console.log('............remote............')
        const body=req.body;
        let data=await axios.post(`${proxy_config.remote_ip}/weight_api`,body)
        data=await data.data
        res.status(200).json(data);
     }


});

app.use('/weight_api', router);

https.createServer(options, app).listen(6966, '0.0.0.0');
app.listen(6965);
console.log('All good!\nPort:' + portServer); 





var gather_chars = '';
var gather_chars_flag = false;
var gather_chars_counter = 0;

var read_str = '';

var selected_port = '';
const weight_config = require('../config/weight_config.json');

const {SerialPort} = require('serialport');

var com;

var is_connected = false;

var global_selected_port;

function start_serial_connection(req){


        SerialPort.list().then(function(ports){

                console.log('SEARCHING PORT ...', ports);

                ports.forEach(function(port){
        

        
        
 if(port.manufacturer == weight_config.manufacturer && port.vendorId == weight_config.vendorId && port.productId == weight_config.productId){ 

        global_selected_port = port;
                 
                selected_port = port.path;
        
        console.log('SELECTED PORT: ', selected_port);


 if(selected_port != '' && is_connected == false){ 
         
        is_connected = true;
        

        try{

       

        // selected_port = 'COM2';

com = new SerialPort({
        path: selected_port,
        baudRate: 9600,
        databits: 7,
        parity: 'even',
        stopBits: 1
});




console.log('Port '+selected_port+' Connected');

setTimeout(function(){
        writeData(req); 
}, 200);




}catch(e){

        console.log('Port closed 1', e);
        is_connected = false;
        selected_port = '';
        process.exit();

}

 }


}
        
});
});


}


function start_reading(){

        try{

com.on('readable', function () {

      

                read_str = com.read().toString('ascii');

                console.log('--> ' + read_str);
                
                read_str = read_str.replace(/(\r|\n|\r|\t|\s)/gm, "");


        if (gather_chars_flag) {
                gatherStream(read_str);

                gather_chars_counter++;

                var resp_counter = 2;

                if(global_selected_port.manufacturer == 'Prolific'){
                        resp_counter = 15
                }

                if (gather_chars_counter > resp_counter) {
                        gather_chars_counter = 0;
                        gather_chars_flag = false;

                        gather_chars += 'END:';
                        parseStream(gather_chars);
                        gather_chars = '';
                }
        }

});


}catch(e){

        console.log('Port closed 2');
        is_connected = false;
        selected_port = '';
        process.exit();

}

}

function writeData(req) {

        // process.exit();

        // while (true) {}

    
        try{

               

        var str = req.command + '\r';
        com.write(str, function () {
        if(req.command == 'W'){

                gather_chars_flag = true;
                }
                else{
                gather_chars_flag = false;
                }

                start_reading();
                
                console.log('Command: ' + str)
        });

}catch(e){

        console.log('Port closed');
        selected_port = '';
        process.exit();

}
}



function parseStream(data) {
 
        try{

           console.log('SCALE DATA:', data);     
       
        data = data.replace(/(\r|\n|\r|\t|\s)/gm, "");

        console.log('Gathered: ' + data);

        data = data.replace('S20', "");
        data = data.replace('S00', "");

        gross_val = data.replace(/[^0-9.]/g, '');

        if(isNaN(gross_val) || gross_val == ''){
                gross_val = '0.00';
        }
        else{
                gross_val = Number(gross_val);
                gross_val = gross_val.toFixed(2);
        }

        gross_val = gross_val + '';


        console.log('GROSS => ' + gross_val);

	try{
                com.close();
                console.log('Port closed');
                is_connected = false;
                selected_port = '';
                
        }
        catch(e){       
                console.log(e);
                process.exit();
        }

        


}catch(e){
	
                console.log('Port closed');
                is_connected = false;
                selected_port = '';
                process.exit();
        
}

}

function gatherStream(data) {

        try{

        //gather_chars += Math.floor((Math.random() * 10) + 1) + data;

        gather_chars += data;

        }catch(e){

        }


}



process.on('exit', function(){
        try{
                com.close();
                is_connected = false;
                selected_port = '';
                console.log('Port closed on exit');
        }
        catch(e){
                console.log(e);
        }
});


