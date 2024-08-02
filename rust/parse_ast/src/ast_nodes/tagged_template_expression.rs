use swc_ecma_ast::TaggedTpl;

use crate::convert_ast::converter::AstConverter;
use crate::store_tagged_template_expression;

impl<'a> AstConverter<'a> {
  pub(crate) fn store_tagged_template_expression(&mut self, tagged_template: &TaggedTpl) {
    store_tagged_template_expression!(
      self,
      span => &tagged_template.span,
      tag => [tagged_template.tag, convert_expression],
      quasi => [tagged_template.tpl, store_template_literal]
    );
  }
}
