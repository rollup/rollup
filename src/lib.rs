#![deny(clippy::all)]

use std::sync::Arc;

use anyhow::anyhow;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use swc::{Compiler, config::ParseOptions};
use swc_common::{errors::{DiagnosticBuilder, Emitter, Handler}, FileName, FilePathMapping, GLOBALS, Globals, SourceMap, sync::Lazy};
use swc_ecma_ast::{Expr, ExprStmt, Lit, ModuleItem, Program, Stmt};

static COMPILER: Lazy<Arc<Compiler>> = Lazy::new(|| {
    let cm = Arc::new(SourceMap::new(FilePathMapping::empty()));
    Arc::new(Compiler::new(cm))
});

fn get_compiler() -> Arc<Compiler> {
    COMPILER.clone()
}

struct TestEmitter {}

impl Emitter for TestEmitter {
    fn emit(&mut self, db: &DiagnosticBuilder<'_>) {
        dbg!(db);
    }
}

#[napi]
pub fn parse(code: String) -> Buffer {
    let compiler = get_compiler();
    let compiler_options = ParseOptions::default();
    let filename = FileName::Anon;
    let emitter = TestEmitter {};
    let handler = Handler::with_emitter(true, false, Box::new(emitter));
    GLOBALS.set(&Globals::default(), || {
        compiler.run(|| {
            let fm = compiler.cm.new_source_file(filename, code);
            let comments = None;
            let program = compiler.parse_js(
                fm,
                &handler,
                compiler_options.target,
                compiler_options.syntax,
                compiler_options.is_module,
                comments,
            )?;
            dbg!(&program);
            if handler.has_errors() {
                Err(anyhow!("failed to parse"))
            } else {
                let converter = AstConverter::new();
                let buffer = converter.convert_ast_to_buffer(&program);
                Ok(buffer)
            }
        }).expect("failed to parse")
    })
}

struct AstConverter {
    buffer: Vec<u8>,
}

impl AstConverter {
    pub fn new() -> Self {
        Self {
            buffer: Vec::new(),
        }
    }

    pub fn convert_ast_to_buffer(mut self, node: &Program) -> Buffer {
        match node {
            Program::Module(module) => {
                // start
                self.buffer.extend_from_slice(&module.span.lo.0.to_ne_bytes());
                // end
                self.buffer.extend_from_slice(&module.span.hi.0.to_ne_bytes());
                // body needs to come last as it has variable size
                self.convert_module_items(&module.body);
            }
            _ => {
                unimplemented!("Cannot convert Script AST");
            }
        }
        self.buffer.into()
    }

    fn convert_module_items(&mut self, module_items: &Vec<ModuleItem>) {
        // store number of items in first position
        self.buffer.extend_from_slice(&(module_items.len() as u32).to_ne_bytes());
        let mut reference_position = self.buffer.len();
        // make room for the reference positions of the items
        self.buffer.resize(self.buffer.len() + module_items.len() * 4, 0);
        for module_item in module_items {
            let insert_position = self.buffer.len() as u32;
            self.buffer[reference_position..reference_position + 4]
                .copy_from_slice(&insert_position.to_ne_bytes());
            reference_position += 4;
            self.convert_module_item(module_item);
        }
    }

    fn convert_module_item(&mut self, module_item: &ModuleItem) {
        match module_item {
            ModuleItem::Stmt(statement) => {
                self.convert_statement(statement);
            }
            _ => {
                dbg!(module_item);
                todo!("Cannot convert ModuleItem");
            }
        }
    }

    fn convert_statement(&mut self, statement: &Stmt) {
        match statement {
            Stmt::Expr(expression_statement) => {
                self.convert_expression_statement(expression_statement);
            }
            _ => {
                dbg!(statement);
                todo!("Cannot convert Statement");
            }
        }
    }

    fn convert_expression_statement(&mut self, expression_statement: &ExprStmt) {
        // start
        self.buffer.extend_from_slice(&expression_statement.span.lo.0.to_ne_bytes());
        // end
        self.buffer.extend_from_slice(&expression_statement.span.hi.0.to_ne_bytes());
        // expression
        self.convert_expression(&expression_statement.expr);
    }

    fn convert_expression(&mut self, expression: &Box<Expr>) {
        match &**expression {
            Expr::Lit(literal) => {
                self.convert_literal(literal);
            }
            _ => {
                dbg!(expression);
                todo!("Cannot convert Expression");
            }
        }
    }

    fn convert_literal(&mut self, literal: &Lit) {
        match literal {
            Lit::Num(number_literal) => {
                // start
                self.buffer.extend_from_slice(&number_literal.span.lo.0.to_ne_bytes());
                // end
                self.buffer.extend_from_slice(&number_literal.span.hi.0.to_ne_bytes());
                // value
                self.buffer.extend_from_slice(&number_literal.value.to_ne_bytes());
            }
            _ => {
                dbg!(literal);
                todo!("Cannot convert Literal");
            }
        }
    }
}
