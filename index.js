const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(cors({
  origin: ['https://w1kg35z3-3000.uks1.devtunnels.ms', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
}));
app.use(express.json());

const MONGO_URI="mongodb+srv://altovxr_db_user:5VjQ79JKDs9BJwkf@cluster0.qkzcnfy.mongodb.net/formBuilder?retryWrites=true&w=majority"
// Connect to MongoDB
// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch(err => console.error('MongoDB connection error:', err));
let connection;

const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.set("strictPopulate", false);
    connection = await mongoose.connect(MONGO_URI);
    console.log(
      `📦 MongoDB connected: ${connection.connection.host}` +
      " " +
      connection.connection.name
    );
  } catch (error) {
    console.error("Mongo-DB connection failed.");
    console.error(error);
    process.exit(1);
  }
};
connectDB()



// Routes
app.use('/api', apiRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});