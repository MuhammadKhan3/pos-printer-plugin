const { SerialPort } = require("serialport");
const printer_config_check = require("../../printing_server/global_config/global_config.js");

async function drawer_serial_port(k_id, counter_printer_ips) {
  try {
    const { cash_drawer_path } = counter_printer_ips.find(
      (counter) => counter.k_id == k_id
    ) || { cash_drawer_path: "COM7" };

    const ports = await SerialPort.list();
    // console.log(ports);
    const port = ports.find((port) => port.path === cash_drawer_path);

    if (!port) {
      logError(`<div style="text-align:center;font-family:Arial,sans-serif;color:red;font-size:18px;font-weight:700">⚠️ Cash Drawer Connection Issue ⚠️</div><div style="text-align:center;font-family:Arial,sans-serif;color:#000;font-size:16px;margin-top:10px">Unable to connect to the cash drawer on <b>COM Port: ${cash_drawer_path}</b>. Please follow the troubleshooting steps below:</div><div style="text-align:left;font-family:Arial,sans-serif;color:#000;font-size:14px;margin-top:15px;padding:10px;border:1px solid #ddd;border-radius:5px;background:#f8f9fa;max-width:500px;margin:15px auto"><b>Troubleshooting Steps:</b><ul style="padding-left:20px;margin-top:8px"><li>🔌 <b>Check Connection:</b> Ensure the cash drawer is securely connected to the COM port.</li><li>🔄 <b>Restart Devices:</b> Power cycle the POS system.</li><li>📞 <b>Contact IT Support:</b> If the issue persists, please reach out to your IT team for further assistance.</li></ul></div>`);
      return;
    }

    const com = new SerialPort({
      path: cash_drawer_path,
      baudRate: 9600,
      databits: 7,
      parity: "even",
      stopBits: 1,
    });

    com.on("error", (err) => handleError(err, cash_drawer_path, com));

    com.write("1", (err) => {
      if (err) {
        handleError(err, cash_drawer_path, com);
      } else {
        console.log(`-------------------Success ${cash_drawer_path}-------------------`);
        com.close((err) => {
          if (err) {
            console.error("Error closing port:", err.message);
          } else {
            console.log("Port closed successfully");
          }
        });
      }
    });
  } catch (error) {
    logError("Main function error", error);
  }
}

function handleError(err, cash_drawer_path, com) {
  logError(`<div style="text-align:center;font-family:Arial,sans-serif;color:red;font-size:18px;font-weight:700">⚠️ Cash Drawer Connection Issue ⚠️</div><div style="text-align:center;font-family:Arial,sans-serif;color:#000;font-size:16px;margin-top:10px">Unable to connect to the cash drawer on <b>COM Port: ${cash_drawer_path}</b>. Please follow the troubleshooting steps below:</div><div style="text-align:left;font-family:Arial,sans-serif;color:#000;font-size:14px;margin-top:15px;padding:10px;border:1px solid #ddd;border-radius:5px;background:#f8f9fa;max-width:500px;margin:15px auto"><b>Troubleshooting Steps:</b><ul style="padding-left:20px;margin-top:8px"><li>🔌<b>Check Connection:</b> Ensure the cash drawer is securely connected to the COM port.</li><li>🔄<b>Restart Devices:</b> Power cycle the POS system.</li><li>📞<b>Contact IT Support:</b> If the issue persists, please reach out to your IT team for further assistance.</li></ul></div>`, err);
  com.close((closeErr) => {
    if (closeErr) {
      console.error("Error closing port:", closeErr.message);
    } else {
      console.log("Port closed successfully");
    }
  });
}

function logError(message, error) {
  printer_config_check.global_config.error_logs = message;
  // console.log(printer_config_check.global_config.error_logs);
  if (error) {
    console.error(message, error.message);
  }
}

module.exports = { drawer_serial_port };
