import MagicString from 'magic-string';
import ExternalModule from '../../ExternalModule';
import Module from '../../Module';
import { GetInterop, NormalizedOutputOptions } from '../../rollup/types';
import { PluginDriver } from '../../utils/PluginDriver';
import {
	getDefaultOnlyHelper,
	namespaceInteropHelpersByInteropType
} from '../../utils/interopHelpers';
import { findFirstOccurrenceOutsideComment, RenderOptions } from '../../utils/renderHelpers';
import { InclusionContext } from '../ExecutionContext';
import ChildScope from '../scopes/ChildScope';
import NamespaceVariable from '../variables/NamespaceVariable';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

interface DynamicImportMechanism {
	left: string;
	right: string;
}

export default class ImportExpression extends NodeBase {
	inlineNamespace: NamespaceVariable | null = null;
	declare source: ExpressionNode;
	declare type: NodeType.tImportExpression;

	private mechanism: DynamicImportMechanism | null = null;
	private resolution: Module | ExternalModule | string | null = null;

	hasEffects(): boolean {
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren): void {
		if (!this.included) {
			this.included = true;
			this.context.includeDynamicImport(this);
			this.scope.addAccessedDynamicImport(this);
		}
		this.source.include(context, includeChildrenRecursively);
	}

	initialise(): void {
		this.context.addDynamicImport(this);
	}

	render(code: MagicString, options: RenderOptions): void {
		if (this.inlineNamespace) {
			const _ = options.compact ? '' : ' ';
			const s = options.compact ? '' : ';';
			code.overwrite(
				this.start,
				this.end,
				`Promise.resolve().then(function${_}()${_}{${_}return ${this.inlineNamespace.getName()}${s}${_}})`,
				{ contentOnly: true }
			);
			return;
		}

		if (this.mechanism) {
			code.overwrite(
				this.start,
				findFirstOccurrenceOutsideComment(code.original, '(', this.start + 6) + 1,
				this.mechanism.left,
				{ contentOnly: true }
			);
			code.overwrite(this.end - 1, this.end, this.mechanism.right, { contentOnly: true });
		}
		this.source.render(code, options);
	}

	renderFinalResolution(
		code: MagicString,
		resolution: string,
		namespaceExportName: string | false | undefined,
		options: NormalizedOutputOptions
	): void {
		code.overwrite(this.source.start, this.source.end, resolution);
		if (namespaceExportName) {
			const _ = options.compact ? '' : ' ';
			const s = options.compact ? '' : ';';
			code.prependLeft(
				this.end,
				`.then(function${_}(n)${_}{${_}return n.${namespaceExportName}${s}${_}})`
			);
		}
	}

	setExternalResolution(
		exportMode: 'none' | 'named' | 'default' | 'external',
		resolution: Module | ExternalModule | string | null,
		options: NormalizedOutputOptions,
		pluginDriver: PluginDriver,
		accessedGlobalsByScope: Map<ChildScope, Set<string>>
	): void {
		this.resolution = resolution;
		const accessedGlobals = [...(accessedImportGlobals[options.format] || [])];
		let helper: string | null;
		({ helper, mechanism: this.mechanism } = this.getDynamicImportMechanismAndHelper(
			resolution,
			exportMode,
			options,
			pluginDriver
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
		options: NormalizedOutputOptions,
		pluginDriver: PluginDriver
	): { helper: string | null; mechanism: DynamicImportMechanism | null } {
		const mechanism = pluginDriver.hookFirstSync('renderDynamicImport', [
			{
				customResolution: typeof this.resolution === 'string' ? this.resolution : null,
				format: options.format,
				moduleId: this.context.module.id,
				targetModuleId:
					this.resolution && typeof this.resolution !== 'string' ? this.resolution.id : null
			}
		]);
		if (mechanism) {
			return { helper: null, mechanism };
		}
		switch (options.format) {
			case 'cjs': {
				const _ = options.compact ? '' : ' ';
				const s = options.compact ? '' : ';';
				const leftStart = `Promise.resolve().then(function${_}()${_}{${_}return`;
				const helper = getInteropHelper(resolution, exportMode, options.interop);
				return {
					helper,
					mechanism: helper
						? {
								left: `${leftStart} /*#__PURE__*/${helper}(require(`,
								right: `))${s}${_}})`
						  }
						: {
								left: `${leftStart} require(`,
								right: `)${s}${_}})`
						  }
				};
			}
			case 'amd': {
				const _ = options.compact ? '' : ' ';
				const resolve = options.compact ? 'c' : 'resolve';
				const reject = options.compact ? 'e' : 'reject';
				const helper = getInteropHelper(resolution, exportMode, options.interop);
				const resolveNamespace = helper
					? `function${_}(m)${_}{${_}${resolve}(/*#__PURE__*/${helper}(m));${_}}`
					: resolve;
				return {
					helper,
					mechanism: {
						left: `new Promise(function${_}(${resolve},${_}${reject})${_}{${_}require([`,
						right: `],${_}${resolveNamespace},${_}${reject})${_}})`
					}
				};
			}
			case 'system':
				return {
					helper: null,
					mechanism: {
						left: 'module.import(',
						right: ')'
					}
				};
			case 'es':
				if (options.dynamicImportFunction) {
					return {
						helper: null,
						mechanism: {
							left: `${options.dynamicImportFunction}(`,
							right: ')'
						}
					};
				}
		}
		return { helper: null, mechanism: null };
	}
}

function getInteropHelper(
	resolution: Module | ExternalModule | string | null,
	exportMode: 'none' | 'named' | 'default' | 'external',
	interop: GetInterop
): string | null {
	return exportMode === 'external'
		? namespaceInteropHelpersByInteropType[
				String(interop(resolution instanceof ExternalModule ? resolution.id : null))
		  ]
		: exportMode === 'default'
		? getDefaultOnlyHelper()
		: null;
}

const accessedImportGlobals: Record<string, string[]> = {
	amd: ['require'],
	cjs: ['require'],
	system: ['module']
};
