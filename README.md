# buildah-action

[![tag badge](https://img.shields.io/github/v/tag/redhat-actions/buildah-action?sort=semver)](https://github.com/redhat-actions/buildah-action/tags)
[![license badge](https://img.shields.io/github/license/redhat-actions/buildah-action)](./LICENSE)
[![size badge](https://img.shields.io/github/size/redhat-actions/buildah-action/dist/index.js)](./dist)

Buildah is a GitHub Action for building OCI-compatible (Docker- and Kubernetes-compatible) images quickly and easily.

Buildah action works only on Linux distributions, and it is not supported on Windows or Mac platforms at this time.

Note that GitHub's [Ubuntu Environments](https://github.com/actions/virtual-environments#available-environments) (ubuntu-20.04 and ubuntu-18.04) come with buildah 1.17.0 installed. So, if you are not using those Ubuntu environments you need to make sure to install buildah tool in an early step.

## Action Inputs

<table>
  <thead>
    <tr>
      <th>input</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>

  <tr>
    <td>image</td>
    <td>Yes</td>
    <td>Name to give to the image that will be eventually created.</td>
  </tr>

  <tr>
    <td>base-name</td>
    <td>No</td>
    <td>The base image to use to create the initial container. If not specified, the action will try to pick one automatically. (N.B: At this time the action is only able to auto select Java base image)</td>
  </tr>

  <tr>
    <td>dockerfiles</td>
    <td>No</td>
    <td>The list of Dockerfile paths to perform a build using docker instructions. This is a multiline input to add multiple values.</td>
  </tr>

  <tr>
    <td>context</td>
    <td>No</td>
    <td>The path of the directory to use as context (default: .)</td>
  </tr>

  <tr>
    <td>content</td>
    <td>No</td>
    <td>The content to copy inside the container to create the final image. This is a multiline input to allow you to copy more than one file/directory. For example - <br> content: | <br> target/spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar</td>
  </tr>

  <tr>
    <td>entrypoint</td>
    <td>No</td>
    <td>The entry point to set for the container. This is a multiline input to add multiple values. For example - <br> entrypoint: | <br> java <br> -jar <br> spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar</td>
  </tr>

  <tr>
    <td>port</td>
    <td>No</td>
    <td>The port to expose when running the container.</td>
  </tr>

  <tr>
    <td>working-dir</td>
    <td>No</td>
    <td>The working directory to use within the container.</td>
  </tr>

  <tr>
    <td>envs</td>
    <td>No</td>
    <td>The environment variables to be set when running the container. This is a multiline input to add multiple environment variables.For example - <br> envs: | <br> GOPATH=/root/buildah</td>
  </tr>
</table>

## Build an image using Dockerfile or from scratch 

One of the advantages of using the `buildah` action is that you can decide the way you want to build your image. 

If you have been using Docker and have some existing Dockerfiles, `buildah` is able to build images by using them.
In this case the inputs needed are just `image`, `dockerfiles` and `content`.

An example below

```yaml
name: Build Image using Dockerfile
on: [push]

jobs:
  build:
    name: Build image
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v2
    - name: Buildah Action
      uses: redhat-actions/buildah-action@v1
      with:
        image: awesome-name:v1
        dockerfiles: |
          ./Dockerfile
```

On the other hand, a build from scratch may require more inputs as it needs to execute a series of steps that can be summarized in:
- Create a new container by using the base image (input: `base-image`)
- Copy all files/directories inside the newly-created container (input: `content`)
- Set up the image configuration values (inputs: `entrypoint`,`port`,`envs`)
- Build an optimized image

Example of building a Spring Boot Java app image below

```yaml
name: Build Image
on: [push]

jobs:
  build:
    name: Build image
    runs-on: ubuntu-latest

    steps:
    - name: Checkout
      uses: actions/checkout@v2

    - name: Maven
      run: mvn package
    - name: Build Action
      uses: redhat-actions/buildah-action@v1
      with:
        image: awesome-name:v1
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
