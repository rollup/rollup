import { getNewSet, getOrCreate } from '../../utils/getOrCreate';
import type { Entity } from '../Entity';

export const UnknownKey = Symbol('Unknown Key');
export const UnknownNonAccessorKey = Symbol('Unknown Non-Accessor Key');
export const UnknownInteger = Symbol('Unknown Integer');
export const SymbolToStringTag = Symbol('Symbol.toStringTag');

export type ObjectPathKey =
	| string
	| typeof UnknownKey
	| typeof UnknownNonAccessorKey
	| typeof UnknownInteger
	| typeof SymbolToStringTag;

export type ObjectPath = readonly ObjectPathKey[];
export const EMPTY_PATH: ObjectPath = [];
export const UNKNOWN_PATH: ObjectPath = [UnknownKey];
// For deoptimizations, this means we are modifying an unknown property but did
// not lose track of the object or are creating a setter/getter;
// For assignment effects it means we do not check for setter/getter effects
// but only if something is mutated that is included, which is relevant for
// Object.defineProperty
export const UNKNOWN_NON_ACCESSOR_PATH: ObjectPath = [UnknownNonAccessorKey];
export const UNKNOWN_INTEGER_PATH: ObjectPath = [UnknownInteger];

const EntitiesKey = Symbol('Entities');
interface EntityPaths {
	[pathSegment: string]: EntityPaths;
	[EntitiesKey]: Set<Entity>;
	[SymbolToStringTag]?: EntityPaths;
	[UnknownInteger]?: EntityPaths;
	[UnknownKey]?: EntityPaths;
	[UnknownNonAccessorKey]?: EntityPaths;
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
	[SymbolToStringTag]?: DiscriminatedEntityPaths;
	[UnknownInteger]?: DiscriminatedEntityPaths;
	[UnknownKey]?: DiscriminatedEntityPaths;
	[UnknownNonAccessorKey]?: DiscriminatedEntityPaths;
}

export class DiscriminatedPathTracker {
	private entityPaths: DiscriminatedEntityPaths = Object.create(null, {
		[EntitiesKey]: { value: new Map<unknown, Set<Entity>>() }
	});

	trackEntityAtPathAndGetIfTracked(
		path: ObjectPath,
		discriminator: unknown,
		entity: unknown
	): boolean {
		let currentPaths = this.entityPaths;
		for (const pathSegment of path) {
			currentPaths = currentPaths[pathSegment] =
				currentPaths[pathSegment] ||
				Object.create(null, { [EntitiesKey]: { value: new Map<unknown, Set<unknown>>() } });
		}
		const trackedEntities = getOrCreate(
			currentPaths[EntitiesKey],
			discriminator,
			getNewSet<unknown>
		);
		if (trackedEntities.has(entity)) return true;
		trackedEntities.add(entity);
		return false;
	}
}
