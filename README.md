# buildah-build
[![CI checks](https://github.com/redhat-actions/buildah-build/workflows/CI%20checks/badge.svg)](https://github.com/redhat-actions/buildah-build/actions?query=workflow%3A%22CI+checks%22)
[![Verify Build](https://github.com/redhat-actions/buildah-build/workflows/Test%20Build/badge.svg)](https://github.com/redhat-actions/buildah-build/actions?query=workflow%3A%22Test+Build%22)
<br>
<br>
[![tag badge](https://img.shields.io/github/v/tag/redhat-actions/buildah-build)](https://github.com/redhat-actions/buildah-build/tags)
[![license badge](https://img.shields.io/github/license/redhat-actions/buildah-build)](./LICENSE)
[![size badge](https://img.shields.io/github/size/redhat-actions/buildah-build/dist/index.js)](./dist)

Buildah is a GitHub Action for building Docker and Kubernetes-compatible images quickly and easily.

Buildah only works on Linux. GitHub's [Ubuntu Environments](https://github.com/actions/virtual-environments#available-environments) (`ubuntu-18.04` and newer) come with buildah installed. If you are not using these environments, or if you want to use a different version, you must first [install buildah](https://github.com/containers/buildah/blob/master/install.md).

After building your image, use [push-to-registry](https://github.com/redhat-actions/push-to-registry) to push the image and make it pullable.

## Action Inputs

<table>
  <thead>
    <tr>
      <th>Input</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>

  <tr>
    <td>image</td>
    <td>Yes</td>
    <td>Name to give the output image.</td>
  </tr>

  <tr>
    <td>tags</td>
    <td>No</td>
    <td>
      The tags of the image to build. For multiple tags, separate by a space. For example, <code>latest ${{ github.sha }}</code>.<br>
      Default: <code>latest</code>
    </td>
  </tr>

  <tr>
    <td>base-image</td>
    <td>No</td>
    <td>The base image to use for the container.</td>
  </tr>

  <tr>
    <td>dockerfiles</td>
    <td>No</td>
    <td>The list of Dockerfile paths to perform a build using docker instructions. This is a multiline input to allow multiple Dockerfiles.
    </td>
  </tr>

  <tr>
    <td>oci</td>
    <td>No</td>
    <td>
      Build the image using the OCI format, instead of the Docker format.<br>
      By default, this is <code>false</code>, because images built using the OCI format have <a href="https://github.com/docker/hub-feedback/issues/1871">issues</a> when published to Dockerhub.
    </td>
  </tr>

  <tr>
    <td>context</td>
    <td>No</td>
    <td>Path to directory to use as the build context.<br>
    Default: <code>.</code></td>
  </tr>

  <tr>
    <td>build-args</td>
    <td>No</td>
    <td>Build arguments to pass to the Docker build using <code>--build-arg</code>, if using a Dockerfile that requires ARGs.<br>
    Uses the form <code>arg_name=arg_value</code>, and separate arguments with newlines.</td>
  </tr>

  <tr>
    <td>content</td>
    <td>No</td>
    <td>The content to copy inside the container to create the final image. This is a multiline input to allow you to copy more than one file/directory.<br>
    <pre>content: |
  target/spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar</pre>
    </td>
  </tr>

  <tr>
    <td>entrypoint</td>
    <td>No</td>
    <td>The entry point to set for the container. This is a multiline input; split arguments across lines.
      <pre>entrypoint: |
  java
  -jar
  spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar</pre>
    </td>
  </tr>

  <tr>
    <td>port</td>
    <td>No</td>
    <td>The port to expose when running the container.</td>
  </tr>

  <tr>
    <td>workdir</td>
    <td>No</td>
    <td>The working directory to use within the container.</td>
  </tr>

  <tr>
    <td>envs</td>
    <td>No</td>
    <td>The environment variables to be set when running the container. This is a multiline input to add multiple environment variables.<br>
      <pre>
envs: |
  GOPATH=/root/buildah/go</pre>
    </td>
  </tr>
</table>

## Action Outputs

`image`: The name of the built image.<br>
For example, `spring-image`.

`tags`: A list of the tags that were created, separated by spaces.<br>
For example, `latest ${{ github.sha }}`.

## Build Types

You can configure the `buildah` action to build your image using one or more Dockerfiles, or none at all.

### Building using Dockerfiles

If you have been building your images with an existing Dockerfile, `buildah` can reuse your Dockerfile.

In this case the inputs needed are `image` and `dockerfiles`. `tag` is also recommended. If your Dockerfile requires ARGs, these can be passed using `build-arg`.

```yaml
name: Build Image using Dockerfile
on: [push]

jobs:
  build:
    name: Build image
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - name: Buildah Action
      uses: redhat-actions/buildah-build@v2
      with:
        image: my-new-image
        tags: v1 ${{ github.sha }}
        dockerfiles: |
          ./Dockerfile
        build-args: |
          some_arg=some_value
```

### Building without a Dockerfile

Building without a Dockerfile requires additional inputs, that would normally be specified in the Dockerfile.

Do not set `dockerfiles` if you are doing a build from scratch. Otherwise those Dockerfiles will be used, and the inputs below will be ignored.

- An output `image` name and usually a `tag`.
- `base-image`
  - In a Dockerfile, this would be the `FROM` directive.
- `content` to copy into the new image
  - In a Dockerfile, this would be `COPY` directives.
- `entrypoint` so the container knows what command to run.
  - In a Dockerfile, this would be the `ENTRYPOINT`.
- All other optional configuration inputs, such as `port`, `envs`, and `workdir`.

Example of building a Spring Boot Java app image:
```yaml
name: Build Image
on: [push]

jobs:
  build-image:
    name: Build image
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2

    - run: mvn package

    - name: Build Image
      uses: redhat-actions/buildah-build@v2
      with:
        base-image: docker.io/fabric8/java-alpine-openjdk11-jre
        image: my-new-image
        tags: v1
        content: |
          target/spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar
        entrypoint: java -jar spring-petclinic-2.3.0.BUILD-SNAPSHOT.jar
        port: 8080
```

## Using private images
If your build requires a private image, you have to `docker login` in a step before running this action.

For example:
```yaml
- name: Log in to Red Hat Registry
  run: echo "${{ secrets.REGISTRY_REDHAT_IO_PASSWORD }}" | docker login registry.redhat.io -u "${{ secrets.REGISTRY_REDHAT_IO_USER }}" --password-stdin
```

## Contributing

This is an open source project open to anyone. This project welcomes contributions and suggestions!

## Feedback & Questions

If you discover an issue please file a bug in [GitHub issues](https://github.com/redhat-actions/buildah/issues) and we will fix it as soon as possible.

## License

MIT, See [LICENSE](https://github.com/redhat-actions/buildah/blob/main/LICENSE.md) for more information.
