# buildah-build Changelog

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
