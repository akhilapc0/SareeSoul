
const mongoose = require('mongoose');


mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


mongoose.connection.on('connected', () => {
  console.log(' MongoDB connected');
});


mongoose.connection.on('error', (err) => {
  console.error(' MongoDB connection error:', err);
});


