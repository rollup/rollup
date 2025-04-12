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
import { EMPTY_ARRAY } from '../../utils/blank';
import type { GenerateCodeSnippets } from '../../utils/generateCodeSnippets';
import {
	INTEROP_NAMESPACE_DEFAULT_ONLY_VARIABLE,
	namespaceInteropHelpersByInteropType
} from '../../utils/interopHelpers';
import type { PluginDriver } from '../../utils/PluginDriver';
import { findFirstOccurrenceOutsideComment, type RenderOptions } from '../../utils/renderHelpers';
import type { InclusionContext } from '../ExecutionContext';
import type ChildScope from '../scopes/ChildScope';
import type { ObjectPath } from '../utils/PathTracker';
import { UnknownKey } from '../utils/PathTracker';
import type NamespaceVariable from '../variables/NamespaceVariable';
import ArrowFunctionExpression from './ArrowFunctionExpression';
import AwaitExpression from './AwaitExpression';
import CallExpression from './CallExpression';
import ExpressionStatement from './ExpressionStatement';
import FunctionExpression from './FunctionExpression';
import Identifier from './Identifier';
import MemberExpression from './MemberExpression';
import type * as NodeType from './NodeType';
import ObjectPattern from './ObjectPattern';
import { Flag, isFlagSet, setFlag } from './shared/BitFlags';
import {
	doNotDeoptimize,
	type ExpressionNode,
	type GenericEsTreeNode,
	type IncludeChildren,
	NodeBase
} from './shared/Node';
import VariableDeclarator from './VariableDeclarator';

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

	private hasUnknownAccessedKey = false;
	private accessedPropKey = new Set<string>();
	private attributes: string | null | true = null;
	private mechanism: DynamicImportMechanism | null = null;
	private namespaceExportName: string | false | undefined = undefined;
	private resolution: Module | ExternalModule | string | null = null;
	private resolutionString: string | null = null;

	get withinTopLevelAwait() {
		return isFlagSet(this.flags, Flag.withinTopLevelAwait);
	}

	set withinTopLevelAwait(value: boolean) {
		this.flags = setFlag(this.flags, Flag.withinTopLevelAwait, value);
	}

	// Do not bind attributes
	bind(): void {
		this.source.bind();
	}

	/**
	 * Get imported variables for deterministic usage, valid cases are:
	 *
	 * 1. `const { foo } = await import('bar')`.
	 * 2. `(await import('bar')).foo`
	 * 3. `import('bar').then((m) => m.foo)`
	 * 4. `import('bar').then(({ foo }) => {})`
	 *
	 * Returns empty array if it's side-effect only import.
	 * Returns undefined if it's not fully deterministic.
	 */
	getDeterministicImportedNames(): readonly string[] | undefined {
		const parent1 = this.parent;

		// Side-effect only: import('bar')
		if (parent1 instanceof ExpressionStatement) {
			return EMPTY_ARRAY;
		}

		if (parent1 instanceof AwaitExpression) {
			const parent2 = parent1.parent;

			// Side-effect only: await import('bar')
			if (parent2 instanceof ExpressionStatement) {
				return EMPTY_ARRAY;
			}

			// Case 1: const { foo } / module = await import('bar')
			if (parent2 instanceof VariableDeclarator) {
				const declaration = parent2.id;
				if (declaration instanceof Identifier) {
					return this.hasUnknownAccessedKey ? undefined : [...this.accessedPropKey];
				}
				if (declaration instanceof ObjectPattern) {
					return getDeterministicObjectDestructure(declaration);
				}
			}

			// Case 2: (await import('bar')).foo
			if (parent2 instanceof MemberExpression) {
				const id = parent2.property;
				if (!parent2.computed && id instanceof Identifier) {
					return [id.name];
				}
			}

			return;
		}

		if (parent1 instanceof MemberExpression) {
			const callExpression = parent1.parent;
			const property = parent1.property;

			if (!(callExpression instanceof CallExpression) || !(property instanceof Identifier)) {
				return;
			}

			const memberName = property.name;

			// side-effect only, when only chaining .catch or .finally
			if (
				callExpression.parent instanceof ExpressionStatement &&
				['catch', 'finally'].includes(memberName)
			) {
				return EMPTY_ARRAY;
			}

			if (memberName !== 'then') return;

			// Side-effect only: import('bar').then()
			if (callExpression.arguments.length === 0) {
				return EMPTY_ARRAY;
			}

			const thenCallback = callExpression.arguments[0];

			if (
				callExpression.arguments.length !== 1 ||
				!(
					thenCallback instanceof ArrowFunctionExpression ||
					thenCallback instanceof FunctionExpression
				)
			) {
				return;
			}

			// Side-effect only: import('bar').then(() => {})
			if (thenCallback.params.length === 0) {
				return EMPTY_ARRAY;
			}

			if (thenCallback.params.length === 1) {
				// Promises .then() can only have one argument so only look at first one
				const declaration = thenCallback.params[0];

				// Case 3: import('bar').then(m => m.foo)
				if (declaration instanceof Identifier) {
					const starName = declaration.name;
					const memberExpression = thenCallback.body;
					if (
						!(memberExpression instanceof MemberExpression) ||
						memberExpression.computed ||
						!(memberExpression.property instanceof Identifier)
					) {
						return;
					}

					const returnVariable = memberExpression.object;
					if (!(returnVariable instanceof Identifier) || returnVariable.name !== starName) {
						return;
					}

					return [memberExpression.property.name];
				}

				// Case 4: import('bar').then(({ foo }) => {})
				if (declaration instanceof ObjectPattern) {
					return getDeterministicObjectDestructure(declaration);
				}
			}

			return;
		}
	}

	hasEffects(): boolean {
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) this.includeNode(context);
		this.source.include(context, includeChildrenRecursively);
	}

	includeNode(context: InclusionContext) {
		this.included = true;
		this.withinTopLevelAwait = context.withinTopLevelAwait;
		this.scope.context.includeDynamicImport(this);
		this.scope.addAccessedDynamicImport(this);
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		if (!this.included) this.includeNode(context);
		// Technically, this is not correct as dynamic imports return a Promise.
		if (this.hasUnknownAccessedKey) return;
		if (path[0] === UnknownKey) {
			this.hasUnknownAccessedKey = true;
		} else if (typeof path[0] === 'string') {
			this.accessedPropKey.add(path[0]);
		}
		// Update included paths
		this.scope.context.includeDynamicImport(this);
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
		resolution: Module | ExternalModule | string | null,
		options: NormalizedOutputOptions,
		snippets: GenerateCodeSnippets,
		pluginDriver: PluginDriver,
		accessedGlobalsByScope: Map<ChildScope, Set<string>>,
		resolutionString: string,
		namespaceExportName: string | false | undefined,
		attributes: string | null | true,
		ownChunk: Chunk,
		targetChunk: Chunk | null
	): void {
		const { format } = options;
		this.inlineNamespace = null;
		this.resolution = resolution;
		this.resolutionString = resolutionString;
		this.namespaceExportName = namespaceExportName;
		this.attributes = attributes;
		const accessedGlobals = [...(accessedImportGlobals[format] || [])];
		let helper: string | null;
		({ helper, mechanism: this.mechanism } = this.getDynamicImportMechanismAndHelper(
			resolution,
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
		resolution: Module | ExternalModule | string | null,
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
		const mechanism = pluginDriver.hookFirstSync('renderDynamicImport', [
			{
				chunk: getChunkInfoWithPath(ownChunk),
				customResolution: typeof this.resolution === 'string' ? this.resolution : null,
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
				moduleId: this.scope.context.module.id,
				targetChunk: targetChunk ? getChunkInfoWithPath(targetChunk) : null,
				targetModuleId:
					this.resolution && typeof this.resolution !== 'string' ? this.resolution.id : null
			}
		]);
		if (mechanism) {
			return { helper: null, mechanism };
		}
		const hasDynamicTarget = !this.resolution || typeof this.resolution === 'string';
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

function getDeterministicObjectDestructure(objectPattern: ObjectPattern): string[] | undefined {
	const variables: string[] = [];

	for (const property of objectPattern.properties) {
		if (property.type === 'RestElement' || property.computed || property.key.type !== 'Identifier')
			return;
		variables.push((property.key as Identifier).name);
	}

	return variables;
}
