import MagicString from 'magic-string';
import { RenderOptions } from '../../utils/renderHelpers';
import { DeoptimizableEntity } from '../DeoptimizableEntity';
import { BROKEN_FLOW_NONE, HasEffectsContext, InclusionContext } from '../ExecutionContext';
import TrackingScope from '../scopes/TrackingScope';
import { EMPTY_PATH, SHARED_RECURSION_TRACKER } from '../utils/PathTracker';
import BlockStatement from './BlockStatement';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import {
	ExpressionNode,
	GenericEsTreeNode,
	IncludeChildren,
	StatementBase,
	StatementNode
} from './shared/Node';

const unset = Symbol('unset');

export default class IfStatement extends StatementBase implements DeoptimizableEntity {
	declare alternate: StatementNode | null;
	declare consequent: StatementNode;
	declare test: ExpressionNode;
	declare type: NodeType.tIfStatement;

	private declare alternateScope?: TrackingScope;
	private declare consequentScope: TrackingScope;
	private testValue: LiteralValueOrUnknown | typeof unset = unset;

	deoptimizeCache(): void {
		this.testValue = UnknownValue;
	}

	hasEffects(context: HasEffectsContext): boolean {
		if (this.test.hasEffects(context)) {
			return true;
		}
		const testValue = this.getTestValue();
		if (testValue === UnknownValue) {
			const { brokenFlow } = context;
			if (this.consequent.hasEffects(context)) return true;
			const consequentBrokenFlow = context.brokenFlow;
			context.brokenFlow = brokenFlow;
			if (this.alternate === null) return false;
			if (this.alternate.hasEffects(context)) return true;
			context.brokenFlow =
				context.brokenFlow < consequentBrokenFlow ? context.brokenFlow : consequentBrokenFlow;
			return false;
		}
		return testValue
			? this.consequent.hasEffects(context)
			: this.alternate !== null && this.alternate.hasEffects(context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		if (includeChildrenRecursively) {
			this.includeRecursively(includeChildrenRecursively, context);
		} else {
			const testValue = this.getTestValue();
			if (testValue === UnknownValue) {
				this.includeUnknownTest(context);
			} else {
				this.includeKnownTest(context, testValue);
			}
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		this.consequentScope = new TrackingScope(this.scope);
		this.consequent = new (this.context.getNodeConstructor(esTreeNode.consequent.type))(
			esTreeNode.consequent,
			this,
			this.consequentScope
		);
		if (esTreeNode.alternate) {
			this.alternateScope = new TrackingScope(this.scope);
			this.alternate = new (this.context.getNodeConstructor(esTreeNode.alternate.type))(
				esTreeNode.alternate,
				this,
				this.alternateScope
			);
		}
		super.parseNode(esTreeNode);
	}

	render(code: MagicString, options: RenderOptions): void {
		const {
			snippets: { getPropertyAccess }
		} = options;
		// Note that unknown test values are always included
		const testValue = this.getTestValue();
		const hoistedDeclarations: Identifier[] = [];
		const includesIfElse = this.test.included;
		const noTreeshake = !this.context.options.treeshake;
		if (includesIfElse) {
			this.test.render(code, options);
		} else {
			code.remove(this.start, this.consequent.start);
		}
		if (this.consequent.included && (noTreeshake || testValue === UnknownValue || testValue)) {
			this.consequent.render(code, options);
		} else {
			code.overwrite(this.consequent.start, this.consequent.end, includesIfElse ? ';' : '');
			hoistedDeclarations.push(...this.consequentScope.hoistedDeclarations);
		}
		if (this.alternate) {
			if (this.alternate.included && (noTreeshake || testValue === UnknownValue || !testValue)) {
				if (includesIfElse) {
					if (code.original.charCodeAt(this.alternate.start - 1) === 101) {
						code.prependLeft(this.alternate.start, ' ');
					}
				} else {
					code.remove(this.consequent.end, this.alternate.start);
				}
				this.alternate.render(code, options);
			} else {
				if (includesIfElse && this.shouldKeepAlternateBranch()) {
					code.overwrite(this.alternate.start, this.end, ';');
				} else {
					code.remove(this.consequent.end, this.end);
				}
				hoistedDeclarations.push(...this.alternateScope!.hoistedDeclarations);
			}
		}
		this.renderHoistedDeclarations(hoistedDeclarations, code, getPropertyAccess);
	}

	private getTestValue(): LiteralValueOrUnknown {
		if (this.testValue === unset) {
			return (this.testValue = this.test.getLiteralValueAtPath(
				EMPTY_PATH,
				SHARED_RECURSION_TRACKER,
				this
			));
		}
		return this.testValue;
	}

	private includeKnownTest(context: InclusionContext, testValue: LiteralValueOrUnknown) {
		if (this.test.shouldBeIncluded(context)) {
			this.test.include(context, false);
		}
		if (testValue && this.consequent.shouldBeIncluded(context)) {
			this.consequent.includeAsSingleStatement(context, false);
		}
		if (this.alternate !== null && !testValue && this.alternate.shouldBeIncluded(context)) {
			this.alternate.includeAsSingleStatement(context, false);
		}
	}

	private includeRecursively(
		includeChildrenRecursively: true | 'variables',
		context: InclusionContext
	) {
		this.test.include(context, includeChildrenRecursively);
		this.consequent.include(context, includeChildrenRecursively);
		if (this.alternate !== null) {
			this.alternate.include(context, includeChildrenRecursively);
		}
	}

	private includeUnknownTest(context: InclusionContext) {
		this.test.include(context, false);
		const { brokenFlow } = context;
		let consequentBrokenFlow = BROKEN_FLOW_NONE;
		if (this.consequent.shouldBeIncluded(context)) {
			this.consequent.includeAsSingleStatement(context, false);
			consequentBrokenFlow = context.brokenFlow;
			context.brokenFlow = brokenFlow;
		}
		if (this.alternate !== null && this.alternate.shouldBeIncluded(context)) {
			this.alternate.includeAsSingleStatement(context, false);
			context.brokenFlow =
				context.brokenFlow < consequentBrokenFlow ? context.brokenFlow : consequentBrokenFlow;
		}
	}

	private renderHoistedDeclarations(
		hoistedDeclarations: Identifier[],
		code: MagicString,
		getPropertyAccess: (name: string) => string
	) {
		const hoistedVars = [
			...new Set(
				hoistedDeclarations.map(identifier => {
					const variable = identifier.variable!;
					return variable.included ? variable.getName(getPropertyAccess) : '';
				})
			)
		]
			.filter(Boolean)
			.join(', ');
		if (hoistedVars) {
			const parentType = this.parent.type;
			const needsBraces = parentType !== NodeType.Program && parentType !== NodeType.BlockStatement;
			code.prependRight(this.start, `${needsBraces ? '{ ' : ''}var ${hoistedVars}; `);
			if (needsBraces) {
				code.appendLeft(this.end, ` }`);
			}
		}
	}

	private shouldKeepAlternateBranch() {
		let currentParent = this.parent;
		do {
			if (currentParent instanceof IfStatement && currentParent.alternate) {
				return true;
			}
			if (currentParent instanceof BlockStatement) {
				return false;
			}
			currentParent = (currentParent as any).parent;
		} while (currentParent);
		return false;
	}
}
