const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Queue = require('bull');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const workQueue = new Queue('work', REDIS_URL);

if (process.env.NODE_ENV !== 'production'){
    dotenv.config({
        path: './config/development.env'
    });
}


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


workQueue.on('global:completed', (jobId, result) => {
    console.log(`Job completed with result ${result}`);
});

process.on('unhandledRejection', err => {
    console.log('Uncaught Rejection. Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

const port = process.env.PORT;
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
});
