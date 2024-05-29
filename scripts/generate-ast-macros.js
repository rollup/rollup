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
		for (const [fieldName, fieldType] of fields) {
			fieldConverters += `
    // ${fieldName}`;
			switch (fieldType) {
				case 'FixedString': {
					valuesInput += `, ${fieldName} => $${fieldName}_value:expr`;
					fieldConverters += `
    let ${fieldName}_position = end_position + ${reservedBytes};
    $self.buffer[${fieldName}_position..${fieldName}_position + ${BYTES_PER_U32}].copy_from_slice($${fieldName}_value);`;
					break;
				}
				case 'Float': {
					valuesInput += `, ${fieldName} => $${fieldName}_value:expr`;
					fieldConverters += `
    let ${fieldName}_position = end_position + ${reservedBytes};
    $self.buffer[${fieldName}_position..${fieldName}_position + ${2 * BYTES_PER_U32}].copy_from_slice(&$${fieldName}_value.to_le_bytes());`;
					reservedBytes += BYTES_PER_U32;
					break;
				}
				case 'Node': {
					valuesInput += `, ${fieldName} => [$${fieldName}_value:expr, $${fieldName}_converter:ident]`;
					fieldConverters += `
    $self.update_reference_position(end_position + ${reservedBytes});
    $self.$${fieldName}_converter(&$${fieldName}_value);`;
					break;
				}
				case 'NodeList': {
					valuesInput += `, ${fieldName} => [$${fieldName}_value:expr, $${fieldName}_converter:ident]`;
					fieldConverters += `
    $self.convert_item_list(
      &$${fieldName}_value,
			end_position + ${reservedBytes},
			|ast_converter, node| {
			  ast_converter.$${fieldName}_converter(node);
			  true
			}
		);`;
					break;
				}
				case 'OptionalNode': {
					valuesInput += `, ${fieldName} => [$${fieldName}_value:expr, $${fieldName}_converter:ident]`;
					fieldConverters += `
    if let Some(value) = $${fieldName}_value.as_ref() {
      $self.update_reference_position(end_position + ${reservedBytes});
      $self.$${fieldName}_converter(value);
    }`;
					break;
				}
				case 'OptionalString': {
					valuesInput += `, ${fieldName} => $${fieldName}_value:expr`;
					fieldConverters += `
    if let Some(value) = $${fieldName}_value.as_ref() {
      $self.convert_string(value, end_position + ${reservedBytes});
    }`;
					break;
				}
				case 'String': {
					valuesInput += `, ${fieldName} => $${fieldName}_value:expr`;
					fieldConverters += `
    $self.convert_string($${fieldName}_value, end_position + ${reservedBytes});`;
					break;
				}
				default: {
					throw new Error(`Unhandled field type ${fieldType}`);
				}
			}
			reservedBytes += BYTES_PER_U32;
		}
		return `#[macro_export]
macro_rules! store_${toSnakeCase(name)} {
  ($self:expr, span => $span:expr${valuesInput}) => {
    let _: &mut AstConverter = $self;
    let end_position = $self.add_type_and_start(
      &${nodeIndex}u32.to_ne_bytes(),
      &$span,
      ${reservedBytes},
      false,
    );${flagConverter}${fieldConverters}
    // end
    $self.add_end(end_position, &$span);
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
