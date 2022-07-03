const Queue = require('bull');
const errors = require("./src/helpers/errors");
const jobToDo = require("./src/worker/workerJob");

let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const workQueue = new Queue('puppy', REDIS_URL);
const postJob = async (req, res, next) => {
    const {'jobName': jobName} = req.params;
    const job = await workQueue.add(jobName);
    return res.status(201).json({'jobName': job.name, 'jobId': job.id});
};

const getJobProgress = async (req, res, next) => {
    const {'jobId': jobId} = req.params;
    const job = await workQueue.getJob(jobId);
    if (job === null) {
        res.status(404).json('job not found');
    } else {
        const progress = job.progress();
        const status = await job.getState();
        return res.status(200).json({'progress': progress, 'status': status, 'jobId': job.id, 'jobName': job.name});
    }
};

const getJobResult = async (req, res, next) => {
    const {'jobId': jobId} = req.params;
    const job = await workQueue.getJob(jobId);
    if (job === null) {
        res.status(404).json('job not found');
    } else {
        const data = job.returnvalue;
        return res.status(200).json(data);
    }
};

workQueue.process('zamokUkr', async(job)=>{
    return await jobToDo.jobZamokUkr(job);
});

workQueue.process('topZamok', async(job)=>{
    return await jobToDo.jobTopZamok(job);
});
//clean queue
// workQueue.obliterate({force: true });

//clean specified type after grace time
workQueue.clean(2000000, 'wait');
workQueue.clean(2000000, 'failed');
workQueue.clean(2000000, 'completed');

module.exports = {
    postJob,
    getJobResult,
    getJobProgress,
}

