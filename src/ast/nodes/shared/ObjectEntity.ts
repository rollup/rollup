import { CallOptions } from '../../CallOptions';
import { DeoptimizableEntity } from '../../DeoptimizableEntity';
import { HasEffectsContext, InclusionContext } from '../../ExecutionContext';
import { getObjectPathHandler, ObjectProperty } from '../../utils/ObjectPathHandler';
import { ObjectPath, ObjectPathKey, PathTracker } from '../../utils/PathTracker';
import {
	getMemberReturnExpressionWhenCalled,
	hasMemberEffectWhenCalled,
	LiteralValueOrUnknown,
	objectMembers,
	UnknownValue,
	UNKNOWN_EXPRESSION
} from '../../values';
import SpreadElement from '../SpreadElement';
import { ExpressionEntity } from './Expression';
import { ExpressionNode } from './Node';

export class ObjectEntity implements ExpressionEntity {
	deoptimizeAllProperties: () => void;
	deoptimizePath: (path: ObjectPath) => void;
	hasEffectsWhenAccessedAtPath: (path: ObjectPath, context: HasEffectsContext) => boolean;
	hasEffectsWhenAssignedAtPath: (path: ObjectPath, context: HasEffectsContext) => boolean;
	included = false;

	private getMemberExpression: (key: ObjectPathKey) => ExpressionEntity | null;
	private getMemberExpressionAndTrackDeopt: (
		key: ObjectPathKey,
		origin: DeoptimizableEntity
	) => ExpressionEntity | null;

	// TODO Lukas make this a proper class that we can extend?
	constructor(properties: ObjectProperty[]) {
		({
			deoptimizeAllProperties: this.deoptimizeAllProperties,
			deoptimizePath: this.deoptimizePath,
			getMemberExpression: this.getMemberExpression,
			getMemberExpressionAndTrackDeopt: this.getMemberExpressionAndTrackDeopt,
			hasEffectsWhenAccessedAtPath: this.hasEffectsWhenAccessedAtPath,
			hasEffectsWhenAssignedAtPath: this.hasEffectsWhenAssignedAtPath
		} = getObjectPathHandler(properties));
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		if (path.length === 0) {
			return UnknownValue;
		}
		const key = path[0];
		const expressionAtPath = this.getMemberExpressionAndTrackDeopt(
			key,
			origin
		);
		if (expressionAtPath) {
			return expressionAtPath.getLiteralValueAtPath(path.slice(1), recursionTracker, origin);
		}
		if (path.length === 1 && !objectMembers[key as string]) {
			return undefined;
		}
		return UnknownValue;
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		if (path.length === 0) {
			return UNKNOWN_EXPRESSION;
		}
		const key = path[0];
		const expressionAtPath = this.getMemberExpressionAndTrackDeopt(
			key,
			origin
		);
		if (expressionAtPath) {
			return expressionAtPath.getReturnExpressionWhenCalledAtPath(
				path.slice(1),
				recursionTracker,
				origin
			);
		}
		if (path.length === 1) {
			return getMemberReturnExpressionWhenCalled(objectMembers, key);
		}
		return UNKNOWN_EXPRESSION;
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		const key = path[0];
		const expressionAtPath = this.getMemberExpression(key);
		if (expressionAtPath) {
			return expressionAtPath.hasEffectsWhenCalledAtPath(path.slice(1), callOptions, context);
		}
		if (path.length > 1) {
			return true;
		}
		return hasMemberEffectWhenCalled(objectMembers, key, this.included, callOptions, context);
	}

	include() {
		this.included = true;
	}

	includeCallArguments(context: InclusionContext, args: (ExpressionNode | SpreadElement)[]) {
		for (const arg of args) {
			arg.include(context, false);
		}
	}

	mayModifyThisWhenCalledAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	) {
		if (path.length === 0) {
			return false;
		}
		const key = path[0];
		const expressionAtPath = this.getMemberExpressionAndTrackDeopt(
			key,
			origin
		);
		if (expressionAtPath) {
			return expressionAtPath.mayModifyThisWhenCalledAtPath(
				path.slice(1),
				recursionTracker,
				origin
			);
		}
		return false;
	}
}
