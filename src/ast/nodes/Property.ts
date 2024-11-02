import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { createHasEffectsContext } from '../ExecutionContext';
import type { ObjectPath } from '../utils/PathTracker';
import { EMPTY_PATH, UnknownKey } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import Identifier from './Identifier';
import type Literal from './Literal';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import { type ExpressionEntity } from './shared/Expression';
import MethodBase from './shared/MethodBase';
import type { ExpressionNode, IncludeChildren } from './shared/Node';
import type { PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class Property extends MethodBase implements PatternNode {
	declare key: ExpressionNode;
	declare kind: 'init' | 'get' | 'set';
	declare type: NodeType.tProperty;

	//declare method: boolean;
	get method(): boolean {
		return isFlagSet(this.flags, Flag.method);
	}
	set method(value: boolean) {
		this.flags = setFlag(this.flags, Flag.method, value);
	}

	//declare shorthand: boolean;
	get shorthand(): boolean {
		return isFlagSet(this.flags, Flag.shorthand);
	}
	set shorthand(value: boolean) {
		this.flags = setFlag(this.flags, Flag.shorthand, value);
	}

	declare(
		kind: VariableKind,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): LocalVariable[] {
		return (this.value as PatternNode).declare(
			kind,
			this.getPathInProperty(destructuredInitPath),
			init
		);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		return this.key.hasEffects(context) || this.value.hasEffects(context);
	}

	hasEffectsWhenDestructuring(
		context: HasEffectsContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		return (this.value as PatternNode).hasEffectsWhenDestructuring?.(
			context,
			this.getPathInProperty(destructuredInitPath),
			init
		);
	}

	includeDestructuredIfNecessary(
		context: InclusionContext,
		destructuredInitPath: ObjectPath,
		init: ExpressionEntity
	): boolean {
		let included =
			(this.value as PatternNode).includeDestructuredIfNecessary(
				context,
				this.getPathInProperty(destructuredInitPath),
				init
			) || this.included;
		included ||= this.key.hasEffects(createHasEffectsContext());
		if (included) {
			this.key.includePath(EMPTY_PATH, context, false);
		}
		return (this.included = included);
	}

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	) {
		this.included = true;
		this.key.includePath(EMPTY_PATH, context, includeChildrenRecursively);
		this.value.includePath(path, context, includeChildrenRecursively);
	}

	markDeclarationReached(): void {
		(this.value as PatternNode).markDeclarationReached();
	}

	render(code: MagicString, options: RenderOptions): void {
		if (!this.shorthand) {
			this.key.render(code, options);
		}
		this.value.render(code, options, { isShorthandProperty: this.shorthand });
	}

	protected applyDeoptimizations(): void {}

	private getPathInProperty(destructuredInitPath: ObjectPath): ObjectPath {
		return destructuredInitPath.at(-1) === UnknownKey
			? destructuredInitPath
			: // For now, we only consider static paths as we do not know how to
				// deoptimize the path in the dynamic case.
				this.computed
				? [...destructuredInitPath, UnknownKey]
				: this.key instanceof Identifier
					? [...destructuredInitPath, this.key.name]
					: [...destructuredInitPath, String((this.key as Literal).value)];
	}
}
