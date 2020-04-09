const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
    path: './config/development.env'
});

process.on('uncaughtException', err => {
    console.log('Uncaught Exception. Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const app = require('./app');

const database = process.env.DB_URI;
// Connect to the database
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

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});

process.on('unhandledRejection', err => {
    console.log('Uncaught Rejection. Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});