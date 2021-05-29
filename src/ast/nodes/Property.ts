import MagicString from 'magic-string';
import { NormalizedTreeshakingOptions } from '../../rollup/types';
import { RenderOptions } from '../../utils/renderHelpers';
import { HasEffectsContext } from '../ExecutionContext';
import { UnknownKey } from '../utils/PathTracker';
import LocalVariable from '../variables/LocalVariable';
import * as NodeType from './NodeType';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './shared/Expression';
import MethodBase from './shared/MethodBase';
import { ExpressionNode } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class Property extends MethodBase implements PatternNode {
	key!: ExpressionNode;
	kind!: 'init' | 'get' | 'set';
	method!: boolean;
	shorthand!: boolean;
	type!: NodeType.tProperty;
	protected deoptimized = false;
	private declarationInit: ExpressionEntity | null = null;

	declare(kind: string, init: ExpressionEntity): LocalVariable[] {
		this.declarationInit = init;
		return (this.value as PatternNode).declare(kind, UNKNOWN_EXPRESSION);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (!this.deoptimized) this.applyDeoptimizations();
		const propertyReadSideEffects = (this.context.options.treeshake as NormalizedTreeshakingOptions)
			.propertyReadSideEffects;
		return (
			(this.parent.type === 'ObjectPattern' && propertyReadSideEffects === 'always') ||
			this.key.hasEffects(context) ||
			this.value.hasEffects(context)
		);
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
			this.context.requestTreeshakingPass();
		}
	}
}
