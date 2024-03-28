import type MagicString from 'magic-string';
import { type RenderOptions, renderStatementList } from '../../utils/renderHelpers';
import {
	createHasEffectsContext,
	type HasEffectsContext,
	type InclusionContext
} from '../ExecutionContext';
import BlockScope from '../scopes/BlockScope';
import type ChildScope from '../scopes/ChildScope';
import type { ObjectPath } from '../utils/PathTracker';
import type * as NodeType from './NodeType';
import type SwitchCase from './SwitchCase';
import type { ExpressionNode, GenericEsTreeNode, IncludeChildren } from './shared/Node';
import { StatementBase } from './shared/Node';

export default class SwitchStatement extends StatementBase {
	declare cases: readonly SwitchCase[];
	declare discriminant: ExpressionNode;
	declare type: NodeType.tSwitchStatement;

	declare parentScope: ChildScope;
	private declare defaultCase: number | null;

	createScope(parentScope: ChildScope): void {
		this.parentScope = parentScope;
		this.scope = new BlockScope(parentScope);
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.discriminant.hasEffects(context)) return true;
		const { brokenFlow, hasBreak, ignore } = context;
		const { breaks } = ignore;
		ignore.breaks = true;
		context.hasBreak = false;
		let onlyHasBrokenFlow = true;
		for (const switchCase of this.cases) {
			if (switchCase.hasEffects(context)) return true;
			onlyHasBrokenFlow &&= context.brokenFlow && !context.hasBreak;
			context.hasBreak = false;
			context.brokenFlow = brokenFlow;
		}
		if (this.defaultCase !== null) {
			context.brokenFlow = onlyHasBrokenFlow;
		}
		ignore.breaks = breaks;
		context.hasBreak = hasBreak;
		return false;
	}

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren
	): void {
		this.included = true;
		this.discriminant.includePath(path, context, includeChildrenRecursively);
		const { brokenFlow, hasBreak } = context;
		context.hasBreak = false;
		let onlyHasBrokenFlow = true;
		let isCaseIncluded =
			includeChildrenRecursively ||
			(this.defaultCase !== null && this.defaultCase < this.cases.length - 1);
		for (let caseIndex = this.cases.length - 1; caseIndex >= 0; caseIndex--) {
			const switchCase = this.cases[caseIndex];
			if (switchCase.included) {
				isCaseIncluded = true;
			}
			if (!isCaseIncluded) {
				const hasEffectsContext = createHasEffectsContext();
				hasEffectsContext.ignore.breaks = true;
				isCaseIncluded = switchCase.hasEffects(hasEffectsContext);
			}
			if (isCaseIncluded) {
				switchCase.includePath(path, context, includeChildrenRecursively);
				onlyHasBrokenFlow &&= context.brokenFlow && !context.hasBreak;
				context.hasBreak = false;
				context.brokenFlow = brokenFlow;
			} else {
				onlyHasBrokenFlow = brokenFlow;
			}
		}
		if (isCaseIncluded && this.defaultCase !== null) {
			context.brokenFlow = onlyHasBrokenFlow;
		}
		context.hasBreak = hasBreak;
	}

	initialise(): void {
		super.initialise();
		for (let caseIndex = 0; caseIndex < this.cases.length; caseIndex++) {
			if (this.cases[caseIndex].test === null) {
				this.defaultCase = caseIndex;
				return;
			}
		}
		this.defaultCase = null;
	}

	parseNode(esTreeNode: GenericEsTreeNode): this {
		this.discriminant = new (this.scope.context.getNodeConstructor(esTreeNode.discriminant.type))(
			this,
			this.parentScope
		).parseNode(esTreeNode.discriminant);
		return super.parseNode(esTreeNode);
	}

	render(code: MagicString, options: RenderOptions): void {
		this.discriminant.render(code, options);
		if (this.cases.length > 0) {
			renderStatementList(this.cases, code, this.cases[0].start, this.end - 1, options);
		}
	}
}
