import { EventEmitter } from 'events';

type PromiseReturn<T extends (...args: any) => any> = (
	...args: Parameters<T>
) => Promise<ReturnType<T>>;

export class WatchEmitter<
	T extends { [event: string]: (...args: any) => any }
> extends EventEmitter {
	private awaitedHandlers: {
		[K in keyof T]?: PromiseReturn<T[K]>[];
	} = Object.create(null);

	constructor() {
		super();
		// Allows more than 10 bundles to be watched without
		// showing the `MaxListenersExceededWarning` to the user.
		this.setMaxListeners(Infinity);
	}

	// Will be overwritten by Rollup
	async close(): Promise<void> {}

	emitAndAwait<K extends keyof T>(
		event: K,
		...args: Parameters<T[K]>
	): Promise<ReturnType<T[K]>[]> {
		this.emit(event as string, ...(args as any[]));
		return Promise.all(this.getHandlers(event).map(handler => handler(...args)));
	}

	onCurrentAwaited<K extends keyof T>(
		event: K,
		listener: (...args: Parameters<T[K]>) => Promise<ReturnType<T[K]>>
	): this {
		this.getHandlers(event).push(listener);
		return this;
	}

	removeAwaited(): this {
		this.awaitedHandlers = {};
		return this;
	}

	private getHandlers<K extends keyof T>(event: K): PromiseReturn<T[K]>[] {
		return this.awaitedHandlers[event] || (this.awaitedHandlers[event] = []);
	}
}
