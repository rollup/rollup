use std::cell::RefCell;

use swc_common::comments::{Comment, Comments};
use swc_common::BytePos;

#[derive(Default)]
pub struct SequentialComments {
  annotations: RefCell<Vec<AnnotationWithType>>,
}

impl SequentialComments {
  pub fn add_comment(&self, comment: Comment) {
    if comment.text.starts_with('#') && comment.text.contains("sourceMappingURL=") {
      self.annotations.borrow_mut().push(AnnotationWithType {
        comment,
        kind: CommentKind::Annotation(AnnotationKind::SourceMappingUrl),
      });
      return;
    }
    let mut search_position = comment
      .text
      .chars()
      .nth(0)
      .map(|first_char| first_char.len_utf8())
      .unwrap_or(0);
    while let Some(Some(match_position)) = comment.text.get(search_position..).map(|s| s.find("__"))
    {
      search_position += match_position;
      // Using a byte reference avoids UTF8 character boundary checks
      match &comment.text.as_bytes()[search_position - 1] {
        b'@' | b'#' => {
          let annotation_slice = &comment.text[search_position..];
          if annotation_slice.starts_with("__PURE__") {
            self.annotations.borrow_mut().push(AnnotationWithType {
              comment,
              kind: CommentKind::Annotation(AnnotationKind::Pure),
            });
            return;
          }
          if annotation_slice.starts_with("__NO_SIDE_EFFECTS__") {
            self.annotations.borrow_mut().push(AnnotationWithType {
              comment,
              kind: CommentKind::Annotation(AnnotationKind::NoSideEffects),
            });
            return;
          }
        }
        _ => {}
      }
      search_position += 2;
    }
    self.annotations.borrow_mut().push(AnnotationWithType {
      comment,
      kind: CommentKind::Comment,
    });
  }

  pub fn take_annotations(self) -> Vec<AnnotationWithType> {
    self.annotations.take()
  }
}

impl Comments for SequentialComments {
  fn add_leading(&self, _: BytePos, comment: Comment) {
    self.add_comment(comment);
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn add_leading_comments(&self, _: BytePos, _: Vec<Comment>) {
    panic!("add_leading_comments");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn has_leading(&self, _: BytePos) -> bool {
    panic!("has_leading");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn move_leading(&self, _: BytePos, _: BytePos) {
    panic!("move_leading");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn take_leading(&self, _: BytePos) -> Option<Vec<Comment>> {
    panic!("take_leading");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn get_leading(&self, _: BytePos) -> Option<Vec<Comment>> {
    panic!("get_leading");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn add_trailing(&self, _: BytePos, comment: Comment) {
    self.add_comment(comment);
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn add_trailing_comments(&self, _: BytePos, _: Vec<Comment>) {
    panic!("add_trailing_comments");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn has_trailing(&self, _: BytePos) -> bool {
    panic!("has_trailing");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn move_trailing(&self, _: BytePos, _: BytePos) {
    panic!("move_trailing");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn take_trailing(&self, _: BytePos) -> Option<Vec<Comment>> {
    panic!("take_trailing");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn get_trailing(&self, _: BytePos) -> Option<Vec<Comment>> {
    panic!("get_trailing");
  }

  #[cfg_attr(not(debug_assertions), inline(always))]
  fn add_pure_comment(&self, _: BytePos) {
    panic!("add_pure_comment");
  }
}

#[derive(Debug)]
pub struct AnnotationWithType {
  pub comment: Comment,
  pub kind: CommentKind,
}

#[derive(Clone, Debug)]
pub enum CommentKind {
  Annotation(AnnotationKind),
  Comment,
}

#[derive(Clone, PartialEq, Debug)]
pub enum AnnotationKind {
  Pure,
  NoSideEffects,
  SourceMappingUrl,
}
