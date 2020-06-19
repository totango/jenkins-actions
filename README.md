# Jenkins Action

This Github action helps you to programmatically trigger Jenkins jobs.

## Use Action

As a prerequisite you need to have two environment variables available:

* `JENKINS_USER`: Your Jenkins username
* `JENKINS_TOKEN`: Your Jenkins API token

This can be achieved by any previous step or other measure to inject credentials into your workflow.
Subsequently you can integrate your Jenkins job:

```yaml
- uses: leanix/jenkins-action@master
  with:
    jobBuildUrl: https://myci.inter.net/job/my-job/build
```

Please note that you need to provide the [build URL of your job](https://www.jenkins.io/doc/book/using/remote-access-api/). Depending on your job this could be `/build`, `/buildWithParameters`, etc.

The following parameters are currently supported:

* `jobBuildUrl`: Build URL of your job
* `waitForCompletion`: Actively poll until the job completes with success, error, etc.
* `parameters`: Linebreak-separated list of key value pairs to be provided as parameters for the job  

[Example usage](https://github.com/leanix/jenkins-action/blob/master/.github/workflows/main.yml)

## Copyright and license

Copyright 2020 LeanIX GmbH under the [Unlicense license](LICENSE).

