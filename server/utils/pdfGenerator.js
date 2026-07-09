/**
 * utils/pdfGenerator.js - pdfkit version (npm install pdfkit)
 * Replaces Puppeteer. Pure JS, ~2MB, no browser download needed.
 */

import PDFDocument from "pdfkit";

// ── Colour palette ────────────────────────────────────────────────────────────
const PURPLE = [112, 12, 235];
const DARK = [63, 12, 145];
const PURPLE2 = [138, 47, 240];
const BLACK = [15, 10, 30];
const GREY = [107, 114, 128];
const LGREY = [243, 244, 246];
const MGREY = [229, 231, 235];
const WHITE = [255, 255, 255];
const GREEN = [5, 150, 105];
const AMBER = [217, 119, 6];
const GOLD = [180, 140, 60];

// ── Formatters ────────────────────────────────────────────────────────────────
const fmtNGN = (n = 0) =>
  "₦" + Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 });
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";
const today = () => fmtDate(new Date());
const refNo = (doc) =>
  doc.referenceNumber ||
  doc._id?.toString().slice(-8).toUpperCase() ||
  "KHL-XXXX";

// ── Stream to Buffer ──────────────────────────────────────────────────────────
function streamToBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function createDoc(opts = {}) {
  return new PDFDocument({
    size: "A4",
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
    ...opts,
  });
}

// ── HEADER ────────────────────────────────────────────────────────────────────
// Single solid purple band. No overlapping shapes, no opacity calls.
// Clean left/right zones separated by a vertical rule.
function drawHeader(doc, docType, refNum) {
  const W = doc.page.width;
  const H = 90;

  // Solid header band
  doc.rect(0, 0, W, H).fill(DARK);

  // 3px accent line below header
  doc.rect(0, H, W, 3).fill(PURPLE);

  // ── Left: company name + contact ──────────────────────────────────────────
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(15)
    .text("KEMCHUTA HOMES LIMITED", 48, 18);
  doc
    .fillColor([190, 170, 240])
    .font("Helvetica")
    .fontSize(8)
    .text("Lekki, Lagos  ·  Asaba, Delta State", 48, 38);
  doc
    .fillColor([170, 152, 220])
    .font("Helvetica")
    .fontSize(7.5)
    .text("kemchutahomesltd.com  ·  info@kemchutahomesltd.com", 48, 50);

  // Vertical divider
  const divX = W * 0.6;
  doc
    .moveTo(divX, 14)
    .lineTo(divX, H - 14)
    .strokeColor([255, 255, 255])
    .lineWidth(0.5)
    .stroke();

  // ── Right: doc type + reference + date ───────────────────────────────────
  const rx = divX + 16;
  const rw = W - rx - 36;

  // Document type label
  doc
    .fillColor([170, 152, 255])
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(docType.toUpperCase(), rx, 20, {
      width: rw,
      align: "right",
      characterSpacing: 1.2,
    });

  // Reference number — most prominent
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(refNum, rx, 33, { width: rw, align: "right" });

  // Date
  doc
    .fillColor([190, 178, 240])
    .font("Helvetica")
    .fontSize(7.5)
    .text(today(), rx, 52, { width: rw, align: "right" });
}

// ── FOOTER ────────────────────────────────────────────────────────────────────
function drawFooter(doc) {
  const W = doc.page.width;
  const fh = 34;
  const fy = doc.page.height - fh;

  doc.rect(0, fy, W, fh).fill([20, 14, 40]);
  doc.rect(0, fy, W, 1.5).fill(PURPLE);

  doc
    .fillColor([140, 128, 170])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "© " +
        new Date().getFullYear() +
        " Kemchuta Homes Limited  ·  info@kemchutahomesltd.com  ·  +234 800 000 0001  ·  +234 800 000 0003",
      48,
      fy + 11,
      { align: "center", width: W - 96 },
    );
}

// ── SECTION HEADING ───────────────────────────────────────────────────────────
function sectionHeading(doc, text, y) {
  const W = doc.page.width;

  doc.rect(48, y, 3, 14).fill(PURPLE);

  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text(text.toUpperCase(), 56, y + 3, { characterSpacing: 1.2 });

  doc
    .moveTo(48, y + 17)
    .lineTo(W - 48, y + 17)
    .strokeColor(MGREY)
    .lineWidth(0.6)
    .stroke();

  return y + 24;
}

// ── INFO ROW ──────────────────────────────────────────────────────────────────
let _rowIndex = 0;
function resetRows() {
  _rowIndex = 0;
}

function infoRow(doc, label, value, y, { highlight = false } = {}) {
  const W = doc.page.width;
  const rh = 22;

  // Very subtle alternating: white vs lightest grey — no colour tint
  doc
    .rect(48, y, W - 96, rh)
    .fill(_rowIndex % 2 === 0 ? [250, 250, 253] : WHITE);
  _rowIndex++;

  if (highlight) {
    doc.rect(48, y, 3, rh).fill(PURPLE);
  }

  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8.5)
    .text(label, 58, y + 7, { width: 160 });

  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text(value || "—", 225, y + 7, { width: W - 96 - 185 });

  doc
    .moveTo(48, y + rh)
    .lineTo(W - 48, y + rh)
    .strokeColor(LGREY)
    .lineWidth(0.4)
    .stroke();

  return y + rh;
}

// ── AMOUNT BOX ────────────────────────────────────────────────────────────────
// Single solid rect — no overlapping layers, no opacity
function amountBox(doc, label, value, sub, y) {
  const W = doc.page.width;
  const bw = W - 96;
  const bh = 68;

  doc.roundedRect(48, y, bw, bh, 5).fill(DARK);

  // Left accent stripe
  doc.rect(48, y, 4, bh).fill(PURPLE);

  doc
    .fillColor([170, 152, 255])
    .font("Helvetica-Bold")
    .fontSize(7)
    .text(label.toUpperCase(), 62, y + 11, { characterSpacing: 1 });

  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(21)
    .text(value, 62, y + 23);

  if (sub) {
    doc
      .fillColor([155, 140, 205])
      .font("Helvetica")
      .fontSize(8)
      .text(sub, 62, y + 50);
  }

  return y + bh + 12;
}

// ── SIGNATURE BLOCK ───────────────────────────────────────────────────────────
function sigBlock(doc, name, title, x, y, width = 200) {
  doc
    .moveTo(x, y)
    .lineTo(x + width, y)
    .strokeColor(MGREY)
    .lineWidth(0.75)
    .dash(4, { space: 3 })
    .stroke();
  doc.undash();
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text(name, x, y + 5, { width });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7.5)
    .text(title, x, y + 17, { width });
}

// ── WATERMARK ─────────────────────────────────────────────────────────────────
// Very light fill colour instead of opacity — avoids pdfkit opacity bleed
function drawWatermark(doc, text = "KEMCHUTA HOMES") {
  doc.save();
  const W = doc.page.width;
  const H = doc.page.height;
  doc.rotate(-38, { origin: [W / 2, H / 2] });
  doc
    .fillColor([232, 224, 252])
    .font("Helvetica-Bold")
    .fontSize(54)
    .text(text, W / 2 - 200, H / 2 - 28, { width: 400, align: "center" });
  doc.restore();
}
export async function generateAcknowledgement(sub) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  resetRows();
  drawWatermark(doc);
  drawHeader(doc, "Subscription Acknowledgement", refNo(sub));
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Subscription Acknowledgement", 48, y);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text(
      "This confirms receipt of your application — not a contract.",
      48,
      y + 22,
    );
  y += 50;
  y = sectionHeading(doc, "Application Details", y);
  y = infoRow(doc, "Reference Number", refNo(sub), y);
  y = infoRow(doc, "Estate", sub.estateName, y);
  y = infoRow(doc, "Plot Type", sub.plotType, y);
  y = infoRow(doc, "Plot Size", sub.plotSize, y);
  y = infoRow(doc, "No. of Plots", String(sub.numberOfPlots), y);
  y = infoRow(doc, "Payment Plan", sub.paymentPlan, y);
  y = infoRow(doc, "Total Amount", fmtNGN(sub.totalAmount), y);
  y = infoRow(doc, "Survey Type", sub.surveyType, y);
  y = infoRow(doc, "Date Submitted", fmtDate(sub.createdAt), y);
  y = sectionHeading(doc, "Applicant", y + 10);
  y = infoRow(doc, "Full Name", fullName, y);
  y = infoRow(doc, "Email", sub.email, y);
  y = infoRow(doc, "Phone", sub.phone, y);
  y = infoRow(
    doc,
    "Address",
    `${sub.residentialAddress}, ${sub.cityTown}, ${sub.state}`,
    y,
  );
  y += 16;
  doc
    .roundedRect(48, y, doc.page.width - 96, 56, 5)
    .fillAndStroke([255, 248, 225], [245, 158, 11]);
  doc
    .fillColor(AMBER)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("IMPORTANT NOTICE", 64, y + 8);
  doc
    .fillColor([146, 64, 14])
    .font("Helvetica")
    .fontSize(9)
    .text(
      "This is not a receipt of payment or contract. Await approval before making any payment. Do not pay to any personal account.",
      64,
      y + 20,
      { width: doc.page.width - 128 },
    );
  y += 70;
  sigBlock(doc, "Authorised Signatory", "Kemchuta Homes Limited", 48, y + 30);
  sigBlock(doc, fullName, "Applicant", doc.page.width - 248, y + 30);
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateContractOfSale(sub) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName =
    `${sub.title} ${sub.firstName} ${sub.lastName}`.toUpperCase();
  const plotDesc = `${sub.numberOfPlots} ${sub.numberOfPlots === 1 ? "plot" : "plots"} of Land measuring ${sub.plotSize} each`;
  const totalSqm = sub.plotSize;

  // ── PAGE 1: Premium Cover ─────────────────────────────────────────────────
  const W = doc.page.width;
  const H = doc.page.height;

  // Full-page dark cover
  doc.rect(0, 0, W, H).fill([10, 6, 24]);

  // Left purple column
  doc.rect(0, 0, 180, H).fill(DARK);

  // Diagonal cut between column and body
  doc.polygon([160, 0], [200, 0], [200, H], [180, H]).fill([70, 15, 150]);

  // Gold horizontal rule inside left column
  doc.rect(0, 140, 180, 2).fill(GOLD);
  doc.rect(0, H - 142, 180, 2).fill(GOLD);

  // Company name — vertical in left column (rotated)
  doc.save();
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(11);
  doc.rotate(-90, { origin: [90, H / 2] });
  doc.text("KEMCHUTA HOMES LIMITED", 90 - 130, H / 2 - 6, {
    width: 260,
    align: "center",
  });
  doc.restore();

  // KHL monogram in column
  doc
    .fillColor([180, 140, 255])
    .font("Helvetica-Bold")
    .fontSize(36)
    .text("KHL", 22, 60, { width: 136, align: "center" });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(7.5)
    .text("EST. 2018", 22, 100, {
      width: 136,
      align: "center",
      letterSpacing: 2,
    });

  // Dot pattern decoration in left column
  for (let dy = 160; dy < H - 160; dy += 24) {
    for (let dx = 14; dx < 160; dx += 24) {
      doc.circle(dx, dy, 1.2).fill([40, 30, 70]);
    }
  }

  // ── Right side: document title block ─────────────────────────────────────
  const rx = 230;
  const rw = W - rx - 40;

  // Gold accent rule at top
  doc.rect(rx, 60, rw, 2).fill(GOLD);

  // Document title
  doc
    .fillColor([200, 180, 255])
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("LEGAL DOCUMENT", rx, 76, { letterSpacing: 2.5 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(34)
    .text("CONTRACT", rx, 96, { lineGap: -2 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(34)
    .text("OF SALE", rx, 128);

  // Gold underline under title
  doc.rect(rx, 168, 120, 3).fill(GOLD);

  // Reference chip
  doc
    .roundedRect(rx, 188, rw, 40, 6)
    .fillAndStroke([35, 22, 65], [60, 45, 100]);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(7.5)
    .text("REFERENCE NO.", rx + 14, 198, { letterSpacing: 1.5 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(refNo(sub), rx + 14, 210);

  // ── BETWEEN block ────────────────────────────────────────────────────────
  let cy = 268;
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(8)
    .text("BETWEEN", rx, cy, { letterSpacing: 2 });
  cy += 22;

  // Vendor box
  doc.roundedRect(rx, cy, rw, 58, 6).fill([38, 25, 68]);
  doc.rect(rx, cy, 3, 58).fill(GOLD);
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("KEMCHUTA HOMES LIMITED", rx + 14, cy + 10);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(8.5)
    .text("THE VENDOR", rx + 14, cy + 28);
  doc
    .fillColor([140, 120, 180])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "K/M 42, Lekki-Epe Expressway, Abijo, Lagos State, Nigeria",
      rx + 14,
      cy + 40,
    );
  cy += 70;

  doc
    .fillColor([180, 160, 220])
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text("AND", rx, cy, { letterSpacing: 2 });
  cy += 20;

  // Purchaser box
  doc.roundedRect(rx, cy, rw, 58, 6).fill([38, 25, 68]);
  doc.rect(rx, cy, 3, 58).fill(PURPLE2);
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(fullName, rx + 14, cy + 10, { width: rw - 20 });
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(8.5)
    .text("THE PURCHASER", rx + 14, cy + 30);
  doc
    .fillColor([140, 120, 180])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      `${sub.residentialAddress || ""}, ${sub.cityTown || ""}, ${sub.state || ""}, Nigeria`
        .trim()
        .replace(/^,\s*/, ""),
      rx + 14,
      cy + 42,
      { width: rw - 20 },
    );
  cy += 70;

  // ── Estate summary chip ──────────────────────────────────────────────────
  doc.roundedRect(rx, cy + 10, rw, 52, 6).fill([32, 20, 58]);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(7.5)
    .text("ESTATE", rx + 14, cy + 20, { letterSpacing: 1.5 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(sub.estateName?.toUpperCase() || "—", rx + 14, cy + 32, {
      width: rw - 28,
    });
  doc
    .fillColor([140, 120, 180])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      `${plotDesc}  ·  Total Consideration: ${fmtNGN(sub.totalAmount)}`,
      rx + 14,
      cy + 47,
      { width: rw - 28 },
    );
  cy += 74;

  // ── Prepared by ──────────────────────────────────────────────────────────
  doc
    .fillColor([140, 120, 180])
    .font("Helvetica")
    .fontSize(7.5)
    .text("Prepared by:", rx, cy + 4);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("Obinna Obiegue Esq.  ·  Dozie & Co.", rx, cy + 16);
  doc
    .fillColor([120, 100, 160])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      "66, Awolowo Road, South West, Ikoyi – Lagos.  ·  legal@kemchutahomesltd.com",
      rx,
      cy + 28,
      { width: rw },
    );

  // Gold rule at bottom
  doc.rect(rx, H - 60, rw, 1).fill([120, 95, 42]);
  doc
    .fillColor([120, 100, 160])
    .font("Helvetica")
    .fontSize(7)
    .text(
      `Date: ${today()}  ·  © ${new Date().getFullYear()} Kemchuta Homes Limited`,
      rx,
      H - 48,
      { width: rw },
    );

  // ── PAGE 2: Recitals ─────────────────────────────────────────────────────
  doc.addPage();
  drawWatermark(doc);
  drawHeader(doc, "Contract of Sale", refNo(sub));
  const TW = doc.page.width - 96; // text width
  let y = 126;

  // Date line — with boxes to fill in
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("THIS CONTRACT OF SALE", 48, y);
  y += 15;
  doc
    .fillColor(BLACK)
    .font("Helvetica")
    .fontSize(9.5)
    .text(
      `is made this ______________ day of ______________________________ ${new Date().getFullYear()}`,
      48,
      y,
      { width: TW },
    );
  y += 28;

  // Thin rule
  doc
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 16;

  // Party intro text
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text("BETWEEN", 48, y, { continued: false });
  y += 14;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      "KEMCHUTA HOMES LIMITED of K/M 42, Lekki - Epe Expressway, Green Gate Beside Car Wash, Opp. Mesia Filling Station, Kingdom Hall Bus Stop, Abijo, Lekki Peninsula, Lagos State (hereinafter referred to as ",
      48,
      y,
      { width: TW, continued: true },
    );
  doc.font("Helvetica-Bold").text("'THE VENDOR'", { continued: true });
  doc.font("Helvetica").text(") of the ONE PART.", { continued: false });
  y = doc.y + 12;

  doc.font("Helvetica").fontSize(9.5).fillColor(BLACK).text("AND", 48, y);
  y += 14;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      `${fullName} of ${sub.residentialAddress || ""}, ${sub.cityTown || ""}, ${sub.state || ""}, Nigeria (hereinafter referred to as `,
      48,
      y,
      { width: TW, continued: true },
    );
  doc.font("Helvetica-Bold").text("'THE PURCHASER'", { continued: true });
  doc.font("Helvetica").text(") of the OTHER PART.", { continued: false });
  y = doc.y + 18;

  // Whereas heading
  doc
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 14;
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("WHEREAS:", 48, y);
  y += 16;

  const clauses = [
    `(a)  The Vendor is the operator of "${(sub.estateName || "").toUpperCase()}" at ${sub.residentialAddress || "Ibeju-Lekki Area"}, Lagos State.`,
    `(b)  This is a scheme whereby an interested person or corporate body can subscribe to land at an agreed sum after which a parcel of land is allocated at a designated location.`,
    `(c)  The PURCHASER has applied to subscribe and the VENDOR has accepted that the PURCHASER be subscribed to the scheme at ${(sub.estateName || "").toUpperCase()}.`,
    `(d)  The PURCHASER has now subscribed to ${plotDesc}, at a total of ${totalSqm} in the estate area.`,
  ];
  clauses.forEach((c) => {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(BLACK)
      .text(c, 54, y, { width: TW - 6, lineGap: 1.5 });
    y = doc.y + 10;
  });

  drawFooter(doc);

  // ── PAGE 3: Agreement Clauses ─────────────────────────────────────────────
  doc.addPage();
  drawWatermark(doc);
  drawHeader(doc, "Contract of Sale — Agreement", refNo(sub));
  y = 126;

  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("2.  NOW THIS AGREEMENT WITNESSETH as follows:", 48, y, {
      width: TW,
    });
  y += 18;

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text("IN CONSIDERATION of the sum of ", 48, y, {
      width: TW,
      continued: true,
    });
  doc
    .font("Helvetica-Bold")
    .text(`${fmtNGN(sub.totalAmount)}`, { continued: true });
  doc
    .font("Helvetica")
    .text(
      ` (Naira only), receipt of which is hereby acknowledged, the VENDOR shall allocate ${sub.numberOfPlots} Plot(s) of land, measuring ${totalSqm}, to the PURCHASER at ${(sub.estateName || "").toUpperCase()}.`,
      { continued: false },
    );
  y = doc.y + 20;

  doc
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 14;
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("3.  THE VENDOR COVENANTS WITH THE PURCHASER as follows:", 48, y, {
      width: TW,
    });
  y += 16;
  [
    "(a)  To allocate the Plot(s) of Land to the PURCHASER at the time of allocation.",
    "(b)  To refund the total money contributed less 40% administrative charges and 10% Agency Fee, if the PURCHASER is no longer interested in the Scheme before taking full possession.",
    "(c)  To indemnify the PURCHASER against loss, adverse claimant and lawsuit.",
  ].forEach((c) => {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(BLACK)
      .text(c, 54, y, { width: TW - 6, lineGap: 1.5 });
    y = doc.y + 10;
  });

  y += 6;
  doc
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 14;
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("4.  THE PURCHASER COVENANTS WITH THE VENDOR as follows:", 48, y, {
      width: TW,
    });
  y += 16;
  [
    "(a)  To pay for Survey and legal fees in respect of the Plot(s) of Land.",
    "(b)  If the PURCHASER wishes to withdraw from this Scheme/contract of sale at any time:\n       (i)   To give a notice of 90 days, and 60 days thereafter if the refund is not ready.\n       (ii)  An administrative charge of 40% and Agency fee of 10% shall be deducted.",
  ].forEach((c) => {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(BLACK)
      .text(c, 54, y, { width: TW - 6, lineGap: 1.5 });
    y = doc.y + 10;
  });

  y += 6;
  doc
    .moveTo(48, y)
    .lineTo(doc.page.width - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 14;
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("5.  IT IS HEREBY FURTHER agreed that:", 48, y, { width: TW });
  y += 14;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      "Both parties covenant to uphold these presents and be bound by the terms of this contract.",
      54,
      y,
      { width: TW - 6 },
    );

  drawFooter(doc);

  // ── PAGE 4: Execution ────────────────────────────────────────────────────
  doc.addPage();
  drawWatermark(doc);
  drawHeader(doc, "Contract of Sale — Execution", refNo(sub));
  y = 126;

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      "IN WITNESS WHEREOF, the Parties have hereto set their hands and sealed the day and year first above written.",
      48,
      y,
      { width: TW, lineGap: 1.5 },
    );
  y += 36;

  // ── VENDOR execution block ────────────────────────────────────────────────
  doc.roundedRect(48, y, TW, 90, 6).fill([250, 248, 255]);
  doc.rect(48, y, 4, 90).fill(GOLD);
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("SIGNED, SEALED AND DELIVERED", 62, y + 10);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text("By the within named VENDOR — KEMCHUTA HOMES LIMITED", 62, y + 23);
  // Sig lines inside box
  doc
    .moveTo(62, y + 66)
    .lineTo(200, y + 66)
    .strokeColor(MGREY)
    .lineWidth(0.8)
    .stroke();
  doc
    .moveTo(260, y + 66)
    .lineTo(420, y + 66)
    .strokeColor(MGREY)
    .lineWidth(0.8)
    .stroke();
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("DIRECTOR", 62, y + 70);
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("SECRETARY", 260, y + 70);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7)
    .text("Kemchuta Homes Limited", 62, y + 80);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7)
    .text("Kemchuta Homes Limited", 260, y + 80);
  y += 106;

  // ── PURCHASER execution block ─────────────────────────────────────────────
  doc.roundedRect(48, y, TW, 90, 6).fill([248, 245, 255]);
  doc.rect(48, y, 4, 90).fill(PURPLE);
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("SIGNED, SEALED AND DELIVERED", 62, y + 10);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text("By the within named PURCHASER", 62, y + 23);
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(fullName, 62, y + 36, { width: TW - 20 });
  doc
    .moveTo(62, y + 66)
    .lineTo(280, y + 66)
    .strokeColor(MGREY)
    .lineWidth(0.8)
    .dash(3, { space: 2 })
    .stroke();
  doc.undash();
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7.5)
    .text("Signature of Purchaser", 62, y + 70);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text("Date: _______________________", 62, y + 80);
  y += 106;

  // ── Witness block ─────────────────────────────────────────────────────────
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("IN THE PRESENCE OF:", 48, y);
  y += 16;
  [
    ["Name", ""],
    ["Address", ""],
    ["Occupation", ""],
    ["Signature", ""],
    ["Date", ""],
  ].forEach(([label]) => {
    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(8.5)
      .text(label + ":", 48, y, { width: 90 });
    doc
      .moveTo(130, y + 10)
      .lineTo(doc.page.width - 48, y + 10)
      .strokeColor(LGREY)
      .lineWidth(0.8)
      .stroke();
    y += 24;
  });

  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generatePaymentInvoice(sub, banks = []) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  const deposit =
    sub.paymentPlan === "Outright"
      ? sub.totalAmount
      : Math.round(sub.totalAmount * 0.3);
  const balance = sub.totalAmount - deposit;
  const ref = refNo(sub);
  const W = doc.page.width;
  resetRows();

  drawWatermark(doc, "INVOICE");
  drawHeader(doc, "Payment Invoice", `INV-${ref}`);

  let y = 126;

  // ── Title + tagline ──────────────────────────────────────────────────────
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("PAYMENT INVOICE", 48, y);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(9)
    .text(
      "Please make payment as detailed below to secure your property.",
      48,
      y + 26,
    );
  y += 52;

  // ── Two-column top: Bill To (left) | Invoice Meta (right) ────────────────
  const colW = (W - 96 - 16) / 2;

  // Bill To box
  doc.roundedRect(48, y, colW, 100, 8).fill([250, 248, 255]);
  doc.rect(48, y, 4, 100).fill(PURPLE);
  doc
    .fillColor([130, 100, 180])
    .font("Helvetica-Bold")
    .fontSize(7)
    .text("BILL TO", 62, y + 10, { letterSpacing: 1.5 });
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(fullName, 62, y + 24, { width: colW - 20 });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8.5)
    .text(sub.email || "", 62, y + 42, { width: colW - 20 });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8.5)
    .text(sub.phone || "", 62, y + 54, { width: colW - 20 });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text(
      `${sub.residentialAddress || ""}, ${sub.cityTown || ""}, ${sub.state || ""}`
        .replace(/^,\s*/, "")
        .replace(/,\s*,/g, ","),
      62,
      y + 68,
      { width: colW - 20, lineGap: 1 },
    );

  // Invoice meta box
  const mx = 48 + colW + 16;
  doc.roundedRect(mx, y, colW, 100, 8).fill([250, 248, 255]);
  doc.rect(mx, y, 4, 100).fill(GOLD);
  doc
    .fillColor([130, 100, 140])
    .font("Helvetica-Bold")
    .fontSize(7)
    .text("INVOICE DETAILS", mx + 14, y + 10, { letterSpacing: 1.5 });

  const metaRows = [
    ["Invoice No.", `INV-${ref}`],
    ["Date Issued", today()],
    ["Estate", sub.estateName || "—"],
    ["Payment Plan", sub.paymentPlan || "—"],
  ];
  let my = y + 28;
  metaRows.forEach(([lbl, val]) => {
    doc
      .fillColor(GREY)
      .font("Helvetica")
      .fontSize(7.5)
      .text(lbl, mx + 14, my, { width: 80 });
    doc
      .fillColor(BLACK)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(val, mx + 100, my, { width: colW - 110 });
    my += 16;
  });
  y += 116;

  // ── Plot details ─────────────────────────────────────────────────────────
  y = sectionHeading(doc, "Property Details", y);
  y = infoRow(doc, "Estate Name", sub.estateName || "—", y);
  y = infoRow(doc, "Plot Type", sub.plotType || "—", y);
  y = infoRow(
    doc,
    "Plot Size",
    `${sub.plotSize || "—"} × ${sub.numberOfPlots} plot(s)`,
    y,
  );
  y = infoRow(doc, "Survey Type", sub.surveyType || "—", y);
  y += 6;

  // ── Amount summary table ─────────────────────────────────────────────────
  y = sectionHeading(doc, "Payment Summary", y);

  // Table header row
  doc.rect(48, y, W - 96, 24).fill(DARK);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(8.5);
  doc.text("Description", 60, y + 8, { width: 240 });
  doc.text("Amount", W - 160, y + 8, { width: 100, align: "right" });
  y += 24;

  const tableRows = [
    ["Total Purchase Price", fmtNGN(sub.totalAmount), false],
    [
      `Initial Deposit Due (${sub.paymentPlan === "Outright" ? "100" : "30"}%)`,
      fmtNGN(deposit),
      true,
    ],
    ["Balance Remaining", fmtNGN(balance), false],
  ];
  tableRows.forEach(([desc, amt, highlight], i) => {
    const bg = highlight
      ? [240, 235, 255]
      : i % 2 === 0
        ? WHITE
        : [250, 248, 255];
    doc.rect(48, y, W - 96, 24).fill(bg);
    if (highlight) doc.rect(48, y, 4, 24).fill(PURPLE);
    doc
      .fillColor(highlight ? DARK : BLACK)
      .font(highlight ? "Helvetica-Bold" : "Helvetica")
      .fontSize(9)
      .text(desc, 60, y + 8, { width: 240 });
    doc
      .fillColor(highlight ? PURPLE : BLACK)
      .font(highlight ? "Helvetica-Bold" : "Helvetica")
      .fontSize(9)
      .text(amt, W - 160, y + 8, { width: 100, align: "right" });
    y += 24;
  });
  y += 10;

  // ── BIG amount box ────────────────────────────────────────────────────────
  y = amountBox(
    doc,
    "Amount Due Now — Initial Deposit",
    fmtNGN(deposit),
    `Payment Plan: ${sub.paymentPlan}  ·  Balance after deposit: ${fmtNGN(balance)}`,
    y,
  );

  // ── Bank payment details ─────────────────────────────────────────────────
  y = sectionHeading(doc, "Bank Payment Details", y + 4);

  // Render each active bank account
  const activeBanks = banks.length
    ? banks
    : [
        {
          bankName: "ACCESS BANK PLC",
          accountName: "KEMCHUTA HOMES LIMITED",
          accountNumber: "Contact admin for account number",
          sortCode: "",
          note: "",
        },
      ];

  activeBanks.forEach((bank, idx) => {
    const bh = 22 * (3 + (bank.sortCode ? 1 : 0)) + 20;
    doc.roundedRect(48, y, W - 96, bh, 6).fill([245, 243, 255]);
    doc.rect(48, y, 4, bh).fill(idx === 0 ? DARK : PURPLE);

    if (activeBanks.length > 1) {
      doc
        .fillColor(PURPLE)
        .font("Helvetica-Bold")
        .fontSize(7)
        .text(
          bank.isPrimary ? "★ PRIMARY ACCOUNT" : `ACCOUNT ${idx + 1}`,
          62,
          y + 8,
          { characterSpacing: 1 },
        );
    }

    const labelY = activeBanks.length > 1 ? y + 18 : y + 10;
    const rows = [
      ["Bank Name", bank.bankName],
      ["Account Name", bank.accountName],
      ["Account Number", bank.accountNumber],
      ...(bank.sortCode ? [["Sort Code", bank.sortCode]] : []),
    ];
    rows.forEach(([lbl, val], ri) => {
      const ry = labelY + ri * 20;
      doc
        .fillColor([130, 100, 180])
        .font("Helvetica")
        .fontSize(8)
        .text(lbl, 62, ry, { width: 150 });
      doc
        .fillColor(DARK)
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .text(val, 220, ry, { width: W - 280 });
    });

    if (bank.note) {
      doc
        .fillColor(GREY)
        .font("Helvetica")
        .fontSize(7.5)
        .text(bank.note, 62, labelY + rows.length * 20, { width: W - 130 });
    }

    y += bh + 8;
  });

  // Payment reference row — always shown once, prominent
  doc.roundedRect(48, y, W - 96, 28, 5).fill(DARK);
  doc.rect(48, y, 4, 28).fill(PURPLE);
  doc
    .fillColor([180, 160, 255])
    .font("Helvetica-Bold")
    .fontSize(7.5)
    .text("PAYMENT REFERENCE — quote this on every transfer", 62, y + 4, {
      width: W - 130,
    });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(ref, 62, y + 14, { width: W - 130 });
  y += 38;

  // ── Warning notice ────────────────────────────────────────────────────────
  doc.roundedRect(48, y, W - 96, 52, 6).fill([255, 251, 230]);
  doc.rect(48, y, 4, 52).fill(AMBER);
  doc
    .fillColor([146, 64, 14])
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("⚠  IMPORTANT PAYMENT NOTICE", 62, y + 10);
  doc
    .fillColor([120, 60, 10])
    .font("Helvetica")
    .fontSize(8)
    .text(
      `Always quote reference ${ref} on your bank transfer narration. Send proof of payment to info@kemchutahomesltd.com or WhatsApp. Kemchuta Homes Limited will NEVER request payment into a personal account.`,
      62,
      y + 24,
      { width: W - 120, lineGap: 1 },
    );

  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateInstallmentSchedule(sub) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  const deposit = Math.round(sub.totalAmount * 0.3);
  const balance = sub.totalAmount - deposit;
  const monthly = Math.round(balance / 5);
  const schedule = sub.installmentSchedule?.length
    ? sub.installmentSchedule
    : [
        { dueDate: new Date(), amount: deposit, isPaid: false },
        ...Array.from({ length: 5 }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() + i + 1);
          return { dueDate: d, amount: monthly, isPaid: false };
        }),
      ];
  resetRows();
  drawWatermark(doc, "SCHEDULE");
  drawHeader(doc, "Instalment Schedule", refNo(sub));
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Instalment Payment Schedule", 48, y);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text(`${sub.estateName} — ${fullName}`, 48, y + 22);
  y += 50;
  y = sectionHeading(doc, "Summary", y);
  y = infoRow(doc, "Total", fmtNGN(sub.totalAmount), y);
  y = infoRow(doc, "Deposit (30%)", fmtNGN(deposit), y);
  y = infoRow(doc, "Monthly", fmtNGN(monthly), y);
  y += 10;
  y = sectionHeading(doc, "Schedule", y);
  doc.rect(48, y, doc.page.width - 96, 22).fill(PURPLE);
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(9);
  doc.text("#", 52, y + 7);
  doc.text("Description", 70, y + 7);
  doc.text("Due Date", 250, y + 7);
  doc.text("Amount", 360, y + 7);
  doc.text("Status", 460, y + 7);
  y += 26;
  schedule.forEach((s, i) => {
    doc
      .rect(48, y, doc.page.width - 96, 20)
      .fill(i % 2 === 0 ? WHITE : [249, 246, 255]);
    doc.fillColor(BLACK).font("Helvetica").fontSize(9);
    doc.text(String(i + 1), 52, y + 6);
    doc.text(
      i === 0 ? "Initial Deposit (30%)" : `Month ${i} Instalment`,
      70,
      y + 6,
      { width: 175 },
    );
    doc.text(fmtDate(s.dueDate), 250, y + 6);
    doc.text(fmtNGN(s.amount), 360, y + 6, { width: 95 });
    doc
      .fillColor(s.isPaid ? GREEN : AMBER)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text(s.isPaid ? "PAID" : "DUE", 460, y + 6);
    doc.fillColor(BLACK);
    y += 22;
  });
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateReceipt(sub, payment) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  const receiptNo = `RCT-${refNo(sub)}-${String(sub.payments?.length || 1).padStart(2, "0")}`;
  resetRows();
  drawWatermark(doc, "RECEIPT");
  drawHeader(doc, "Official Receipt", receiptNo);
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Official Payment Receipt", 48, y);
  y += 32;
  y = amountBox(
    doc,
    "Amount Received",
    fmtNGN(payment.amount),
    `Date: ${fmtDate(payment.paidAt)}  ·  ${payment.method || "Bank Transfer"}`,
    y,
  );
  y = sectionHeading(doc, "Receipt Details", y + 8);
  y = infoRow(doc, "Receipt No.", receiptNo, y);
  y = infoRow(doc, "Reference", refNo(sub), y);
  y = infoRow(doc, "Paid By", fullName, y);
  y = infoRow(doc, "Payment For", `${sub.estateName} — ${sub.plotType}`, y);
  if (payment.reference)
    y = infoRow(doc, "Bank Reference", payment.reference, y);
  y = infoRow(doc, "Amount Paid", fmtNGN(payment.amount), y);
  y = infoRow(doc, "Total Paid To Date", fmtNGN(sub.amountPaid), y);
  y = infoRow(
    doc,
    "Balance Remaining",
    fmtNGN(sub.totalAmount - sub.amountPaid),
    y,
  );
  y += 32;
  doc
    .circle(doc.page.width / 2, y + 36, 36)
    .strokeColor(PURPLE)
    .lineWidth(2)
    .stroke();
  doc
    .fillColor(PURPLE)
    .font("Helvetica-Bold")
    .fontSize(7)
    .text("KEMCHUTA HOMES LTD", doc.page.width / 2 - 36, y + 22, {
      width: 72,
      align: "center",
    });
  doc
    .font("Helvetica-Bold")
    .fontSize(6)
    .text("OFFICIAL SEAL", doc.page.width / 2 - 36, y + 48, {
      width: 72,
      align: "center",
    });
  y += 90;
  sigBlock(doc, "Accounts Officer", "Kemchuta Homes Limited", 48, y, 200);
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateAllocationLetter(sub) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName = `${sub.title} ${sub.firstName} ${sub.lastName}`;
  resetRows();
  drawWatermark(doc, "ALLOCATION");
  drawHeader(doc, "Letter of Allocation", refNo(sub));
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Letter of Allocation", 48, y);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text(`${sub.estateName} — ${sub.plotSize} ${sub.plotType}`, 48, y + 22);
  y += 52;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(BLACK)
    .text(
      `Dear ${fullName},\n\nWe are delighted to inform you that following the completion of all payment obligations, Kemchuta Homes Limited hereby allocates to you the plot described below at ${sub.estateName}. This letter serves as your official confirmation of ownership pending title document processing.`,
      48,
      y,
      { width: doc.page.width - 96, lineGap: 3 },
    );
  y = doc.y + 16;
  y = amountBox(
    doc,
    "Allocated Plot",
    sub.plotNumber || "Block ___, Plot ___",
    [
      sub.plotDescription,
      `${sub.plotSize}  ·  ${sub.plotType}  ·  ${sub.surveyType}`,
    ]
      .filter(Boolean)
      .join("  ·  "),
    y,
  );
  y = sectionHeading(doc, "Allocation Details", y + 8);
  y = infoRow(doc, "Allottee", fullName, y);
  y = infoRow(doc, "Estate", sub.estateName, y);
  y = infoRow(doc, "Plot Number", sub.plotNumber || "To be confirmed", y);
  if (sub.plotDescription) {
    y = infoRow(doc, "Plot Description", sub.plotDescription, y);
  }
  y = infoRow(doc, "Plot Size", sub.plotSize, y);
  y = infoRow(doc, "Title Type", sub.titleDocument || sub.surveyType, y);
  y = infoRow(doc, "Total Amount Paid", fmtNGN(sub.totalAmount), y);
  y = infoRow(
    doc,
    "Date of Allocation",
    fmtDate(sub.allocationDate) || today(),
    y,
  );
  y += 12;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(BLACK)
    .text(
      `Title documents will be processed and delivered within 90 working days of this allocation date.`,
      48,
      y,
      { width: doc.page.width - 96 },
    );
  y = doc.y + 32;
  sigBlock(doc, "Managing Director", "Kemchuta Homes Limited", 48, y, 200);
  sigBlock(doc, fullName, "Allottee", doc.page.width - 248, y, 200);
  drawFooter(doc);
  doc.end();
  return buf;
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENT 7: DEED OF ASSIGNMENT (Land)
// Generated: alongside Allocation Letter after full payment + plot assigned
// ─────────────────────────────────────────────────────────────────────────────
export async function generateDeedOfAssignment(sub) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const fullName =
    `${sub.title} ${sub.firstName} ${sub.lastName}`.toUpperCase();
  const ref =
    sub.referenceNumber || sub._id?.toString().slice(-8).toUpperCase();
  resetRows();
  drawWatermark(doc, "DEED OF ASSIGNMENT");

  // ── Cover page ──────────────────────────────────────────────────────────────
  const W = doc.page.width;
  const H = doc.page.height;

  doc.rect(0, 0, W, H).fill([10, 6, 24]);
  doc.rect(0, 0, 180, H).fill(DARK);
  doc.rect(0, 140, 180, 2).fill(GOLD);
  doc.rect(0, H - 142, 180, 2).fill(GOLD);

  // Vertical text in left column
  doc.save();
  doc.fillColor(WHITE).font("Helvetica-Bold").fontSize(11);
  doc.rotate(-90, { origin: [90, H / 2] });
  doc.text("KEMCHUTA HOMES LIMITED", 90 - 130, H / 2 - 6, {
    width: 260,
    align: "center",
  });
  doc.restore();

  doc
    .fillColor([180, 140, 255])
    .font("Helvetica-Bold")
    .fontSize(36)
    .text("KHL", 22, 60, { width: 136, align: "center" });
  doc
    .fillColor(GOLD)
    .font("Helvetica")
    .fontSize(7.5)
    .text("EST. 2018", 22, 100, {
      width: 136,
      align: "center",
      characterSpacing: 2,
    });

  // Right side title block
  const rx = 230;
  const rw = W - rx - 40;
  doc.rect(rx, 60, rw, 2).fill(GOLD);
  doc
    .fillColor([200, 180, 255])
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("LEGAL DOCUMENT", rx, 76, { characterSpacing: 2.5 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(34)
    .text("DEED OF", rx, 96);
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(34)
    .text("ASSIGNMENT", rx, 128);
  doc.rect(rx, 168, 120, 3).fill(GOLD);

  // Reference chip
  doc.roundedRect(rx, 188, rw, 40, 6).fill([35, 22, 65]);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(7.5)
    .text("REFERENCE NO.", rx + 14, 198, { characterSpacing: 1.5 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(13)
    .text(ref, rx + 14, 210);

  // Assignor
  let cy = 268;
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(8)
    .text("BETWEEN", rx, cy, { characterSpacing: 2 });
  cy += 22;
  doc.roundedRect(rx, cy, rw, 58, 6).fill([38, 25, 68]);
  doc.rect(rx, cy, 3, 58).fill(GOLD);
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("KEMCHUTA HOMES LIMITED", rx + 14, cy + 10);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(8.5)
    .text("THE ASSIGNOR (VENDOR)", rx + 14, cy + 28);
  cy += 70;

  doc
    .fillColor([180, 160, 220])
    .font("Helvetica-Bold")
    .fontSize(8.5)
    .text("AND", rx, cy, { characterSpacing: 2 });
  cy += 20;

  // Assignee
  doc.roundedRect(rx, cy, rw, 58, 6).fill([38, 25, 68]);
  doc.rect(rx, cy, 3, 58).fill(PURPLE2);
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(12)
    .text(fullName, rx + 14, cy + 10, { width: rw - 20 });
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(8.5)
    .text("THE ASSIGNEE (PURCHASER)", rx + 14, cy + 30);
  doc
    .fillColor([140, 120, 180])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      `${sub.residentialAddress || ""}, ${sub.cityTown || ""}, ${sub.state || ""}`.replace(
        /^,\s*/,
        "",
      ),
      rx + 14,
      cy + 42,
      { width: rw - 20 },
    );
  cy += 68;

  // Property
  doc.roundedRect(rx, cy + 10, rw, 52, 6).fill([32, 20, 58]);
  doc
    .fillColor([180, 160, 220])
    .font("Helvetica")
    .fontSize(7.5)
    .text("PROPERTY", rx + 14, cy + 20, { characterSpacing: 1.5 });
  doc
    .fillColor(WHITE)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      `${sub.estateName?.toUpperCase() || "—"}  ·  ${sub.plotNumber || "Plot TBC"}`,
      rx + 14,
      cy + 32,
      { width: rw - 28 },
    );
  if (sub.plotDescription) {
    doc
      .fillColor([140, 120, 180])
      .font("Helvetica")
      .fontSize(7.5)
      .text(sub.plotDescription, rx + 14, cy + 47, { width: rw - 28 });
  }

  doc
    .fillColor([120, 100, 160])
    .font("Helvetica")
    .fontSize(7.5)
    .text(
      `Prepared by: Obinna Obiegue Esq. · Dozie & Co. · legal@kemchutahomesltd.com`,
      rx,
      H - 48,
      { width: rw },
    );

  // ── Page 2: Deed body ─────────────────────────────────────────────────────
  doc.addPage();
  drawWatermark(doc, "DEED OF ASSIGNMENT");
  drawHeader(doc, "Deed of Assignment", ref);
  const TW = W - 96;
  let y = 126;

  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      `THIS DEED OF ASSIGNMENT is made this _________ day of _______________ ${new Date().getFullYear()}`,
      48,
      y,
      { width: TW },
    );
  y += 30;

  doc.font("Helvetica").fontSize(9.5).fillColor(GREY).text("BETWEEN", 48, y);
  y += 14;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      `KEMCHUTA HOMES LIMITED of K/M 42, Lekki - Epe Expressway, Abijo, Lekki Peninsula, Lagos State (hereinafter called "THE ASSIGNOR") of the FIRST PART.`,
      48,
      y,
      { width: TW },
    );
  y = doc.y + 10;

  doc.font("Helvetica").fontSize(9.5).fillColor(GREY).text("AND", 48, y);
  y += 14;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      `${fullName} of ${sub.residentialAddress || ""}, ${sub.cityTown || ""}, ${sub.state || ""}, Nigeria (hereinafter called "THE ASSIGNEE") of the SECOND PART.`,
      48,
      y,
      { width: TW },
    );
  y = doc.y + 16;

  doc
    .moveTo(48, y)
    .lineTo(W - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 14;

  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("WHEREAS:", 48, y, { width: TW });
  y += 16;
  [
    `(a) The Assignor is the beneficial owner of the land and property known as "${sub.estateName?.toUpperCase()}", situated at ${sub.residentialAddress || "the location described herein"}, being more particularly described in the Schedule below.`,
    `(b) The Assignor has agreed to assign the property described in the Schedule to the Assignee for the consideration stated herein.`,
    `(c) The Assignee has paid in full the sum of ${fmtNGN(sub.totalAmount)} (Naira) as the purchase price, the receipt of which the Assignor hereby acknowledges.`,
  ].forEach((clause) => {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(BLACK)
      .text(clause, 48, y, { width: TW, lineGap: 1.5 });
    y = doc.y + 10;
  });

  doc
    .moveTo(48, y)
    .lineTo(W - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 14;
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("NOW THIS DEED WITNESSETH as follows:", 48, y, { width: TW });
  y += 16;

  [
    `1. In consideration of the sum of ${fmtNGN(sub.totalAmount)} (Naira only) paid by the Assignee to the Assignor (receipt acknowledged), the Assignor hereby assigns unto the Assignee ALL THAT piece and parcel of land described in the Schedule below, TOGETHER WITH all rights, easements, and appurtenances thereto.`,
    "2. The Assignor covenants with the Assignee that the Assignor has good right and full power to assign the said property and that the Assignee shall quietly enjoy the said property free from any encumbrance by the Assignor.",
    "3. The Assignor shall, at the request and cost of the Assignee, execute all further documents and do all such further acts as may be necessary to vest the property absolutely in the Assignee.",
    "4. The Assignee hereby covenants with the Assignor to pay all rates, charges, and outgoings in respect of the said property from the date hereof.",
    "5. This Deed shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.",
  ].forEach((clause) => {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(BLACK)
      .text(clause, 48, y, { width: TW, lineGap: 1.5 });
    y = doc.y + 8;
  });

  // Schedule
  y += 8;
  doc
    .moveTo(48, y)
    .lineTo(W - 48, y)
    .strokeColor(MGREY)
    .lineWidth(0.5)
    .stroke();
  y += 12;
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text("THE SCHEDULE (Property Description)", 48, y, { width: TW });
  y += 16;

  y = sectionHeading(doc, "Property Details", y);
  y = infoRow(doc, "Estate", sub.estateName || "—", y);
  y = infoRow(doc, "Plot Number", sub.plotNumber || "To be confirmed", y);
  if (sub.plotDescription) {
    y = infoRow(doc, "Plot Description", sub.plotDescription, y);
  }
  y = infoRow(doc, "Plot Size", sub.plotSize || "—", y);
  y = infoRow(doc, "Plot Type", sub.plotType || "—", y);
  y = infoRow(doc, "Title", sub.titleDocument || sub.surveyType || "—", y);
  y = infoRow(doc, "Total Consideration", fmtNGN(sub.totalAmount), y);

  drawFooter(doc);

  // ── Page 3: Execution ─────────────────────────────────────────────────────
  doc.addPage();
  drawWatermark(doc, "DEED OF ASSIGNMENT");
  drawHeader(doc, "Deed of Assignment — Execution", ref);
  y = 126;

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(BLACK)
    .text(
      "IN WITNESS WHEREOF the parties hereto have executed this Deed of Assignment on the day and year first above written.",
      48,
      y,
      { width: TW, lineGap: 2 },
    );
  y += 40;

  // Assignor execution
  doc.roundedRect(48, y, TW, 90, 6).fill([250, 248, 255]);
  doc.rect(48, y, 4, 90).fill(GOLD);
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("SIGNED AND DELIVERED", 62, y + 10);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text("By the within named ASSIGNOR — KEMCHUTA HOMES LIMITED", 62, y + 23);
  doc
    .moveTo(62, y + 62)
    .lineTo(210, y + 62)
    .strokeColor(MGREY)
    .lineWidth(0.8)
    .stroke();
  doc
    .moveTo(250, y + 62)
    .lineTo(420, y + 62)
    .strokeColor(MGREY)
    .lineWidth(0.8)
    .stroke();
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("DIRECTOR", 62, y + 66);
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(8)
    .text("SECRETARY", 250, y + 66);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7)
    .text("Kemchuta Homes Limited", 62, y + 76);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7)
    .text("Kemchuta Homes Limited", 250, y + 76);
  y += 106;

  // Assignee execution
  doc.roundedRect(48, y, TW, 90, 6).fill([248, 245, 255]);
  doc.rect(48, y, 4, 90).fill(PURPLE);
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("SIGNED AND DELIVERED", 62, y + 10);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text("By the within named ASSIGNEE", 62, y + 23);
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(fullName, 62, y + 36, { width: TW - 20 });
  doc
    .moveTo(62, y + 62)
    .lineTo(280, y + 62)
    .strokeColor(MGREY)
    .lineWidth(0.8)
    .dash(3, { space: 2 })
    .stroke();
  doc.undash();
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(7.5)
    .text("Signature of Assignee", 62, y + 66);
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(8)
    .text("Date: _______________________", 62, y + 76);
  y += 106;

  // Witness
  doc
    .fillColor(DARK)
    .font("Helvetica-Bold")
    .fontSize(9)
    .text("IN THE PRESENCE OF:", 48, y);
  y += 16;
  ["Name:", "Address:", "Occupation:", "Signature:", "Date:"].forEach(
    (label) => {
      doc
        .font("Helvetica")
        .fontSize(8.5)
        .fillColor(BLACK)
        .text(label, 48, y, { width: 90 });
      doc
        .moveTo(130, y + 10)
        .lineTo(W - 48, y + 10)
        .strokeColor(LGREY)
        .lineWidth(0.8)
        .stroke();
      y += 24;
    },
  );

  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateInvestmentCertificate(lead) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const ref =
    lead.referenceNumber || lead._id?.toString().slice(-8).toUpperCase();
  drawHeader(doc, "Investment Certificate", ref);
  let y = 110;
  doc
    .roundedRect(40, y, doc.page.width - 80, 320, 10)
    .strokeColor(PURPLE)
    .lineWidth(2)
    .stroke();
  doc
    .roundedRect(46, y + 6, doc.page.width - 92, 308, 8)
    .strokeColor([200, 160, 255])
    .lineWidth(0.5)
    .stroke();
  doc
    .fillColor(PURPLE)
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("CERTIFICATE OF INVESTMENT", 0, y + 24, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text("Buy2Sell Land Bank Scheme — Kemchuta Homes Limited", 0, y + 48, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .moveTo(100, y + 66)
    .lineTo(doc.page.width - 100, y + 66)
    .strokeColor([200, 160, 255])
    .lineWidth(0.75)
    .stroke();
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text("This certifies that", 0, y + 78, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(16)
    .text(lead.fullName.toUpperCase(), 0, y + 94, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text("has invested", 0, y + 118, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(PURPLE)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text(fmtNGN(lead.principalAmount), 0, y + 132, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text("at a fixed ROI rate of", 0, y + 162, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(36)
    .text(`${lead.roiPercent}%`, 0, y + 174, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(10)
    .text(`over a period of ${lead.duration}`, 0, y + 218, {
      align: "center",
      width: doc.page.width,
    });
  doc
    .moveTo(100, y + 236)
    .lineTo(doc.page.width - 100, y + 236)
    .strokeColor([200, 160, 255])
    .lineWidth(0.75)
    .stroke();
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Investment Date: ${fmtDate(lead.investmentDate)}   ·   Maturity Date: ${fmtDate(lead.maturityDate)}`,
      0,
      y + 246,
      { align: "center", width: doc.page.width },
    );
  doc
    .fillColor(PURPLE)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(
      `Expected Payout at Maturity: ${fmtNGN(lead.expectedPayout)}`,
      0,
      y + 264,
      { align: "center", width: doc.page.width },
    );
  doc
    .fillColor(GREY)
    .font("Helvetica")
    .fontSize(9)
    .text(
      `Principal ${fmtNGN(lead.principalAmount)}  +  ROI ${fmtNGN(lead.expectedROI)} (${lead.roiPercent}%)`,
      0,
      y + 282,
      { align: "center", width: doc.page.width },
    );
  y += 340;
  sigBlock(doc, "Managing Director", "Kemchuta Homes Limited", 48, y, 200);
  sigBlock(doc, lead.fullName, "Investor", doc.page.width - 248, y, 200);
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generateInvestmentAgreement(lead) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const ref =
    lead.referenceNumber || lead._id?.toString().slice(-8).toUpperCase();
  resetRows();
  drawWatermark(doc, "AGREEMENT");
  drawHeader(doc, "Investment Agreement", ref);
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Buy2Sell Investment Agreement", 48, y);
  y += 36;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(BLACK)
    .text(
      `This Investment Agreement is entered into on ${today()} between KEMCHUTA HOMES LIMITED ("the Company") and ${lead.fullName.toUpperCase()} ("the Investor").`,
      48,
      y,
      { width: doc.page.width - 96, lineGap: 3 },
    );
  y = doc.y + 16;
  y = sectionHeading(doc, "1. Investment Details", y);
  y = infoRow(doc, "Investor", lead.fullName, y);
  y = infoRow(doc, "Principal Amount", fmtNGN(lead.principalAmount), y);
  y = infoRow(doc, "Duration", lead.duration, y);
  y = infoRow(doc, "ROI Rate (fixed)", `${lead.roiPercent}%`, y);
  y = infoRow(doc, "Expected ROI", fmtNGN(lead.expectedROI), y);
  y = infoRow(doc, "Total Expected Payout", fmtNGN(lead.expectedPayout), y);
  y = infoRow(doc, "Investment Date", fmtDate(lead.investmentDate), y);
  y = infoRow(doc, "Maturity Date", fmtDate(lead.maturityDate), y);
  y = sectionHeading(doc, "2. Terms & Conditions", y + 8);
  [
    "1. The Investor agrees to invest the principal amount with Kemchuta Homes Limited for the stated duration.",
    "2. The Company shall pay total payout (principal + ROI) on or within 14 working days of the maturity date.",
    "3. The ROI rate is fixed and will not be reduced during the investment period.",
    "4. Early withdrawal is not permitted except by written mutual agreement.",
    "5. Early withdrawal attracts forfeiture of 50% of the accrued ROI to date of withdrawal.",
    "6. The Company may extend by up to 30 days with prior written notice.",
    "7. Payout will be via bank transfer to the Investor's registered account.",
    "8. This agreement is governed by the laws of the Federal Republic of Nigeria.",
  ].forEach((t) => {
    doc
      .font("Helvetica")
      .fontSize(9.5)
      .fillColor(BLACK)
      .text(t, 48, y, { width: doc.page.width - 96, lineGap: 2 });
    y = doc.y + 6;
  });
  y += 16;
  sigBlock(doc, "Managing Director", "Kemchuta Homes Limited", 48, y, 200);
  sigBlock(doc, lead.fullName, "Investor", doc.page.width - 248, y, 200);
  drawFooter(doc);
  doc.end();
  return buf;
}

export async function generatePayoutConfirmation(lead) {
  const doc = createDoc();
  const buf = streamToBuffer(doc);
  const ref =
    lead.referenceNumber || lead._id?.toString().slice(-8).toUpperCase();
  resetRows();
  drawWatermark(doc, "CONFIRMATION");
  drawHeader(doc, "Payout Confirmation", ref);
  let y = 126;
  doc
    .fillColor(BLACK)
    .font("Helvetica-Bold")
    .fontSize(18)
    .text("Payout Confirmation Letter", 48, y);
  y += 32;
  y = amountBox(
    doc,
    "Total Payout Sent",
    fmtNGN(lead.actualPayout || lead.expectedPayout),
    `Payout Date: ${fmtDate(lead.payoutDate) || today()}`,
    y,
  );
  y = sectionHeading(doc, "Investment Summary", y + 8);
  y = infoRow(doc, "Reference", ref, y);
  y = infoRow(doc, "Investor", lead.fullName, y);
  y = infoRow(doc, "Duration", lead.duration, y);
  y = infoRow(doc, "ROI Rate", `${lead.roiPercent}%`, y);
  y = infoRow(doc, "Principal Invested", fmtNGN(lead.principalAmount), y);
  y = infoRow(doc, "ROI Earned", fmtNGN(lead.expectedROI), y);
  y = infoRow(
    doc,
    "Total Payout",
    fmtNGN(lead.actualPayout || lead.expectedPayout),
    y,
  );
  y = infoRow(doc, "Investment Date", fmtDate(lead.investmentDate), y);
  y = infoRow(doc, "Maturity Date", fmtDate(lead.maturityDate), y);
  y = infoRow(doc, "Payout Date", fmtDate(lead.payoutDate) || today(), y);
  y += 12;
  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(BLACK)
    .text(
      "Thank you for choosing the Kemchuta Homes Buy2Sell scheme. We hope to welcome you back for your next investment cycle.",
      48,
      y,
      { width: doc.page.width - 96, lineGap: 3 },
    );
  y = doc.y + 32;
  sigBlock(doc, "Authorised Signatory", "Kemchuta Homes Limited", 48, y, 200);
  drawFooter(doc);
  doc.end();
  return buf;
}
