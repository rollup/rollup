import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import {
	type ObjectPath,
	type PathTracker,
	UNKNOWN_PATH,
	UnknownInteger
} from '../utils/PathTracker';
import { UNDEFINED_EXPRESSION, UNKNOWN_LITERAL_NUMBER } from '../values';
import type * as NodeType from './NodeType';
import SpreadElement from './SpreadElement';
import { ARRAY_PROTOTYPE } from './shared/ArrayPrototype';
import type { ExpressionEntity, LiteralValueOrUnknown } from './shared/Expression';
import { type ExpressionNode, NodeBase } from './shared/Node';
import { ObjectEntity, type ObjectProperty } from './shared/ObjectEntity';

export default class ArrayExpression extends NodeBase {
	declare elements: readonly (ExpressionNode | SpreadElement | null)[];
	declare type: NodeType.tArrayExpression;
	private objectEntity: ObjectEntity | null = null;

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: PathTracker
	): void {
		this.getObjectEntity().deoptimizeArgumentsOnInteractionAtPath(
			interaction,
			path,
			recursionTracker
		);
	}

	deoptimizePath(path: ObjectPath): void {
		this.getObjectEntity().deoptimizePath(path);
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
		interaction: NodeInteractionCalled,
		recursionTracker: PathTracker,
		origin: DeoptimizableEntity
	): [expression: ExpressionEntity, isPure: boolean] {
		return this.getObjectEntity().getReturnExpressionWhenCalledAtPath(
			path,
			interaction,
			recursionTracker,
			origin
		);
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		return this.getObjectEntity().hasEffectsOnInteractionAtPath(path, interaction, context);
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		let hasSpread = false;
		for (let index = 0; index < this.elements.length; index++) {
			const element = this.elements[index];
			if (element && (hasSpread || element instanceof SpreadElement)) {
				hasSpread = true;
				element.deoptimizePath(UNKNOWN_PATH);
			}
		}
		this.scope.context.requestTreeshakingPass();
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
			} else if (element) {
				properties.push({ key: String(index), kind: 'init', property: element });
			} else {
				properties.push({ key: String(index), kind: 'init', property: UNDEFINED_EXPRESSION });
			}
		}
		return (this.objectEntity = new ObjectEntity(properties, ARRAY_PROTOTYPE));
	}
}
