use swc_ecma_ast::ObjectPat;

use crate::convert_ast::converter::AstConverter;
use crate::store_object_pattern;

impl AstConverter<'_> {
  pub(crate) fn store_object_pattern(&mut self, object_pattern: &ObjectPat) {
    store_object_pattern!(
      self,
      span => &object_pattern.span,
      properties => [object_pattern.props, convert_object_pattern_property]
    );
  }
}
