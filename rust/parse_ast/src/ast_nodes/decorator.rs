use crate::convert_ast::converter::AstConverter;
use crate::store_decorator;
use swc_ecma_ast::Decorator;

impl<'a> AstConverter<'a> {
  pub fn store_decorator(&mut self, decorator: &Decorator) {
    store_decorator!(self, span => decorator.span, expression=>[decorator.expr, convert_expression]);
  }
}
