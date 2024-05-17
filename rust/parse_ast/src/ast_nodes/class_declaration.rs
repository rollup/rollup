use swc_ecma_ast::ClassDecl;

use crate::convert_ast::converter::ast_constants::TYPE_CLASS_DECLARATION;
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_class_declaration(&mut self, class_declaration: &ClassDecl) {
    self.store_class_node(
      &TYPE_CLASS_DECLARATION,
      Some(&class_declaration.ident),
      &class_declaration.class,
    );
  }
}
