let Queue = require('bull');
let workQueue = new Queue('puppy');
const jobToDo = require('./workerJob');
const fsPromises = require('fs').promises;
const fileTopZamok = require('../dbResults/topZamokResult.json');
const fileZamokUkr = require('../dbResults/zamokUkrResult.json');
const path = require("path");

const postJobTopZamokController = async (req, res, next) => {
    const job = await workQueue.add('topZamok');
    return res.status(201).json({'jobName': job.name, 'jobId': job.id});
};
const postJobZamokUkrController = async (req, res, next) => {
    const job = await workQueue.add('zamokUkr');
    return res.status(201).json({'jobName': job.name, 'jobId': job.id});
};
const getJobResTopZamokController = async (req, res, next) => {
    return res.status(200).json(fileTopZamok);
};
const getJobResZamokUkrController = async (req, res, next) => {
    const job = await workQueue.add('zamokUkr');
    return res.status(201).json({'jobName': job.name, 'jobId': job.id});
};

// const fileUpdate = async(path, data)=>{
//     await fsPromises.writeFile(path.resolve(__dirname, path), data);
// };

const processingJob = async ()=>{
        await workQueue.process('topZamok', async(job)=>{
        const data = await jobToDo.jobTopZamok();
        const result = JSON.stringify(data);
        return result
    });
}

const resultTopZamok = processingJob();

// workQueue.process('topZamok', async(job)=>{
//     console.log({'jobNamefromq': job.name, 'jobIdfromq': job.id});
//     const data = await jobToDo.jobTopZamok();
//     //const job = await workQueue.add('fileUpdateTopZamok');
//     const result = JSON.stringify(data);
//     return result
// });
workQueue.process('zamokUkr', async(job)=>{
    console.log({'jobNamefromq': job.name, 'jobIdfromq': job.id});
    const data = await jobToDo.jobZamokUkr();
    //const job = await workQueue.add('fileUpdateZamokUkr');
    const result = JSON.stringify(data);
    return result
});



workQueue.on('global:completed', (job, result) => {
        console.log("Job Completed: ", job, "Result: ", result);
    })

module.exports = {
    postJobTopZamokController,
    postJobZamokUkrController,
    getJobResTopZamokController,
    getJobResZamokUkrController
}