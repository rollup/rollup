use swc_ecma_ast::ThrowStmt;

use crate::convert_ast::converter::AstConverter;
use crate::store_throw_statement;

impl AstConverter<'_> {
  pub(crate) fn store_throw_statement(&mut self, throw_statement: &ThrowStmt) {
    store_throw_statement!(
      self,
      span => &throw_statement.span,
      argument => [throw_statement.arg, convert_expression]
    );
  }
}
