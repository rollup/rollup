use swc_ecma_ast::Bool;

use crate::convert_ast::converter::ast_constants::{
  LITERAL_BOOLEAN_RESERVED_BYTES, TYPE_LITERAL_BOOLEAN,
};
use crate::convert_ast::converter::AstConverter;
use crate::store_literal_boolean_flags;

impl<'a> AstConverter<'a> {
  pub fn store_literal_boolean(&mut self, literal: &Bool) {
    let end_position = self.add_type_and_start(
      &TYPE_LITERAL_BOOLEAN,
      &literal.span,
      LITERAL_BOOLEAN_RESERVED_BYTES,
      false,
    );
    // flags
    store_literal_boolean_flags!(self, end_position, value => literal.value);
    // end
    self.add_end(end_position, &literal.span);
  }
}
