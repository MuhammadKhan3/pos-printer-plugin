var line1 = '________________________________________________';
var line2 = '------------------------------------------------';
var line3 = '================================================';
var line4 = '- - - - - - - - - - - - - - - - - - - - - - - -';

const template_styles = require('../../config/template_styles.json');
const staff_config=require('../../config/staff_config.json')

var line_temp = '';

module.exports = {
    drawer_reconciliation_report: function(printer_conn, print_data, date_time) {
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

  // console.log("-------------------shif_report_close-------------------------",print_data);
    
  let data=print_data;
  console.log("-------------------cashdrawer reconciliation report-------------------------",Object.values(data).length);

  const {date,time}=getTime(data?.from);
  // console.log(datei);

    if(template_styles[0].currency_symbol != undefined){
        currency_symbol = template_styles[0].currency_symbol;
    }

    
    printer_conn
        .size(1, 1)
        .align('ct')
        .text('* * Cash Drawer Management * *')
        .text('\n')

        printer_conn
        .size(1, 1)
        .align('ct')
        .text('Cash Drawer ID: '+data?.station_name+' ('+data?.k_id+')')
        .text('\n')



        data?.data.forEach(function (r_data) {

          let cd_action_label = '';
          if(r_data?.action == 'log' && r_data?.type == 'cashdrawer_in'){
            cd_action_label = 'CASH IN FROM SAFE';
          }
         else if(r_data?.action == 'log' && r_data?.type == 'cashdrawer_out'){
            cd_action_label = 'CASH OUT TO SAFE';
          }
          else if(r_data?.action == 'log' && r_data?.type == 'journal_entry'){
            cd_action_label = 'Journal Entry';
          }
          else if(r_data?.action == 'log' && r_data?.type == 'payout_to_staff'){
            cd_action_label = 'PAYOUT TO STAFF';
          }
          else if(r_data?.action == 'log' && r_data?.type == 'redeem_vouchers'){
            cd_action_label = 'Redeem Vouchers';
          }
          else if(r_data?.action == 'open' && r_data?.type == 'cashdrawer_in'){
            cd_action_label = 'Beginning';
          }
          else{
            return;
          }

        printer_conn
        .tableCustom([   
            {text: r_data?.cashdrawer_staff + " (" + r_data?.cashdrawer_staff_id + ")", align: "LEFT", width: 0.50},
            {text: r_data?.cashdrawer_time, align: "LEFT", width:  0.50}, 
            {text: cd_action_label, align: "LEFT", width:  0.50}, 
            {text: "$" + removeDollarAndFormat(r_data?.cashdrawer?.grand_total), align: "LEFT", width:  0.50}, 

          ]
        )
        .text('')
      });

   
      if(data?.cash_drawer_closing_balance){
      printer_conn
      .align('ct')
      .text('\n')
      .text(data?.cash_drawer_closing_balance)
      }

    
     

        printer_conn
        .size(1, 1)
        .align('ct')
        .text('\n')
        .text('**** Reconciliation ****')
        .text('\n')

   


  printer_conn
  .style('b')
        .tableCustom([    
          {text: "", align:"CENTER", width:  0.25},   
          {text: "", align: "LEFT", width:  0.25}, 
            {text: "Beginning", align: "CENTER", width: 0.25},
            {text: "Closing", align: "CENTER", width:  0.25}
            
          ]
        )
        .style('a')



    

        printer_conn
        .tableCustom([   
          {text: "", align:"LEFT", width:  0.25},    
            {text: "1c", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.one_cent), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.one_cent), align: "CENTER", width:  0.25}, 
         
            
          ]
        )

       


        printer_conn
        .tableCustom([    
          {text: "", align:"LEFT", width:  0.25}, 
            {text: "5c", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.five_cent), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.five_cent), align: "CENTER", width:  0.25}, 
          
            
          ]
        )

        printer_conn
        .tableCustom([    
          {text: "", align:"LEFT", width:  0.25},  
            {text: "10c", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.ten_cent), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.ten_cent), align: "CENTER", width:  0.25}, 
           
            
          ]
        )


        printer_conn
        .tableCustom([    
          {text: "COINS", align: "LEFT", width:  0.25},  
            {text: "25c", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.twentyfive_cent), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.twentyfive_cent), align: "CENTER", width:  0.25}, 
            
            
          ]
        )


        printer_conn
        .tableCustom([    
          {text: "", align:"LEFT", width:  0.25},  
            {text: "50c", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.fifty_cent), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.fifty_cent), align: "CENTER", width:  0.25}, 
         
            
          ]
        )


        printer_conn
        .tableCustom([   
          {text: "", align:"LEFT", width:  0.25},   
            {text: "$1", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.hundred_cent), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.hundred_cent), align: "CENTER", width:  0.25}, 
          
            
          ]
        )

        printer_conn
        .text(line2)

        printer_conn
        .tableCustom([    
          {text: "", align:"LEFT", width:  0.25},  
            {text: "$1", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.one_dollar), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.one_dollar), align: "CENTER", width:  0.25}, 
           
            
          ]
        )


        printer_conn
        .tableCustom([    
          {text: "", align:"LEFT", width:  0.25},  
            {text: "$2", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.two_dollar), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.two_dollar), align: "CENTER", width:  0.25},
           
            
          ]
        )

        printer_conn
        .tableCustom([    
          {text: "", align:"LEFT", width:  0.25},  
            {text: "$5", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.five_dollar), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.five_dollar), align: "CENTER", width:  0.25},
         
            
          ]
        )

        printer_conn
        .tableCustom([    
          {text: "BILLS", align: "LEFT", width:  0.25},  
            {text: "$10", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.ten_dollar), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.ten_dollar), align: "CENTER", width:  0.25},
         
            
          ]
        )

        printer_conn
        .tableCustom([  
          {text: "", align:"LEFT", width:  0.25},    
            {text: "$50", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.fifty_dollar), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.fifty_dollar), align: "CENTER", width:  0.25},
      
            
          ]
        )

        printer_conn
        .tableCustom([   
          {text: "", align:"LEFT", width:  0.25},   
            {text: "$100", align: "LEFT", width:  0.25}, 
            {text: format_count(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.hundred_dollar), align: "CENTER", width: 0.25},
            {text: format_count(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.hundred_dollar), align: "CENTER", width:  0.25},
         
            
          ]
        )

        printer_conn
        .text('')
        .tableCustom([   
          {text: "", align:"LEFT", width:  0.25},   
            {text: "Total", align: "LEFT", width:  0.25}, 
            {text: "$" + removeDollarAndFormat(data?.cash_drawer_open?.cashdrawer?.cash_drawer_values?.grand_total), align: "CENTER", width:  0.25}, 
            {text: "$" + removeDollarAndFormat(data?.cash_drawer_close?.cashdrawer?.cash_drawer_values?.grand_total), align: "CENTER", width:  0.25},
          ]
        )

  if(data?.cash_drawer_closing_statement){
    printer_conn
        .align('ct')
      .text('\n')
        .text(data?.cash_drawer_closing_statement)
  }
        

       
        printer_conn
        .align('ct')
        .text('\n')
        .size(1, 1)
        .text("Print date-time: " + date_time.date + " " + date_time.time)
        .text('')
        .size(1, 1)
        .align('ct')
        .text('Powered by Pocket Systems, LLC.')
        .text('')


          printer_conn
          .cut()
          .close()

}





function getTime(dateFrom){
  let datetime= new Date(dateFrom);
  let year = datetime.getFullYear();
  let month = datetime.getMonth() + 1; 
  let day = datetime.getDate();
  
  let hours = datetime.getHours();
  hours = hours % 12;
 
  var ampm = hours >= 12 ? 'PM' : 'AM';  
  hours = hours ? hours : 12; 

  let minutes = datetime.getMinutes();
  minutes = minutes < 10 ? '0' + minutes : minutes;

  let time=hours+":"+minutes+" "+ampm;
  let date=day+"/"+month+"/"+year;
  return {time,date}
}


function removeDollarAndFormat(value) {

  if(value === undefined || value == null){
    return '0.00';
  }
  let valueStr = typeof value === 'number' ? value.toString() : value;

  let cleanedValue = valueStr.replace(/^\$/, '');

  cleanedValue = cleanedValue.replace(/,/g, '');
  const numericValue = Number(cleanedValue);
  const formattedValue = numericValue.toLocaleString('en-US', { minimumFractionDigits:2,maximumFractionDigits: 2 });

  return formattedValue;
}

function format_count(value) {

  if(value === undefined || value == null){
    return '0';
  }
  let valueStr = typeof value === 'number' ? value.toString() : value;

  let cleanedValue = valueStr.replace(/^\$/, '');

  cleanedValue = cleanedValue.replace(/,/g, '');
  const numericValue = Number(cleanedValue);
  const formattedValue = numericValue.toLocaleString('en-US', { minimumFractionDigits:0,maximumFractionDigits: 0 });

  return formattedValue;
}