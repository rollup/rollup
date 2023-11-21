import type MagicString from 'magic-string';
import type { RenderOptions } from '../../utils/renderHelpers';
import type { DeoptimizableEntity } from '../DeoptimizableEntity';
import { type HasEffectsContext, type InclusionContext } from '../ExecutionContext';
import TrackingScope from '../scopes/TrackingScope';
import { EMPTY_PATH, SHARED_RECURSION_TRACKER } from '../utils/PathTracker';
import BlockStatement from './BlockStatement';
import type Identifier from './Identifier';
import * as NodeType from './NodeType';
import { type LiteralValueOrUnknown, UnknownValue } from './shared/Expression';
import {
	type ExpressionNode,
	type GenericEsTreeNode,
	type IncludeChildren,
	StatementBase,
	type StatementNode
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
		if (typeof testValue === 'symbol') {
			const { brokenFlow } = context;
			if (this.consequent.hasEffects(context)) return true;
			// eslint-disable-next-line unicorn/consistent-destructuring
			const consequentBrokenFlow = context.brokenFlow;
			context.brokenFlow = brokenFlow;
			if (this.alternate === null) return false;
			if (this.alternate.hasEffects(context)) return true;
			// eslint-disable-next-line unicorn/consistent-destructuring
			context.brokenFlow = context.brokenFlow && consequentBrokenFlow;
			return false;
		}
		return testValue ? this.consequent.hasEffects(context) : !!this.alternate?.hasEffects(context);
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		if (includeChildrenRecursively) {
			this.includeRecursively(includeChildrenRecursively, context);
		} else {
			const testValue = this.getTestValue();
			if (typeof testValue === 'symbol') {
				this.includeUnknownTest(context);
			} else {
				this.includeKnownTest(context, testValue);
			}
		}
	}

	parseNode(esTreeNode: GenericEsTreeNode): void {
		this.consequentScope = new TrackingScope(this.scope);
		this.consequent = new (this.scope.context.getNodeConstructor(esTreeNode.consequent.type))(
			esTreeNode.consequent,
			this,
			this.consequentScope
		);
		if (esTreeNode.alternate) {
			this.alternateScope = new TrackingScope(this.scope);
			this.alternate = new (this.scope.context.getNodeConstructor(esTreeNode.alternate.type))(
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
		const noTreeshake = !this.scope.context.options.treeshake;
		if (includesIfElse) {
			this.test.render(code, options);
		} else {
			code.remove(this.start, this.consequent.start);
		}
		if (this.consequent.included && (noTreeshake || typeof testValue === 'symbol' || testValue)) {
			this.consequent.render(code, options);
		} else {
			code.overwrite(this.consequent.start, this.consequent.end, includesIfElse ? ';' : '');
			hoistedDeclarations.push(...this.consequentScope.hoistedDeclarations);
		}
		if (this.alternate) {
			if (this.alternate.included && (noTreeshake || typeof testValue === 'symbol' || !testValue)) {
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

	protected applyDeoptimizations() {}

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
			this.consequent.include(context, false, { asSingleStatement: true });
		}
		if (!testValue && this.alternate?.shouldBeIncluded(context)) {
			this.alternate.include(context, false, { asSingleStatement: true });
		}
	}

	private includeRecursively(
		includeChildrenRecursively: true | 'variables',
		context: InclusionContext
	) {
		this.test.include(context, includeChildrenRecursively);
		this.consequent.include(context, includeChildrenRecursively);
		this.alternate?.include(context, includeChildrenRecursively);
	}

	private includeUnknownTest(context: InclusionContext) {
		this.test.include(context, false);
		const { brokenFlow } = context;
		let consequentBrokenFlow = false;
		if (this.consequent.shouldBeIncluded(context)) {
			this.consequent.include(context, false, { asSingleStatement: true });
			// eslint-disable-next-line unicorn/consistent-destructuring
			consequentBrokenFlow = context.brokenFlow;
			context.brokenFlow = brokenFlow;
		}
		if (this.alternate?.shouldBeIncluded(context)) {
			this.alternate.include(context, false, { asSingleStatement: true });
			// eslint-disable-next-line unicorn/consistent-destructuring
			context.brokenFlow = context.brokenFlow && consequentBrokenFlow;
		}
	}

	private renderHoistedDeclarations(
		hoistedDeclarations: readonly Identifier[],
		code: MagicString,
		getPropertyAccess: (name: string) => string
	) {
		const hoistedVariables = [
			...new Set(
				hoistedDeclarations.map(identifier => {
					const variable = identifier.variable!;
					return variable.included ? variable.getName(getPropertyAccess) : '';
				})
			)
		]
			.filter(Boolean)
			.join(', ');
		if (hoistedVariables) {
			const parentType = this.parent.type;
			const needsBraces = parentType !== NodeType.Program && parentType !== NodeType.BlockStatement;
			code.prependRight(this.start, `${needsBraces ? '{ ' : ''}var ${hoistedVariables}; `);
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
