use swc_ecma_ast::Null;

use crate::convert_ast::converter::ast_constants::{
  LITERAL_NULL_RESERVED_BYTES, TYPE_LITERAL_NULL,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_literal_null(&mut self, literal: &Null) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_NULL,
      &literal.span,
      LITERAL_NULL_RESERVED_BYTES,
      false,
    );
    self.add_end(end_position, &literal.span);
  }
}
