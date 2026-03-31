const app  = require('./src/app');
const db   = require('./src/config/db');

const PORT = process.env.PORT || 3000;

const start = async () => {
  // Verify DB connection before accepting traffic
  try {
    await db.query('SELECT 1');
    console.log('✅  Database connected');
  } catch (err) {
    console.error('❌  Database connection failed:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀  Server running on http://localhost:${PORT}`);
  });
};

start();
