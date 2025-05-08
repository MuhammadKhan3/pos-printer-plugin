// main.js - Node.js Epson Receipt Printing Example using 'escpos' library

// --- IMPORTANT ---
// 1. Install the library: npm install escpos
// 2. For USB, you might need to install a driver like libusb (e.g., using Zadig for Windows).
//    Refer to node-usb documentation.
// 3. If you have multiple USB printers or issues with auto-detection, you might need to specify
//    the Vendor ID (VID) and Product ID (PID) for the USB device.
//    Example: const device = new escpos.USB(0x04b8, 0x0202); // VID and PID for a common Epson TM-T20
// 4. For Network printers: const device = new escpos.Network('your_printer_ip_address'); Ensure your printer is on the same network.
// 5. For Serial printers: const device = new escpos.Serial('/dev/ttyS0'); // Or your serial port

const escpos = require('escpos');
// Select the correct device type for your printer

// --- Network Printer Connection ---
// Replace 'your_printer_ip_address' with the actual IP address of your Epson printer.
// Ensure your Node.js machine and the printer are on the same network and can reach each other.
const device = new escpos.Network('192.168.18.245'); // <<-- IMPORTANT: SET YOUR PRINTER'S IP ADDRESS HERE

// --- USB Example (now commented out) ---
// const device = new escpos.USB();

// --- Serial Example (commented out) ---
// const device = new escpos.Serial('/dev/ttyS0', {
//   baudRate: 9600, // Check your printer's serial settings
//   autoOpen: false // escpos will open it
// });

const printer = new escpos.Printer(device);

// --- Receipt Data (Extracted from the image) ---
const receiptData = {
    restaurantName: "Juice N. Blends Healthy Eatery - Massapeque",
    restaurantPhone: "(318) 900-1770",
    confirmationCode: "8914",
    orderNumber: "85802953-6347438",
    orderPlacedTimestamp: "April 15th, 10:05a.m.",
    deliveryType: "DELIVERY",
    readyForDriverBy: "Apr. 15, 10:14am",
    deliveryAddress: {
        name: "Kathryn",
        street: "25 Seabreeze Rd",
        cityStateZip: "Massapequa, NY 11758",
        phone: "(516) 459-7124",
    },
    contactFreeDeliveryInstructions: [
        "1. Leave order at front door of",
        "   house/apartment unit",
        "2. Text customer",
    ],
    items: [
        { name: "ABC Juice", quantity: 1, price: 11.29, notes: "16 oz." },
        { name: "Mediterranean Super Omelette", quantity: 1, price: 14.99, notes: "" },
    ],
    includeExtras: "NO",
    subtotal: 26.28,
    taxes: 2.27,
    restaurantTotal: 28.55,
    paymentStatus: "PREPAID",
    paymentInstruction: "DO NOT CHARGE",
    footerLines: [
        "GRUBHUB FOR RESTAURANTS",
        "Ordered via seamless"
    ]
};

// --- Helper function for formatting currency ---
function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

// --- Main function to print the receipt ---
function printReceipt(data) {
    // Define the typical character width for your printer (e.g., 32, 40, 42, 48)
    // This is crucial for manual alignment of text.
    const totalLineWidth = 42; // Adjust this to your printer's column width
    console.log('==========data===========',data)
    device.open(function(error) {
        if (error) {
            console.error("Printer connection error:", error);
            // Common network errors:
            // - ECONNREFUSED: Printer IP is wrong, printer is off, or firewall is blocking.
            // - ETIMEDOUT: Printer is not responding, network issue.
            return;
        }

        try {
            printer
                .init() // Initialize printer (sends ESC @)

                // Restaurant Name and Phone
                .align('ct') // Center alignment
                .style('b')  // Bold style
                .size(1, 1) // Double height and width
                .text(data.restaurantName)
                .text(data.restaurantPhone)
                .size(0, 0) // Reset to normal size
                .style('normal') // Reset to normal style
                .feed(1)

                // Confirmation and Order Number
                .align('lt') // Left alignment
                .text(`Confirmation code: ${data.confirmationCode}`)
                .text(`Order # ${data.orderNumber}`)
                .text(`Order placed on ${data.orderPlacedTimestamp}`)
                .feed(1)

                // Delivery Section Header
                .style('b') // Keep text bold
                .setReverseColors(true) // Set background to black, text to white
                .text(data.deliveryType) // This text will be inverted
                .setReverseColors(false) // Reset to normal (black text on white background)
                .style('normal') // Reset style if only the header was bold
                .text(`Ready for driver by ${data.readyForDriverBy}`) // This text will be normal
                .feed(1)

                // Delivery Address
                .text("Deliver to:")
                .text(data.deliveryAddress.name)
                .text(data.deliveryAddress.street)
                .text(data.deliveryAddress.cityStateZip)
                .text(data.deliveryAddress.phone)
                .feed(1)

                // Contact-Free Delivery Instructions
                .style('b')
                .text("Contact-free delivery")
                .style('normal');
            data.contactFreeDeliveryInstructions.forEach(line => printer.text(line));
            printer.feed(1);

            // Items Header
            printer
                .style('b')
                .text(`${data.items.length} items`)
                .style('normal')
                .text('-'.repeat(totalLineWidth)) // Separator line

            // Items List
            data.items.forEach(item => {
                const itemNamePart = `${item.quantity} x ${item.name}`;
                const itemPricePart = formatCurrency(item.price);
                const spacesCount = totalLineWidth - itemNamePart.length - itemPricePart.length;
                const itemLine = itemNamePart + ' '.repeat(Math.max(0, spacesCount)) + itemPricePart;

                printer.text(itemLine);
                if (item.notes) {
                    printer.text(`  ${item.notes}`); // Indent notes
                }
            });
            printer
                .text('-'.repeat(totalLineWidth)) // Separator line
                .feed(1);

            // Extras (Plates, Utensils)
            const extrasQuestionLine1 = "Include plates, utensils,";
            const extrasQuestionLine2 = "napkins, condiment packets,";
            const extrasQuestionLine3 = "etc.?";
            const extrasAnswer = data.includeExtras;

            printer.text(extrasQuestionLine1);
            printer.text(extrasQuestionLine2);

            const spacesForExtrasAnswer = totalLineWidth - extrasQuestionLine3.length - extrasAnswer.length;
            printer.text(extrasQuestionLine3 + ' '.repeat(Math.max(0, spacesForExtrasAnswer)) + extrasAnswer);
            printer.feed(1);

            // Totals
            const subtotalLabel = "Subtotal";
            const subtotalValue = formatCurrency(data.subtotal);
            printer.text(subtotalLabel + ' '.repeat(totalLineWidth - subtotalLabel.length - subtotalValue.length) + subtotalValue);

            const taxesLabel = "Taxes";
            const taxesValue = formatCurrency(data.taxes);
            printer.text(taxesLabel + ' '.repeat(totalLineWidth - taxesLabel.length - taxesValue.length) + taxesValue);

            printer.style('b');
            const totalLabel = "RESTAURANT TOTAL";
            const totalValue = formatCurrency(data.restaurantTotal);
            printer.text(totalLabel + ' '.repeat(totalLineWidth - totalLabel.length - totalValue.length) + totalValue);
            printer.style('normal');
            printer.feed(1);

            // Payment Status
            printer
                .align('ct')
                .style('b')
                .text(data.paymentStatus)
                .text(data.paymentInstruction)
                .style('normal')
                .feed(1);

            // Footer
            data.footerLines.forEach(line => printer.text(line));
            printer
                .feed(3) // Feed a few lines before cutting
                .cut()   // Cut paper (usually partial cut)
                .close(function() { // Close the connection
                    console.log("Printer connection closed.");
                });

            console.log("Receipt printing commands sent.");

        } catch (e) {
            console.error("Error during printing sequence:", e);
            // Attempt to close connection on error as well
            printer.close(function() {
                console.log("Printer connection closed after error.");
            });
        }
    });
}

// --- Run the print function ---
// This will attempt to connect to the printer and print the receipt.
// Ensure your printer is connected and configured correctly with the specified IP.
printReceipt(receiptData);

// To actually run this:
// 1. Save as main.js
// 2. Ensure Node.js and npm are installed.
// 3. Run `npm install escpos` in the same directory.
// 4. Configure the `device` with your printer's IP address at the top of this script.
// 5. Ensure your printer is on, connected to the network, and has the correct IP.
// 6. Run `node main.js` from your terminal.
