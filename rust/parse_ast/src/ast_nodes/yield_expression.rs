use swc_ecma_ast::YieldExpr;

use crate::convert_ast::converter::ast_constants::{
  TYPE_YIELD_EXPRESSION, YIELD_EXPRESSION_ARGUMENT_OFFSET, YIELD_EXPRESSION_DELEGATE_FLAG,
  YIELD_EXPRESSION_FLAGS_OFFSET, YIELD_EXPRESSION_RESERVED_BYTES,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_yield_expression(&mut self, yield_expression: &YieldExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_YIELD_EXPRESSION,
      &yield_expression.span,
      YIELD_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // flags
    let mut flags = 0u32;
    if yield_expression.delegate {
      flags |= YIELD_EXPRESSION_DELEGATE_FLAG;
    }
    let flags_position = end_position + YIELD_EXPRESSION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // argument
    if let Some(expression) = yield_expression.arg.as_ref() {
      self.update_reference_position(end_position + YIELD_EXPRESSION_ARGUMENT_OFFSET);
      self.convert_expression(expression)
    }
    // end
    self.add_end(end_position, &yield_expression.span);
  }
}
