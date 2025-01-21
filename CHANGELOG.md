# rollup changelog

## 5.0.0

_2025-01-21_

### BREAKING CHANGES

#### Watch Mode Changes

- Watch mode no longer supports glob patterns as chokidar v4 removed glob support: glob patterns passed to `watch.chokidar` options such as `ignored` are now treated as literal paths (#5778)
- The `useFsEvents` option has been removed as chokidar v4 does not support the native macOS `fsevents` API anymore; use `usePolling` instead if you run into issues with too many open files (#5778)
- The `disableGlobbing` option has been removed together with the glob support it disabled (#5778)
- The `ChokidarOptions` type now matches the options supported by chokidar v4, which means the `ignored` option is properly typed as a list of paths, regular expressions, match functions or `{ path, recursive }` objects instead of `any` (#5778)

### Features

- Rollup no longer installs the native `fsevents` module as an optional dependency on macOS (#5778)

### Pull Requests

- [#5778](https://github.com/rollup/rollup/pull/5778): [v5.0] Update to chokidar v4 (@re-taro)

For previous changelogs, see

- [Rollup 4.x](./CHANGELOG-4.md)
- [Rollup 3.x](./CHANGELOG-3.md)
- [Rollup 2.x](./CHANGELOG-2.md)
- [Rollup 1.x](./CHANGELOG-1.md)
- [Rollup 0.x](./CHANGELOG-0.md)
