const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const bookings   = require('./routes/bookings');
const admin      = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// API routes
app.use('/api/bookings', bookings);
app.use('/api/admin',    admin);

// Admin dashboard
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n  Pedal & Truffle server running`);
  console.log(`  Website:  http://localhost:${PORT}`);
  console.log(`  Admin:    http://localhost:${PORT}/admin`);
  console.log(`  API:      http://localhost:${PORT}/api/bookings\n`);
});
