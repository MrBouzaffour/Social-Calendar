const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/userRoutes');
const friendRoutes = require('./routes/friendRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const groupRoutes = require('./routes/groupRoutes');
const chatRoutes = require('./routes/chatRoutes');
//const notificationRoutes = require('./routes/notificationRoutes');
const { handleError } = require('./utils/errorHandler');
const authMiddleware = require('./middlewares/authMiddleware');

const app = express();
require('dotenv').config();

app.use(cors());
app.use(express.json()); // for JSON body parsing
app.use(morgan('combined')); // Log detailed request information

// Logging middleware to capture API endpoint, request body, and headers
app.use((req, res, next) => {
    console.log(`Request to: ${req.method} ${req.originalUrl}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    next();
});

// Middleware to handle JSON parse errors in request body
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Bad JSON format:', err.message);
        return res.status(400).json({ error: 'Invalid JSON format' });
    }
    next();
});

// login and register doesn't require authMiddleware
app.use('/api/users', userRoutes);

// Protected routes: Apply authMiddleware
app.use('/api/calendars', authMiddleware, calendarRoutes); 
app.use('/api/friends', authMiddleware, friendRoutes);
app.use('/api/groups', authMiddleware, groupRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
//app.use('/api/notifications', authMiddleware, notificationRoutes);

// Error Handling Middleware 
app.use(handleError);

// Start the server if this file is run directly
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('Server terminated');
        process.exit(0);
    });
}

// Export the app for testing
module.exports = app;
