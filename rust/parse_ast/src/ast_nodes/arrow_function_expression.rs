use swc_ecma_ast::{ArrowExpr, BlockStmtOrExpr};

use crate::convert_ast::annotations::AnnotationKind;
use crate::convert_ast::converter::ast_constants::{
  ARROW_FUNCTION_EXPRESSION_ANNOTATIONS_OFFSET, ARROW_FUNCTION_EXPRESSION_BODY_OFFSET,
  ARROW_FUNCTION_EXPRESSION_PARAMS_OFFSET, ARROW_FUNCTION_EXPRESSION_RESERVED_BYTES,
  TYPE_ARROW_FUNCTION_EXPRESSION,
};
use crate::convert_ast::converter::{convert_annotation, AstConverter};
use crate::store_arrow_function_expression_flags;

impl AstConverter<'_> {
  pub(crate) fn store_arrow_function_expression(&mut self, arrow_expression: &ArrowExpr) {
    let end_position = self.add_type_and_start(
      &TYPE_ARROW_FUNCTION_EXPRESSION,
      &arrow_expression.span,
      ARROW_FUNCTION_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // annotations
    let annotations = self
      .index_converter
      .take_collected_annotations(AnnotationKind::NoSideEffects);
    if !annotations.is_empty() {
      self.convert_item_list(
        &annotations,
        end_position + ARROW_FUNCTION_EXPRESSION_ANNOTATIONS_OFFSET,
        |ast_converter, annotation| {
          convert_annotation(&mut ast_converter.buffer, annotation);
          true
        },
      );
    }
    // flags
    store_arrow_function_expression_flags!(
      self,
      end_position,
      async => arrow_expression.is_async,
      expression => matches!(&*arrow_expression.body, BlockStmtOrExpr::Expr(_)),
      generator => arrow_expression.is_generator
    );
    // params
    self.convert_item_list(
      &arrow_expression.params,
      end_position + ARROW_FUNCTION_EXPRESSION_PARAMS_OFFSET,
      |ast_converter, param| {
        ast_converter.convert_pattern(param);
        true
      },
    );
    // body
    self.update_reference_position(end_position + ARROW_FUNCTION_EXPRESSION_BODY_OFFSET);
    match &*arrow_expression.body {
      BlockStmtOrExpr::BlockStmt(block_statement) => {
        self.store_block_statement(block_statement, true)
      }
      BlockStmtOrExpr::Expr(expression) => {
        self.convert_expression(expression);
      }
    }
    // end
    self.add_end(end_position, &arrow_expression.span);
  }
}
