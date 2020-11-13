# buildah-action

Buildah is a GitHub Action for building OCI-compatible (Docker- and Kubernetes-compatible) images quickly and easily.

Buildah action works only on Linux distributions, and it is not supported on Windows or Mac platforms at this time.

Note that GitHub's [Ubuntu Environments](https://github.com/actions/virtual-environments#available-environments) (ubuntu-20.04 and ubuntu-18.04) come with buildah 1.17.0 installed. So, if you are not using those Ubuntu environments you need to make sure to install buildah tool in an early step.

## Action Inputs

<table>
  <thead>
    <tr>
      <th>Action input</th>
      <th>Description</th>
    </tr>
  </thead>

  <tr>
    <td>new-image-name</td>
    <td>(Required) Name to give to the image that will be eventually created.</td>
  </tr>

  <tr>
    <td>base-name</td>
    <td>(Optional) The base image to use to create the initial container. If not specified, the action will try to pick one automatically. Only Java language is supported at this time.</td>
  </tr>

  <tr>
    <td>content</td>
    <td>(Required) The content to copy inside the container to create the final image. This is a multiline input to allow you to copy more than one file/directory. For example - <br> content: | <br> target/spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar</td>
  </tr>

  <tr>
    <td>entrypoint</td>
    <td>(Required) The entry point to set for the container. This is a multiline input to add multiple values. For example - <br> entrypoint: | <br> java <br> -jar <br> spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar</td>
  </tr>

  <tr>
    <td>port</td>
    <td>(Required) The port to expose when running the container.</td>
  </tr>

  <tr>
    <td>working-dir</td>
    <td>(Optional) The working directory to use within the container.</td>
  </tr>

  <tr>
    <td>envs</td>
    <td>(Optional) The environment variables to be set when running the container. This is a multiline input to add multiple environment variables.For example - <br> envs: | <br> GOPATH=/root/buildah</td>
  </tr>
</table>

## Examples

```
name: CI
on: [push]

jobs:
  build:
    name: Build image
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v2

    - name: Maven
      run: |
        cd ${GITHUB_WORKSPACE}
        mvn package
    - name: Build Action
      uses: redhat-actions/buildah-action@0.0.1
      with:
        new-image-name: petclinic
        content: |
          target/spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar
        entrypoint: |
          java    
          -jar
          spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar
        port: 8080
```

## Contributing

This is an open source project open to anyone. This project welcomes contributions and suggestions!

## Feedback & Questions

If you discover an issue please file a bug in [GitHub issues](https://github.com/redhat-actions/buildah/issues) and we will fix it as soon as possible.

## License

MIT, See [LICENSE](https://github.com/redhat-actions/buildah/blob/main/LICENSE.md) for more information.


