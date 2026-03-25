require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const connectCloudinary = require('./config/cloudinary');
const doctorRouter = require('./routes/doctorRoute');
const userRouter = require('./routes/userRoute');
const adminRouter = require('./routes/adminRoute');

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB and Cloudinary
connectDB();
connectCloudinary();

// Middleware
app.use(cors());
app.use(express.json());

// API Endpoints
app.use('/api/doctor', doctorRouter);
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);

app.get('/', (req, res) => {
    res.send('API WORKING');
});

app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
