import MagicString from 'magic-string';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	NodeRenderOptions,
	RenderOptions
} from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import { treeshakeNode } from '../../utils/treeshakeNode';
import { InclusionContext } from '../ExecutionContext';
import ModuleScope from '../scopes/ModuleScope';
import ExportDefaultVariable from '../variables/ExportDefaultVariable';
import ClassDeclaration from './ClassDeclaration';
import FunctionDeclaration from './FunctionDeclaration';
import Identifier from './Identifier';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

// The header ends at the first non-white-space after "default"
function getDeclarationStart(code: string, start: number) {
	return findNonWhiteSpace(code, findFirstOccurrenceOutsideComment(code, 'default', start) + 7);
}

function getIdInsertPosition(
	code: string,
	declarationKeyword: string,
	endMarker: string,
	start: number
) {
	const declarationEnd =
		findFirstOccurrenceOutsideComment(code, declarationKeyword, start) + declarationKeyword.length;
	code = code.slice(
		declarationEnd,
		findFirstOccurrenceOutsideComment(code, endMarker, declarationEnd)
	);
	const generatorStarPos = findFirstOccurrenceOutsideComment(code, '*');
	if (generatorStarPos === -1) {
		return declarationEnd;
	}
	return declarationEnd + generatorStarPos + 1;
}

export default class ExportDefaultDeclaration extends NodeBase {
	declare declaration: FunctionDeclaration | ClassDeclaration | ExpressionNode;
	declare needsBoundaries: true;
	declare scope: ModuleScope;
	declare type: NodeType.tExportDefaultDeclaration;
	declare variable: ExportDefaultVariable;

	private declare declarationName: string | undefined;

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		super.include(context, includeChildrenRecursively);
		if (includeChildrenRecursively) {
			this.context.includeVariableInModule(this.variable);
		}
	}

	initialise(): void {
		const declaration = this.declaration as FunctionDeclaration | ClassDeclaration;
		this.declarationName =
			(declaration.id && declaration.id.name) || (this.declaration as Identifier).name;
		this.variable = this.scope.addExportDefaultDeclaration(
			this.declarationName || this.context.getModuleName(),
			this,
			this.context
		);
		this.context.addExport(this);
	}

	render(code: MagicString, options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void {
		const { start, end } = nodeRenderOptions as { end: number; start: number };
		const declarationStart = getDeclarationStart(code.original, this.start);

		if (this.declaration instanceof FunctionDeclaration) {
			this.renderNamedDeclaration(
				code,
				declarationStart,
				'function',
				'(',
				this.declaration.id === null,
				options
			);
		} else if (this.declaration instanceof ClassDeclaration) {
			this.renderNamedDeclaration(
				code,
				declarationStart,
				'class',
				'{',
				this.declaration.id === null,
				options
			);
		} else if (this.variable.getOriginalVariable() !== this.variable) {
			// Remove altogether to prevent re-declaring the same variable
			treeshakeNode(this, code, start, end);
			return;
		} else if (this.variable.included) {
			this.renderVariableDeclaration(code, declarationStart, options);
		} else {
			code.remove(this.start, declarationStart);
			this.declaration.render(code, options, {
				renderedSurroundingElement: NodeType.ExpressionStatement
			});
			if (code.original[this.end - 1] !== ';') {
				code.appendLeft(this.end, ';');
			}
			return;
		}
		this.declaration.render(code, options);
	}

	private renderNamedDeclaration(
		code: MagicString,
		declarationStart: number,
		declarationKeyword: string,
		endMarker: string,
		needsId: boolean,
		options: RenderOptions
	) {
		const name = this.variable.getName();
		// Remove `export default`
		code.remove(this.start, declarationStart);

		if (needsId) {
			code.appendLeft(
				getIdInsertPosition(code.original, declarationKeyword, endMarker, declarationStart),
				` ${name}`
			);
		}
		if (
			options.format === 'system' &&
			this.declaration instanceof ClassDeclaration &&
			options.exportNamesByVariable.has(this.variable)
		) {
			code.appendLeft(this.end, ` ${getSystemExportStatement([this.variable], options)};`);
		}
	}

	private renderVariableDeclaration(
		code: MagicString,
		declarationStart: number,
		options: RenderOptions
	) {
		const hasTrailingSemicolon = code.original.charCodeAt(this.end - 1) === 59; /*";"*/
		const systemExportNames =
			options.format === 'system' && options.exportNamesByVariable.get(this.variable);

		if (systemExportNames) {
			code.overwrite(
				this.start,
				declarationStart,
				`${options.varOrConst} ${this.variable.getName()} = exports('${systemExportNames[0]}', `
			);
			code.appendRight(
				hasTrailingSemicolon ? this.end - 1 : this.end,
				')' + (hasTrailingSemicolon ? '' : ';')
			);
		} else {
			code.overwrite(
				this.start,
				declarationStart,
				`${options.varOrConst} ${this.variable.getName()} = `
			);
			if (!hasTrailingSemicolon) {
				code.appendLeft(this.end, ';');
			}
		}
	}
}

ExportDefaultDeclaration.prototype.needsBoundaries = true;
