# buildah

Buildah is a GitHub Action for building OCI-compatible (Docker- and Kubernetes-compatible) images quickly and easily.

Buildah action works only on Linux distributions, and it is not supported on Windows or Mac platforms at this time.

Note that GitHub's [Ubuntu Environments](https://github.com/actions/virtual-environments#available-environments) (ubuntu-20.04 and ubuntu-18.04) come with buildah 1.17.0 installed. So, if you are not using those Ubuntu environments you need to make sure to install buildah tool in an early step.

