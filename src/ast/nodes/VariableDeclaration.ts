import MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	getCommaSeparatedNodesWithBoundaries,
	NodeRenderOptions,
	RenderOptions
} from '../../utils/renderHelpers';
import {
	getSystemExportFunctionLeft,
	getSystemExportStatement
} from '../../utils/systemJsRendering';
import { InclusionContext } from '../ExecutionContext';
import { EMPTY_PATH } from '../utils/PathTracker';
import Variable from '../variables/Variable';
import Identifier, { IdentifierWithVariable } from './Identifier';
import * as NodeType from './NodeType';
import { IncludeChildren, NodeBase } from './shared/Node';
import VariableDeclarator from './VariableDeclarator';

function isReassignedExportsMember(
	variable: Variable,
	exportNamesByVariable: Map<Variable, string[]>
): boolean {
	return (
		variable.renderBaseName !== null && exportNamesByVariable.has(variable) && variable.isReassigned
	);
}

function areAllDeclarationsIncludedAndNotExported(
	declarations: VariableDeclarator[],
	exportNamesByVariable: Map<Variable, string[]>
): boolean {
	for (const declarator of declarations) {
		if (!declarator.included) return false;
		if (declarator.id.type === NodeType.Identifier) {
			if (exportNamesByVariable.has(declarator.id.variable!)) return false;
		} else {
			const exportedVariables: Variable[] = [];
			declarator.id.addExportedVariables(exportedVariables, exportNamesByVariable);
			if (exportedVariables.length > 0) return false;
		}
	}
	return true;
}

export default class VariableDeclaration extends NodeBase {
	declarations!: VariableDeclarator[];
	kind!: 'var' | 'let' | 'const';
	type!: NodeType.tVariableDeclaration;

	deoptimizePath() {
		for (const declarator of this.declarations) {
			declarator.deoptimizePath(EMPTY_PATH);
		}
	}

	hasEffectsWhenAssignedAtPath() {
		return false;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		this.included = true;
		for (const declarator of this.declarations) {
			if (includeChildrenRecursively || declarator.shouldBeIncluded(context))
				declarator.include(context, includeChildrenRecursively);
		}
	}

	includeWithAllDeclaredVariables(
		includeChildrenRecursively: IncludeChildren,
		context: InclusionContext
	) {
		this.included = true;
		for (const declarator of this.declarations) {
			declarator.include(context, includeChildrenRecursively);
		}
	}

	initialise() {
		for (const declarator of this.declarations) {
			declarator.declareDeclarator(this.kind);
		}
	}

	render(code: MagicString, options: RenderOptions, nodeRenderOptions: NodeRenderOptions = BLANK) {
		if (
			areAllDeclarationsIncludedAndNotExported(this.declarations, options.exportNamesByVariable)
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

	private renderDeclarationEnd(
		code: MagicString,
		separatorString: string,
		lastSeparatorPos: number | null,
		actualContentEnd: number,
		renderedContentEnd: number,
		addSemicolon: boolean,
		systemPatternExports: Variable[],
		options: RenderOptions
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
			code.appendLeft(
				renderedContentEnd,
				` ${getSystemExportStatement(systemPatternExports, options)};`
			);
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
		let actualContentEnd: number | undefined, renderedContentEnd: number;
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
					isReassignedExportsMember(
						(node.id as IdentifierWithVariable).variable,
						options.exportNamesByVariable
					) &&
					node.init === null)
			) {
				code.remove(start, end);
				continue;
			}
			leadingString = '';
			nextSeparatorString = '';
			if (
				node.id instanceof Identifier &&
				isReassignedExportsMember(
					(node.id as IdentifierWithVariable).variable,
					options.exportNamesByVariable
				)
			) {
				if (hasRenderedContent) {
					separatorString += ';';
				}
				isInDeclaration = false;
			} else {
				if (options.format === 'system' && node.init !== null) {
					if (node.id.type !== NodeType.Identifier) {
						node.id.addExportedVariables(systemPatternExports, options.exportNamesByVariable);
					} else {
						const exportNames = options.exportNamesByVariable.get(node.id.variable!);
						if (exportNames) {
							const _ = options.compact ? '' : ' ';
							const operatorPos = findFirstOccurrenceOutsideComment(
								code.original,
								'=',
								node.id.end
							);
							code.prependLeft(
								findNonWhiteSpace(code.original, operatorPos + 1),
								exportNames.length === 1
									? `exports('${exportNames[0]}',${_}`
									: getSystemExportFunctionLeft([node.id.variable!], false, options)
							);
							nextSeparatorString += ')';
						}
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
			lastSeparatorPos = separator!;
			separatorString = nextSeparatorString;
		}
		if (hasRenderedContent) {
			this.renderDeclarationEnd(
				code,
				separatorString,
				lastSeparatorPos,
				actualContentEnd!,
				renderedContentEnd,
				!isNoStatement,
				systemPatternExports,
				options
			);
		} else {
			code.remove(start, end);
		}
	}
}
