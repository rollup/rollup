use swc_ecma_ast::SwitchCase;

use crate::convert_ast::converter::AstConverter;
use crate::store_switch_case;

impl AstConverter<'_> {
  pub(crate) fn store_switch_case(&mut self, switch_case: &SwitchCase) {
    store_switch_case!(
      self,
      span => &switch_case.span,
      test => [switch_case.test, convert_expression],
      consequent => [switch_case.cons, convert_statement]
    );
  }
}
