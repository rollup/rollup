use swc_ecma_ast::Bool;

use crate::convert_ast::converter::ast_constants::{
  LITERAL_BOOLEAN_FLAGS_OFFSET, LITERAL_BOOLEAN_RESERVED_BYTES, LITERAL_BOOLEAN_VALUE_FLAG,
  TYPE_LITERAL_BOOLEAN,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_literal_boolean(&mut self, literal: &Bool) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_BOOLEAN,
      &literal.span,
      LITERAL_BOOLEAN_RESERVED_BYTES,
      false,
    );
    let mut flags = 0u32;
    if literal.value {
      flags |= LITERAL_BOOLEAN_VALUE_FLAG
    };
    let flags_position = end_position + LITERAL_BOOLEAN_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    self.add_end(end_position, &literal.span);
  }
}
