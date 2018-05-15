import { Node, NodeBase } from './shared/Node';
import { ExecutionPathOptions, NEW_EXECUTION_PATH } from '../ExecutionPathOptions';
import VariableDeclarator from './VariableDeclarator';
import MagicString from 'magic-string';
import * as NodeType from './NodeType';
import {
	getCommaSeparatedNodesWithBoundaries,
	NodeRenderOptions,
	RenderOptions
} from '../../utils/renderHelpers';
import { isIdentifier } from './Identifier';
import Variable from '../variables/Variable';
import { EMPTY_PATH, ObjectPath } from '../values';
import { BLANK } from '../../utils/blank';

function isReassignedExportsMember(variable: Variable): boolean {
	return (
		variable.safeName &&
		variable.safeName.indexOf('.') !== -1 &&
		variable.exportName &&
		variable.isReassigned
	);
}

export function isVariableDeclaration(node: Node): node is VariableDeclaration {
	return node.type === NodeType.VariableDeclaration;
}

export default class VariableDeclaration extends NodeBase {
	type: NodeType.tVariableDeclaration;
	declarations: VariableDeclarator[];
	kind: 'var' | 'let' | 'const';

	hasEffectsWhenAssignedAtPath(_path: ObjectPath, _options: ExecutionPathOptions) {
		return false;
	}

	includeWithAllDeclaredVariables() {
		let anotherPassNeeded = false;
		this.included = true;
		for (const declarator of this.declarations) {
			if (declarator.include()) anotherPassNeeded = true;
		}
		return anotherPassNeeded;
	}

	include() {
		this.included = true;
		for (const declarator of this.declarations) {
			if (declarator.shouldBeIncluded()) declarator.include();
		}
	}

	initialise() {
		this.included = false;
		for (const declarator of this.declarations) {
			declarator.declareDeclarator(this.kind);
		}
	}

	reassignPath(_path: ObjectPath, _options: ExecutionPathOptions) {
		for (const declarator of this.declarations) {
			declarator.reassignPath(EMPTY_PATH, NEW_EXECUTION_PATH);
		}
	}

	render(code: MagicString, options: RenderOptions, nodeRenderOptions: NodeRenderOptions = BLANK) {
		if (
			this.declarations.every(
				declarator =>
					declarator.included && (!declarator.id.variable || !declarator.id.variable.exportName)
			)
		) {
			for (const declarator of this.declarations) {
				declarator.render(code, options);
			}
			if (
				!nodeRenderOptions.isNoStatement &&
				code.original.charCodeAt(this.end - 1) !== 59 /*";"*/
			) {
				code.appendLeft(this.end, ';');
			}
		} else {
			this.renderReplacedDeclarations(code, options, nodeRenderOptions);
		}
	}

	private renderReplacedDeclarations(
		code: MagicString,
		options: RenderOptions,
		{ start = this.start, end = this.end, isNoStatement }: NodeRenderOptions
	) {
		const separatedNodes = getCommaSeparatedNodesWithBoundaries(
			this.declarations,
			code,
			this.start + this.kind.length,
			this.end - (code.original.charCodeAt(this.end - 1) === 59 /*";"*/ ? 1 : 0)
		);
		let actualContentEnd, renderedContentEnd;
		if (/\n\s*$/.test(code.slice(this.start, separatedNodes[0].start))) {
			renderedContentEnd = this.start + this.kind.length;
		} else {
			renderedContentEnd = separatedNodes[0].start;
		}
		let lastSeparatorPos = renderedContentEnd - 1;
		code.remove(this.start, lastSeparatorPos);
		let isInDeclaration = false;
		let hasRenderedContent = false;
		let separatorString = '',
			leadingString,
			nextSeparatorString;
		for (const { node, start, separator, contentEnd, end } of separatedNodes) {
			if (
				!node.included ||
				(isIdentifier(node.id) && isReassignedExportsMember(node.id.variable) && node.init === null)
			) {
				code.remove(start, end);
				continue;
			}
			leadingString = '';
			nextSeparatorString = '';
			if (isIdentifier(node.id) && isReassignedExportsMember(node.id.variable)) {
				if (hasRenderedContent) {
					separatorString += ';';
				}
				isInDeclaration = false;
			} else {
				if (
					options.format === 'system' &&
					node.init !== null &&
					isIdentifier(node.id) &&
					node.id.variable.exportName
				) {
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
			actualContentEnd = contentEnd;
			renderedContentEnd = end;
			hasRenderedContent = true;
			lastSeparatorPos = separator;
			separatorString = nextSeparatorString;
		}
		if (hasRenderedContent) {
			this.renderDeclarationEnd(
				code,
				separatorString,
				lastSeparatorPos,
				actualContentEnd,
				renderedContentEnd,
				!isNoStatement
			);
		} else {
			code.remove(start, end);
		}
	}

	private renderDeclarationEnd(
		code: MagicString,
		separatorString: string,
		lastSeparatorPos: number,
		actualContentEnd: number,
		renderedContentEnd: number,
		addSemicolon: boolean
	) {
		if (code.original.charCodeAt(this.end - 1) === 59 /*";"*/) {
			code.remove(this.end - 1, this.end);
		}
		if (addSemicolon) {
			separatorString += ';';
		}
		if (lastSeparatorPos !== null) {
			if (
				code.original.charCodeAt(actualContentEnd - 1) === 10 /*"\n"*/ &&
				(code.original.charCodeAt(this.end) === 10 /*"\n"*/ ||
					code.original.charCodeAt(this.end) === 13) /*"\r"*/
			) {
				actualContentEnd--;
				if (code.original.charCodeAt(actualContentEnd) === 13 /*"\r"*/) {
					actualContentEnd--;
				}
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
