import type MagicString from 'magic-string';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import { UnknownKey } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type Identifier from './Identifier';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import { type ExpressionEntity, UNKNOWN_EXPRESSION } from './shared/Expression';
import MethodBase from './shared/MethodBase';
import type { PatternNode } from './shared/Pattern';
import type { VariableKind } from './shared/VariableKinds';

export default class Property extends MethodBase implements PatternNode {
	declare key: Identifier;
	declare kind: 'init' | 'get' | 'set';
	declare type: NodeType.tProperty;
	private declarationInit: ExpressionEntity | null = null;

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

	declare(kind: VariableKind, init: ExpressionEntity): LocalVariable[] {
		this.declarationInit = init;
		return (this.value as PatternNode).declare(kind, UNKNOWN_EXPRESSION);
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

	markDeclarationReached(): void {
		(this.value as PatternNode).markDeclarationReached();
	}

	render(code: MagicString, options: RenderOptions): void {
		if (!this.shorthand) {
			this.key.render(code, options);
		}
		this.value.render(code, options, { isShorthandProperty: this.shorthand });
	}

	protected applyDeoptimizations(): void {
		this.deoptimized = true;
		if (this.declarationInit !== null) {
			this.declarationInit.deoptimizePath([UnknownKey, UnknownKey]);
			this.scope.context.requestTreeshakingPass();
		}
	}
}
