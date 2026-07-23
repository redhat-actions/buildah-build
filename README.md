# buildah-build
[![CI checks](https://github.com/redhat-actions/buildah-build/workflows/CI%20checks/badge.svg)](https://github.com/redhat-actions/buildah-build/actions?query=workflow%3A%22CI+checks%22)
[![Build](https://github.com/redhat-actions/buildah-build/workflows/Build/badge.svg)](https://github.com/redhat-actions/buildah-build/actions?query=workflow%3ABuild)
[![Build from containerfile](https://github.com/redhat-actions/buildah-build/workflows/Build%20from%20containerfile/badge.svg)](https://github.com/redhat-actions/buildah-build/actions?query=workflow%3A%22Build+from+containerfile%22)
[![Link checker](https://github.com/redhat-actions/buildah-build/workflows/Link%20checker/badge.svg)](https://github.com/redhat-actions/buildah-build/actions?query=workflow%3A%22Link+checker%22)
<br>
<br>
[![tag badge](https://img.shields.io/github/v/tag/redhat-actions/buildah-build)](https://github.com/redhat-actions/buildah-build/tags)
[![license badge](https://img.shields.io/github/license/redhat-actions/buildah-build)](./LICENSE)
[![size badge](https://img.shields.io/github/size/redhat-actions/buildah-build/dist/index.js)](./dist)

Buildah Build is a GitHub Action for building Docker and Kubernetes-compatible images quickly and easily.

[Buildah](https://github.com/containers/buildah/tree/master/docs) only works on Linux. GitHub's [Ubuntu Environments](https://github.com/actions/runner-images#available-images) (`ubuntu-22.04` and newer) come with buildah installed. If you are not using these environments, or if you want to use a different version, you must first [install buildah](https://github.com/containers/buildah/blob/master/install.md). Alternatively, use the [`buildah-image`](#common-inputs) input to run buildah from a container.

If buildah is not found on the runner, the action will automatically fall back to using `podman build` for containerfile builds. Scratch builds (without a containerfile) always require buildah.

After building your image, use [push-to-registry](https://github.com/redhat-actions/push-to-registry) to push the image and make it pullable.

<a id="action-inputs"></a>

## Action Inputs

<a id="common-inputs"></a>

### Common Inputs

These inputs apply to both containerfile and scratch builds.

| Input Name | Description | Default |
| ---------- | ----------- | ------- |
| image | Name to give to the output image. Refer to the [Image and Tag Inputs](#image-tag-inputs) section. | **Required** - unless all `tags` include image name
| tags | One or more tags to give the new image. Separate by whitespace. Refer to the [Image and Tag Inputs](#image-tag-inputs) section. | `latest`
| labels | One or more labels to give the new image. Separate by newline. | None
| annotations | OCI annotations to add to the image. Separate by newline. For example, `org.opencontainers.image.version=1.5.6`. Only supported by OCI images. | None
| archs | Label the image with this architecture, instead of defaulting to the host architecture. Refer to [Multi arch builds](#multi-arch-builds) for more information. For multiple architectures, separate them by a comma. | None (host architecture)
| platforms | Label the image with this platform, instead of defaulting to the host platform. Refer to [Multi arch builds](#multi-arch-builds) for more information. For multiple platforms, separate them by a comma. | None (host platform)
| oci | Build the image using the OCI metadata format, instead of the Docker format. | `false`
| tls-verify | Require HTTPS and verify certificates when accessing the registry. Set to `false` to skip the verification. | `true`
| buildah-image | Run buildah from this container image instead of the host-installed buildah. Useful for getting a newer version. For example, `quay.io/buildah/stable`. | None

<a id="dockerfile-build-inputs"></a>

### [Inputs for build from containerfile](https://github.com/containers/buildah/blob/main/docs/buildah-build.1.md)

| Input Name | Description | Default |
| ---------- | ----------- | ------- |
| containerfiles\* | The list of Containerfile paths to perform a build using docker instructions. Separate filenames by newline. | **Required**
| context | Path to directory to use as the build context. | `.`
| build-args | Build arguments to pass to the build using `--build-arg`, if using a Containerfile that requires ARGs. Use the form `arg_name=arg_value`, and separate arguments with newlines. | None
| layers | Set to true to cache intermediate layers during the build process. | None
| squash | Squash all image layers into a single layer. | `true`
| extra-args | Extra args to be passed to `buildah bud`. Separate arguments by newline. Do not use quotes. | None

> \* The `containerfiles` input was previously `dockerfiles`. Refer to [this issue](https://github.com/redhat-actions/buildah-build/issues/57).

<a id="scratch-build-inputs"></a>

### [Inputs for build without containerfile](https://github.com/containers/buildah/blob/main/docs/buildah-config.1.md)

| Input Name | Description | Default |
| ---------- | ----------- | ------- |
| base-image | The base image to use for the container. | **Required**
| content | Paths to files or directories to copy inside the container to create the file image. This is a multiline input to allow you to copy multiple files/directories. | None
| entrypoint | The entry point to set for the container. Separate arguments by newline. | None
| envs | The environment variables to be set when running the container. Separate key=value pairs by newline. | None
| port | The port(s) to expose when running containers based on the image. Separate multiple ports by newline. | None
| workdir | The working directory to use within the container. | None
| extra-args | Extra args to be passed to `buildah from`. Separate arguments by newline. Do not use quotes. | None

<a id="image-tag-inputs"></a>
### Image and Tags Inputs
The `image` and `tags` inputs can be provided in one of two forms.

At least one tag must always be provided in `tags`. Multiple tags are separated by whitespace.

**Option 1**: Provide both `image` and `tags` inputs. The image will be built, and then tagged in the form `${image}:${tag}` for each tag.

For example:
```yaml
image: quay.io/my-namespace/my-image
tags: v1 v1.0.0
```
will create the image and apply two tags: `quay.io/my-namespace/my-image:v1` and `quay.io/my-namespace/my-image:v1.0.0`.

**Option 2**: Provide only the `tags` input, including the image name in each tag. The image will be built, and then tagged with each `tag`. In this case, the `image` input is ignored.

For example:
```yaml
# 'image' input is not set
tags: quay.io/my-namespace/my-image:v1 quay.io/my-namespace/my-image:v1.0.0
```
will also apply two tags: `quay.io/my-namespace/my-image:v1` and `quay.io/my-namespace/my-image:v1.0.0`.

If the `tags` input does not have image names in the `${name}:${tag}` form, then the `image` input must be set.

<a id="outputs"></a>

## Action Outputs

`image`: The name of the image as it was input.<br>
`tags`: A space-separated list of the tags that were applied to the new image.<br>
`image-with-tag`: The name of the image, tagged with the first tag.<br>
`digest`: The digest of the image built.<br>

For example:

``` yml
image: "spring-image"
tags: "latest ${{ github.sha }}"
image-with-tag: "spring-image:latest"
digest: "sha256:1235546456546..."
```

<a id="build-types"></a>

## Build Types

You can configure the `buildah` action to build your image using one or more Containerfiles, or none at all.

<a id="build-using-dockerfile"></a>

### Building using Containerfiles

If you have been building your images with an existing Containerfile, `buildah` can reuse your Containerfile.

In this case the inputs needed are `image` and `containerfiles`. `tag` is also recommended. If your Containerfile requires ARGs, these can be passed using `build-arg`.

```yaml
name: Build Image using Containerfile
on: [push]

jobs:
  build:
    name: Build image
    runs-on: ubuntu-24.04

    steps:
    - uses: actions/checkout@v7

    - name: Buildah Action
      uses: redhat-actions/buildah-build@v3
      with:
        image: my-new-image
        tags: v1 ${{ github.sha }}
        containerfiles: |
          ./Containerfile
        build-args: |
          some_arg=some_value
```
<a id="scratch-build"></a>

### Building without a Containerfile

Building without a Containerfile requires additional inputs, that would normally be specified in the Containerfile.

Do not set `containerfiles` if you are doing a build from scratch. Otherwise those Containerfiles will be used, and the inputs below will be ignored.

- An output `image` name and usually a `tag`.
- `base-image`
  - In a Containerfile, this would be the `FROM` directive.
- `content` to copy into the new image
  - In a Containerfile, this would be `COPY` directives.
- `entrypoint` so the container knows what command to run.
  - In a Containerfile, this would be the `ENTRYPOINT`.
- All other optional configuration inputs, such as `port`, `envs`, and `workdir`.

Example of building a Spring Boot Java app image:
```yaml
name: Build Image
on: [push]

jobs:
  build-image:
    name: Build image without Containerfile
    runs-on: ubuntu-24.04

    steps:
    - uses: actions/checkout@v7

    - run: mvn package

    - name: Build Image
      uses: redhat-actions/buildah-build@v3
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

Cross-architecture builds from containerfiles containing `RUN` instructions require `qemu-user-static` emulation registered in the Linux kernel.

For example, run `sudo apt install qemu-user-static` on Debian hosts, or `sudo dnf install qemu-user-static` on Fedora.

You can run a [containerized version of the registration](https://hub.docker.com/r/tonistiigi/binfmt) if the package does not exist for your distribution:
```sh
sudo podman run --rm --privileged docker.io/tonistiigi/binfmt --install all
```
This registration remains active until the host reboots.

### The `archs` and `platforms` inputs

The `archs` and `platforms` arguments override the Architecture and Platform labels in the output image, respectively. They do not actually affect the architectures and platforms the output image will run on. The image must still be built for the required architecture or platform.

There is a simple example [in this issue](https://github.com/redhat-actions/buildah-build/issues/60#issuecomment-876552452).

### Creating a Multi-Arch Image List

Use the `archs` and `platforms` inputs to build multi-architecture images. When multiple architectures or platforms are provided, a [manifest](https://github.com/containers/buildah/blob/main/docs/buildah-manifest.1.md) is created containing an image for each architecture. The manifest name is determined by the `image` and `tags` inputs.

When building for multiple architectures, each architecture is built in parallel for faster builds. After each build, the action verifies the output image matches the expected architecture.

If multiple tags are provided, multiple equivalent manifests will be created with the given tags.

[`push-to-registry`](https://github.com/redhat-actions/push-to-registry) action can be used to push the generated image manifest.

## Using a containerized buildah

If you need a newer version of buildah than what the runner provides, use the `buildah-image` input to run buildah from a container image:

```yaml
- name: Build with latest buildah
  uses: redhat-actions/buildah-build@v3
  with:
    image: my-image
    tags: latest
    containerfiles: ./Containerfile
    buildah-image: quay.io/buildah/stable
```

The action will use `podman run --privileged` to execute buildah commands inside the specified container, sharing storage with the host so the built image is available for subsequent steps.

## Build with docker/metadata-action

Refer to the [docker/metadata-action example](./.github/workflows/docker_metadata_action.yml).

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
