use swc_ecma_ast::{JSXExpr, JSXExprContainer};

use crate::convert_ast::converter::ast_constants::{
  JSX_EXPRESSION_CONTAINER_EXPRESSION_OFFSET, JSX_EXPRESSION_CONTAINER_RESERVED_BYTES,
  TYPE_JSX_EXPRESSION_CONTAINER,
};
use crate::convert_ast::converter::AstConverter;

impl AstConverter<'_> {
  pub(crate) fn store_jsx_expression_container(&mut self, jsx_expr_container: &JSXExprContainer) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_EXPRESSION_CONTAINER,
      &jsx_expr_container.span,
      JSX_EXPRESSION_CONTAINER_RESERVED_BYTES,
      false,
    );
    // expression
    self.update_reference_position(end_position + JSX_EXPRESSION_CONTAINER_EXPRESSION_OFFSET);
    match &jsx_expr_container.expr {
      JSXExpr::Expr(expression) => {
        self.convert_expression(expression);
      }
      JSXExpr::JSXEmptyExpr(jsx_empty_expr) => {
        // The span does not consider the size of the container, hence we use the container span
        self.store_jsx_empty_expression(jsx_expr_container.span.lo.0, jsx_empty_expr.span.hi.0 - 1);
      }
    }
    // end
    self.add_end(end_position, &jsx_expr_container.span);
  }
}
