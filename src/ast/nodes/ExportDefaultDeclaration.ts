import type MagicString from 'magic-string';
import {
	findFirstOccurrenceOutsideComment,
	findNonWhiteSpace,
	type NodeRenderOptions,
	type RenderOptions
} from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import { treeshakeNode } from '../../utils/treeshakeNode';
import type { InclusionContext } from '../ExecutionContext';
import type ModuleScope from '../scopes/ModuleScope';
import type { ObjectPath } from '../utils/PathTracker';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import type ExportDefaultVariable from '../variables/ExportDefaultVariable';
import ClassDeclaration from './ClassDeclaration';
import FunctionDeclaration from './FunctionDeclaration';
import type Identifier from './Identifier';
import * as NodeType from './NodeType';
import {
	doNotDeoptimize,
	type ExpressionNode,
	type IncludeChildren,
	NodeBase,
	onlyIncludeSelfNoDeoptimize
} from './shared/Node';

// The header ends at the first non-white-space after "default"
function getDeclarationStart(code: string, start: number): number {
	return findNonWhiteSpace(code, findFirstOccurrenceOutsideComment(code, 'default', start) + 7);
}

function getFunctionIdInsertPosition(code: string, start: number): number {
	const declarationEnd =
		findFirstOccurrenceOutsideComment(code, 'function', start) + 'function'.length;
	code = code.slice(declarationEnd, findFirstOccurrenceOutsideComment(code, '(', declarationEnd));
	const generatorStarPos = findFirstOccurrenceOutsideComment(code, '*');
	if (generatorStarPos === -1) {
		return declarationEnd;
	}
	return declarationEnd + generatorStarPos + 1;
}

export default class ExportDefaultDeclaration extends NodeBase {
	declaration!: FunctionDeclaration | ClassDeclaration | ExpressionNode;
	needsBoundaries!: true;
	scope!: ModuleScope;
	type!: NodeType.tExportDefaultDeclaration;
	variable!: ExportDefaultVariable;

	private declarationName!: string | undefined;

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		this.included = true;
		this.declaration.include(context, includeChildrenRecursively);
		if (includeChildrenRecursively) {
			this.scope.context.includeVariableInModule(this.variable, UNKNOWN_PATH, context);
		}
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		this.included = true;
		this.declaration.includePath(path, context);
	}

	initialise(): void {
		super.initialise();
		const declaration = this.declaration as FunctionDeclaration | ClassDeclaration;
		this.declarationName =
			(declaration.id && declaration.id.name) || (this.declaration as Identifier).name;
		this.variable = this.scope.addExportDefaultDeclaration(
			this.declarationName || this.scope.context.getModuleName(),
			this,
			this.scope.context
		);
		this.scope.context.addExport(this);
	}

	removeAnnotations(code: MagicString) {
		this.declaration.removeAnnotations(code);
	}

	render(code: MagicString, options: RenderOptions, nodeRenderOptions?: NodeRenderOptions): void {
		const { start, end } = nodeRenderOptions as { end: number; start: number };
		const declarationStart = getDeclarationStart(code.original, this.start);

		if (this.declaration instanceof FunctionDeclaration) {
			this.renderNamedDeclaration(
				code,
				declarationStart,
				this.declaration.id === null
					? getFunctionIdInsertPosition(code.original, declarationStart)
					: null,
				options
			);
		} else if (this.declaration instanceof ClassDeclaration) {
			this.renderNamedDeclaration(
				code,
				declarationStart,
				this.declaration.id === null
					? findFirstOccurrenceOutsideComment(code.original, 'class', start) + 'class'.length
					: null,
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
		idInsertPosition: number | null,
		options: RenderOptions
	): void {
		const {
			exportNamesByVariable,
			format,
			snippets: { getPropertyAccess }
		} = options;
		const name = this.variable.getName(getPropertyAccess);
		// Remove `export default`
		code.remove(this.start, declarationStart);

		if (idInsertPosition !== null) {
			code.appendLeft(idInsertPosition, ` ${name}`);
		}
		if (
			format === 'system' &&
			this.declaration instanceof ClassDeclaration &&
			exportNamesByVariable.has(this.variable)
		) {
			code.appendLeft(this.end, ` ${getSystemExportStatement([this.variable], options)};`);
		}
	}

	private renderVariableDeclaration(
		code: MagicString,
		declarationStart: number,
		{ format, exportNamesByVariable, snippets: { cnst, getPropertyAccess } }: RenderOptions
	): void {
		const hasTrailingSemicolon = code.original.charCodeAt(this.end - 1) === 59; /*";"*/
		const systemExportNames = format === 'system' && exportNamesByVariable.get(this.variable);

		if (systemExportNames) {
			code.overwrite(
				this.start,
				declarationStart,
				`${cnst} ${this.variable.getName(getPropertyAccess)} = exports(${JSON.stringify(
					systemExportNames[0]
				)}, `
			);
			code.appendRight(
				hasTrailingSemicolon ? this.end - 1 : this.end,
				')' + (hasTrailingSemicolon ? '' : ';')
			);
		} else {
			code.overwrite(
				this.start,
				declarationStart,
				`${cnst} ${this.variable.getName(getPropertyAccess)} = `
			);
			if (!hasTrailingSemicolon) {
				code.appendLeft(this.end, ';');
			}
		}
	}
}

ExportDefaultDeclaration.prototype.needsBoundaries = true;
ExportDefaultDeclaration.prototype.includeNode = onlyIncludeSelfNoDeoptimize;
ExportDefaultDeclaration.prototype.applyDeoptimizations = doNotDeoptimize;
