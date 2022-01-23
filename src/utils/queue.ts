interface Task<T> {
	(): T | Promise<T>;
}

interface QueueItem<T> {
	reject: (reason?: unknown) => void;
	resolve: (value: T) => void;
	task: Task<T>;
}

export class Queue<T> {
	private readonly queue: QueueItem<T>[] = [];
	private workerCount = 0;

	constructor(private maxParallel: number) {}

	run(task: Task<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push({ reject, resolve, task });
			this.work();
		});
	}

	private async work(): Promise<void> {
		if (this.workerCount >= this.maxParallel) return;
		this.workerCount++;

		let entry: QueueItem<T> | undefined;
		while ((entry = this.queue.shift())) {
			const { reject, resolve, task } = entry;

			try {
				const result = await task();
				resolve(result);
			} catch (err) {
				reject(err);
			}
		}

		this.workerCount--;
	}
}
