import { EMPTY_OBJECT } from '../../utils/blank';
import { getNewSet, getOrCreate } from '../../utils/getOrCreate';
import type { Entity } from '../Entity';
import type { InclusionContext } from '../ExecutionContext';
import type { ExpressionEntity } from '../nodes/shared/Expression';

export const UnknownKey = Symbol('Unknown Key');
export const UnknownNonAccessorKey = Symbol('Unknown Non-Accessor Key');
export const UnknownInteger = Symbol('Unknown Integer');
export const UnknownWellKnown = Symbol('Unknown Well-Known');
export const SymbolToStringTag = Symbol('Symbol.toStringTag');
export const SymbolDispose = Symbol('Symbol.asyncDispose');
export const SymbolAsyncDispose = Symbol('Symbol.dispose');
export const SymbolHasInstance = Symbol('Symbol.hasInstance');

interface SymbolSet<T extends symbol> extends Set<T> {
	has(symbol: symbol): symbol is T;
}

const WELL_KNOWN_SYMBOLS_LIST = [
	SymbolToStringTag,
	SymbolDispose,
	SymbolAsyncDispose,
	SymbolHasInstance
] as const;
export type WellKnownSymbol = (typeof WELL_KNOWN_SYMBOLS_LIST)[number];
export const WELL_KNOWN_SYMBOLS = new Set(WELL_KNOWN_SYMBOLS_LIST) as SymbolSet<WellKnownSymbol>;

type AnyWellKnownSymbol = WellKnownSymbol | typeof UnknownWellKnown;
export const isAnyWellKnown = (v: any): v is AnyWellKnownSymbol =>
	WELL_KNOWN_SYMBOLS.has(v) || v === UnknownWellKnown;

const TREE_SHAKEABLE_SYMBOLS_LIST = [SymbolHasInstance, SymbolDispose, SymbolAsyncDispose] as const;
type TreeShakeableSymbol = (typeof TREE_SHAKEABLE_SYMBOLS_LIST)[number];
export const TREE_SHAKEABLE_SYMBOLS = new Set(
	TREE_SHAKEABLE_SYMBOLS_LIST
) as SymbolSet<TreeShakeableSymbol>;

export type ConcreteKey = string | WellKnownSymbol;
export type ObjectPathKey =
	| ConcreteKey
	| typeof UnknownKey
	| typeof UnknownWellKnown
	| typeof UnknownNonAccessorKey
	| typeof UnknownInteger;

export const isConcreteKey = (v: ObjectPathKey): v is ConcreteKey =>
	typeof v === 'string' || WELL_KNOWN_SYMBOLS.has(v);

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
export const INSTANCEOF_PATH: ObjectPath = [SymbolHasInstance];

const EntitiesKey = Symbol('Entities');
interface EntityPaths {
	[pathSegment: string]: EntityPaths;
	[EntitiesKey]: Set<Entity>;
	[SymbolToStringTag]?: EntityPaths;
	[SymbolHasInstance]?: EntityPaths;
	[SymbolDispose]?: EntityPaths;
	[SymbolAsyncDispose]?: EntityPaths;
	[UnknownInteger]?: EntityPaths;
	[UnknownKey]?: EntityPaths;
	[UnknownWellKnown]?: EntityPaths;
	[UnknownNonAccessorKey]?: EntityPaths;
}

export class EntityPathTracker {
	private readonly entityPaths: EntityPaths = Object.create(null, {
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
			currentPaths = currentPaths[pathSegment] ||= Object.create(null, {
				[EntitiesKey]: { value: new Set<Entity>() }
			});
		}
		return currentPaths[EntitiesKey];
	}
}

export const SHARED_RECURSION_TRACKER = new EntityPathTracker();

interface DiscriminatedEntityPaths {
	[pathSegment: string]: DiscriminatedEntityPaths;
	[EntitiesKey]: Map<unknown, Set<Entity>>;
	[SymbolToStringTag]?: DiscriminatedEntityPaths;
	[SymbolHasInstance]?: DiscriminatedEntityPaths;
	[SymbolDispose]?: DiscriminatedEntityPaths;
	[SymbolAsyncDispose]?: DiscriminatedEntityPaths;
	[UnknownInteger]?: DiscriminatedEntityPaths;
	[UnknownKey]?: DiscriminatedEntityPaths;
	[UnknownWellKnown]?: DiscriminatedEntityPaths;
	[UnknownNonAccessorKey]?: DiscriminatedEntityPaths;
}

export class DiscriminatedPathTracker {
	private readonly entityPaths: DiscriminatedEntityPaths = Object.create(null, {
		[EntitiesKey]: { value: new Map<unknown, Set<Entity>>() }
	});

	trackEntityAtPathAndGetIfTracked(
		path: ObjectPath,
		discriminator: unknown,
		entity: unknown
	): boolean {
		let currentPaths = this.entityPaths;
		for (const pathSegment of path) {
			currentPaths = currentPaths[pathSegment] ||= Object.create(null, {
				[EntitiesKey]: { value: new Map<unknown, Set<unknown>>() }
			});
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

export interface IncludedPathTracker {
	includePathAndGetIfIncluded(path: ObjectPath): boolean;
}

type IncludedPaths = { [K in ConcreteKey]?: IncludedPaths } & { [UnknownKey]?: IncludedPaths };

const UNKNOWN_INCLUDED_PATH: IncludedPaths = Object.freeze({ [UnknownKey]: EMPTY_OBJECT });

export class IncludedFullPathTracker implements IncludedPathTracker {
	private includedPaths: IncludedPaths | null = null;

	includePathAndGetIfIncluded(path: ObjectPath): boolean {
		let included = true;
		let parent = this as unknown as IncludedPaths;
		let parentSegment: ConcreteKey = 'includedPaths';
		let currentPaths: IncludedPaths = (this.includedPaths ||=
			((included = false), Object.create(null)));
		for (const pathSegment of path) {
			// This means from here, all paths are included
			if (currentPaths[UnknownKey]) {
				return true;
			}
			// Including UnknownKey automatically includes all nested paths.
			// From above, we know that UnknownKey is not included yet.
			if (!isConcreteKey(pathSegment)) {
				// Hopefully, this saves some memory over just setting
				// currentPaths[UnknownKey] = EMPTY_OBJECT
				parent[parentSegment] = UNKNOWN_INCLUDED_PATH;
				return false;
			}
			parent = currentPaths;
			parentSegment = pathSegment;
			currentPaths = currentPaths[pathSegment] ||= ((included = false), Object.create(null));
		}
		return included;
	}
}

// "true" means not sub-paths are included, "UnknownKey" means at least some sub-paths are included
type IncludedTopLevelPaths = Partial<Record<ConcreteKey, true | typeof UnknownKey>> & {
	[UnknownKey]?: true;
};

const UNKNOWN_INCLUDED_TOP_LEVEL_PATH: Readonly<IncludedTopLevelPaths> = Object.freeze({
	[UnknownKey]: true as const
});

export class IncludedTopLevelPathTracker implements IncludedPathTracker {
	private includedPaths: IncludedTopLevelPaths | null = null;

	includePathAndGetIfIncluded(path: ObjectPath): boolean {
		let included = true;
		const includedPaths: IncludedTopLevelPaths = (this.includedPaths ||=
			((included = false), Object.create(null)));
		if (includedPaths[UnknownKey]) {
			return true;
		}
		const [firstPathSegment, secondPathSegment] = path;
		if (!firstPathSegment) {
			return included;
		}
		if (!isConcreteKey(firstPathSegment)) {
			this.includedPaths = UNKNOWN_INCLUDED_TOP_LEVEL_PATH;
			return false;
		}
		if (secondPathSegment) {
			if (includedPaths[firstPathSegment] === UnknownKey) {
				return true;
			}
			includedPaths[firstPathSegment] = UnknownKey;
			return false;
		}
		if (includedPaths[firstPathSegment]) {
			return true;
		}
		includedPaths[firstPathSegment] = true;
		return false;
	}

	includeAllPaths(entity: ExpressionEntity, context: InclusionContext, basePath: ObjectPath) {
		const { includedPaths } = this;
		if (includedPaths) {
			if (includedPaths[UnknownKey]) {
				entity.includePath([...basePath, UnknownKey], context);
			} else {
				const inclusionEntries = Object.entries(includedPaths);
				if (inclusionEntries.length === 0) {
					entity.includePath(basePath, context);
				} else {
					for (const [key, value] of inclusionEntries) {
						entity.includePath(
							value === UnknownKey ? [...basePath, key, UnknownKey] : [...basePath, key],
							context
						);
					}
				}
			}
		}
	}
}
