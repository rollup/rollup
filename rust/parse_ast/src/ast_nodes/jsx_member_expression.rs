use swc_ecma_ast::JSXMemberExpr;

use crate::convert_ast::converter::ast_constants::{
  JSX_MEMBER_EXPRESSION_OBJECT_OFFSET, JSX_MEMBER_EXPRESSION_PROPERTY_OFFSET,
  JSX_MEMBER_EXPRESSION_RESERVED_BYTES, TYPE_JSX_MEMBER_EXPRESSION,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_jsx_member_expression(&mut self, jsx_member_expression: &JSXMemberExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_JSX_MEMBER_EXPRESSION,
      &jsx_member_expression.span,
      JSX_MEMBER_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // object
    self.update_reference_position(end_position + JSX_MEMBER_EXPRESSION_OBJECT_OFFSET);
    self.convert_jsx_object(&jsx_member_expression.obj);
    // property
    self.update_reference_position(end_position + JSX_MEMBER_EXPRESSION_PROPERTY_OFFSET);
    self.store_jsx_identifier(
      &jsx_member_expression.prop.span,
      &jsx_member_expression.prop.sym,
    );
    // end
    self.add_end(end_position, &jsx_member_expression.span);
  }
}
