use swc_ecma_ast::ObjectLit;

use crate::convert_ast::converter::AstConverter;
use crate::store_object_expression;

impl AstConverter<'_> {
  pub(crate) fn store_object_expression(&mut self, object_literal: &ObjectLit) {
    store_object_expression!(
      self,
      span => &object_literal.span,
      properties => [object_literal.props, convert_property_or_spread]
    );
  }
}
