import extractNames from '../utils/extractNames';
import { UNKNOWN_VALUE } from '../values';
import Scope from '../scopes/Scope';
import { ExpressionNode, Node, StatementBase, StatementNode } from './shared/Node';
import { isVariableDeclaration } from './VariableDeclaration';
import MagicString from 'magic-string';
import { NodeType } from './NodeType';
import { RenderOptions } from '../../utils/renderHelpers';
import Import from './Import';

// Statement types which may contain if-statements as direct children.
const statementsWithIfStatements = new Set([
	'DoWhileStatement',
	'ForInStatement',
	'ForOfStatement',
	'ForStatement',
	'IfStatement',
	'WhileStatement'
]);

function getHoistedVars(node: StatementNode, scope: Scope) {
	const hoistedVars: string[] = [];

	function visit(node: Node) {
		if (isVariableDeclaration(node) && node.kind === 'var') {
			for (const declarator of node.declarations) {
				declarator.init = null;
				declarator.initialise(scope, []);

				for (const name of extractNames(declarator.id)) {
					if (hoistedVars.indexOf(name) < 0) hoistedVars.push(name);
				}
			}
		} else if (!/Function/.test(node.type)) {
			node.eachChild(visit);
		}
	}

	visit(node);

	return hoistedVars;
}

export default class IfStatement extends StatementBase {
	type: NodeType.IfStatement;
	test: ExpressionNode;
	consequent: StatementNode;
	alternate: StatementNode | null;

	private testValue: any;
	private hoistedVars?: string[];

	initialiseChildren(parentScope: Scope, dynamicImportReturnList: Import[]) {
		super.initialiseChildren(parentScope, dynamicImportReturnList);
		if (this.module.graph.treeshake) {
			this.testValue = this.test.getValue();

			if (this.testValue === UNKNOWN_VALUE) {
				return;
			}
			if (this.testValue) {
				if (this.alternate) {
					this.hoistedVars = getHoistedVars(this.alternate, this.scope);
					this.alternate = null;
				}
			} else {
				this.hoistedVars = getHoistedVars(this.consequent, this.scope);
				this.consequent = null;
			}
		}
	}

	initialiseNode() {
		this.hoistedVars = [];
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.module.graph.treeshake) {
			if (this.testValue === UNKNOWN_VALUE) {
				super.render(code, options);
			} else {
				code.overwrite(this.test.start, this.test.end, JSON.stringify(this.testValue));

				// TODO if no block-scoped declarations, remove enclosing
				// curlies and dedent block (if there is a block)

				if (this.hoistedVars) {
					const names = this.hoistedVars
						.map(name => {
							const variable = this.scope.findVariable(name);
							return variable.included ? variable.getName() : null;
						})
						.filter(Boolean);

					if (names.length > 0) {
						code.appendLeft(this.start, `var ${names.join(', ')};\n\n`);
					}
				}

				if (this.testValue) {
					code.remove(this.start, this.consequent.start);
					code.remove(this.consequent.end, this.end);
					this.consequent.render(code, options);
				} else {
					code.remove(this.start, this.alternate ? this.alternate.start : this.end);

					if (this.alternate) {
						this.alternate.render(code, options);
					} else if (statementsWithIfStatements.has(this.parent.type)) {
						code.prependRight(this.start, '{}');
					}
				}
			}
		} else {
			super.render(code, options);
		}
	}

	shouldBeIncluded() {
		return this.hoistedVars.length > 0 || super.shouldBeIncluded();
	}
}
