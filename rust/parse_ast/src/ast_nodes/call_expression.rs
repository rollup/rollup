use swc_common::Span;
use swc_ecma_ast::{Expr, ExprOrSpread, OptCall, Super};

use crate::convert_ast::annotations::AnnotationKind;
use crate::convert_ast::converter::ast_constants::{
  CALL_EXPRESSION_ANNOTATIONS_OFFSET, CALL_EXPRESSION_ARGUMENTS_OFFSET,
  CALL_EXPRESSION_CALLEE_OFFSET, CALL_EXPRESSION_RESERVED_BYTES, TYPE_CALL_EXPRESSION,
};
use crate::convert_ast::converter::{convert_annotation, AstConverter};
use crate::store_call_expression_flags;

impl AstConverter<'_> {
  pub(crate) fn store_call_expression(
    &mut self,
    span: &Span,
    is_optional: bool,
    callee: &StoredCallee,
    arguments: &[ExprOrSpread],
    is_chained: bool,
  ) {
    let end_position = self.add_type_and_start(
      &TYPE_CALL_EXPRESSION,
      span,
      CALL_EXPRESSION_RESERVED_BYTES,
      false,
    );
    // annotations
    let annotations = self
      .index_converter
      .take_collected_annotations(AnnotationKind::Pure);
    if !annotations.is_empty() {
      self.convert_item_list(
        &annotations,
        end_position + CALL_EXPRESSION_ANNOTATIONS_OFFSET,
        |ast_converter, annotation| {
          convert_annotation(&mut ast_converter.buffer, annotation);
          true
        },
      );
    }
    // flags
    store_call_expression_flags!(self, end_position, optional => is_optional);
    // callee
    self.update_reference_position(end_position + CALL_EXPRESSION_CALLEE_OFFSET);
    match callee {
      StoredCallee::Expression(Expr::OptChain(optional_chain_expression)) => {
        self.store_chain_expression(optional_chain_expression, is_chained);
      }
      StoredCallee::Expression(Expr::Call(call_expression)) => {
        self.convert_call_expression(call_expression, false, is_chained);
      }
      StoredCallee::Expression(Expr::Member(member_expression)) => {
        self.convert_member_expression(member_expression, false, is_chained);
      }
      StoredCallee::Expression(callee_expression) => {
        self.convert_expression(callee_expression);
      }
      StoredCallee::Super(callee_super) => self.store_super_element(callee_super),
    }
    // arguments
    self.convert_item_list(
      arguments,
      end_position + CALL_EXPRESSION_ARGUMENTS_OFFSET,
      |ast_converter, argument| {
        ast_converter.convert_expression_or_spread(argument);
        true
      },
    );
    // end
    self.add_end(end_position, span);
  }

  pub(crate) fn convert_optional_call(
    &mut self,
    optional_call: &OptCall,
    is_optional: bool,
    is_chained: bool,
  ) {
    self.store_call_expression(
      &optional_call.span,
      is_optional,
      &StoredCallee::Expression(&optional_call.callee),
      &optional_call.args,
      is_chained,
    );
  }
}

pub(crate) enum StoredCallee<'a> {
  Expression(&'a Expr),
  Super(&'a Super),
}
