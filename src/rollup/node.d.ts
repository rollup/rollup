import type {
	ChangeEvent,
	InputOption,
	InputOptions,
	OutputOptions,
	RollupBuild,
	RollupError,
	TypedEventEmitter,
	WatcherOptions
} from './browser.d';

export interface RollupWatchOptions extends InputOptions {
	output?: OutputOptions | OutputOptions[];
	watch?: WatcherOptions | false;
}

export type RollupWatcherEvent =
	| { code: 'START' }
	| { code: 'BUNDLE_START'; input?: InputOption; output: readonly string[] }
	| {
			code: 'BUNDLE_END';
			duration: number;
			input?: InputOption;
			output: readonly string[];
			result: RollupBuild;
	  }
	| { code: 'END' }
	| { code: 'ERROR'; error: RollupError };

export interface RollupWatcher
	extends TypedEventEmitter<{
		change: (id: string, change: { event: ChangeEvent }) => void;
		close: () => void;
		event: (event: RollupWatcherEvent) => void;
		restart: () => void;
	}> {
	close(): void;
}

export function watch(config: RollupWatchOptions | RollupWatchOptions[]): RollupWatcher;

export * from './browser.d';
