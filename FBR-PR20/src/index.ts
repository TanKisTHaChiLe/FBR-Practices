import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://YourMongoAdmin:1234@localhost:27017/admin';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', userRoutes);

mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000
} as mongoose.ConnectOptions)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });