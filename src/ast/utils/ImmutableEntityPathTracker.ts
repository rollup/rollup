import { Entity } from '../Entity';
import { ObjectPath } from '../values';

interface TrackedPaths {
	tracked: boolean;
	unknownPath: TrackedPaths | null;
	paths: { [key: string]: TrackedPaths };
}

const getNewTrackedPaths = (): TrackedPaths => ({
	tracked: false,
	unknownPath: null,
	paths: Object.create(null)
});

export class ImmutableEntityPathTracker {
	entityPaths: Map<Entity, TrackedPaths>;

	constructor(existingEntityPaths: Map<Entity, TrackedPaths> | null = null) {
		this.entityPaths = new Map(existingEntityPaths);
	}

	isTracked(entity: Entity, path: ObjectPath): boolean {
		let trackedPaths = this.entityPaths.get(entity);
		if (!trackedPaths) return false;
		let pathIndex = 0;
		while (pathIndex < path.length) {
			const key = path[pathIndex];
			trackedPaths = typeof key === 'string' ? trackedPaths.paths[key] : trackedPaths.unknownPath;
			if (!trackedPaths) return false;
			pathIndex++;
		}
		return trackedPaths.tracked;
	}

	track(entity: Entity, path: ObjectPath): ImmutableEntityPathTracker {
		const newTracker = new ImmutableEntityPathTracker(this.entityPaths);
		let trackedPaths = newTracker.entityPaths.get(entity);
		trackedPaths = trackedPaths ? { ...trackedPaths } : getNewTrackedPaths();
		newTracker.entityPaths.set(entity, trackedPaths);

		let pathIndex = 0,
			trackedSubPaths;
		while (pathIndex < path.length) {
			const key = path[pathIndex];
			if (typeof key === 'string') {
				trackedSubPaths = trackedPaths.paths[key];
				trackedSubPaths = trackedSubPaths ? { ...trackedSubPaths } : getNewTrackedPaths();
				trackedPaths.paths = { ...trackedPaths.paths, [key]: trackedSubPaths };
			} else {
				trackedSubPaths = trackedPaths.unknownPath;
				trackedSubPaths = trackedSubPaths ? { ...trackedSubPaths } : getNewTrackedPaths();
				trackedPaths.unknownPath = trackedSubPaths;
			}
			trackedPaths = trackedSubPaths;
			pathIndex++;
		}
		trackedPaths.tracked = true;
		return newTracker;
	}
}

export const EMPTY_IMMUTABLE_TRACKER = new ImmutableEntityPathTracker();
