const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Development check.
if (process.env.NODE_ENV !== 'production'){
    dotenv.config({
        path: './config/development.env'
    });
}

// Import all the routes and middleware
const app = require('./app');

// Connect to the database
const database = process.env.DB_URI;
mongoose.connect(database, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then( con => {
    console.log('Database connection successfully');
}).catch( error => {
    console.log('Database connection error.');
    console.log(error.name);
});

// Global unhandled Error
process.on('unhandledRejection', err => {
    console.log('Uncaught Rejection. Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

// Server lift
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
