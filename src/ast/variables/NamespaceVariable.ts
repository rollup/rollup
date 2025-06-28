import type { AstContext, default as Module } from '../../Module';
import {
	escapeExportName,
	isNamespaceExportName,
	unescapeExportName
} from '../../utils/exportNames';
import { stringifyObjectKeyIfNeeded } from '../../utils/identifierHelpers';
import { getToStringTagValue, MERGE_NAMESPACES_VARIABLE } from '../../utils/interopHelpers';
import type { RenderOptions } from '../../utils/renderHelpers';
import { getSystemExportStatement } from '../../utils/systemJsRendering';
import type { HasEffectsContext, InclusionContext } from '../ExecutionContext';
import type { NodeInteraction } from '../NodeInteractions';
import { INTERACTION_ASSIGNED, INTERACTION_CALLED } from '../NodeInteractions';
import type { LiteralValueOrUnknown } from '../nodes/shared/Expression';
import { deoptimizeInteraction, UnknownValue } from '../nodes/shared/Expression';
import type IdentifierBase from '../nodes/shared/IdentifierBase';
import type { NodeBase } from '../nodes/shared/Node';
import type ChildScope from '../scopes/ChildScope';
import type { EntityPathTracker, ObjectPath } from '../utils/PathTracker';
import { SymbolToStringTag, UNKNOWN_PATH } from '../utils/PathTracker';
import ExportDefaultVariable from './ExportDefaultVariable';
import Variable from './Variable';

export default class NamespaceVariable extends Variable {
	readonly context: AstContext;
	declare isNamespace: true;
	readonly module: Module;

	private areAllMembersDeoptimized = false;
	private mergedNamespaces: readonly Variable[] = [];
	private nonExplicitNamespacesIncluded = false;
	private referencedEarly = false;
	private readonly references: IdentifierBase<any>[] = [];

	constructor(context: AstContext) {
		super(context.getModuleName());
		this.context = context;
		this.module = context.module;
	}

	addReference(identifier: IdentifierBase<any>): void {
		this.references.push(identifier);
		this.name = identifier.name;
		this.markReferencedFrom(identifier);
	}

	addUsedPlace(usedPlace: NodeBase): void {
		super.addUsedPlace(usedPlace);
		// This also covers accesses like `otherNamespace.namespace` that are
		// resolved to this variable without an identifier reference
		this.markReferencedFrom(usedPlace);
	}

	deoptimizeArgumentsOnInteractionAtPath(
		interaction: NodeInteraction,
		path: ObjectPath,
		recursionTracker: EntityPathTracker
	) {
		if (path.length > 1 || (path.length === 1 && interaction.type === INTERACTION_CALLED)) {
			const key = path[0];
			if (typeof key === 'string') {
				this.getMemberVariable(key)?.deoptimizeArgumentsOnInteractionAtPath(
					interaction,
					path.slice(1),
					recursionTracker
				);
			} else {
				deoptimizeInteraction(interaction);
			}
		}
	}

	deoptimizePath(path: ObjectPath) {
		if (path.length > 1) {
			const key = path[0];
			if (typeof key === 'string') {
				this.getMemberVariable(key)?.deoptimizePath(path.slice(1));
			} else if (!this.areAllMembersDeoptimized) {
				this.areAllMembersDeoptimized = true;
				for (const variable of this.module.getExportedVariablesByName().values()) {
					variable.deoptimizePath(UNKNOWN_PATH);
				}
			}
		}
	}

	getLiteralValueAtPath(path: ObjectPath): LiteralValueOrUnknown {
		if (path[0] === SymbolToStringTag) {
			return 'Module';
		}
		return UnknownValue;
	}

	hasEffectsOnInteractionAtPath(
		path: ObjectPath,
		interaction: NodeInteraction,
		context: HasEffectsContext
	): boolean {
		const { type } = interaction;
		if (path.length === 0) {
			// This can only be a call anyway
			return true;
		}
		if (path.length === 1 && type !== INTERACTION_CALLED) {
			return type === INTERACTION_ASSIGNED;
		}
		const key = path[0];
		if (typeof key !== 'string') {
			return true;
		}
		const memberVariable = this.getMemberVariable(key);
		return (
			!memberVariable ||
			memberVariable.hasEffectsOnInteractionAtPath(path.slice(1), interaction, context)
		);
	}

	includePath(path: ObjectPath, context: InclusionContext): void {
		super.includePath(path, context);
		this.includeMemberPath(path, context);
	}

	includeMemberPath(path: ObjectPath, context: InclusionContext): void {
		if (path.length > 0) {
			const [name, ...remainingPath] = path;
			if (typeof name === 'string') {
				const variable = this.getMemberVariable(name);
				if (variable) {
					this.context.includeVariableInModule(variable, remainingPath, context);
				} else {
					this.includeNonExplicitNamespaces();
				}
			} else if (name) {
				this.module.includeAllExports();
				this.includeNonExplicitNamespaces();
			}
		}
	}

	prepare(accessedGlobalsByScope: Map<ChildScope, Set<string>>): void {
		if (this.mergedNamespaces.length > 0) {
			this.module.scope.addAccessedGlobals([MERGE_NAMESPACES_VARIABLE], accessedGlobalsByScope);
		}
	}

	renderBlock(options: RenderOptions, isHoisted: boolean): string {
		const {
			exportNamesByVariable,
			format,
			freeze,
			indent: t,
			symbols,
			snippets: { _, cnst, getObject, getPropertyAccess, n, s }
		} = options;
		const memberVariables = this.module.getExportedVariablesByName();
		const members: [key: string | null, value: string][] = [...memberVariables.entries()]
			.filter(([name, variable]) => !isNamespaceExportName(name) && variable.included)
			.map(([name, variable]) => {
				const key = unescapeExportName(name);
				if (
					isHoisted ||
					variable.isReassigned ||
					variable === this ||
					(variable.module &&
						!variable.module.info.isExternal &&
						variable.module.execIndex > this.module.execIndex)
				) {
					return [
						null,
						`get ${stringifyObjectKeyIfNeeded(key)}${_}()${_}{${_}return ${variable.getName(
							getPropertyAccess
						)}${s}${_}}`
					];
				}

				return [key, variable.getName(getPropertyAccess)];
			});
		members.unshift([null, `__proto__:${_}null`]);

		let output = getObject(members, { lineBreakIndent: { base: '', t } });
		if (this.mergedNamespaces.length > 0) {
			const assignmentArguments = this.mergedNamespaces.map(variable =>
				variable.getName(getPropertyAccess)
			);
			output = `/*#__PURE__*/${MERGE_NAMESPACES_VARIABLE}(${output},${_}[${assignmentArguments.join(
				`,${_}`
			)}])`;
		} else {
			// The helper to merge namespaces will also take care of freezing and toStringTag
			if (symbols) {
				output = `/*#__PURE__*/Object.defineProperty(${output},${_}Symbol.toStringTag,${_}${getToStringTagValue(
					getObject
				)})`;
			}
			if (freeze) {
				output = `/*#__PURE__*/Object.freeze(${output})`;
			}
		}

		const name = this.getName(getPropertyAccess);
		output = `${cnst} ${name}${_}=${_}${output};`;

		if (format === 'system' && exportNamesByVariable.has(this)) {
			output += `${n}${getSystemExportStatement([this], options)};`;
		}

		return output;
	}

	getIncludedMemberNamespaces(): NamespaceVariable[] {
		const memberNamespaces: NamespaceVariable[] = [];
		for (const variable of this.module.getExportedVariablesByName().values()) {
			if (!variable.included) continue;
			const namespace =
				variable instanceof ExportDefaultVariable
					? variable.getOriginalNamespaceVariable()
					: variable;
			if (namespace instanceof NamespaceVariable && namespace !== this) {
				memberNamespaces.push(namespace);
			}
		}
		return memberNamespaces;
	}

	getMergedNamespaces(): readonly Variable[] {
		return this.mergedNamespaces;
	}

	/**
	 * Whether code that runs before the end of this module can access the
	 * namespace object. The chunk decides if it can actually be created early.
	 */
	isReferencedEarly(): boolean {
		return this.referencedEarly;
	}

	setMergedNamespaces(mergedNamespaces: readonly Variable[]): void {
		this.mergedNamespaces = mergedNamespaces;
	}

	private getMemberVariable(name: string): Variable | undefined {
		return this.module.getExportedVariablesByName().get(escapeExportName(name));
	}

	private markReferencedFrom(node: NodeBase): void {
		// Module execution order is known once references are bound
		if (node.scope.context.getModuleExecIndex() <= this.context.getModuleExecIndex()) {
			this.referencedEarly = true;
		}
	}

	private includeNonExplicitNamespaces(): void {
		if (!this.nonExplicitNamespacesIncluded) {
			this.nonExplicitNamespacesIncluded = true;
			this.setMergedNamespaces(this.module.includeAndGetAdditionalMergedNamespaces());
		}
	}
}

NamespaceVariable.prototype.isNamespace = true;

// This is a proxy that does not include the namespace object when a path is included
export const getDynamicNamespaceVariable = (namespace: NamespaceVariable): NamespaceVariable =>
	Object.create(namespace, {
		includePath: {
			value(path: ObjectPath, context: InclusionContext): void {
				namespace.includeMemberPath(path, context);
			}
		}
	});
