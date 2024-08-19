use swc_ecma_ast::TryStmt;

use crate::convert_ast::converter::ast_constants::{
  TRY_STATEMENT_BLOCK_OFFSET, TRY_STATEMENT_FINALIZER_OFFSET, TRY_STATEMENT_HANDLER_OFFSET,
  TRY_STATEMENT_RESERVED_BYTES, TYPE_TRY_STATEMENT,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_try_statement(&mut self, try_statement: &TryStmt) {
    let end_position = self.add_type_and_start(
      &TYPE_TRY_STATEMENT,
      &try_statement.span,
      TRY_STATEMENT_RESERVED_BYTES,
      false,
    );
    // block
    self.update_reference_position(end_position + TRY_STATEMENT_BLOCK_OFFSET);
    self.store_block_statement(&try_statement.block, false);
    // handler
    if let Some(catch_clause) = try_statement.handler.as_ref() {
      self.update_reference_position(end_position + TRY_STATEMENT_HANDLER_OFFSET);
      self.store_catch_clause(catch_clause);
    }
    // finalizer
    if let Some(block_statement) = try_statement.finalizer.as_ref() {
      self.update_reference_position(end_position + TRY_STATEMENT_FINALIZER_OFFSET);
      self.store_block_statement(block_statement, false);
    }
    // end
    self.add_end(end_position, &try_statement.span);
  }
}
