import { Entity } from '../Entity';
import { ObjectPath } from '../values';

interface TrackedPaths {
	paths: { [key: string]: TrackedPaths };
	tracked: boolean;
	unknownPath: TrackedPaths | null;
}

const getNewTrackedPaths = (): TrackedPaths => ({
	paths: Object.create(null),
	tracked: false,
	unknownPath: null
});

export class EntityPathTracker {
	entityPaths: Map<Entity, TrackedPaths> = new Map<Entity, TrackedPaths>();

	track(entity: Entity, path: ObjectPath): boolean {
		let trackedPaths = this.entityPaths.get(entity);
		if (!trackedPaths) {
			trackedPaths = getNewTrackedPaths();
			this.entityPaths.set(entity, trackedPaths);
		}

		let pathIndex = 0,
			trackedSubPaths;
		while (pathIndex < path.length) {
			const key = path[pathIndex];
			if (typeof key === 'string') {
				trackedSubPaths = trackedPaths.paths[key];
				if (!trackedSubPaths) {
					trackedSubPaths = getNewTrackedPaths();
					trackedPaths.paths[key] = trackedSubPaths;
				}
			} else {
				trackedSubPaths = trackedPaths.unknownPath;
				if (!trackedSubPaths) {
					trackedSubPaths = getNewTrackedPaths();
					trackedPaths.unknownPath = trackedSubPaths;
				}
			}
			trackedPaths = trackedSubPaths;
			pathIndex++;
		}
		const found = trackedPaths.tracked;
		trackedPaths.tracked = true;
		return found;
	}
}
