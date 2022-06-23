const express = require('express');
const router = express.Router();
const { asyncWrapper } = require('../helpers/asyncWrapper');
const jobController = require('./workerController');

router.post('/zamokukr/job', asyncWrapper(jobController.postJobZamokUkrController));
router.post('/topzamok/job', asyncWrapper(jobController.postJobTopZamokController));
router.get('/zamokukr/jobResult', asyncWrapper(jobController.getJobResZamokUkrController));
router.get('/topzamok/jobResult', asyncWrapper(jobController.getJobResTopZamokController));
router.get('/zamokukr/jobStatus/:jobId', asyncWrapper(jobController.getJobPrgZamokUkrController));
router.get('/topzamok/jobStatus/:jobId', asyncWrapper(jobController.getJobPrgTopZamokController));


module.exports = router;
