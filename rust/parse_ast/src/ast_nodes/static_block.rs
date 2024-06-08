use swc_ecma_ast::StaticBlock;

use crate::convert_ast::converter::AstConverter;
use crate::store_static_block;

impl<'a> AstConverter<'a> {
  pub fn store_static_block(&mut self, static_block: &StaticBlock) {
    store_static_block!(
      self,
      span => &static_block.span,
      body => [static_block.body.stmts, convert_statement]
    );
  }
}
