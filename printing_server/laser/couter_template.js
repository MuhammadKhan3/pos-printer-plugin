const PDFDocument = require("pdfkit");
const fs = require("fs");
const os=require('os')
const path=require('path')

const color = "black";
const size = "A4";
const font = "Times-Roman";

function laserCounterReceipt(body, fileName, res) {
  let doc = new PDFDocument({ size: size });
  let pathFile = path.join(__dirname,fileName);
  let items = body.items;

  generateHeader(doc, body);

  generateCustomerInformation(doc, body);
  doc.moveDown();
  doc.moveDown();

  generateTableHeader(doc);

  items.forEach((row, i) => {
    row.qty = i + 1;
    generateTableRow(doc, row);
    addPage(doc);
  });

  doc.moveDown();

  const { subTotal, deliveryCharge, rackDep, tax, total, deposit, balance } =
    body;

  generateLables("SUB TOTAL", subTotal.toFixed(2), doc);
  generateLables("DELIVERY CHARGE", deliveryCharge, doc);
  generateLables("RACK DEP.", rackDep, doc);
  generateLables("TAX", tax, doc);
  generateLables("TOTAL", total, doc);

  generateLables("DEPOSIT", deposit, doc);
  generateLables("BALANCE", balance, doc);

  generateFooter(doc);
  // doc.pipe(res);
  
  
  doc.pipe(fs.createWriteStream(pathFile));
  // const ip=os.networkInterfaces()['Wi-Fi'].find(d=>d.family==='IPv4');
  // const ipAddress=ip.address;---------ip address of the system
  res.json({url:`http://localhost:8080/invoice.pdf`})
  doc.end();

}

function generateLables(label, value, doc) {
  const y = doc.y;
  const gap = 13;
  doc
    .fontSize(13)
    .text(label, 300, y, { align: "RIGHT" })
    .moveDown()
    .strokeColor(color)
    .lineWidth(1)
    .moveTo(doc.x, y + gap)
    .lineTo(580, y + gap)
    .stroke();
  generateVerticalHr(doc, 440, y - gap);

  doc.text(value, 450, y, { align: "left" });
  doc.moveDown();
  addPage(doc);
}

function generateTableHeader(doc) {
  generateHr(doc, doc.y);

  generateVerticalHr(doc, 90, doc.y);
  generateVerticalHr(doc, 130, doc.y);
  generateVerticalHr(doc, 440, doc.y);

  const y = doc.y + 10;

  doc
    .font(font)
    .fillColor(color)
    .fontSize(12)
    .text("DEPT", 10, y, { align: "left" })
    .text("QTY", 100, y, { align: "left" })
    .text("DESCRIPTION", 135, y, { align: "left" })
    .text("AMOUNT", 450, y, { align: "left" });

  generateHr(doc, doc.y);
}

function generateTableRow(doc, row) {
  const { description, qty, dept, amount } = row;

  generateVerticalHr(doc, 90, doc.y);
  generateVerticalHr(doc, 130, doc.y);
  generateVerticalHr(doc, 440, doc.y);

  const y = doc.y + 10;

  doc
    .font(font)
    .fillColor(color)
    .fontSize(12)
    .text(`${dept}`, 10, y, { align: "left" })
    .text(`${qty}`, 100, y, { align: "left" })
    .text(`${description}`, 135, y, { align: "left" })
    .text(`${amount}`, 450, y, { align: "left" });
  generateHr(doc, doc.y + 5);
}

function generateCustomerInformation(doc, body) {
  let { name, phone, address } = body?.customerInfo;
  let { orderDate } = body;
  generateHr(doc, 120);
  generateVerticalHr(doc, 280, 120);
  doc
    .font(font)
    .fillColor(color)
    .fontSize(13)
    .text(`DATE:${orderDate}`, 10, 135, { align: "left" })
    .text(`PHONE:${phone}`, 285, 135, { align: "left" });
  generateHr(doc, 150);
  doc.moveDown();

  doc
    .font(font)
    .fillColor(color)
    .fontSize(13)
    .text(`NAME:${name}`, 10, doc.y, { align: "left" });
  doc.moveDown();
  generateHr(doc, 180);

  doc
    .font(font)
    .fillColor(color)
    .fontSize(13)
    .text(`Address:${address}`, 10, doc.y, { align: "left" });
  doc.moveDown();
  generateHr(doc, 210);
  // doc.moveDown();
}

function generateHeader(doc, body) {
  let { address, phone, fax, websiteUrl } = body?.businessInfo;
  let { serialNo } = body;

  doc
    .font(font)
    .fillColor(color)
    .image(path.join(__dirname,'logo.png'), 180, 10, { width: 200 })
    .fontSize(10)
    .text(`${address}`, 10, 15, { align: "left" })
    // .text(`${address[1]}`, 10, 30, { align: "left" })
    .text(`Tel:${phone}`, 10, 40, { align: "left" })
    .text(`Fax:${fax}`, 10, 50, { align: "left" })
    .text(`${websiteUrl}`, 400, 20, {
      width: 150,
      align: "left",
    })
    .font("Helvetica")
    .fontSize(15)
    .text(serialNo, 450, 30, { align: "left" });
}

function generateHr(doc, y) {
  doc.strokeColor(color).lineWidth(1).moveTo(10, y).lineTo(580, y).stroke();
}

function generateVerticalHr(doc, x, y) {
  doc
    .strokeColor(color)
    .lineWidth(1)
    .moveTo(x, y)
    .lineTo(x, y + 30)
    .stroke();
}

function generateFooter(doc) {
  doc
    .fontSize(15)
    .text(
      "All Claims & Returned Goods Must Be Accompanied by this invoice",
      50,
      doc.y,
      { align: "center", width: 500 }
    )
    .text("Thank You", 50, doc.y, { align: "center", width: 500 });
}

function addPage(doc) {
  if (doc.y > 700) {
    doc.addPage();
  }
}
module.exports = { laserCounterReceipt };
