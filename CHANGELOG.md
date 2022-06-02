# buildah-build Changelog

## v2.10
- Make image and tag in lowercase, if found in uppercase. https://github.com/redhat-actions/buildah-build/issues/89
- Add `--tls-verify` and `extra-args` input for `buildah from` command. https://github.com/redhat-actions/buildah-build/issues/92
- Remove kubic packages from test workflows. https://github.com/redhat-actions/buildah-build/issues/93

## v2.9
- Add support for multiple archs and platforms.
- Allow building image manifest if multi arch or platform is provided.

## v2.8
- Allow fully qualified image names in `tags` input, for compatibility with [docker/metadata-action`](https://github.com/docker/metadata-action). [#74](https://github.com/redhat-actions/buildah-build/issues/74)
- Support for `--platform` argument [#65](https://github.com/redhat-actions/buildah-build/issues/65)

## v2.7
- Add output `image-with-tag` which provides image name and its corresponding first tag present.
- Replace input `dockerfiles` with `containerfiles`. Input `dockerfiles` will be present as alias of `containerfiles`.
- Add matrix to install latest buildah. (Internal)

## v2.6.2
- Run `buildah config` command before `buildah copy` command to use `workingDir` for copying

## v2.6.1
- Fix buildah-bud docs link in README

## v2.6
- Rename "archs" input to "arch"
- Improve documentation for multi-architecture builds

## v2.5.2
- Update README for multi-architecture builds

## v2.5.1
- Fix README typo

## v2.5
- Add input `extra-args` to pass extra args to buildah bud for build image using dockerfile [2f7f68e](https://github.com/redhat-actions/buildah-build/commit/2f7f68ec840393890fca056f55d0140cf909c46d)

## v2.4.1
- Update README to point to podman-login action [0c92abf](https://github.com/redhat-actions/buildah-build/commit/0c92abf30679c2b1b5329bacce9abbc3d3d94496)

## v2.4
- Fix buildah issue of using `overlay` as storage driver [6dbeb7e](https://github.com/redhat-actions/buildah-build/commit/6dbeb7e1f64c961b642625d54e551d296dafdd30)

## v2.3.1
- Fix issue of workDir not being used in the code [65f18d4](https://github.com/redhat-actions/buildah-build/commit/65f18d484c4278f73a530e03bfe9661649dc7615)

## v2.3
- Add Layers input for build using dockerfile [3196e5a](https://github.com/redhat-actions/buildah-build/commit/3196e5acb5dc5db144b00aeddd723de3d8604506)

## v2.2.1
- Add note about multi architecture(s) image built support [1f7c249](https://github.com/redhat-actions/buildah-build/commit/1f7c2499306a8def9affb31cc7d43934bb87907d)

## v2.2
- Add output message if tags is not provided [76570bc](https://github.com/redhat-actions/buildah-build/commit/76570bc65b73d4072c85224b6f6e2fef3cf2b24b)

## v2.1
- Add `archs` input to allow building images for custom architectures [803a141](https://github.com/redhat-actions/buildah-build/commit/803a1413e7c2a594cbfb6680bca358bfdbe36745)

## v2
- Rename `tag` input to `tags`, to allow you to build multiple tags of the same image
- Add outputs `image` and `tags`, which output the image name and all tags of the image that was created [88e0085](https://github.com/redhat-actions/buildah-build/commit/88e00855444b8d915b900c8251f48c291ccedce5)
- (Internal) Add CI checks to the action that includes ESlint, bundle verifier and IO checker [20a8e62](https://github.com/redhat-actions/buildah-build/commit/20a8e62ce082870ed0ff1ee141bb98ae95432501)

## v1
- Initial marketplace release

## v0.1
- Initial pre-release
