const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

app.get('/job/:id', async (req, res) => {
    let id = req.params.id;
    let job = await workQueue.getJob(id);

    if (job === null) {
        res.status(404).end();
    } else {
        let state = await job.getState();
        let progress = job._progress;
        let reason = job.failedReason;
        res.json({ id, state, progress, reason });
    }
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