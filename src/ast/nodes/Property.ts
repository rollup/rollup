import type MagicString from 'magic-string';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
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
		includedInitPath: ObjectPath,
		init: ExpressionEntity
	): LocalVariable[] {
		const pathInProperty: ObjectPath =
			includedInitPath.at(-1) === UnknownKey
				? includedInitPath
				: // For now, we only consider static path as we do not know how to
					// deoptimize the path in the dynamic case.
					this.computed
					? [...includedInitPath, UnknownKey]
					: this.key instanceof Identifier
						? [...includedInitPath, this.key.name]
						: [...includedInitPath, String((this.key as Literal).value)];
		return (this.value as PatternNode).declare(kind, pathInProperty, init);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		const propertyReadSideEffects = (
			this.scope.context.options.treeshake as NormalizedTreeshakingOptions
		).propertyReadSideEffects;
		return (
			(this.parent.type === 'ObjectPattern' && propertyReadSideEffects === 'always') ||
			this.key.hasEffects(context) ||
			this.value.hasEffects(context)
		);
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
}
