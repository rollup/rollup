import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	getCommaSeparatedNodesWithBoundaries,
	NodeRenderOptions,
	RenderOptions
} from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import { ExecutionPathOptions } from '../ExecutionPathOptions';
import { EMPTY_PATH, ObjectPath } from '../values';
import Variable from '../variables/Variable';
import Identifier, { IdentifierWithVariable } from './Identifier';
import * as NodeType from './NodeType';
import { IncludeChildren, NodeBase } from './shared/Node';
import VariableDeclarator from './VariableDeclarator';

function isReassignedExportsMember(variable: Variable): boolean {
	return variable.renderBaseName !== null && variable.exportName !== null && variable.isReassigned;
}

function areAllDeclarationsIncludedAndNotExported(declarations: VariableDeclarator[]): boolean {
	for (const declarator of declarations) {
		if (!declarator.included) {
			return false;
		}
		if (declarator.id.type === NodeType.Identifier) {
			if ((declarator.id.variable as Variable).exportName) return false;
		} else {
			const exportedVariables: Variable[] = [];
			declarator.id.addExportedVariables(exportedVariables);
			if (exportedVariables.length > 0) return false;
		}
	}
	return true;
}

export default class VariableDeclaration extends NodeBase {
	declarations!: VariableDeclarator[];
	kind!: 'var' | 'let' | 'const';
	type!: NodeType.tVariableDeclaration;

	deoptimizePath(_path: ObjectPath) {
		for (const declarator of this.declarations) {
			declarator.deoptimizePath(EMPTY_PATH);
		}
	}

	hasEffectsWhenAssignedAtPath(_path: ObjectPath, _options: ExecutionPathOptions) {
		return false;
	}

	include(includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		for (const declarator of this.declarations) {
			if (includeChildrenRecursively || declarator.shouldBeIncluded())
				declarator.include(includeChildrenRecursively);
		}
	}

	includeWithAllDeclaredVariables(includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		for (const declarator of this.declarations) {
			declarator.include(includeChildrenRecursively);
		}
	}

	initialise() {
		for (const declarator of this.declarations) {
			declarator.declareDeclarator(this.kind);
		}
	}

	render(code: MagicString, options: RenderOptions, nodeRenderOptions: NodeRenderOptions = BLANK) {
		if (areAllDeclarationsIncludedAndNotExported(this.declarations)) {
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

	private renderDeclarationEnd(
		code: MagicString,
		separatorString: string,
		lastSeparatorPos: number | null,
		actualContentEnd: number,
		renderedContentEnd: number,
		addSemicolon: boolean,
		systemPatternExports: Variable[]
	): void {
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
		if (systemPatternExports.length > 0) {
			code.appendLeft(renderedContentEnd, ' ' + getSystemExportStatement(systemPatternExports));
		}
	}

	private renderReplacedDeclarations(
		code: MagicString,
		options: RenderOptions,
		{ start = this.start, end = this.end, isNoStatement }: NodeRenderOptions
	): void {
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
		const systemPatternExports: Variable[] = [];
		for (const { node, start, separator, contentEnd, end } of separatedNodes) {
			if (
				!node.included ||
				(node.id instanceof Identifier &&
					isReassignedExportsMember((node.id as IdentifierWithVariable).variable) &&
					node.init === null)
			) {
				code.remove(start, end);
				continue;
			}
			leadingString = '';
			nextSeparatorString = '';
			if (
				node.id instanceof Identifier &&
				isReassignedExportsMember((node.id as IdentifierWithVariable).variable)
			) {
				if (hasRenderedContent) {
					separatorString += ';';
				}
				isInDeclaration = false;
			} else {
				if (options.format === 'system' && node.init !== null) {
					if (node.id.type !== NodeType.Identifier) {
						node.id.addExportedVariables(systemPatternExports);
					} else if ((node.id.variable as Variable).exportName) {
						code.prependLeft(
							code.original.indexOf('=', node.id.end) + 1,
							` exports('${(node.id.variable as Variable).safeExportName ||
								(node.id.variable as Variable).exportName}',`
						);
						nextSeparatorString += ')';
					}
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
			lastSeparatorPos = separator as number;
			separatorString = nextSeparatorString;
		}
		if (hasRenderedContent) {
			this.renderDeclarationEnd(
				code,
				separatorString,
				lastSeparatorPos,
				actualContentEnd as number,
				renderedContentEnd,
				!isNoStatement,
				systemPatternExports
			);
		} else {
			code.remove(start, end);
		}
	}
}
