import { writeFile } from 'node:fs/promises';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { generateNotEditFilesComment, lintRustFile, toSnakeCase } from './helpers.js';

const BYTES_PER_U32 = 4;

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
		let reservedBytes = BYTES_PER_U32;
		let valuesInput = '';
		let flagConverter = '';
		if (flags?.length) {
			reservedBytes += BYTES_PER_U32;
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
    $self.buffer[${field.name}_position..${field.name}_position + ${BYTES_PER_U32}].copy_from_slice($${field.name}_value);`;
					break;
				}
				case 'Float': {
					valuesInput += `, ${field.name} => $${field.name}_value:expr`;
					fieldConverters += `
    let ${field.name}_position = end_position + ${reservedBytes};
    $self.buffer[${field.name}_position..${field.name}_position + ${2 * BYTES_PER_U32}].copy_from_slice(&$${field.name}_value.to_le_bytes());`;
					reservedBytes += BYTES_PER_U32;
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
				default: {
					throw new Error(`Unhandled field type ${(field as { type: string }).type}`);
				}
			}
			reservedBytes += BYTES_PER_U32;
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
    let flags_position = $end_position + ${BYTES_PER_U32};
    $self.buffer[flags_position..flags_position + ${BYTES_PER_U32}].copy_from_slice(&flags.to_ne_bytes());
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
