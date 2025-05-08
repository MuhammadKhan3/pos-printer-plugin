const escpos = require('escpos');

const kitchen_printer_template_1 = require('../printer_templates/kitchen/kitchen_printer_template_1');
const kitchen_printer_attribute_template_1 = require('../printer_templates/kitchen/kitchen_printer_attribute_template_1');
const counter_printer_template_1 = require('../printer_templates/counter/counter_printer_template_1');
const counter_printer_template_2 = require('../printer_templates/counter/counter_printer_template_2');

const printer_config_check = require('./global_config/global_config.js');


module.exports = {
    kitchen_attribute_printers: function(req) {
        printer_start_multiple(req);
    }
};


var current_date;
var current_time;
var now;
var current_month;

var attributes = [];
var printers = [];
var temp_printers = [];
var temp_ips = [];

var current_printer;
var current_device;
var current_conn;
var current_print_data;
var current_print_data_other;
var order_data;
var order_info_global;

var printer_flag = false;




function printer_start_multiple(req) {

    

    printer_count = 0;

    var printer_meta = req.printer_meta;

    now = new Date();
    current_month = Number(now.getMonth()) + 1;
    current_date = '' + current_month + '/' + now.getDate() + '/' + now.getFullYear() + '';
    current_time = tConv24(now.getHours() + ':' + now.getMinutes());

    var printer_device;
    var options = {
        encoding: "UTF-16BE"
    };
    var printer_conn;
    var order_info = [];
    var ord_info_alt = [];
    var order_info_all_items = [];
    var print_order_array = [];
    var print_order_array_undefined = [];
    var print_order_other_array = [];

    var print_line_flag = false;

    var ip_attr = '';

    var ip_attr_count = '';

    var print_ord_flag = false;

    attributes = [];
printers = [];
temp_printers = [];
temp_ips = [];

    order_data = req;

    order_info = req.order_info;

    ord_info_alt = req.order_info;

    order_info_global = req.order_info;

    if(req.order_info_all_items != undefined){
        order_info_all_items = req.order_info_all_items;
    }
    else{
        order_info_all_items = [];
    }

    

    if (printer_meta.receipt == 'counter_and_kitchen_attributes') {

        for (var counter_printers = 0; counter_printers < printer_meta.counter_printer_ips.length; counter_printers++) {

            if((printer_meta.counter_printer_ips[counter_printers].print == undefined || printer_meta.counter_printer_ips[counter_printers].print === true) && ((printer_meta.counter_printer_ips[counter_printers].k_id == undefined || order_data.k_id == undefined) || printer_meta.counter_printer_ips[counter_printers].k_id == order_data.k_id)){

        

        printer_device = new escpos.Network(printer_meta.counter_printer_ips[counter_printers].ip);
        printer_conn = new escpos.Printer(printer_device, options);

        printers.push({
            printer_device: printer_device,
            printer_conn: printer_conn,
            ip: printer_meta.counter_printer_ips[counter_printers].ip,
            template: printer_meta.counter_printer_template,
            template_style: printer_meta.counter_printer_template_style,
            print_data: order_info,
            attributes: [],
            type: "counter"
        });

    }

}

    }


  

    attributes = req.attributes;
    for (attr = 0; attr < attributes.length; attr++) {
        if (attributes[attr].ip != undefined && attributes[attr].ip != '0.0.0.0' && attributes[attr].ip != '' && attributes[attr].ip != null) {

            ip_attr = (attributes[attr].ip).split(',');

            for(ip_attr_count = 0; ip_attr_count < ip_attr.length; ip_attr_count++){

                

                ip_attr[ip_attr_count] = ip_attr[ip_attr_count].trim();

                if(check_print_status(printer_meta, ip_attr[ip_attr_count])){

                if(ip_attr[ip_attr_count] != null && ip_attr[ip_attr_count] != '' && ip_attr[ip_attr_count] != '0.0.0.0' && ip_attr[ip_attr_count] != undefined){

            printer_device = new escpos.Network(ip_attr[ip_attr_count]);
            printer_conn = new escpos.Printer(printer_device, options);

            print_order_array = [];
            print_order_other_array = [];

            print_line_flag = false;

            for (var ord_count = 0; ord_count < order_info.length; ord_count++) {



              

                for (var att_count = 0; att_count < attributes[attr].attributes.length; att_count++) {

                    if ((attributes[attr].attributes[att_count].id == order_info[ord_count].attribute_id) || (order_info[ord_count].attribute_id == '0')) {


                        if(order_info[ord_count].attribute_id != '0' || order_info[ord_count].attribute_id != 0){
                            print_order_array.push(ord_info_alt[ord_count]);

                            print_line_flag = true;

                          
                          
                        }
                        else{
                            var temp_ord_info = JSON.parse(JSON.stringify(ord_info_alt[ord_count]));

                            var print_ord_count = 0;

                         

                            temp_ord_info.menuExtrasSelected = [];
                            for (print_ord_count = 0; print_ord_count < ord_info_alt[ord_count].menuExtrasSelected.length; print_ord_count++) {

                              
                                if ((ord_info_alt[ord_count].menuExtrasSelected[print_ord_count].attribute_id != undefined) && (attributes[attr].attributes[att_count].id == ord_info_alt[ord_count].menuExtrasSelected[print_ord_count].attribute_id)) {
                                   
                                    temp_ord_info.attribute_id = ord_info_alt[ord_count].menuExtrasSelected[print_ord_count].attribute_id; 
                                  
                                   temp_ord_info.menuExtrasSelected.push(ord_info_alt[ord_count].menuExtrasSelected[print_ord_count]);
                            }
                        }

                        if(temp_ord_info.menuExtrasSelected.length > 0){
                            print_order_array.push(temp_ord_info);
                        }

                        }


                        if(order_info_all_items.length > 0){
                            for (var ord_count_other = 0; ord_count_other < order_info_all_items.length; ord_count_other++) {

                                if (attributes[attr].attributes[att_count].id != order_info_all_items[ord_count_other].attribute_id) {


                                    if(print_order_other_array.length > 0){

                                        print_ord_flag = true;

                                        for (var print_ord_count = 0; print_ord_count < print_order_other_array.length; print_ord_count++) {
                                            if (order_info_all_items[ord_count_other].uniqueId == print_order_other_array[print_ord_count].uniqueId) {
                                                print_ord_flag = false;
                                                break;
                                            
                                        }
                                    }

                                    if(print_ord_flag){
                                        print_order_other_array.push(order_info_all_items[ord_count_other]);
                                    }

                                }
                                    else{
                                        print_order_other_array.push(order_info_all_items[ord_count_other]);
                                    }

                                    

                                }

                        }
                 } 



                    }
                    


                }



            }

            

            if(print_order_array.length > 0){

                temp_ips.push(ip_attr[ip_attr_count]);

                temp_printers.push({
                printer_device: printer_device,
                printer_conn: printer_conn,
                ip: ip_attr[ip_attr_count],
                attributes: attributes[attr].attributes,
                template: printer_meta.multi_kitchen_printer_template,
                template_style: printer_meta.multi_kitchen_printer_template_style,
                print_data: print_order_array,
                print_data_other: print_order_other_array,
                type: "kitchen"
            });

        }

    }


}

    }

        }
    }




    var merged_print_data = [];
    var merged_print_data_other = [];
    var merged_attributes = [];
    var merged_template = '';
    var merged_type = '';
    var merged_printer_conn = '';
    var merged_printer_device = '';
    var merged_template_style = '';

    if(temp_ips.length > 0){
    temp_ips = temp_ips.filter(onlyUnique);
    (temp_ips).forEach(function(t_ip){

    merged_print_data = [];
    merged_print_data_other = [];
    merged_attributes = [];
    merged_template = '';
    merged_type = '';
    merged_printer_conn = '';
    merged_printer_device = '';
    merged_template_style = '';

        (temp_printers).forEach(function(t_printer){

            if(t_ip == t_printer.ip){

                (t_printer.print_data).forEach(function(t_print_data){
                    merged_print_data.push(t_print_data);
                    
                });

                (t_printer.print_data_other).forEach(function(t_print_data_other){
                    merged_print_data_other.push(t_print_data_other);
                    
                });

                (t_printer.attributes).forEach(function(t_attributes){
                    merged_attributes.push(t_attributes);
                    
                });

                    merged_template = t_printer.template;
                    merged_type = t_printer.type;
                    merged_printer_conn = t_printer.printer_conn;
                    merged_printer_device = t_printer.printer_device;
                    merged_template_style = t_printer.template_style;

                
            }



        });  

        printers.push({
            printer_device: merged_printer_device,
            printer_conn: merged_printer_conn,
            ip: t_ip,
            attributes: merged_attributes,
            template: merged_template,
            template_style: merged_template_style,
            print_data: merged_print_data,
            print_data_other: merged_print_data_other,
            type: merged_type
        });
        
        

    });

    }

    


 
    
    

    for (var ord_count = 0; ord_count < order_info.length; ord_count++) {

        if (order_info[ord_count].attribute_id == undefined || (order_info[ord_count].attribute_id == '0' || order_info[ord_count].attribute_id == 0) ) {

            if(ord_info_alt[ord_count].menuItem != '???PRINT_LINE_1???'){
                print_order_array_undefined.push(ord_info_alt[ord_count]);
            }
            
            if(order_info_all_items.length > 0){
                for (var ord_count_other = 0; ord_count_other < order_info_all_items.length; ord_count_other++) {

                    if (order_info[ord_count].attribute_id != undefined || (order_info[ord_count].attribute_id != '0' || order_info[ord_count].attribute_id != 0) ) {


                        if(print_order_other_array.length > 0){

                            print_ord_flag = true;

                            for (var print_ord_count = 0; print_ord_count < print_order_other_array.length; print_ord_count++) {
                                if (order_info_all_items[ord_count_other].uniqueId == print_order_other_array[print_ord_count].uniqueId) {
                                    print_ord_flag = false;
                                    break;
                                
                            }
                        }

                        if(print_ord_flag){
                            print_order_other_array.push(order_info_all_items[ord_count_other]);
                        }

                    }
                        else{
                            print_order_other_array.push(order_info_all_items[ord_count_other]);
                        }

                        

                    }

            }
     } 
        
        }

    }

    if (printers.length > 0) {
        printer_flag = true;
    }


}




setInterval(function() {

    if ((printer_flag) && (printers.length > 0)) {

        printer_flag = false;

        current_printer = printers.shift();

        current_device = (current_printer.printer_device);
        current_conn = (current_printer.printer_conn);
        current_print_data = (current_printer.print_data);

        current_print_data_other = (current_printer.print_data_other);

        current_attributes = (current_printer.attributes);

     
        console.log('Current Printing IP: ' + current_printer.ip);


        current_device.open(function() {

            if (current_printer.type == 'counter') {

                if(current_printer.template == '1'){

                counter_printer_template_1.counter_printer_template_1(current_conn, order_data, {
                    date: current_date,
                    time: current_time
                }, current_printer.template_style);

            }

            }

            // if (current_printer.type == 'kitchen' && current_printer.ip != '10.10.10.231') {

            //     if(current_printer.template == '1'){

            //             kitchen_printer_attribute_template_1.kitchen_printer_attribute_template_1(current_conn, current_print_data, order_data, current_attributes, {
            //                 date: current_date,
            //                 time: current_time
            //             }, current_printer.template_style, current_print_data_other);

            //     }

            // }



            if (current_printer.type == 'kitchen' && current_printer.ip == '10.10.10.231') {


                if(current_printer.template == '1'){
                kitchen_printer_template_1.kitchen_printer_template_1(current_conn, order_info_global, order_data, {
                    date: current_date,
                    time: current_time
                }, current_printer.template_style, current_print_data_other);
            }

            }


            if (current_printer.type == 'kitchen' && current_printer.ip == '10.10.10.230') {


                if(current_printer.template == '1'){
                kitchen_printer_template_1.kitchen_printer_template_1(current_conn, order_info_global, order_data, {
                    date: current_date,
                    time: current_time
                }, current_printer.template_style, current_print_data_other, 143);
            }

            }

            if (current_printer.type == 'kitchen' && current_printer.ip == '10.10.10.201') {


                if(current_printer.template == '1'){
                kitchen_printer_template_1.kitchen_printer_template_1(current_conn, order_info_global, order_data, {
                    date: current_date,
                    time: current_time
                }, current_printer.template_style, current_print_data_other, 146);
            }

            }

            if (current_printer.type == 'kitchen' && current_printer.ip == '10.10.10.250') {


                if(current_printer.template == '1'){
                kitchen_printer_template_1.kitchen_printer_template_1(current_conn, order_info_global, order_data, {
                    date: current_date,
                    time: current_time
                }, current_printer.template_style, current_print_data_other, 144);
            }

            }


            printer_flag = true;
        }, error =>{
            printer_flag = true;
        });

    }else{
        printer_config_check.global_config.current_active_printing_attribute = false;
    }


}, 500);




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


function check_print_status(printer_meta, ip){

    var print_flag_ip = true;

    for(var i = 0; i < printer_meta.multi_kitchen_printer_ips.length; i++){

        if(ip == printer_meta.multi_kitchen_printer_ips[i].ip && printer_meta.multi_kitchen_printer_ips[i].print == false){

            print_flag_ip = false;

        }

    }

    return print_flag_ip;
    

}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }