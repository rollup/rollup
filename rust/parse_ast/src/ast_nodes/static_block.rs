use swc_ecma_ast::StaticBlock;

use crate::convert_ast::converter::ast_constants::{
  NODE_TYPE_ID_STATIC_BLOCK, STATIC_BLOCK_BODY_OFFSET, STATIC_BLOCK_RESERVED_BYTES,
  STATIC_BLOCK_SCOPE_OFFSET_OFFSET, TYPE_STATIC_BLOCK,
};
use crate::convert_ast::converter::{AstConverter, ScopeType};

impl AstConverter<'_> {
  pub(crate) fn store_static_block(&mut self, static_block: &StaticBlock) {
    let walk_entry = self.on_node_enter::<NODE_TYPE_ID_STATIC_BLOCK>();
    let end_position = self.add_type_and_start(
      &TYPE_STATIC_BLOCK,
      &static_block.span,
      STATIC_BLOCK_RESERVED_BYTES,
      false,
    );
    self.push_scope(
      ScopeType::Block,
      end_position + STATIC_BLOCK_SCOPE_OFFSET_OFFSET,
    );
    self.convert_item_list(
      &static_block.body.stmts,
      end_position + STATIC_BLOCK_BODY_OFFSET,
      |ast_converter, statement| {
        ast_converter.convert_statement(statement);
        true
      },
    );
    self.add_end(end_position, &static_block.span);
    self.pop_scope();
    self.on_node_exit(walk_entry);
  }
}
