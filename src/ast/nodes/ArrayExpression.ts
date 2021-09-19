import { CallOptions } from '../CallOptions';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { HasEffectsContext } from '../ExecutionContext';
import { NodeEvent } from '../NodeEvents';
import { ObjectPath, PathTracker, UnknownInteger } from '../utils/PathTracker';
import { UNDEFINED_EXPRESSION, UNKNOWN_LITERAL_NUMBER } from '../values';
import * as NodeType from './NodeType';
import SpreadElement from './SpreadElement';
import { ARRAY_PROTOTYPE } from './shared/ArrayPrototype';
import { ExpressionEntity, LiteralValueOrUnknown } from './shared/Expression';
import { ExpressionNode, NodeBase } from './shared/Node';
import { ObjectEntity, ObjectProperty } from './shared/ObjectEntity';

export default class ArrayExpression extends NodeBase {
	declare elements: (ExpressionNode | SpreadElement | null)[];
	declare type: NodeType.tArrayExpression;
	private objectEntity: ObjectEntity | null = null;

	deoptimizePath(path: ObjectPath): void {
		this.getObjectEntity().deoptimizePath(path);
	}

	deoptimizeThisOnEventAtPath(
		event: NodeEvent,
		path: ObjectPath,
		thisParameter: ExpressionEntity,
		recursionTracker: PathTracker
	): void {
		this.getObjectEntity().deoptimizeThisOnEventAtPath(
			event,
			path,
			thisParameter,
			recursionTracker
		);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getObjectEntity().getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): ExpressionEntity {
		return this.getObjectEntity().getReturnExpressionWhenCalledAtPath(
			path,
			callOptions,
			recursionTracker,
			origin
		);
	}

	hasEffectsWhenAccessedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return this.getObjectEntity().hasEffectsWhenAccessedAtPath(path, context);
	}

	hasEffectsWhenAssignedAtPath(path: ObjectPath, context: HasEffectsContext): boolean {
		return this.getObjectEntity().hasEffectsWhenAssignedAtPath(path, context);
	}

	hasEffectsWhenCalledAtPath(
		path: ObjectPath,
		callOptions: CallOptions,
		context: HasEffectsContext
	): boolean {
		return this.getObjectEntity().hasEffectsWhenCalledAtPath(path, callOptions, context);
	}

	private getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		const properties: ObjectProperty[] = [
			{ key: 'length', kind: 'init', property: UNKNOWN_LITERAL_NUMBER }
		];
		let hasSpread = false;
		for (let index = 0; index < this.elements.length; index++) {
			const element = this.elements[index];
			if (element instanceof SpreadElement || hasSpread) {
				if (element) {
					hasSpread = true;
					properties.unshift({ key: UnknownInteger, kind: 'init', property: element });
				}
			} else if (!element) {
				properties.push({ key: String(index), kind: 'init', property: UNDEFINED_EXPRESSION });
			} else {
				properties.push({ key: String(index), kind: 'init', property: element });
			}
		}
		return (this.objectEntity = new ObjectEntity(properties, ARRAY_PROTOTYPE));
	}
}
