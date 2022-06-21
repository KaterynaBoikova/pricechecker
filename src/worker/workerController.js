let Queue = require('bull');
let workQueue = new Queue('puppy');
const jobToDo = require('./workerJob');
const postJobTopZamokController = async (req, res, next) => {
    const job = await workQueue.add('topZamok');
    return res.status(201).json({'jobName': job.name, 'jobId': job.id});
};
const postJobZamokUkrController = async (req, res, next) => {
    const job = await workQueue.add('zamokUkr');
    return res.status(201).json({'jobName': job.name, 'jobId': job.id});
};

workQueue.process('topZamok', async(job)=>{
    console.log({'jobNamefromq': job.name, 'jobIdfromq': job.id});
    const result = await jobToDo.jobTopZamok();
    return result;
})
workQueue.process('zamokUkr', async(job)=>{
    console.log({'jobNamefromq': job.name, 'jobIdfromq': job.id});
    const result = await jobToDo.jobZamokUkr();
    return result;
})
workQueue.on('global:completed', (job, result) => {
        console.log("Job Completed: ", job, "Result: ", result);
    })

module.exports = {
    postJobTopZamokController,
    postJobZamokUkrController,
}