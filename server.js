const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const process = require('process');
const pricesRouter = require('./src/main/routes');
const { errorHandler } = require('./src/helpers/errorHandler');
const workerRouter = require('./src/worker/workerRoutes');
const useragent = require('express-useragent');
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter } = require('@bull-board/api/bullAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const Queue = require('bull');
const Redis = require('ioredis');

require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 1500;

//redis
let REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
// const redis = new Redis(REDIS_URL);

const client = new Redis(REDIS_URL)
const subscriber = new Redis(REDIS_URL)

//bulllUI
const workQueue = new Queue('puppy', {
    createClient(type) {
        switch (type) {
            case 'client': return client;
            case 'subscriber': return subscriber;
            default: return new Redis(REDIS_URL);
        }}
});
const serverAdapter = new ExpressAdapter();
const { addQueue, removeQueue, setQueues, replaceQueues } =
    createBullBoard({
        queues: [new BullAdapter(workQueue)],
        serverAdapter: serverAdapter,
    });
serverAdapter.setBasePath('/admin/queues');

//app
const PORT = process.env.PORT || 8040;

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(useragent.express());
app.use('/api/getPrices', pricesRouter);
app.use('/api/getPrices', workerRouter);
app.use('/admin/queues', serverAdapter.getRouter());

app.use(errorHandler);
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!");
});

const start = async () => {
    try {
        app.listen(PORT, err => {
            if (err) console.error('Error at server launch:', err);
            console.log(`Server works at port ${PORT}!`);
        });
    } catch (err) {
        console.error(`Failed to launch application with error: ${err.message}`);
        process.exit(1);
    }
};

start();
