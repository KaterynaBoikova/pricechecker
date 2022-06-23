let Queue = require('bull');
let workQueue = new Queue('puppy');
const jobToDo = require('./workerJob');
const errors = require("../helpers/errors");

let topZamokPuppy = {};
let zamokUkrPuppy = {};

const postJobTopZamokController = async (req, res, next) => {
    const job = await workQueue.add('topZamok');
    return res.status(201).json({'jobName': job.name, 'jobId': job.id});
};
const postJobZamokUkrController = async (req, res, next) => {
    const job = await workQueue.add('zamokUkr');
    return res.status(201).json({'jobName': job.name, 'jobId': job.id});
};
const getJobPrgZamokUkrController = async (req, res, next) => {
    const {'jobId': jobId} = req.params;
    return res.status(201).json({jobId});
};
const getJobPrgTopZamokController = async (req, res, next) => {
    const {'jobId': jobId} = req.params;
    return res.status(201).json({jobId});
};
const getJobResTopZamokController = async (req, res, next) => {
    if(Object.keys(topZamokPuppy).length === 0){
        throw new errors.DateWebError("Something went wrong with puppy, try again.");
    }
    return res.status(200).json({'topZamok': topZamokPuppy});
};
const getJobResZamokUkrController = async (req, res, next) => {
    if(Object.keys(zamokUkrPuppy).length === 0){
        throw new errors.DateWebError("Something went wrong with puppy, try again.");
    }
    return res.status(200).json({'zamokUkr': zamokUkrPuppy});
};


const processingJobOne = async ()=>{
        await workQueue.process('topZamok', async(job)=>{
        const data = await jobToDo.jobTopZamok();
        topZamokPuppy = data;
        return data;
    });
}
const processingJobTwo = async ()=>{
        await workQueue.process('zamokUkr', async(job)=>{
        const data = await jobToDo.jobZamokUkr();
        zamokUkrPuppy = data;
        return data;
    });
}

const resultTopZamok = processingJobOne();
const resultZamokUkr = processingJobTwo();

const getProgress = (jobId, progress)=>{
    workQueue.on('global:progress', function(jobId, progress) {
        console.log(`Job ${jobId} is ${progress * 100}% ready!`);
        return (`Job ${jobId} is ${progress * 100}% ready!`);
    });
    workQueue.on('global:completed', (job, result) => {
        console.log("Job Completed: ", job, "Result: ", result);
    })
};


module.exports = {
    postJobTopZamokController,
    postJobZamokUkrController,
    getJobResTopZamokController,
    getJobResZamokUkrController,
    getJobPrgZamokUkrController,
    getJobPrgTopZamokController
}