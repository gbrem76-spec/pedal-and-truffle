const express = require('express');
const db      = require('../database/db');
const router  = express.Router();

// Simple token auth — change this before going live
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'pedal-truffle-admin-2026';

function auth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: 'Unauthorised' });
  next();
}

// GET /api/admin/bookings — list all bookings
router.get('/bookings', auth, (req, res) => {
  const { status, from, to } = req.query;
  let query = 'SELECT * FROM bookings WHERE 1=1';
  const params = [];
  if (status) { query += ' AND status = ?'; params.push(status); }
  if (from)   { query += ' AND tour_date >= ?'; params.push(from); }
  if (to)     { query += ' AND tour_date <= ?'; params.push(to); }
  query += ' ORDER BY created_at DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

// GET /api/admin/stats — summary stats
router.get('/stats', auth, (req, res) => {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_bookings,
      SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
      SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
      SUM(CASE WHEN status != 'cancelled' THEN total_price ELSE 0 END) as total_revenue,
      SUM(CASE WHEN status != 'cancelled' THEN guests ELSE 0 END) as total_guests
    FROM bookings
  `).get();
  res.json(stats);
});

// PATCH /api/admin/bookings/:id/status — update status
router.patch('/bookings/:id/status', auth, (req, res) => {
  const { status } = req.body;
  if (!['pending','confirmed','cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

// PATCH /api/admin/bookings/:id/notes — save internal notes
router.patch('/bookings/:id/notes', auth, (req, res) => {
  db.prepare('UPDATE bookings SET notes = ? WHERE id = ?').run(req.body.notes, req.params.id);
  res.json({ success: true });
});

// DELETE /api/admin/bookings/:id — delete a booking
router.delete('/bookings/:id', auth, (req, res) => {
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
