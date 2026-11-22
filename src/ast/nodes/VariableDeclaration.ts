import type MagicString from 'magic-string';
import { BLANK } from '../../utils/blank';
import { isDeclaredWithoutBinding } from '../../utils/reassignedExportsMember';
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
import { treeshakeNode } from '../../utils/treeshakeNode';
import type { InclusionContext } from '../ExecutionContext';
import { markTopLevelAwait } from '../utils/markTopLevelAwait';
import { EMPTY_PATH } from '../utils/PathTracker';
import type Variable from '../variables/Variable';
import ArrayPattern from './ArrayPattern';
import Identifier, { type IdentifierWithVariable } from './Identifier';
import * as NodeType from './NodeType';
import ObjectPattern from './ObjectPattern';
import type { InclusionOptions } from './shared/Expression';
import {
	doNotDeoptimize,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize
} from './shared/Node';
import type { VariableDeclarationKind } from './shared/VariableKinds';
import type VariableDeclarator from './VariableDeclarator';

export default class VariableDeclaration extends NodeBase {
	declare declarations: readonly VariableDeclarator[];
	declare kind: VariableDeclarationKind;
	declare type: NodeType.tVariableDeclaration;

	addExportedVariables(
		variables: readonly Variable[],
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): void {
		// Only `var` is hoisted to the surrounding scope, so only those bindings can
		// be the exported ones. `let` and `const` in a loop head are new bindings.
		if (this.kind !== 'var') return;
		for (const declarator of this.declarations) {
			declarator.id.addExportedVariables(variables, exportNamesByVariable);
		}
	}

	deoptimizePath(): void {
		for (const declarator of this.declarations) {
			declarator.deoptimizePath(EMPTY_PATH);
		}
	}

	hasEffectsOnInteractionAtPath(): boolean {
		return false;
	}

	include(
		context: InclusionContext,
		includeChildrenRecursively: IncludeChildren,
		{ asSingleStatement }: InclusionOptions = BLANK
	): void {
		this.included = true;
		for (const declarator of this.declarations) {
			if (includeChildrenRecursively || declarator.shouldBeIncluded(context)) {
				declarator.include(context, includeChildrenRecursively);
			}
			const { id, init } = declarator;
			if (asSingleStatement) {
				id.include(context, includeChildrenRecursively);
			}
			if (
				init &&
				id.included &&
				!init.included &&
				(id instanceof ObjectPattern || id instanceof ArrayPattern)
			) {
				init.include(context, includeChildrenRecursively);
			}
		}
	}

	initialise(): void {
		super.initialise();
		if (this.kind === 'await using') markTopLevelAwait(this);
		for (const declarator of this.declarations) {
			declarator.declareDeclarator(this.kind);
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
		// A `var` declaration can be the body of a for-in/of loop. Only the
		// left-hand side is a loop head. Rewriting that head as a statement
		// inserts a semicolon and turns `for (var name of ...)` into invalid code.
		// Exported `var` bindings are updated from the loop body instead.
		if (this.isForInOfHead()) {
			this.renderForInOfHead(code, options);
			return;
		}
		if (this.areAllDeclarationsIncludedAndNotExported(options.exportNamesByVariable)) {
			for (const declarator of this.declarations) {
				declarator.render(code, options);
			}
			if (
				!nodeRenderOptions.isNoStatement &&
				code.original.charCodeAt(this.end - 1) !== 59 /*";"*/
			) {
				code.appendLeft(this.end, ';');
			}
		} else if (this.isInSingleStatementPosition()) {
			this.renderSingleStatementDeclaration(
				code,
				options,
				nodeRenderOptions.isNoStatement === true
			);
		} else {
			this.renderReplacedDeclarations(code, options, nodeRenderOptions.isNoStatement === true);
		}
	}

	private isForInOfHead(): boolean {
		const parent = this.parent;
		return (
			(parent.type === NodeType.ForOfStatement || parent.type === NodeType.ForInStatement) &&
			(parent as { left?: unknown }).left === this
		);
	}

	isInSingleStatementPosition(): boolean {
		const { type } = this.parent;
		return !(
			type === NodeType.Program ||
			type === NodeType.BlockStatement ||
			type === NodeType.StaticBlock ||
			type === NodeType.SwitchCase ||
			type === NodeType.ExportNamedDeclaration
		);
	}

	private renderForInOfHead(code: MagicString, options: RenderOptions): void {
		const declarator = this.declarations[0];
		if (
			declarator.id instanceof Identifier &&
			isDeclaredWithoutBinding(declarator.id.variable!, options.exportNamesByVariable)
		) {
			// `for (var name of xs)` declares `name`, but a reassigned export is
			// rendered as `exports.name`, and a catch parameter shadowing one must
			// stay an assignment. Keeping `var`, or synthesizing `= void 0` because
			// the declarator has no initializer, is a syntax error.
			code.remove(this.start, declarator.id.start);
			declarator.id.render(code, options);
			return;
		}
		for (const eachDeclarator of this.declarations) {
			eachDeclarator.render(code, options);
		}
	}

	private renderDeclarationEnd(
		code: MagicString,
		separatorString: string,
		lastSeparatorPos: number | null,
		actualContentEnd: number,
		renderedContentEnd: number,
		systemPatternExports: readonly Variable[],
		options: RenderOptions,
		omitTrailingSemicolon: boolean
	): void {
		if (code.original.charCodeAt(this.end - 1) === 59 /*";"*/) {
			code.remove(this.end - 1, this.end);
		}
		// A for-loop initializer is not a statement. The separator after it
		// belongs to the for statement, so another semicolon makes the head invalid.
		if (!omitTrailingSemicolon) {
			separatorString += ';';
		}
		if (lastSeparatorPos === null) {
			if (separatorString) {
				code.appendLeft(renderedContentEnd, separatorString);
			}
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

	private renderReplacedDeclarations(
		code: MagicString,
		options: RenderOptions,
		omitTrailingSemicolon: boolean
	): void {
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
		const { exportNamesByVariable } = options;
		for (const { node, start, separator, contentEnd, end } of separatedNodes) {
			if (!node.included) {
				treeshakeNode(node, code, start, end);
				continue;
			}
			node.render(code, options);
			leadingString = '';
			nextSeparatorString = '';
			const rendersAsAssignment =
				!node.id.included ||
				(node.id instanceof Identifier &&
					isDeclaredWithoutBinding(
						(node.id as IdentifierWithVariable).variable,
						exportNamesByVariable
					));
			if (rendersAsAssignment) {
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
			options,
			omitTrailingSemicolon
		);
	}

	private renderSingleStatementDeclaration(
		code: MagicString,
		options: RenderOptions,
		omitTrailingSemicolon: boolean
	): void {
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
		let hasRenderedContent = false;
		let lastRenderedContentEnd = renderedContentEnd;
		let separatorString = '';
		const trailingSystemExports: Variable[] = [];
		const {
			exportNamesByVariable,
			snippets: { _, getPropertyAccess }
		} = options;
		for (const { node, start, separator, contentEnd, end } of separatedNodes) {
			if (!node.included) {
				treeshakeNode(node, code, start, end);
				continue;
			}
			node.render(code, options);
			if (options.format === 'system') {
				this.renderSingleStatementSystemExports(
					node,
					separator,
					contentEnd,
					code,
					options,
					trailingSystemExports
				);
			}
			let leadingString = '';
			const rendersAsAssignment =
				node.id instanceof Identifier &&
				isDeclaredWithoutBinding(node.id.variable!, exportNamesByVariable);
			if (hasRenderedContent) {
				separatorString = ',';
			} else if (!rendersAsAssignment) {
				leadingString = `${this.kind} `;
			}
			if (renderedContentEnd === lastSeparatorPos + 1) {
				code.overwrite(lastSeparatorPos, renderedContentEnd, separatorString + leadingString);
			} else {
				code.overwrite(lastSeparatorPos, lastSeparatorPos + 1, separatorString);
				code.appendLeft(renderedContentEnd, leadingString);
			}
			actualContentEnd = contentEnd;
			renderedContentEnd = end;
			lastRenderedContentEnd = separator === null ? contentEnd : separator;
			hasRenderedContent = true;
			lastSeparatorPos = separator!;
			separatorString = '';
		}
		if (trailingSystemExports.length > 0) {
			const name = trailingSystemExports[0].getName(getPropertyAccess);
			code.appendLeft(
				lastRenderedContentEnd,
				`,${_}${name}${_}=${_}(${getSystemExportStatement(
					trailingSystemExports,
					options
				)},${_}${name})`
			);
		}
		this.renderDeclarationEnd(
			code,
			separatorString,
			lastSeparatorPos,
			actualContentEnd!,
			renderedContentEnd,
			[],
			options,
			omitTrailingSemicolon
		);
	}

	private renderSingleStatementSystemExports(
		node: VariableDeclarator,
		separator: number | null,
		contentEnd: number,
		code: MagicString,
		options: RenderOptions,
		trailingSystemExports: Variable[]
	): void {
		const { exportNamesByVariable } = options;
		if (node.id instanceof Identifier) {
			const variable = node.id.variable!;
			const exportNames = exportNamesByVariable.get(variable);
			if (!node.init || !exportNames) return;
			if (exportNames.length === 1) {
				const operatorPos = findFirstOccurrenceOutsideComment(code.original, '=', node.id.end);
				renderSystemExportExpression(
					variable,
					findNonWhiteSpace(code.original, operatorPos + 1),
					separator === null ? contentEnd : separator,
					code,
					options
				);
			} else {
				trailingSystemExports.push(variable);
			}
		} else {
			node.id.addExportedVariables(trailingSystemExports, exportNamesByVariable);
		}
	}

	private areAllDeclarationsIncludedAndNotExported(
		exportNamesByVariable: ReadonlyMap<Variable, readonly string[]>
	): boolean {
		if (this.kind === 'await using' || this.kind === 'using') {
			return true;
		}
		for (const declarator of this.declarations) {
			if (!declarator.id.included) return false;
			if (declarator.id.type === NodeType.Identifier) {
				if (
					exportNamesByVariable.has(declarator.id.variable!) ||
					isDeclaredWithoutBinding(declarator.id.variable!, exportNamesByVariable)
				) {
					return false;
				}
			} else {
				const exportedVariables: Variable[] = [];
				declarator.id.addExportedVariables(exportedVariables, exportNamesByVariable);
				if (exportedVariables.length > 0) return false;
			}
		}
		return true;
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

VariableDeclaration.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
VariableDeclaration.prototype.applyDeoptimizations = doNotDeoptimize;
