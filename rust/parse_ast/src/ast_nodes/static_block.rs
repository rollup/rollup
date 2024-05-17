use swc_ecma_ast::StaticBlock;

use crate::convert_ast::converter::ast_constants::{
  STATIC_BLOCK_BODY_OFFSET, STATIC_BLOCK_RESERVED_BYTES, TYPE_STATIC_BLOCK,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_static_block(&mut self, static_block: &StaticBlock) {
    let end_position = self.add_type_and_start(
      &TYPE_STATIC_BLOCK,
      &static_block.span,
      STATIC_BLOCK_RESERVED_BYTES,
      false,
    );
    // body
    self.convert_item_list(
      &static_block.body.stmts,
      end_position + STATIC_BLOCK_BODY_OFFSET,
      |ast_converter, statement| {
        ast_converter.convert_statement(statement);
        true
      },
    );
    // end
    self.add_end(end_position, &static_block.span);
  }
}
