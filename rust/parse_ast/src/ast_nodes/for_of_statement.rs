use swc_ecma_ast::ForOfStmt;

use crate::convert_ast::converter::AstConverter;
use crate::{store_for_of_statement, store_for_of_statement_flags};

impl AstConverter<'_> {
  pub(crate) fn store_for_of_statement(&mut self, for_of_statement: &ForOfStmt) {
    store_for_of_statement!(
      self,
      span => &for_of_statement.span,
      await => for_of_statement.is_await,
      left => [for_of_statement.left, convert_for_head],
      right => [for_of_statement.right, convert_expression],
      body => [for_of_statement.body, convert_statement]
    );
  }
}
