# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.4.3](https://github.com/kwangure/svelte-docs/compare/v0.4.2...v0.4.3) (2022-08-25)

### [0.4.2](https://github.com/kwangure/svelte-docs/compare/v0.4.1...v0.4.2) (2022-08-25)


### Bug Fixes

* resolve deeply nested paths too ([5069a0b](https://github.com/kwangure/svelte-docs/commit/5069a0bcc1602c104b4a627b7b619733355633c7))

### [0.4.1](https://github.com/kwangure/svelte-docs/compare/v0.4.0...v0.4.1) (2022-07-21)


### Features

* expose docs-parsing function ([d29b0c9](https://github.com/kwangure/svelte-docs/commit/d29b0c9c1657512a9b91aec3834cbc151da16a92))


### Bug Fixes

* resolve relative & absolute imports correctly ([fedcd85](https://github.com/kwangure/svelte-docs/commit/fedcd856fc6e8a741a23c5145fcc02794c389145))

## [0.4.0](https://github.com/kwangure/svelte-docs/compare/v0.3.2...v0.4.0) (2022-07-17)


### ⚠ BREAKING CHANGES

* convert to vite plugin

### Features

* convert to vite plugin ([9cbcc43](https://github.com/kwangure/svelte-docs/commit/9cbcc435c1926de00787f81e692f1717843c6400))

### [0.3.2](https://github.com/kwangure/svelte-docs/compare/v0.3.1...v0.3.2) (2022-06-10)


### Bug Fixes

* make svelte peer dependency ([c4f39c2](https://github.com/kwangure/svelte-docs/commit/c4f39c29b4463fe5c565a1bbc2c51ae22ffe5b66))

### [0.3.1](https://github.com/kwangure/svelte-docs/compare/v0.3.0...v0.3.1) (2022-02-06)


### Bug Fixes

* only strip custom exports ([5396c0f](https://github.com/kwangure/svelte-docs/commit/5396c0fa773cc64a5b893656f5af9be2f44a71a9))

## [0.3.0](https://github.com/kwangure/svelte-docs/compare/v0.2.0...v0.3.0) (2022-01-07)


### ⚠ BREAKING CHANGES

* make svelte-docs a preprocessor

### Features

* make svelte-docs a preprocessor ([8b9018e](https://github.com/kwangure/svelte-docs/commit/8b9018ee60c3324f58136d40f43b242bd0b4479e))

## [0.2.0](https://github.com/kwangure/svelte-docs/compare/v0.0.3...v0.2.0) (2021-12-30)


### ⚠ BREAKING CHANGES

* Svelte-docs now on exports custom properties that are
defined on a `:root` or `:host` selector. CSS docs now output a
`property` property instead of `name`.

### Features

* add svelte-kit for site docs ([bbac173](https://github.com/kwangure/svelte-docs/commit/bbac173187905607cdd2b25121b2cfca152532af))
* add typescript ([#2](https://github.com/kwangure/svelte-docs/issues/2)) ([580f822](https://github.com/kwangure/svelte-docs/commit/580f8225270a7619fed6f9e021993f139610d2a6))
* adopt more granular typescript ([#3](https://github.com/kwangure/svelte-docs/issues/3)) ([0de9822](https://github.com/kwangure/svelte-docs/commit/0de982205963de5e19c78668c0229fc534db2614))
* trim comment ([c0554e8](https://github.com/kwangure/svelte-docs/commit/c0554e803be3910d278af83aa4d9c87fc5e2cac5))
* use css-tree to parse custom-properties ([b184e43](https://github.com/kwangure/svelte-docs/commit/b184e43e7a7b22a62ec8b38729d8ad5ebe46acab))


### Bug Fixes

* always outpu docs even if missing comments ([23afcab](https://github.com/kwangure/svelte-docs/commit/23afcab33a3cee35261df21975532d3ac67e85eb))

## [0.1.0](https://github.com/kwangure/svelte-docs/compare/v0.0.3...v0.1.0) (2021-12-30)


### ⚠ BREAKING CHANGES

* Svelte-docs now on exports custom properties that are
defined on a `:root` or `:host` selector. CSS docs now output a
`property` property instead of `name`.

### Features

* add svelte-kit for site docs ([bbac173](https://github.com/kwangure/svelte-docs/commit/bbac173187905607cdd2b25121b2cfca152532af))
* add typescript ([#2](https://github.com/kwangure/svelte-docs/issues/2)) ([580f822](https://github.com/kwangure/svelte-docs/commit/580f8225270a7619fed6f9e021993f139610d2a6))
* adopt more granular typescript ([3a78e53](https://github.com/kwangure/svelte-docs/commit/3a78e539efa36be4189ba161a237ec8e5a648e39))
* trim comment ([c0554e8](https://github.com/kwangure/svelte-docs/commit/c0554e803be3910d278af83aa4d9c87fc5e2cac5))
* use css-tree to parse custom-properties ([7fe0f32](https://github.com/kwangure/svelte-docs/commit/7fe0f32eac682f7c6a7845fa07bab8bec245b690))

### [0.0.3](https://github.com/kwangure/svelte-docs/compare/v0.0.3-rc.2...v0.0.3) (2021-07-26)

### [0.0.3-rc.2](https://github.com/kwangure/svelte-docs/compare/v0.0.3-rc.1...v0.0.3-rc.2) (2021-07-26)

### [0.0.3-rc.1](https://github.com/kwangure/svelte-docs/compare/v0.0.3-rc.0...v0.0.3-rc.1) (2021-07-26)


### Bug Fixes

* expose omitted tag properties ([d1a9339](https://github.com/kwangure/svelte-docs/commit/d1a933998a97aa693544b3a91b4b1c3fb8b2f305))

### [0.0.3-rc.0](https://github.com/kwangure/svelte-docs/compare/v0.0.2...v0.0.3-rc.0) (2021-07-26)


### Features

* parse component description ([d210eac](https://github.com/kwangure/svelte-docs/commit/d210eac29998710a7b503185981e22124cec4bc5))
* parse slot docs ([31728a7](https://github.com/kwangure/svelte-docs/commit/31728a7f7cc8f30dace218f927115591a7b35df8))

### [0.0.2](https://github.com/kwangure/svelte-docs/compare/v0.0.1...v0.0.2) (2021-07-06)


### Features

* completely abandon `sveltedoc-parser` implementation ([88147ba](https://github.com/kwangure/svelte-docs/commit/88147baa6c8cef81072fffac117fb5429aeb5d56))

### 0.0.1 (2021-06-29)


### Features

* initial commit ([c530e42](https://github.com/kwangure/svelte-docs/commit/c530e42e20aef31d51042ea58a8fe651d18eba77))
