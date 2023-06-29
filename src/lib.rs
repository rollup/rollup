#![deny(clippy::all)]

use std::sync::Arc;

use anyhow::anyhow;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use swc::{Compiler, config::ParseOptions};
use swc_common::{errors::{DiagnosticBuilder, Emitter, Handler}, FileName, FilePathMapping, GLOBALS, Globals, SourceMap, sync::Lazy};

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
                Ok(program)
            }
        }).expect("failed to parse");
    });

    vec![1, 2, 3].into()
}
