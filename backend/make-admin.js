/**
 * Run this once to make yourself admin:
 *   node backend/make-admin.js your@email.com
 */
require('dotenv').config();
require('./db');
const User = require('./models/User');

const email = process.argv[2];
if (!email) { console.error('Usage: node make-admin.js your@email.com'); process.exit(1); }

setTimeout(async () => {
  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { isAdmin: true },
      { new: true }
    );
    if (!user) { console.error('❌ No user found with email:', email); process.exit(1); }
    console.log(`✅ ${user.name} (${user.email}) is now an admin!`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}, 1500); // wait for DB connection
