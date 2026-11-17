use std::cell::Cell;
use std::hint::black_box;
use std::mem::ManuallyDrop;
use std::panic::{catch_unwind, AssertUnwindSafe};
use std::rc::Rc;

use swc_common::{BytePos, Span};
use swc_ecma_ast::EsVersion;
use swc_ecma_parser::error::Error;
use swc_ecma_parser::input::Tokens;
use swc_ecma_parser::lexer::Lexer;
use swc_ecma_parser::unstable::{Token, TokenAndSpan, TokenFlags, TokenValue};
use swc_ecma_parser::{Context, SyntaxFlags};

pub(crate) const MAX_CONVERTER_NESTING_DEPTH: u32 = 2000;
pub(crate) const DEPTH_LIMIT_MESSAGE: &str =
  "Maximum nesting depth of 2000 exceeded, reduce nesting or split the expression into smaller \
   parts";
pub(crate) const STACK_EXHAUSTED_MESSAGE: &str =
  "Code is nested too deeply, reduce nesting or split the expression into smaller parts";

// The reserve must stay above SWC's own 256 KiB red zone for `stacker::maybe_grow` plus the stack
// consumed between two checks, as a grown heap stack has no relation to the recorded stack limit.
const STACK_RESERVE: usize = 512 * 1024;
#[cfg(debug_assertions)]
const TOKENS_PER_STACK_CHECK: u32 = 8;
#[cfg(not(debug_assertions))]
const TOKENS_PER_STACK_CHECK: u32 = 64;
const STACK_BUDGET_WITHOUT_STACK_INFORMATION: usize = 256 * 1024;

#[derive(Clone)]
pub(crate) struct NestingGuard(Rc<GuardState>);

struct GuardState {
  stack_limit_position: usize,
  stack_budget: usize,
  exceeded_position: Cell<Option<u32>>,
}

impl NestingGuard {
  pub(crate) fn new() -> Self {
    let stack_limit_position = stack_limit_position();
    Self(Rc::new(GuardState {
      stack_limit_position,
      stack_budget: current_stack_position().saturating_sub(stack_limit_position),
      exceeded_position: Cell::new(None),
    }))
  }

  /// The stack the parser may use before the guard trips, which bounds how deeply it can nest
  /// recursively.
  pub(crate) fn stack_budget(&self) -> usize {
    self.0.stack_budget
  }

  pub(crate) fn exceeded_position(&self) -> Option<u32> {
    self.0.exceeded_position.get()
  }

  #[inline(always)]
  fn exceeded(&self) -> bool {
    self.0.exceeded_position.get().is_some()
  }

  #[inline(always)]
  fn trip(&self, position: BytePos) {
    self
      .0
      .exceeded_position
      .set(Some(position.0.saturating_sub(1)));
  }

  #[inline(always)]
  fn is_stack_exhausted(&self, tokens_until_stack_check: &mut u32) -> bool {
    if *tokens_until_stack_check > 1 {
      *tokens_until_stack_check -= 1;
      return false;
    }
    *tokens_until_stack_check = TOKENS_PER_STACK_CHECK;
    current_stack_position() < self.0.stack_limit_position
  }
}

pub(crate) fn current_stack_position() -> usize {
  let marker = black_box(0u8);
  std::ptr::addr_of!(marker) as usize
}

pub(crate) fn stack_limit_position() -> usize {
  let current_stack_position = current_stack_position();
  #[cfg(all(not(target_arch = "wasm32"), not(target_arch = "arm")))]
  if let Some(remaining_stack) = stacker::remaining_stack() {
    let stack_bottom = current_stack_position.saturating_sub(remaining_stack);
    return stack_bottom + STACK_RESERVE;
  }
  current_stack_position.saturating_sub(STACK_BUDGET_WITHOUT_STACK_INFORMATION)
}

/// Syntax trees are recursive, so freeing them recurses once per nesting level. Two bounds cover
/// that: recursively parsed nesting fits into the stack budget the parser was allowed to use, and
/// iteratively parsed chains need at least two source bytes per level. Trees whose stack estimate
/// exceeds `MAX_STACK_SIZE`, and all trees on targets without `stacker`, are intentionally leaked.
pub(crate) fn free_syntax_tree<T>(
  tree: ManuallyDrop<T>,
  code_length: usize,
  parser_stack_budget: usize,
) {
  #[cfg(all(not(target_arch = "wasm32"), not(target_arch = "arm")))]
  {
    const STACK_BYTES_PER_SOURCE_BYTE: usize = 256;
    const MAX_STACK_SIZE: usize = 1024 * 1024 * 1024;
    let stack_size = code_length
      .checked_mul(STACK_BYTES_PER_SOURCE_BYTE)
      .and_then(|size| size.checked_add(parser_stack_budget))
      .filter(|&size| size <= MAX_STACK_SIZE);
    if let Some(stack_size) = stack_size {
      // Keeping the tree inside `ManuallyDrop` until the code runs on the new stack turns a
      // failed allocation into a leak instead of a crash, and panicking here must not cross the
      // napi boundary.
      let _ = catch_unwind(AssertUnwindSafe(move || {
        stacker::grow(stack_size, move || drop(ManuallyDrop::into_inner(tree)));
      }));
    }
  }
  #[cfg(any(target_arch = "wasm32", target_arch = "arm"))]
  {
    // Growing the stack is not available here, so the tree is intentionally leaked instead of
    // risking a stack overflow while freeing it.
    let _ = (code_length, parser_stack_budget);
    std::mem::forget(tree);
  }
}

fn eof_token_at(position: BytePos) -> TokenAndSpan {
  TokenAndSpan {
    had_line_break: false,
    span: Span::new(position, position),
    token: Token::Eof,
  }
}

#[derive(Clone)]
pub(crate) struct GuardedTokens<'a> {
  inner: Lexer<'a>,
  nesting_guard: NestingGuard,
  tokens_until_stack_check: u32,
}

impl<'a> GuardedTokens<'a> {
  pub(crate) fn new(inner: Lexer<'a>, nesting_guard: NestingGuard) -> Self {
    Self {
      inner,
      nesting_guard,
      tokens_until_stack_check: TOKENS_PER_STACK_CHECK,
    }
  }

  #[inline(always)]
  fn guard(&mut self, token: TokenAndSpan) -> TokenAndSpan {
    if self.nesting_guard.exceeded() {
      return eof_token_at(token.span.lo);
    }
    if !self
      .nesting_guard
      .is_stack_exhausted(&mut self.tokens_until_stack_check)
    {
      return token;
    }
    self.nesting_guard.trip(token.span.lo);
    eof_token_at(token.span.lo)
  }
}

impl<'a> Tokens for GuardedTokens<'a> {
  type Checkpoint = <Lexer<'a> as Tokens>::Checkpoint;

  #[inline(always)]
  fn first_token(&mut self) -> TokenAndSpan {
    let token = self.inner.first_token();
    self.guard(token)
  }

  #[inline(always)]
  fn next_token(&mut self) -> TokenAndSpan {
    let token = self.inner.next_token();
    self.guard(token)
  }

  #[inline(always)]
  fn scan_jsx_token(&mut self) -> TokenAndSpan {
    let token = self.inner.scan_jsx_token();
    self.guard(token)
  }

  #[inline(always)]
  fn set_ctx(&mut self, ctx: Context) {
    self.inner.set_ctx(ctx);
  }

  #[inline(always)]
  fn ctx(&self) -> Context {
    self.inner.ctx()
  }

  #[inline(always)]
  fn ctx_mut(&mut self) -> &mut Context {
    self.inner.ctx_mut()
  }

  #[inline(always)]
  fn syntax(&self) -> SyntaxFlags {
    self.inner.syntax()
  }

  #[inline(always)]
  fn target(&self) -> EsVersion {
    self.inner.target()
  }

  #[inline(always)]
  fn checkpoint_save(&self) -> Self::Checkpoint {
    self.inner.checkpoint_save()
  }

  #[inline(always)]
  fn checkpoint_load(&mut self, checkpoint: Self::Checkpoint) {
    self.inner.checkpoint_load(checkpoint);
  }

  #[inline(always)]
  fn read_string(&self, span: Span) -> &str {
    self.inner.read_string(span)
  }

  #[inline(always)]
  fn start_pos(&self) -> BytePos {
    self.inner.start_pos()
  }

  #[inline(always)]
  fn set_expr_allowed(&mut self, allow: bool) {
    self.inner.set_expr_allowed(allow);
  }

  #[inline(always)]
  fn set_next_regexp(&mut self, start: Option<BytePos>) {
    self.inner.set_next_regexp(start);
  }

  #[inline(always)]
  fn add_error(&mut self, error: Error) {
    self.inner.add_error(error);
  }

  #[inline(always)]
  fn add_module_mode_error(&mut self, error: Error) {
    self.inner.add_module_mode_error(error);
  }

  #[inline(always)]
  fn end_pos(&self) -> BytePos {
    self.inner.end_pos()
  }

  #[inline(always)]
  fn take_errors(&mut self) -> Vec<Error> {
    self.inner.take_errors()
  }

  #[inline(always)]
  fn has_errors(&self) -> bool {
    self.inner.has_errors()
  }

  #[inline(always)]
  fn diagnostic_checkpoint_save(&self) -> (usize, usize) {
    self.inner.diagnostic_checkpoint_save()
  }

  #[inline(always)]
  fn diagnostic_checkpoint_load(&mut self, checkpoint: (usize, usize)) {
    self.inner.diagnostic_checkpoint_load(checkpoint);
  }

  #[inline(always)]
  fn take_script_module_errors(&mut self) -> Vec<Error> {
    self.inner.take_script_module_errors()
  }

  #[inline(always)]
  fn set_defer_comments(&mut self, defer: bool) {
    self.inner.set_defer_comments(defer);
  }

  #[inline(always)]
  fn finalize_comments(&mut self) {
    self.inner.finalize_comments();
  }

  #[inline(always)]
  fn update_token_flags(&mut self, update: impl FnOnce(&mut TokenFlags)) {
    self.inner.update_token_flags(update);
  }

  #[inline(always)]
  fn token_flags(&self) -> TokenFlags {
    self.inner.token_flags()
  }

  #[inline(always)]
  fn clone_token_value(&self) -> Option<TokenValue> {
    self.inner.clone_token_value()
  }

  #[inline(always)]
  fn take_token_value(&mut self) -> Option<TokenValue> {
    self.inner.take_token_value()
  }

  #[inline(always)]
  fn get_token_value(&self) -> Option<&TokenValue> {
    self.inner.get_token_value()
  }

  #[inline(always)]
  fn set_token_value(&mut self, token_value: Option<TokenValue>) {
    self.inner.set_token_value(token_value);
  }

  #[inline(always)]
  fn scan_jsx_open_el_terminal_token(&mut self) -> TokenAndSpan {
    self.inner.scan_jsx_open_el_terminal_token()
  }

  #[inline(always)]
  fn rescan_jsx_open_el_terminal_token(&mut self, reset: BytePos) -> TokenAndSpan {
    self.inner.rescan_jsx_open_el_terminal_token(reset)
  }

  #[inline(always)]
  fn rescan_jsx_token(&mut self, reset: BytePos) -> TokenAndSpan {
    self.inner.rescan_jsx_token(reset)
  }

  #[inline(always)]
  fn rescan_type_gt(&mut self, span: Span) -> TokenAndSpan {
    self.inner.rescan_type_gt(span)
  }

  #[inline(always)]
  fn scan_jsx_identifier(&mut self, start: BytePos) -> TokenAndSpan {
    self.inner.scan_jsx_identifier(start)
  }

  #[inline(always)]
  fn scan_jsx_attribute_value(&mut self) -> TokenAndSpan {
    self.inner.scan_jsx_attribute_value()
  }

  #[inline(always)]
  fn rescan_template_token(&mut self, start: BytePos, start_with_back_tick: bool) -> TokenAndSpan {
    self
      .inner
      .rescan_template_token(start, start_with_back_tick)
  }
}
