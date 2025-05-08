var line1 = '________________________________________________';
var line2 = '------------------------------------------------';

const template_styles = require('../../config/template_styles.json');

var line_temp = '';

module.exports = {
    shift_printer_template_1: function(printer_conn, print_data, date_time) {
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

    

    if(template_styles[template_style-1].currency_symbol != undefined){
        currency_symbol = template_styles[template_style-1].currency_symbol;
    }

    printer_conn
        .size(2, 2)
        .align('ct')
        .text('>>>> SHIFT STARTED <<<<')
        .size(2, 2)
        .align('ct')
        .text('')
        .text('CASHDRAWER OPEN AMOUNT')
        .text(currency_symbol + print_data.amount)
        .text('')
        .size(1, 1)


        printer_conn
            .align('lt')
            .text(line1)
            .size(1, 1)
            .style('b')
            .text(print_data.business_info.name)
            .size(1, 1)
            .text(print_data.business_info.address)


        printer_conn
            .text('Staff ID: ' + print_data.staff_id)

            printer_conn
                .text('Staff name: ' + print_data.staff_name)

                printer_conn
                .size(1, 1)
                .text('Print date-time: ' + date_time.date + ' ' + date_time.time)
      
        

        printer_conn
        .text(line1)

        .size(1, 1)

        .align('ct')
        .text('Powered by Mikronexus, inc.')
        .text('')


printer_conn
    .cut()
    .close()

}


