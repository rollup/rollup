use swc_ecma_ast::Str;

use crate::convert_ast::converter::ast_constants::{
  LITERAL_STRING_RAW_OFFSET, LITERAL_STRING_RESERVED_BYTES, LITERAL_STRING_VALUE_OFFSET,
  TYPE_LITERAL_STRING,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_literal_string(&mut self, literal: &Str) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_STRING,
      &literal.span,
      LITERAL_STRING_RESERVED_BYTES,
      false,
    );
    // value
    self.convert_string(&literal.value, end_position + LITERAL_STRING_VALUE_OFFSET);
    // raw
    if let Some(raw) = literal.raw.as_ref() {
      self.convert_string(raw, end_position + LITERAL_STRING_RAW_OFFSET);
    }
    // end
    self.add_end(end_position, &literal.span);
  }
}
