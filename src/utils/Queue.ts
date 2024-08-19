type Task<T> = () => Promise<T>;

interface QueueItem {
	reject: (reason?: unknown) => void;
	resolve: (value: any) => void;
	task: Task<unknown>;
}

export default class Queue {
	private readonly queue: QueueItem[] = [];
	private workerCount = 0;

	constructor(private maxParallel: number) {}

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
				const result = await task();
				resolve(result);
			} catch (error) {
				reject(error);
			}
		}

		this.workerCount--;
	}
}
