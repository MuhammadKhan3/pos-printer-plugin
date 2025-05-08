const escpos = require('escpos');

const shift_printer_template_1 = require('../printer_templates/shift/shift_printer_template_1');
const shift_report_template_1 = require('../printer_templates/shift/shift_report_template_1');
const printer_config=require('../config/printer_config.json');
const raw_printer_template_1 = require('../printer_templates/raw/raw_printer_template_1');




module.exports = {
    shift_printers: function(req) {
        printer_start(req);
    }
};


var current_date;
var current_time;
var now;
var current_month;

var printers = [];

var current_printer;
var current_device;
var current_conn;
var current_print_data;

var printer_flag = false;




function printer_start(print_data) {


    now = new Date();
    current_month = Number(now.getMonth()) + 1;
    current_date = '' + current_month + '/' + now.getDate() + '/' + now.getFullYear() + '';
    current_time = tConv24(now.getHours() + ':' + now.getMinutes());


    var printer_device;
    var options = {
        encoding: "UTF-16BE"
    };
    var printer_conn;

    var receipt_type = print_data.printer_meta.receipt;

    var printer_meta = print_data.printer_meta;

    if (receipt_type == 'shift_started') {

        for (var kitchen_printers = 0; kitchen_printers < printer_meta.kitchen_printer_ips.length; kitchen_printers++) {

            if((printer_meta.kitchen_printer_ips[kitchen_printers].print == undefined || printer_meta.kitchen_printer_ips[kitchen_printers].print === true) && ((printer_meta.kitchen_printer_ips[kitchen_printers].k_id == undefined || print_data.k_id == undefined) || printer_meta.kitchen_printer_ips[kitchen_printers].k_id == print_data.k_id)){

        
                printer_device = new escpos.Network(printer_meta.counter_printer_ips[0].ip);
                printer_conn = new escpos.Printer(printer_device, options);

                printers.push({
                    printer_device: printer_device,
                    printer_conn: printer_conn,
                    ip: printer_meta.counter_printer_ips[0].ip,
                    print_data: print_data,
                    type: receipt_type
                });

            }
        }

    }

   

    if (receipt_type == 'staff_clockout_report') {

     

        for (var counter_printers = 0; counter_printers < printer_meta.counter_printer_ips.length; counter_printers++) {

            if((printer_meta.counter_printer_ips[counter_printers].print == undefined || printer_meta.counter_printer_ips[counter_printers].print === true) && ((printer_meta.counter_printer_ips[counter_printers].k_id == undefined || print_data.k_id == undefined) || printer_meta.counter_printer_ips[counter_printers].k_id == print_data.k_id)){

                // const printer=await PrinterConnection(printer_meta.counter_printer_ips[0].ip,options,'usb');
        
                // printer_device =printer?.printer_device; 
                // printer_conn =printer?.printer_conn;
        
                printer_device = new escpos.Network(printer_meta.counter_printer_ips[counter_printers].ip);
                printer_conn = new escpos.Printer(printer_device, options);

                if(print_data?.all_data?.receipt_data){

                    printers.push({
                        printer_device: printer_device,
                        printer_conn: printer_conn,
                        ip: printer_meta.counter_printer_ips[counter_printers].ip,
                        print_data: print_data.all_data,
                        type: 'raw'
                    });

                }
                    else{

                if(Object.keys(print_data?.all_data?.sum_data).length>0){
                    printers.push({
                        printer_device: printer_device,
                        printer_conn: printer_conn,
                        ip: printer_meta.counter_printer_ips[counter_printers].ip,
                        print_data: {business_info:print_data?.business_info,...print_data?.all_data?.sum_data},
                        type: receipt_type
                    });
                }
                for (const staff_data of print_data?.all_data?.data_by_staff ) {
                    printer_device = new escpos.Network(printer_meta.counter_printer_ips[counter_printers].ip);
                    printer_conn = new escpos.Printer(printer_device, options);    
                    printers.push({
                        printer_device: printer_device,
                        printer_conn: printer_conn,
                        ip: printer_meta.counter_printer_ips[counter_printers].ip,
                        print_data: {business_info:print_data?.business_info,...staff_data},
                        type: receipt_type
                    });
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


        console.log('Current Printing IP: ' + current_printer.ip);

        current_device?.open(function() {

            if(current_printer?.type == 'shift_started'){
                shift_printer_template_1.shift_printer_template_1(current_conn, current_print_data, {
                    date: current_date,
                    time: current_time
                });    
            }else if(current_printer?.type == 'staff_clockout_report') {
               
                shift_report_template_1.shift_report_template_1(current_conn, current_print_data, {
                    date: current_date,
                    time: current_time
                })
            }
            else if(current_printer?.type == 'raw') {
               console.log(current_print_data);
                raw_printer_template_1.raw_printer_template_1(current_conn, current_print_data, {
                    date: current_date,
                    time: current_time
                })
            }

        });

        printer_flag = true;

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