import { Node, NodeBase } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import VariableDeclarator from './VariableDeclarator';
import MagicString from 'magic-string';
import { ObjectPath } from '../variables/VariableReassignmentTracker';
import { NodeType } from './NodeType';
import { NodeRenderOptions, RenderOptions } from '../../Module';
import { getCommaSeparatedNodesWithSeparators } from '../../utils/renderHelpers';
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

	render (code: MagicString, options: RenderOptions, nodeRenderOptions: NodeRenderOptions = {}) {
		const separatedNodes = getCommaSeparatedNodesWithSeparators(
			this.declarations,
			code,
			this.start + this.kind.length,
			this.end - (code.original[this.end - 1] === ';' ? 1 : 0)
		);
		let renderedContentEnd;
		if (/\n\s*$/.test(code.slice(this.start, separatedNodes[0].start))) {
			renderedContentEnd = this.start + this.kind.length;
		} else {
			renderedContentEnd = separatedNodes[0].start;
		}
		let lastSeparatorPos = renderedContentEnd - 1;
		code.remove(this.start, lastSeparatorPos);
		let isInDeclaration = false;
		let hasRenderedContent = false;
		let separatorString = '', leadingString, nextSeparatorString;
		for (let { node, start, separator, end } of separatedNodes) {
			if (!node.included || (isIdentifier(node.id) && isReassignedPartOfExportsObject(node.id.variable) && node.init === null)) {
				code.remove(start, end);
				continue;
			}
			leadingString = '';
			nextSeparatorString = '';
			if (isIdentifier(node.id) && isReassignedPartOfExportsObject(node.id.variable)) {
				if (hasRenderedContent) {
					separatorString += ';';
				}
				isInDeclaration = false;
			} else {
				if (options.systemBindings && node.init !== null && isIdentifier(node.id) && node.id.variable.exportName) {
					code.prependLeft(node.init.start, `exports('${node.id.variable.exportName}', `);
					nextSeparatorString += ')';
				}
				if (isInDeclaration) {
					separatorString += ',';
				} else {
					if (hasRenderedContent) {
						separatorString += ';';
					}
					leadingString += `${this.kind} `;
					isInDeclaration = true;
				}
			}
			if (renderedContentEnd === lastSeparatorPos + 1) {
				code.overwrite(lastSeparatorPos, renderedContentEnd, separatorString + leadingString);
			} else {
				code.overwrite(lastSeparatorPos, lastSeparatorPos + 1, separatorString);
				code.appendLeft(renderedContentEnd, leadingString);
			}
			node.render(code, options);
			renderedContentEnd = end;
			hasRenderedContent = true;
			lastSeparatorPos = separator;
			separatorString = nextSeparatorString;
		}
		if (hasRenderedContent) {
			this.renderDeclarationEnd(code, separatorString, lastSeparatorPos, renderedContentEnd, !nodeRenderOptions.noSemicolon);
		} else {
			code.remove(nodeRenderOptions.start || this.start, nodeRenderOptions.end || this.end);
		}
	}

	private renderDeclarationEnd (
		code: MagicString,
		separatorString: string,
		lastSeparatorPos: number,
		renderedContentEnd: number,
		addSemicolon: boolean
	) {
		if (code.original[this.end - 1] === ';') {
			code.remove(this.end - 1, this.end);
		}
		if (addSemicolon) {
			separatorString += ';';
		}
		if (lastSeparatorPos !== null) {
			let actualContentEnd = lastSeparatorPos + code.original.slice(lastSeparatorPos, renderedContentEnd).search(/\s*$/);
			// Do not remove trailing white-space if we might remove an essential comment-closing line-break
			if (code.original[actualContentEnd] === '\n' && code.original[this.end] !== '\n') {
				actualContentEnd = renderedContentEnd;
			}
			if (actualContentEnd === lastSeparatorPos + 1) {
				code.overwrite(lastSeparatorPos, renderedContentEnd, separatorString);
			} else {
				code.overwrite(lastSeparatorPos, lastSeparatorPos + 1, separatorString);
				code.remove(actualContentEnd, renderedContentEnd);
			}
		} else {
			code.appendLeft(renderedContentEnd, separatorString);
		}
		return separatorString;
	}
}
