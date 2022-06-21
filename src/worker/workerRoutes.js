const express = require('express');
const router = express.Router();
const { asyncWrapper } = require('../helpers/asyncWrapper');
const jobController = require('./workerController');

router.post('/zamokukr/job', asyncWrapper(jobController.postJobZamokUkrController));
router.post('/topzamok/job', asyncWrapper(jobController.postJobTopZamokController));
router.get('/zamokukr/job', asyncWrapper(jobController.postJobZamokUkrController));
router.get('/topzamok/job', asyncWrapper(jobController.postJobTopZamokController));


module.exports = router;
