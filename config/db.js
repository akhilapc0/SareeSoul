
const mongoose = require('mongoose');

// connect to MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// success message
mongoose.connection.on('connected', () => {
  console.log(' MongoDB connected');
});

// error message
mongoose.connection.on('error', (err) => {
  console.error(' MongoDB connection error:', err);
});
