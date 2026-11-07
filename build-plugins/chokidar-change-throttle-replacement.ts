import type { RollupReplaceOptions } from '@rollup/plugin-replace';
import { readFile } from 'node:fs/promises';
import { exit } from 'node:process';

// chokidar 3 throttles file change notifications and silently discards the
// ones inside a throttle window, so when a file is written twice in quick
// succession, the second write is never reported and the watcher keeps the
// stale build. This affects two throttles:
// - the per-file 5ms throttle of the raw fs.watch listener, see
//   https://github.com/paulmillr/chokidar/blob/3.6.0/lib/nodefs-handler.js#L361
// - the per-file 50ms throttle of "change" events, see
//   https://github.com/paulmillr/chokidar/blob/3.6.0/index.js#L615-L618
// The replacements follow chokidar 6, where this is fixed upstream
// (https://github.com/paulmillr/chokidar/issues/1455): the raw listener is not
// throttled, and the newest "change" with different stats inside the 50ms
// window is replayed when the window closes, unless the file was unlinked or is
// no longer watched. A "change" that sees an empty file is held for up to 10ms
// so that a truncate-then-write is reported once with its data.

const INDEX = 'node_modules/chokidar/index.js';
const NODEFS_HANDLER = 'node_modules/chokidar/lib/nodefs-handler.js';

const THROTTLE_SIGNATURE = '_throttle(actionType, path, timeout) {';
const THROTTLE_SIGNATURE_WITH_RELEASE = '_throttle(actionType, path, timeout, onRelease) {';

const THROTTLE_CLEAR = `  const clear = () => {
    const item = action.get(path);
    const count = item ? item.count : 0;
    action.delete(path);
    clearTimeout(timeoutObject);
    if (item) clearTimeout(item.timeoutObject);
    return count;
  };`;
const THROTTLE_CLEAR_WITH_RELEASE = `  const clear = (invokeRelease = true) => {
    const item = action.get(path);
    const count = item ? item.count : 0;
    action.delete(path);
    clearTimeout(timeoutObject);
    if (item) clearTimeout(item.timeoutObject);
    if (invokeRelease && onRelease) onRelease(count);
    return count;
  };`;

const BEFORE_AWAIT_WRITE_FINISH = `  const awf = opts.awaitWriteFinish;
  let pw;`;
const CANCEL_CHANGE_REPLAY_ON_UNLINK = `  if (event === EV_UNLINK) {
    const changeThrottler = this._throttled.has(EV_CHANGE) && this._throttled.get(EV_CHANGE).get(path);
    if (changeThrottler) changeThrottler.clear(false);
    if (this._pendingChanges) this._pendingChanges.delete(path);
  }

${BEFORE_AWAIT_WRITE_FINISH}`;

const DISCARDING_CHANGE_THROTTLE = `  if (event === EV_CHANGE) {
    const isThrottled = !this._throttle(EV_CHANGE, path, 50);
    if (isThrottled) return this;
  }`;
const REPLAYING_CHANGE_THROTTLE = `  if (event === EV_CHANGE) {
    if (!this._pendingChanges) this._pendingChanges = new Map();
    const fullPath = opts.cwd ? sysPath.join(opts.cwd, path) : path;
    const isWatched = () => {
      const watchedDirectory = this._watched.get(sysPath.resolve(sysPath.dirname(fullPath)));
      return Boolean(watchedDirectory && watchedDirectory.has(sysPath.basename(fullPath)));
    };
    const isEmptyFile = (stats) => Boolean(stats && stats.isFile() && stats.size === 0);
    const throttler = this._throttle(EV_CHANGE, path, 50, (suppressedCount) => {
      const pending = this._pendingChanges.get(path);
      this._pendingChanges.delete(path);
      if (suppressedCount === 0 || !pending || !pending.replay || !isWatched()) return;
      void this._emit(EV_CHANGE, fullPath, ...pending.args.slice(2));
    });
    if (!throttler) {
      const pending = this._pendingChanges.get(path);
      const previousStats = pending && pending.args[2];
      const stats = args[2];
      // Only changes with stats are replayed. fsevents reports changes without
      // stats, so its duplicate notifications cannot be told apart from new
      // writes and are discarded as before.
      if (
        previousStats && stats &&
        (previousStats.size !== stats.size ||
          previousStats.mtimeMs !== stats.mtimeMs ||
          previousStats.ino !== stats.ino)
      ) {
        pending.args = args;
        pending.replay = true;
        // The data of a held truncate-then-write landed: publish it now.
        if (pending.held && !isEmptyFile(stats)) pending.held.release();
      }
      return this;
    }
    const pending = { args, replay: false, held: undefined };
    this._pendingChanges.set(path, pending);
    if (isEmptyFile(args[2])) {
      // A change that sees an empty file is usually the truncation of a write
      // that is still in progress. Hold it briefly so the data is reported in
      // the same change.
      const release = () => {
        clearTimeout(pending.held.timer);
        pending.held = undefined;
        if (this._pendingChanges.get(path) !== pending || this.closed || !isWatched()) return;
        pending.replay = false;
        this.emitWithAll(EV_CHANGE, pending.args);
      };
      pending.held = { timer: setTimeout(release, 10), release };
      return this;
    }
  }`;

const THROTTLED_RAW_LISTENER = `    if (!this.fsw._throttle(THROTTLE_MODE_WATCH, file, 5)) return;
`;

const replacements: [file: string, search: string, replacement: string][] = [
	[INDEX, THROTTLE_SIGNATURE, THROTTLE_SIGNATURE_WITH_RELEASE],
	[INDEX, THROTTLE_CLEAR, THROTTLE_CLEAR_WITH_RELEASE],
	[INDEX, BEFORE_AWAIT_WRITE_FINISH, CANCEL_CHANGE_REPLAY_ON_UNLINK],
	[INDEX, DISCARDING_CHANGE_THROTTLE, REPLAYING_CHANGE_THROTTLE],
	[NODEFS_HANDLER, THROTTLED_RAW_LISTENER, '']
];

const fileContents = new Map<string, string>();
for (const file of [INDEX, NODEFS_HANDLER]) {
	try {
		fileContents.set(file, await readFile(file, 'utf8'));
	} catch {
		console.error(`Could not find "${file}".`);
		exit(1);
	}
}

for (const [file, search] of replacements) {
	const occurrences = fileContents.get(file)!.split(search).length - 1;
	if (occurrences !== 1) {
		console.error(
			`Expected exactly one occurrence of the following code in "${file}" but found ${occurrences}:\n${search}`
		);
		exit(1);
	}
}

export const chokidarChangeThrottleReplacement: RollupReplaceOptions = {
	delimiters: ['', ''],
	include: [INDEX, NODEFS_HANDLER],
	preventAssignment: true, // defaults to true in next major version of plugin
	values: Object.fromEntries(replacements.map(([, search, replacement]) => [search, replacement]))
};
