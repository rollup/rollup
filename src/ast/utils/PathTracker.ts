import { getOrCreate } from '../../utils/getOrCreate';
import type { Entity } from '../Entity';

export const UnknownKey = Symbol('Unknown Key');
export const UnknownInteger = Symbol('Unknown Integer');
export type ObjectPathKey = string | typeof UnknownKey | typeof UnknownInteger;

export type ObjectPath = ObjectPathKey[];
export const EMPTY_PATH: ObjectPath = [];
export const UNKNOWN_PATH: ObjectPath = [UnknownKey];
export const UNKNOWN_INTEGER_PATH: ObjectPath = [UnknownInteger];

const EntitiesKey = Symbol('Entities');
interface EntityPaths {
	[pathSegment: string]: EntityPaths;
	[EntitiesKey]: Set<Entity>;
	[UnknownInteger]?: EntityPaths;
	[UnknownKey]?: EntityPaths;
}

export class PathTracker {
	private entityPaths: EntityPaths = Object.create(null, {
		[EntitiesKey]: { value: new Set<Entity>() }
	});

	trackEntityAtPathAndGetIfTracked(path: ObjectPath, entity: Entity): boolean {
		const trackedEntities = this.getEntities(path);
		if (trackedEntities.has(entity)) return true;
		trackedEntities.add(entity);
		return false;
	}

	withTrackedEntityAtPath<T>(
		path: ObjectPath,
		entity: Entity,
		onUntracked: () => T,
		returnIfTracked: T
	): T {
		const trackedEntities = this.getEntities(path);
		if (trackedEntities.has(entity)) return returnIfTracked;
		trackedEntities.add(entity);
		const result = onUntracked();
		trackedEntities.delete(entity);
		return result;
	}

	private getEntities(path: ObjectPath): Set<Entity> {
		let currentPaths = this.entityPaths;
		for (const pathSegment of path) {
			currentPaths = currentPaths[pathSegment] =
				currentPaths[pathSegment] ||
				Object.create(null, { [EntitiesKey]: { value: new Set<Entity>() } });
		}
		return currentPaths[EntitiesKey];
	}
}

export const SHARED_RECURSION_TRACKER = new PathTracker();

interface DiscriminatedEntityPaths {
	[pathSegment: string]: DiscriminatedEntityPaths;
	[EntitiesKey]: Map<unknown, Set<Entity>>;
	[UnknownInteger]?: DiscriminatedEntityPaths;
	[UnknownKey]?: DiscriminatedEntityPaths;
}

export class DiscriminatedPathTracker {
	private entityPaths: DiscriminatedEntityPaths = Object.create(null, {
		[EntitiesKey]: { value: new Map<unknown, Set<Entity>>() }
	});

	trackEntityAtPathAndGetIfTracked(
		path: ObjectPath,
		discriminator: unknown,
		entity: Entity
	): boolean {
		let currentPaths = this.entityPaths;
		for (const pathSegment of path) {
			currentPaths = currentPaths[pathSegment] =
				currentPaths[pathSegment] ||
				Object.create(null, { [EntitiesKey]: { value: new Map<unknown, Set<Entity>>() } });
		}
		const trackedEntities = getOrCreate(currentPaths[EntitiesKey], discriminator, () => new Set());
		if (trackedEntities.has(entity)) return true;
		trackedEntities.add(entity);
		return false;
	}
}
