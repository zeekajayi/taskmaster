const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const config = require('./config/config');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(config.PORT, () => {
    console.log(`Server is running on port ${config.PORT}`);
});