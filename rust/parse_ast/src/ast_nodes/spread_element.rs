use swc_common::Span;
use swc_ecma_ast::{Expr, SpreadElement};

use crate::convert_ast::converter::ast_constants::{
  SPREAD_ELEMENT_ARGUMENT_OFFSET, SPREAD_ELEMENT_RESERVED_BYTES, TYPE_SPREAD_ELEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_spread_element(&mut self, dot_span: &Span, argument: &Expr) {
    let end_position = self.add_type_and_start(
      &TYPE_SPREAD_ELEMENT,
      dot_span,
      SPREAD_ELEMENT_RESERVED_BYTES,
      false,
    );
    // we need to set the end position to that of the expression
    let argument_position = self.buffer.len();
    // argument
    self.update_reference_position(end_position + SPREAD_ELEMENT_ARGUMENT_OFFSET);
    self.convert_expression(argument);
    let expression_end: [u8; 4] = self.buffer[argument_position + 8..argument_position + 12]
      .try_into()
      .unwrap();
    self.buffer[end_position..end_position + 4].copy_from_slice(&expression_end);
  }

  pub fn convert_spread_element(&mut self, spread_element: &SpreadElement) {
    self.store_spread_element(&spread_element.dot3_token, &spread_element.expr);
  }
}
