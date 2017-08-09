import path from 'path';
import EventEmitter from 'events';
import rollup from '../rollup/index.js';
import ensureArray from '../utils/ensureArray.js';
import { mapSequence } from '../utils/promise.js';
import { addTask, deleteTask } from './fileWatchers.js';

const DELAY = 100;

class Watcher extends EventEmitter {
	constructor(configs) {
		super();

		this.dirty = true;
		this.running = false;
		this.tasks = ensureArray(configs).map(config => new Task(this, config));

		process.nextTick(() => {
			this.run();
		});
	}

	close() {
		this.tasks.forEach(task => {
			task.close();
		});
	}

	error(error) {
		this.emit('event', {
			code: 'ERROR',
			error
		});
	}

	makeDirty() {
		if (this.dirty) return;
		this.dirty = true;

		if (!this.running) {
			setTimeout(() => {
				this.run();
			}, DELAY);
		}
	}

	run() {
		this.running = true;
		this.dirty = false;

		// TODO
		this.emit('event', {
			code: 'BUILD_START'
		});

		mapSequence(this.tasks, task => {
			return task.run().catch(error => {
				this.emit('event', {
					code: 'ERROR',
					error
				});
			});
		}).then(() => {
			this.running = false;

			this.emit('event', {
				code: 'BUILD_END'
			});

			if (this.dirty) this.run();
		});
	}
}

class Task {
	constructor(watcher, config) {
		this.cache = null;
		this.watcher = watcher;
		this.config = config;

		this.closed = false;
		this.watched = new Set();

		this.dests = new Set(
			(config.dest ? [config.dest] : config.targets.map(t => t.dest)).map(dest => path.resolve(dest))
		);
	}

	close() {
		this.closed = true;
		this.watched.forEach(id => {
			deleteTask(id, this);
		});
	}

	makeDirty() {
		if (!this.dirty) {
			this.dirty = true;
			this.watcher.makeDirty();
		}
	}

	run() {
		this.dirty = false;

		const config = Object.assign(this.config, {
			cache: this.cache
		});

		return rollup(config).then(bundle => {
			if (this.closed) return;

			this.cache = bundle;

			const watched = new Set();

			bundle.modules.forEach(module => {
				if (this.dests.has(module.id)) {
					throw new Error('Cannot import the generated bundle');
				}

				watched.add(module.id);
				addTask(module.id, this);
			});

			this.watched.forEach(id => {
				if (!watched.has(id)) deleteTask(id, this);
			});

			this.watched = watched;

			if (this.config.dest) {
				return bundle.write({
					format: this.config.format,
					dest: this.config.dest
				});
			}

			return Promise.all(
				this.config.targets.map(target => {
					return bundle.write({
						format: target.format,
						dest: target.dest
					});
				})
			);
		});
	}
}

export default function watch(configs) {
	return new Watcher(configs);
}