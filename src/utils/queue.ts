interface QueueItem {
	reject: (reason?: any) => void;
	resolve: (value: any) => void;
	task: () => any;
}

export class Queue {
	private readonly queue: QueueItem[] = [];
	private workerCount = 0;

	constructor(private maxParallel = 1) {}

	run<T>(task: () => T | Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push({ reject, resolve, task });
			this.work();
		});
	}

	private async work(): Promise<void> {
		if (this.workerCount >= this.maxParallel) return;
		this.workerCount++;

		let entry;
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
