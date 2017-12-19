import relativeId from '../../utils/relativeId';
import Node from '../Node';
import { UNKNOWN_KEY } from '../variables/VariableReassignmentTracker';

const validProp = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

class Keypath {
	constructor (node) {
		this.parts = [];

		while (node.type === 'MemberExpression') {
			const prop = node.property;

			if (node.computed) {
				if (
					prop.type !== 'Literal' ||
					typeof prop.value !== 'string' ||
					!validProp.test(prop.value)
				) {
					this.computed = true;
					return;
				}
			}

			this.parts.unshift(prop);
			node = node.object;
		}

		this.root = node;
	}
}

export default class MemberExpression extends Node {
	object: Node;

	bind () {
		// if this resolves to a namespaced declaration, prepare
		// to replace it
		// TODO this code is a bit inefficient
		this._bound = true;
		const keypath = new Keypath(this);

		if (!keypath.computed && keypath.root.type === 'Identifier') {
			let variable = this.scope.findVariable(keypath.root.name);

			while (variable.isNamespace && keypath.parts.length) {
				const exporterId = variable.module.id;

				const part = keypath.parts[0];
				variable = variable.module.traceExport(part.name || part.value);

				if (!variable) {
					this.module.warn(
						{
							code: 'MISSING_EXPORT',
							missing: part.name || part.value,
							importer: relativeId(this.module.id),
							exporter: relativeId(exporterId),
							message: `'${part.name ||
								part.value}' is not exported by '${relativeId(exporterId)}'`,
							url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
						},
						part.start
					);
					this.replacement = 'undefined';
					return;
				}

				keypath.parts.shift();
			}

			if (keypath.parts.length) {
				super.bind();
				return; // not a namespaced declaration
			}

			this.variable = variable;

			if (variable.isExternal) {
				variable.module.suggestName(keypath.root.name);
			}
		} else {
			super.bind();
		}
	}

	reassignPath (path, options) {
		if (!this._bound) this.bind();
		if (this.variable) {
			this.variable.reassignPath(path, options);
		} else {
			this.object.reassignPath([this._getPathSegment(), ...path], options);
		}
	}

	forEachReturnExpressionWhenCalledAtPath (
		path,
		callOptions,
		callback,
		options
	) {
		if (!this._bound) this.bind();
		if (this.variable) {
			this.variable.forEachReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				callback,
				options
			);
		} else {
			this.object.forEachReturnExpressionWhenCalledAtPath(
				[this._getPathSegment(), ...path],
				callOptions,
				callback,
				options
			);
		}
	}

	hasEffects (options) {
		return (
			super.hasEffects(options) ||
			(this._checkPropertyReadSideEffects &&
				this.object.hasEffectsWhenAccessedAtPath(
					[this._getPathSegment()],
					options
				))
		);
	}

	hasEffectsWhenAccessedAtPath (path, options) {
		if (path.length === 0) {
			return false;
		}
		if (this.variable) {
			return this.variable.hasEffectsWhenAccessedAtPath(path, options);
		}
		return this.object.hasEffectsWhenAccessedAtPath(
			[this._getPathSegment(), ...path],
			options
		);
	}

	hasEffectsWhenAssignedAtPath (path, options) {
		if (this.variable) {
			return this.variable.hasEffectsWhenAssignedAtPath(path, options);
		}
		return this.object.hasEffectsWhenAssignedAtPath(
			[this._getPathSegment(), ...path],
			options
		);
	}

	hasEffectsWhenCalledAtPath (path, callOptions, options) {
		if (this.variable) {
			return this.variable.hasEffectsWhenCalledAtPath(
				path,
				callOptions,
				options
			);
		}
		return (
			this._getPathSegment() === UNKNOWN_KEY ||
			this.object.hasEffectsWhenCalledAtPath(
				[this._getPathSegment(), ...path],
				callOptions,
				options
			)
		);
	}

	includeInBundle () {
		let addedNewNodes = super.includeInBundle();
		if (this.variable && !this.variable.included) {
			this.variable.includeVariable();
			addedNewNodes = true;
		}
		return addedNewNodes;
	}

	initialiseNode () {
		this._checkPropertyReadSideEffects =
			this.module.bundle.treeshake &&
			this.module.bundle.treeshakingOptions.propertyReadSideEffects;
	}

	render (code, es) {
		if (this.variable) {
			const name = this.variable.getName(es);
			if (name !== this.name)
				code.overwrite(this.start, this.end, name, {
					storeName: true,
					contentOnly: false
				});
		} else if (this.replacement) {
			code.overwrite(this.start, this.end, this.replacement, {
				storeName: true,
				contentOnly: false
			});
		}

		super.render(code, es);
	}

	someReturnExpressionWhenCalledAtPath (
		path,
		callOptions,
		predicateFunction,
		options
	) {
		if (this.variable) {
			return this.variable.someReturnExpressionWhenCalledAtPath(
				path,
				callOptions,
				predicateFunction,
				options
			);
		}
		return (
			this._getPathSegment() === UNKNOWN_KEY ||
			this.object.someReturnExpressionWhenCalledAtPath(
				[this._getPathSegment(), ...path],
				callOptions,
				predicateFunction,
				options
			)
		);
	}

	_getPathSegment () {
		if (this.computed) {
			return this.property.type === 'Literal'
				? String(this.property.value)
				: UNKNOWN_KEY;
		}
		return this.property.name;
	}
}
