import { writeFile } from 'node:fs/promises';
import { astNodeNamesWithFieldOrder } from './ast-types.ts';
import { NODE_DATA_BYTES_AFTER_END, WORD_SIZE } from './buffer-layout.ts';
import { generateNotEditFilesComment, lintRustFile, toSnakeCase } from './helpers.ts';

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const astMacrosFile = new URL(
	'../rust/parse_ast/src/convert_ast/converter/ast_macros.rs',
	import.meta.url
);

const astMacros = astNodeNamesWithFieldOrder
	.map(({ name, fields, node: { flags, useMacro } }, nodeIndex) => {
		if (useMacro === false) {
			return '';
		}
		let reservedBytes = NODE_DATA_BYTES_AFTER_END;
		let valuesInput = '';
		let flagConverter = '';
		if (flags?.length) {
			reservedBytes += WORD_SIZE;
			let flagsInput = '';
			for (const flag of flags) {
				valuesInput += `, ${flag} => $${flag}_value:expr`;
				flagsInput += `, ${flag} => $${flag}_value`;
			}
			flagConverter = `
    // flags
    store_${toSnakeCase(name)}_flags!($self, end_position${flagsInput});`;
		}
		let fieldConverters = '';
		for (const field of fields) {
			fieldConverters += `
    // ${field.name}`;
			switch (field.type) {
				case 'FixedString': {
					valuesInput += `, ${field.name} => $${field.name}_value:expr`;
					fieldConverters += `
    let ${field.name}_position = end_position + ${reservedBytes};
    $self.buffer[${field.name}_position..${field.name}_position + ${WORD_SIZE}].copy_from_slice($${field.name}_value);`;
					break;
				}
				case 'Float': {
					valuesInput += `, ${field.name} => $${field.name}_value:expr`;
					fieldConverters += `
    let ${field.name}_position = end_position + ${reservedBytes};
    let ${field.name}_bits = $${field.name}_value.to_bits();
    // The two u32 words are written in native byte order, low word first
    $self.buffer[${field.name}_position..${field.name}_position + ${WORD_SIZE}]
      .copy_from_slice(&(${field.name}_bits as u32).to_ne_bytes());
    $self.buffer[${field.name}_position + ${WORD_SIZE}..${field.name}_position + ${2 * WORD_SIZE}]
      .copy_from_slice(&((${field.name}_bits >> 32) as u32).to_ne_bytes());`;
					reservedBytes += WORD_SIZE;
					break;
				}
				case 'Node': {
					valuesInput += `, ${field.name} => [$${field.name}_value:expr, $${field.name}_converter:ident]`;
					fieldConverters += field.allowNull
						? `
    if let Some(value) = $${field.name}_value.as_ref() {
      $self.update_reference_position(end_position + ${reservedBytes});
      $self.$${field.name}_converter(value);
    }`
						: `
    $self.update_reference_position(end_position + ${reservedBytes});
    $self.$${field.name}_converter(&$${field.name}_value);`;
					break;
				}
				case 'NodeList': {
					valuesInput += `, ${field.name} => [$${field.name}_value:expr, $${field.name}_converter:ident]`;
					fieldConverters += `
    $self.convert_item_list(
      &$${field.name}_value,
			end_position + ${reservedBytes},
			|ast_converter, node| {
			  ast_converter.$${field.name}_converter(node);
			  true
			}
		);`;
					break;
				}
				case 'String': {
					valuesInput += `, ${field.name} => $${field.name}_value:expr`;
					fieldConverters += field.optional
						? `
    if let Some(value) = $${field.name}_value.as_ref() {
      $self.convert_string(value, end_position + ${reservedBytes});
    }`
						: `
    $self.convert_string($${field.name}_value, end_position + ${reservedBytes});`;
					break;
				}
				case 'ScopeOffset': {
					break;
				}
				default: {
					throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
				}
			}
			reservedBytes += WORD_SIZE;
		}
		return `#[macro_export]
macro_rules! store_${toSnakeCase(name)} {
  ($self:expr, span => $span:expr${valuesInput}) => {
    let _: &mut AstConverter = $self;
    let walk_entry = $self.on_node_enter::<${nodeIndex}>();
    let end_position = $self.add_type_and_start(
      &${nodeIndex}u32.to_ne_bytes(),
      &$span,
      ${reservedBytes},
      false,
    );${flagConverter}${fieldConverters}
    // end
    $self.add_end(end_position, &$span);
    $self.on_node_exit(walk_entry);
  };
}

`;
	})
	.join('');

const flagMacros = astNodeNamesWithFieldOrder
	.map(({ name, originalNode: { flags, hasSameFieldsAs } }) => {
		if (hasSameFieldsAs || !flags?.length) {
			return '';
		}
		const valuesInput = flags.map(flag => `${flag} => $${flag}_value:expr`).join(', ');
		const setFlags = flags
			.map((flag, index) => `if $${flag}_value { flags |= ${1 << index}; }`)
			.join('\n');
		return `#[macro_export]
macro_rules! store_${toSnakeCase(name)}_flags {
  ($self:expr, $end_position:expr, ${valuesInput}) => {
    let _: &mut AstConverter = $self;
    let _: usize = $end_position;
    let mut flags = 0u32;
    ${setFlags}
    let flags_position = $end_position + ${NODE_DATA_BYTES_AFTER_END};
    $self.buffer[flags_position..flags_position + ${WORD_SIZE}].copy_from_slice(&flags.to_ne_bytes());
  };
}

`;
	})
	.join('');

const astConstants = `${notEditFilesComment}
${astMacros}
${flagMacros}`;

await writeFile(astMacrosFile, astConstants);
await lintRustFile(astMacrosFile);
