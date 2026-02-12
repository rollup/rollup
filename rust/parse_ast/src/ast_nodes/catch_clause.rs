use swc_ecma_ast::CatchClause;

use crate::convert_ast::converter::ast_constants::{
  CATCH_CLAUSE_BODY_OFFSET, CATCH_CLAUSE_PARAM_OFFSET, CATCH_CLAUSE_RESERVED_BYTES,
  NODE_TYPE_ID_CATCH_CLAUSE, TYPE_CATCH_CLAUSE,
};
use crate::convert_ast::converter::AstConverter;

impl AstConverter<'_> {
  pub(crate) fn store_catch_clause(&mut self, catch_clause: &CatchClause) {
    let walk_entry = self.on_node_enter::<NODE_TYPE_ID_CATCH_CLAUSE>();
    let end_position = self.add_type_and_start(
      &TYPE_CATCH_CLAUSE,
      &catch_clause.span,
      CATCH_CLAUSE_RESERVED_BYTES,
      false,
    );
    // param
    if let Some(pattern) = catch_clause.param.as_ref() {
      self.update_reference_position(end_position + CATCH_CLAUSE_PARAM_OFFSET);
      self.convert_pattern(pattern);
    }
    // body
    self.update_reference_position(end_position + CATCH_CLAUSE_BODY_OFFSET);
    self.store_block_statement(&catch_clause.body, false);
    // end
    self.add_end(end_position, &catch_clause.span);
    self.on_node_exit(walk_entry);
  }
}
