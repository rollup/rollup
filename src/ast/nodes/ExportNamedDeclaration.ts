import { NodeBase } from './shared/Node';
import ExecutionPathOptions from '../ExecutionPathOptions';
import Literal from './Literal';
import MagicString from 'magic-string';
import ExportSpecifier from './ExportSpecifier';
import FunctionDeclaration from './FunctionDeclaration';
import ClassDeclaration from './ClassDeclaration';
import VariableDeclaration from './VariableDeclaration';
import { NodeType } from './index';
import { RenderOptions } from '../../rollup';

export default class ExportNamedDeclaration extends NodeBase {
	type: NodeType.ExportNamedDeclaration;
	declaration: FunctionDeclaration | ClassDeclaration | VariableDeclaration | null;
	specifiers: ExportSpecifier[];
	source: Literal<string> | null;

	isExportDeclaration: true;

	bindChildren () {
		// Do not bind specifiers
		if (this.declaration) this.declaration.bind();
	}

	hasEffects (options: ExecutionPathOptions) {
		return this.declaration && this.declaration.hasEffects(options);
	}

	initialiseNode () {
		this.isExportDeclaration = true;
	}

	includeInBundle () {
		let addedNewNodes = !this.included;
		this.included = true;
		this.specifiers.forEach(node => {
			if (node.shouldBeIncluded()) {
				if (node.includeInBundle()) {
					addedNewNodes = true;
				}
			}
		});
		if (this.declaration && this.declaration.shouldBeIncluded()) {
			if (this.declaration.includeInBundle()) {
				addedNewNodes = true;
			}
		}
		if (this.source) {
			if (this.source.includeInBundle()) {
				addedNewNodes = true;
			}
		}
		return addedNewNodes;
	}

	render (code: MagicString, es: boolean, options: RenderOptions) {
		const removeAll = () => {
			const start = this.leadingCommentStart || this.start;
			const end = this.next || this.end;
			code.remove(start, end);
		}
		if (options.preserveModules && this.included) {
			if (this.included) {
				for (let i = 0; i < this.specifiers.length; i++) {
					const specifier = this.specifiers[i];
					specifier.render(code, es, options);
					if (!specifier.included) {
						if (i === this.specifiers.length - 1) {
							code.remove(this.specifiers[i - 1].end, specifier.start);
						} else {
							code.remove(specifier.end, this.specifiers[i + 1].start);
						}
					}
				}
				if (this.declaration) {
					this.declaration.render(code, es, options);
				}
			} else {
				removeAll();
			}
		} else {
			if (this.declaration) {
				code.remove(this.start, this.declaration.start);
				this.declaration.render(code, es, options);
			} else {
				removeAll();
			}
		}
	}
}
