const core = require('@actions/core')
const axios = require('axios')

// External input
const username = process.env.JENKINS_USER
const apitoken = process.env.JENKINS_TOKEN
const jobUrl = `${core.getInput('jobUrl')}`
const parameters = `${core.getInput('parameters')}`

// Prepare call
var jobUrlBuildTrigger = `${jobUrl.replace(/\/$/, "")}/buildWithParameters`
if ( parameters !== "" ) {
    jobUrlBuildTrigger = `${jobUrlBuildTrigger}?${parameters.replace("\n", "&")}`
}
const basicAuth = {
    username: username,
    password: apitoken
}

// Execute
core.info(`Triggering job: ${jobUrlBuildTrigger}`)
axios.post(jobUrlBuildTrigger, {}, { auth: basicAuth })
    .then((res) => {
        core.info("Job triggered successfully.")
        const queueItem = `${res.headers.location}/api/json`
        axios.post(queueItem, {}, { auth: basicAuth })
            .then((res) => {
                core.info(JSON.stringify(res.data, null, 1))
            })
            .catch((error) => {
                core.setFailed(error.message)
            })
    })
    .catch((error) => {
        core.setFailed(error.message)
    })
