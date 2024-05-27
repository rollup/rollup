import { writeFile } from 'node:fs/promises';
import { astNodeNamesWithFieldOrder } from './ast-types.js';
import { generateNotEditFilesComment, lintRustFile, toSnakeCase } from './helpers.js';

const BYTES_PER_U32 = 4;

const notEditFilesComment = generateNotEditFilesComment(import.meta.url);

const astMacrosFile = new URL(
	'../rust/parse_ast/src/convert_ast/converter/ast_macros.rs',
	import.meta.url
);

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
    $self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
  };
}

`;
	})
	.join('');

const astConstants = `${notEditFilesComment}
${flagMacros}`;

await writeFile(astMacrosFile, astConstants);
await lintRustFile(astMacrosFile);
