use swc_ecma_ast::NewExpr;

use crate::convert_ast::annotations::AnnotationKind;
use crate::convert_ast::converter::ast_constants::{
  NEW_EXPRESSION_ANNOTATIONS_OFFSET, NEW_EXPRESSION_ARGUMENTS_OFFSET, NEW_EXPRESSION_CALLEE_OFFSET,
  NEW_EXPRESSION_RESERVED_BYTES, TYPE_NEW_EXPRESSION,
};
use crate::convert_ast::converter::{convert_annotation, AstConverter};

impl<'a> AstConverter<'a> {
  pub(crate) fn store_new_expression(&mut self, new_expression: &NewExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_NEW_EXPRESSION,
      &new_expression.span,
      NEW_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // annotations
    let annotations = self
      .index_converter
      .take_collected_annotations(AnnotationKind::Pure);
    if !annotations.is_empty() {
      self.convert_item_list(
        &annotations,
        end_position + NEW_EXPRESSION_ANNOTATIONS_OFFSET,
        |ast_converter, annotation| {
          convert_annotation(&mut ast_converter.buffer, annotation);
          true
        },
      );
    }
    // callee
    self.update_reference_position(end_position + NEW_EXPRESSION_CALLEE_OFFSET);
    self.convert_expression(&new_expression.callee);
    // arguments
    self.convert_item_list(
      match &new_expression.args {
        Some(arguments) => arguments,
        None => &[],
      },
      end_position + NEW_EXPRESSION_ARGUMENTS_OFFSET,
      |ast_converter, expression_or_spread| {
        ast_converter.convert_expression_or_spread(expression_or_spread);
        true
      },
    );
    // end
    self.add_end(end_position, &new_expression.span);
  }
}
