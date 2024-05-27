use swc_ecma_ast::YieldExpr;

use crate::convert_ast::converter::ast_constants::{
  TYPE_YIELD_EXPRESSION, YIELD_EXPRESSION_ARGUMENT_OFFSET, YIELD_EXPRESSION_RESERVED_BYTES,
};
use crate::convert_ast::converter::AstConverter;
use crate::store_yield_expression_flags;

impl<'a> AstConverter<'a> {
  pub fn store_yield_expression(&mut self, yield_expression: &YieldExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_YIELD_EXPRESSION,
      &yield_expression.span,
      YIELD_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // flags
    store_yield_expression_flags!(self, end_position, delegate => yield_expression.delegate);
    // argument
    if let Some(expression) = yield_expression.arg.as_ref() {
      self.update_reference_position(end_position + YIELD_EXPRESSION_ARGUMENT_OFFSET);
      self.convert_expression(expression)
    }
    // end
    self.add_end(end_position, &yield_expression.span);
  }
}
