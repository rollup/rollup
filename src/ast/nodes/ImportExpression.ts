import MagicString from 'magic-string';
import ExternalModule from '../../ExternalModule';
import Module from '../../Module';
import { NormalizedOutputOptions } from '../../rollup/types';
import { findFirstOccurrenceOutsideComment, RenderOptions } from '../../utils/renderHelpers';
import { INTEROP_NAMESPACE_VARIABLE } from '../../utils/variableNames';
import { InclusionContext } from '../ExecutionContext';
import NamespaceVariable from '../variables/NamespaceVariable';
import * as NodeType from './NodeType';
import { ExpressionNode, IncludeChildren, NodeBase } from './shared/Node';

interface DynamicImportMechanism {
	left: string;
	right: string;
}

export default class Import extends NodeBase {
	inlineNamespace: NamespaceVariable | null = null;
	source!: ExpressionNode;
	type!: NodeType.tImportExpression;

	private exportMode: 'none' | 'named' | 'default' | 'auto' = 'auto';
	private resolution: Module | ExternalModule | string | null = null;

	hasEffects(): boolean {
		return true;
	}

	include(context: InclusionContext, includeChildrenRecursively: IncludeChildren) {
		if (!this.included) {
			this.included = true;
			this.context.includeDynamicImport(this);
			this.scope.addAccessedDynamicImport(this);
		}
		this.source.include(context, includeChildrenRecursively);
	}

	initialise() {
		this.context.addDynamicImport(this);
	}

	render(code: MagicString, options: RenderOptions) {
		if (this.inlineNamespace) {
			const _ = options.compact ? '' : ' ';
			const s = options.compact ? '' : ';';
			code.overwrite(
				this.start,
				this.end,
				`Promise.resolve().then(function${_}()${_}{${_}return ${this.inlineNamespace.getName()}${s}${_}})`
			);
			return;
		}

		const importMechanism = this.getDynamicImportMechanism(options);
		if (importMechanism) {
			code.overwrite(
				this.start,
				findFirstOccurrenceOutsideComment(code.original, '(', this.start + 6) + 1,
				importMechanism.left
			);
			code.overwrite(this.end - 1, this.end, importMechanism.right);
		}
		this.source.render(code, options);
	}

	renderFinalResolution(
		code: MagicString,
		resolution: string,
		namespaceExportName: string | false | undefined,
		options: NormalizedOutputOptions
	) {
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
		exportMode: 'none' | 'named' | 'default' | 'auto',
		resolution: Module | ExternalModule | string | null
	): void {
		this.exportMode = exportMode;
		this.resolution = resolution;
		this.scope.addAccessedGlobalsByFormat({
			amd: ['require'],
			cjs: ['require'],
			system: ['module']
		});
		if (exportMode === 'auto') {
			this.scope.addAccessedGlobalsByFormat({
				amd: [INTEROP_NAMESPACE_VARIABLE],
				cjs: [INTEROP_NAMESPACE_VARIABLE]
			});
		}
	}

	setInternalResolution(inlineNamespace: NamespaceVariable) {
		this.inlineNamespace = inlineNamespace;
	}

	private getDynamicImportMechanism(options: RenderOptions): DynamicImportMechanism | null {
		const mechanism = options.outputPluginDriver.hookFirstSync('renderDynamicImport', [
			{
				customResolution: typeof this.resolution === 'string' ? this.resolution : null,
				format: options.format,
				moduleId: this.context.module.id,
				targetModuleId:
					this.resolution && typeof this.resolution !== 'string' ? this.resolution.id : null
			}
		]);
		if (mechanism) {
			return mechanism;
		}
		switch (options.format) {
			case 'cjs': {
				const _ = options.compact ? '' : ' ';
				const s = options.compact ? '' : ';';
				const leftStart = `Promise.resolve().then(function${_}()${_}{${_}return`;
				switch (this.exportMode) {
					case 'default':
						return {
							left: `${leftStart}${_}{${_}'default':${_}require(`,
							right: `)${_}}${s}${_}})`
						};
					case 'auto':
						return {
							left: `${leftStart} ${INTEROP_NAMESPACE_VARIABLE}(require(`,
							right: `))${s}${_}})`
						};
					default:
						return {
							left: `${leftStart} require(`,
							right: `)${s}${_}})`
						};
				}
			}
			case 'amd': {
				const _ = options.compact ? '' : ' ';
				const resolve = options.compact ? 'c' : 'resolve';
				const reject = options.compact ? 'e' : 'reject';
				const resolveNamespace =
					this.exportMode === 'default'
						? `function${_}(m)${_}{${_}${resolve}({${_}'default':${_}m${_}});${_}}`
						: this.exportMode === 'auto'
						? `function${_}(m)${_}{${_}${resolve}(${INTEROP_NAMESPACE_VARIABLE}(m));${_}}`
						: resolve;
				return {
					left: `new Promise(function${_}(${resolve},${_}${reject})${_}{${_}require([`,
					right: `],${_}${resolveNamespace},${_}${reject})${_}})`
				};
			}
			case 'system':
				return {
					left: 'module.import(',
					right: ')'
				};
			case 'es':
				if (options.dynamicImportFunction) {
					return {
						left: `${options.dynamicImportFunction}(`,
						right: ')'
					};
				}
		}
		return null;
	}
}
