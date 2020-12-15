const core = require("@actions/core")
const axios = require("axios")

// External input
const username = process.env.JENKINS_USER
const apitoken = process.env.JENKINS_TOKEN
const parameters = `${core.getInput("parameters")}`
const waitForCompletion = `${core.getInput("waitForCompletion")}`
var jobBuildUrl = `${core.getInput("jobBuildUrl")}`

const poll = async ({ fn, validate, interval, maxAttempts }) => {
    let attempts = 0
    const executePoll = async (resolve, reject) => {
        const result = await fn()
        attempts++
        if (validate(result)) {
            return resolve(result)
        } else if (maxAttempts && attempts === maxAttempts) {
            return reject(new Error("Exceeded max attempts"))
        } else {
            setTimeout(executePoll, interval, resolve, reject)
        }
    }
    return new Promise(executePoll)
}

const pollForBuildStart = async (queuedItemUrl) => {
    return poll({
        fn: async () => {
            return axios.post(queuedItemUrl, {}, { auth: basicAuth })
        },
        validate: response => response.data.executable !== undefined,
        /* Poll every second */
        interval: 1000,
        /* Poll for 10 minutes */
        maxAttempts: 60 * 10
    })
}

const pollForBuildCompletion = async (buildUrl) => {
    return poll({
        fn: async () => {
            return axios.post(buildUrl, {}, { auth: basicAuth })
        },
        validate: response => response.data.result !== undefined,
        /* Poll every second */
        interval: 1000,
        /* Poll for 30 minutes */
        maxAttempts: 60 * 30
    })
}

if (parameters !== undefined && parameters !== "") {
    const queryParam = parameters.trim().replace(/\n+/g, "&")
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
        core.info("Job triggered")
        if (response.status != 201 || response.headers.location === undefined ) {
            core.error(`Status: ${response.status}`)
            core.error(`Location: ${response.headers.location}`)
            core.setFailed("Prerequisite for triggered job failed")
            return
        }
        const queuedItemUrl = `${response.headers.location}api/json`
        core.info(`Polling startup of job via ${queuedItemUrl}`)
        pollForBuildStart(queuedItemUrl)
            .then((response) => {
                core.info("Job successfully started")
                core.info(`Build URL is ${response.data.executable.url}`)
                if (waitForCompletion == "true") {
                    core.info("Waiting for job completion")
                    const buildUrl = `${response.data.executable.url}api/json`
                    pollForBuildCompletion(buildUrl)
                        .then((response) => {
                            core.info(`Job finished with result ${response.data.result}`)
                            if (response.data.result != "SUCCESS") {
                                core.setFailed("Unsuccessful job state")
                            }
                        })
                        .catch((error) => {
                            core.setFailed(error.message)
                        })
                }

            })
            .catch((error) => {
                core.setFailed(error.message)
            })
    })
    .catch((error) => {
        core.setFailed(error.message)
    })
