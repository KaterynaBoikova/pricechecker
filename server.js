const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const process = require('process');
const pricesRouter = require('./src/routes');
const workerRouter = require('./src/worker')
const { errorHandler } = require('./src/helpers/errorHandler');
require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 1500;
const useragent = require('express-useragent');
const PORT = process.env.PORT || 8070;

const app = express();

app.use(morgan('tiny'));
app.use(cors());
app.use(express.json());
app.use(useragent.express());
app.use('/api/getPrices', pricesRouter);
app.use('/api/getPrices', workerRouter);

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
