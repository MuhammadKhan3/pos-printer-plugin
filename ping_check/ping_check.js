const ping = require('ping');
exports.ping_check = (data) => {
    
    var results = [];
    var results_html = '';

    data.counter_printer_ips.map(function(host){

        if(host.print){
        ping.sys.probe(host.ip,  function(isAlive){  
            
            if(isAlive == true){
                results_html = '<h3>Counter ('+host.ip+') :: <span style="padding: 10px; border-radius: 25px; height: 20px; width: 35px; color: #fff; background-color: #27ae60;">active</span></h3>';
            }
            else{
                results_html = '<h3>Counter ('+host.ip+') :: <span style="padding: 10px; border-radius: 25px; height: 20px; width: 35px; color: #fff; background-color: #e74c3c;">inactive</span></h3>';
            }

            results.push({"ip": host.ip, "is_alive": isAlive, type: "counter", html: results_html});



        });

    }
    });

    
    data.kitchen_printer_ips.map(function(host){

        if(host.print){

        
        ping.sys.probe(host.ip, function(isAlive){    
            
            if(isAlive == true){
                results_html = '<h3>Kitchen ('+host.ip+') :: <span style="padding: 10px; border-radius: 25px; height: 20px; width: 35px; color: #fff; background-color: #27ae60;">active</span></h3>';
            }
            else{
                results_html = '<h3>Kitchen ('+host.ip+') :: <span style="padding: 10px; border-radius: 25px; height: 20px; width: 35px; color: #fff; background-color: #e74c3c;">inactive</span></h3>';
                
            }


            results.push({"ip": host.ip, "is_alive": isAlive, type: "kitchen", html: results_html});


        });

    }
    });


    data.multi_kitchen_printer_ips.map(function(host){

        if(host.print){

        ping.sys.probe(host.ip, function(isAlive){    
            
            if(isAlive == true){
                results_html = '<h3>Kitchen ('+host.ip+') :: <span style="padding: 10px; border-radius: 25px; height: 20px; width: 35px; color: #fff; background-color: #27ae60;">active</span></h3>';
            }
            else{
                results_html = '<h3>Kitchen ('+host.ip+') :: <span style="padding: 10px; border-radius: 25px; height: 20px; width: 35px; color: #fff; background-color: #e74c3c;">inactive</span></h3>';
            }

            results.push({"ip": host.ip, "is_alive": isAlive, type: "kitchen", html: results_html});

        });

    }
    
    });


    return results;
}