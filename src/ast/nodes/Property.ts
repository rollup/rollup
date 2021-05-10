import MagicString from 'magic-string';
import { NormalizedTreeshakingOptions } from '../../rollup/types';
import { RenderOptions } from '../../utils/renderHelpers';
import { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import { UnknownKey } from '../utils/PathTracker';
import * as NodeType from './NodeType';
import { ExpressionEntity, UNKNOWN_EXPRESSION } from './shared/Expression';
import MethodBase from './shared/MethodBase';
import { ExpressionNode, IncludeChildren } from './shared/Node';
import { PatternNode } from './shared/Pattern';

export default class Property extends MethodBase implements PatternNode {
	key!: ExpressionNode;
	kind!: 'init' | 'get' | 'set';
	method!: boolean;
	shorthand!: boolean;
	type!: NodeType.tProperty;
	private declarationInit: ExpressionEntity | null = null;
	private deoptimized = false;

	declare(kind: string, init: ExpressionEntity) {
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

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.deoptimized) this.applyDeoptimizations();
		this.included = true;
		this.key.include(context, includeChildrenRecursively);
		this.value.include(context, includeChildrenRecursively);
	}

	render(code: MagicString, options: RenderOptions) {
		if (!this.shorthand) {
			this.key.render(code, options);
		}
		this.value.render(code, options, { isShorthandProperty: this.shorthand });
	}

	// TODO Lukas consider making this a part of the Node interface and get rid of unneeded hasEffects and include handlers
	private applyDeoptimizations():void {
		this.deoptimized = true;
		if (this.declarationInit !== null) {
			this.declarationInit.deoptimizePath([UnknownKey, UnknownKey]);
		}
	}
}
