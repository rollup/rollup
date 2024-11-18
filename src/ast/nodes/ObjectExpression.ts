import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import type { NodeRenderOptions, RenderOptions } from '../../utils/renderHelpers';
import { getCommaSeparatedNodesWithBoundaries } from '../../utils/renderHelpers';
import { treeshakeNode } from '../../utils/treeshakeNode';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction, NodeInteractionCalled } from '../NodeInteractions';
import {
	EMPTY_PATH,
	type EntityPathTracker,
	type ObjectPath,
	SHARED_RECURSION_TRACKER,
	UNKNOWN_PATH,
	UnknownKey
} from '../utils/PathTracker';
import Identifier from './Identifier';
import Literal from './Literal';
import * as NodeType from './NodeType';
import type Property from './Property';
import type { ExpressionEntity, LiteralValueOrUnknown } from './shared/Expression';
import type { IncludeChildren } from './shared/Node';
import { NodeBase } from './shared/Node';
import { ObjectEntity, type ObjectProperty } from './shared/ObjectEntity';
import { OBJECT_PROTOTYPE } from './shared/ObjectPrototype';
import SpreadElement from './SpreadElement';

export default class ObjectExpression extends NodeBase implements DeoptimizableEntity {
	declare properties: readonly (Property | SpreadElement)[];
	declare type: NodeType.tObjectExpression;
	private objectEntity: ObjectEntity | null = null;
	private protoProp: Property | null = null;

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	): void {
		this.getObjectEntity().deoptimizeArgumentsOnInteractionAtPath(
			interaction,
			path,
			recursionTracker
		);
	}

	deoptimizeCache(): void {
		this.getObjectEntity().deoptimizeAllProperties();
	}

	deoptimizePath(path: ObjectPath): void {
		this.getObjectEntity().deoptimizePath(path);
	}

	getLiteralValueAtPath(
		path: ObjectPath,
		recursionTracker: EntityPathTracker,
		origin: DeoptimizableEntity
	): LiteralValueOrUnknown {
		return this.getObjectEntity().getLiteralValueAtPath(path, recursionTracker, origin);
	}

	getReturnExpressionWhenCalledAtPath(
		path: ObjectPath,
		interaction: NodeInteractionCalled,
		recursionTracker: EntityPathTracker,
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

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	) {
		this.included = true;
		this.getObjectEntity().includePath(path, context, includeChildrenRecursively);
		this.protoProp?.includePath(UNKNOWN_PATH, context, includeChildrenRecursively);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		{ renderedSurroundingElement }: NodeRenderOptions = BLANK
	): void {
		if (
			renderedSurroundingElement === NodeType.ExpressionStatement ||
			renderedSurroundingElement === NodeType.ArrowFunctionExpression
		) {
			code.appendRight(this.start, '(');
			code.prependLeft(this.end, ')');
		}
		if (this.properties.length > 0) {
			const separatedNodes = getCommaSeparatedNodesWithBoundaries(
				this.properties,
				code,
				this.start + 1,
				this.end - 1
			);
			let lastSeparatorPos: number | null = null;
			for (const { node, separator, start, end } of separatedNodes) {
				if (!node.included) {
					treeshakeNode(node, code, start, end);
					continue;
				}
				lastSeparatorPos = separator;
				node.render(code, options);
			}
			if (lastSeparatorPos) {
				code.remove(lastSeparatorPos, this.end - 1);
			}
		}
	}

	protected applyDeoptimizations() {}

	private getObjectEntity(): ObjectEntity {
		if (this.objectEntity !== null) {
			return this.objectEntity;
		}
		let prototype: ExpressionEntity | null = OBJECT_PROTOTYPE;
		const properties: ObjectProperty[] = [];
		for (const property of this.properties) {
			if (property instanceof SpreadElement) {
				properties.push({ key: UnknownKey, kind: 'init', property });
				continue;
			}
			let key: string;
			if (property.computed) {
				const keyValue = property.key.getLiteralValueAtPath(
					EMPTY_PATH,
					SHARED_RECURSION_TRACKER,
					this
				);
				if (typeof keyValue === 'symbol') {
					properties.push({ key: UnknownKey, kind: property.kind, property });
					continue;
				} else {
					key = String(keyValue);
				}
			} else {
				key =
					property.key instanceof Identifier
						? property.key.name
						: String((property.key as Literal).value);
				if (key === '__proto__' && property.kind === 'init') {
					this.protoProp = property;
					prototype =
						property.value instanceof Literal && property.value.value === null
							? null
							: property.value;
					continue;
				}
			}
			properties.push({ key, kind: property.kind, property });
		}
		return (this.objectEntity = new ObjectEntity(properties, prototype));
	}
}
