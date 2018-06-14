import Immutable from 'immutable';
import { Entity } from '../Entity';
import { ObjectPath } from '../values';

interface RESULT_KEY {}
const RESULT_KEY: RESULT_KEY = {};
type MapType = Immutable.Map<Entity, boolean>;

export class ImmutableEntityPathTracker {
	entityPaths: MapType;

	constructor(existingEntityPaths: MapType = Immutable.Map()) {
		this.entityPaths = existingEntityPaths;
	}

	isTracked(entity: Entity, path: ObjectPath): boolean {
		return this.entityPaths.getIn([entity, ...path, RESULT_KEY]);
	}

	track(entity: Entity, path: ObjectPath): ImmutableEntityPathTracker {
		return new ImmutableEntityPathTracker(
			this.entityPaths.setIn([entity, ...path, RESULT_KEY], true)
		);
	}
}

export const EMPTY_IMMUTABLE_TRACKER = new ImmutableEntityPathTracker();
