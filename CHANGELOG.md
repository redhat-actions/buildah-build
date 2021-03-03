# buildah-build Changelog

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
