class ProjectErrors extends Error {
    constructor(message) {
        super(message)
        this.status = 400
    }
}

class DateWebError extends ProjectErrors {
    constructor(message) {
        super(message)
        this.status = 400
    }
}


module.exports = {
    ProjectErrors,
    DateWebError,
}