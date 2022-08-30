import { AwaitedEventListener, AwaitingEventEmitter } from '../rollup/types';

export class WatchEmitter<T extends { [event: string]: (...args: any) => any }>
	implements AwaitingEventEmitter<T>
{
	private currentHandlers: {
		[K in keyof T]?: AwaitedEventListener<T, K>[];
	} = Object.create(null);
	private persistentHandlers: {
		[K in keyof T]?: AwaitedEventListener<T, K>[];
	} = Object.create(null);

	// Will be overwritten by Rollup
	async close(): Promise<void> {}

	emit<K extends keyof T>(event: K, ...args: Parameters<T[K]>): Promise<unknown> {
		return Promise.all(
			this.getCurrentHandlers(event)
				.concat(this.getPersistentHandlers(event))
				.map(handler => handler(...args))
		);
	}

	off<K extends keyof T>(event: K, listener: AwaitedEventListener<T, K>): this {
		const listeners = this.persistentHandlers[event];
		if (listeners) {
			// A hack stolen from "mitt": ">>> 0" does not change numbers >= 0, but -1
			// (which would remove the last array element if used unchanged) is turned
			// into max_int, which is outside the array and does not change anything.
			listeners.splice(listeners.indexOf(listener) >>> 0, 1);
		}
		return this;
	}

	on<K extends keyof T>(event: K, listener: AwaitedEventListener<T, K>): this {
		this.getPersistentHandlers(event).push(listener);
		return this;
	}

	onCurrentRun<K extends keyof T>(event: K, listener: AwaitedEventListener<T, K>): this {
		this.getCurrentHandlers(event).push(listener);
		return this;
	}

	once<K extends keyof T>(event: K, listener: AwaitedEventListener<T, K>): this {
		const selfRemovingListener: AwaitedEventListener<T, K> = (...args) => {
			this.off(event, selfRemovingListener);
			return listener(...args);
		};
		this.on(event, selfRemovingListener);
		return this;
	}

	removeAllListeners(): this {
		this.removeListenersForCurrentRun();
		this.persistentHandlers = Object.create(null);
		return this;
	}

	removeListenersForCurrentRun(): this {
		this.currentHandlers = Object.create(null);
		return this;
	}

	private getCurrentHandlers<K extends keyof T>(event: K): AwaitedEventListener<T, K>[] {
		return this.currentHandlers[event] || (this.currentHandlers[event] = []);
	}

	private getPersistentHandlers<K extends keyof T>(event: K): AwaitedEventListener<T, K>[] {
		return this.persistentHandlers[event] || (this.persistentHandlers[event] = []);
	}
}
