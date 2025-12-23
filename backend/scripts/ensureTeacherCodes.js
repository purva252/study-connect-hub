require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

const generateCode = () => {
  return require('crypto').randomBytes(4).toString('hex').slice(0,6).toUpperCase();
};

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const coll = mongoose.connection.collection('teacherprofiles');

  const existingCodesCursor = coll.find({ code: { $exists: true, $ne: null } }, { projection: { code: 1 } });
  const used = new Set();
  await existingCodesCursor.forEach(doc => { if (doc.code) used.add(doc.code); });

  const missingCursor = coll.find({ $or: [ { code: { $exists: false } }, { code: null }, { code: '' } ] });
  let updated = 0;
  while (await missingCursor.hasNext()) {
    const doc = await missingCursor.next();
    let code = generateCode();
    while (used.has(code)) code = generateCode();
    used.add(code);
    await coll.updateOne({ _id: doc._id }, { $set: { code } });
    console.log('Updated teacherProfile', String(doc._id), '-> code', code);
    updated++;
  }

  console.log('Done. Updated', updated, 'profiles.');
  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
