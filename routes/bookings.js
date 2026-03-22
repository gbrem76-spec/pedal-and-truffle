const express   = require('express');
const { body, validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const db         = require('../database/db');

const router = express.Router();

// ── Pricing ──────────────────────────────────────────
const PRICES = {
  classic: 695,
  private: 995,
  train:   150
};

// ── Email transporter ─────────────────────────────────
// Replace with real SMTP credentials before going live
const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   process.env.SMTP_PORT   || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER   || 'hello@pedal-and-truffle.com.au',
    pass: process.env.SMTP_PASS   || 'your-email-password'
  }
});

// ── POST /api/bookings — submit a booking ─────────────
router.post('/',
  [
    body('tour_type').isIn(['classic','private']).withMessage('Invalid tour type'),
    body('tour_date').isDate().withMessage('Invalid date'),
    body('guests').isInt({ min:1, max:8 }).withMessage('1–8 guests required'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('phone').trim().notEmpty().withMessage('Phone is required'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { tour_type, tour_date, guests, train_addon, name, email, phone, requests } = req.body;

    const tourPrice  = PRICES[tour_type] * parseInt(guests);
    const trainPrice = train_addon ? PRICES.train * parseInt(guests) : 0;
    const total      = tourPrice + trainPrice;

    const stmt = db.prepare(`
      INSERT INTO bookings (tour_type, tour_date, guests, train_addon, name, email, phone, requests, tour_price, train_price, total_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      tour_type, tour_date, parseInt(guests), train_addon ? 1 : 0,
      name.trim(), email.trim(), phone.trim(), requests || '',
      tourPrice, trainPrice, total
    );

    const bookingId = result.lastInsertRowid;

    // Send emails (non-blocking — don't fail the booking if email fails)
    sendEmails({ bookingId, tour_type, tour_date, guests, train_addon, name, email, phone, requests, tourPrice, trainPrice, total })
      .catch(err => console.error('Email error:', err.message));

    res.json({
      success: true,
      booking_id: bookingId,
      message: `Booking received! We'll confirm within 24 hours.`,
      summary: {
        tour:  tour_type === 'classic' ? 'Classic Tour' : 'Private Experience',
        date:  tour_date,
        guests,
        total: `$${total.toLocaleString()}`
      }
    });
  }
);

// ── GET /api/bookings/availability — booked dates ─────
router.get('/availability', (req, res) => {
  const booked = db.prepare(`
    SELECT tour_date, SUM(guests) as total_guests
    FROM bookings WHERE status != 'cancelled'
    GROUP BY tour_date
  `).all();
  res.json(booked);
});

// ── Email helpers ─────────────────────────────────────
async function sendEmails(b) {
  const tourName    = b.tour_type === 'classic' ? 'Classic Tour' : 'Private Experience';
  const dateFormatted = new Date(b.tour_date).toLocaleDateString('en-AU', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  // Confirmation to customer
  await transporter.sendMail({
    from:    '"Pedal & Truffle" <hello@pedal-and-truffle.com.au>',
    to:      b.email,
    subject: `Booking Received — Pedal & Truffle #${b.bookingId}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2c1f12;">
        <div style="background:#2c1f12;padding:36px;text-align:center;">
          <h1 style="color:#e8cc80;font-style:italic;margin:0;font-size:28px;">Pedal &amp; Truffle</h1>
          <p style="color:rgba(232,204,128,.6);font-family:sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:8px 0 0;">E-Bike Tours · NSW</p>
        </div>
        <div style="padding:40px 36px;background:#faf8f4;">
          <h2 style="color:#c49a3c;">Booking Received!</h2>
          <p>Hi ${b.name},</p>
          <p>Thank you for booking with Pedal &amp; Truffle. We've received your enquiry and will confirm availability within 24 hours.</p>
          <div style="background:#fff;border:1px solid rgba(196,154,60,.2);padding:24px;margin:24px 0;">
            <h3 style="margin-top:0;color:#2c1f12;">Booking Summary #${b.bookingId}</h3>
            <table style="width:100%;font-size:14px;">
              <tr><td style="padding:6px 0;color:#9a8878;">Tour</td><td style="font-weight:bold;">${tourName}</td></tr>
              <tr><td style="padding:6px 0;color:#9a8878;">Date</td><td>${dateFormatted}</td></tr>
              <tr><td style="padding:6px 0;color:#9a8878;">Guests</td><td>${b.guests}</td></tr>
              ${b.train_addon ? `<tr><td style="padding:6px 0;color:#9a8878;">Train Tickets</td><td>Sydney return (×${b.guests})</td></tr>` : ''}
              ${b.requests ? `<tr><td style="padding:6px 0;color:#9a8878;">Requests</td><td>${b.requests}</td></tr>` : ''}
              <tr style="border-top:1px solid rgba(196,154,60,.2);">
                <td style="padding:12px 0 6px;font-weight:bold;">Total</td>
                <td style="font-weight:bold;color:#c49a3c;font-size:18px;">$${b.total.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          <p>We'll be in touch shortly to confirm your booking and arrange payment.</p>
          <p>Any questions? Reply to this email or call <strong>+61 400 000 000</strong>.</p>
          <p style="margin-top:32px;font-style:italic;color:#c49a3c;">Ride the Tablelands. Sleep Among Truffles.</p>
        </div>
        <div style="background:#16110c;padding:20px;text-align:center;">
          <p style="color:rgba(230,220,200,.3);font-family:sans-serif;font-size:11px;margin:0;">Pedal &amp; Truffle · Mongarlowe NSW · hello@pedal-and-truffle.com.au</p>
        </div>
      </div>
    `
  });

  // Notification to operator
  await transporter.sendMail({
    from:    '"Pedal & Truffle Bookings" <hello@pedal-and-truffle.com.au>',
    to:      'hello@pedal-and-truffle.com.au',
    subject: `New Booking #${b.bookingId} — ${b.name} · ${tourName} · ${b.tour_date}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>New Booking #${b.bookingId}</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="background:#f5f0e8;"><td style="padding:10px;font-weight:bold;">Tour</td><td style="padding:10px;">${tourName}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Date</td><td style="padding:10px;">${b.tour_date}</td></tr>
          <tr style="background:#f5f0e8;"><td style="padding:10px;font-weight:bold;">Guests</td><td style="padding:10px;">${b.guests}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Train Add-on</td><td style="padding:10px;">${b.train_addon ? `Yes (+$${b.trainPrice})` : 'No'}</td></tr>
          <tr style="background:#f5f0e8;"><td style="padding:10px;font-weight:bold;">Total</td><td style="padding:10px;color:#c49a3c;font-weight:bold;">$${b.total.toLocaleString()}</td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Name</td><td style="padding:10px;">${b.name}</td></tr>
          <tr style="background:#f5f0e8;"><td style="padding:10px;font-weight:bold;">Email</td><td style="padding:10px;"><a href="mailto:${b.email}">${b.email}</a></td></tr>
          <tr><td style="padding:10px;font-weight:bold;">Phone</td><td style="padding:10px;"><a href="tel:${b.phone}">${b.phone}</a></td></tr>
          ${b.requests ? `<tr style="background:#f5f0e8;"><td style="padding:10px;font-weight:bold;">Requests</td><td style="padding:10px;">${b.requests}</td></tr>` : ''}
        </table>
        <p><a href="http://localhost:3000/admin" style="background:#c49a3c;color:#fff;padding:10px 20px;text-decoration:none;display:inline-block;margin-top:16px;">View in Admin Dashboard</a></p>
      </div>
    `
  });
}

module.exports = router;
