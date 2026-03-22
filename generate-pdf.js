const PDFDocument = require('pdfkit');
const fs          = require('fs');
const path        = require('path');

const doc = new PDFDocument({ margin:60, size:'A4', autoFirstPage:true });
doc.pipe(fs.createWriteStream(path.join(__dirname, 'LAUNCH_INSTRUCTIONS.pdf')));

const GOLD    = '#c49a3c';
const TRUFFLE = '#2c1f12';
const MIST    = '#9a8878';
const L       = 60;   // left margin
const W       = 475;  // content width

// ── Rule line ────────────────────────────────────────
function rule(color, opacity) {
  const y = doc.y;
  doc.save()
     .opacity(opacity || 0.35)
     .moveTo(L, y).lineTo(L + W, y)
     .strokeColor(color || GOLD).lineWidth(0.5).stroke()
     .restore();
}

// ── Section heading ───────────────────────────────────
function heading(text) {
  doc.moveDown(1);
  rule(GOLD, 0.2);
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(TRUFFLE)
     .text(text.toUpperCase(), L, doc.y, { width:W, characterSpacing:1.2 });
  doc.moveDown(0.5);
  rule(GOLD, 0.35);
  doc.moveDown(0.6);
}

// ── Body text ─────────────────────────────────────────
function body(text, opts) {
  doc.font('Helvetica').fontSize(9).fillColor('#333')
     .text(text, L, doc.y, Object.assign({ width:W, lineGap:2 }, opts || {}));
  doc.moveDown(0.3);
}

// ── Bullet ────────────────────────────────────────────
function bullet(text) {
  doc.font('Helvetica').fontSize(9).fillColor('#444')
     .text('\u2022  ' + text, L + 8, doc.y, { width:W - 8, lineGap:2 });
  doc.moveDown(0.25);
}

// ── Numbered step ─────────────────────────────────────
function step(num, title, detail) {
  doc.moveDown(0.3);
  doc.font('Helvetica-Bold').fontSize(9).fillColor(GOLD)
     .text('Step ' + num, L, doc.y, { width:W, lineGap:2 });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(TRUFFLE)
     .text(title, L, doc.y, { width:W, lineGap:2 });
  if (detail) {
    doc.font('Helvetica').fontSize(8.5).fillColor('#555')
       .text(detail, L + 12, doc.y, { width:W - 12, lineGap:2 });
  }
  doc.moveDown(0.3);
}

// ── Key-value row ─────────────────────────────────────
function kv(label, value) {
  doc.font('Helvetica-Bold').fontSize(9).fillColor(TRUFFLE)
     .text(label, L, doc.y, { width:W, lineGap:2 });
  doc.font('Helvetica').fontSize(9).fillColor('#444')
     .text(value, L + 12, doc.y, { width:W - 12, lineGap:2 });
  doc.moveDown(0.35);
}

// ── Code line ─────────────────────────────────────────
function code(text) {
  doc.moveDown(0.2);
  const y = doc.y;
  const h = 17;
  doc.rect(L, y, W, h).fill('#f0ece4');
  doc.font('Courier').fontSize(8).fillColor(TRUFFLE)
     .text(text, L + 8, y + 4, { width:W - 16, lineBreak:false });
  doc.y = y + h + 4;
}

// ── File table row ────────────────────────────────────
function fileRow(filename, desc) {
  doc.font('Courier').fontSize(8).fillColor(GOLD)
     .text(filename, L + 4, doc.y, { width:190, lineBreak:false });
  doc.font('Helvetica').fontSize(8.5).fillColor('#555')
     .text(desc, L + 200, doc.y - doc.currentLineHeight(), { width:W - 204, lineGap:2 });
  doc.moveDown(0.5);
}

// ── Note (italic small) ───────────────────────────────
function note(text) {
  doc.font('Helvetica-Oblique').fontSize(8).fillColor(MIST)
     .text(text, L + 12, doc.y, { width:W - 12, lineGap:2 });
  doc.moveDown(0.4);
}

// ════════════════════════════════════════════════════
// COVER BLOCK
// ════════════════════════════════════════════════════
doc.rect(0, 0, 595.28, 190).fill(TRUFFLE);

doc.font('Helvetica-Bold').fontSize(30).fillColor('#e8cc80')
   .text('Pedal & Truffle', L, 52, { lineBreak:false });

doc.font('Helvetica-Oblique').fontSize(11).fillColor('rgba(232,204,128,0.55)')
   .text('E-Bike Tours  ·  Southern Tablelands NSW', L, 92, { lineBreak:false });

doc.font('Helvetica').fontSize(8).fillColor('rgba(232,204,128,0.3)')
   .text('WEBSITE LAUNCH INSTRUCTIONS', L, 118, { characterSpacing:2, lineBreak:false });

doc.font('Helvetica').fontSize(8).fillColor('rgba(232,204,128,0.2)')
   .text('Prepared March 2026', L, 160, { lineBreak:false });

// Reset cursor below cover
doc.y = 210;
doc.x = L;

// ════════════════════════════════════════════════════
// OVERVIEW
// ════════════════════════════════════════════════════
heading('Overview');

body(
  'This document covers everything required to take the Pedal & Truffle website ' +
  'from local development to a fully live, publicly accessible website with a working booking system.'
);

doc.moveDown(0.4);
doc.font('Helvetica-Bold').fontSize(9).fillColor(TRUFFLE)
   .text('What has already been built:', L, doc.y, { width:W });
doc.moveDown(0.4);

bullet('Single-page frontend website — hero, route map, gallery, pricing, booking form and FAQ');
bullet('Node.js backend server with Express');
bullet('SQLite booking database — stores all enquiries automatically');
bullet('Admin dashboard (/admin) — view, confirm, cancel and annotate bookings');
bullet('Automated booking confirmation emails via Nodemailer');
bullet('Live price calculator on the booking form');

// ════════════════════════════════════════════════════
// LAUNCH CHECKLIST
// ════════════════════════════════════════════════════
heading('Launch Checklist — Complete In Order');

step('1', 'Get an ABN',
  'Register free at abr.gov.au — takes about 15 minutes online. You need an ABN before you can register a .com.au domain or invoice customers.');

step('2', 'Register your domain name',
  'Go to a .com.au registrar such as VentraIP or Crazy Domains. Search for pedal-and-truffle.com.au. A .com.au domain requires an Australian ABN.');

step('3', 'Set up your business email',
  'Google Workspace (~$8/month) gives you hello@pedal-and-truffle.com.au. Alternatives: Zoho Mail (free tier) or email included with your hosting plan.');

step('4', 'Update placeholder details in the website',
  'Open index.html and replace these three placeholders:');
bullet('+61 400 000 000  →  your real phone number');
bullet('hello@pedal-and-truffle.com.au  →  confirm or update');
bullet('ABN pending  →  your ABN once registered');
doc.moveDown(0.2);

step('5', 'Update SMTP email credentials',
  'Open routes/bookings.js and update the email transporter with your real credentials:');
code("SMTP_HOST:  'smtp.gmail.com'   (or your provider's outgoing mail server)");
code("SMTP_USER:  'hello@pedal-and-truffle.com.au'");
code("SMTP_PASS:  'your-app-password-here'");
note('For Gmail: enable 2-factor authentication, then generate an App Password at myaccount.google.com/apppasswords');

step('6', 'Change your admin dashboard password',
  'Open routes/admin.js and update line 4:');
code("const ADMIN_TOKEN = 'choose-a-strong-unique-password';");

step('7', 'Convert HEIC photos to JPG',
  'On your iPhone: open Photos, select the image, tap Share, then Save as JPG. ' +
  'Drop the converted file into: Atb Website/images/photos/');
note('IMG_5037 was selected for the Overnight Stay banner. Once converted, update the filename in index.html around line 397.');

step('8', 'Choose a hosting provider',
  'Recommended options for running Node.js:');
bullet('Railway (railway.app) — easiest, free tier, auto-deploys from GitHub');
bullet('Render (render.com) — free tier, straightforward Node.js support');
bullet('DigitalOcean App Platform — $5–12/month, very reliable');
bullet('DigitalOcean / Linode VPS — $6/month, full control, more setup required');
doc.moveDown(0.2);

step('9', 'Deploy your website',
  'General steps for Railway or Render:');
bullet('Create a GitHub account and upload the Atb Website folder as a repository');
bullet('Connect Railway or Render to your GitHub repository');
bullet('Set the Start Command to:  node server.js');
bullet('Add environment variables: SMTP_HOST, SMTP_USER, SMTP_PASS, ADMIN_TOKEN');
bullet('Click Deploy — your site will go live at a generated URL');
bullet('Add your custom domain in the hosting dashboard and point your DNS records');
doc.moveDown(0.2);

step('10', 'Enable SSL (HTTPS)',
  'Railway, Render and most hosts provide free SSL automatically via Let\'s Encrypt. Enable it in your hosting dashboard — usually a single checkbox.');

// ════════════════════════════════════════════════════
// PAGE 2
// ════════════════════════════════════════════════════
doc.addPage();

// ════════════════════════════════════════════════════
// RUNNING LOCALLY
// ════════════════════════════════════════════════════
heading('Running the Server on Your Computer');

body('To preview and test the website locally before going live:');
bullet('Open a Command Prompt or terminal window');
bullet('Navigate to the Atb Website folder:');
code('cd "C:\\Users\\Manus\\Desktop\\Atb Website"');
bullet('Start the server:');
code('node server.js');
bullet('Open your browser and visit:');
code('http://localhost:3000          —  website');
code('http://localhost:3000/admin    —  admin dashboard');
doc.moveDown(0.3);
note('Node.js v25.8.1 was installed during setup. If you ever reinstall Windows, download it again from nodejs.org');

// ════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ════════════════════════════════════════════════════
heading('Admin Dashboard');

kv('URL:', 'http://localhost:3000/admin  (or yourdomain.com.au/admin when live)');
kv('Current password:', 'pedal-truffle-admin-2026  —  change this before going live');

doc.moveDown(0.2);
doc.font('Helvetica-Bold').fontSize(9).fillColor(TRUFFLE)
   .text('Features:', L, doc.y, { width:W });
doc.moveDown(0.3);
bullet('Stats strip showing total bookings, confirmed, pending, guests and revenue');
bullet('Filter bookings by status and date range');
bullet('Click any booking row to expand full details');
bullet('Confirm, cancel or mark bookings as pending with one click');
bullet('Add private internal notes to any booking');

// ════════════════════════════════════════════════════
// PRICING
// ════════════════════════════════════════════════════
heading('Current Pricing');

kv('Classic Tour (Twin Share):', '$695 per person');
kv('Private Experience:', '$995 per person');
kv('Sydney Return Train Add-on:', '$150 per person  (optional)');
doc.moveDown(0.2);
note('To update pricing: edit the PRICES object in routes/bookings.js AND the TOUR_PRICES object in index.html, plus the pricing cards and booking form dropdown.');

// ════════════════════════════════════════════════════
// KEY FILES
// ════════════════════════════════════════════════════
heading('Key Files Reference');

const files = [
  ['index.html',            'Main website — all content, styling and booking form'],
  ['server.js',             'Node.js server — starts the app and serves all files'],
  ['routes/bookings.js',    'Booking API — pricing, validation and email sending'],
  ['routes/admin.js',       'Admin API — list, update and delete bookings'],
  ['database/db.js',        'Database setup — creates bookings.db on first run'],
  ['database/bookings.db',  'SQLite database file — all booking records stored here'],
  ['admin/index.html',      'Admin dashboard interface'],
  ['images/gallery/',       'Gallery background images (JPG format)'],
  ['images/photos/',        'Truffle farm photos (JPG and HEIC)'],
  ['package.json',          'Node.js dependency list'],
  ['PROJECT_NOTES.txt',     'Project reference notes'],
  ['generate-pdf.js',       'Script that generates this PDF — run: node generate-pdf.js'],
];

files.forEach(([file, desc]) => fileRow(file, desc));

// ════════════════════════════════════════════════════
// LEGAL
// ════════════════════════════════════════════════════
heading('Legal Requirements');

bullet('Terms & Conditions — covering your cancellation policy, liability limits and refunds');
bullet('Privacy Policy — required by Australian law when collecting customer personal data');
bullet('Public liability insurance — essential before operating tours with paying customers');
bullet('Check whether a tour operator licence is required in NSW for commercial e-bike tours');

// ════════════════════════════════════════════════════
// FUTURE
// ════════════════════════════════════════════════════
heading('Recommended Future Additions');

bullet('Stripe payment integration — collect deposits at the time of booking');
bullet('Live availability calendar — show available and booked dates on the website');
bullet('Google Analytics — track visitor numbers and booking conversion rates');
bullet('Instagram feed — display your latest posts directly on the site');
bullet('SMS notifications — automatically text customers when bookings are confirmed');

// ════════════════════════════════════════════════════
// FOOTER
// ════════════════════════════════════════════════════
doc.moveDown(1.5);
rule(GOLD, 0.3);
doc.moveDown(0.5);
doc.font('Helvetica').fontSize(7.5).fillColor(MIST)
   .text(
     'Pedal & Truffle  ·  Website Launch Instructions  ·  March 2026  ·  Mongarlowe NSW',
     L, doc.y, { width:W, align:'center', characterSpacing:0.4 }
   );

doc.end();
console.log('PDF created: LAUNCH_INSTRUCTIONS.pdf');
