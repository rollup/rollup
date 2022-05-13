import type { CallOptions } from '../CallOptions';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext } from '../ExecutionContext';
import { InclusionContext } from '../ExecutionContext';
import type { NodeEvent } from '../NodeEvents';
import { type ObjectPath, type PathTracker, UNKNOWN_PATH, UnknownInteger } from '../utils/PathTracker';
import { UNDEFINED_EXPRESSION, UNKNOWN_LITERAL_NUMBER } from '../values';
import type * as NodeType from './NodeType';
import { ARRAY_PROTOTYPE } from './shared/ArrayPrototype';
import type { ExpressionEntity, LiteralValueOrUnknown } from './shared/Expression';
import { type ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';
import { ObjectEntity, type ObjectProperty } from './shared/ObjectEntity';
import SpreadElement from './SpreadElement';

export default class ArrayExpression extends NodeBase {
	declare elements: readonly (ExpressionNode | SpreadElement | null)[];
	declare type: NodeType.tArrayExpression;
	protected deoptimized = false;
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

	hasEffects(context: HasEffectsContext): boolean | undefined {
		if (!this.deoptimized) this.applyDeoptimizations();
		return super.hasEffects(context);
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

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.deoptimized) this.applyDeoptimizations();
		super.include(context, includeChildrenRecursively);
	}

	includeArgumentsWhenCalledAtPath(
		path: ObjectPath,
		context: InclusionContext,
		args: readonly (ExpressionEntity | SpreadElement)[]
	) {
		this.getObjectEntity().includeArgumentsWhenCalledAtPath(path, context, args);
	}

	protected applyDeoptimizations(): void {
		let hasSpread = false;
		for (let index = 0; index < this.elements.length; index++) {
			const element = this.elements[index];
			if (hasSpread || element instanceof SpreadElement) {
				if (element) {
					hasSpread = true;
					element.deoptimizePath(UNKNOWN_PATH);
				}
			}
		}
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
			if (hasSpread || element instanceof SpreadElement) {
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
