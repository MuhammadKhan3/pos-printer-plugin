var line1 = '________________________________________________';
var line2 = '------------------------------------------------';

const template_styles = require('../../config/template_styles.json');

var line_temp = '';

module.exports = {
    giftcard_printer_template_1: function(printer_conn, print_data, date_time) {
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
    console.log("data",print_data)
    var template_style = 1;

    

    if(template_styles[template_style-1].currency_symbol != undefined){
        currency_symbol = template_styles[template_style-1].currency_symbol;
    }

    console.log(print_data.business_info)




    printer_conn
      .size(2, 2)
      .style('b')
      .align('ct')
      .text('GIFTCARD STATS')
    printer_conn
        .size(1, 1)
        .style('b')
        .align('ct')
        .text(print_data.business_info.name)
        .text(print_data.business_info.address)

    printer_conn.font('a')
    .align('ct')
    .style('bu')
    .size(1, 1)
    .text('Giftcard Code: ' + print_data.cardData.giftCardQr)

    .tableCustom(
      [
        { text: "Code", align:"LEFT", width:0.45,},
        { text: print_data.cardData.giftCardQr, align:"RIGHT", width:0.45 }
      ],
    )

    .tableCustom(
        [
          { text: "Balance", align:"LEFT", width:0.45,},
          { text: print_data.cardData.remaing_amount, align:"RIGHT", width:0.45 }
        ],
      )

      .text('')
      .text('History')

      .table(["------------------------------------------------"])
      .tableCustom(
          [
            { text: "Time", align:"LEFT", width:0.40,},
            { text: "Type", align:"LEFT", width:0.30 },
            { text: "Amount", align:"RIGHT", width:0.20 }
          ]
      )


      if(print_data.cardData.history.length > 0){


        for(var i = 0; i < print_data.cardData.history.length; i++){
            printer_conn
            .tableCustom(
                [   
                    { text: print_data.cardData.history[i].time, align:"LEFT", width:0.40,},
                    { text: print_data.cardData.history[i].type, align:"LEFT", width:0.30 },
                    { text: print_data.cardData.history[i].amount, align:"RIGHT", width:0.20 }
                ]
            )
        }

      }
        

        printer_conn
        .size(1, 1)
        .align('ct')
        .text('\n')
        .text('Print date-time: ' + date_time.date + ' ' + date_time.time)
        .text('\n')

        printer_conn
        .size(1, 1)
        .align('ct')
        .text('Powered by Mikronexus, inc.')
        .text('')

        printer_conn
        .cut()
        .close()

        console.log(print_data);

}

