use swc_ecma_ast::Tpl;

use crate::convert_ast::converter::ast_constants::{
  TEMPLATE_LITERAL_EXPRESSIONS_OFFSET, TEMPLATE_LITERAL_QUASIS_OFFSET,
  TEMPLATE_LITERAL_RESERVED_BYTES, TYPE_TEMPLATE_LITERAL,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_template_literal(&mut self, template_literal: &Tpl) {
    let end_position = self.add_type_and_start(
      &TYPE_TEMPLATE_LITERAL,
      &template_literal.span,
      TEMPLATE_LITERAL_RESERVED_BYTES,
      false,
    );
    // quasis, we manually do an item list here
    self.update_reference_position(end_position + TEMPLATE_LITERAL_QUASIS_OFFSET);
    self
      .buffer
      .extend_from_slice(&(template_literal.quasis.len() as u32).to_ne_bytes());
    let mut next_quasi_position = self.buffer.len();
    // make room for the positions of the quasis
    self
      .buffer
      .resize(self.buffer.len() + template_literal.quasis.len() * 4, 0);
    let mut quasis = template_literal.quasis.iter();
    // convert first quasi
    let first_quasi = quasis.next().unwrap();
    let insert_position = (self.buffer.len() as u32) >> 2;
    self.store_template_element(first_quasi);
    self.buffer[next_quasi_position..next_quasi_position + 4]
      .copy_from_slice(&insert_position.to_ne_bytes());
    next_quasi_position += 4;
    // now convert expressions, interleaved with quasis
    self.update_reference_position(end_position + TEMPLATE_LITERAL_EXPRESSIONS_OFFSET);
    self
      .buffer
      .extend_from_slice(&(template_literal.exprs.len() as u32).to_ne_bytes());
    let mut next_expression_position = self.buffer.len();
    // make room for the positions of the expressions
    self
      .buffer
      .resize(self.buffer.len() + template_literal.exprs.len() * 4, 0);
    for expression in template_literal.exprs.as_slice() {
      // convert expression
      let insert_position = (self.buffer.len() as u32) >> 2;
      self.convert_expression(expression);
      self.buffer[next_expression_position..next_expression_position + 4]
        .copy_from_slice(&insert_position.to_ne_bytes());
      next_expression_position += 4;
      // convert next quasi
      let next_quasi = quasis.next().unwrap();
      let insert_position = (self.buffer.len() as u32) >> 2;
      self.store_template_element(next_quasi);
      self.buffer[next_quasi_position..next_quasi_position + 4]
        .copy_from_slice(&insert_position.to_ne_bytes());
      next_quasi_position += 4;
    }
    // end
    self.add_end(end_position, &template_literal.span);
  }
}
