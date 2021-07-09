export class Queue {
	private queue = new Array<{
		reject: (reason?: any) => void;
		resolve: (value: any) => void;
		task: () => any;
	}>();
	private workerCount = 0;

	constructor(public maxParallel = 1) {}

	run<T>(task: () => T | Promise<T>): Promise<T> {
		return new Promise((resolve, reject) => {
			this.queue.push({ reject, resolve, task });
			this.work();
		});
	}

	private async work() {
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
