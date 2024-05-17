use swc_ecma_ast::AwaitExpr;

use crate::convert_ast::converter::ast_constants::{
  AWAIT_EXPRESSION_ARGUMENT_OFFSET, AWAIT_EXPRESSION_RESERVED_BYTES, TYPE_AWAIT_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_await_expression(&mut self, await_expression: &AwaitExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_AWAIT_EXPRESSION,
      &await_expression.span,
      AWAIT_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // argument
    self.update_reference_position(end_position + AWAIT_EXPRESSION_ARGUMENT_OFFSET);
    self.convert_expression(&await_expression.arg);
    // end
    self.add_end(end_position, &await_expression.span);
  }
}
