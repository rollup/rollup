use swc_common::Span;
use swc_ecma_ast::{AssignPat, Expr, Ident, Pat};

use crate::convert_ast::converter::ast_constants::{
  ASSIGNMENT_PATTERN_LEFT_OFFSET, ASSIGNMENT_PATTERN_RESERVED_BYTES,
  ASSIGNMENT_PATTERN_RIGHT_OFFSET, TYPE_ASSIGNMENT_PATTERN,
};
use crate::convert_ast::converter::AstConverter;

impl<'a> AstConverter<'a> {
  pub fn store_assignment_pattern_and_get_left_position(
    &mut self,
    span: &Span,
    left: PatternOrIdentifier,
    right: &Expr,
  ) -> u32 {
    let end_position = self.add_type_and_start(
      &TYPE_ASSIGNMENT_PATTERN,
      span,
      ASSIGNMENT_PATTERN_RESERVED_BYTES,
      false,
    );
    // left
    self.update_reference_position(end_position + ASSIGNMENT_PATTERN_LEFT_OFFSET);
    let left_position = (self.buffer.len() >> 2) as u32;
    match left {
      PatternOrIdentifier::Pattern(pattern) => {
        self.convert_pattern(pattern);
      }
      PatternOrIdentifier::Identifier(identifier) => self.convert_identifier(identifier),
    }
    // right
    self.update_reference_position(end_position + ASSIGNMENT_PATTERN_RIGHT_OFFSET);
    self.convert_expression(right);
    // end
    self.add_end(end_position, span);
    left_position
  }

  pub fn convert_assignment_pattern(&mut self, assignment_pattern: &AssignPat) {
    self.store_assignment_pattern_and_get_left_position(
      &assignment_pattern.span,
      PatternOrIdentifier::Pattern(&assignment_pattern.left),
      &assignment_pattern.right,
    );
  }
}

pub enum PatternOrIdentifier<'a> {
  Pattern(&'a Pat),
  Identifier(&'a Ident),
}
