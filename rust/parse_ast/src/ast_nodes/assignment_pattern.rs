use swc_common::Span;
use swc_ecma_ast::{AssignPat, Expr, Ident, Pat};

use crate::convert_ast::converter::ast_constants::{
  ASSIGNMENT_PATTERN_LEFT_OFFSET, ASSIGNMENT_PATTERN_RESERVED_BYTES,
  ASSIGNMENT_PATTERN_RIGHT_OFFSET, NODE_TYPE_ID_ASSIGNMENT_PATTERN, TYPE_ASSIGNMENT_PATTERN,
};
use crate::convert_ast::converter::AstConverter;

impl AstConverter<'_> {
  pub(crate) fn store_assignment_pattern(
    &mut self,
    span: &Span,
    left: PatternOrIdentifier,
    right: &Expr,
  ) {
    let walk_entry = self.on_node_enter::<NODE_TYPE_ID_ASSIGNMENT_PATTERN>();
    let end_position = self.add_type_and_start(
      &TYPE_ASSIGNMENT_PATTERN,
      span,
      ASSIGNMENT_PATTERN_RESERVED_BYTES,
      false,
    );
    // left
    self.update_reference_position(end_position + ASSIGNMENT_PATTERN_LEFT_OFFSET);
    match left {
      PatternOrIdentifier::Pattern(pattern) => {
        self.convert_pattern(pattern);
      }
      PatternOrIdentifier::Identifier(identifier) => self.convert_identifier(identifier),
    }
    // right
    self.update_reference_position(end_position + ASSIGNMENT_PATTERN_RIGHT_OFFSET);
    self.without_declaration_kind(|ast_converter| ast_converter.convert_expression(right));
    // end
    self.add_end(end_position, span);
    self.on_node_exit(walk_entry);
  }

  pub(crate) fn convert_assignment_pattern(&mut self, assignment_pattern: &AssignPat) {
    self.store_assignment_pattern(
      &assignment_pattern.span,
      PatternOrIdentifier::Pattern(&assignment_pattern.left),
      &assignment_pattern.right,
    );
  }
}

pub(crate) enum PatternOrIdentifier<'a> {
  Pattern(&'a Pat),
  Identifier(&'a Ident),
}
