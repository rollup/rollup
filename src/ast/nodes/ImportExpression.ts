import type MagicString from 'magic-string';
import type Chunk from '../../Chunk';
import ExternalChunk from '../../ExternalChunk';
import ExternalModule from '../../ExternalModule';
import type Module from '../../Module';
import type {
	AstNode,
	DynamicImportTargetChunk,
	GetInterop,
	NormalizedOutputOptions,
	PreRenderedChunkWithFileName
} from '../../rollup/types';
import type { GenerateCodeSnippets } from '../../utils/generateCodeSnippets';
import {
	INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE,
	namespaceInteropHelpersByInteropType
} from '../../utils/interopHelpers';
import type { PluginDriver } from '../../utils/PluginDriver';
import { findFirstOccurrenceOutsideComment, type RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import type ChildScope from '../scopes/ChildScope';
import {
	isArrowFunctionExpressionNode,
	isAwaitExpressionNode,
	isCallExpressionNode,
	isExpressionStatementNode,
	isFunctionExpressionNode,
	isIdentifierNode,
	isMemberExpressionNode
} from '../utils/identifyNode';
import type { ObjectPath } from '../utils/PathTracker';
import { UNKNOWN_PATH } from '../utils/PathTracker';
import type NamespaceVariable from '../variables/NamespaceVariable';
import { getDynamicNamespaceVariable } from '../variables/NamespaceVariable';
import { EmptyPromiseHandler, ObjectPromiseHandler } from '../variables/PromiseHandler';
import type CallExpression from './CallExpression';
import type * as NodeType from './NodeType';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import {
	doNotDeoptimize,
	type ExpressionNode,
	type GenericEsTreeNode,
	type IncludeChildren,
	NodeBase
} from './shared/Node';

interface DynamicImportMechanism {
	left: string;
	right: string;
}

function getChunkInfoWithPath(chunk: Chunk): PreRenderedChunkWithFileName {
	return { fileName: chunk.getFileName(), ...chunk.getPreRenderedChunkInfo() };
}

export default class ImportExpression extends NodeBase {
	declare options: ExpressionNode | null;
	inlineNamespace: NamespaceVariable | null = null;
	declare source: ExpressionNode;
	declare type: NodeType.tImportExpression;
	declare sourceAstNode: AstNode;
	resolution: Module | ExternalModule | string | null = null;

	private attributes: string | null | true = null;
	private mechanism: DynamicImportMechanism | null = null;
	private namespaceExportName: string | false | undefined = undefined;
	private localResolution:
		| null
		| { resolution: Module; tracked: false }
		| { resolution: Module; tracked: true } = null;
	private resolutionString: string | null = null;

	get shouldIncludeDynamicAttributes() {
		return isFlagSet(this.flags, Flag.shouldIncludeDynamicAttributes);
	}

	set shouldIncludeDynamicAttributes(value: boolean) {
		this.flags = setFlag(this.flags, Flag.shouldIncludeDynamicAttributes, value);
	}

	bind(): void {
		const { options, parent, resolution, source } = this;
		source.bind();
		options?.bind();
		// Check if we resolved to a Module without using instanceof
		if (typeof resolution !== 'object' || !resolution || !('namespace' in resolution)) {
			return;
		}
		// In these cases, we can track exactly what is included or deoptimized:
		// * import('foo'); // as statement
		// * await import('foo') // use as awaited expression in any way
		// * import('foo').then(n => {...}) // only if .then is called directly on the import()
		if (isExpressionStatementNode(parent) || isAwaitExpressionNode(parent)) {
			this.localResolution = { resolution, tracked: true };
			return;
		}
		if (!isMemberExpressionNode(parent)) {
			this.localResolution = { resolution, tracked: false };
			return;
		}
		let currentParent = parent;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		let callExpression: ImportExpression | CallExpression = this;
		while (true) {
			if (
				currentParent.computed ||
				currentParent.object !== callExpression ||
				!isIdentifierNode(currentParent.property) ||
				!isCallExpressionNode(currentParent.parent)
			) {
				break;
			}
			const propertyName = currentParent.property.name;
			callExpression = currentParent.parent;
			if (propertyName === 'then') {
				const firstArgument = callExpression.arguments[0];
				if (
					firstArgument === undefined ||
					isFunctionExpressionNode(firstArgument) ||
					isArrowFunctionExpressionNode(firstArgument)
				) {
					currentParent.promiseHandler = new ObjectPromiseHandler(
						getDynamicNamespaceVariable(resolution.namespace)
					);
					this.localResolution = { resolution, tracked: true };
					return;
				}
			} else if (propertyName === 'catch' || propertyName === 'finally') {
				if (isMemberExpressionNode(callExpression.parent)) {
					currentParent.promiseHandler = new EmptyPromiseHandler();
					currentParent = callExpression.parent;
					continue;
				}
				if (isExpressionStatementNode(callExpression.parent)) {
					currentParent.promiseHandler = new EmptyPromiseHandler();
					this.localResolution = { resolution, tracked: true };
					return;
				}
			}
			break;
		}
		this.localResolution = { resolution, tracked: false };
	}

	deoptimizePath(path: ObjectPath): void {
		this.localResolution?.resolution?.namespace.deoptimizePath(path);
	}

	hasEffects(): boolean {
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		this.source.include(context, includeChildrenRecursively);
		if (this.shouldIncludeDynamicAttributes) {
			this.options?.include(context, includeChildrenRecursively);
		}
		if (includeChildrenRecursively) {
			this.localResolution?.resolution.includeAllExports();
		}
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		const { localResolution, scope, shouldIncludeDynamicAttributes } = this;
		if (shouldIncludeDynamicAttributes) {
			this.options?.includePath(UNKNOWN_PATH, context);
		}
		scope.context.includeDynamicImport(this);
		scope.addAccessedDynamicImport(this);
		if (localResolution) {
			if (localResolution.tracked) {
				localResolution.resolution.includeModuleInExecution();
			} else {
				localResolution.resolution.includeAllExports();
			}
		}
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		if (!this.included) this.includeNode(context);
		this.localResolution?.resolution?.namespace.includeMemberPath(path, context);
	}

	initialise(): void {
		super.initialise();
		this.scope.context.addDynamicImport(this);
	}

	parseNode(esTreeNode: GenericEsTreeNode): this {
		this.sourceAstNode = esTreeNode.source;
		return super.parseNode(esTreeNode);
	}

	render(code: MagicString, options: RenderOptions): void {
		const {
			snippets: { _, getDirectReturnFunction, getObject, getPropertyAccess },
			importAttributesKey
		} = options;
		if (this.inlineNamespace) {
			const [left, right] = getDirectReturnFunction([], {
				functionReturn: true,
				lineBreakIndent: null,
				name: null
			});
			code.overwrite(
				this.start,
				this.end,
				`Promise.resolve().then(${left}${this.inlineNamespace.getName(getPropertyAccess)}${right})`
			);
			return;
		}
		if (this.mechanism) {
			code.overwrite(
				this.start,
				findFirstOccurrenceOutsideComment(code.original, '(', this.start + 6) + 1,
				this.mechanism.left
			);
			code.overwrite(this.end - 1, this.end, this.mechanism.right);
		}
		if (this.resolutionString) {
			code.overwrite(this.source.start, this.source.end, this.resolutionString);
			if (this.namespaceExportName) {
				const [left, right] = getDirectReturnFunction(['n'], {
					functionReturn: true,
					lineBreakIndent: null,
					name: null
				});
				code.prependLeft(this.end, `.then(${left}n.${this.namespaceExportName}${right})`);
			}
		} else {
			this.source.render(code, options);
		}
		if (this.attributes !== true) {
			if (this.options) {
				code.overwrite(this.source.end, this.end - 1, '', { contentOnly: true });
			}
			if (this.attributes) {
				code.appendLeft(
					this.end - 1,
					`,${_}${getObject([[importAttributesKey, this.attributes]], {
						lineBreakIndent: null
					})}`
				);
			}
		}
	}

	setExternalResolution(
		exportMode: 'none' | 'named' | 'default' | 'external',
		options: NormalizedOutputOptions,
		snippets: GenerateCodeSnippets,
		pluginDriver: PluginDriver,
		accessedGlobalsByScope: Map<ChildScope, Set<string>>,
		resolutionString: string,
		namespaceExportName: string | false | undefined,
		attributes: string | true | null,
		ownChunk: Chunk,
		targetChunk: Chunk | null
	): void {
		const { format } = options;
		this.inlineNamespace = null;
		this.resolutionString = resolutionString;
		this.namespaceExportName = namespaceExportName;
		this.attributes = attributes;
		const accessedGlobals = [...(accessedImportGlobals[format] || [])];
		let helper: string | null;
		({ helper, mechanism: this.mechanism } = this.getDynamicImportMechanismAndHelper(
			exportMode,
			options,
			snippets,
			pluginDriver,
			ownChunk,
			targetChunk
		));
		if (helper) {
			accessedGlobals.push(helper);
		}
		if (accessedGlobals.length > 0) {
			this.scope.addAccessedGlobals(accessedGlobals, accessedGlobalsByScope);
		}
	}

	setInternalResolution(inlineNamespace: NamespaceVariable): void {
		this.inlineNamespace = inlineNamespace;
	}

	private getDynamicImportMechanismAndHelper(
		exportMode: 'none' | 'named' | 'default' | 'external',
		{
			compact,
			dynamicImportInCjs,
			format,
			generatedCode: { arrowFunctions },
			interop
		}: NormalizedOutputOptions,
		{ _, getDirectReturnFunction, getDirectReturnIifeLeft }: GenerateCodeSnippets,
		pluginDriver: PluginDriver,
		ownChunk: Chunk,
		targetChunk: Chunk | null
	): { helper: string | null; mechanism: DynamicImportMechanism | null } {
		const { resolution, scope } = this;
		const mechanism = pluginDriver.hookFirstSync('renderDynamicImport', [
			{
				chunk: getChunkInfoWithPath(ownChunk),
				customResolution: typeof resolution === 'string' ? resolution : null,
				format,
				getTargetChunkImports(): DynamicImportTargetChunk[] | null {
					if (targetChunk === null) return null;
					const chunkInfos: DynamicImportTargetChunk[] = [];
					const importerPath = ownChunk.getFileName();
					for (const dep of targetChunk.dependencies) {
						const resolvedImportPath = `'${dep.getImportPath(importerPath)}'`;
						if (dep instanceof ExternalChunk) {
							chunkInfos.push({
								fileName: dep.getFileName(),
								resolvedImportPath,
								type: 'external'
							});
						} else {
							chunkInfos.push({
								chunk: dep.getPreRenderedChunkInfo(),
								fileName: dep.getFileName(),
								resolvedImportPath,
								type: 'internal'
							});
						}
					}
					return chunkInfos;
				},
				moduleId: scope.context.module.id,
				targetChunk: targetChunk ? getChunkInfoWithPath(targetChunk) : null,
				targetModuleAttributes:
					resolution && typeof resolution !== 'string' ? resolution.info.attributes : {},
				targetModuleId: resolution && typeof resolution !== 'string' ? resolution.id : null
			}
		]);
		if (mechanism) {
			return { helper: null, mechanism };
		}
		const hasDynamicTarget = !resolution || typeof resolution === 'string';
		switch (format) {
			case 'cjs': {
				if (
					dynamicImportInCjs &&
					(!resolution || typeof resolution === 'string' || resolution instanceof ExternalModule)
				) {
					return { helper: null, mechanism: null };
				}
				const helper = getInteropHelper(resolution, exportMode, interop);
				let left = `require(`;
				let right = `)`;
				if (helper) {
					left = `/*#__PURE__*/${helper}(${left}`;
					right += ')';
				}
				const [functionLeft, functionRight] = getDirectReturnFunction([], {
					functionReturn: true,
					lineBreakIndent: null,
					name: null
				});
				left = `Promise.resolve().then(${functionLeft}${left}`;
				right += `${functionRight})`;
				if (!arrowFunctions && hasDynamicTarget) {
					left = getDirectReturnIifeLeft(['t'], `${left}t${right}`, {
						needsArrowReturnParens: false,
						needsWrappedFunction: true
					});
					right = ')';
				}
				return {
					helper,
					mechanism: { left, right }
				};
			}
			case 'amd': {
				const resolve = compact ? 'c' : 'resolve';
				const reject = compact ? 'e' : 'reject';
				const helper = getInteropHelper(resolution, exportMode, interop);
				const [resolveLeft, resolveRight] = getDirectReturnFunction(['m'], {
					functionReturn: false,
					lineBreakIndent: null,
					name: null
				});
				const resolveNamespace = helper
					? `${resolveLeft}${resolve}(/*#__PURE__*/${helper}(m))${resolveRight}`
					: resolve;
				const [handlerLeft, handlerRight] = getDirectReturnFunction([resolve, reject], {
					functionReturn: false,
					lineBreakIndent: null,
					name: null
				});
				let left = `new Promise(${handlerLeft}require([`;
				let right = `],${_}${resolveNamespace},${_}${reject})${handlerRight})`;
				if (!arrowFunctions && hasDynamicTarget) {
					left = getDirectReturnIifeLeft(['t'], `${left}t${right}`, {
						needsArrowReturnParens: false,
						needsWrappedFunction: true
					});
					right = ')';
				}
				return {
					helper,
					mechanism: { left, right }
				};
			}
			case 'system': {
				return {
					helper: null,
					mechanism: {
						left: 'module.import(',
						right: ')'
					}
				};
			}
		}
		return { helper: null, mechanism: null };
	}
}

ImportExpression.prototype.applyDeoptimizations = doNotDeoptimize;

function getInteropHelper(
	resolution: Module | ExternalModule | string | null,
	exportMode: 'none' | 'named' | 'default' | 'external',
	interop: GetInterop
): string | null {
	return exportMode === 'external'
		? namespaceInteropHelpersByInteropType[
				interop(resolution instanceof ExternalModule ? resolution.id : null)
			]
		: exportMode === 'default'
			? INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE
			: null;
}

const accessedImportGlobals: Record<string, string[]> = {
	amd: ['require'],
	cjs: ['require'],
	system: ['module']
};
