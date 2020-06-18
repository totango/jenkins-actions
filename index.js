const core = require('@actions/core')
const axios = require('axios')

// External input
const username = process.env.JENKINS_USER
const apitoken = process.env.JENKINS_TOKEN
const parameters = `${core.getInput('parameters')}`
var jobBuildUrl = `${core.getInput('jobBuildUrl')}`

const poll = async ({ fn, validate, interval, maxAttempts }) => {
    let attempts = 0
    const executePoll = async (resolve, reject) => {
        const result = await fn()
        attempts++
        if (validate(result)) {
            return resolve(result)
        } else if (maxAttempts && attempts === maxAttempts) {
            return reject(new Error('Exceeded max attempts'))
        } else {
            setTimeout(executePoll, interval, resolve, reject)
        }
    }
    return new Promise(executePoll)
}

function pollBuildStatus(queuedItemUrl) {
    core.info(`Polling status of job via ${queuedItemUrl}`)
    // console.log(request)
    poll({
        fn: async () => {
            return axios.post(queuedItemUrl, {}, { auth: basicAuth })
          },
        validate: response => response.data.executable !== undefined,
        interval: 1000,
    })
        .then((response) => {
            core.info("Job successfully started.")
            core.info(`Build URL is ${response.data.executable.url}`)
        })
        .catch((error) => {
            core.setFailed(error.message)
        })
}

if (parameters !== undefined && parameters !== "") {
    const queryParam = parameters.trim().replace(/\n+/, "&")
    core.info(`Using query params: ${queryParam}`)
    jobBuildUrl = `${jobBuildUrl}?${queryParam}`
}
const basicAuth = {
    username: username,
    password: apitoken
}

core.info(`Triggering job: ${jobBuildUrl}`)
axios.post(jobBuildUrl, {}, { auth: basicAuth })
    .then((response) => {
        core.info("Job triggered successfully.")
        const queueItem = `${response.headers.location}api/json`
        pollBuildStatus(queueItem)
    })
    .catch((error) => {
        core.setFailed(error.message)
    })
