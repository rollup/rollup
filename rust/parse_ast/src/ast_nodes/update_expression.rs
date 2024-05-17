use swc_ecma_ast::{UpdateExpr, UpdateOp};

use crate::convert_ast::converter::ast_constants::{
  TYPE_UPDATE_EXPRESSION, UPDATE_EXPRESSION_ARGUMENT_OFFSET, UPDATE_EXPRESSION_FLAGS_OFFSET,
  UPDATE_EXPRESSION_OPERATOR_OFFSET, UPDATE_EXPRESSION_PREFIX_FLAG,
  UPDATE_EXPRESSION_RESERVED_BYTES,
};
use crate::convert_ast::converter::string_constants::{STRING_MINUSMINUS, STRING_PLUSPLUS};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_update_expression(&mut self, update_expression: &UpdateExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_UPDATE_EXPRESSION,
      &update_expression.span,
      UPDATE_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // argument
    self.update_reference_position(end_position + UPDATE_EXPRESSION_ARGUMENT_OFFSET);
    self.convert_expression(&update_expression.arg);
    // flags
    let mut flags = 0u32;
    if update_expression.prefix {
      flags |= UPDATE_EXPRESSION_PREFIX_FLAG;
    }
    let flags_position = end_position + UPDATE_EXPRESSION_FLAGS_OFFSET;
    self.buffer[flags_position..flags_position + 4].copy_from_slice(&flags.to_ne_bytes());
    // operator
    let operator_position = end_position + UPDATE_EXPRESSION_OPERATOR_OFFSET;
    self.buffer[operator_position..operator_position + 4].copy_from_slice(
      match update_expression.op {
        UpdateOp::PlusPlus => &STRING_PLUSPLUS,
        UpdateOp::MinusMinus => &STRING_MINUSMINUS,
      },
    );
    // end
    self.add_end(end_position, &update_expression.span);
  }
}
