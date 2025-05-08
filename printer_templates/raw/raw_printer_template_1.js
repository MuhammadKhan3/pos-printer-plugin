var line1 = '________________________________________________';
var line2 = '------------------------------------------------';

const template_styles = require('../../config/template_styles.json');

var line_temp = '';

module.exports = {
    raw_printer_template_1: function(printer_conn, print_data, date_time) {
        try{
            print_handler(printer_conn, print_data, date_time);
        }
        catch(e){
            setTimeout(function(){
                console.log('Printer is not reachable...', e);
            }, 1);
        }
        
    }
};

var currency_symbol = '$';

function print_handler(printer_conn, print_data, date_time) {

    // var template_style = 1;

    

    // if(template_styles[template_style-1].currency_symbol != undefined){
    //     currency_symbol = template_styles[template_style-1].currency_symbol;
    // }

// console.log(print_data);

    if(print_data.receipt_data !== undefined){

       
        print_data.receipt_data.forEach(item => {
            // Set alignment based on 'align'
            switch (item.align) {
              case "ct":
                printer_conn.align('CT');
                break;
              case "lt":
                printer_conn.align('LT');
                break;
              case "rt":
                printer_conn.align('RT');
                break;
            }
        
            // Set font style based on font_x, font_y, and font_weight
            if (item.font_weight === "b") {
                printer_conn.style("b"); // Bold
            } else {
                printer_conn.style("a");
            }
        
            // Scale font size
            printer_conn.size(item.font_x, item.font_y);
        
            // Print content
            printer_conn.text(item.content);

            // Apply action
            if (item.action === "cut") {
                printer_conn.cut(); //cut
              }

          });
        
         

        printer_conn
        .cut()
        .close()
    }
    else if(print_data?.rawText !== undefined){
        printer_conn
        .text(print_data.rawText);
    }


}


function printTipTemplate(printer_conn, print_data) {
    printer_conn
        .align('ct')
        .text(line2)
        .text('')
        .size(1, 1)
        .text('Gratuity')
        printer_conn.text(line2)
            .align('ct')
            .text('');
            
            if(print_data.amount != undefined && print_data.amount != 'undefined' && print_data.amount != null && print_data.amount != ''){
                printer_conn.text('18% (' + currency_symbol + (Number(print_data.amount.toFixed(2)) * 0.18).toFixed(2)  + ')\t20% (' + currency_symbol + (Number(print_data.amount.toFixed(2)) * 0.20).toFixed(2) + ')\t25% (' + currency_symbol + (Number(print_data.amount.toFixed(2)) * 0.25).toFixed(2) + ')')
            }
            else{
                printer_conn.text('\t18%\t\t20%\t\t25%');
            }
            
            
            printer_conn.text('')

            printer_conn
            .align('lt')
            .text('\n\n'+currency_symbol+'______________\t\t________________')
            .text('Custom Gratuity\t\tSignature')
                    .text('');

}

function printTipTemplate1(printer_conn, print_data) {
    printer_conn
        .align('ct')
        .text(line2)
        .text('')
        .size(1, 1)
        .text('Gratuity')
        .text(line2)
        .align('lt')
        .text('\n\nGratuity: ______________________________________')
        .text('\n\nTotal: _________________________________________')
        .text('\n\nSign: __________________________________________')
        .text('');

}