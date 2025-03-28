use swc_common::Span;
use swc_ecma_ast::{ClassExpr, DefaultDecl, ExportDefaultDecl, ExportDefaultExpr, Expr, FnExpr};

use crate::convert_ast::converter::ast_constants::{
  EXPORT_DEFAULT_DECLARATION_DECLARATION_OFFSET, EXPORT_DEFAULT_DECLARATION_RESERVED_BYTES,
  TYPE_CLASS_DECLARATION, TYPE_EXPORT_DEFAULT_DECLARATION, TYPE_FUNCTION_DECLARATION,
};

use crate::convert_ast::converter::{get_outside_class_span_decorators_info, AstConverter};

impl AstConverter<'_> {
  pub(crate) fn store_export_default_declaration(
    &mut self,
    span: &Span,
    expression: StoredDefaultExportExpression,
    module_item_insert_position: &mut u32,
  ) {
    let (
      mut outside_class_span_decorators_insert_position,
      are_decorators_before_export,
      are_decorators_after_export,
      outside_class_span_decorators,
    ) = get_outside_class_span_decorators_info(
      span,
      match expression {
        StoredDefaultExportExpression::Class(class_expression) => Some(&class_expression.class),
        _ => None,
      },
    );

    if are_decorators_before_export {
      self.store_outside_class_span_decorators(
        outside_class_span_decorators,
        &mut outside_class_span_decorators_insert_position,
      );
      *module_item_insert_position = (self.buffer.len() as u32) >> 2;
    }

    let end_position = self.add_type_and_start(
      &TYPE_EXPORT_DEFAULT_DECLARATION,
      span,
      EXPORT_DEFAULT_DECLARATION_RESERVED_BYTES,
      matches!(
        expression,
        StoredDefaultExportExpression::Expression(Expr::Fn(_) | Expr::Arrow(_))
          | StoredDefaultExportExpression::Function(_)
      ),
    );

    if are_decorators_after_export {
      self.store_outside_class_span_decorators(
        outside_class_span_decorators,
        &mut outside_class_span_decorators_insert_position,
      );
    }
    // declaration
    self.update_reference_position(end_position + EXPORT_DEFAULT_DECLARATION_DECLARATION_OFFSET);
    match expression {
      StoredDefaultExportExpression::Expression(expression) => {
        self.convert_expression(expression);
      }
      StoredDefaultExportExpression::Class(class_expression) => {
        self.store_class_expression(
          class_expression,
          &TYPE_CLASS_DECLARATION,
          outside_class_span_decorators_insert_position,
        );
      }
      StoredDefaultExportExpression::Function(function_expression) => self.convert_function(
        &function_expression.function,
        &TYPE_FUNCTION_DECLARATION,
        function_expression.ident.as_ref(),
      ),
    }
    // end
    self.add_end(end_position, span);
  }

  pub(crate) fn convert_export_default_declaration(
    &mut self,
    export_default_declaration: &ExportDefaultDecl,
    module_item_insert_position: &mut u32,
  ) {
    self.store_export_default_declaration(
      &export_default_declaration.span,
      match &export_default_declaration.decl {
        DefaultDecl::Class(class_expression) => {
          StoredDefaultExportExpression::Class(class_expression)
        }
        DefaultDecl::Fn(function_expression) => {
          StoredDefaultExportExpression::Function(function_expression)
        }
        DefaultDecl::TsInterfaceDecl(_) => {
          unimplemented!("Cannot convert ExportDefaultDeclaration with TsInterfaceDecl")
        }
      },
      module_item_insert_position,
    );
  }

  pub(crate) fn convert_export_default_expression(
    &mut self,
    export_default_expression: &ExportDefaultExpr,
    module_item_insert_position: &mut u32,
  ) {
    self.store_export_default_declaration(
      &export_default_expression.span,
      StoredDefaultExportExpression::Expression(&export_default_expression.expr),
      module_item_insert_position,
    );
  }
}

pub(crate) enum StoredDefaultExportExpression<'a> {
  Expression(&'a Expr),
  Class(&'a ClassExpr),
  Function(&'a FnExpr),
}
