use swc_ecma_ast::Super;

use crate::convert_ast::converter::AstConverter;
use crate::store_super_element;

impl AstConverter<'_> {
  pub(crate) fn store_super_element(&mut self, super_token: &Super) {
    store_super_element!(
      self,
      span => &super_token.span
    );
  }
}
