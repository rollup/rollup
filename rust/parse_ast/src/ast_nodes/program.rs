use swc_ecma_ast::{Expr, Lit, ModuleItem, Program, Stmt};

use crate::convert_ast::converter::ast_constants::{
  PROGRAM_BODY_OFFSET, PROGRAM_INVALID_ANNOTATIONS_OFFSET, PROGRAM_RESERVED_BYTES, TYPE_PROGRAM,
};
use crate::convert_ast::converter::{convert_annotation, AstConverter};

impl AstConverter<'_> {
  pub(crate) fn store_program(&mut self, body: ModuleItemsOrStatements) {
    let end_position =
      self.add_type_and_explicit_start(&TYPE_PROGRAM, 0u32, PROGRAM_RESERVED_BYTES);
    // body
    let mut keep_checking_directives = true;
    match body {
      ModuleItemsOrStatements::ModuleItems(module_items) => {
        self.convert_item_list_with_state(
          module_items,
          end_position + PROGRAM_BODY_OFFSET,
          &mut keep_checking_directives,
          |ast_converter, module_item, can_be_directive| {
            if *can_be_directive {
              if let ModuleItem::Stmt(Stmt::Expr(expression)) = module_item {
                if let Expr::Lit(Lit::Str(string)) = &*expression.expr {
                  ast_converter.store_directive(expression, &string.value);
                  return (true, None);
                }
              };
              *can_be_directive = false;
            }

            let mut module_item_insert_position = ast_converter.buffer.len() as u32 >> 2;
            ast_converter.convert_module_item(module_item, &mut module_item_insert_position);
            (true, Some(module_item_insert_position))
          },
        );
      }
      ModuleItemsOrStatements::Statements(statements) => {
        self.convert_item_list_with_state(
          statements,
          end_position + PROGRAM_BODY_OFFSET,
          &mut keep_checking_directives,
          |ast_converter, statement, can_be_directive| {
            if *can_be_directive {
              if let Stmt::Expr(expression) = statement {
                if let Expr::Lit(Lit::Str(string)) = &*expression.expr {
                  ast_converter.store_directive(expression, &string.value);
                  return (true, None);
                }
              };
              *can_be_directive = false;
            }
            ast_converter.convert_statement(statement);
            (true, None)
          },
        );
      }
    }
    // end
    self.add_explicit_end(end_position, self.code.len() as u32);
    // annotations, these need to come after end so that trailing comments are
    // included
    self.index_converter.invalidate_collected_annotations();
    let invalid_annotations = self.index_converter.take_invalid_annotations();
    if !invalid_annotations.is_empty() {
      self.convert_item_list(
        &invalid_annotations,
        end_position + PROGRAM_INVALID_ANNOTATIONS_OFFSET,
        |ast_converter, annotation| {
          convert_annotation(&mut ast_converter.buffer, annotation);
          true
        },
      );
    }
  }

  pub(crate) fn convert_program(&mut self, node: &Program) {
    match node {
      Program::Module(module) => {
        self.store_program(ModuleItemsOrStatements::ModuleItems(&module.body));
      }
      Program::Script(script) => {
        self.store_program(ModuleItemsOrStatements::Statements(&script.body));
      }
    }
  }
}

pub(crate) enum ModuleItemsOrStatements<'a> {
  ModuleItems(&'a Vec<ModuleItem>),
  Statements(&'a Vec<Stmt>),
}
