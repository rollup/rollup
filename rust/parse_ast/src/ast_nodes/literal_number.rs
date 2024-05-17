use swc_ecma_ast::Number;

use crate::convert_ast::converter::ast_constants::{
  LITERAL_NUMBER_RAW_OFFSET, LITERAL_NUMBER_RESERVED_BYTES, LITERAL_NUMBER_VALUE_OFFSET,
  TYPE_LITERAL_NUMBER,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_literal_number(&mut self, literal: &Number) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_NUMBER,
      &literal.span,
      LITERAL_NUMBER_RESERVED_BYTES,
      false,
    );
    // value, needs to be little endian as we are reading via a DataView
    let value_position = end_position + LITERAL_NUMBER_VALUE_OFFSET;
    self.buffer[value_position..value_position + 8].copy_from_slice(&literal.value.to_le_bytes());
    // raw
    if let Some(raw) = literal.raw.as_ref() {
      self.convert_string(raw, end_position + LITERAL_NUMBER_RAW_OFFSET);
    }
    // end
    self.add_end(end_position, &literal.span);
  }
}
