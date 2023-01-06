import {
  completeFromList,
  ifNotIn,
  snippetCompletion
} from "./chunk-4RB5SIJ6.js";
import {
  DefaultBufferLength,
  IterMode,
  LRLanguage,
  LanguageSupport,
  NodeProp,
  NodeSet,
  NodeType,
  NodeWeakMap,
  Parser,
  Tree,
  continuedIndent,
  delimitedIndent,
  flatIndent,
  foldInside,
  foldNodeProp,
  indentNodeProp,
  styleTags,
  syntaxTree,
  tags
} from "./chunk-2MYQJOSS.js";
import {
  EditorView
} from "./chunk-Q36JF3OM.js";
import {
  EditorSelection
} from "./chunk-UGM4PYQV.js";

// node_modules/@lezer/lr/dist/index.js
var Stack = class {
  /// @internal
  constructor(p, stack, state, reducePos, pos, score, buffer, bufferBase, curContext, lookAhead = 0, parent) {
    this.p = p;
    this.stack = stack;
    this.state = state;
    this.reducePos = reducePos;
    this.pos = pos;
    this.score = score;
    this.buffer = buffer;
    this.bufferBase = bufferBase;
    this.curContext = curContext;
    this.lookAhead = lookAhead;
    this.parent = parent;
  }
  /// @internal
  toString() {
    return `[${this.stack.filter((_, i) => i % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
  }
  // Start an empty stack
  /// @internal
  static start(p, state, pos = 0) {
    let cx = p.parser.context;
    return new Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, 0, null);
  }
  /// The stack's current [context](#lr.ContextTracker) value, if
  /// any. Its type will depend on the context tracker's type
  /// parameter, or it will be `null` if there is no context
  /// tracker.
  get context() {
    return this.curContext ? this.curContext.context : null;
  }
  // Push a state onto the stack, tracking its start position as well
  // as the buffer base at that point.
  /// @internal
  pushState(state, start) {
    this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
    this.state = state;
  }
  // Apply a reduce action
  /// @internal
  reduce(action) {
    let depth = action >> 19, type = action & 65535;
    let { parser: parser2 } = this.p;
    let dPrec = parser2.dynamicPrecedence(type);
    if (dPrec)
      this.score += dPrec;
    if (depth == 0) {
      this.pushState(parser2.getGoto(this.state, type, true), this.reducePos);
      if (type < parser2.minRepeatTerm)
        this.storeNode(type, this.reducePos, this.reducePos, 4, true);
      this.reduceContext(type, this.reducePos);
      return;
    }
    let base = this.stack.length - (depth - 1) * 3 - (action & 262144 ? 6 : 0);
    let start = this.stack[base - 2];
    let bufferBase = this.stack[base - 1], count = this.bufferBase + this.buffer.length - bufferBase;
    if (type < parser2.minRepeatTerm || action & 131072) {
      let pos = parser2.stateFlag(
        this.state,
        1
        /* Skipped */
      ) ? this.pos : this.reducePos;
      this.storeNode(type, start, pos, count + 4, true);
    }
    if (action & 262144) {
      this.state = this.stack[base];
    } else {
      let baseStateID = this.stack[base - 3];
      this.state = parser2.getGoto(baseStateID, type, true);
    }
    while (this.stack.length > base)
      this.stack.pop();
    this.reduceContext(type, start);
  }
  // Shift a value into the buffer
  /// @internal
  storeNode(term, start, end, size = 4, isReduce = false) {
    if (term == 0 && (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
      let cur = this, top = this.buffer.length;
      if (top == 0 && cur.parent) {
        top = cur.bufferBase - cur.parent.bufferBase;
        cur = cur.parent;
      }
      if (top > 0 && cur.buffer[top - 4] == 0 && cur.buffer[top - 1] > -1) {
        if (start == end)
          return;
        if (cur.buffer[top - 2] >= start) {
          cur.buffer[top - 2] = end;
          return;
        }
      }
    }
    if (!isReduce || this.pos == end) {
      this.buffer.push(term, start, end, size);
    } else {
      let index = this.buffer.length;
      if (index > 0 && this.buffer[index - 4] != 0)
        while (index > 0 && this.buffer[index - 2] > end) {
          this.buffer[index] = this.buffer[index - 4];
          this.buffer[index + 1] = this.buffer[index - 3];
          this.buffer[index + 2] = this.buffer[index - 2];
          this.buffer[index + 3] = this.buffer[index - 1];
          index -= 4;
          if (size > 4)
            size -= 4;
        }
      this.buffer[index] = term;
      this.buffer[index + 1] = start;
      this.buffer[index + 2] = end;
      this.buffer[index + 3] = size;
    }
  }
  // Apply a shift action
  /// @internal
  shift(action, next, nextEnd) {
    let start = this.pos;
    if (action & 131072) {
      this.pushState(action & 65535, this.pos);
    } else if ((action & 262144) == 0) {
      let nextState = action, { parser: parser2 } = this.p;
      if (nextEnd > this.pos || next <= parser2.maxNode) {
        this.pos = nextEnd;
        if (!parser2.stateFlag(
          nextState,
          1
          /* Skipped */
        ))
          this.reducePos = nextEnd;
      }
      this.pushState(nextState, start);
      this.shiftContext(next, start);
      if (next <= parser2.maxNode)
        this.buffer.push(next, start, nextEnd, 4);
    } else {
      this.pos = nextEnd;
      this.shiftContext(next, start);
      if (next <= this.p.parser.maxNode)
        this.buffer.push(next, start, nextEnd, 4);
    }
  }
  // Apply an action
  /// @internal
  apply(action, next, nextEnd) {
    if (action & 65536)
      this.reduce(action);
    else
      this.shift(action, next, nextEnd);
  }
  // Add a prebuilt (reused) node into the buffer.
  /// @internal
  useNode(value, next) {
    let index = this.p.reused.length - 1;
    if (index < 0 || this.p.reused[index] != value) {
      this.p.reused.push(value);
      index++;
    }
    let start = this.pos;
    this.reducePos = this.pos = start + value.length;
    this.pushState(next, start);
    this.buffer.push(
      index,
      start,
      this.reducePos,
      -1
      /* size == -1 means this is a reused value */
    );
    if (this.curContext)
      this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this, this.p.stream.reset(this.pos - value.length)));
  }
  // Split the stack. Due to the buffer sharing and the fact
  // that `this.stack` tends to stay quite shallow, this isn't very
  // expensive.
  /// @internal
  split() {
    let parent = this;
    let off = parent.buffer.length;
    while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
      off -= 4;
    let buffer = parent.buffer.slice(off), base = parent.bufferBase + off;
    while (parent && base == parent.bufferBase)
      parent = parent.parent;
    return new Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base, this.curContext, this.lookAhead, parent);
  }
  // Try to recover from an error by 'deleting' (ignoring) one token.
  /// @internal
  recoverByDelete(next, nextEnd) {
    let isNode = next <= this.p.parser.maxNode;
    if (isNode)
      this.storeNode(next, this.pos, nextEnd, 4);
    this.storeNode(0, this.pos, nextEnd, isNode ? 8 : 4);
    this.pos = this.reducePos = nextEnd;
    this.score -= 190;
  }
  /// Check if the given term would be able to be shifted (optionally
  /// after some reductions) on this stack. This can be useful for
  /// external tokenizers that want to make sure they only provide a
  /// given token when it applies.
  canShift(term) {
    for (let sim = new SimulatedStack(this); ; ) {
      let action = this.p.parser.stateSlot(
        sim.state,
        4
        /* DefaultReduce */
      ) || this.p.parser.hasAction(sim.state, term);
      if (action == 0)
        return false;
      if ((action & 65536) == 0)
        return true;
      sim.reduce(action);
    }
  }
  // Apply up to Recover.MaxNext recovery actions that conceptually
  // inserts some missing token or rule.
  /// @internal
  recoverByInsert(next) {
    if (this.stack.length >= 300)
      return [];
    let nextStates = this.p.parser.nextStates(this.state);
    if (nextStates.length > 4 << 1 || this.stack.length >= 120) {
      let best = [];
      for (let i = 0, s; i < nextStates.length; i += 2) {
        if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next))
          best.push(nextStates[i], s);
      }
      if (this.stack.length < 120)
        for (let i = 0; best.length < 4 << 1 && i < nextStates.length; i += 2) {
          let s = nextStates[i + 1];
          if (!best.some((v, i2) => i2 & 1 && v == s))
            best.push(nextStates[i], s);
        }
      nextStates = best;
    }
    let result = [];
    for (let i = 0; i < nextStates.length && result.length < 4; i += 2) {
      let s = nextStates[i + 1];
      if (s == this.state)
        continue;
      let stack = this.split();
      stack.pushState(s, this.pos);
      stack.storeNode(0, stack.pos, stack.pos, 4, true);
      stack.shiftContext(nextStates[i], this.pos);
      stack.score -= 200;
      result.push(stack);
    }
    return result;
  }
  // Force a reduce, if possible. Return false if that can't
  // be done.
  /// @internal
  forceReduce() {
    let reduce = this.p.parser.stateSlot(
      this.state,
      5
      /* ForcedReduce */
    );
    if ((reduce & 65536) == 0)
      return false;
    let { parser: parser2 } = this.p;
    if (!parser2.validAction(this.state, reduce)) {
      let depth = reduce >> 19, term = reduce & 65535;
      let target = this.stack.length - depth * 3;
      if (target < 0 || parser2.getGoto(this.stack[target], term, false) < 0)
        return false;
      this.storeNode(0, this.reducePos, this.reducePos, 4, true);
      this.score -= 100;
    }
    this.reducePos = this.pos;
    this.reduce(reduce);
    return true;
  }
  /// @internal
  forceAll() {
    while (!this.p.parser.stateFlag(
      this.state,
      2
      /* Accepting */
    )) {
      if (!this.forceReduce()) {
        this.storeNode(0, this.pos, this.pos, 4, true);
        break;
      }
    }
    return this;
  }
  /// Check whether this state has no further actions (assumed to be a direct descendant of the
  /// top state, since any other states must be able to continue
  /// somehow). @internal
  get deadEnd() {
    if (this.stack.length != 3)
      return false;
    let { parser: parser2 } = this.p;
    return parser2.data[parser2.stateSlot(
      this.state,
      1
      /* Actions */
    )] == 65535 && !parser2.stateSlot(
      this.state,
      4
      /* DefaultReduce */
    );
  }
  /// Restart the stack (put it back in its start state). Only safe
  /// when this.stack.length == 3 (state is directly below the top
  /// state). @internal
  restart() {
    this.state = this.stack[0];
    this.stack.length = 0;
  }
  /// @internal
  sameState(other) {
    if (this.state != other.state || this.stack.length != other.stack.length)
      return false;
    for (let i = 0; i < this.stack.length; i += 3)
      if (this.stack[i] != other.stack[i])
        return false;
    return true;
  }
  /// Get the parser used by this stack.
  get parser() {
    return this.p.parser;
  }
  /// Test whether a given dialect (by numeric ID, as exported from
  /// the terms file) is enabled.
  dialectEnabled(dialectID) {
    return this.p.parser.dialect.flags[dialectID];
  }
  shiftContext(term, start) {
    if (this.curContext)
      this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this, this.p.stream.reset(start)));
  }
  reduceContext(term, start) {
    if (this.curContext)
      this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this, this.p.stream.reset(start)));
  }
  /// @internal
  emitContext() {
    let last = this.buffer.length - 1;
    if (last < 0 || this.buffer[last] != -3)
      this.buffer.push(this.curContext.hash, this.reducePos, this.reducePos, -3);
  }
  /// @internal
  emitLookAhead() {
    let last = this.buffer.length - 1;
    if (last < 0 || this.buffer[last] != -4)
      this.buffer.push(this.lookAhead, this.reducePos, this.reducePos, -4);
  }
  updateContext(context) {
    if (context != this.curContext.context) {
      let newCx = new StackContext(this.curContext.tracker, context);
      if (newCx.hash != this.curContext.hash)
        this.emitContext();
      this.curContext = newCx;
    }
  }
  /// @internal
  setLookAhead(lookAhead) {
    if (lookAhead > this.lookAhead) {
      this.emitLookAhead();
      this.lookAhead = lookAhead;
    }
  }
  /// @internal
  close() {
    if (this.curContext && this.curContext.tracker.strict)
      this.emitContext();
    if (this.lookAhead > 0)
      this.emitLookAhead();
  }
};
var StackContext = class {
  constructor(tracker, context) {
    this.tracker = tracker;
    this.context = context;
    this.hash = tracker.strict ? tracker.hash(context) : 0;
  }
};
var Recover;
(function(Recover2) {
  Recover2[Recover2["Insert"] = 200] = "Insert";
  Recover2[Recover2["Delete"] = 190] = "Delete";
  Recover2[Recover2["Reduce"] = 100] = "Reduce";
  Recover2[Recover2["MaxNext"] = 4] = "MaxNext";
  Recover2[Recover2["MaxInsertStackDepth"] = 300] = "MaxInsertStackDepth";
  Recover2[Recover2["DampenInsertStackDepth"] = 120] = "DampenInsertStackDepth";
})(Recover || (Recover = {}));
var SimulatedStack = class {
  constructor(start) {
    this.start = start;
    this.state = start.state;
    this.stack = start.stack;
    this.base = this.stack.length;
  }
  reduce(action) {
    let term = action & 65535, depth = action >> 19;
    if (depth == 0) {
      if (this.stack == this.start.stack)
        this.stack = this.stack.slice();
      this.stack.push(this.state, 0, 0);
      this.base += 3;
    } else {
      this.base -= (depth - 1) * 3;
    }
    let goto = this.start.p.parser.getGoto(this.stack[this.base - 3], term, true);
    this.state = goto;
  }
};
var StackBufferCursor = class {
  constructor(stack, pos, index) {
    this.stack = stack;
    this.pos = pos;
    this.index = index;
    this.buffer = stack.buffer;
    if (this.index == 0)
      this.maybeNext();
  }
  static create(stack, pos = stack.bufferBase + stack.buffer.length) {
    return new StackBufferCursor(stack, pos, pos - stack.bufferBase);
  }
  maybeNext() {
    let next = this.stack.parent;
    if (next != null) {
      this.index = this.stack.bufferBase - next.bufferBase;
      this.stack = next;
      this.buffer = next.buffer;
    }
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  next() {
    this.index -= 4;
    this.pos -= 4;
    if (this.index == 0)
      this.maybeNext();
  }
  fork() {
    return new StackBufferCursor(this.stack, this.pos, this.index);
  }
};
var CachedToken = class {
  constructor() {
    this.start = -1;
    this.value = -1;
    this.end = -1;
    this.extended = -1;
    this.lookAhead = 0;
    this.mask = 0;
    this.context = 0;
  }
};
var nullToken = new CachedToken();
var InputStream = class {
  /// @internal
  constructor(input, ranges) {
    this.input = input;
    this.ranges = ranges;
    this.chunk = "";
    this.chunkOff = 0;
    this.chunk2 = "";
    this.chunk2Pos = 0;
    this.next = -1;
    this.token = nullToken;
    this.rangeIndex = 0;
    this.pos = this.chunkPos = ranges[0].from;
    this.range = ranges[0];
    this.end = ranges[ranges.length - 1].to;
    this.readNext();
  }
  /// @internal
  resolveOffset(offset, assoc) {
    let range = this.range, index = this.rangeIndex;
    let pos = this.pos + offset;
    while (pos < range.from) {
      if (!index)
        return null;
      let next = this.ranges[--index];
      pos -= range.from - next.to;
      range = next;
    }
    while (assoc < 0 ? pos > range.to : pos >= range.to) {
      if (index == this.ranges.length - 1)
        return null;
      let next = this.ranges[++index];
      pos += next.from - range.to;
      range = next;
    }
    return pos;
  }
  /// @internal
  clipPos(pos) {
    if (pos >= this.range.from && pos < this.range.to)
      return pos;
    for (let range of this.ranges)
      if (range.to > pos)
        return Math.max(pos, range.from);
    return this.end;
  }
  /// Look at a code unit near the stream position. `.peek(0)` equals
  /// `.next`, `.peek(-1)` gives you the previous character, and so
  /// on.
  ///
  /// Note that looking around during tokenizing creates dependencies
  /// on potentially far-away content, which may reduce the
  /// effectiveness incremental parsing—when looking forward—or even
  /// cause invalid reparses when looking backward more than 25 code
  /// units, since the library does not track lookbehind.
  peek(offset) {
    let idx = this.chunkOff + offset, pos, result;
    if (idx >= 0 && idx < this.chunk.length) {
      pos = this.pos + offset;
      result = this.chunk.charCodeAt(idx);
    } else {
      let resolved = this.resolveOffset(offset, 1);
      if (resolved == null)
        return -1;
      pos = resolved;
      if (pos >= this.chunk2Pos && pos < this.chunk2Pos + this.chunk2.length) {
        result = this.chunk2.charCodeAt(pos - this.chunk2Pos);
      } else {
        let i = this.rangeIndex, range = this.range;
        while (range.to <= pos)
          range = this.ranges[++i];
        this.chunk2 = this.input.chunk(this.chunk2Pos = pos);
        if (pos + this.chunk2.length > range.to)
          this.chunk2 = this.chunk2.slice(0, range.to - pos);
        result = this.chunk2.charCodeAt(0);
      }
    }
    if (pos >= this.token.lookAhead)
      this.token.lookAhead = pos + 1;
    return result;
  }
  /// Accept a token. By default, the end of the token is set to the
  /// current stream position, but you can pass an offset (relative to
  /// the stream position) to change that.
  acceptToken(token, endOffset = 0) {
    let end = endOffset ? this.resolveOffset(endOffset, -1) : this.pos;
    if (end == null || end < this.token.start)
      throw new RangeError("Token end out of bounds");
    this.token.value = token;
    this.token.end = end;
  }
  getChunk() {
    if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
      let { chunk, chunkPos } = this;
      this.chunk = this.chunk2;
      this.chunkPos = this.chunk2Pos;
      this.chunk2 = chunk;
      this.chunk2Pos = chunkPos;
      this.chunkOff = this.pos - this.chunkPos;
    } else {
      this.chunk2 = this.chunk;
      this.chunk2Pos = this.chunkPos;
      let nextChunk = this.input.chunk(this.pos);
      let end = this.pos + nextChunk.length;
      this.chunk = end > this.range.to ? nextChunk.slice(0, this.range.to - this.pos) : nextChunk;
      this.chunkPos = this.pos;
      this.chunkOff = 0;
    }
  }
  readNext() {
    if (this.chunkOff >= this.chunk.length) {
      this.getChunk();
      if (this.chunkOff == this.chunk.length)
        return this.next = -1;
    }
    return this.next = this.chunk.charCodeAt(this.chunkOff);
  }
  /// Move the stream forward N (defaults to 1) code units. Returns
  /// the new value of [`next`](#lr.InputStream.next).
  advance(n = 1) {
    this.chunkOff += n;
    while (this.pos + n >= this.range.to) {
      if (this.rangeIndex == this.ranges.length - 1)
        return this.setDone();
      n -= this.range.to - this.pos;
      this.range = this.ranges[++this.rangeIndex];
      this.pos = this.range.from;
    }
    this.pos += n;
    if (this.pos >= this.token.lookAhead)
      this.token.lookAhead = this.pos + 1;
    return this.readNext();
  }
  setDone() {
    this.pos = this.chunkPos = this.end;
    this.range = this.ranges[this.rangeIndex = this.ranges.length - 1];
    this.chunk = "";
    return this.next = -1;
  }
  /// @internal
  reset(pos, token) {
    if (token) {
      this.token = token;
      token.start = pos;
      token.lookAhead = pos + 1;
      token.value = token.extended = -1;
    } else {
      this.token = nullToken;
    }
    if (this.pos != pos) {
      this.pos = pos;
      if (pos == this.end) {
        this.setDone();
        return this;
      }
      while (pos < this.range.from)
        this.range = this.ranges[--this.rangeIndex];
      while (pos >= this.range.to)
        this.range = this.ranges[++this.rangeIndex];
      if (pos >= this.chunkPos && pos < this.chunkPos + this.chunk.length) {
        this.chunkOff = pos - this.chunkPos;
      } else {
        this.chunk = "";
        this.chunkOff = 0;
      }
      this.readNext();
    }
    return this;
  }
  /// @internal
  read(from, to) {
    if (from >= this.chunkPos && to <= this.chunkPos + this.chunk.length)
      return this.chunk.slice(from - this.chunkPos, to - this.chunkPos);
    if (from >= this.chunk2Pos && to <= this.chunk2Pos + this.chunk2.length)
      return this.chunk2.slice(from - this.chunk2Pos, to - this.chunk2Pos);
    if (from >= this.range.from && to <= this.range.to)
      return this.input.read(from, to);
    let result = "";
    for (let r of this.ranges) {
      if (r.from >= to)
        break;
      if (r.to > from)
        result += this.input.read(Math.max(r.from, from), Math.min(r.to, to));
    }
    return result;
  }
};
var TokenGroup = class {
  constructor(data, id2) {
    this.data = data;
    this.id = id2;
  }
  token(input, stack) {
    readToken(this.data, input, stack, this.id);
  }
};
TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
var ExternalTokenizer = class {
  /// Create a tokenizer. The first argument is the function that,
  /// given an input stream, scans for the types of tokens it
  /// recognizes at the stream's position, and calls
  /// [`acceptToken`](#lr.InputStream.acceptToken) when it finds
  /// one.
  constructor(token, options = {}) {
    this.token = token;
    this.contextual = !!options.contextual;
    this.fallback = !!options.fallback;
    this.extend = !!options.extend;
  }
};
function readToken(data, input, stack, group) {
  let state = 0, groupMask = 1 << group, { parser: parser2 } = stack.p, { dialect } = parser2;
  scan:
    for (; ; ) {
      if ((groupMask & data[state]) == 0)
        break;
      let accEnd = data[state + 1];
      for (let i = state + 3; i < accEnd; i += 2)
        if ((data[i + 1] & groupMask) > 0) {
          let term = data[i];
          if (dialect.allows(term) && (input.token.value == -1 || input.token.value == term || parser2.overrides(term, input.token.value))) {
            input.acceptToken(term);
            break;
          }
        }
      let next = input.next, low = 0, high = data[state + 2];
      if (input.next < 0 && high > low && data[accEnd + high * 3 - 3] == 65535 && data[accEnd + high * 3 - 3] == 65535) {
        state = data[accEnd + high * 3 - 1];
        continue scan;
      }
      for (; low < high; ) {
        let mid = low + high >> 1;
        let index = accEnd + mid + (mid << 1);
        let from = data[index], to = data[index + 1] || 65536;
        if (next < from)
          high = mid;
        else if (next >= to)
          low = mid + 1;
        else {
          state = data[index + 2];
          input.advance();
          continue scan;
        }
      }
      break;
    }
}
function decodeArray(input, Type = Uint16Array) {
  if (typeof input != "string")
    return input;
  let array = null;
  for (let pos = 0, out = 0; pos < input.length; ) {
    let value = 0;
    for (; ; ) {
      let next = input.charCodeAt(pos++), stop = false;
      if (next == 126) {
        value = 65535;
        break;
      }
      if (next >= 92)
        next--;
      if (next >= 34)
        next--;
      let digit = next - 32;
      if (digit >= 46) {
        digit -= 46;
        stop = true;
      }
      value += digit;
      if (stop)
        break;
      value *= 46;
    }
    if (array)
      array[out++] = value;
    else
      array = new Type(value);
  }
  return array;
}
var verbose = typeof process != "undefined" && process.env && /\bparse\b/.test(process.env.LOG);
var stackIDs = null;
var Safety;
(function(Safety2) {
  Safety2[Safety2["Margin"] = 25] = "Margin";
})(Safety || (Safety = {}));
function cutAt(tree, pos, side) {
  let cursor = tree.cursor(IterMode.IncludeAnonymous);
  cursor.moveTo(pos);
  for (; ; ) {
    if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
      for (; ; ) {
        if ((side < 0 ? cursor.to < pos : cursor.from > pos) && !cursor.type.isError)
          return side < 0 ? Math.max(0, Math.min(
            cursor.to - 1,
            pos - 25
            /* Margin */
          )) : Math.min(tree.length, Math.max(
            cursor.from + 1,
            pos + 25
            /* Margin */
          ));
        if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
          break;
        if (!cursor.parent())
          return side < 0 ? 0 : tree.length;
      }
  }
}
var FragmentCursor = class {
  constructor(fragments, nodeSet) {
    this.fragments = fragments;
    this.nodeSet = nodeSet;
    this.i = 0;
    this.fragment = null;
    this.safeFrom = -1;
    this.safeTo = -1;
    this.trees = [];
    this.start = [];
    this.index = [];
    this.nextFragment();
  }
  nextFragment() {
    let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
    if (fr) {
      this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
      this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
      while (this.trees.length) {
        this.trees.pop();
        this.start.pop();
        this.index.pop();
      }
      this.trees.push(fr.tree);
      this.start.push(-fr.offset);
      this.index.push(0);
      this.nextStart = this.safeFrom;
    } else {
      this.nextStart = 1e9;
    }
  }
  // `pos` must be >= any previously given `pos` for this cursor
  nodeAt(pos) {
    if (pos < this.nextStart)
      return null;
    while (this.fragment && this.safeTo <= pos)
      this.nextFragment();
    if (!this.fragment)
      return null;
    for (; ; ) {
      let last = this.trees.length - 1;
      if (last < 0) {
        this.nextFragment();
        return null;
      }
      let top = this.trees[last], index = this.index[last];
      if (index == top.children.length) {
        this.trees.pop();
        this.start.pop();
        this.index.pop();
        continue;
      }
      let next = top.children[index];
      let start = this.start[last] + top.positions[index];
      if (start > pos) {
        this.nextStart = start;
        return null;
      }
      if (next instanceof Tree) {
        if (start == pos) {
          if (start < this.safeFrom)
            return null;
          let end = start + next.length;
          if (end <= this.safeTo) {
            let lookAhead = next.prop(NodeProp.lookAhead);
            if (!lookAhead || end + lookAhead < this.fragment.to)
              return next;
          }
        }
        this.index[last]++;
        if (start + next.length >= Math.max(this.safeFrom, pos)) {
          this.trees.push(next);
          this.start.push(start);
          this.index.push(0);
        }
      } else {
        this.index[last]++;
        this.nextStart = start + next.length;
      }
    }
  }
};
var TokenCache = class {
  constructor(parser2, stream) {
    this.stream = stream;
    this.tokens = [];
    this.mainToken = null;
    this.actions = [];
    this.tokens = parser2.tokenizers.map((_) => new CachedToken());
  }
  getActions(stack) {
    let actionIndex = 0;
    let main = null;
    let { parser: parser2 } = stack.p, { tokenizers } = parser2;
    let mask = parser2.stateSlot(
      stack.state,
      3
      /* TokenizerMask */
    );
    let context = stack.curContext ? stack.curContext.hash : 0;
    let lookAhead = 0;
    for (let i = 0; i < tokenizers.length; i++) {
      if ((1 << i & mask) == 0)
        continue;
      let tokenizer = tokenizers[i], token = this.tokens[i];
      if (main && !tokenizer.fallback)
        continue;
      if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
        this.updateCachedToken(token, tokenizer, stack);
        token.mask = mask;
        token.context = context;
      }
      if (token.lookAhead > token.end + 25)
        lookAhead = Math.max(token.lookAhead, lookAhead);
      if (token.value != 0) {
        let startIndex = actionIndex;
        if (token.extended > -1)
          actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
        actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
        if (!tokenizer.extend) {
          main = token;
          if (actionIndex > startIndex)
            break;
        }
      }
    }
    while (this.actions.length > actionIndex)
      this.actions.pop();
    if (lookAhead)
      stack.setLookAhead(lookAhead);
    if (!main && stack.pos == this.stream.end) {
      main = new CachedToken();
      main.value = stack.p.parser.eofTerm;
      main.start = main.end = stack.pos;
      actionIndex = this.addActions(stack, main.value, main.end, actionIndex);
    }
    this.mainToken = main;
    return this.actions;
  }
  getMainToken(stack) {
    if (this.mainToken)
      return this.mainToken;
    let main = new CachedToken(), { pos, p } = stack;
    main.start = pos;
    main.end = Math.min(pos + 1, p.stream.end);
    main.value = pos == p.stream.end ? p.parser.eofTerm : 0;
    return main;
  }
  updateCachedToken(token, tokenizer, stack) {
    let start = this.stream.clipPos(stack.pos);
    tokenizer.token(this.stream.reset(start, token), stack);
    if (token.value > -1) {
      let { parser: parser2 } = stack.p;
      for (let i = 0; i < parser2.specialized.length; i++)
        if (parser2.specialized[i] == token.value) {
          let result = parser2.specializers[i](this.stream.read(token.start, token.end), stack);
          if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
            if ((result & 1) == 0)
              token.value = result >> 1;
            else
              token.extended = result >> 1;
            break;
          }
        }
    } else {
      token.value = 0;
      token.end = this.stream.clipPos(start + 1);
    }
  }
  putAction(action, token, end, index) {
    for (let i = 0; i < index; i += 3)
      if (this.actions[i] == action)
        return index;
    this.actions[index++] = action;
    this.actions[index++] = token;
    this.actions[index++] = end;
    return index;
  }
  addActions(stack, token, end, index) {
    let { state } = stack, { parser: parser2 } = stack.p, { data } = parser2;
    for (let set = 0; set < 2; set++) {
      for (let i = parser2.stateSlot(
        state,
        set ? 2 : 1
        /* Actions */
      ); ; i += 3) {
        if (data[i] == 65535) {
          if (data[i + 1] == 1) {
            i = pair(data, i + 2);
          } else {
            if (index == 0 && data[i + 1] == 2)
              index = this.putAction(pair(data, i + 2), token, end, index);
            break;
          }
        }
        if (data[i] == token)
          index = this.putAction(pair(data, i + 1), token, end, index);
      }
    }
    return index;
  }
};
var Rec;
(function(Rec2) {
  Rec2[Rec2["Distance"] = 5] = "Distance";
  Rec2[Rec2["MaxRemainingPerStep"] = 3] = "MaxRemainingPerStep";
  Rec2[Rec2["MinBufferLengthPrune"] = 500] = "MinBufferLengthPrune";
  Rec2[Rec2["ForceReduceLimit"] = 10] = "ForceReduceLimit";
  Rec2[Rec2["CutDepth"] = 15e3] = "CutDepth";
  Rec2[Rec2["CutTo"] = 9e3] = "CutTo";
})(Rec || (Rec = {}));
var Parse = class {
  constructor(parser2, input, fragments, ranges) {
    this.parser = parser2;
    this.input = input;
    this.ranges = ranges;
    this.recovering = 0;
    this.nextStackID = 9812;
    this.minStackPos = 0;
    this.reused = [];
    this.stoppedAt = null;
    this.stream = new InputStream(input, ranges);
    this.tokens = new TokenCache(parser2, this.stream);
    this.topTerm = parser2.top[1];
    let { from } = ranges[0];
    this.stacks = [Stack.start(this, parser2.top[0], from)];
    this.fragments = fragments.length && this.stream.end - from > parser2.bufferLength * 4 ? new FragmentCursor(fragments, parser2.nodeSet) : null;
  }
  get parsedPos() {
    return this.minStackPos;
  }
  // Move the parser forward. This will process all parse stacks at
  // `this.pos` and try to advance them to a further position. If no
  // stack for such a position is found, it'll start error-recovery.
  //
  // When the parse is finished, this will return a syntax tree. When
  // not, it returns `null`.
  advance() {
    let stacks = this.stacks, pos = this.minStackPos;
    let newStacks = this.stacks = [];
    let stopped, stoppedTokens;
    for (let i = 0; i < stacks.length; i++) {
      let stack = stacks[i];
      for (; ; ) {
        this.tokens.mainToken = null;
        if (stack.pos > pos) {
          newStacks.push(stack);
        } else if (this.advanceStack(stack, newStacks, stacks)) {
          continue;
        } else {
          if (!stopped) {
            stopped = [];
            stoppedTokens = [];
          }
          stopped.push(stack);
          let tok = this.tokens.getMainToken(stack);
          stoppedTokens.push(tok.value, tok.end);
        }
        break;
      }
    }
    if (!newStacks.length) {
      let finished = stopped && findFinished(stopped);
      if (finished)
        return this.stackToTree(finished);
      if (this.parser.strict) {
        if (verbose && stopped)
          console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none"));
        throw new SyntaxError("No parse at " + pos);
      }
      if (!this.recovering)
        this.recovering = 5;
    }
    if (this.recovering && stopped) {
      let finished = this.stoppedAt != null && stopped[0].pos > this.stoppedAt ? stopped[0] : this.runRecovery(stopped, stoppedTokens, newStacks);
      if (finished)
        return this.stackToTree(finished.forceAll());
    }
    if (this.recovering) {
      let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3;
      if (newStacks.length > maxRemaining) {
        newStacks.sort((a, b) => b.score - a.score);
        while (newStacks.length > maxRemaining)
          newStacks.pop();
      }
      if (newStacks.some((s) => s.reducePos > pos))
        this.recovering--;
    } else if (newStacks.length > 1) {
      outer:
        for (let i = 0; i < newStacks.length - 1; i++) {
          let stack = newStacks[i];
          for (let j = i + 1; j < newStacks.length; j++) {
            let other = newStacks[j];
            if (stack.sameState(other) || stack.buffer.length > 500 && other.buffer.length > 500) {
              if ((stack.score - other.score || stack.buffer.length - other.buffer.length) > 0) {
                newStacks.splice(j--, 1);
              } else {
                newStacks.splice(i--, 1);
                continue outer;
              }
            }
          }
        }
    }
    this.minStackPos = newStacks[0].pos;
    for (let i = 1; i < newStacks.length; i++)
      if (newStacks[i].pos < this.minStackPos)
        this.minStackPos = newStacks[i].pos;
    return null;
  }
  stopAt(pos) {
    if (this.stoppedAt != null && this.stoppedAt < pos)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = pos;
  }
  // Returns an updated version of the given stack, or null if the
  // stack can't advance normally. When `split` and `stacks` are
  // given, stacks split off by ambiguous operations will be pushed to
  // `split`, or added to `stacks` if they move `pos` forward.
  advanceStack(stack, stacks, split) {
    let start = stack.pos, { parser: parser2 } = this;
    let base = verbose ? this.stackID(stack) + " -> " : "";
    if (this.stoppedAt != null && start > this.stoppedAt)
      return stack.forceReduce() ? stack : null;
    if (this.fragments) {
      let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
      for (let cached = this.fragments.nodeAt(start); cached; ) {
        let match = this.parser.nodeSet.types[cached.type.id] == cached.type ? parser2.getGoto(stack.state, cached.type.id) : -1;
        if (match > -1 && cached.length && (!strictCx || (cached.prop(NodeProp.contextHash) || 0) == cxHash)) {
          stack.useNode(cached, match);
          if (verbose)
            console.log(base + this.stackID(stack) + ` (via reuse of ${parser2.getName(cached.type.id)})`);
          return true;
        }
        if (!(cached instanceof Tree) || cached.children.length == 0 || cached.positions[0] > 0)
          break;
        let inner = cached.children[0];
        if (inner instanceof Tree && cached.positions[0] == 0)
          cached = inner;
        else
          break;
      }
    }
    let defaultReduce = parser2.stateSlot(
      stack.state,
      4
      /* DefaultReduce */
    );
    if (defaultReduce > 0) {
      stack.reduce(defaultReduce);
      if (verbose)
        console.log(base + this.stackID(stack) + ` (via always-reduce ${parser2.getName(
          defaultReduce & 65535
          /* ValueMask */
        )})`);
      return true;
    }
    if (stack.stack.length >= 15e3) {
      while (stack.stack.length > 9e3 && stack.forceReduce()) {
      }
    }
    let actions = this.tokens.getActions(stack);
    for (let i = 0; i < actions.length; ) {
      let action = actions[i++], term = actions[i++], end = actions[i++];
      let last = i == actions.length || !split;
      let localStack = last ? stack : stack.split();
      localStack.apply(action, term, end);
      if (verbose)
        console.log(base + this.stackID(localStack) + ` (via ${(action & 65536) == 0 ? "shift" : `reduce of ${parser2.getName(
          action & 65535
          /* ValueMask */
        )}`} for ${parser2.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
      if (last)
        return true;
      else if (localStack.pos > start)
        stacks.push(localStack);
      else
        split.push(localStack);
    }
    return false;
  }
  // Advance a given stack forward as far as it will go. Returns the
  // (possibly updated) stack if it got stuck, or null if it moved
  // forward and was given to `pushStackDedup`.
  advanceFully(stack, newStacks) {
    let pos = stack.pos;
    for (; ; ) {
      if (!this.advanceStack(stack, null, null))
        return false;
      if (stack.pos > pos) {
        pushStackDedup(stack, newStacks);
        return true;
      }
    }
  }
  runRecovery(stacks, tokens, newStacks) {
    let finished = null, restarted = false;
    for (let i = 0; i < stacks.length; i++) {
      let stack = stacks[i], token = tokens[i << 1], tokenEnd = tokens[(i << 1) + 1];
      let base = verbose ? this.stackID(stack) + " -> " : "";
      if (stack.deadEnd) {
        if (restarted)
          continue;
        restarted = true;
        stack.restart();
        if (verbose)
          console.log(base + this.stackID(stack) + " (restarted)");
        let done = this.advanceFully(stack, newStacks);
        if (done)
          continue;
      }
      let force = stack.split(), forceBase = base;
      for (let j = 0; force.forceReduce() && j < 10; j++) {
        if (verbose)
          console.log(forceBase + this.stackID(force) + " (via force-reduce)");
        let done = this.advanceFully(force, newStacks);
        if (done)
          break;
        if (verbose)
          forceBase = this.stackID(force) + " -> ";
      }
      for (let insert of stack.recoverByInsert(token)) {
        if (verbose)
          console.log(base + this.stackID(insert) + " (via recover-insert)");
        this.advanceFully(insert, newStacks);
      }
      if (this.stream.end > stack.pos) {
        if (tokenEnd == stack.pos) {
          tokenEnd++;
          token = 0;
        }
        stack.recoverByDelete(token, tokenEnd);
        if (verbose)
          console.log(base + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token)})`);
        pushStackDedup(stack, newStacks);
      } else if (!finished || finished.score < stack.score) {
        finished = stack;
      }
    }
    return finished;
  }
  // Convert the stack's buffer to a syntax tree.
  stackToTree(stack) {
    stack.close();
    return Tree.build({
      buffer: StackBufferCursor.create(stack),
      nodeSet: this.parser.nodeSet,
      topID: this.topTerm,
      maxBufferLength: this.parser.bufferLength,
      reused: this.reused,
      start: this.ranges[0].from,
      length: stack.pos - this.ranges[0].from,
      minRepeatType: this.parser.minRepeatTerm
    });
  }
  stackID(stack) {
    let id2 = (stackIDs || (stackIDs = /* @__PURE__ */ new WeakMap())).get(stack);
    if (!id2)
      stackIDs.set(stack, id2 = String.fromCodePoint(this.nextStackID++));
    return id2 + stack;
  }
};
function pushStackDedup(stack, newStacks) {
  for (let i = 0; i < newStacks.length; i++) {
    let other = newStacks[i];
    if (other.pos == stack.pos && other.sameState(stack)) {
      if (newStacks[i].score < stack.score)
        newStacks[i] = stack;
      return;
    }
  }
  newStacks.push(stack);
}
var Dialect = class {
  constructor(source, flags, disabled) {
    this.source = source;
    this.flags = flags;
    this.disabled = disabled;
  }
  allows(term) {
    return !this.disabled || this.disabled[term] == 0;
  }
};
var id = (x) => x;
var ContextTracker = class {
  /// Define a context tracker.
  constructor(spec) {
    this.start = spec.start;
    this.shift = spec.shift || id;
    this.reduce = spec.reduce || id;
    this.reuse = spec.reuse || id;
    this.hash = spec.hash || (() => 0);
    this.strict = spec.strict !== false;
  }
};
var LRParser = class extends Parser {
  /// @internal
  constructor(spec) {
    super();
    this.wrappers = [];
    if (spec.version != 14)
      throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${14})`);
    let nodeNames = spec.nodeNames.split(" ");
    this.minRepeatTerm = nodeNames.length;
    for (let i = 0; i < spec.repeatNodeCount; i++)
      nodeNames.push("");
    let topTerms = Object.keys(spec.topRules).map((r) => spec.topRules[r][1]);
    let nodeProps = [];
    for (let i = 0; i < nodeNames.length; i++)
      nodeProps.push([]);
    function setProp(nodeID, prop, value) {
      nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
    }
    if (spec.nodeProps)
      for (let propSpec of spec.nodeProps) {
        let prop = propSpec[0];
        if (typeof prop == "string")
          prop = NodeProp[prop];
        for (let i = 1; i < propSpec.length; ) {
          let next = propSpec[i++];
          if (next >= 0) {
            setProp(next, prop, propSpec[i++]);
          } else {
            let value = propSpec[i + -next];
            for (let j = -next; j > 0; j--)
              setProp(propSpec[i++], prop, value);
            i++;
          }
        }
      }
    this.nodeSet = new NodeSet(nodeNames.map((name, i) => NodeType.define({
      name: i >= this.minRepeatTerm ? void 0 : name,
      id: i,
      props: nodeProps[i],
      top: topTerms.indexOf(i) > -1,
      error: i == 0,
      skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
    })));
    if (spec.propSources)
      this.nodeSet = this.nodeSet.extend(...spec.propSources);
    this.strict = false;
    this.bufferLength = DefaultBufferLength;
    let tokenArray = decodeArray(spec.tokenData);
    this.context = spec.context;
    this.specializerSpecs = spec.specialized || [];
    this.specialized = new Uint16Array(this.specializerSpecs.length);
    for (let i = 0; i < this.specializerSpecs.length; i++)
      this.specialized[i] = this.specializerSpecs[i].term;
    this.specializers = this.specializerSpecs.map(getSpecializer);
    this.states = decodeArray(spec.states, Uint32Array);
    this.data = decodeArray(spec.stateData);
    this.goto = decodeArray(spec.goto);
    this.maxTerm = spec.maxTerm;
    this.tokenizers = spec.tokenizers.map((value) => typeof value == "number" ? new TokenGroup(tokenArray, value) : value);
    this.topRules = spec.topRules;
    this.dialects = spec.dialects || {};
    this.dynamicPrecedences = spec.dynamicPrecedences || null;
    this.tokenPrecTable = spec.tokenPrec;
    this.termNames = spec.termNames || null;
    this.maxNode = this.nodeSet.types.length - 1;
    this.dialect = this.parseDialect();
    this.top = this.topRules[Object.keys(this.topRules)[0]];
  }
  createParse(input, fragments, ranges) {
    let parse = new Parse(this, input, fragments, ranges);
    for (let w of this.wrappers)
      parse = w(parse, input, fragments, ranges);
    return parse;
  }
  /// Get a goto table entry @internal
  getGoto(state, term, loose = false) {
    let table = this.goto;
    if (term >= table[0])
      return -1;
    for (let pos = table[term + 1]; ; ) {
      let groupTag = table[pos++], last = groupTag & 1;
      let target = table[pos++];
      if (last && loose)
        return target;
      for (let end = pos + (groupTag >> 1); pos < end; pos++)
        if (table[pos] == state)
          return target;
      if (last)
        return -1;
    }
  }
  /// Check if this state has an action for a given terminal @internal
  hasAction(state, terminal) {
    let data = this.data;
    for (let set = 0; set < 2; set++) {
      for (let i = this.stateSlot(
        state,
        set ? 2 : 1
        /* Actions */
      ), next; ; i += 3) {
        if ((next = data[i]) == 65535) {
          if (data[i + 1] == 1)
            next = data[i = pair(data, i + 2)];
          else if (data[i + 1] == 2)
            return pair(data, i + 2);
          else
            break;
        }
        if (next == terminal || next == 0)
          return pair(data, i + 1);
      }
    }
    return 0;
  }
  /// @internal
  stateSlot(state, slot) {
    return this.states[state * 6 + slot];
  }
  /// @internal
  stateFlag(state, flag) {
    return (this.stateSlot(
      state,
      0
      /* Flags */
    ) & flag) > 0;
  }
  /// @internal
  validAction(state, action) {
    if (action == this.stateSlot(
      state,
      4
      /* DefaultReduce */
    ))
      return true;
    for (let i = this.stateSlot(
      state,
      1
      /* Actions */
    ); ; i += 3) {
      if (this.data[i] == 65535) {
        if (this.data[i + 1] == 1)
          i = pair(this.data, i + 2);
        else
          return false;
      }
      if (action == pair(this.data, i + 1))
        return true;
    }
  }
  /// Get the states that can follow this one through shift actions or
  /// goto jumps. @internal
  nextStates(state) {
    let result = [];
    for (let i = this.stateSlot(
      state,
      1
      /* Actions */
    ); ; i += 3) {
      if (this.data[i] == 65535) {
        if (this.data[i + 1] == 1)
          i = pair(this.data, i + 2);
        else
          break;
      }
      if ((this.data[i + 2] & 65536 >> 16) == 0) {
        let value = this.data[i + 1];
        if (!result.some((v, i2) => i2 & 1 && v == value))
          result.push(this.data[i], value);
      }
    }
    return result;
  }
  /// @internal
  overrides(token, prev) {
    let iPrev = findOffset(this.data, this.tokenPrecTable, prev);
    return iPrev < 0 || findOffset(this.data, this.tokenPrecTable, token) < iPrev;
  }
  /// Configure the parser. Returns a new parser instance that has the
  /// given settings modified. Settings not provided in `config` are
  /// kept from the original parser.
  configure(config) {
    let copy = Object.assign(Object.create(LRParser.prototype), this);
    if (config.props)
      copy.nodeSet = this.nodeSet.extend(...config.props);
    if (config.top) {
      let info = this.topRules[config.top];
      if (!info)
        throw new RangeError(`Invalid top rule name ${config.top}`);
      copy.top = info;
    }
    if (config.tokenizers)
      copy.tokenizers = this.tokenizers.map((t) => {
        let found = config.tokenizers.find((r) => r.from == t);
        return found ? found.to : t;
      });
    if (config.specializers) {
      copy.specializers = this.specializers.slice();
      copy.specializerSpecs = this.specializerSpecs.map((s, i) => {
        let found = config.specializers.find((r) => r.from == s.external);
        if (!found)
          return s;
        let spec = Object.assign(Object.assign({}, s), { external: found.to });
        copy.specializers[i] = getSpecializer(spec);
        return spec;
      });
    }
    if (config.contextTracker)
      copy.context = config.contextTracker;
    if (config.dialect)
      copy.dialect = this.parseDialect(config.dialect);
    if (config.strict != null)
      copy.strict = config.strict;
    if (config.wrap)
      copy.wrappers = copy.wrappers.concat(config.wrap);
    if (config.bufferLength != null)
      copy.bufferLength = config.bufferLength;
    return copy;
  }
  /// Tells you whether any [parse wrappers](#lr.ParserConfig.wrap)
  /// are registered for this parser.
  hasWrappers() {
    return this.wrappers.length > 0;
  }
  /// Returns the name associated with a given term. This will only
  /// work for all terms when the parser was generated with the
  /// `--names` option. By default, only the names of tagged terms are
  /// stored.
  getName(term) {
    return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
  }
  /// The eof term id is always allocated directly after the node
  /// types. @internal
  get eofTerm() {
    return this.maxNode + 1;
  }
  /// The type of top node produced by the parser.
  get topNode() {
    return this.nodeSet.types[this.top[1]];
  }
  /// @internal
  dynamicPrecedence(term) {
    let prec = this.dynamicPrecedences;
    return prec == null ? 0 : prec[term] || 0;
  }
  /// @internal
  parseDialect(dialect) {
    let values = Object.keys(this.dialects), flags = values.map(() => false);
    if (dialect)
      for (let part of dialect.split(" ")) {
        let id2 = values.indexOf(part);
        if (id2 >= 0)
          flags[id2] = true;
      }
    let disabled = null;
    for (let i = 0; i < values.length; i++)
      if (!flags[i]) {
        for (let j = this.dialects[values[i]], id2; (id2 = this.data[j++]) != 65535; )
          (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id2] = 1;
      }
    return new Dialect(dialect, flags, disabled);
  }
  /// Used by the output of the parser generator. Not available to
  /// user code.
  static deserialize(spec) {
    return new LRParser(spec);
  }
};
function pair(data, off) {
  return data[off] | data[off + 1] << 16;
}
function findOffset(data, start, term) {
  for (let i = start, next; (next = data[i]) != 65535; i++)
    if (next == term)
      return i - start;
  return -1;
}
function findFinished(stacks) {
  let best = null;
  for (let stack of stacks) {
    let stopped = stack.p.stoppedAt;
    if ((stack.pos == stack.p.stream.end || stopped != null && stack.pos > stopped) && stack.p.parser.stateFlag(
      stack.state,
      2
      /* Accepting */
    ) && (!best || best.score < stack.score))
      best = stack;
  }
  return best;
}
function getSpecializer(spec) {
  if (spec.external) {
    let mask = spec.extend ? 1 : 0;
    return (value, stack) => spec.external(value, stack) << 1 | mask;
  }
  return spec.get;
}

// node_modules/@lezer/javascript/dist/index.es.js
var noSemi = 294;
var incdec = 1;
var incdecPrefix = 2;
var templateContent = 295;
var InterpolationStart = 3;
var templateEnd = 296;
var insertSemi = 297;
var spaces = 299;
var newline = 300;
var LineComment = 4;
var BlockComment = 5;
var space = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
];
var braceR = 125;
var braceL = 123;
var semicolon = 59;
var slash = 47;
var star = 42;
var plus = 43;
var minus = 45;
var dollar = 36;
var backtick = 96;
var backslash = 92;
var trackNewline = new ContextTracker({
  start: false,
  shift(context, term) {
    return term == LineComment || term == BlockComment || term == spaces ? context : term == newline;
  },
  strict: false
});
var insertSemicolon = new ExternalTokenizer((input, stack) => {
  let { next } = input;
  if ((next == braceR || next == -1 || stack.context) && stack.canShift(insertSemi))
    input.acceptToken(insertSemi);
}, { contextual: true, fallback: true });
var noSemicolon = new ExternalTokenizer((input, stack) => {
  let { next } = input, after;
  if (space.indexOf(next) > -1)
    return;
  if (next == slash && ((after = input.peek(1)) == slash || after == star))
    return;
  if (next != braceR && next != semicolon && next != -1 && !stack.context && stack.canShift(noSemi))
    input.acceptToken(noSemi);
}, { contextual: true });
var incdecToken = new ExternalTokenizer((input, stack) => {
  let { next } = input;
  if (next == plus || next == minus) {
    input.advance();
    if (next == input.next) {
      input.advance();
      let mayPostfix = !stack.context && stack.canShift(incdec);
      input.acceptToken(mayPostfix ? incdec : incdecPrefix);
    }
  }
}, { contextual: true });
var template = new ExternalTokenizer((input) => {
  for (let afterDollar = false, i = 0; ; i++) {
    let { next } = input;
    if (next < 0) {
      if (i)
        input.acceptToken(templateContent);
      break;
    } else if (next == backtick) {
      if (i)
        input.acceptToken(templateContent);
      else
        input.acceptToken(templateEnd, 1);
      break;
    } else if (next == braceL && afterDollar) {
      if (i == 1)
        input.acceptToken(InterpolationStart, 1);
      else
        input.acceptToken(templateContent, -1);
      break;
    } else if (next == 10 && i) {
      input.advance();
      input.acceptToken(templateContent);
      break;
    } else if (next == backslash) {
      input.advance();
    }
    afterDollar = next == dollar;
    input.advance();
  }
});
var jsHighlight = styleTags({
  "get set async static": tags.modifier,
  "for while do if else switch try catch finally return throw break continue default case": tags.controlKeyword,
  "in of await yield void typeof delete instanceof": tags.operatorKeyword,
  "let var const function class extends": tags.definitionKeyword,
  "import export from": tags.moduleKeyword,
  "with debugger as new": tags.keyword,
  TemplateString: tags.special(tags.string),
  super: tags.atom,
  BooleanLiteral: tags.bool,
  this: tags.self,
  null: tags.null,
  Star: tags.modifier,
  VariableName: tags.variableName,
  "CallExpression/VariableName TaggedTemplateExpression/VariableName": tags.function(tags.variableName),
  VariableDefinition: tags.definition(tags.variableName),
  Label: tags.labelName,
  PropertyName: tags.propertyName,
  PrivatePropertyName: tags.special(tags.propertyName),
  "CallExpression/MemberExpression/PropertyName": tags.function(tags.propertyName),
  "FunctionDeclaration/VariableDefinition": tags.function(tags.definition(tags.variableName)),
  "ClassDeclaration/VariableDefinition": tags.definition(tags.className),
  PropertyDefinition: tags.definition(tags.propertyName),
  PrivatePropertyDefinition: tags.definition(tags.special(tags.propertyName)),
  UpdateOp: tags.updateOperator,
  LineComment: tags.lineComment,
  BlockComment: tags.blockComment,
  Number: tags.number,
  String: tags.string,
  ArithOp: tags.arithmeticOperator,
  LogicOp: tags.logicOperator,
  BitOp: tags.bitwiseOperator,
  CompareOp: tags.compareOperator,
  RegExp: tags.regexp,
  Equals: tags.definitionOperator,
  Arrow: tags.function(tags.punctuation),
  ": Spread": tags.punctuation,
  "( )": tags.paren,
  "[ ]": tags.squareBracket,
  "{ }": tags.brace,
  "InterpolationStart InterpolationEnd": tags.special(tags.brace),
  ".": tags.derefOperator,
  ", ;": tags.separator,
  "@": tags.meta,
  TypeName: tags.typeName,
  TypeDefinition: tags.definition(tags.typeName),
  "type enum interface implements namespace module declare": tags.definitionKeyword,
  "abstract global Privacy readonly override": tags.modifier,
  "is keyof unique infer": tags.operatorKeyword,
  JSXAttributeValue: tags.attributeValue,
  JSXText: tags.content,
  "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": tags.angleBracket,
  "JSXIdentifier JSXNameSpacedName": tags.tagName,
  "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": tags.attributeName,
  "JSXBuiltin/JSXIdentifier": tags.standard(tags.tagName)
});
var spec_identifier = { __proto__: null, export: 16, as: 21, from: 27, default: 30, async: 35, function: 36, extends: 46, this: 50, true: 58, false: 58, null: 68, void: 72, typeof: 76, super: 92, new: 126, await: 143, yield: 145, delete: 146, class: 156, public: 211, private: 211, protected: 211, readonly: 213, instanceof: 232, satisfies: 235, in: 236, const: 238, import: 270, keyof: 325, unique: 329, infer: 335, is: 371, abstract: 391, implements: 393, type: 395, let: 398, var: 400, interface: 407, enum: 411, namespace: 417, module: 419, declare: 423, global: 427, for: 448, of: 457, while: 460, with: 464, do: 468, if: 472, else: 474, switch: 478, case: 484, try: 490, catch: 494, finally: 498, return: 502, throw: 506, break: 510, continue: 514, debugger: 518 };
var spec_word = { __proto__: null, async: 113, get: 115, set: 117, public: 173, private: 173, protected: 173, static: 175, abstract: 177, override: 179, readonly: 185, accessor: 187, new: 375 };
var spec_LessThan = { __proto__: null, "<": 133 };
var parser = LRParser.deserialize({
  version: 14,
  states: "$>lO`QYOOO$}QYOOO&}Q`OOO*_Q$IvO'#CgO*fOSO'#DYO,qQYO'#D_O-RQYO'#DjO$}QYO'#DtO/VQYO'#DzOOQ$IU'#ES'#ESO/mQWO'#EPOOQO'#IW'#IWO/uQWO'#GfOOQO'#Ed'#EdO0QQWO'#EcO0VQWO'#EcO2XQ$IvO'#JQO4xQ$IvO'#JRO5fQWO'#FRO5kQ!bO'#FjOOQ$IU'#FZ'#FZO5vO#tO'#FZO6UQ&jO'#FqO7iQWO'#FpOOQ$IU'#JR'#JROOQ$IS'#JQ'#JQOOQQ'#Jl'#JlO7nQWO'#HzO7sQ$I[O'#H{OOQQ'#Iu'#IuOOQQ'#IO'#IOQ`QYOOO$}QYO'#DlO7{QWO'#GfO8QQ&jO'#ClO8`QWO'#EbO8kQWO'#EmO8pQ&jO'#FYO9[QWO'#GfO9aQWO'#GjO9lQWO'#GjO9zQWO'#GmO9zQWO'#GnO9zQWO'#GpO7{QWO'#GsO:kQWO'#GvO;|QWO'#CcO<^QWO'#HTO<fQWO'#HZO<fQWO'#H]O`QYO'#H_O<fQWO'#HaO<fQWO'#HdO<kQWO'#HjO<pQ$I]O'#HpO$}QYO'#HrO<{Q$I]O'#HtO=WQ$I]O'#HvO7sQ$I[O'#HxO=cQ$IvO'#CgO>PQ`O'#DdQOQWOOO>tQWO'#D{O8QQ&jO'#EbO?PQWO'#EbO?[QpO'#FYOOQO'#Ce'#CeOOQ$IS'#Di'#DiOOQ$IS'#JU'#JUO$}QYO'#JUO@bQ`O'#EZOOQ$IS'#EY'#EYO@lQ$IdO'#EZOAWQ`O'#EOOOQO'#JX'#JXOAiQ`O'#EOOAvQ`O'#EZOB^Q`O'#EaOBaQ`O'#EZO?dQ`O'#EZOAWQ`O'#EZO$}QYO'#DZOOOS'#IQ'#IQOBzOSO,59tOOQ$IU,59t,59tOCVQYO'#IROCjQWO'#JSOElQrO'#JSO*qQYO'#JSOEsQWO,59yOFZQWO'#EdOFhQWO'#JaOFsQWO'#J`OFsQWO'#J`OF{QWO,5;QOGQQWO'#J_OOQ$IU,5:U,5:UOGXQYO,5:UOIYQ$IvO,5:`OIyQWO,5:fOJOQWO'#J]OJxQ$I[O'#J^O9aQWO'#J]OKPQWO'#J]OKXQWO,5;POK^QWO'#J]OOQ$IU'#Cg'#CgO$}QYO'#DzOLQQpO,5:kOOQO'#JY'#JYOOQO-E<U-E<UO7{QWO,5=QOLhQWO,5=QOLmQYO,5:}ONmQ&jO'#E_O! }QWO,5:}O!#dQ&jO'#DnO!#kQYO'#DsO!#uQ`O,5;WO!#}Q`O,5;WO$}QYO,5;WOOQQ'#Ey'#EyOOQQ'#E{'#E{O$}QYO,5;XO$}QYO,5;XO$}QYO,5;XO$}QYO,5;XO$}QYO,5;XO$}QYO,5;XO$}QYO,5;XO$}QYO,5;XO$}QYO,5;XO$}QYO,5;XO$}QYO,5;XOOQQ'#FP'#FPO!$]QYO,5;jOOQ$IU,5;o,5;oOOQ$IU,5;p,5;pO!&]QWO,5;pOOQ$IU,5;q,5;qO$}QYO'#I^O!&eQ$I[O,5<^ONmQ&jO,5;XO!'SQ&jO,5;XO$}QYO,5;mO!'ZQ!bO'#F`O!(WQ!bO'#JeO!'rQ!bO'#JeO!(_Q!bO'#JeOOQO'#Je'#JeO!(sQ!bO,5;xOOOO,5<U,5<UO!)UQYO'#FlOOOO'#I]'#I]O5vO#tO,5;uO!)]Q!bO'#FnOOQ$IU,5;u,5;uO!)|Q,UO'#CrOOQ$IU'#Cv'#CvO!*aQWO'#CvO!*fOSO'#CzO!+SQ&jO,5<ZO!+ZQWO,5<]O!,mQ7[O'#F{O!,zQWO'#F|O!-PQWO'#F|O!-UQ7[O'#GQO!.TQ`O'#GUO!.vQ,UO'#I}OOQ$IU'#I}'#I}O!/QQWO'#I|O!/`QWO'#I{O!/hQWO'#CqOOQ$IU'#Ct'#CtOOQ$IU'#C}'#C}OOQ$IU'#DP'#DPO/pQWO'#DRO!!SQ&jO'#FsO!!SQ&jO'#FuO!/pQWO'#FwO!/uQWO'#FxO!-PQWO'#GOO!!SQ&jO'#GTO!/zQWO'#EeO!0fQWO,5<[O`QYO,5>fOOQQ'#Ix'#IxOOQQ,5>g,5>gOOQQ-E;|-E;|O!2eQ$IvO,5:WOOQ$IS'#Co'#CoO!3XQ&jO,5=QO!3gQ$I[O'#IyO7iQWO'#IyO<kQWO,59WO!3xQ`O,59WO!4QQ&jO,59WO8QQ&jO,59WO!4]QWO,5:}O!4eQWO'#HSO!4sQWO'#JpO$}QYO,5;rO!4{Q`O,5;tO!5QQWO,5=mO!5VQWO,5=mO!5[QWO,5=mO7sQ$I[O,5=mO!5jQWO'#EfO!6aQ`O'#EgOOQ$IS'#J_'#J_O!6hQ$I[O'#JmO7sQ$I[O,5=UO9zQWO,5=[OOQO'#Cr'#CrO!6sQ`O,5=XO!6{Q&jO,5=YO!7WQWO,5=[O!7]QpO,5=_O<kQWO'#GxO7{QWO'#GzO!7eQWO'#GzO8QQ&jO'#G}O!7jQWO'#G}OOQQ,5=b,5=bO!7oQWO'#HOO!7wQWO'#ClO!7|QWO,58}O!8WQWO,58}O!:]QYO,58}OOQQ,58},58}O!:jQ$I[O,58}O$}QYO,58}O!:uQYO'#HVOOQQ'#HW'#HWOOQQ'#HX'#HXO`QYO,5=oO!;VQWO,5=oO`QYO,5=uO`QYO,5=wO!;[QWO,5=yO`QYO,5={O!;aQWO,5>OO!;fQYO,5>UOOQQ,5>[,5>[O$}QYO,5>[O7sQ$I[O,5>^OOQQ,5>`,5>`O!?jQWO,5>`OOQQ,5>b,5>bO!?jQWO,5>bOOQQ,5>d,5>dO!?oQ`O'#DWO$}QYO'#JUO!@^Q`O'#JUO!@{Q`O'#DeO!A^Q`O'#DeO!CiQYO'#DeO!CpQWO'#JTO!CxQWO,5:OO!C}QWO'#EhO!D]QWO'#JbO!DeQWO,5;RO!D{Q`O'#DeO!EVQ`O'#D}OOQ$IU,5:g,5:gO$}QYO,5:gO!E^QWO,5:gO<kQWO,5:|O!3xQ`O,5:|O!4QQ&jO,5:|O8QQ&jO,5:|O!EfQWO,5?pO!EkQMhO,5:kO!FkQ$IdO,5:uOAWQ`O,5:jO!GVQ`O,5:jO!GdQ`O,5:uO!GzQ`O,5:uO!HeQ`O,5:uOAWQ`O,5:uO<kQWO,5:jOOQ$IS'#E^'#E^OOQO,5:u,5:uO$}QYO,5:uO!IUQ$I[O,5:uO!IaQ$I[O,5:uO!3xQ`O,5:jOOQO,5:{,5:{O!IoQ$I[O,5:uO!JTQpO,59uOOOS-E<O-E<OOOQ$IU1G/`1G/`O!JYQrO,5>mO*qQYO,5>mOOQO,5>s,5>sO!JdQYO'#IROOQO-E<P-E<PO!JqQWO,5?nO!JyQrO,5?nO!KQQWO,5?zOOQ$IU1G/e1G/eO$}QYO,5?{O!KYQWO'#IXOOQO-E<V-E<VO!KQQWO,5?zOOQ$IS1G0l1G0lOOQ$IU1G/p1G/pOOQ$IU1G0Q1G0QO!KnQWO,5?wO9aQWO,5?wO!KvQWO,5?wO$}QYO,5?xO!LUQ$I[O,5?xO!LgQ$I[O,5?xO!LnQWO'#IZO!KnQWO,5?wOOQ$IS1G0k1G0kO!#uQ`O,5:mO!$QQ`O,5:mOOQO,5:o,5:oO!M]QWO,5:oO!MeQ&jO1G2lO7{QWO1G2lOOQ$IU1G0i1G0iO!MsQ$IvO1G0iO!NxQ$ItO,5:yOOQ$IU'#Fz'#FzO# fQ$IvO'#I}OLmQYO1G0iO##nQ&jO'#JVO##xQWO,5:YO##}QrO'#JWO$}QYO'#JWO#$XQWO,5:_OOQ$IU'#DW'#DWOOQ$IU1G0r1G0rO$}QYO1G0rOOQ$IU1G1[1G1[O#$^QWO1G0rO#&uQ$IvO1G0sO#&|Q$IvO1G0sO#)gQ$IvO1G0sO#)nQ$IvO1G0sO#+xQ$IvO1G0sO#,`Q$IvO1G0sO#/YQ$IvO1G0sO#/aQ$IvO1G0sO#1zQ$IvO1G0sO#2RQ$IvO1G0sO#3yQ$IvO1G0sO#6yQ!LSO'#CgO#8wQ!LSO1G1UO#:uQ!LSO'#JRO!&`QWO1G1[O#;YQ$IvO,5>xOOQ$IS-E<[-E<[O#;|Q$IvO1G0sOOQ$IU1G0s1G0sO#>XQ$IvO1G1XO#>{Q!bO,5;|O#?TQ!bO,5;}O#?]Q!bO'#FeO#?tQWO'#FdOOQO'#Jf'#JfOOQO'#I['#I[O#?yQ!bO1G1dOOQ$IU1G1d1G1dOOOO1G1o1G1oO#@[Q!LSO'#JQO#@fQWO,5<WO!$]QYO,5<WOOOO-E<Z-E<ZOOQ$IU1G1a1G1aO#@kQ`O'#JeOOQ$IU,5<Y,5<YO#@sQ`O,5<YOOQ$IU,59b,59bONmQ&jO'#C|OOOS'#IP'#IPO#@xOSO,59fOOQ$IU,59f,59fO$}QYO1G1uO!/uQWO'#I`O#ATQWO,5<nOOQ$IU,5<k,5<kOOQO'#Ga'#GaO!!SQ&jO,5<zOOQO'#Gc'#GcO!!SQ&jO,5<|ONmQ&jO,5=OOOQO1G1w1G1wO#A`QpO'#CoO#AsQpO,5<gO#AzQWO'#JiO7{QWO'#JiO#BYQWO,5<iO!!SQ&jO,5<hO#B_QWO'#F}O#BjQWO,5<hO#BoQpO'#FzO#B|QpO'#JjO#CWQWO'#JjONmQ&jO'#JjO#C]QWO,5<lO#CbQ`O'#GVO!.OQ`O'#GVO#CsQWO'#GXO#CxQWO'#GZO!-PQWO'#G^O#C}Q$I[O'#IbO#DYQ`O,5<pOOQ$IU,5<p,5<pO#DaQ`O'#GVO#DoQ`O'#GWO#DwQ`O'#GWOOQ$IU,5=P,5=PO!!SQ&jO,5?hO!!SQ&jO,5?hO#D|QWO'#IcO#EXQWO,5?gO#EaQWO,59]O#FQQ&jO,59mOOQ$IU,59m,59mO#FsQ&jO,5<_O#GfQ&jO,5<aO#GpQWO,5<cOOQ$IU,5<d,5<dO#GuQWO,5<jO#GzQ&jO,5<oOLmQYO1G1vO#H[QWO1G1vOOQQ1G4Q1G4QOOQ$IU1G/r1G/rO!&]QWO1G/rOOQQ1G2l1G2lONmQ&jO1G2lO$}QYO1G2lO#HaQWO1G2lO#IvQ&jO'#E_OOQ$IS,5?e,5?eO#JQQ$I[O,5?eOOQQ1G.r1G.rO<kQWO1G.rO!3xQ`O1G.rO!4QQ&jO1G.rO#JcQWO1G0iO#JhQWO'#CgO#JsQWO'#JqO#J{QWO,5=nO#KQQWO'#JqO#KVQWO'#JqO#K_QWO'#IkO#KmQWO,5@[O#KuQrO1G1^OOQ$IU1G1`1G1`O7{QWO1G3XO#K|QWO1G3XO#LRQWO1G3XO#LWQWO1G3XOOQQ1G3X1G3XO9aQWO'#J`O9aQWO'#EhO$}QYO'#EhO9aQWO'#IeO#L]Q$I[O,5@XOOQQ1G2p1G2pO!7WQWO1G2vONmQ&jO1G2sO#LhQWO1G2sOOQQ1G2t1G2tONmQ&jO1G2tO#LmQWO1G2tO#LuQ`O'#GrOOQQ1G2v1G2vO!.OQ`O'#IgO!7]QpO1G2yOOQQ1G2y1G2yOOQQ,5=d,5=dO#L}Q&jO,5=fO7{QWO,5=fO#CxQWO,5=iO7iQWO,5=iO!3xQ`O,5=iO!4QQ&jO,5=iO8QQ&jO,5=iO#M]QWO'#JoO#MhQWO,5=jOOQQ1G.i1G.iO#MmQ$I[O1G.iO#MxQWO1G.iO#M}QWO1G.iO7sQ$I[O1G.iO#NVQrO,5@^O#NjQWO,5@^O#NuQYO,5=qO#N|QWO,5=qO9aQWO,5@^OOQQ1G3Z1G3ZO`QYO1G3ZOOQQ1G3a1G3aOOQQ1G3c1G3cO<fQWO1G3eO$ RQYO1G3gO$%PQYO'#HfOOQQ1G3j1G3jO$%^QWO'#HlO<kQWO'#HnOOQQ1G3p1G3pO$%fQYO1G3pO7sQ$I[O1G3vOOQQ1G3x1G3xOOQ$IS'#GR'#GRO7sQ$I[O1G3zO7sQ$I[O1G3|O$)gQWO,5?pO!$]QYO,5;SO9aQWO,5;SO<kQWO,5:PO!$]QYO,5:PO!3xQ`O,5:PO$)lQ!LSO,5:POOQO,5;S,5;SO$)vQ`O'#ISO$*^QWO,5?oOOQ$IU1G/j1G/jO$*fQ`O'#IYO$*pQWO,5?|OOQ$IS1G0m1G0mO!A^Q`O,5:POOQO'#IV'#IVO$*xQ`O,5:iOOQ$IU,5:i,5:iO!EaQWO1G0ROOQ$IU1G0R1G0RO$}QYO1G0ROOQ$IU1G0h1G0hO<kQWO1G0hO!3xQ`O1G0hO!4QQ&jO1G0hOOQ$IS1G5[1G5[O<kQWO1G0UOOQO1G0a1G0aO$}QYO1G0aO$+PQ$I[O1G0aO$+[Q$I[O1G0aO!3xQ`O1G0UOAWQ`O1G0UO$+jQ$IdO1G0aO$,UQ`O1G0UOAWQ`O1G0aO$,cQ`O1G0aO$,yQ`O1G0aO$-dQ$I[O1G0aOOQO1G0U1G0UO$-xQ$IvO1G0aOOOS1G/a1G/aO$.SQpO,5<^O$.[QrO1G4XOOQO1G4_1G4_O$}QYO,5>mO$.fQWO1G5YO$.nQWO1G5fO$.vQrO1G5gO9aQWO,5>sO$/QQWO1G5cO$/QQWO1G5cO9aQWO1G5cO$/YQ$IvO1G5dO$}QYO1G5dO$/jQ$I[O1G5dO$/{QWO,5>uO9aQWO,5>uOOQO,5>u,5>uO$0aQWO,5>uOOQO-E<X-E<XOOQO1G0X1G0XOOQO1G0Z1G0ZO!&`QWO1G0ZOOQQ7+(W7+(WONmQ&jO7+(WO$}QYO7+(WO$0oQWO7+(WO$0zQ&jO7+(WO$1YQ$IvO,59mO$3bQ$IvO,5<_O$5mQ$IvO,5<aO$7xQ$IvO,5<oOOQ$IU7+&T7+&TO$:ZQ$IvO7+&TO$:}Q&jO'#ITO$;XQWO,5?qOOQ$IU1G/t1G/tO$;aQYO'#IUO$;nQWO,5?rO$;vQrO,5?rOOQ$IU1G/y1G/yO$<QQWO7+&^OOQ$IU7+&^7+&^O$<VQ!LSO,5:`O$}QYO7+&pO$<aQ!LSO,5:WOOQ$IU7+&v7+&vOOQO1G1h1G1hOOQO1G1i1G1iO$<nQ!bO,5<PO!$]QYO,5<OOOQO-E<Y-E<YOOQ$IU7+'O7+'OOOOO7+'Z7+'ZOOOO1G1r1G1rO$<yQWO1G1rOOQ$IU1G1t1G1tO$=OQpO,59hOOOS-E;}-E;}OOQ$IU1G/Q1G/QO$=VQ$IvO7+'aOOQ$IU,5>z,5>zO$=yQWO,5>zOOQ$IU1G2Y1G2YP$>OQWO'#I`POQ$IU-E<^-E<^O$>oQ&jO1G2fO$?bQ&jO1G2hO$?lQpO1G2jOOQ$IU1G2R1G2RO$?sQWO'#I_O$@RQWO,5@TO$@RQWO,5@TO$@ZQWO,5@TO$@fQWO,5@TOOQO1G2T1G2TO$@tQ&jO1G2SO!!SQ&jO1G2SO$AUQ7[O'#IaO$AfQWO,5@UONmQ&jO,5@UO$AnQpO,5@UOOQ$IU1G2W1G2WOOQ$IS,5<q,5<qOOQ$IS,5<r,5<rO$AxQWO,5<rOARQWO,5<rO!3xQ`O,5<qOOQO'#GY'#GYO$A}QWO,5<sOOQ$IS,5<u,5<uO$AxQWO,5<xOOQO,5>|,5>|OOQO-E<`-E<`OOQ$IU1G2[1G2[O!.OQ`O,5<qO$BVQWO,5<rO#CsQWO,5<sO!.OQ`O,5<rO$BbQ&jO1G5SO$BlQ&jO1G5SOOQO,5>},5>}OOQO-E<a-E<aOOQO1G.w1G.wO!4{Q`O,59oO$}QYO,59oO$ByQWO1G1}O!!SQ&jO1G2UO$COQ$IvO7+'bOOQ$IU7+'b7+'bOLmQYO7+'bOOQ$IU7+%^7+%^O$CrQpO'#JkO!EaQWO7+(WO$C|QrO7+(WO$0rQWO7+(WO$DTQ$ItO'#CgO$DhQ$ItO,5<vO$EYQWO,5<vOOQ$IS1G5P1G5POOQQ7+$^7+$^O<kQWO7+$^O!3xQ`O7+$^OLmQYO7+&TO$E_QWO'#IjO$EpQWO,5@]OOQO1G3Y1G3YO7{QWO,5@]O$EpQWO,5@]O$ExQWO,5@]OOQO,5?V,5?VOOQO-E<i-E<iOOQ$IU7+&x7+&xO$E}QWO7+(sO7sQ$I[O7+(sO7{QWO7+(sO$FSQWO7+(sO$FXQWO,5;SOOQ$IS,5?P,5?POOQ$IS-E<c-E<cOOQQ7+(b7+(bO$F^Q$ItO7+(_ONmQ&jO7+(_O$FhQpO7+(`OOQQ7+(`7+(`ONmQ&jO7+(`O$FoQWO'#JnO$FzQWO,5=^OOQO,5?R,5?ROOQO-E<e-E<eOOQQ7+(e7+(eO$HTQ`O'#G{OOQQ1G3Q1G3QONmQ&jO1G3QO$}QYO1G3QO$H[QWO1G3QO$HgQ&jO1G3QO7sQ$I[O1G3TO#CxQWO1G3TO7iQWO1G3TO!3xQ`O1G3TO!4QQ&jO1G3TO$HuQWO'#IiO$IQQWO,5@ZO$IYQ`O,5@ZOOQ$IS1G3U1G3UOOQQ7+$T7+$TO$IbQWO7+$TO7sQ$I[O7+$TO$IgQWO7+$TO$}QYO1G5xO$}QYO1G5yO$IlQYO1G3]O$IsQWO1G3]O$IxQYO1G3]O$JPQ$I[O1G5xOOQQ7+(u7+(uO7sQ$I[O7+)PO`QYO7+)ROOQQ'#Jt'#JtOOQQ'#Il'#IlO$JZQYO,5>QOOQQ,5>Q,5>QO$}QYO'#HgO$JhQWO'#HiOOQQ,5>W,5>WO9aQWO,5>WOOQQ,5>Y,5>YOOQQ7+)[7+)[OOQQ7+)b7+)bOOQQ7+)f7+)fOOQQ7+)h7+)hO$JmQ`O1G5[O$KRQ!LSO1G0nO$K]QWO1G0nOOQO1G/k1G/kO$KhQ!LSO1G/kO<kQWO1G/kO!$]QYO'#DeOOQO,5>n,5>nOOQO-E<Q-E<QOOQO,5>t,5>tOOQO-E<W-E<WO!3xQ`O1G/kOOQO-E<T-E<TOOQ$IU1G0T1G0TOOQ$IU7+%m7+%mO!EaQWO7+%mOOQ$IU7+&S7+&SO<kQWO7+&SO!3xQ`O7+&SOOQO7+%p7+%pO$-xQ$IvO7+%{OOQO7+%{7+%{O$}QYO7+%{O$KrQ$I[O7+%{O<kQWO7+%pO!3xQ`O7+%pO$K}Q$I[O7+%{OAWQ`O7+%pO$L]Q$I[O7+%{O$LqQ$IdO7+%{O$L{Q`O7+%pOAWQ`O7+%{O$MYQ`O7+%{O$MpQWO7+*}O$MpQWO7+*}O$MxQ$IvO7++OO$}QYO7++OOOQO1G4a1G4aO9aQWO1G4aO$NYQWO1G4aOOQO7+%u7+%uO!EaQWO<<KrO$C|QrO<<KrO$NhQWO<<KrOOQQ<<Kr<<KrONmQ&jO<<KrO$}QYO<<KrO$NpQWO<<KrO$N{Q$IvO1G2fO%#WQ$IvO1G2hO%%cQ$IvO1G2SO%'tQ&jO,5>oOOQO-E<R-E<RO%(OQrO,5>pO$}QYO,5>pOOQO-E<S-E<SO%(YQWO1G5^OOQ$IU<<Ix<<IxO%(bQ!LSO1G0iO%*lQ!LSO1G0sO%*sQ!LSO1G0sO%,wQ!LSO1G0sO%-OQ!LSO1G0sO%.sQ!LSO1G0sO%/ZQ!LSO1G0sO%1nQ!LSO1G0sO%1uQ!LSO1G0sO%3yQ!LSO1G0sO%4QQ!LSO1G0sO%5xQ!LSO1G0sO%6]Q$IvO<<J[O%7bQ!LSO1G0sO%9WQ!LSO'#I}O%;ZQ!LSO1G1XO!$]QYO'#FgOOQO'#Jg'#JgOOQO1G1k1G1kO%;hQWO1G1jO%;mQ!LSO,5>xOOOO7+'^7+'^OOOS1G/S1G/SOOQ$IU1G4f1G4fO!!SQ&jO7+(UO%;wQWO,5>yO7{QWO,5>yOOQO-E<]-E<]O%<VQWO1G5oO%<VQWO1G5oO%<_QWO1G5oO%<jQ&jO7+'nO%<zQpO,5>{O%=UQWO,5>{ONmQ&jO,5>{OOQO-E<_-E<_O%=ZQpO1G5pO%=eQWO1G5pOOQ$IS1G2^1G2^O$AxQWO1G2^OOQ$IS1G2]1G2]O%=mQWO1G2_ONmQ&jO1G2_OOQ$IS1G2d1G2dO!3xQ`O1G2]OARQWO1G2^O%=rQWO1G2_O%=zQWO1G2^O!!SQ&jO7+*nOOQ$IU1G/Z1G/ZO%>VQWO1G/ZOOQ$IU7+'i7+'iO%>[Q&jO7+'pO%>lQ$IvO<<J|OOQ$IU<<J|<<J|ONmQ&jO'#IdO%?`QWO,5@VONmQ&jO1G2bOOQQ<<Gx<<GxO<kQWO<<GxO%?hQ$IvO<<IoOOQ$IU<<Io<<IoOOQO,5?U,5?UO%@[QWO,5?UO%@aQWO,5?UOOQO-E<h-E<hO%@iQWO1G5wO%@iQWO1G5wO7{QWO1G5wO%@qQWO<<L_OOQQ<<L_<<L_O%@vQWO<<L_O7sQ$I[O<<L_O%@{QWO1G0nOOQQ<<Ky<<KyO$F^Q$ItO<<KyOOQQ<<Kz<<KzO$FhQpO<<KzO%AQQ`O'#IfO%A]QWO,5@YO!$]QYO,5@YOOQQ1G2x1G2xO%AeQ$IdO'#JUO%BPQYO'#JUO%BWQ`O'#EZO%BqQ$I[O'#EZO@lQ$IdO'#EZO'|Q`O'#G|OOQO'#Ih'#IhO7sQ$I[O'#IhO%CVQ`O,5=gOOQQ,5=g,5=gO%C^Q`O'#EZO%BgQ`O'#EZO%CoQ`O'#EZO%DYQ`O'#EZO%DyQ`O'#G|O%E[QWO7+(lO%EaQWO7+(lOOQQ7+(l7+(lONmQ&jO7+(lO$}QYO7+(lO%EiQWO7+(lOOQQ7+(o7+(oO7sQ$I[O7+(oO#CxQWO7+(oO7iQWO7+(oO!3xQ`O7+(oO%EtQWO,5?TOOQO-E<g-E<gOOQO'#HP'#HPO%FPQWO1G5uO7sQ$I[O<<GoOOQQ<<Go<<GoO%FXQWO<<GoO%F^QWO7++dO%FcQWO7++eOOQQ7+(w7+(wO%FhQWO7+(wO%FmQYO7+(wO%FtQWO7+(wO$}QYO7++dO$}QYO7++eOOQQ<<Lk<<LkOOQQ<<Lm<<LmOOQQ-E<j-E<jOOQQ1G3l1G3lO%FyQWO,5>ROOQQ,5>T,5>TO%GOQWO1G3rO9aQWO7+&YO!$]QYO7+&YOOQO7+%V7+%VO%GTQ!LSO1G5gO<kQWO7+%VOOQ$IU<<IX<<IXOOQ$IU<<In<<InO<kQWO<<InOOQO<<Ig<<IgO$-xQ$IvO<<IgO$}QYO<<IgOOQO<<I[<<I[O<kQWO<<I[O%G_Q$I[O<<IgO!3xQ`O<<I[O%GjQ$I[O<<IgOAWQ`O<<I[O%GxQ$I[O<<IgO%H^Q$IdO<<IgO%HhQ`O<<I[OAWQ`O<<IgO%HuQWO<<NiO%H}Q$IvO<<NjOOQO7+){7+){O9aQWO7+){OOQQANA^ANA^O%I_QWOANA^ONmQ&jOANA^O!EaQWOANA^O$C|QrOANA^O$}QYOANA^O%IgQ$IvO7+'nO%KxQ$IvO7+'pO%NZQrO1G4[O%NeQ!LSO7+&TO%NrQ!LSO,59mO&!uQ!LSO,5<_O&$xQ!LSO,5<aO&&{Q!LSO,5<oO&(qQ!LSO7+'aO&)OQ!LSO7+'bO&)]QWO,5<ROOQO7+'U7+'UO&)bQ&jO<<KpOOQO1G4e1G4eO&)iQWO1G4eO&)tQWO1G4eO&*SQWO7++ZO&*SQWO7++ZONmQ&jO1G4gO&*[QpO1G4gO&*fQWO7++[OOQ$IS7+'x7+'xO$AxQWO7+'yO&*nQpO7+'yOOQ$IS7+'w7+'wO$AxQWO7+'xO&*uQWO7+'yONmQ&jO7+'yOARQWO7+'xO&*zQ&jO<<NYOOQ$IU7+$u7+$uO&+UQpO,5?OOOQO-E<b-E<bO&+`Q$ItO7+'|OOQQAN=dAN=dO7{QWO1G4pOOQO1G4p1G4pO&+pQWO1G4pO&+uQWO7++cO&+uQWO7++cO7sQ$I[OANAyO&+}QWOANAyOOQQANAyANAyOOQQANAeANAeOOQQANAfANAfO&,SQWO,5?QOOQO-E<d-E<dO&,_Q!LSO1G5tO#CxQWO,5=hO7iQWO,5=hO&.oQrO'#CgO&.yQ`O,5:uO&/TQ`O,5:uO&/bQ`O,5:uO!3xQ`O,5=hOOQO,5?S,5?SOOQO-E<f-E<fOOQQ1G3R1G3RO%BPQYO,5<sO%AeQ$IdO,5=hO!FkQ$IdO,5:uO'|Q`O,5=hO&/uQ`O,5=hO&0WQ`O,5:uOOQQ<<LW<<LWONmQ&jO<<LWO%E[QWO<<LWO&0qQWO<<LWO$}QYO<<LWOOQQ<<LZ<<LZO7sQ$I[O<<LZO#CxQWO<<LZO7iQWO<<LZO&0yQ`O1G4oO&1RQWO7++aOOQQAN=ZAN=ZO7sQ$I[OAN=ZOOQQ<= O<= OOOQQ<= P<= POOQQ<<Lc<<LcO&1ZQWO<<LcO&1`QYO<<LcO&1gQWO<= OO&1lQWO<= POOQQ1G3m1G3mO<kQWO7+)^O&1qQWO<<ItO&1|Q!LSO<<ItOOQO<<Hq<<HqOOQ$IUAN?YAN?YOOQOAN?RAN?RO$-xQ$IvOAN?ROOQOAN>vAN>vO$}QYOAN?RO<kQWOAN>vO&2WQ$I[OAN?RO!3xQ`OAN>vO&2cQ$I[OAN?ROAWQ`OAN>vO&2qQ$I[OAN?ROOQO<<Mg<<MgOOQQG26xG26xONmQ&jOG26xO!EaQWOG26xO&3VQWOG26xO$C|QrOG26xO&3_Q!LSO<<J[O&3lQ!LSO1G2SO&5bQ!LSO1G2fO&7eQ!LSO1G2hO&9hQ!LSO<<J|O&9uQ!LSO<<IoOOQO1G1m1G1mO!!SQ&jOANA[OOQO7+*P7+*PO&:SQWO7+*PO&:_QWO<<NuO&:gQpO7+*ROOQ$IS<<Ke<<KeO$AxQWO<<KeOOQ$IS<<Kd<<KdO&:qQpO<<KeO$AxQWO<<KdOOQO7+*[7+*[O7{QWO7+*[O&:xQWO<<N}OOQQG27eG27eO7sQ$I[OG27eO!$]QYO1G4lO&;QQWO7++`O7sQ$I[O1G3SO#CxQWO1G3SO&;YQ`O1G0aO&;dQ`O1G0aO7iQWO1G3SO!3xQ`O1G3SO'|Q`O1G3SO%AeQ$IdO1G3SO$+jQ$IdO1G0aO&;qQ`O1G3SO%E[QWOANArOOQQANArANArONmQ&jOANArO&<SQWOANArOOQQANAuANAuO7sQ$I[OANAuO#CxQWOANAuOOQO'#HQ'#HQOOQO7+*Z7+*ZOOQQG22uG22uOOQQANA}ANA}O&<[QWOANA}OOQQANDjANDjOOQQANDkANDkOOQQ<<Lx<<LxO!$]QYOAN?`OOQOG24mG24mO$-xQ$IvOG24mOOQOG24bG24bO$}QYOG24mO<kQWOG24bO&<aQ$I[OG24mO!3xQ`OG24bO&<lQ$I[OG24mO!EaQWOLD,dOOQQLD,dLD,dONmQ&jOLD,dO&<zQWOLD,dO&=SQ!LSO7+'nO&>xQ!LSO7+'pO&@nQ&jOG26vOOQO<<Mk<<MkOOQ$ISANAPANAPO$AxQWOANAPOOQ$ISANAOANAOOOQO<<Mv<<MvOOQQLD-PLD-PO&AOQ!LSO7+*WOOQO7+(n7+(nO7sQ$I[O7+(nO&AYQ`O7+%{O#CxQWO7+(nO7iQWO7+(nO!3xQ`O7+(nO'|Q`O7+(nOOQQG27^G27^O%E[QWOG27^ONmQ&jOG27^OOQQG27aG27aO7sQ$I[OG27aOOQQG27iG27iO&AdQ!LSOG24zOOQOLD*XLD*XO$-xQ$IvOLD*XOOQOLD)|LD)|O$}QYOLD*XO<kQWOLD)|O&AnQ$I[OLD*XOOQQ!$(!O!$(!OO!EaQWO!$(!OONmQ&jO!$(!OO&AyQ$IvOG26vOOQ$ISG26kG26kOOQO<<LY<<LYO7sQ$I[O<<LYO#CxQWO<<LYO7iQWO<<LYO!3xQ`O<<LYOOQQLD,xLD,xO%E[QWOLD,xOOQQLD,{LD,{OOQO!$'Ms!$'MsO$-xQ$IvO!$'MsOOQO!$'Mh!$'MhO$}QYO!$'MsOOQQ!)9Ej!)9EjO!EaQWO!)9EjOOQOANAtANAtO7sQ$I[OANAtO#CxQWOANAtO7iQWOANAtOOQQ!$(!d!$(!dOOQO!)9C_!)9C_O$-xQ$IvO!)9C_OOQQ!.K;U!.K;UO&D[Q!LSOG26vOOQOG27`G27`O7sQ$I[OG27`O#CxQWOG27`OOQO!.K8y!.K8yOOQOLD,zLD,zO7sQ$I[OLD,zOOQO!$(!f!$(!fO!$]QYO'#DtO/mQWO'#EPO&FQQrO'#JQO!$]QYO'#DlO&FXQrO'#CgO&HoQrO'#CgO&IPQYO,5:}O!$]QYO,5;XO!$]QYO,5;XO!$]QYO,5;XO!$]QYO,5;XO!$]QYO,5;XO!$]QYO,5;XO!$]QYO,5;XO!$]QYO,5;XO!$]QYO,5;XO!$]QYO,5;XO!$]QYO,5;XO!$]QYO'#I^O&KPQWO,5<^O&KXQ&jO,5;XO&LiQ&jO,5;XO!$]QYO,5;mO/pQWO'#DRO/pQWO'#DRONmQ&jO'#FsO&KXQ&jO'#FsONmQ&jO'#FuO&KXQ&jO'#FuONmQ&jO'#GTO&KXQ&jO'#GTO!$]QYO,5?{O&IPQYO1G0iO&LpQ!LSO'#CgO!$]QYO1G1uONmQ&jO,5<zO&KXQ&jO,5<zONmQ&jO,5<|O&KXQ&jO,5<|ONmQ&jO,5<hO&KXQ&jO,5<hO&IPQYO1G1vO!$]QYO7+&pONmQ&jO1G2SO&KXQ&jO1G2SONmQ&jO1G2UO&KXQ&jO1G2UO&IPQYO7+'bO&IPQYO7+&TONmQ&jOANA[O&KXQ&jOANA[O&LzQWO'#EcO&MPQWO'#EcO&MXQWO'#FRO&M^QWO'#EmO&McQWO'#JaO&MnQWO'#J_O&MyQWO,5:}O&NOQ&jO,5<ZO&NVQWO'#F|O&N[QWO'#F|O&NaQWO,5<[O&NiQWO,5:}O&NqQ!LSO1G1UO&NxQWO,5<hO&N}QWO,5<hO' SQWO,5<jO' XQWO,5<jO' ^QWO1G1vO' cQWO1G0iO' hQ&jO<<KpO' oQ&jO<<KpO6UQ&jO'#FqO7iQWO'#FpO?PQWO'#EbO!$]QYO,5;jO!-PQWO'#F|O!-PQWO'#F|O!-PQWO'#GOO!-PQWO'#GOO!!SQ&jO7+(UO!!SQ&jO7+(UO$?lQpO1G2jO$?lQpO1G2jONmQ&jO,5=OONmQ&jO,5=O",
  stateData: "'!w~O'gOS'hOSSOSTOS~OPVOQVOW!OO[hO^mOasObrOihOkVOlhOmhOrhOtVOvVO{TO!OhO!PhO!VUO!apO!fWO!iVO!jVO!kVO!lVO!mVO!pqO!tYO#kxO#{uO$PcO%ZvO%]yO%_wO%`wO%czO%e{O%h|O%i|O%k}O%x!PO&O!QO&Q!RO&S!SO&U!TO&X!UO&_!VO&e!WO&g!XO&i!YO&k!ZO&m![O'jRO'rSO'}XO([fO~OPVOQVO[hOa!bOb!aOihOkVOlhOmhOrhOtVOvVO{TO!OhO!PhO!V!^O!apO!fWO!iVO!jVO!kVO!lVO!mVO!p!`O#{!cO$PcO'j!]O'rSO'}XO([fO~O[!fO^!lOl!fO{!gO!Y!mO!Z!kO![!kO!t;SO!x!qO!y!oO!z!pO!{!nO#O!rO#P!rO'k!dO's!eO'}!iO~OPZXYZX^ZXkZXxZXyZX{ZX!TZX!cZX!dZX!fZX!lZX#SZX#_cX#bZX#cZX#dZX#eZX#fZX#gZX#hZX#iZX#jZX#lZX#nZX#pZX#qZX#vZX'eZX'rZX(OZX(VZX(WZX~O!_$uX~P(UOR!sO'c!tO'd!vO~OPVOQVO[hOa!bOb!aOihOkVOlhOmhOrhOtVOvVO{TO!OhO!PhO!V!^O!apO!fWO!iVO!jVO!kVO!lVO!mVO!p!`O#{!cO$PcO'j;VO'rSO'}XO([fO~O!S!zO!T!wO!Q'vP!Q(SP~P*qO!U#SO~P`OPVOQVO[hOa!bOb!aOihOkVOlhOmhOrhOtVOvVO{TO!OhO!PhO!V!^O!apO!fWO!iVO!jVO!kVO!lVO!mVO!p!`O#{!cO$PcO'rSO'}XO([fO~O!S#YO!tYO#]#]O#^#YO'j;WO!e(PP~P-YO!f#_O'j#^O~O!p#cO!tYO%Z#dO~O#_#eO~O!_#fO#_#eO~OP#|OY$TOk#qOx#jOy#kO{#lO!T$QO!c#sO!d#hO!f#iO!l#|O#b#oO#c#pO#d#pO#e#pO#f#rO#g#sO#h#sO#i$SO#j#sO#l#tO#n#vO#p#xO#q#yO'rSO(O#zO(V#mO(W#nO~O^'tX'e'tX'a'tX!e'tX!Q'tX!V'tX%['tX!_'tX~P0_O#S$UO#v$UOP'uXY'uXk'uXx'uXy'uX{'uX!T'uX!c'uX!f'uX!l'uX#b'uX#c'uX#d'uX#e'uX#f'uX#g'uX#h'uX#i'uX#j'uX#l'uX#n'uX#p'uX#q'uX'r'uX(O'uX(V'uX(W'uX!V'uX%['uX~O^'uX!d'uX'e'uX'a'uX!Q'uX!e'uXo'uX!_'uX~P2uO#S$UO~O$R$WO$T$VO$[$]O~O!V$^O$PcO$_$_O$a$aO~O[$dOi$sOk$eOl$dOm$dOr$tOt$uOv$vO{$lO!V$mO!a${O!f$iO#^$|O#{$yO$h$wO$j$xO$m$zO'j$cO'n$rO'r$fOd'oP~O!f$}O~O!_%PO~O^%QO'e%QO~O'j%UO~O!f$}O'j%UO'k!dO'n$rO~Ob%]O!f$}O'j%UO~O#j#sO~O[%fOx%bO!V%_O!f%aO%]%eO'j%UO'k!dO](dP~O!p#cO~O{%gO!V%hO'j%UO~O{%gO!V%hO%e%lO'j%UO~O'j%mO~O#kxO%]yO%_wO%`wO%czO%e{O%h|O%i|O~Oa%vOb%uO!p%sO%Z%tO%m%rO~P:POa%yObrO!V%xO!pqO!tYO#kxO%ZvO%_wO%`wO%czO%e{O%h|O%i|O%k}O~O_%|O#S&PO%]%zO'k!dO~P;OO!f&QO!i&UO~O!f#_O~O!VUO~O^%QO'b&^O'e%QO~O^%QO'b&aO'e%QO~O^%QO'b&cO'e%QO~O'aZX!QZXoZX!eZX%|ZX!VZX%[ZX!_ZX~P(UO[&gOl&gO{&fO!S&jO!Y&pO!Z&iO![&iO'k!dO's&eO!U'wP!U(UP~Og&sO!V&qO'j%UO~Ob&xO!f$}O'j%UO~Ox%bO!f%aO~O[!fOl!fO{!gO!Y&}O!Z&|O![&|O!y'PO!z'PO!{'OO#O'RO#P'RO'k!dO's!eO'}!iO~O!t;SO!x'QO~P?dO^%QO!_#fO!f$}O!l'XO#S'VO'e%QO'n$rO(O'TO~O[!fOl!fO{!gO's!eO'}!iO~O!Z&|O![&|O'k!dO~PAWO!Y&}O!Z&|O![&|O#O'RO#P'RO'k!dO~PAWO!VUO!Y&}O!Z&|O![&|O!{'OO#O'RO#P'RO'k!dO~PAWOR!sO'c!tO'd'_O~O!S'aO!Q&uX!Q&{X!T&uX!T&{X~P*qO!T'cO!Q'vX~OP#|OY$TOk#qOx#jOy#kO{#lO!T'cO!c#sO!d#hO!f#iO!l#|O#b#oO#c#pO#d#pO#e#pO#f#rO#g#sO#h#sO#i$SO#j#sO#l#tO#n#vO#p#xO#q#yO'rSO(O#zO(V#mO(W#nO~O!Q'vX~PCrO!Q'hO~O!Q(RX!T(RX!_(RX!e(RX(O(RX~O#S(RX#_#WX!U(RX~PExO#S'iO!Q(TX!T(TX~O!T'jO!Q(SX~O!Q'mO~O#S$UO~PExO!U'nO~P`Ox#jOy#kO{#lO!d#hO!f#iO'rSOP!haY!hak!ha!T!ha!c!ha!l!ha#b!ha#c!ha#d!ha#e!ha#f!ha#g!ha#h!ha#i!ha#j!ha#l!ha#n!ha#p!ha#q!ha(O!ha(V!ha(W!ha~O^!ha'e!ha'a!ha!Q!ha!e!hao!ha!V!ha%[!ha!_!ha~PG`O!e'oO~O{%gO!V%hO!tYO#]'rO#^'qO'j%UO~O!_#fO#S'sO(O'TO!T(QX^(QX'e(QX~O!e(QX~PJdO!T'vO!e(PX~O!e'xO~O{%gO!V%hO#^'qO'j%UO~Ox'yOy'zO!d#hO!f#iO!t!sa{!sa~O!p!sa%Z!sa!V!sa#]!sa#^!sa'j!sa~PKlO!p(OO~OPVOQVO[hOa!bOb!aOihOkVOlhOmhOrhOtVOvVO{TO!OhO!PhO!VUO!apO!fWO!iVO!jVO!kVO!lVO!mVO!p!`O#{!cO$PcO'j!]O'rSO'}XO([fO~O[$dOi$sOk$eOl$dOm$dOr$tOt$uOv;jO{$lO!V$mO!a<sO!f$iO#^;pO#{$yO$h;lO$j;nO$m$zO'j(SO'n$rO'r$fO~O#_(UO~O[$dOi$sOk$eOl$dOm$dOr$tOt$uOv$vO{$lO!V$mO!a${O!f$iO#^$|O#{$yO$h$wO$j$xO$m$zO'j(SO'n$rO'r$fO~Od'yP~P!!SO!S(YO!e'zP~P$}O's([O'}XO~O{(^O!f#iO's([O'}XO~OP;ROQ;RO[hOa<oOb!aOihOk;ROlhOmhOrhOt;ROv;RO{TO!OhO!PhO!V!^O!a;UO!fWO!i;RO!j;RO!k;RO!l;RO!m;RO!p!`O#{!cO$PcO'j(lO'rSO'}XO([<mO~Oy(oO!f#iO~O!T$QO^$fa'e$fa'a$fa!e$fa!Q$fa!V$fa%[$fa!_$fa~O#k(sO~PNmOx(vO!_(uO!V$SX$O$SX$R$SX$T$SX$[$SX~O!_(uO!V(XX$O(XX$R(XX$T(XX$[(XX~Ox(vO~P!'rOx(vO!V(XX$O(XX$R(XX$T(XX$[(XX~O!V(xO$O(|O$R(wO$T(wO$[(}O~O!S)QO~P!$]O$R$WO$T$VO$[)UO~Og$nXx$nX{$nX!d$nX(V$nX(W$nX~OdfXd$nXgfX!TfX#SfX~P!)hOl)WO~OR)XO'c)YO'd)[O~Og)eOx)^O{)_O(V)aO(W)cO~Od)]O~P!*qOd)fO~O[$dOi$sOk$eOl$dOm$dOr$tOt$uOv;jO{$lO!V$mO!a<sO!f$iO#^;pO#{$yO$h;lO$j;nO$m$zO'n$rO'r$fO~O!S)jO'j)gO!e(]P~P!+`O#_)lO~O!f)mO~O!S)rO'j)oO!Q(^P~P!+`Ok*OO{)vO!Y)|O!Z)uO![)uO!f)mO#O)}O%R)xO'k!dO's!eO~O!U){O~P!-cO!d#hOg'qXx'qX{'qX(V'qX(W'qX!T'qX#S'qX~Od'qX#t'qX~P!.[Og*RO#S*QOd'pX!T'pX~O!T*SOd'oX~O'j%mOd'oP~O!f*ZO~O'j(SO~O{%gO!S#YO!V%hO!tYO#]#]O#^#YO'j%UO!e(PP~O!_#fO#_*_O~OP#|OY$TOk#qOx#jOy#kO{#lO!c#sO!d#hO!f#iO!l#|O#b#oO#c#pO#d#pO#e#pO#f#rO#g#sO#h#sO#i$SO#j#sO#l#tO#n#vO#p#xO#q#yO'rSO(O#zO(V#mO(W#nO~O^!`a!T!`a'e!`a'a!`a!Q!`a!e!`ao!`a!V!`a%[!`a!_!`a~P!0nOg*fO!V&qO%[*eO'n$rO~O!_*hO!V'mX^'mX!T'mX'e'mX~O!f$}O'n$rO~O!f$}O'j%UO'n$rO~O!_#fO#_(UO~O[*sO%]*tO'j*pO!U(eP~O!T*uO](dX~O's([O~OY*yO~O]*zO~O!V%_O'j%UO'k!dO](dP~O{%gO!S+OO!T'jO!V%hO'j%UO!Q(SP~O[&mOl&mO{+QO!S+PO's([O~O!U(UP~P!6OO!T+RO^(aX'e(aX~O#S+VO'n$rO~Og+YO!V$mO'n$rO~O!V+[O~Ox+^O!VUO~O!p+cO~Ob+hO~O'j#^O!U(cP~Ob%]O~O%]yO'j%mO~P;OOY+nO]+mO~OPVOQVO[hOasObrOihOkVOlhOmhOrhOtVOvVO{TO!OhO!PhO!apO!fWO!iVO!jVO!kVO!lVO!mVO!pqO!tYO$PcO%ZvO'rSO'}XO([fO~O!V!^O#{!cO'j!]O~P!8`O]+mO^%QO'e%QO~O^+rO#k+tO%_+tO%`+tO~P$}O!f&QO~O&O+yO~O!V+{O~O&a+}O&c,OOP&^aQ&^aW&^a[&^a^&^aa&^ab&^ai&^ak&^al&^am&^ar&^at&^av&^a{&^a!O&^a!P&^a!V&^a!a&^a!f&^a!i&^a!j&^a!k&^a!l&^a!m&^a!p&^a!t&^a#k&^a#{&^a$P&^a%Z&^a%]&^a%_&^a%`&^a%c&^a%e&^a%h&^a%i&^a%k&^a%x&^a&O&^a&Q&^a&S&^a&U&^a&X&^a&_&^a&e&^a&g&^a&i&^a&k&^a&m&^a'a&^a'j&^a'r&^a'}&^a([&^a!U&^a&V&^a_&^a&[&^a~O'j,TO~O!TzX!T!]X!UzX!U!]X!_zX!_!]X!f!]X#SzX'n!]X~O!_,YO#S,XO!T#[X!T'xX!U#[X!U'xX!_'xX!f'xX'n'xX~O!_,[O!f$}O'n$rO!T!XX!U!XX~O[!fOl!fO{!gO's!eO~OP;ROQ;RO[hOa<oOb!aOihOk;ROlhOmhOrhOt;ROv;RO{TO!OhO!PhO!V!^O!a;UO!fWO!i;RO!j;RO!k;RO!l;RO!m;RO!p!`O#{!cO$PcO'rSO'}XO([<mO~O'j;tO~P!AlO!T,`O!U'wX~O!U,bO~O!_,YO#S,XO!T#[X!U#[X~O!T,cO!U(UX~O!U,eO~O[!fOl!fO{!gO'k!dO's!eO~O!Z,fO![,fO~P!DjO!U,iO~P&}Og,lO!V&qO~O!Q,qO~O[!sal!sa!Y!sa!Z!sa![!sa!x!sa!y!sa!z!sa!{!sa#O!sa#P!sa'k!sa's!sa'}!sa~PKlO^%QO!_#fO!f$}O!l,vO#S,tO'e%QO'n$rO(O'TO~O!Z,xO![,xO'k!dO~PAWO!Y,zO!Z,xO![,xO#O,{O#P,{O'k!dO~PAWO!Y,zO!Z,xO![,xO!{,|O#O,{O#P,{O'k!dO~PAWO!Y,zO!Z,xO![,xO!y,}O!z,}O!{,|O#O,{O#P,{O'k!dO~PAWO^%QO#S,tO'e%QO~O^%QO!_#fO#S,tO'e%QO~O^%QO!_#fO!l,vO#S,tO'e%QO(O'TO~Oo-RO~O!Q&ua!T&ua~P!0nO!S-VO!Q&uX!T&uX~P$}O!T'cO!Q'va~O!Q'va~PCrO!T'jO!Q(Sa~O{%gO!S-ZO!V%hO'j%UO!Q&{X!T&{X~O!T'vO!e(Pa~O{%gO!V%hO#^-^O'j%UO~O#S-`O!T(Qa!e(Qa^(Qa'e(Qa~O!_#fO~P!LUO{%gO!S-cO!V%hO!tYO#]-eO#^-cO'j%UO!T&}X!e&}X~Oy-iO!f#iO~Og-lO!V&qO%[-kO'n$rO~O^#Vi!T#Vi'e#Vi'a#Vi!Q#Vi!e#Vio#Vi!V#Vi%[#Vi!_#Vi~P!0nOg<yOx)^O{)_O(V)aO(W)cO~O#_#Ra^#Ra#S#Ra'e#Ra!T#Ra!e#Ra!V#Ra!Q#Ra~P!NgO#_'qXP'qXY'qX^'qXk'qXy'qX!c'qX!f'qX!l'qX#b'qX#c'qX#d'qX#e'qX#f'qX#g'qX#h'qX#i'qX#j'qX#l'qX#n'qX#p'qX#q'qX'e'qX'r'qX(O'qX!e'qX!Q'qX'a'qXo'qX!V'qX%['qX!_'qX~P!.[O!T-uOd'yX~P!*qOd-wO~O!T-xO!e'zX~P!0nO!e-{O~O!Q-}O~OP#|Ox#jOy#kO{#lO!d#hO!f#iO!l#|O'rSOY#ai^#aik#ai!T#ai!c#ai#c#ai#d#ai#e#ai#f#ai#g#ai#h#ai#i#ai#j#ai#l#ai#n#ai#p#ai#q#ai'e#ai(O#ai(V#ai(W#ai'a#ai!Q#ai!e#aio#ai!V#ai%[#ai!_#ai~O#b#ai~P#$cO#b#oO~P#$cOP#|Ox#jOy#kO{#lO!d#hO!f#iO!l#|O#b#oO#c#pO#d#pO#e#pO'rSOY#ai^#ai!T#ai!c#ai#f#ai#g#ai#h#ai#i#ai#j#ai#l#ai#n#ai#p#ai#q#ai'e#ai(O#ai(V#ai(W#ai'a#ai!Q#ai!e#aio#ai!V#ai%[#ai!_#ai~Ok#ai~P#'TOk#qO~P#'TOP#|Ok#qOx#jOy#kO{#lO!d#hO!f#iO!l#|O#b#oO#c#pO#d#pO#e#pO#f#rO'rSO^#ai!T#ai#l#ai#n#ai#p#ai#q#ai'e#ai(O#ai(V#ai(W#ai'a#ai!Q#ai!e#aio#ai!V#ai%[#ai!_#ai~OY#ai!c#ai#g#ai#h#ai#i#ai#j#ai~P#)uOY$TO!c#sO#g#sO#h#sO#i$SO#j#sO~P#)uOP#|OY$TOk#qOx#jOy#kO{#lO!c#sO!d#hO!f#iO!l#|O#b#oO#c#pO#d#pO#e#pO#f#rO#g#sO#h#sO#i$SO#j#sO#l#tO'rSO^#ai!T#ai#n#ai#p#ai#q#ai'e#ai(O#ai(W#ai'a#ai!Q#ai!e#aio#ai!V#ai%[#ai!_#ai~O(V#ai~P#,vO(V#mO~P#,vOP#|OY$TOk#qOx#jOy#kO{#lO!c#sO!d#hO!f#iO!l#|O#b#oO#c#pO#d#pO#e#pO#f#rO#g#sO#h#sO#i$SO#j#sO#l#tO#n#vO'rSO(V#mO^#ai!T#ai#p#ai#q#ai'e#ai(O#ai'a#ai!Q#ai!e#aio#ai!V#ai%[#ai!_#ai~O(W#ai~P#/hO(W#nO~P#/hOP#|OY$TOk#qOx#jOy#kO{#lO!c#sO!d#hO!f#iO!l#|O#b#oO#c#pO#d#pO#e#pO#f#rO#g#sO#h#sO#i$SO#j#sO#l#tO#n#vO#p#xO'rSO(V#mO(W#nO~O^#ai!T#ai#q#ai'e#ai(O#ai'a#ai!Q#ai!e#aio#ai!V#ai%[#ai!_#ai~P#2YOPZXYZXkZXxZXyZX{ZX!cZX!dZX!fZX!lZX#SZX#_cX#bZX#cZX#dZX#eZX#fZX#gZX#hZX#iZX#jZX#lZX#nZX#pZX#qZX#vZX'rZX(OZX(VZX(WZX!TZX!UZX~O#tZX~P#4sOP#|OY;hOk;[Ox#jOy#kO{#lO!c;^O!d#hO!f#iO!l#|O#b;YO#c;ZO#d;ZO#e;ZO#f;]O#g;^O#h;^O#i;gO#j;^O#l;_O#n;aO#p;cO#q;dO'rSO(O#zO(V#mO(W#nO~O#t.PO~P#7QOP'uXY'uXk'uXx'uXy'uX{'uX!c'uX!d'uX!f'uX!l'uX#b'uX#c'uX#d'uX#e'uX#f'uX#g'uX#h'uX#i'uX#l'uX#n'uX#p'uX#q'uX'r'uX(O'uX(V'uX(W'uX!T'uX~O#S;iO#v;iO#j'uX#t'uX!U'uX~P#9OO^'Qa!T'Qa'e'Qa'a'Qa!e'Qa!Q'Qao'Qa!V'Qa%['Qa!_'Qa~P!0nOP#aiY#ai^#aik#aiy#ai!T#ai!c#ai!d#ai!f#ai!l#ai#b#ai#c#ai#d#ai#e#ai#f#ai#g#ai#h#ai#i#ai#j#ai#l#ai#n#ai#p#ai#q#ai'e#ai'r#ai(O#ai'a#ai!Q#ai!e#aio#ai!V#ai%[#ai!_#ai~P!NgO^#ui!T#ui'e#ui'a#ui!Q#ui!e#uio#ui!V#ui%[#ui!_#ui~P!0nO$R.SO$T.SO~O$R.TO$T.TO~O!_(uO#S.UO!V$XX$O$XX$R$XX$T$XX$[$XX~O!S.VO~O!V(xO$O.XO$R(wO$T(wO$[.YO~O!T;eO!U'tX~P#7QO!U.ZO~O!_(uO$[(XX~O$[.]O~OR)XO'c)YO'd.`O~O[.cOl.cO!Q.dO~O!TcX!_cX!ecX!e$nX(OcX~P!)hO!e.jO~P!NgO!T.kO!_#fO(O'TO!e(]X~O!e.pO~O!S)jO'j%UO!e(]P~O#_.rO~O!Q$nX!T$nX!_$uX~P!)hO!T.sO!Q(^X~P!NgO!_.uO~O!Q.wO~Ok.{O!_#fO!f$}O'n$rO(O'TO~O'j.}O~O!_*hO~O^%QO!T/RO'e%QO~O!U/TO~P!-cO!Z/UO![/UO'k!dO's!eO~O{/WO's!eO~O#O/XO~O'j%mOd'VX!T'VX~O!T*SOd'oa~Od/^O~Ox/_Oy/_O{/`Ogua(Vua(Wua!Tua#Sua~Odua#tua~P#EfOx)^O{)_Og$ga(V$ga(W$ga!T$ga#S$ga~Od$ga#t$ga~P#F[Ox)^O{)_Og$ia(V$ia(W$ia!T$ia#S$ia~Od$ia#t$ia~P#F}O[/aO~O#_/bO~Od$wa!T$wa#S$wa#t$wa~P!*qO#_/eO~Og-lO!V&qO%[-kO~O[$dOk$eOl$dOm$dOr$tOt$uOv;jO{$lO!V$mO!a<sO!f$iO#^;pO#{$yO$h;lO$j;nO$m$zO'n$rO'r$fO~Oi/lO'j/kO~P#HlO!_*hO!V'ma^'ma!T'ma'e'ma~O#_/rO~OYZX!TcX!UcX~O!T/sO!U(eX~O!U/uO~OY/vO~O[/xO'j*pO~O!V%_O'j%UO]'_X!T'_X~O!T*uO](da~O!e/{O~P!0nO[/}O~OY0OO~O]0PO~O!T+RO^(aa'e(aa~O#S0VO~Og0YO!V$mO~O's([O!U(bP~Og0cO!V0`O%[0bO'n$rO~OY0mO!T0kO!U(cX~O!U0nO~O]0pO^%QO'e%QO~O[0qO~O[0rO'j#^O~O#S$UO#j0sO#v$UO%|0tO^'uX~P#9OO#S$UO#j0sO%|0tO~O^0uO~P$}O^0wO~O&V0{OP&TiQ&TiW&Ti[&Ti^&Tia&Tib&Tii&Tik&Til&Tim&Tir&Tit&Tiv&Ti{&Ti!O&Ti!P&Ti!V&Ti!a&Ti!f&Ti!i&Ti!j&Ti!k&Ti!l&Ti!m&Ti!p&Ti!t&Ti#k&Ti#{&Ti$P&Ti%Z&Ti%]&Ti%_&Ti%`&Ti%c&Ti%e&Ti%h&Ti%i&Ti%k&Ti%x&Ti&O&Ti&Q&Ti&S&Ti&U&Ti&X&Ti&_&Ti&e&Ti&g&Ti&i&Ti&k&Ti&m&Ti'a&Ti'j&Ti'r&Ti'}&Ti([&Ti!U&Ti_&Ti&[&Ti~O_1RO!U1PO&[1QO~P`O!VUO!f1TO~O&c,OOP&^iQ&^iW&^i[&^i^&^ia&^ib&^ii&^ik&^il&^im&^ir&^it&^iv&^i{&^i!O&^i!P&^i!V&^i!a&^i!f&^i!i&^i!j&^i!k&^i!l&^i!m&^i!p&^i!t&^i#k&^i#{&^i$P&^i%Z&^i%]&^i%_&^i%`&^i%c&^i%e&^i%h&^i%i&^i%k&^i%x&^i&O&^i&Q&^i&S&^i&U&^i&X&^i&_&^i&e&^i&g&^i&i&^i&k&^i&m&^i'a&^i'j&^i'r&^i'}&^i([&^i!U&^i&V&^i_&^i&[&^i~O!Q1ZO~O!T!Xa!U!Xa~P#7QO!S1aO!Y&pO!Z&iO![&iO!T&vX!U&vX~P!DjO!T,`O!U'wa~O!T&|X!U&|X~P!6OO!T,cO!U(Ua~O!U1hO~P&}O^%QO#S1qO'e%QO~O^%QO!_#fO#S1qO'e%QO~O^%QO!_#fO!f$}O!l1uO#S1qO'e%QO'n$rO(O'TO~O!Z1vO![1vO'k!dO~PAWO!Y1yO!Z1vO![1vO#O1zO#P1zO'k!dO~PAWO!Y1yO!Z1vO![1vO!{1{O#O1zO#P1zO'k!dO~PAWO^%QO!_#fO!l1uO#S1qO'e%QO(O'TO~O^%QO'e%QO~P!0nO!T$QOo$fa~O!Q&ui!T&ui~P!0nO!T'cO!Q'vi~O!T'jO!Q(Si~O!Q(Ti!T(Ti~P!0nO!T'vO!e(Pi~O!T(Qi!e(Qi^(Qi'e(Qi~P!0nO#S2PO!T(Qi!e(Qi^(Qi'e(Qi~O{%gO!V%hO!tYO#]2SO#^2RO'j%UO~O{%gO!V%hO#^2RO'j%UO~Og2ZO!V&qO%[2YO~Og2ZO!V&qO%[2YO'n$rO~O#_uaPuaYua^uakua!cua!dua!fua!lua#bua#cua#dua#eua#fua#gua#hua#iua#jua#lua#nua#pua#qua'eua'rua(Oua!eua!Qua'auaoua!Vua%[ua!_ua~P#EfO#_$gaP$gaY$ga^$gak$gay$ga!c$ga!d$ga!f$ga!l$ga#b$ga#c$ga#d$ga#e$ga#f$ga#g$ga#h$ga#i$ga#j$ga#l$ga#n$ga#p$ga#q$ga'e$ga'r$ga(O$ga!e$ga!Q$ga'a$gao$ga!V$ga%[$ga!_$ga~P#F[O#_$iaP$iaY$ia^$iak$iay$ia!c$ia!d$ia!f$ia!l$ia#b$ia#c$ia#d$ia#e$ia#f$ia#g$ia#h$ia#i$ia#j$ia#l$ia#n$ia#p$ia#q$ia'e$ia'r$ia(O$ia!e$ia!Q$ia'a$iao$ia!V$ia%[$ia!_$ia~P#F}O#_$waP$waY$wa^$wak$way$wa!T$wa!c$wa!d$wa!f$wa!l$wa#b$wa#c$wa#d$wa#e$wa#f$wa#g$wa#h$wa#i$wa#j$wa#l$wa#n$wa#p$wa#q$wa'e$wa'r$wa(O$wa!e$wa!Q$wa'a$wa#S$wao$wa!V$wa%[$wa!_$wa~P!NgO^#Vq!T#Vq'e#Vq'a#Vq!Q#Vq!e#Vqo#Vq!V#Vq%[#Vq!_#Vq~P!0nOd&wX!T&wX~P!!SO!T-uOd'ya~O!S2cO!T&xX!e&xX~P$}O!T-xO!e'za~O!T-xO!e'za~P!0nO!Q2fO~O#t!ha!U!ha~PG`O#t!`a!T!`a!U!`a~P#7QO!V2wO$PcO$Y2xO~O!U2|O~Oo2}O~P!NgO^$cq!T$cq'e$cq'a$cq!Q$cq!e$cqo$cq!V$cq%[$cq!_$cq~P!0nO!Q3OO~O[.cOl.cO~Ox)^O{)_O(W)cOg%Si(V%Si!T%Si#S%Si~Od%Si#t%Si~P$>WOx)^O{)_Og%Ui(V%Ui(W%Ui!T%Ui#S%Ui~Od%Ui#t%Ui~P$>yO(O#zO~P!NgO!S3RO'j%UO!T'RX!e'RX~O!T.kO!e(]a~O!T.kO!_#fO!e(]a~O!T.kO!_#fO(O'TO!e(]a~Od$pi!T$pi#S$pi#t$pi~P!*qO!S3ZO'j)oO!Q'TX!T'TX~P!+`O!T.sO!Q(^a~O!T.sO!Q(^a~P!NgO!_#fO~O!_#fO#j3cO~Ok3fO!_#fO(O'TO~Od'pi!T'pi~P!*qO#S3iOd'pi!T'pi~P!*qO!e3lO~O^$dq!T$dq'e$dq'a$dq!Q$dq!e$dqo$dq!V$dq%[$dq!_$dq~P!0nO!T3pO!V(_X~P!NgO!d#hO~P2uO!V$nX%PZX^$nX!T$nX'e$nX~P!)hO%P3rOghXxhX{hX!VhX(VhX(WhX^hX!ThX'ehX~O%P3rO~O[3xO%]3yO'j*pO!T'^X!U'^X~O!T/sO!U(ea~OY3}O~O]4OO~O[4RO~O!Q4SO~O^%QO'e%QO~P!NgO!V$mO~P!NgO!T4XO#S4ZO!U(bX~O!U4[O~O[!fOl!fO{4^O!Y4kO!Z4bO![4bO!t;SO!x4jO!y4iO!z4iO!{4hO#O4gO#P!rO'k!dO's!eO'}!iO~O!U4fO~P$GPOg4pO!V0`O%[4oO~Og4pO!V0`O%[4oO'n$rO~O'j#^O!T']X!U']X~O!T0kO!U(ca~O[4zO's4yO~O[4{O~O]4}O~O!e5QO~P$}O^5SO~O^5SO~P$}O#j5UO%|5VO~PJdO_1RO!U5ZO&[1QO~P`O!_5]O~O!_5_O!T'xi!U'xi!_'xi!f'xi'n'xi~O!T#[i!U#[i~P#7QO#S5`O!T#[i!U#[i~O!T!Xi!U!Xi~P#7QO^%QO#S5iO'e%QO~O^%QO!_#fO#S5iO'e%QO~O^%QO!_#fO!l5nO#S5iO'e%QO(O'TO~O!f$}O'n$rO~P$L]O!Z5oO![5oO'k!dO~PAWO!Y5rO!Z5oO![5oO#O5sO#P5sO'k!dO~PAWO!T'vO!e(Pq~O!T(Qq!e(Qq^(Qq'e(Qq~P!0nO{%gO!V%hO#^5wO'j%UO~O!V&qO%[5zO~Og5}O!V&qO%[5zO~O#_%SiP%SiY%Si^%Sik%Siy%Si!c%Si!d%Si!f%Si!l%Si#b%Si#c%Si#d%Si#e%Si#f%Si#g%Si#h%Si#i%Si#j%Si#l%Si#n%Si#p%Si#q%Si'e%Si'r%Si(O%Si!e%Si!Q%Si'a%Sio%Si!V%Si%[%Si!_%Si~P$>WO#_%UiP%UiY%Ui^%Uik%Uiy%Ui!c%Ui!d%Ui!f%Ui!l%Ui#b%Ui#c%Ui#d%Ui#e%Ui#f%Ui#g%Ui#h%Ui#i%Ui#j%Ui#l%Ui#n%Ui#p%Ui#q%Ui'e%Ui'r%Ui(O%Ui!e%Ui!Q%Ui'a%Uio%Ui!V%Ui%[%Ui!_%Ui~P$>yO#_$piP$piY$pi^$pik$piy$pi!T$pi!c$pi!d$pi!f$pi!l$pi#b$pi#c$pi#d$pi#e$pi#f$pi#g$pi#h$pi#i$pi#j$pi#l$pi#n$pi#p$pi#q$pi'e$pi'r$pi(O$pi!e$pi!Q$pi'a$pi#S$pio$pi!V$pi%[$pi!_$pi~P!NgOd&wa!T&wa~P!*qO!T&xa!e&xa~P!0nO!T-xO!e'zi~O#t#Vi!T#Vi!U#Vi~P#7QOP#|Ox#jOy#kO{#lO!d#hO!f#iO!l#|O'rSOY#aik#ai!c#ai#c#ai#d#ai#e#ai#f#ai#g#ai#h#ai#i#ai#j#ai#l#ai#n#ai#p#ai#q#ai#t#ai(O#ai(V#ai(W#ai!T#ai!U#ai~O#b#ai~P%(oO#b;YO~P%(oOP#|Ox#jOy#kO{#lO!d#hO!f#iO!l#|O#b;YO#c;ZO#d;ZO#e;ZO'rSOY#ai!c#ai#f#ai#g#ai#h#ai#i#ai#j#ai#l#ai#n#ai#p#ai#q#ai#t#ai(O#ai(V#ai(W#ai!T#ai!U#ai~Ok#ai~P%*zOk;[O~P%*zOP#|Ok;[Ox#jOy#kO{#lO!d#hO!f#iO!l#|O#b;YO#c;ZO#d;ZO#e;ZO#f;]O'rSO#l#ai#n#ai#p#ai#q#ai#t#ai(O#ai(V#ai(W#ai!T#ai!U#ai~OY#ai!c#ai#g#ai#h#ai#i#ai#j#ai~P%-VOY;hO!c;^O#g;^O#h;^O#i;gO#j;^O~P%-VOP#|OY;hOk;[Ox#jOy#kO{#lO!c;^O!d#hO!f#iO!l#|O#b;YO#c;ZO#d;ZO#e;ZO#f;]O#g;^O#h;^O#i;gO#j;^O#l;_O'rSO#n#ai#p#ai#q#ai#t#ai(O#ai(W#ai!T#ai!U#ai~O(V#ai~P%/qO(V#mO~P%/qOP#|OY;hOk;[Ox#jOy#kO{#lO!c;^O!d#hO!f#iO!l#|O#b;YO#c;ZO#d;ZO#e;ZO#f;]O#g;^O#h;^O#i;gO#j;^O#l;_O#n;aO'rSO(V#mO#p#ai#q#ai#t#ai(O#ai!T#ai!U#ai~O(W#ai~P%1|O(W#nO~P%1|OP#|OY;hOk;[Ox#jOy#kO{#lO!c;^O!d#hO!f#iO!l#|O#b;YO#c;ZO#d;ZO#e;ZO#f;]O#g;^O#h;^O#i;gO#j;^O#l;_O#n;aO#p;cO'rSO(V#mO(W#nO~O#q#ai#t#ai(O#ai!T#ai!U#ai~P%4XO^#ry!T#ry'e#ry'a#ry!Q#ry!e#ryo#ry!V#ry%[#ry!_#ry~P!0nOg<zOx)^O{)_O(V)aO(W)cO~OP#aiY#aik#aiy#ai!c#ai!d#ai!f#ai!l#ai#b#ai#c#ai#d#ai#e#ai#f#ai#g#ai#h#ai#i#ai#j#ai#l#ai#n#ai#p#ai#q#ai#t#ai'r#ai(O#ai!T#ai!U#ai~P%7PO!d#hOP'qXY'qXg'qXk'qXx'qXy'qX{'qX!c'qX!f'qX!l'qX#b'qX#c'qX#d'qX#e'qX#f'qX#g'qX#h'qX#i'qX#j'qX#l'qX#n'qX#p'qX#q'qX#t'qX'r'qX(O'qX(V'qX(W'qX!T'qX!U'qX~O#t#ui!T#ui!U#ui~P#7QO!U6ZO~O!T'Qa!U'Qa~P#7QO!_#fO(O'TO!T'Ra!e'Ra~O!T.kO!e(]i~O!T.kO!_#fO!e(]i~Od$pq!T$pq#S$pq#t$pq~P!*qO!Q'Ta!T'Ta~P!NgO!_6bO~O!T.sO!Q(^i~P!NgO!T.sO!Q(^i~O!Q6fO~O!_#fO#j6kO~Ok6lO!_#fO(O'TO~O!Q6nO~Od$rq!T$rq#S$rq#t$rq~P!*qO^$dy!T$dy'e$dy'a$dy!Q$dy!e$dyo$dy!V$dy%[$dy!_$dy~P!0nO!T3pO!V(_a~O^#Vy!T#Vy'e#Vy'a#Vy!Q#Vy!e#Vyo#Vy!V#Vy%[#Vy!_#Vy~P!0nOY6sO~O[6uO'j*pO~O!T/sO!U(ei~O[6xO~O]6yO~O!_5_O~O's([O!T'YX!U'YX~O!T4XO!U(ba~O!f$}O'n$rO^'xX!_'xX!l'xX#S'xX'e'xX(O'xX~O'j7SO~P-YO!t;SO!x7VO!y7UO!z7UO!{7TO#O'RO#P'RO~PAWO^%QO!_#fO!l'XO#S'VO'e%QO(O'TO~O!U7ZO~P$GPO[!fOl!fO{7[O's!eO'}!iO~O!Y7`O!Z7_O![7_O!{7TO#O'RO#P'RO'k!dO~PAWO!Y7`O!Z7_O![7_O!y7aO!z7aO!{7TO#O'RO#P'RO'k!dO~PAWO!Z7_O![7_O'k!dO's!eO'}!iO~O!V0`O~O!V0`O%[7cO~Og7fO!V0`O%[7cO~OY7kO!T']a!U']a~O!T0kO!U(ci~O[7nO~O!e7oO~O!e7pO~O!e7qO~O!e7qO~P$}O^7sO~O!_7vO~O!e7wO~O!T(Ti!U(Ti~P#7QO^%QO#S8PO'e%QO~O^%QO!_#fO#S8PO'e%QO~O^%QO!_#fO!l8TO#S8PO'e%QO(O'TO~O!f$}O'n$rO~P%GxO!Z8UO![8UO'k!dO~PAWO!T'vO!e(Py~O!T(Qy!e(Qy^(Qy'e(Qy~P!0nO!V&qO%[8YO~O#_$pqP$pqY$pq^$pqk$pqy$pq!T$pq!c$pq!d$pq!f$pq!l$pq#b$pq#c$pq#d$pq#e$pq#f$pq#g$pq#h$pq#i$pq#j$pq#l$pq#n$pq#p$pq#q$pq'e$pq'r$pq(O$pq!e$pq!Q$pq'a$pq#S$pqo$pq!V$pq%[$pq!_$pq~P!NgO#_$rqP$rqY$rq^$rqk$rqy$rq!T$rq!c$rq!d$rq!f$rq!l$rq#b$rq#c$rq#d$rq#e$rq#f$rq#g$rq#h$rq#i$rq#j$rq#l$rq#n$rq#p$rq#q$rq'e$rq'r$rq(O$rq!e$rq!Q$rq'a$rq#S$rqo$rq!V$rq%[$rq!_$rq~P!NgO!T&xi!e&xi~P!0nO#t#Vq!T#Vq!U#Vq~P#7QOx/_Oy/_O{/`OPuaYuaguakua!cua!dua!fua!lua#bua#cua#dua#eua#fua#gua#hua#iua#jua#lua#nua#pua#qua#tua'rua(Oua(Vua(Wua!Tua!Uua~Ox)^O{)_OP$gaY$gag$gak$gay$ga!c$ga!d$ga!f$ga!l$ga#b$ga#c$ga#d$ga#e$ga#f$ga#g$ga#h$ga#i$ga#j$ga#l$ga#n$ga#p$ga#q$ga#t$ga'r$ga(O$ga(V$ga(W$ga!T$ga!U$ga~Ox)^O{)_OP$iaY$iag$iak$iay$ia!c$ia!d$ia!f$ia!l$ia#b$ia#c$ia#d$ia#e$ia#f$ia#g$ia#h$ia#i$ia#j$ia#l$ia#n$ia#p$ia#q$ia#t$ia'r$ia(O$ia(V$ia(W$ia!T$ia!U$ia~OP$waY$wak$way$wa!c$wa!d$wa!f$wa!l$wa#b$wa#c$wa#d$wa#e$wa#f$wa#g$wa#h$wa#i$wa#j$wa#l$wa#n$wa#p$wa#q$wa#t$wa'r$wa(O$wa!T$wa!U$wa~P%7PO#t$cq!T$cq!U$cq~P#7QO#t$dq!T$dq!U$dq~P#7QO!U8dO~O#t8eO~P!*qO!_#fO!T'Ri!e'Ri~O!_#fO(O'TO!T'Ri!e'Ri~O!T.kO!e(]q~O!Q'Ti!T'Ti~P!NgO!T.sO!Q(^q~O!Q8kO~P!NgO!Q8kO~Od'py!T'py~P!*qO!T'Wa!V'Wa~P!NgO!V%Oq^%Oq!T%Oq'e%Oq~P!NgOY8pO~O!T/sO!U(eq~O[8sO~O#S8tO!T'Ya!U'Ya~O!T4XO!U(bi~P#7QOPZXYZXkZXxZXyZX{ZX!QZX!TZX!cZX!dZX!fZX!lZX#SZX#_cX#bZX#cZX#dZX#eZX#fZX#gZX#hZX#iZX#jZX#lZX#nZX#pZX#qZX#vZX'rZX(OZX(VZX(WZX~O!_$|X#j$|X~P&,iO#O,{O#P,{O~PAWO!{8xO#O,{O#P,{O~PAWO!y8yO!z8yO!{8xO#O,{O#P,{O~PAWO!Z8|O![8|O'k!dO's!eO'}!iO~O!Y9PO!Z8|O![8|O!{8xO#O,{O#P,{O'k!dO~PAWO!V0`O%[9SO~O[9YO's9XO~O!T0kO!U(cq~O!e9[O~O!e9[O~P$}O!e9^O~O!e9_O~O#S9aO!T#[y!U#[y~O!T#[y!U#[y~P#7QO^%QO#S9eO'e%QO~O^%QO!_#fO#S9eO'e%QO~O^%QO!_#fO!l9iO#S9eO'e%QO(O'TO~O!V&qO%[9lO~O#t#ry!T#ry!U#ry~P#7QOP$piY$pik$piy$pi!c$pi!d$pi!f$pi!l$pi#b$pi#c$pi#d$pi#e$pi#f$pi#g$pi#h$pi#i$pi#j$pi#l$pi#n$pi#p$pi#q$pi#t$pi'r$pi(O$pi!T$pi!U$pi~P%7POx)^O{)_O(W)cOP%SiY%Sig%Sik%Siy%Si!c%Si!d%Si!f%Si!l%Si#b%Si#c%Si#d%Si#e%Si#f%Si#g%Si#h%Si#i%Si#j%Si#l%Si#n%Si#p%Si#q%Si#t%Si'r%Si(O%Si(V%Si!T%Si!U%Si~Ox)^O{)_OP%UiY%Uig%Uik%Uiy%Ui!c%Ui!d%Ui!f%Ui!l%Ui#b%Ui#c%Ui#d%Ui#e%Ui#f%Ui#g%Ui#h%Ui#i%Ui#j%Ui#l%Ui#n%Ui#p%Ui#q%Ui#t%Ui'r%Ui(O%Ui(V%Ui(W%Ui!T%Ui!U%Ui~O#t$dy!T$dy!U$dy~P#7QO#t#Vy!T#Vy!U#Vy~P#7QO!_#fO!T'Rq!e'Rq~O!T.kO!e(]y~O!Q'Tq!T'Tq~P!NgO!Q9sO~P!NgO!T/sO!U(ey~O!T4XO!U(bq~O#O1zO#P1zO~PAWO!{9zO#O1zO#P1zO~PAWO!Z:OO![:OO'k!dO's!eO'}!iO~O!V0`O%[:RO~O!e:UO~O^%QO#S:ZO'e%QO~O^%QO!_#fO#S:ZO'e%QO~O!V&qO%[:`O~OP$pqY$pqk$pqy$pq!c$pq!d$pq!f$pq!l$pq#b$pq#c$pq#d$pq#e$pq#f$pq#g$pq#h$pq#i$pq#j$pq#l$pq#n$pq#p$pq#q$pq#t$pq'r$pq(O$pq!T$pq!U$pq~P%7POP$rqY$rqk$rqy$rq!c$rq!d$rq!f$rq!l$rq#b$rq#c$rq#d$rq#e$rq#f$rq#g$rq#h$rq#i$rq#j$rq#l$rq#n$rq#p$rq#q$rq#t$rq'r$rq(O$rq!T$rq!U$rq~P%7POd%W!Z!T%W!Z#S%W!Z#t%W!Z~P!*qO!T'Yq!U'Yq~P#7QO#O5sO#P5sO~PAWO!T#[!Z!U#[!Z~P#7QO^%QO#S:nO'e%QO~O#_%W!ZP%W!ZY%W!Z^%W!Zk%W!Zy%W!Z!T%W!Z!c%W!Z!d%W!Z!f%W!Z!l%W!Z#b%W!Z#c%W!Z#d%W!Z#e%W!Z#f%W!Z#g%W!Z#h%W!Z#i%W!Z#j%W!Z#l%W!Z#n%W!Z#p%W!Z#q%W!Z'e%W!Z'r%W!Z(O%W!Z!e%W!Z!Q%W!Z'a%W!Z#S%W!Zo%W!Z!V%W!Z%[%W!Z!_%W!Z~P!NgOP%W!ZY%W!Zk%W!Zy%W!Z!c%W!Z!d%W!Z!f%W!Z!l%W!Z#b%W!Z#c%W!Z#d%W!Z#e%W!Z#f%W!Z#g%W!Z#h%W!Z#i%W!Z#j%W!Z#l%W!Z#n%W!Z#p%W!Z#q%W!Z#t%W!Z'r%W!Z(O%W!Z!T%W!Z!U%W!Z~P%7POo'tX~P0_O!QcX!TcX#ScX~P&,iOPZXYZXkZXxZXyZX{ZX!TZX!TcX!cZX!dZX!fZX!lZX#SZX#ScX#_cX#bZX#cZX#dZX#eZX#fZX#gZX#hZX#iZX#jZX#lZX#nZX#pZX#qZX#vZX'rZX(OZX(VZX(WZX~O!_cX!eZX!ecX(OcX~P&FfOP;ROQ;RO[hOa<oOb!aOihOk;ROlhOmhOrhOt;ROv;RO{TO!OhO!PhO!VUO!a;UO!fWO!i;RO!j;RO!k;RO!l;RO!m;RO!p!`O#{!cO$PcO'j(lO'rSO'}XO([<mO~O!T;eO!U$fa~O[$dOi$sOk$eOl$dOm$dOr$tOt$uOv;kO{$lO!V$mO!a<tO!f$iO#^;qO#{$yO$h;mO$j;oO$m$zO'j(SO'n$rO'r$fO~O#k(sO~P&KXO!UZX!UcX~P&FfO#_;XO~O!_#fO#_;XO~O#S;iO~O#j;^O~O#S;rO!T(TX!U(TX~O#S;iO!T(RX!U(RX~O#_;sO~Od;uO~P!*qO#_;zO~O#_;{O~O!_#fO#_;|O~O!_#fO#_;sO~O#t;}O~P#7QO#_<OO~O#_<PO~O#_<QO~O#_<RO~O#_<SO~O#_<TO~O#t<UO~P!*qO#t<VO~P!*qO$P~!d!x!z!{#O#]#^#i([$h$j$m%P%Z%[%]%c%e%h%i%k%m~TS$P([#c!P'g'k#dl#b#ekx'h's'h'j$R$T$R~",
  goto: "$$n(iPPPPPPP(jP(zP*vPPPP.uPP/[P5S8sP9WP9WPPP9WP:v9WP9WP9WP:zPP;PP;j@YPPP@^PPPP@^CYPPPC`E`P@^PGvPPPPJR@^PPPPPL^@^P! m!!o!!tP!#f!#j!#fPPPP!&p!(uPP!)O!*YP!!o@^@^!-l!0q!5t!5t!9fPPP!9m@^PPPPPPPPPPP!<uP!>ZPP@^!?kP@^P@^@^@^@^P@^!AQPP!DTP!GSP!GW!Gb!Gf!GfP!DQP!Gj!GjP!JiP!Jm@^@^!Js!Mq9WP9WP9W9WP!N{9W9W#!u9W#%S9W#&v9W9W#'d#)`#)`#)d#)l#)`#)tP#)`P9W#*p9W#+x9W9W.uPPP#-TPP#-m#-mP#-mP#.S#-mPP#.YP#.PP#.P#.l!(z#.P#/W#/^#/a(j#/d(jP#/k#/k#/kP(jP(jP(jP(jPP(jP#/q#/tP#/t(jP#/xP#/{P(jP(jP(jP(jP(jP(j(jPP#0R#0]#0c#0i#0w#0}#1T#1_#1e#2a#2p#2v#3Y#3`#3f#3t#4Z#5k#5y#6P#6V#6]#6c#6m#6s#6y#7T#7g#7mPPPPPPPP#7sPP#8g#<RP#=n#=u#=}PP#BX#D}#KZ#K^#Ka#M^#Ma#Md#MkPP#Mq#Mu#Nn$ n$ r$!WPP$![$!b$!fP$!i$!m$!p$#f$#|$$R$$U$$X$$_$$b$$f$$jmmOUo!S#T%P&T&V&W&Y+v+{0{1OU!kQ&q,hQ%[rQ%cuQ%{!OS&i!^,`Q&w!a[&|!h!m!n!o!p!qS)u$m)zQ*n%]Q*{%eQ+g%uQ,f&pQ,p&xW,x&}'O'P'QQ/U)|Q0j+hU1v,z,|,}S4b0`4eS5o1y1{U7_4i4j4kQ8U5rS8|7`7aR:O9P$zaOPTUVWop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y$Q$U%P%a%|&P&T&V&W&Y&^&f&s'V'a'c'i's(U(Y(^)]*_+Q+r+v+{,l,t-V-`-x.P/`/e/r0c0s0t0u0w0{1O1Q1q2P2c4^4p5S5U5V5i7[7f7s8P9e:Z:nS#aY;S!l(n#{$^&j)Q,X,[.V1a2w4Z5`8t9a;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pQ*V$vQ*s%_Q+i%xQ+p&QQ-o;jQ/i*fQ/m*hQ/x*tQ0r+nQ2V-lQ3x/sQ4w0kQ5|2ZQ6S;kQ6u3yR8]5}pjOUo!O!S#T%P%z&T&V&W&Y+v+{0{1OR+k%|&l]OPUVops!S!X!b!g!s#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y#{$Q$U$^%P%a%|&P&Q&T&V&W&Y&^&f&s'V'c'i's(U(Y(^)Q)]*_*f+Q+r+v+{,X,[,l,t-V-`-l-x.P.V/`/e/r0c0s0t0u0w0{1O1Q1a1q2P2Z2c2w4Z4^4p5S5U5V5`5i5}7[7f7s8P8t9a9e:Z:n;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<o<p[!|TW!w!z&j'aQ%VqQ%ZrS%`u%e!U%iwx#W#Y#]$}%g'j'q'r'v+O+P+R+t,Y-Z-^-b-c-e1T2R2S5_5wQ%q|Q&t!`Q&v!aQ'}#cS)i$i)mS*m%[%]Q*q%_Q+b%sQ+f%uS,o&w&xQ-n(OQ.o)jQ/q*nQ/w*tQ/y*uQ/|*yQ0e+cS0i+g+hQ1m,pQ3Q.kQ3w/sQ3{/vQ4Q0OQ4v0jQ6_3RQ6t3yQ6w3}Q8o6sR9u8pv$kf#h$w$x$|)b)d)l*Q*R-u.r/b3P3i8e<m<u<v!`%Xr!a!j%Z%[%]&h&v&w&x&{'Y)t*m*n,],o,p,w,y.|/q1f1m1t1x3e5m5q8S9hQ*g%VQ+W%nQ+Z%oQ+e%uQ-m'}Q0d+bU0h+f+g+hQ2[-nQ4q0eS4u0i0jS7R4]4aQ7j4vU8z7W7]7^U9|8{8}9OQ:f9}Q:t:g!z<q#f$S$T$i$l)X)e)r*e*h+V+Y-k.s.u0V0Y0b2Y3Z3c3p3r4o5z6b6k7c8Y9S9l:R:`;l;n;p;v;x;z<O<Q<U<y<zg<r;g;h;m;o;q;w;y;{<P<R<VW$pf$r*S<mS%ny%zQ%ozQ%p{R+U%l$Z$of#f#h$S$T$i$l$w$x$|)X)b)d)e)l)r*Q*R*e*h+V+Y-k-u.r.s.u/b0V0Y0b2Y3P3Z3c3i3p3r4o5z6b6k7c8Y8e9S9l:R:`;g;h;l;m;n;o;p;q;v;w;x;y;z;{<O<P<Q<R<U<V<m<u<v<y<zT)Y$f)ZV*W$v;j;kU&m!^%h,cS(]#j#kQ*x%bS-g'y'zQ0Z+[Q3j/_R6}4X&rhOPTUVWop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y#{$Q$U$^%P%a%|&P&Q&T&V&W&Y&^&f&j&s'V'a'c'i's(U(Y(^)Q)]*_*f+Q+r+v+{,X,[,l,t-V-`-l-x.P.V/`/e/r0c0s0t0u0w0{1O1Q1a1q2P2Z2c2w4Z4^4p5S5U5V5`5i5}7[7f7s8P8t9a9e:Z:n;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<p$c$P`!y#U%T'`'f(Q(X(a(b(c(d(e(f(g(h(i(j(k(m(p(t)O*w,^-Q-T-Y-_-t-z.O.Q.a/c1[1_1o2O2b2g2h2i2j2k2l2m2n2o2p2q2r2s2v2{3n3u5b5h5u6Q6R6W6X7P7y7}8^8b8c9c9w:V:X:l:w;T<dT!tS!u&shOPTUVWop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y#{$Q$U$^%P%a%|&P&Q&T&V&W&Y&^&f&j&s'V'a'c'i's(U(Y(^)Q)]*_*f+Q+r+v+{,X,[,l,t-V-`-l-x.P.V/`/e/r0c0s0t0u0w0{1O1Q1a1q2P2Z2c2w4Z4^4p5S5U5V5`5i5}7[7f7s8P8t9a9e:Z:n;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pQ&k!^R1b,`!z!fQ!^!h!k!m!n!o!p!q!r&i&p&q&|&}'O'P'Q'R,`,f,h,x,z,{,|,}1v1y1z1{4_4g4h5o5r5s7T7U7V8U8x8y9zS)t$m)zS.|)u)|Q/V)}Q0]+^Q3e/UQ3h/XS4]0`4eS7W4b4kS7]4i4jS8{7_7`Q8}7aS9}8|9PR:g:OlmOUo!S#T%P&T&V&W&Y+v+{0{1OQ&[!VQ'Z!oS(P#e;XQ*k%YQ+`%qQ+a%rQ,m&uQ-P'SS-s(U;sS/d*_;|Q/o*lQ0_+_Q1S+}Q1U,OQ1^,ZQ1k,nQ1n,rS3o/e<SQ3s/pS3v/r<TQ5a1`Q5e1lQ5j1sQ6r3tQ7z5cQ7{5fQ8O5kQ9`7wQ9d8QQ:Y9fR:m:[$^$O`!y#U'`'f(Q(X(a(b(c(d(e(f(g(h(i(j(k(m(p(t)O*w,^-Q-T-Y-_-t-z.O.a/c1[1_1o2O2b2g2h2i2j2k2l2m2n2o2p2q2r2s2v2{3n3u5b5h5u6Q6R6W6X7P7y7}8^8b8c9c9w:V:X:l:w;T<dS'|#`&zU*P$n(T2uS*c%T.QQ2W/iQ5y2VQ8[5|R9m8]$^#}`!y#U'`'f(Q(X(a(b(c(d(e(f(g(h(i(j(k(m(p(t)O*w,^-Q-T-Y-_-t-z.O.a/c1[1_1o2O2b2g2h2i2j2k2l2m2n2o2p2q2r2s2v2{3n3u5b5h5u6Q6R6W6X7P7y7}8^8b8c9c9w:V:X:l:w;T<dS'{#`&zS(_#k$OS*b%T.QS-h'z'|Q.R(oQ/f*cR2T-i&rhOPTUVWop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y#{$Q$U$^%P%a%|&P&Q&T&V&W&Y&^&f&j&s'V'a'c'i's(U(Y(^)Q)]*_*f+Q+r+v+{,X,[,l,t-V-`-l-x.P.V/`/e/r0c0s0t0u0w0{1O1Q1a1q2P2Z2c2w4Z4^4p5S5U5V5`5i5}7[7f7s8P8t9a9e:Z:n;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pS#aY;SQ&V!QQ&W!RQ&Y!TQ&Z!UR0z+yQ&r!`Q*d%VQ,k&tS-j'}*gQ1i,jW2X-m-n/h/jQ5d1jU5x2U2W2[S8X5y5{S9k8Z8[S:^9j9mQ:o:_R:x:pV!lQ&q,h!_ZOQUW[o!O!S!h#T#W$}%P%z%|&T&V&W&Y&q'v+v+{,h-b0`0{1O4_4eT#aY;S%UtOPTUVWop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y$Q$U%P%a%|&P&Q&T&V&W&Y&^&f&s'V'a'c'i's(U(Y(^)]*_*f+Q+r+v+{,l,t-V-`-l-x.P/`/e/r0c0s0t0u0w0{1O1Q1q2P2Z2c4^4p5S5U5V5i5}7[7f7s8P9e:Z:nS(]#j#kS-g'y'z!m<Z#{$^&j)Q,X,[.V1a2w4Z5`8t9a;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pU!jQ&q,hY&{!h!n!o!p!qS'Y!k!mW'[!r4_4g4hS,w&|&}U,y'O'P'QW-O'R7T7U7VS1t,x,zU1w,{8x8yS1x,|,}S4a0`4eS5m1v1yS5p1z9zQ5q1{S7W4b4kS7^4i4jS8S5o5rQ8V5sS8{7_7`Q9O7aQ9h8US9}8|9PR:g:OU!lQ&q,hT4c0`4eU'X!j4`4aS'u#X0xU,v&{'[7^Q.n)iQ.z)tU1u,y-O9OQ3V.oS3`.{/VS5n1w1xQ6^3QS6i3f3hS8T5p5qQ8g6_Q8n6lR9i8VQ#g_U'W!j4`4aS't#X0xQ*`%OQ*i%WQ*o%^W,u&{'X'[7^Q-a'uQ.m)iQ.y)tQ/P)wQ/n*jQ0f+dW1r,v,y-O9OS3U.n.oS3_.z/VQ3b/OQ3d/QQ4s0gU5l1u1w1xQ6]3QQ6a3VS6e3`3hQ6j3gQ7h4tU8R5n5p5qS8f6^6_Q8j6fQ8l6iQ8v7QQ9V7iS9g8T8VQ9q8gQ9r8kQ9t8nQ9y8wQ:T9WQ:]9iQ:b9sQ:d9{Q:r:eQ:{:sQ;P:|Q<^<XQ<i<bR<j<c%U^OPTUVWop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y$Q$U%P%a%|&P&Q&T&V&W&Y&^&f&s'V'a'c'i's(U(Y(^)]*_*f+Q+r+v+{,l,t-V-`-l-x.P/`/e/r0c0s0t0u0w0{1O1Q1q2P2Z2c4^4p5S5U5V5i5}7[7f7s8P9e:Z:nS#gs!b!l<W#{$^&j)Q,X,[.V1a2w4Z5`8t9a;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pR<^<o%U_OPTUVWop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y$Q$U%P%a%|&P&Q&T&V&W&Y&^&f&s'V'a'c'i's(U(Y(^)]*_*f+Q+r+v+{,l,t-V-`-l-x.P/`/e/r0c0s0t0u0w0{1O1Q1q2P2Z2c4^4p5S5U5V5i5}7[7f7s8P9e:Z:nQ%Og!`%Wr!a!j%Z%[%]&h&v&w&x&{'Y)t*m*n,],o,p,w,y.|/q1f1m1t1x3e5m5q8S9hS%^s!bQ*j%XQ+d%uW0g+e+f+g+hU4t0h0i0jS7Q4]4aS7i4u4vW8w7R7W7]7^Q9W7jW9{8z8{8}9OS:e9|9}S:s:f:gQ:|:t!l<X#{$^&j)Q,X,[.V1a2w4Z5`8t9a;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pQ<b<nR<c<o$xbOPUVop!S!X!g!s#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y$Q$U%P%a%|&P&T&V&W&Y&^&f&s'V'c'i's(U(Y(^)]*_*f+Q+r+v+{,l,t-V-`-l-x.P/`/e/r0c0s0t0u0w0{1O1Q1q2P2Z2c4^4p5S5U5V5i5}7[7f7s8P9e:Z:nY#RTW!w!z'a!U%iwx#W#Y#]$}%g'j'q'r'v+O+P+R+t,Y-Z-^-b-c-e1T2R2S5_5wQ+q&Q!j<Y#{$^)Q,X,[.V1a2w4Z5`8t9a;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pR<]&jS&n!^%hR1d,c$zaOPTUVWop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y$Q$U%P%a%|&P&T&V&W&Y&^&f&s'V'a'c'i's(U(Y(^)]*_+Q+r+v+{,l,t-V-`-x.P/`/e/r0c0s0t0u0w0{1O1Q1q2P2c4^4p5S5U5V5i7[7f7s8P9e:Z:n!l(n#{$^&j)Q,X,[.V1a2w4Z5`8t9a;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pQ+p&QQ/i*fQ2V-lQ5|2ZR8]5}!l#u`!y%T'`'f(Q(X(h(i(j(k(p(t*w-Q-T-Y-_-t-z.a/c1o2O2b2s3n3u5h5u6Q7}9c:X:l:w;T!T;`(m)O,^.Q1[1_2g2o2p2q2r2v2{5b6R6W6X7P7y8^8b8c9w:V<d!h#w`!y%T'`'f(Q(X(j(k(p(t*w-Q-T-Y-_-t-z.a/c1o2O2b2s3n3u5h5u6Q7}9c:X:l:w;T!P;b(m)O,^.Q1[1_2g2q2r2v2{5b6R6W6X7P7y8^8b8c9w:V<d!d#{`!y%T'`'f(Q(X(p(t*w-Q-T-Y-_-t-z.a/c1o2O2b2s3n3u5h5u6Q7}9c:X:l:w;TQ3P.iz<p(m)O,^.Q1[1_2g2v2{5b6R6W6X7P7y8^8b8c9w:V<dQ<u<wR<v<x&rhOPTUVWop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y#{$Q$U$^%P%a%|&P&Q&T&V&W&Y&^&f&j&s'V'a'c'i's(U(Y(^)Q)]*_*f+Q+r+v+{,X,[,l,t-V-`-l-x.P.V/`/e/r0c0s0t0u0w0{1O1Q1a1q2P2Z2c2w4Z4^4p5S5U5V5`5i5}7[7f7s8P8t9a9e:Z:n;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pS$_e$`R2x.U&ydOPTUVWeop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y#{$Q$U$^$`%P%a%|&P&Q&T&V&W&Y&^&f&j&s'V'a'c'i's(U(Y(^)Q)]*_*f+Q+r+v+{,X,[,l,t-V-`-l-x.P.U.V/`/e/r0c0s0t0u0w0{1O1Q1a1q2P2Z2c2w4Z4^4p5S5U5V5`5i5}7[7f7s8P8t9a9e:Z:n;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pT$Zc$aQ$XcS(w$[({R)T$aT$Yc$aT(y$[({&yeOPTUVWeop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y#{$Q$U$^$`%P%a%|&P&Q&T&V&W&Y&^&f&j&s'V'a'c'i's(U(Y(^)Q)]*_*f+Q+r+v+{,X,[,l,t-V-`-l-x.P.U.V/`/e/r0c0s0t0u0w0{1O1Q1a1q2P2Z2c2w4Z4^4p5S5U5V5`5i5}7[7f7s8P8t9a9e:Z:n;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<pT$_e$`Q$beR)S$`%UgOPTUVWop!S!X!g!s!w!z#T#_#e#i#l#o#p#q#r#s#t#u#v#w#x#y$Q$U%P%a%|&P&Q&T&V&W&Y&^&f&s'V'a'c'i's(U(Y(^)]*_*f+Q+r+v+{,l,t-V-`-l-x.P/`/e/r0c0s0t0u0w0{1O1Q1q2P2Z2c4^4p5S5U5V5i5}7[7f7s8P9e:Z:n!m<n#{$^&j)Q,X,[.V1a2w4Z5`8t9a;R;U;X;Y;Z;[;];^;_;`;a;b;c;d;e;i;r;s;u;|;}<S<T<p#aiOPUWo!S!X!g!s#T#_#l$^%P%|&P&Q&T&V&W&Y&^&f&s(^)Q*f+Q+r+v+{,l-l.V/`0c0s0t0u0w0{1O1Q2Z2w4^4p5S5U5V5}7[7f7sv$nf#h$w$x$|)b)d)l*Q*R-u.r/b3P3i8e<m<u<v!z(T#f$S$T$i$l)X)e)r*e*h+V+Y-k.s.u0V0Y0b2Y3Z3c3p3r4o5z6b6k7c8Y9S9l:R:`;l;n;p;v;x;z<O<Q<U<y<zQ*[$zQ.b)^g2u;g;h;m;o;q;w;y;{<P<R<Vv$jf#h$w$x$|)b)d)l*Q*R-u.r/b3P3i8e<m<u<vQ)n$kS)w$m)zQ*]${Q/Q)x!z<`#f$S$T$i$l)X)e)r*e*h+V+Y-k.s.u0V0Y0b2Y3Z3c3p3r4o5z6b6k7c8Y9S9l:R:`;l;n;p;v;x;z<O<Q<U<y<zf<a;g;h;m;o;q;w;y;{<P<R<VQ<e<qQ<f<rQ<g<sR<h<tv$nf#h$w$x$|)b)d)l*Q*R-u.r/b3P3i8e<m<u<v!z(T#f$S$T$i$l)X)e)r*e*h+V+Y-k.s.u0V0Y0b2Y3Z3c3p3r4o5z6b6k7c8Y9S9l:R:`;l;n;p;v;x;z<O<Q<U<y<zg2u;g;h;m;o;q;w;y;{<P<R<VlkOUo!S#T%P&T&V&W&Y+v+{0{1OQ)q$lQ,U&aQ,V&cR3Y.s$Y$of#f#h$S$T$i$l$w$x$|)X)b)d)e)l)r*Q*R*e*h+V+Y-k-u.r.s.u/b0V0Y0b2Y3P3Z3c3i3p3r4o5z6b6k7c8Y8e9S9l:R:`;g;h;l;m;n;o;p;q;v;w;x;y;z;{<O<P<Q<R<U<V<m<u<v<y<zQ+X%oQ0X+ZQ4V0WR6|4WT)y$m)zS)y$m)zT4d0`4eS/O)v4^T3g/W7[Q*i%WQ/P)wQ/n*jQ0f+dQ4s0gQ7h4tQ8v7QQ9V7iQ9y8wQ:T9WQ:d9{Q:r:eQ:{:sR;P:|n)b$g(V*^.q/Y/Z2`3W3m6[6m9p<_<k<l!W;v(R(r)h)p-r.^.i.v/g0U0W2_3X3]4U4W6O6P6c6g6o6q8i8m:a<w<x];w2t6V8_9n9o:yp)d$g(V*^.g.q/Y/Z2`3W3m6[6m9p<_<k<l!Y;x(R(r)h)p-r.^.i.v/g0U0W2]2_3X3]4U4W6O6P6c6g6o6q8i8m:a<w<x_;y2t6V8_8`9n9o:ypjOUo!O!S#T%P%z&T&V&W&Y+v+{0{1OQ%w}R+r&QpjOUo!O!S#T%P%z&T&V&W&Y+v+{0{1OR%w}Q+]%pR0T+UqjOUo!O!S#T%P%z&T&V&W&Y+v+{0{1OQ0a+bS4n0d0eU7b4l4m4qS9R7d7eS:P9Q9TQ:h:QR:u:iQ&O!OR+l%zR4z0mR9Y7kS%`u%eR/y*uQ&T!PR+v&UR+|&ZT0|+{1OR,Q&[Q,P&[R1V,QQoOQ#TUT%So#TQ)Z$fR._)ZQ!uSR'^!uQ!xTU'd!x'e-WQ'e!yR-W'fQ,a&kR1c,aQ-v(VR2a-vQ-y(XS2d-y2eR2e-zQ,h&qR1g,hr[OUo!O!S#T%P%z%|&T&V&W&Y+v+{0{1OU!hQ&q,hS#WW$}Y#b[!h#W-b4_Q-b'vT4_0`4eS#OT%gU'k#O'l-XQ'l#PR-X'gQ,d&nR1e,dQ'w#ZQ-['pW-f'w-[1|5tQ1|-]R5t1}Q({$[R.W({Q$`eR)R$`Q$R`U(q$R-S;fQ-S;TR;f)OQ.l)iW3S.l3T6`8hU3T.m.n.oS6`3U3VR8h6a#m)`$g(R(V(r)h)p*X*Y*^-p-q-r.^.g.h.i.q.v/Y/Z/g0U0W2]2^2_2`2t3W3X3]3m4U4W6O6P6T6U6V6[6c6g6m6o6q8_8`8a8i8m9n9o9p:a:y<_<k<l<w<xQ.t)pU3[.t3^6dQ3^.vR6d3]Q)z$mR/S)zQ*T$qR/]*TQ3q/gR6p3qQ+S%jR0S+SQ4Y0ZS7O4Y8uR8u7PQ+_%qR0^+_Q4e0`R7Y4eQ0l+iS4x0l7lR7l4zQ/t*qW3z/t3|6v8qQ3|/wQ6v3{R8q6wQ*v%`R/z*vQ1O+{R5Y1OWnOUo#TQ&X!SQ*a%PQ+u&TQ+w&VQ+x&WQ+z&YQ0y+vS0|+{1OR5X0{Q%RlQ&]!WQ&`!YQ&b!ZQ&d![U'U!j4`4aQ*}%fQ+T%kQ+k&OQ,S&_Y,s&{'W'X'[7^Q/R)yS0o+l+oQ1W,RQ1X,UQ1Y,V[1p,u,v,y-O-Q9OQ4P/}Q4T0UQ4r0fQ4|0qQ5W0zY5g1o1r1u1w1xQ6z4RQ6{4UQ7X4dQ7g4sQ7m4{Y7|5h5l5n5p5qQ8r6xQ9U7hQ9Z7nW9b7}8R8T8VQ9v8sQ9x8vQ:S9VU:W9c9g9iQ:c9yQ:j:TS:k:X:]Q:q:dQ:v:lQ:z:rQ:}:wQ;O:{R;Q;PQ%YrQ&u!aQ'S!jU*l%Z%[%]Q,Z&hU,n&v&w&xS,r&{'YQ.x)tS/p*m*nQ1`,]S1l,o,pS1s,w,yQ3a.|Q3t/qQ5c1fQ5f1mS5k1t1xQ6h3eS8Q5m5qQ9f8SR:[9hS$hf<mR*U$rU$qf$r<mR/[*SQ$gfS(R#f*hQ(V#hS(r$S$TQ)h$iQ)p$lQ*X$wQ*Y$xQ*^$|Q-p;lQ-q;nQ-r;pQ.^)XQ.g)bQ.h)dQ.i)eQ.q)lQ.v)rQ/Y*QQ/Z*Rh/g*e-k0b2Y4o5z7c8Y9S9l:R:`Q0U+VQ0W+YQ2];vQ2^;xQ2_;zQ2`-uS2t;g;hQ3W.rQ3X.sQ3].uQ3m/bQ4U0VQ4W0YQ6O<OQ6P<QQ6T;mQ6U;oQ6V;qQ6[3PQ6c3ZQ6g3cQ6m3iQ6o3pQ6q3rQ8_;{Q8`;wQ8a;yQ8i6bQ8m6kQ9n<PQ9o<RQ9p8eQ:a<UQ:y<VQ<_<mQ<k<uQ<l<vQ<w<yR<x<zllOUo!S#T%P&T&V&W&Y+v+{0{1OQ!_PS#VW#_Q&_!XU&y!g4^7[Q']!sQ(`#lQ)P$^S+o%|&PQ+s&QQ,R&^Q,W&fQ,j&sQ-|(^Q.[)QQ/j*fQ0Q+QQ0v+rQ1j,lQ2W-lQ2z.VQ3k/`Q4m0cQ5O0sQ5P0tQ5R0uQ5T0wQ5[1QQ5y2ZQ6Y2wQ7e4pQ7r5SQ7t5UQ7u5VQ8[5}Q9T7fR9]7s#U`OPUWo!S!X!g#T#_#l%P%|&P&Q&T&V&W&Y&^&f&s(^*f+Q+r+v+{,l-l/`0c0s0t0u0w0{1O1Q2Z4^4p5S5U5V5}7[7f7sQ!yTQ#UVQ%TpS'`!w'cQ'f!zQ(Q#eQ(X#iQ(a#oQ(b#pQ(c#qQ(d#rQ(e#sQ(f#tQ(g#uQ(h#vQ(i#wQ(j#xQ(k#yQ(m#{Q(p$QQ(t$UW)O$^)Q.V2wQ*w%aS,^&j1aQ-Q'VS-T'a-VQ-Y'iQ-_'sQ-t(UQ-z(YQ.O;RQ.Q;UQ.a)]Q/c*_Q1[,XQ1_,[Q1o,tQ2O-`Q2b-xQ2g;XQ2h;YQ2i;ZQ2j;[Q2k;]Q2l;^Q2m;_Q2n;`Q2o;aQ2p;bQ2q;cQ2r;dQ2s.PQ2v;iQ2{;eQ3n/eQ3u/rQ5b;rQ5h1qQ5u2PQ6Q2cQ6R;sQ6W;uQ6X;|Q7P4ZQ7y5`Q7}5iQ8^;}Q8b<SQ8c<TQ9c8PQ9w8tQ:V9aQ:X9eQ:l:ZQ:w:nQ;T!sR<d<pR!{TR&l!^U!jQ&q,hS&h!^,`Y&{!h!n!o!p!qS'Y!k!m['[!r4_4g4h4i4jS,]&i&pS,w&|&}U,y'O'P'QY-O'R7T7U7V7aQ1f,fS1t,x,zU1w,{8x8yS1x,|,}S4`0`4eS5m1v1yS5p1z9zQ5q1{S8S5o5rQ8V5sR9h8UR(W#hR(Z#iQ!_QT,g&q,hQ#`YR&z;ST#[W$}S#ZW$}U%jwx+tU'p#W#Y#]S-]'q'rQ-d'vQ0R+RQ1}-^U2Q-b-c-eS5v2R2SR8W5w`!}T!w!z%g'a'j+O-Zt#XWwx#W#Y#]$}'q'r'v+R-^-b-c-e2R2S5wQ0x+tQ1],YQ5^1TQ7x5_T<[&j+PT#QT%gS#PT%gS'b!w'jS'g!z+OS,_&j+PT-U'a-ZT&o!^%hQ$[cR)V$aT(z$[({R2y.UT)k$i)mR)s$lQ/h*eQ2U-kQ4l0bQ5{2YQ7d4oQ8Z5zQ9Q7cQ9j8YQ:Q9SQ:_9lQ:i:RR:p:`lmOUo!S#T%P&T&V&W&Y+v+{0{1OQ%}!OR+k%zV%kwx+tR0[+[R+j%xQ%duR*|%eR*r%_T&R!P&UT&S!P&UT0}+{1O",
  nodeNames: "⚠ ArithOp ArithOp InterpolationStart LineComment BlockComment Script ExportDeclaration export Star as VariableName String from ; default FunctionDeclaration async function VariableDefinition > TypeParamList TypeDefinition extends ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation NullType null VoidType void TypeofType typeof MemberExpression . ?. PropertyName [ TemplateString Interpolation super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewExpression new TypeArgList CompareOp < ) ( ArgList UnaryExpression await yield delete LogicOp BitOp ParenthesizedExpression ClassExpression class ClassBody MethodDeclaration Decorator @ MemberExpression PrivatePropertyName CallExpression Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly accessor Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof satisfies in const CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXStartTag JSXSelfClosingTag JSXIdentifier JSXBuiltin JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature PropertyDefinition CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody MethodDeclaration AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement SingleExpression SingleClassItem",
  maxTerm: 346,
  context: trackNewline,
  nodeProps: [
    ["closedBy", 3, "InterpolationEnd", 43, "]", 53, "}", 68, ")", 139, "JSXSelfCloseEndTag JSXEndTag", 155, "JSXEndTag"],
    ["group", -26, 7, 14, 16, 60, 194, 198, 201, 202, 204, 207, 210, 221, 223, 229, 231, 233, 235, 238, 244, 250, 252, 254, 256, 258, 260, 261, "Statement", -30, 11, 12, 25, 28, 29, 34, 44, 46, 47, 49, 54, 62, 70, 76, 77, 98, 99, 108, 109, 126, 129, 131, 132, 133, 134, 136, 137, 157, 158, 160, "Expression", -23, 24, 26, 30, 33, 35, 37, 161, 163, 165, 166, 168, 169, 170, 172, 173, 174, 176, 177, 178, 188, 190, 192, 193, "Type", -3, 80, 91, 97, "ClassItem"],
    ["openedBy", 31, "InterpolationStart", 48, "[", 52, "{", 67, "(", 138, "JSXStartTag", 150, "JSXStartTag JSXStartCloseTag"]
  ],
  propSources: [jsHighlight],
  skippedNodes: [0, 4, 5],
  repeatNodeCount: 29,
  tokenData: "#2k~R!bOX%ZXY%uYZ'kZ[%u[]%Z]^'k^p%Zpq%uqr(Rrs)mst7]tu9guv<avw=bwx>lxyJcyzJyz{Ka{|Lm|}MW}!OLm!O!PMn!P!Q!$v!Q!R!Er!R![!G_![!]!Nc!]!^!N{!^!_# c!_!`#!`!`!a##d!a!b#%s!b!c#'h!c!}9g!}#O#(O#O#P%Z#P#Q#(f#Q#R#(|#R#S9g#S#T#)g#T#o#)}#o#p#,w#p#q#,|#q#r#-j#r#s#.S#s$f%Z$f$g%u$g#BY9g#BY#BZ#.j#BZ$IS9g$IS$I_#.j$I_$I|9g$I|$I}#1X$I}$JO#1X$JO$JT9g$JT$JU#.j$JU$KV9g$KV$KW#.j$KW&FU9g&FU&FV#.j&FV;'S9g;'S;=`<Z<%l?HT9g?HT?HU#.j?HUO9g`%`T$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z`%rP;=`<%l%Z7Z%|i$_`'g6yOX%ZXY%uYZ%ZZ[%u[p%Zpq%uq!^%Z!_#o%Z#p$f%Z$f$g%u$g#BY%Z#BY#BZ%u#BZ$IS%Z$IS$I_%u$I_$JT%Z$JT$JU%u$JU$KV%Z$KV$KW%u$KW&FU%Z&FU&FV%u&FV;'S%Z;'S;=`%o<%l?HT%Z?HT?HU%u?HUO%Z7Z'rT$_`'h6yO!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z,m(YU$_`!l,]O!^%Z!_!`(l!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z,j(sU#l,Y$_`O!^%Z!_!`)V!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z,j)^T#l,Y$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z*m)t]$_`[*TOY)mYZ*mZr)mrs,js!^)m!^!_-S!_#O)m#O#P1q#P#o)m#o#p-S#p;'S)m;'S;=`7V<%lO)mh*rX$_`Or*mrs+_s!^*m!^!_+u!_#o*m#o#p+u#p;'S*m;'S;=`,d<%lO*mh+fT$YW$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%ZW+xTOr+urs,Xs;'S+u;'S;=`,^<%lO+uW,^O$YWW,aP;=`<%l+uh,gP;=`<%l*m*m,sT$YW$_`[*TO!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z*]-XX[*TOY-SYZ+uZr-Srs-ts#O-S#O#P-{#P;'S-S;'S;=`1k<%lO-S*]-{O$YW[*T*].OUOr-Srs.bs;'S-S;'S;=`0y;=`<%l/R<%lO-S*].iW$YW[*TOY/RZr/Rrs/ps#O/R#O#P/u#P;'S/R;'S;=`0s<%lO/R*T/WW[*TOY/RZr/Rrs/ps#O/R#O#P/u#P;'S/R;'S;=`0s<%lO/R*T/uO[*T*T/xRO;'S/R;'S;=`0R;=`O/R*T0WX[*TOY/RZr/Rrs/ps#O/R#O#P/u#P;'S/R;'S;=`0s;=`<%l/R<%lO/R*T0vP;=`<%l/R*]1OX[*TOY/RZr/Rrs/ps#O/R#O#P/u#P;'S/R;'S;=`0s;=`<%l-S<%lO/R*]1nP;=`<%l-S*m1vY$_`Or)mrs2fs!^)m!^!_-S!_#o)m#o#p-S#p;'S)m;'S;=`6e;=`<%l/R<%lO)m*m2o]$YW$_`[*TOY3hYZ%ZZr3hrs4hs!^3h!^!_/R!_#O3h#O#P5O#P#o3h#o#p/R#p;'S3h;'S;=`6_<%lO3h*e3o]$_`[*TOY3hYZ%ZZr3hrs4hs!^3h!^!_/R!_#O3h#O#P5O#P#o3h#o#p/R#p;'S3h;'S;=`6_<%lO3h*e4oT$_`[*TO!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e5TW$_`O!^3h!^!_/R!_#o3h#o#p/R#p;'S3h;'S;=`5m;=`<%l/R<%lO3h*e5rX[*TOY/RZr/Rrs/ps#O/R#O#P/u#P;'S/R;'S;=`0s;=`<%l3h<%lO/R*e6bP;=`<%l3h*m6jX[*TOY/RZr/Rrs/ps#O/R#O#P/u#P;'S/R;'S;=`0s;=`<%l)m<%lO/R*m7YP;=`<%l)m&}7b]$_`Ot%Ztu8Zu!^%Z!_!c%Z!c!}8Z!}#R%Z#R#S8Z#S#T%Z#T#o8Z#p$g%Z$g;'S8Z;'S;=`9a<%lO8Z&}8b_$_`'}&mOt%Ztu8Zu!Q%Z!Q![8Z![!^%Z!_!c%Z!c!}8Z!}#R%Z#R#S8Z#S#T%Z#T#o8Z#p$g%Z$g;'S8Z;'S;=`9a<%lO8Z&}9dP;=`<%l8Z7Z9ra$_`'s&l'j1T$RWOt%Ztu9gu}%Z}!O:w!O!Q%Z!Q![9g![!^%Z!_!c%Z!c!}9g!}#R%Z#R#S9g#S#T%Z#T#o9g#p$g%Z$g;'S9g;'S;=`<Z<%lO9gh;Oa$_`$RWOt%Ztu:wu}%Z}!O:w!O!Q%Z!Q![:w![!^%Z!_!c%Z!c!}:w!}#R%Z#R#S:w#S#T%Z#T#o:w#p$g%Z$g;'S:w;'S;=`<T<%lO:wh<WP;=`<%l:w7Z<^P;=`<%l9g,j<hU$_`#d,YO!^%Z!_!`<z!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z,j=RT$_`#v,YO!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z.n=iW(W.^$_`Ov%Zvw>Rw!^%Z!_!`<z!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z,j>YU$_`#p,YO!^%Z!_!`<z!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z*m>s]$_`[*TOY>lYZ?lZw>lwx,jx!^>l!^!_@|!_#O>l#O#PE_#P#o>l#o#p@|#p;'S>l;'S;=`J]<%lO>lh?qX$_`Ow?lwx+_x!^?l!^!_@^!_#o?l#o#p@^#p;'S?l;'S;=`@v<%lO?lW@aTOw@^wx,Xx;'S@^;'S;=`@p<%lO@^W@sP;=`<%l@^h@yP;=`<%l?l*]ARX[*TOY@|YZ@^Zw@|wx-tx#O@|#O#PAn#P;'S@|;'S;=`EX<%lO@|*]AqUOw@|wxBTx;'S@|;'S;=`Dg;=`<%lBt<%lO@|*]B[W$YW[*TOYBtZwBtwx/px#OBt#O#PCc#P;'SBt;'S;=`Da<%lOBt*TByW[*TOYBtZwBtwx/px#OBt#O#PCc#P;'SBt;'S;=`Da<%lOBt*TCfRO;'SBt;'S;=`Co;=`OBt*TCtX[*TOYBtZwBtwx/px#OBt#O#PCc#P;'SBt;'S;=`Da;=`<%lBt<%lOBt*TDdP;=`<%lBt*]DlX[*TOYBtZwBtwx/px#OBt#O#PCc#P;'SBt;'S;=`Da;=`<%l@|<%lOBt*]E[P;=`<%l@|*mEdY$_`Ow>lwxFSx!^>l!^!_@|!_#o>l#o#p@|#p;'S>l;'S;=`Ik;=`<%lBt<%lO>l*mF]]$YW$_`[*TOYGUYZ%ZZwGUwx4hx!^GU!^!_Bt!_#OGU#O#PHU#P#oGU#o#pBt#p;'SGU;'S;=`Ie<%lOGU*eG]]$_`[*TOYGUYZ%ZZwGUwx4hx!^GU!^!_Bt!_#OGU#O#PHU#P#oGU#o#pBt#p;'SGU;'S;=`Ie<%lOGU*eHZW$_`O!^GU!^!_Bt!_#oGU#o#pBt#p;'SGU;'S;=`Hs;=`<%lBt<%lOGU*eHxX[*TOYBtZwBtwx/px#OBt#O#PCc#P;'SBt;'S;=`Da;=`<%lGU<%lOBt*eIhP;=`<%lGU*mIpX[*TOYBtZwBtwx/px#OBt#O#PCc#P;'SBt;'S;=`Da;=`<%l>l<%lOBt*mJ`P;=`<%l>l5oJjT!f5_$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z$ZKQT!e#y$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z2yKjW$_`'k'_#e,YOz%Zz{LS{!^%Z!_!`<z!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z,jLZU$_`#b,YO!^%Z!_!`<z!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z0TLtU$_`k/sO!^%Z!_!`<z!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z1gM_T!T1V$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z7ZMuX$_`x4QO!O%Z!O!PNb!P!Q%Z!Q![! d![!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z$XNgV$_`O!O%Z!O!PN|!P!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z$X! TT!S#w$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e! k]$_`l*TO!Q%Z!Q![! d![!^%Z!_!g%Z!g!h!!d!h#R%Z#R#S! d#S#X%Z#X#Y!!d#Y#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!!i]$_`O{%Z{|!#b|}%Z}!O!#b!O!Q%Z!Q![!$S![!^%Z!_#R%Z#R#S!$S#S#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!#gX$_`O!Q%Z!Q![!$S![!^%Z!_#R%Z#R#S!$S#S#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!$ZX$_`l*TO!Q%Z!Q![!$S![!^%Z!_#R%Z#R#S!$S#S#o%Z#p;'S%Z;'S;=`%o<%lO%Z7Z!$}b$_`#c,YOY!&VYZ%ZZz!&Vz{!-n{!P!&V!P!Q!BV!Q!^!&V!^!_!(f!_!`!Ch!`!a!Dm!a!}!&V!}#O!+T#O#P!,v#P#o!&V#o#p!(f#p;'S!&V;'S;=`!-h<%lO!&Va!&^^$_`!PPOY!&VYZ%ZZ!P!&V!P!Q!'Y!Q!^!&V!^!_!(f!_!}!&V!}#O!+T#O#P!,v#P#o!&V#o#p!(f#p;'S!&V;'S;=`!-h<%lO!&Va!'aa$_`!PPO!^%Z!_#Z%Z#Z#[!'Y#[#]%Z#]#^!'Y#^#a%Z#a#b!'Y#b#g%Z#g#h!'Y#h#i%Z#i#j!'Y#j#m%Z#m#n!'Y#n#o%Z#p;'S%Z;'S;=`%o<%lO%ZP!(kX!PPOY!(fZ!P!(f!P!Q!)W!Q!}!(f!}#O!)o#O#P!*n#P;'S!(f;'S;=`!*}<%lO!(fP!)]U!PP#Z#[!)W#]#^!)W#a#b!)W#g#h!)W#i#j!)W#m#n!)WP!)rVOY!)oZ#O!)o#O#P!*X#P#Q!(f#Q;'S!)o;'S;=`!*h<%lO!)oP!*[SOY!)oZ;'S!)o;'S;=`!*h<%lO!)oP!*kP;=`<%l!)oP!*qSOY!(fZ;'S!(f;'S;=`!*}<%lO!(fP!+QP;=`<%l!(fa!+Y[$_`OY!+TYZ%ZZ!^!+T!^!_!)o!_#O!+T#O#P!,O#P#Q!&V#Q#o!+T#o#p!)o#p;'S!+T;'S;=`!,p<%lO!+Ta!,TX$_`OY!+TYZ%ZZ!^!+T!^!_!)o!_#o!+T#o#p!)o#p;'S!+T;'S;=`!,p<%lO!+Ta!,sP;=`<%l!+Ta!,{X$_`OY!&VYZ%ZZ!^!&V!^!_!(f!_#o!&V#o#p!(f#p;'S!&V;'S;=`!-h<%lO!&Va!-kP;=`<%l!&V7Z!-u`$_`!PPOY!-nYZ!.wZz!-nz{!2U{!P!-n!P!Q!@m!Q!^!-n!^!_!4m!_!}!-n!}#O!;l#O#P!?o#P#o!-n#o#p!4m#p;'S!-n;'S;=`!@g<%lO!-n7Z!.|X$_`Oz!.wz{!/i{!^!.w!^!_!0w!_#o!.w#o#p!0w#p;'S!.w;'S;=`!2O<%lO!.w7Z!/nZ$_`Oz!.wz{!/i{!P!.w!P!Q!0a!Q!^!.w!^!_!0w!_#o!.w#o#p!0w#p;'S!.w;'S;=`!2O<%lO!.w7Z!0hT$_`T6yO!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z6y!0zTOz!0wz{!1Z{;'S!0w;'S;=`!1x<%lO!0w6y!1^VOz!0wz{!1Z{!P!0w!P!Q!1s!Q;'S!0w;'S;=`!1x<%lO!0w6y!1xOT6y6y!1{P;=`<%l!0w7Z!2RP;=`<%l!.w7Z!2]`$_`!PPOY!-nYZ!.wZz!-nz{!2U{!P!-n!P!Q!3_!Q!^!-n!^!_!4m!_!}!-n!}#O!;l#O#P!?o#P#o!-n#o#p!4m#p;'S!-n;'S;=`!@g<%lO!-n7Z!3ha$_`T6y!PPO!^%Z!_#Z%Z#Z#[!'Y#[#]%Z#]#^!'Y#^#a%Z#a#b!'Y#b#g%Z#g#h!'Y#h#i%Z#i#j!'Y#j#m%Z#m#n!'Y#n#o%Z#p;'S%Z;'S;=`%o<%lO%Z6y!4r[!PPOY!4mYZ!0wZz!4mz{!5h{!P!4m!P!Q!:b!Q!}!4m!}#O!6|#O#P!9r#P;'S!4m;'S;=`!:[<%lO!4m6y!5m[!PPOY!4mYZ!0wZz!4mz{!5h{!P!4m!P!Q!6c!Q!}!4m!}#O!6|#O#P!9r#P;'S!4m;'S;=`!:[<%lO!4m6y!6jUT6y!PP#Z#[!)W#]#^!)W#a#b!)W#g#h!)W#i#j!)W#m#n!)W6y!7PYOY!6|YZ!0wZz!6|z{!7o{#O!6|#O#P!9S#P#Q!4m#Q;'S!6|;'S;=`!9l<%lO!6|6y!7r[OY!6|YZ!0wZz!6|z{!7o{!P!6|!P!Q!8h!Q#O!6|#O#P!9S#P#Q!4m#Q;'S!6|;'S;=`!9l<%lO!6|6y!8mVT6yOY!)oZ#O!)o#O#P!*X#P#Q!(f#Q;'S!)o;'S;=`!*h<%lO!)o6y!9VVOY!6|YZ!0wZz!6|z{!7o{;'S!6|;'S;=`!9l<%lO!6|6y!9oP;=`<%l!6|6y!9uVOY!4mYZ!0wZz!4mz{!5h{;'S!4m;'S;=`!:[<%lO!4m6y!:_P;=`<%l!4m6y!:ga!PPOz!0wz{!1Z{#Z!0w#Z#[!:b#[#]!0w#]#^!:b#^#a!0w#a#b!:b#b#g!0w#g#h!:b#h#i!0w#i#j!:b#j#m!0w#m#n!:b#n;'S!0w;'S;=`!1x<%lO!0w7Z!;q^$_`OY!;lYZ!.wZz!;lz{!<m{!^!;l!^!_!6|!_#O!;l#O#P!>q#P#Q!-n#Q#o!;l#o#p!6|#p;'S!;l;'S;=`!?i<%lO!;l7Z!<r`$_`OY!;lYZ!.wZz!;lz{!<m{!P!;l!P!Q!=t!Q!^!;l!^!_!6|!_#O!;l#O#P!>q#P#Q!-n#Q#o!;l#o#p!6|#p;'S!;l;'S;=`!?i<%lO!;l7Z!={[$_`T6yOY!+TYZ%ZZ!^!+T!^!_!)o!_#O!+T#O#P!,O#P#Q!&V#Q#o!+T#o#p!)o#p;'S!+T;'S;=`!,p<%lO!+T7Z!>vZ$_`OY!;lYZ!.wZz!;lz{!<m{!^!;l!^!_!6|!_#o!;l#o#p!6|#p;'S!;l;'S;=`!?i<%lO!;l7Z!?lP;=`<%l!;l7Z!?tZ$_`OY!-nYZ!.wZz!-nz{!2U{!^!-n!^!_!4m!_#o!-n#o#p!4m#p;'S!-n;'S;=`!@g<%lO!-n7Z!@jP;=`<%l!-n7Z!@te$_`!PPOz!.wz{!/i{!^!.w!^!_!0w!_#Z!.w#Z#[!@m#[#]!.w#]#^!@m#^#a!.w#a#b!@m#b#g!.w#g#h!@m#h#i!.w#i#j!@m#j#m!.w#m#n!@m#n#o!.w#o#p!0w#p;'S!.w;'S;=`!2O<%lO!.w7Z!B^X$_`S6yOY!BVYZ%ZZ!^!BV!^!_!By!_#o!BV#o#p!By#p;'S!BV;'S;=`!Cb<%lO!BV6y!COSS6yOY!ByZ;'S!By;'S;=`!C[<%lO!By6y!C_P;=`<%l!By7Z!CeP;=`<%l!BV,k!Cq^$_`#v,Y!PPOY!&VYZ%ZZ!P!&V!P!Q!'Y!Q!^!&V!^!_!(f!_!}!&V!}#O!+T#O#P!,v#P#o!&V#o#p!(f#p;'S!&V;'S;=`!-h<%lO!&Vi!Dv^$OW$_`!PPOY!&VYZ%ZZ!P!&V!P!Q!'Y!Q!^!&V!^!_!(f!_!}!&V!}#O!+T#O#P!,v#P#o!&V#o#p!(f#p;'S!&V;'S;=`!-h<%lO!&V*e!Eyf$_`l*TO!O%Z!O!P! d!P!Q%Z!Q![!G_![!^%Z!_!g%Z!g!h!!d!h#R%Z#R#S!G_#S#U%Z#U#V!IR#V#X%Z#X#Y!!d#Y#b%Z#b#c!Hk#c#d!Js#d#l%Z#l#m!L_#m#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!Gfa$_`l*TO!O%Z!O!P! d!P!Q%Z!Q![!G_![!^%Z!_!g%Z!g!h!!d!h#R%Z#R#S!G_#S#X%Z#X#Y!!d#Y#b%Z#b#c!Hk#c#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!HrT$_`l*TO!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!IWY$_`O!Q%Z!Q!R!Iv!R!S!Iv!S!^%Z!_#R%Z#R#S!Iv#S#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!I}[$_`l*TO!Q%Z!Q!R!Iv!R!S!Iv!S!^%Z!_#R%Z#R#S!Iv#S#b%Z#b#c!Hk#c#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!JxX$_`O!Q%Z!Q!Y!Ke!Y!^%Z!_#R%Z#R#S!Ke#S#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!KlZ$_`l*TO!Q%Z!Q!Y!Ke!Y!^%Z!_#R%Z#R#S!Ke#S#b%Z#b#c!Hk#c#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!Ld]$_`O!Q%Z!Q![!M]![!^%Z!_!c%Z!c!i!M]!i#R%Z#R#S!M]#S#T%Z#T#Z!M]#Z#o%Z#p;'S%Z;'S;=`%o<%lO%Z*e!Md_$_`l*TO!Q%Z!Q![!M]![!^%Z!_!c%Z!c!i!M]!i#R%Z#R#S!M]#S#T%Z#T#Z!M]#Z#b%Z#b#c!Hk#c#o%Z#p;'S%Z;'S;=`%o<%lO%Z.y!NlT!__$_`#t.YO!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Zg# ST^V$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z7Z# nR'n$h!c3W$Pi([P!P!Q# w!^!_# |!_!`#!Z`# |O$a`,Y#!RP#f,Y!_!`#!U,Y#!ZO#v,Y,Y#!`O#g,Y.y#!gV#S.i$_`O!^%Z!_!`(l!`!a#!|!a#o%Z#p;'S%Z;'S;=`%o<%lO%Z,k##TT#_,Z$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z.y##oVd#T#g,Y$[Y$_`O!^%Z!_!`#$U!`!a#$l!a#o%Z#p;'S%Z;'S;=`%o<%lO%Z,j#$]T#g,Y$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z,j#$sV#f,Y$_`O!^%Z!_!`<z!`!a#%Y!a#o%Z#p;'S%Z;'S;=`%o<%lO%Z,j#%aU#f,Y$_`O!^%Z!_!`<z!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z2y#%zX(O,]$_`O!O%Z!O!P#&g!P!^%Z!_!a%Z!a!b#&}!b#o%Z#p;'S%Z;'S;=`%o<%lO%Z2w#&nTy2g$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z,j#'UU$_`#q,YO!^%Z!_!`<z!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z'R#'oT!t&q$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z7R#(VT{6q$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z$Z#(mT!Q#y$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z,j#)TU#n,Y$_`O!^%Z!_!`<z!`#o%Z#p;'S%Z;'S;=`%o<%lO%Z0R#)nT$_`'r/qO!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z7Z#*Ya$_`'s&l'j1T$TWOt%Ztu#)}u}%Z}!O#+_!O!Q%Z!Q![#)}![!^%Z!_!c%Z!c!}#)}!}#R%Z#R#S#)}#S#T%Z#T#o#)}#p$g%Z$g;'S#)};'S;=`#,q<%lO#)}h#+fa$_`$TWOt%Ztu#+_u}%Z}!O#+_!O!Q%Z!Q![#+_![!^%Z!_!c%Z!c!}#+_!}#R%Z#R#S#+_#S#T%Z#T#o#+_#p$g%Z$g;'S#+_;'S;=`#,k<%lO#+_h#,nP;=`<%l#+_7Z#,tP;=`<%l#)}~#,|O!V~.n#-TV(V.^$_`O!^%Z!_!`<z!`#o%Z#p#q#&}#q;'S%Z;'S;=`%o<%lO%Z,m#-sT!U,XoS$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Za#.ZT!mP$_`O!^%Z!_#o%Z#p;'S%Z;'S;=`%o<%lO%Z7Z#.wt$_`'g6y's&l'j1T$RWOX%ZXY%uYZ%ZZ[%u[p%Zpq%uqt%Ztu9gu}%Z}!O:w!O!Q%Z!Q![9g![!^%Z!_!c%Z!c!}9g!}#R%Z#R#S9g#S#T%Z#T#o9g#p$f%Z$f$g%u$g#BY9g#BY#BZ#.j#BZ$IS9g$IS$I_#.j$I_$JT9g$JT$JU#.j$JU$KV9g$KV$KW#.j$KW&FU9g&FU&FV#.j&FV;'S9g;'S;=`<Z<%l?HT9g?HT?HU#.j?HUO9g7Z#1fa$_`'h6y's&l'j1T$RWOt%Ztu9gu}%Z}!O:w!O!Q%Z!Q![9g![!^%Z!_!c%Z!c!}9g!}#R%Z#R#S9g#S#T%Z#T#o9g#p$g%Z$g;'S9g;'S;=`<Z<%lO9g",
  tokenizers: [noSemicolon, incdecToken, template, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, insertSemicolon],
  topRules: { "Script": [0, 6], "SingleExpression": [1, 262], "SingleClassItem": [2, 263] },
  dialects: { jsx: 12734, ts: 12736 },
  dynamicPrecedences: { "158": 1, "186": 1 },
  specialized: [{ term: 302, get: (value) => spec_identifier[value] || -1 }, { term: 311, get: (value) => spec_word[value] || -1 }, { term: 65, get: (value) => spec_LessThan[value] || -1 }],
  tokenPrec: 12759
});

// node_modules/@codemirror/lang-javascript/dist/index.js
var snippets = [
  snippetCompletion("function ${name}(${params}) {\n	${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  snippetCompletion("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n	${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  snippetCompletion("for (let ${name} of ${collection}) {\n	${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  snippetCompletion("do {\n	${}\n} while (${})", {
    label: "do",
    detail: "loop",
    type: "keyword"
  }),
  snippetCompletion("while (${}) {\n	${}\n}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  snippetCompletion("try {\n	${}\n} catch (${error}) {\n	${}\n}", {
    label: "try",
    detail: "/ catch block",
    type: "keyword"
  }),
  snippetCompletion("if (${}) {\n	${}\n}", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  snippetCompletion("if (${}) {\n	${}\n} else {\n	${}\n}", {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  snippetCompletion("class ${name} {\n	constructor(${params}) {\n		${}\n	}\n}", {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  snippetCompletion('import {${names}} from "${module}"\n${}', {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  snippetCompletion('import ${name} from "${module}"\n${}', {
    label: "import",
    detail: "default",
    type: "keyword"
  })
];
var cache = new NodeWeakMap();
var ScopeNodes = /* @__PURE__ */ new Set([
  "Script",
  "Block",
  "FunctionExpression",
  "FunctionDeclaration",
  "ArrowFunction",
  "MethodDeclaration",
  "ForStatement"
]);
function defID(type) {
  return (node, def) => {
    let id2 = node.node.getChild("VariableDefinition");
    if (id2)
      def(id2, type);
    return true;
  };
}
var functionContext = ["FunctionDeclaration"];
var gatherCompletions = {
  FunctionDeclaration: defID("function"),
  ClassDeclaration: defID("class"),
  ClassExpression: () => true,
  EnumDeclaration: defID("constant"),
  TypeAliasDeclaration: defID("type"),
  NamespaceDeclaration: defID("namespace"),
  VariableDefinition(node, def) {
    if (!node.matchContext(functionContext))
      def(node, "variable");
  },
  TypeDefinition(node, def) {
    def(node, "type");
  },
  __proto__: null
};
function getScope(doc, node) {
  let cached = cache.get(node);
  if (cached)
    return cached;
  let completions = [], top = true;
  function def(node2, type) {
    let name = doc.sliceString(node2.from, node2.to);
    completions.push({ label: name, type });
  }
  node.cursor(IterMode.IncludeAnonymous).iterate((node2) => {
    if (top) {
      top = false;
    } else if (node2.name) {
      let gather = gatherCompletions[node2.name];
      if (gather && gather(node2, def) || ScopeNodes.has(node2.name))
        return false;
    } else if (node2.to - node2.from > 8192) {
      for (let c of getScope(doc, node2.node))
        completions.push(c);
      return false;
    }
  });
  cache.set(node, completions);
  return completions;
}
var Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/;
var dontComplete = [
  "TemplateString",
  "String",
  "RegExp",
  "LineComment",
  "BlockComment",
  "VariableDefinition",
  "TypeDefinition",
  "Label",
  "PropertyDefinition",
  "PropertyName",
  "PrivatePropertyDefinition",
  "PrivatePropertyName"
];
function localCompletionSource(context) {
  let inner = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (dontComplete.indexOf(inner.name) > -1)
    return null;
  let isWord = inner.name == "VariableName" || inner.to - inner.from < 20 && Identifier.test(context.state.sliceDoc(inner.from, inner.to));
  if (!isWord && !context.explicit)
    return null;
  let options = [];
  for (let pos = inner; pos; pos = pos.parent) {
    if (ScopeNodes.has(pos.name))
      options = options.concat(getScope(context.state.doc, pos));
  }
  return {
    options,
    from: isWord ? inner.from : context.pos,
    validFor: Identifier
  };
}
function pathFor(read, member, name) {
  var _a;
  let path = [];
  for (; ; ) {
    let obj = member.firstChild, prop;
    if ((obj === null || obj === void 0 ? void 0 : obj.name) == "VariableName") {
      path.push(read(obj));
      return { path: path.reverse(), name };
    } else if ((obj === null || obj === void 0 ? void 0 : obj.name) == "MemberExpression" && ((_a = prop = obj.lastChild) === null || _a === void 0 ? void 0 : _a.name) == "PropertyName") {
      path.push(read(prop));
      member = obj;
    } else {
      return null;
    }
  }
}
function completionPath(context) {
  let read = (node) => context.state.doc.sliceString(node.from, node.to);
  let inner = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (inner.name == "PropertyName") {
    return pathFor(read, inner.parent, read(inner));
  } else if (dontComplete.indexOf(inner.name) > -1) {
    return null;
  } else if (inner.name == "VariableName" || inner.to - inner.from < 20 && Identifier.test(read(inner))) {
    return { path: [], name: read(inner) };
  } else if ((inner.name == "." || inner.name == "?.") && inner.parent.name == "MemberExpression") {
    return pathFor(read, inner.parent, "");
  } else if (inner.name == "MemberExpression") {
    return pathFor(read, inner, "");
  } else {
    return context.explicit ? { path: [], name: "" } : null;
  }
}
function enumeratePropertyCompletions(obj, top) {
  let options = [], seen = /* @__PURE__ */ new Set();
  for (let depth = 0; ; depth++) {
    for (let name of (Object.getOwnPropertyNames || Object.keys)(obj)) {
      if (seen.has(name))
        continue;
      seen.add(name);
      let value;
      try {
        value = obj[name];
      } catch (_) {
        continue;
      }
      options.push({
        label: name,
        type: typeof value == "function" ? /^[A-Z]/.test(name) ? "class" : top ? "function" : "method" : top ? "variable" : "property",
        boost: -depth
      });
    }
    let next = Object.getPrototypeOf(obj);
    if (!next)
      return options;
    obj = next;
  }
}
function scopeCompletionSource(scope) {
  let cache2 = /* @__PURE__ */ new Map();
  return (context) => {
    let path = completionPath(context);
    if (!path)
      return null;
    let target = scope;
    for (let step of path.path) {
      target = target[step];
      if (!target)
        return null;
    }
    let options = cache2.get(target);
    if (!options)
      cache2.set(target, options = enumeratePropertyCompletions(target, !path.path.length));
    return {
      from: context.pos - path.name.length,
      options,
      validFor: Identifier
    };
  };
}
var javascriptLanguage = LRLanguage.define({
  name: "javascript",
  parser: parser.configure({
    props: [
      indentNodeProp.add({
        IfStatement: continuedIndent({ except: /^\s*({|else\b)/ }),
        TryStatement: continuedIndent({ except: /^\s*({|catch\b|finally\b)/ }),
        LabeledStatement: flatIndent,
        SwitchBody: (context) => {
          let after = context.textAfter, closed = /^\s*\}/.test(after), isCase = /^\s*(case|default)\b/.test(after);
          return context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit;
        },
        Block: delimitedIndent({ closing: "}" }),
        ArrowFunction: (cx) => cx.baseIndent + cx.unit,
        "TemplateString BlockComment": () => null,
        "Statement Property": continuedIndent({ except: /^{/ }),
        JSXElement(context) {
          let closed = /^\s*<\//.test(context.textAfter);
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
        },
        JSXEscape(context) {
          let closed = /\s*\}/.test(context.textAfter);
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
        },
        "JSXOpenTag JSXSelfClosingTag"(context) {
          return context.column(context.node.from) + context.unit;
        }
      }),
      foldNodeProp.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression": foldInside,
        BlockComment(tree) {
          return { from: tree.from + 2, to: tree.to - 2 };
        }
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
});
var typescriptLanguage = javascriptLanguage.configure({ dialect: "ts" }, "typescript");
var jsxLanguage = javascriptLanguage.configure({ dialect: "jsx" });
var tsxLanguage = javascriptLanguage.configure({ dialect: "jsx ts" }, "typescript");
var keywords = "break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map((kw) => ({ label: kw, type: "keyword" }));
function javascript(config = {}) {
  let lang = config.jsx ? config.typescript ? tsxLanguage : jsxLanguage : config.typescript ? typescriptLanguage : javascriptLanguage;
  return new LanguageSupport(lang, [
    javascriptLanguage.data.of({
      autocomplete: ifNotIn(dontComplete, completeFromList(snippets.concat(keywords)))
    }),
    javascriptLanguage.data.of({
      autocomplete: localCompletionSource
    }),
    config.jsx ? autoCloseTags : []
  ]);
}
function findOpenTag(node) {
  for (; ; ) {
    if (node.name == "JSXOpenTag" || node.name == "JSXSelfClosingTag" || node.name == "JSXFragmentTag")
      return node;
    if (!node.parent)
      return null;
    node = node.parent;
  }
}
function elementName(doc, tree, max = doc.length) {
  for (let ch = tree === null || tree === void 0 ? void 0 : tree.firstChild; ch; ch = ch.nextSibling) {
    if (ch.name == "JSXIdentifier" || ch.name == "JSXBuiltin" || ch.name == "JSXNamespacedName" || ch.name == "JSXMemberExpression")
      return doc.sliceString(ch.from, Math.min(ch.to, max));
  }
  return "";
}
var android = typeof navigator == "object" && /Android\b/.test(navigator.userAgent);
var autoCloseTags = EditorView.inputHandler.of((view, from, to, text) => {
  if ((android ? view.composing : view.compositionStarted) || view.state.readOnly || from != to || text != ">" && text != "/" || !javascriptLanguage.isActiveAt(view.state, from, -1))
    return false;
  let { state } = view;
  let changes = state.changeByRange((range) => {
    var _a, _b;
    let { head } = range, around = syntaxTree(state).resolveInner(head, -1), name;
    if (around.name == "JSXStartTag")
      around = around.parent;
    if (text == ">" && around.name == "JSXFragmentTag") {
      return { range: EditorSelection.cursor(head + 1), changes: { from: head, insert: `><>` } };
    } else if (text == "/" && around.name == "JSXFragmentTag") {
      let empty = around.parent, base = empty === null || empty === void 0 ? void 0 : empty.parent;
      if (empty.from == head - 1 && ((_a = base.lastChild) === null || _a === void 0 ? void 0 : _a.name) != "JSXEndTag" && (name = elementName(state.doc, base === null || base === void 0 ? void 0 : base.firstChild, head))) {
        let insert = `/${name}>`;
        return { range: EditorSelection.cursor(head + insert.length), changes: { from: head, insert } };
      }
    } else if (text == ">") {
      let openTag = findOpenTag(around);
      if (openTag && ((_b = openTag.lastChild) === null || _b === void 0 ? void 0 : _b.name) != "JSXEndTag" && state.sliceDoc(head, head + 2) != "</" && (name = elementName(state.doc, openTag, head)))
        return { range: EditorSelection.cursor(head + 1), changes: { from: head, insert: `></${name}>` } };
    }
    return { range };
  });
  if (changes.changes.empty)
    return false;
  view.dispatch(changes, { userEvent: "input.type", scrollIntoView: true });
  return true;
});
function esLint(eslint, config) {
  if (!config) {
    config = {
      parserOptions: { ecmaVersion: 2019, sourceType: "module" },
      env: { browser: true, node: true, es6: true, es2015: true, es2017: true, es2020: true },
      rules: {}
    };
    eslint.getRules().forEach((desc, name) => {
      if (desc.meta.docs.recommended)
        config.rules[name] = 2;
    });
  }
  return (view) => {
    let { state } = view, found = [];
    for (let { from, to } of javascriptLanguage.findRegions(state)) {
      let fromLine = state.doc.lineAt(from), offset = { line: fromLine.number - 1, col: from - fromLine.from, pos: from };
      for (let d of eslint.verify(state.sliceDoc(from, to), config))
        found.push(translateDiagnostic(d, state.doc, offset));
    }
    return found;
  };
}
function mapPos(line, col, doc, offset) {
  return doc.line(line + offset.line).from + col + (line == 1 ? offset.col - 1 : -1);
}
function translateDiagnostic(input, doc, offset) {
  let start = mapPos(input.line, input.column, doc, offset);
  let result = {
    from: start,
    to: input.endLine != null && input.endColumn != 1 ? mapPos(input.endLine, input.endColumn, doc, offset) : start,
    message: input.message,
    source: input.ruleId ? "eslint:" + input.ruleId : "eslint",
    severity: input.severity == 1 ? "warning" : "error"
  };
  if (input.fix) {
    let { range, text } = input.fix, from = range[0] + offset.pos - start, to = range[1] + offset.pos - start;
    result.actions = [{
      name: "fix",
      apply(view, start2) {
        view.dispatch({ changes: { from: start2 + from, to: start2 + to, insert: text }, scrollIntoView: true });
      }
    }];
  }
  return result;
}
export {
  autoCloseTags,
  completionPath,
  esLint,
  javascript,
  javascriptLanguage,
  jsxLanguage,
  localCompletionSource,
  scopeCompletionSource,
  snippets,
  tsxLanguage,
  typescriptLanguage
};
//# sourceMappingURL=@codemirror_lang-javascript.js.map
