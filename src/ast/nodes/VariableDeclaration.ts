import { Node, NodeBase } from './shared/Node';
import extractNames from '../utils/extractNames';
import ExecutionPathOptions from '../ExecutionPathOptions';
import VariableDeclarator from './VariableDeclarator';
import ForInStatement from './ForInStatement';
import ForOfStatement from './ForOfStatement';
import ForStatement from './ForStatement';
import MagicString from 'magic-string';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { isIdentifier } from './Identifier';
import { NodeType } from './NodeType';

function getSeparator (code: string, start: number) {
	let c = start;

	while (c > 0 && code[c - 1] !== '\n') {
		c -= 1;
		if (code[c] === ';' || code[c] === '{') return '; ';
	}

	const lineStart = code.slice(c, start).match(/^\s*/)[0];

	return `;\n${lineStart}`;
}

const forStatement = /^For(?:Of|In)?Statement/;

export function isVariableDeclaration (node: Node): node is VariableDeclaration {
	return node.type === NodeType.VariableDeclaration;
}

export default class VariableDeclaration extends NodeBase {
	type: NodeType.VariableDeclaration;
	declarations: VariableDeclarator[];
	kind: 'var' | 'let' | 'const';

	reassignPath (_path: ObjectPath, _options: ExecutionPathOptions) {
		this.declarations.forEach(declarator => declarator.reassignPath([], ExecutionPathOptions.create()));
	}

	hasEffectsWhenAssignedAtPath (_path: ObjectPath, _options: ExecutionPathOptions) {
		return false;
	}

	includeWithAllDeclarations () {
		let addedNewNodes = !this.included;
		this.included = true;
		this.declarations.forEach(declarator => {
			if (declarator.includeInBundle()) {
				addedNewNodes = true;
			}
		});
		return addedNewNodes;
	}

	includeInBundle () {
		let addedNewNodes = !this.included;
		this.included = true;
		this.declarations.forEach(declarator => {
			if (declarator.shouldBeIncluded()) {
				if (declarator.includeInBundle()) {
					addedNewNodes = true;
				}
			}
		});
		return addedNewNodes;
	}

	initialiseChildren () {
		this.declarations.forEach(child =>
			child.initialiseDeclarator(this.scope, this.kind)
		);
	}

	render (code: MagicString, es: boolean) {
		const treeshake = this.module.graph.treeshake;

		let shouldSeparate = false;
		let separator;

		if (this.scope.isModuleScope && !forStatement.test(this.parent.type)) {
			shouldSeparate = true;
			separator = getSeparator(this.module.code, this.start);
		}

		let c = this.start;
		let empty = true;

		for (let i = 0; i < this.declarations.length; i += 1) {
			const declarator = this.declarations[i];

			const prefix = empty ? '' : separator; // TODO indentation

			if (isIdentifier(declarator.id)) {
				const variable = this.scope.findVariable(declarator.id.name);
				const isExportedAndReassigned =
					!es && variable.exportName && variable.isReassigned;

				if (isExportedAndReassigned) {
					if (declarator.init) {
						if (shouldSeparate) code.overwrite(c, declarator.start, prefix);
						c = declarator.end;
						empty = false;
					}
				} else if (!treeshake || variable.included) {
					if (shouldSeparate)
						code.overwrite(c, declarator.start, `${prefix}${this.kind} `); // TODO indentation
					c = declarator.end;
					empty = false;
				}
			} else {
				const exportAssignments: any[] = [];
				let isIncluded = false;

				extractNames(declarator.id).forEach(name => {
					const variable = this.scope.findVariable(name);
					const isExportedAndReassigned =
						!es && variable.exportName && variable.isReassigned;

					if (isExportedAndReassigned) {
						// code.overwrite( c, declarator.start, prefix );
						// c = declarator.end;
						// empty = false;
						exportAssignments.push('TODO');
					} else if (declarator.included) {
						isIncluded = true;
					}
				});

				if (!treeshake || isIncluded) {
					if (shouldSeparate)
						code.overwrite(c, declarator.start, `${prefix}${this.kind} `); // TODO indentation
					c = declarator.end;
					empty = false;
				}

				if (exportAssignments.length) {
					throw new Error('TODO');
				}
			}

			declarator.render(code, es);
		}

		if (treeshake && empty) {
			code.remove(
				this.leadingCommentStart || this.start,
				this.next || this.end
			);
		} else {
			// always include a semi-colon (https://github.com/rollup/rollup/pull/1013),
			// unless it's a var declaration in a loop head
			const needsSemicolon =
				!forStatement.test(this.parent.type) || this === (<ForStatement | ForOfStatement | ForInStatement>this.parent).body;

			if (this.end > c) {
				code.overwrite(c, this.end, needsSemicolon ? ';' : '');
			} else if (needsSemicolon) {
				this.insertSemicolon(code);
			}
		}
	}
}
