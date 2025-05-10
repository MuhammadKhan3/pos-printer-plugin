const escpos = require('escpos');

// Network adapter
const device  = new escpos.Network('192.168.18.245');
const printer = new escpos.Printer(device);

// Sample data (as before)
const storeInfo = { /* … */ };
const deliveryInfo = { /* … */ };
const cartItems = [ /* … */ ];
const formatCurrency = amt => '$' + amt.toFixed(2);
const totalPerItem = item => item.quantityToSell * item.price;

// Layout constants
const LINE_WIDTH = 42;
const DIVIDER = '-'.repeat(LINE_WIDTH);
const padRight = (t, l) => (t + ' '.repeat(l)).substring(0, l);
const centerText = (t, w) => {
  const pad = Math.max(0, w - t.length) / 2;
  return ' '.repeat(Math.floor(pad)) + t + ' '.repeat(Math.ceil(pad));
};
// Draw a single-line boxed header
const drawHeaderBox = (text) => [
  '┌' + '─'.repeat(LINE_WIDTH - 2) + '┐',
  '│' + centerText(text, LINE_WIDTH - 2) + '│',
  '└' + '─'.repeat(LINE_WIDTH - 2) + '┘'
].join('\n');

device.open(err => {
  if (err) return console.error('Printer connection error:', err);

  // calculate totals
  let subtotal = cartItems.reduce((sum, i) => sum + totalPerItem(i), 0);
  const tax = subtotal * 0.08625;
  const total = subtotal + tax;

  try {
    // — Store Header —
    printer
      .encode('GB18030')
      .font('A')
      .align('CT')
      .style('B')
      .size(2, 2)
      .text(storeInfo.name)
      .size(1, 1)
      .style('NORMAL')
      .text(storeInfo.phone)
      .text(`Confirmation: ${storeInfo.confirmationCode}`)
      .text(`Order #: ${storeInfo.orderNumber}`)
      .text(`Placed: ${storeInfo.orderDate}`)
      .text('\n');

    // — DELIVERY Header Box —
    printer
      .align('LT')
      .style('B')
      .text(drawHeaderBox('DELIVERY'))
      .style('NORMAL');

    // Delivery info
    printer
      .text(`Ready for driver by ${deliveryInfo.readyTime}`)
      .text(DIVIDER)
      .text('Deliver to:')
      .text(deliveryInfo.customerName)
      .text(deliveryInfo.address)
      .text(deliveryInfo.cityStateZip)
      .text(deliveryInfo.phone)
      .text(DIVIDER)
      .text('\n');

    // — CONTACT‑FREE Header Box —
    printer
      .style('B')
      .text(drawHeaderBox('CONTACT‑FREE DELIVERY'))
      .style('NORMAL')
      .text('1. Leave at front door')
      .text('2. Text customer')
      .text('\n');

    // — Items —
    printer
      .style('B')
      .text(`${cartItems.length} Items`)
      .style('NORMAL')
      .text(DIVIDER);

    cartItems.forEach(item => {
      const lineTotal = totalPerItem(item);
      printer
        .text(`${item.quantityToSell} x ${item.title}`)
        .align('RT')
        .text(formatCurrency(lineTotal))
        .align('LT');
      if (item.category && !item.category.startsWith('dvhfgnfgjfjg')) {
        printer.text(`  • ${item.category}`);
      }
      printer.text('');
    });

    // — Totals —
    printer
      .text(DIVIDER)
      .align('RT')
      .text(`Subtotal ${formatCurrency(subtotal)}`)
      .text(`Tax      ${formatCurrency(tax)}`)
      .style('B')
      .text(`TOTAL    ${formatCurrency(total)}`)
      .style('NORMAL')
      .align('LT')
      .text(DIVIDER)
      .text('\n');

    // — PREPAID Box —
    printer
      .text([
        '┌──────────────────────────────┐',
        '│ PREPAID                      │',
        '│ DO NOT CHARGE               │',
        '└──────────────────────────────┘'
      ].join('\n'))
      .text('\n');

    // — Footer —
    printer
      .align('CT')
      .style('B')
      .size(1, 1)
      .text('YOUR SYSTEM NAME')
      .style('NORMAL')
      .text('Ordered via your system')
      .text('Customer Care: (800) 123-4567')
      .cut()
      .close();

    console.log('Print job sent successfully');
  } catch (printError) {
    console.error('Error during printing:', printError);
  }
});
