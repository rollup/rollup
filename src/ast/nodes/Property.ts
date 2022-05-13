import type MagicString from 'magic-string';
import type { NormalizedTreeshakingOptions } from '../../rollup/types';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { HasEffectsContext } from '../ExecutionContext';
import { UnknownKey } from '../utils/PathTracker';
import type LocalVariable from '../variables/LocalVariable';
import type * as NodeType from './NodeType';
import { type ExpressionEntity, UNKNOWN_EXPRESSION } from './shared/Expression';
import MethodBase from './shared/MethodBase';
import type { ExpressionNode } from './shared/Node';
import type { PatternNode } from './shared/Pattern';

export default class Property extends MethodBase implements PatternNode {
	declare key: ExpressionNode;
	declare kind: 'init' | 'get' | 'set';
	declare method: boolean;
	declare shorthand: boolean;
	declare type: NodeType.tProperty;
	protected deoptimized = false;
	private declarationInit: ExpressionEntity | null = null;

	declare(kind: string, init: ExpressionEntity): LocalVariable[] {
		this.declarationInit = init;
		return (this.value as PatternNode).declare(kind, UNKNOWN_EXPRESSION);
	}

	hasEffects(context: HasEffectsContext): boolean | undefined {
		if (!this.deoptimized) this.applyDeoptimizations();
		const propertyReadSideEffects = (this.context.options.treeshake as NormalizedTreeshakingOptions)
			.propertyReadSideEffects;
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
			this.context.requestTreeshakingPass();
		}
	}
}
