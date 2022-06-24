let Queue = require('bull');
let workQueue = new Queue('puppy');
const errors = require("../helpers/errors");
const jobToDo = require("./workerJob");

const postJob = async (req, res, next) => {
    const {'jobName': jobName} = req.params;
    const job = await workQueue.add(jobName);
    return res.status(201).json({'jobName': job.name, 'jobId': job.id});
};

const getJobProgress = async (req, res, next) => {
    const {'jobId': jobId} = req.params;
    const job = await workQueue.getJob(jobId);
    const progress = job.progress();
    const status = await job.getState();
    return res.status(200).json({'progress %': progress, 'status': status, 'jobId': job.id, 'jobName': job.name});
};

const getJobResult = async (req, res, next) => {
    const {'jobId': jobId} = req.params;
    const job = await workQueue.getJob(jobId);
    const data = job.returnvalue;
    return res.status(200).json(data);
};

workQueue.process('zamokUkr', async(job)=>{
    const data = await jobToDo.jobZamokUkr(job);
    return data;
});

workQueue.process('topZamok', async(job)=>{
    const data = await jobToDo.jobZamokUkr(job);
    return data;
});

workQueue.clean(2000000, 'wait');
workQueue.clean(2000000, 'failed');
workQueue.clean(2000000, 'completed');

module.exports = {
    postJob,
    getJobResult,
    getJobProgress,
}