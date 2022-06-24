const express = require('express');
const router = express.Router();
const { asyncWrapper } = require('../helpers/asyncWrapper');
const jobController = require('./workerController');



router.post('/jobs/:jobName', asyncWrapper(jobController.postJob));
router.get('/jobs/result/:jobId', asyncWrapper(jobController.getJobResult));
router.get('/jobs/progress/:jobId', asyncWrapper(jobController.getJobProgress));



module.exports = router;
