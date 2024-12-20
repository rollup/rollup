use swc_ecma_ast::{UpdateExpr, UpdateOp};

use crate::convert_ast::converter::string_constants::{STRING_MINUSMINUS, STRING_PLUSPLUS};
use crate::convert_ast::converter::AstConverter;
use crate::{store_update_expression, store_update_expression_flags};

impl AstConverter<'_> {
  pub(crate) fn store_update_expression(&mut self, update_expression: &UpdateExpr) {
    store_update_expression!(
      self,
      span => &update_expression.span,
      prefix => update_expression.prefix,
      operator => match update_expression.op {
        UpdateOp::PlusPlus => &STRING_PLUSPLUS,
        UpdateOp::MinusMinus => &STRING_MINUSMINUS,
      },
      argument => [update_expression.arg, convert_expression]
    );
  }
}
