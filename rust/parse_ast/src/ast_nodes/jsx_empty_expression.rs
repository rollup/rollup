use crate::convert_ast::converter::ast_constants::{
  JSX_EMPTY_EXPRESSION_RESERVED_BYTES, TYPE_JSX_EMPTY_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_empty_expression(&mut self, start: u32, end: u32) {
    let end_position = self.add_type_and_explicit_start(
      &TYPE_JSX_EMPTY_EXPRESSION,
      start,
      JSX_EMPTY_EXPRESSION_RESERVED_BYTES,
    );
    // end
    self.add_explicit_end(end_position, end);
  }
}
