# buildah-build Changelog

## v2.1
- Add input `archs` to allow you to build image(s) with multiple architecture support [803a141](https://github.com/redhat-actions/buildah-build/commit/803a1413e7c2a594cbfb6680bca358bfdbe36745)

## v2
- Rename `tag` input to `tags`, to allow you to build multiple tags of the same image 
- Add outputs `image` and `tags`, which output the image name and all tags of the image that was created [88e0085](https://github.com/redhat-actions/buildah-build/commit/88e00855444b8d915b900c8251f48c291ccedce5)
- (Internal) Add CI checks to the action that includes ESlint, bundle verifier and IO checker [20a8e62](https://github.com/redhat-actions/buildah-build/commit/20a8e62ce082870ed0ff1ee141bb98ae95432501)

## v1
- Initial marketplace release

## v0.1
- Initial pre-release