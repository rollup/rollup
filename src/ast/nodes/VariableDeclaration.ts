import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { isReassignedExportsMember } from '../../utils/reassignedExportsMember';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	getCommaSeparatedNodesWithBoundaries,
	type NodeRenderOptions,
	type RenderOptions
} from '../../utils/renderHelpers';
import {
	getSystemExportStatement,
	renderSystemExportExpression
} from '../../utils/systemJsRendering';
import type { InclusionContext } from '../ExecutionContext';
import type { ObjectPath } from '../utils/PathTracker';
import { EMPTY_PATH } from '../utils/PathTracker';
import type Variable from '../variables/Variable';
import ArrayPattern from './ArrayPattern';
import Identifier, { type IdentifierWithVariable } from './Identifier';
import * as NodeType from './NodeType';
import ObjectPattern from './ObjectPattern';
import type VariableDeclarator from './VariableDeclarator';
import type { InclusionOptions } from './shared/Expression';
import { type IncludeChildren, NodeBase } from './shared/Node';
import type { VariableDeclarationKind } from './shared/VariableKinds';

function areAllDeclarationsIncludedAndNotExported(
	declarations: readonly VariableDeclarator[],
	exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
): boolean {
	for (const declarator of declarations) {
		if (!declarator.id.included) return false;
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
	declare declarations: readonly VariableDeclarator[];
	declare kind: VariableDeclarationKind;
	declare type: NodeType.tVariableDeclaration;
	declare isUsingDeclaration: boolean;

	deoptimizePath(): void {
		for (const declarator of this.declarations) {
			declarator.deoptimizePath(EMPTY_PATH);
		}
	}

	hasEffectsOnInteractionAtPath(): boolean {
		return false;
	}

	includePath(
		path: ObjectPath,
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		{ asSingleStatement }: InclusionOptions = BLANK
	): void {
		this.included = true;
		for (const declarator of this.declarations) {
			if (includeChildrenRecursively || declarator.shouldBeIncluded(context))
				declarator.includePath(path, context, includeChildrenRecursively);
			const { id, init } = declarator;
			if (asSingleStatement) {
				id.includePath(path, context, includeChildrenRecursively);
			}
			if (
				init &&
				id.included &&
				!init.included &&
				(id instanceof ObjectPattern || id instanceof ArrayPattern)
			) {
				init.includePath(path, context, includeChildrenRecursively);
			}
		}
	}

	initialise(): void {
		super.initialise();
		this.isUsingDeclaration = this.kind === 'await using' || this.kind === 'using';
		for (const declarator of this.declarations) {
			declarator.declareDeclarator(this.kind, this.isUsingDeclaration);
		}
	}

	removeAnnotations(code: MagicString) {
		this.declarations[0].removeAnnotations(code);
	}

	render(
		code: MagicString,
		options: RenderOptions,
		nodeRenderOptions: NodeRenderOptions = BLANK
	): void {
		if (
			this.isUsingDeclaration ||
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
			this.renderReplacedDeclarations(code, options);
		}
	}

	protected applyDeoptimizations() {}

	private renderDeclarationEnd(
		code: MagicString,
		separatorString: string,
		lastSeparatorPos: number | null,
		actualContentEnd: number,
		renderedContentEnd: number,
		systemPatternExports: readonly Variable[],
		options: RenderOptions
	): void {
		if (code.original.charCodeAt(this.end - 1) === 59 /*";"*/) {
			code.remove(this.end - 1, this.end);
		}
		separatorString += ';';
		if (lastSeparatorPos === null) {
			code.appendLeft(renderedContentEnd, separatorString);
		} else {
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
		}
		if (systemPatternExports.length > 0) {
			code.appendLeft(
				renderedContentEnd,
				` ${getSystemExportStatement(systemPatternExports, options)};`
			);
		}
	}

	private renderReplacedDeclarations(code: MagicString, options: RenderOptions): void {
		const separatedNodes = getCommaSeparatedNodesWithBoundaries(
			this.declarations,
			code,
			this.start + this.kind.length,
			this.end - (code.original.charCodeAt(this.end - 1) === 59 /*";"*/ ? 1 : 0)
		);
		let actualContentEnd: number | undefined, renderedContentEnd: number;
		renderedContentEnd = findNonWhiteSpace(code.original, this.start + this.kind.length);
		let lastSeparatorPos = renderedContentEnd - 1;
		code.remove(this.start, lastSeparatorPos);
		let isInDeclaration = false;
		let hasRenderedContent = false;
		let separatorString = '',
			leadingString,
			nextSeparatorString;
		const aggregatedSystemExports: Variable[] = [];
		const singleSystemExport = gatherSystemExportsAndGetSingleExport(
			separatedNodes,
			options,
			aggregatedSystemExports
		);
		for (const { node, start, separator, contentEnd, end } of separatedNodes) {
			if (!node.included) {
				code.remove(start, end);
				node.removeAnnotations(code);
				continue;
			}
			node.render(code, options);
			leadingString = '';
			nextSeparatorString = '';
			if (
				!node.id.included ||
				(node.id instanceof Identifier &&
					isReassignedExportsMember(
						(node.id as IdentifierWithVariable).variable,
						options.exportNamesByVariable
					))
			) {
				if (hasRenderedContent) {
					separatorString += ';';
				}
				isInDeclaration = false;
			} else {
				if (singleSystemExport && singleSystemExport === node.id.variable) {
					const operatorPos = findFirstOccurrenceOutsideComment(code.original, '=', node.id.end);
					renderSystemExportExpression(
						singleSystemExport,
						findNonWhiteSpace(code.original, operatorPos + 1),
						separator === null ? contentEnd : separator,
						code,
						options
					);
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
			actualContentEnd = contentEnd;
			renderedContentEnd = end;
			hasRenderedContent = true;
			lastSeparatorPos = separator!;
			separatorString = nextSeparatorString;
		}
		this.renderDeclarationEnd(
			code,
			separatorString,
			lastSeparatorPos,
			actualContentEnd!,
			renderedContentEnd,
			aggregatedSystemExports,
			options
		);
	}
}

function gatherSystemExportsAndGetSingleExport(
	separatedNodes: readonly {
		node: VariableDeclarator;
	}[],
	options: RenderOptions,
	aggregatedSystemExports: Variable[]
): Variable | null {
	let singleSystemExport: Variable | null = null;
	if (options.format === 'system') {
		for (const { node } of separatedNodes) {
			if (
				node.id instanceof Identifier &&
				node.init &&
				aggregatedSystemExports.length === 0 &&
				options.exportNamesByVariable.get(node.id.variable!)?.length === 1
			) {
				singleSystemExport = node.id.variable!;
				aggregatedSystemExports.push(singleSystemExport);
			} else {
				node.id.addExportedVariables(aggregatedSystemExports, options.exportNamesByVariable);
			}
		}
		if (aggregatedSystemExports.length > 1) {
			singleSystemExport = null;
		} else if (singleSystemExport) {
			aggregatedSystemExports.length = 0;
		}
	}
	return singleSystemExport;
}
