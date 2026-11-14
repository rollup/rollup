import type { RollupFsModule } from '../rollup/types';

type Task<T> = () => Promise<T>;

interface QueueItem {
	reject: (reason?: unknown) => void;
	resolve: (value: any) => void;
	task: Task<unknown>;
}

class FileOperationQueue {
	private readonly queue: QueueItem[] = [];
	private workerCount = 0;

	constructor(private readonly maxParallel: number) {}

	run<T>(task: Task<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push({ reject, resolve, task });
			this.work();
		});
	}

	private async work(): Promise<void> {
		if (this.workerCount >= this.maxParallel) return;
		this.workerCount++;

		let entry: QueueItem | undefined;
		while ((entry = this.queue.shift())) {
			const { reject, resolve, task } = entry;

			try {
				resolve(await task());
			} catch (error) {
				reject(error);
			}
		}

		this.workerCount--;
	}
}

export function createLimitedFs(fs: RollupFsModule, maxParallelFileOps: number): RollupFsModule {
	const queue = new FileOperationQueue(maxParallelFileOps);
	const limit = <M extends keyof RollupFsModule>(method: M): RollupFsModule[M] =>
		((...parameters: unknown[]) =>
			queue.run(() => Reflect.apply(fs[method], fs, parameters))) as RollupFsModule[M];

	return {
		appendFile: limit('appendFile'),
		copyFile: limit('copyFile'),
		lstat: limit('lstat'),
		mkdir: limit('mkdir'),
		mkdtemp: limit('mkdtemp'),
		readdir: limit('readdir'),
		readFile: limit('readFile'),
		realpath: limit('realpath'),
		rename: limit('rename'),
		rmdir: limit('rmdir'),
		stat: limit('stat'),
		unlink: limit('unlink'),
		writeFile: limit('writeFile')
	};
}
