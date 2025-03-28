use swc_ecma_ast::ClassDecl;

use crate::convert_ast::converter::ast_constants::TYPE_CLASS_DECLARATION;
use crate::convert_ast::converter::AstConverter;

impl AstConverter<'_> {
  pub(crate) fn store_class_declaration(
    &mut self,
    class_declaration: &ClassDecl,
    outside_class_span_decorators_insert_position: Option<u32>,
  ) {
    self.store_class_node(
      &TYPE_CLASS_DECLARATION,
      Some(&class_declaration.ident),
      &class_declaration.class,
      outside_class_span_decorators_insert_position,
    );
  }
}
