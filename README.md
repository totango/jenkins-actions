# LeanIX Jenkins Action

This repository helps you to programmatically trigger Jenkins jobs.

## Use Action

To populate the environment of your current Github Actions Workflow job with the secrets defined in the Azure Key Vault, just use the following action in any of your workflow:

```yaml
- uses: leanix/jenkins-action@master
  with:
    jobUrl: https://myci.inter.net/job/my-job/
```

As a prerequisite you need to have two environment variables available:

* `JENKINS_USER`: Your Jenkins username
* `JENKINS_TOKEN`: Your Jenkins API token

## Copyright and license

Copyright 2020 LeanIX GmbH under the [Unlicense license](LICENSE).
