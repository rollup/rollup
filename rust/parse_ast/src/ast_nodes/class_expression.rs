use swc_ecma_ast::ClassExpr;

use crate::convert_ast::converter::AstConverter;

impl AstConverter<'_> {
  pub(crate) fn store_class_expression(
    &mut self,
    class_expression: &ClassExpr,
    node_type: &[u8; 4],
    outside_class_span_decorators_insert_position: Option<u32>,
  ) {
    self.store_class_node(
      node_type,
      class_expression.ident.as_ref(),
      &class_expression.class,
      outside_class_span_decorators_insert_position,
    );
  }
}
