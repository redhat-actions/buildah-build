# buildah-build
[![CI checks](https://github.com/redhat-actions/buildah-build/workflows/CI%20checks/badge.svg)](https://github.com/redhat-actions/buildah-build/actions?query=workflow%3A%22CI+checks%22)
[![Build](https://github.com/redhat-actions/buildah-build/workflows/Build/badge.svg)](https://github.com/redhat-actions/buildah-build/actions?query=workflow%3ABuild)
[![Build from dockerfile](https://github.com/redhat-actions/buildah-build/workflows/Build%20from%20dockerfile/badge.svg)](https://github.com/redhat-actions/buildah-build/actions?query=workflow%3A%22Build+from+dockerfile%22)
[![Link checker](https://github.com/redhat-actions/buildah-build/workflows/Link%20checker/badge.svg)](https://github.com/redhat-actions/buildah-build/actions?query=workflow%3A%22Link+checker%22)
<br>
<br>
[![tag badge](https://img.shields.io/github/v/tag/redhat-actions/buildah-build)](https://github.com/redhat-actions/buildah-build/tags)
[![license badge](https://img.shields.io/github/license/redhat-actions/buildah-build)](./LICENSE)
[![size badge](https://img.shields.io/github/size/redhat-actions/buildah-build/dist/index.js)](./dist)

Buildah Build is a GitHub Action for building Docker and Kubernetes-compatible images quickly and easily.

[Buildah](https://github.com/containers/buildah/tree/master/docs) only works on Linux. GitHub's [Ubuntu Environments](https://github.com/actions/virtual-environments#available-environments) (`ubuntu-18.04` and newer) come with buildah installed. If you are not using these environments, or if you want to use a different version, you must first [install buildah](https://github.com/containers/buildah/blob/master/install.md).

After building your image, use [push-to-registry](https://github.com/redhat-actions/push-to-registry) to push the image and make it pullable.

<a id="action-inputs"></a>

## Action Inputs

<a id="dockerfile-build-inputs"></a>

### [Inputs for build from dockerfile](https://github.com/containers/buildah/blob/master/docs/buildah-bud.md)

| Input Name | Description | Default |
| ---------- | ----------- | ------- |
| arch | Label the image with this ARCH, instead of defaulting to the host architecture. Refer to [Multi arch builds](#multi-arch-builds) to setup the `qemu-user-static` dependency. | None (host architecture)
| build-args | Build arguments to pass to the Docker build using `--build-arg`, if using a Dockerfile that requires ARGs. Use the form `arg_name=arg_value`, and separate arguments with newlines. | None
| context | Path to directory to use as the build context. | `.`
| dockerfiles | The list of Dockerfile paths to perform a build using docker instructions. This is a multiline input to allow multiple Dockerfiles. | **Must be provided**
| extra-args | Extra args to be passed to buildah bud. Separate arguments by newline. Do not use quotes. | None
| image | Name to give to the output image. | **Must be provided**
| layers | Set to true to cache intermediate layers during the build process. | None
| oci | Build the image using the OCI format, instead of the Docker format. By default, this is `false`, because images built using the OCI format have issues when published to Dockerhub. | `false`
| tags | The tags of the image to build. For multiple tags, separate by a space. For example, `latest ${{ github.sha }}` | `latest`

<a id="scratch-build-inputs"></a>

### [Inputs for build without dockerfile](https://github.com/containers/buildah/blob/master/docs/buildah-config.md)

| Input Name | Description | Default |
| ---------- | ----------- | ------- |
| arch | Label the image with this ARCH, instead of defaulting to the host architecture. | None (host architecture)
| base-image | The base image to use for the container. | **Must be provided**
| content | Paths to files or directories to copy inside the container to create the file image. This is a multiline input to allow you to copy multiple files/directories.| None
| entrypoint | The entry point to set for the container. This is a multiline input; split arguments across lines. | None
| envs | The environment variables to be set when running the container. This is a multiline input to add multiple environment variables. | None
| image | Name to give to the output image. | **Must be provided**
| oci | Build the image using the OCI format, instead of the Docker format. By default, this is `false`, because images built using the OCI format have issues when published to Dockerhub. | `false`
| port | The port to expose when running the container. | None
| tags | The tags of the image to build. For multiple tags, separate by a space. For example, `latest ${{ github.sha }}` | `latest`
| workdir | The working directory to use within the container. | None

<a id="outputs"></a>

## Action Outputs

`image`: The name of the built image.<br>
For example, `spring-image`.

`tags`: A list of the tags that were created, separated by spaces.<br>
For example, `latest ${{ github.sha }}`.

<a id="build-types"></a>

## Build Types

You can configure the `buildah` action to build your image using one or more Dockerfiles, or none at all.

<a id="build-using-dockerfile"></a>

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
<a id="scratch-build"></a>

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
    name: Build image without Dockerfile
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

<a id="multi-arch-builds"></a>

## Multi arch builds

Refer to the [multi-arch example](./.github/workflows/multiarch.yml).

### Emulating RUN instructions

Cross-architecture builds from dockerfiles containing `RUN` instructions require `qemu-user-static` emulation registered in the Linux kernel.

For example, run `sudo apt install qemu-user-static` on Debian hosts, or `sudo dnf install qemu-user-static` on Fedora.

You can run a [containerized version of the registration](https://hub.docker.com/r/tonistiigi/binfmt) if the package does not exist for your distribution:
```sh
sudo podman run --rm --privileged docker.io/tonistiigi/binfmt --install all
```
This registration remains active until the host reboots.

### The `arch` input
The `arch` argument overrides the `ARCH` label in the output image. It does not actually affect the architectures the output image will run on. The image must still be built for the required architecture.

There is a simple example [in this issue](https://github.com/redhat-actions/buildah-build/issues/60#issuecomment-876552452).

### Creating a Multi-Arch Image List
Use the [buildah manifest](https://github.com/containers/buildah/blob/main/docs/buildah-manifest.md) command to bundle images into an image list, so multiple image can be referenced by the same repository tag.

There are examples and explanations of the `manifest` command [in this issue](https://github.com/containers/buildah/issues/1590).

This action does not support the `manifest` command at this time, but there is [an issue open](https://github.com/redhat-actions/buildah-build/issues/61).

## Using private images

If your build references a private image, run [**podman-login**](https://github.com/redhat-actions/podman-login) in a step before this action so you can pull the image.
For example:

```yaml
- name: Log in to Red Hat Registry
  uses: redhat-actions/podman-login@v1
  with:
    registry: registry.redhat.io
    username: ${{ secrets.REGISTRY_REDHAT_IO_USER }}
    password: ${{ secrets.REGISTRY_REDHAT_IO_PASSWORD }}
```
