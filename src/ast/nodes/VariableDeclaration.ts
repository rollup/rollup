import { Node, NodeBase } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import VariableDeclarator from './VariableDeclarator';
import MagicString from 'magic-string';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../Module';
import { getCommaSeparatedNodesWithBoundaries } from '../../utils/renderHelpers';
import { isIdentifier } from './Identifier';
import Variable from '../variables/Variable';

function isReassignedPartOfExportsObject (variable: Variable): boolean {
	return variable.safeName && variable.safeName.indexOf('.') !== -1 && variable.exportName && variable.isReassigned;
}

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

	includeWithAllDeclaredVariables () {
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

	render (code: MagicString, options: RenderOptions, { start, end, noSemicolon }: NodeRenderOptions = {}) {
		let declarationsEnd = this.end;
		if (code.original[declarationsEnd - 1] === ';') {
			declarationsEnd--;
			code.overwrite(declarationsEnd, declarationsEnd + 1, '');
		}
		const nodesWithBoundaries = getCommaSeparatedNodesWithBoundaries(
			this.declarations, code, this.start + this.kind.length - 1, declarationsEnd
		);
		// Make sure the first node overwrites "var " with whatever is appropriate
		nodesWithBoundaries[0].start = this.start;
		let isInDeclaration = false;
		let hasRenderedContent = false;
		let hasOpenSystemBinding = false;
		let renderedContentEnd;
		for (const { node, start, contentStart, end } of nodesWithBoundaries) {
			if (!node.included || (isIdentifier(node.id) && isReassignedPartOfExportsObject(node.id.variable) && node.init === null)) {
				code.remove(start, end);
				continue;
			}
			let separatorString = hasOpenSystemBinding ? ')' : '';
			hasOpenSystemBinding = false;
			if (isIdentifier(node.id) && isReassignedPartOfExportsObject(node.id.variable)) {
				if (hasRenderedContent) {
					separatorString += '; ';
				}
				isInDeclaration = false;
			} else {
				if (options.systemBindings && node.init !== null && isIdentifier(node.id) && node.id.variable.exportName) {
					code.prependLeft(node.init.start, `exports('${node.id.variable.exportName}', `);
					hasOpenSystemBinding = true;
				}
				if (isInDeclaration) {
					separatorString += ', ';
				} else {
					isInDeclaration = true;
					if (hasRenderedContent) {
						separatorString += '; ';
					}
					separatorString += `${this.kind} `;
				}
			}
			code.overwrite(start, contentStart, separatorString);
			node.render(code, options);
			renderedContentEnd = end;
			hasRenderedContent = true;
		}
		if (hasRenderedContent) {
			if (!noSemicolon) {
				code.appendLeft(renderedContentEnd, (hasOpenSystemBinding ? ')' : '') + ';');
			}
		} else {
			code.remove(start || this.start, end || this.end);
		}
	}
}
