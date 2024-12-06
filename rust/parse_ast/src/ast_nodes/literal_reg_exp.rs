use swc_ecma_ast::Regex;

use crate::convert_ast::converter::AstConverter;
use crate::store_literal_reg_exp;

impl AstConverter<'_> {
  pub(crate) fn store_literal_regex(&mut self, regex: &Regex) {
    store_literal_reg_exp!(
      self,
      span => &regex.span,
      flags => &regex.flags,
      pattern => &regex.exp
    );
  }
}
