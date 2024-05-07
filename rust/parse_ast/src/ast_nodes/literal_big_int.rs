use swc_ecma_ast::BigInt;

use crate::convert_ast::converter::ast_constants::{
  LITERAL_BIG_INT_BIGINT_OFFSET, LITERAL_BIG_INT_RAW_OFFSET, LITERAL_BIG_INT_RESERVED_BYTES,
  TYPE_LITERAL_BIG_INT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_literal_bigint(&mut self, bigint: &BigInt) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_BIG_INT,
      &bigint.span,
      LITERAL_BIG_INT_RESERVED_BYTES,
      false,
    );
    // bigint
    self.convert_string(
      &bigint.value.to_str_radix(10),
      end_position + LITERAL_BIG_INT_BIGINT_OFFSET,
    );
    // raw
    self.convert_string(
      bigint.raw.as_ref().unwrap(),
      end_position + LITERAL_BIG_INT_RAW_OFFSET,
    );
    // end
    self.add_end(end_position, &bigint.span);
  }
}
