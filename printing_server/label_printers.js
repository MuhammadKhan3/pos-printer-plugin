var fs = require('fs');
var label_printer_service = require('pdf-to-printer');
var PDFDocument = require('pdfkit');
var QRCode = require('qrcode');

var request = require('request');

var selected_printer;

//const label_printer_template_1 = require('../printer_templates/labels/label_printer_template_1');


module.exports = {
    label_printers: function(req) {
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

var printer_meta;


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

    printer_meta = print_data.printer_meta;

    if (receipt_type == 'weight_label') {

        for (var label_printers = 0; label_printers < printer_meta.label_printer_ips.length; label_printers++) {

            if((printer_meta.label_printer_ips[label_printers].print == undefined || printer_meta.label_printer_ips[label_printers].print === true) && ((printer_meta.label_printer_ips[label_printers].k_id == undefined || print_data.k_id == undefined) || printer_meta.label_printer_ips[label_printers].k_id == print_data.k_id)){

        selected_printer = printer_meta.label_printer_ips[label_printers].ip;

        printers.push({
            ip: printer_meta.label_printer_ips[label_printers].ip,
            print_data: print_data
        });

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

        current_print_data = (current_printer.print_data);


        console.log('Current Printing IP: ' + current_printer.ip);

        create_label_pdf(current_print_data.order_info[0], current_print_data);

        run_label_printing(current_print_data);

        printer_flag = true;

    }


}, 200);

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

var run_print_flag = true;

function run_label_printing(current_print_data){

    var i = 1;

    
    setInterval(function(){

        if((current_print_data.order_info.length > 0 && current_print_data.order_info[i] != undefined) && run_print_flag === true){
                create_label_pdf(current_print_data.order_info[i], current_print_data);
                i++;
        }

    }, 500);


}


function create_label_pdf(current_order_data, current_print_data){

    run_print_flag = false;

var file_name = '../printer_templates/labels/label_pdfs/label.pdf';

var doc;


        doc = new PDFDocument({
            size: [216, 144],
            margins : { // by default, all are 72
                top: 30,
               bottom:25,
                left: 25,
              right: 25
            },
            layout: 'portrait'
            });
       
    


    console.log(file_name);

request.post(
    'http://' + printer_meta.offline_server_ip + ':6970/pos_label/add',
    { json: {'raw_data': current_order_data, 'TIMESTAMP': Date.now()} },

    function (error, response, body) {

        if (!error && response.statusCode == 200) {

            
            

                QRCode.toDataURL(body.label_id, function (err, qr_str) {
      
                    doc
                    .pipe(fs.createWriteStream(file_name))
            
                    doc

                    .font("../printer_templates/labels/fonts/Roboto-Black.ttf")
                    .fontSize(8)
                    .text(current_print_data.business_info.name)
                    .text(' ')
                    .fontSize(6)
                    .text(current_order_data.menuItem)
                    .fontSize(10)
                    .text('WT: '+Number(current_order_data.quantity).toFixed(2)+' lb')
                    .text('BASE: $' + Number(current_order_data.basePrice).toFixed(2) + '/lb')
                    .text('AMT: $' + Number(current_order_data.totalPrice).toFixed(2))
                    .image(qr_str, 120, 40, {fit: [100, 100]})
                    .text(' ')
                    .fontSize(4)
                    .text('CODE')
                    .fontSize(8)
                    .text(body.label_id)
                    .restore()
                    .end();
            
                    setTimeout(function(){
                        send_print(file_name);
                    }, 500);
            
                  });

                

                    

                }

                }

                );

         

          

            

}



function send_print(pdf_path){
        let options = {
            printer: selected_printer,
            orientation: 'landscape',
            scale: 'fit'
          };
          label_printer_service.print(pdf_path, options).then(function(is_printed){
            console.log('Label sent to printer: ' + selected_printer);
            run_print_flag = true;
          });
}
