import { Node, NodeBase } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import VariableDeclarator from './VariableDeclarator';
import MagicString from 'magic-string';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../Module';
import { getCommaSeparatedNodesWithBoundaries } from '../../utils/renderHelpers';
import { isIdentifier } from './Identifier';
import { isForStatement } from './ForStatement';
import { isForOfStatement } from './ForOfStatement';
import { isForInStatement } from './ForInStatement';
import Variable from '../variables/Variable';

function isDeclarationInForLoop (node: Node): boolean {
	const parent = <Node>node.parent;
	return (isForStatement(parent) && parent.init === node)
		|| ((isForOfStatement(parent) || isForInStatement(parent)) && parent.left === node);
}

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

	render (code: MagicString, options: RenderOptions, { start, end }: NodeRenderOptions = {}) {
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
			if (isIdentifier(node.id) && isReassignedPartOfExportsObject(node.id.variable)) {
				code.overwrite(start, contentStart, (hasOpenSystemBinding ? ')' : '') + (hasRenderedContent ? '; ' : ''));
				isInDeclaration = false;
				hasOpenSystemBinding = false;
			} else if (!isInDeclaration) {
				code.overwrite(start, contentStart, (hasOpenSystemBinding ? ')' : '') + (hasRenderedContent ? '; ' : '') + this.kind + ' ');
				isInDeclaration = true;
				hasOpenSystemBinding = false;
				if (options.systemBindings && node.init !== null && isIdentifier(node.id) && node.id.variable.exportName) {
					code.prependLeft(node.init.start, `exports('${node.id.variable.exportName}', `);
					hasOpenSystemBinding = true;
				}
			} else if (hasOpenSystemBinding) {
				code.overwrite(start, contentStart, '), ');
				hasOpenSystemBinding = false;
			}
			node.render(code, options);
			renderedContentEnd = end;
			hasRenderedContent = true;
		}
		if (hasRenderedContent) {
			if (!isDeclarationInForLoop(this)) {
				code.appendLeft(renderedContentEnd, (hasOpenSystemBinding ? ')' : '') + ';');
			}
		} else {
			code.remove(start || this.start, end || this.end);
		}
	}
}
