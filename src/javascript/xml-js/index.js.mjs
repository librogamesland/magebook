var Gt = {}, Nt, Ut;
function ee() {
  if (Ut)
    return Nt;
  Ut = 1, Nt = i;
  function i(s) {
    if (s)
      return n(s);
  }
  function n(s) {
    for (var E in i.prototype)
      s[E] = i.prototype[E];
    return s;
  }
  return i.prototype.on = i.prototype.addEventListener = function(s, E) {
    return this._callbacks = this._callbacks || {}, (this._callbacks[s] = this._callbacks[s] || []).push(E), this;
  }, i.prototype.once = function(s, E) {
    var m = this;
    this._callbacks = this._callbacks || {};
    function w() {
      m.off(s, w), E.apply(this, arguments);
    }
    return w.fn = E, this.on(s, w), this;
  }, i.prototype.off = i.prototype.removeListener = i.prototype.removeAllListeners = i.prototype.removeEventListener = function(s, E) {
    if (this._callbacks = this._callbacks || {}, arguments.length == 0)
      return this._callbacks = {}, this;
    var m = this._callbacks[s];
    if (!m)
      return this;
    if (arguments.length == 1)
      return delete this._callbacks[s], this;
    for (var w, T = 0; T < m.length; T++)
      if (w = m[T], w === E || w.fn === E) {
        m.splice(T, 1);
        break;
      }
    return this;
  }, i.prototype.emit = function(s) {
    this._callbacks = this._callbacks || {};
    var E = [].slice.call(arguments, 1), m = this._callbacks[s];
    if (m) {
      m = m.slice(0);
      for (var w = 0, T = m.length; w < T; ++w)
        m[w].apply(this, E);
    }
    return this;
  }, i.prototype.listeners = function(s) {
    return this._callbacks = this._callbacks || {}, this._callbacks[s] || [];
  }, i.prototype.hasListeners = function(s) {
    return !!this.listeners(s).length;
  }, Nt;
}
var vt, Ot;
function re() {
  if (Ot)
    return vt;
  Ot = 1;
  var i = ee();
  function n() {
    i.call(this);
  }
  return n.prototype = new i(), vt = n, n.Stream = n, n.prototype.pipe = function(s, E) {
    var m = this;
    function w(W) {
      s.writable && s.write(W) === !1 && m.pause && m.pause();
    }
    m.on("data", w);
    function T() {
      m.readable && m.resume && m.resume();
    }
    s.on("drain", T), !s._isStdio && (!E || E.end !== !1) && (m.on("end", S), m.on("close", V));
    var c = !1;
    function S() {
      c || (c = !0, s.end());
    }
    function V() {
      c || (c = !0, typeof s.destroy == "function" && s.destroy());
    }
    function C(W) {
      if (B(), !this.hasListeners("error"))
        throw W;
    }
    m.on("error", C), s.on("error", C);
    function B() {
      m.off("data", w), s.off("drain", T), m.off("end", S), m.off("close", V), m.off("error", C), s.off("error", C), m.off("end", B), m.off("close", B), s.off("end", B), s.off("close", B);
    }
    return m.on("end", B), m.on("close", B), s.on("end", B), s.on("close", B), s.emit("pipe", m), s;
  }, vt;
}
var It = {}, Tt = { exports: {} }, _t = {}, lt = {}, Rt;
function ne() {
  if (Rt)
    return lt;
  Rt = 1, lt.byteLength = c, lt.toByteArray = V, lt.fromByteArray = W;
  for (var i = [], n = [], s = typeof Uint8Array < "u" ? Uint8Array : Array, E = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", m = 0, w = E.length; m < w; ++m)
    i[m] = E[m], n[E.charCodeAt(m)] = m;
  n["-".charCodeAt(0)] = 62, n["_".charCodeAt(0)] = 63;
  function T(F) {
    var _ = F.length;
    if (_ % 4 > 0)
      throw new Error("Invalid string. Length must be a multiple of 4");
    var O = F.indexOf("=");
    O === -1 && (O = _);
    var G = O === _ ? 0 : 4 - O % 4;
    return [O, G];
  }
  function c(F) {
    var _ = T(F), O = _[0], G = _[1];
    return (O + G) * 3 / 4 - G;
  }
  function S(F, _, O) {
    return (_ + O) * 3 / 4 - O;
  }
  function V(F) {
    var _, O = T(F), G = O[0], p = O[1], A = new s(S(F, G, p)), N = 0, b = p > 0 ? G - 4 : G, I;
    for (I = 0; I < b; I += 4)
      _ = n[F.charCodeAt(I)] << 18 | n[F.charCodeAt(I + 1)] << 12 | n[F.charCodeAt(I + 2)] << 6 | n[F.charCodeAt(I + 3)], A[N++] = _ >> 16 & 255, A[N++] = _ >> 8 & 255, A[N++] = _ & 255;
    return p === 2 && (_ = n[F.charCodeAt(I)] << 2 | n[F.charCodeAt(I + 1)] >> 4, A[N++] = _ & 255), p === 1 && (_ = n[F.charCodeAt(I)] << 10 | n[F.charCodeAt(I + 1)] << 4 | n[F.charCodeAt(I + 2)] >> 2, A[N++] = _ >> 8 & 255, A[N++] = _ & 255), A;
  }
  function C(F) {
    return i[F >> 18 & 63] + i[F >> 12 & 63] + i[F >> 6 & 63] + i[F & 63];
  }
  function B(F, _, O) {
    for (var G, p = [], A = _; A < O; A += 3)
      G = (F[A] << 16 & 16711680) + (F[A + 1] << 8 & 65280) + (F[A + 2] & 255), p.push(C(G));
    return p.join("");
  }
  function W(F) {
    for (var _, O = F.length, G = O % 3, p = [], A = 16383, N = 0, b = O - G; N < b; N += A)
      p.push(B(F, N, N + A > b ? b : N + A));
    return G === 1 ? (_ = F[O - 1], p.push(
      i[_ >> 2] + i[_ << 4 & 63] + "=="
    )) : G === 2 && (_ = (F[O - 2] << 8) + F[O - 1], p.push(
      i[_ >> 10] + i[_ >> 4 & 63] + i[_ << 2 & 63] + "="
    )), p.join("");
  }
  return lt;
}
var dt = {};
/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
var Lt;
function ie() {
  return Lt || (Lt = 1, dt.read = function(i, n, s, E, m) {
    var w, T, c = m * 8 - E - 1, S = (1 << c) - 1, V = S >> 1, C = -7, B = s ? m - 1 : 0, W = s ? -1 : 1, F = i[n + B];
    for (B += W, w = F & (1 << -C) - 1, F >>= -C, C += c; C > 0; w = w * 256 + i[n + B], B += W, C -= 8)
      ;
    for (T = w & (1 << -C) - 1, w >>= -C, C += E; C > 0; T = T * 256 + i[n + B], B += W, C -= 8)
      ;
    if (w === 0)
      w = 1 - V;
    else {
      if (w === S)
        return T ? NaN : (F ? -1 : 1) * (1 / 0);
      T = T + Math.pow(2, E), w = w - V;
    }
    return (F ? -1 : 1) * T * Math.pow(2, w - E);
  }, dt.write = function(i, n, s, E, m, w) {
    var T, c, S, V = w * 8 - m - 1, C = (1 << V) - 1, B = C >> 1, W = m === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0, F = E ? 0 : w - 1, _ = E ? 1 : -1, O = n < 0 || n === 0 && 1 / n < 0 ? 1 : 0;
    for (n = Math.abs(n), isNaN(n) || n === 1 / 0 ? (c = isNaN(n) ? 1 : 0, T = C) : (T = Math.floor(Math.log(n) / Math.LN2), n * (S = Math.pow(2, -T)) < 1 && (T--, S *= 2), T + B >= 1 ? n += W / S : n += W * Math.pow(2, 1 - B), n * S >= 2 && (T++, S /= 2), T + B >= C ? (c = 0, T = C) : T + B >= 1 ? (c = (n * S - 1) * Math.pow(2, m), T = T + B) : (c = n * Math.pow(2, B - 1) * Math.pow(2, m), T = 0)); m >= 8; i[s + F] = c & 255, F += _, c /= 256, m -= 8)
      ;
    for (T = T << m | c, V += m; V > 0; i[s + F] = T & 255, F += _, T /= 256, V -= 8)
      ;
    i[s + F - _] |= O * 128;
  }), dt;
}
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
var Kt;
function ae() {
  return Kt || (Kt = 1, function(i) {
    var n = ne(), s = ie(), E = typeof Symbol == "function" && typeof Symbol.for == "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
    i.Buffer = c, i.SlowBuffer = A, i.INSPECT_MAX_BYTES = 50;
    var m = 2147483647;
    i.kMaxLength = m, c.TYPED_ARRAY_SUPPORT = w(), !c.TYPED_ARRAY_SUPPORT && typeof console < "u" && typeof console.error == "function" && console.error(
      "This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support."
    );
    function w() {
      try {
        var a = new Uint8Array(1), t = { foo: function() {
          return 42;
        } };
        return Object.setPrototypeOf(t, Uint8Array.prototype), Object.setPrototypeOf(a, t), a.foo() === 42;
      } catch {
        return !1;
      }
    }
    Object.defineProperty(c.prototype, "parent", {
      enumerable: !0,
      get: function() {
        if (c.isBuffer(this))
          return this.buffer;
      }
    }), Object.defineProperty(c.prototype, "offset", {
      enumerable: !0,
      get: function() {
        if (c.isBuffer(this))
          return this.byteOffset;
      }
    });
    function T(a) {
      if (a > m)
        throw new RangeError('The value "' + a + '" is invalid for option "size"');
      var t = new Uint8Array(a);
      return Object.setPrototypeOf(t, c.prototype), t;
    }
    function c(a, t, e) {
      if (typeof a == "number") {
        if (typeof t == "string")
          throw new TypeError(
            'The "string" argument must be of type string. Received type number'
          );
        return B(a);
      }
      return S(a, t, e);
    }
    c.poolSize = 8192;
    function S(a, t, e) {
      if (typeof a == "string")
        return W(a, t);
      if (ArrayBuffer.isView(a))
        return _(a);
      if (a == null)
        throw new TypeError(
          "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof a
        );
      if (L(a, ArrayBuffer) || a && L(a.buffer, ArrayBuffer) || typeof SharedArrayBuffer < "u" && (L(a, SharedArrayBuffer) || a && L(a.buffer, SharedArrayBuffer)))
        return O(a, t, e);
      if (typeof a == "number")
        throw new TypeError(
          'The "value" argument must not be of type number. Received type number'
        );
      var o = a.valueOf && a.valueOf();
      if (o != null && o !== a)
        return c.from(o, t, e);
      var l = G(a);
      if (l)
        return l;
      if (typeof Symbol < "u" && Symbol.toPrimitive != null && typeof a[Symbol.toPrimitive] == "function")
        return c.from(
          a[Symbol.toPrimitive]("string"),
          t,
          e
        );
      throw new TypeError(
        "The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type " + typeof a
      );
    }
    c.from = function(a, t, e) {
      return S(a, t, e);
    }, Object.setPrototypeOf(c.prototype, Uint8Array.prototype), Object.setPrototypeOf(c, Uint8Array);
    function V(a) {
      if (typeof a != "number")
        throw new TypeError('"size" argument must be of type number');
      if (a < 0)
        throw new RangeError('The value "' + a + '" is invalid for option "size"');
    }
    function C(a, t, e) {
      return V(a), a <= 0 ? T(a) : t !== void 0 ? typeof e == "string" ? T(a).fill(t, e) : T(a).fill(t) : T(a);
    }
    c.alloc = function(a, t, e) {
      return C(a, t, e);
    };
    function B(a) {
      return V(a), T(a < 0 ? 0 : p(a) | 0);
    }
    c.allocUnsafe = function(a) {
      return B(a);
    }, c.allocUnsafeSlow = function(a) {
      return B(a);
    };
    function W(a, t) {
      if ((typeof t != "string" || t === "") && (t = "utf8"), !c.isEncoding(t))
        throw new TypeError("Unknown encoding: " + t);
      var e = N(a, t) | 0, o = T(e), l = o.write(a, t);
      return l !== e && (o = o.slice(0, l)), o;
    }
    function F(a) {
      for (var t = a.length < 0 ? 0 : p(a.length) | 0, e = T(t), o = 0; o < t; o += 1)
        e[o] = a[o] & 255;
      return e;
    }
    function _(a) {
      if (L(a, Uint8Array)) {
        var t = new Uint8Array(a);
        return O(t.buffer, t.byteOffset, t.byteLength);
      }
      return F(a);
    }
    function O(a, t, e) {
      if (t < 0 || a.byteLength < t)
        throw new RangeError('"offset" is outside of buffer bounds');
      if (a.byteLength < t + (e || 0))
        throw new RangeError('"length" is outside of buffer bounds');
      var o;
      return t === void 0 && e === void 0 ? o = new Uint8Array(a) : e === void 0 ? o = new Uint8Array(a, t) : o = new Uint8Array(a, t, e), Object.setPrototypeOf(o, c.prototype), o;
    }
    function G(a) {
      if (c.isBuffer(a)) {
        var t = p(a.length) | 0, e = T(t);
        return e.length === 0 || a.copy(e, 0, 0, t), e;
      }
      if (a.length !== void 0)
        return typeof a.length != "number" || Q(a.length) ? T(0) : F(a);
      if (a.type === "Buffer" && Array.isArray(a.data))
        return F(a.data);
    }
    function p(a) {
      if (a >= m)
        throw new RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + m.toString(16) + " bytes");
      return a | 0;
    }
    function A(a) {
      return +a != a && (a = 0), c.alloc(+a);
    }
    c.isBuffer = function(t) {
      return t != null && t._isBuffer === !0 && t !== c.prototype;
    }, c.compare = function(t, e) {
      if (L(t, Uint8Array) && (t = c.from(t, t.offset, t.byteLength)), L(e, Uint8Array) && (e = c.from(e, e.offset, e.byteLength)), !c.isBuffer(t) || !c.isBuffer(e))
        throw new TypeError(
          'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
        );
      if (t === e)
        return 0;
      for (var o = t.length, l = e.length, d = 0, x = Math.min(o, l); d < x; ++d)
        if (t[d] !== e[d]) {
          o = t[d], l = e[d];
          break;
        }
      return o < l ? -1 : l < o ? 1 : 0;
    }, c.isEncoding = function(t) {
      switch (String(t).toLowerCase()) {
        case "hex":
        case "utf8":
        case "utf-8":
        case "ascii":
        case "latin1":
        case "binary":
        case "base64":
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return !0;
        default:
          return !1;
      }
    }, c.concat = function(t, e) {
      if (!Array.isArray(t))
        throw new TypeError('"list" argument must be an Array of Buffers');
      if (t.length === 0)
        return c.alloc(0);
      var o;
      if (e === void 0)
        for (e = 0, o = 0; o < t.length; ++o)
          e += t[o].length;
      var l = c.allocUnsafe(e), d = 0;
      for (o = 0; o < t.length; ++o) {
        var x = t[o];
        if (L(x, Uint8Array))
          d + x.length > l.length ? c.from(x).copy(l, d) : Uint8Array.prototype.set.call(
            l,
            x,
            d
          );
        else if (c.isBuffer(x))
          x.copy(l, d);
        else
          throw new TypeError('"list" argument must be an Array of Buffers');
        d += x.length;
      }
      return l;
    };
    function N(a, t) {
      if (c.isBuffer(a))
        return a.length;
      if (ArrayBuffer.isView(a) || L(a, ArrayBuffer))
        return a.byteLength;
      if (typeof a != "string")
        throw new TypeError(
          'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' + typeof a
        );
      var e = a.length, o = arguments.length > 2 && arguments[2] === !0;
      if (!o && e === 0)
        return 0;
      for (var l = !1; ; )
        switch (t) {
          case "ascii":
          case "latin1":
          case "binary":
            return e;
          case "utf8":
          case "utf-8":
            return r(a).length;
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return e * 2;
          case "hex":
            return e >>> 1;
          case "base64":
            return U(a).length;
          default:
            if (l)
              return o ? -1 : r(a).length;
            t = ("" + t).toLowerCase(), l = !0;
        }
    }
    c.byteLength = N;
    function b(a, t, e) {
      var o = !1;
      if ((t === void 0 || t < 0) && (t = 0), t > this.length || ((e === void 0 || e > this.length) && (e = this.length), e <= 0) || (e >>>= 0, t >>>= 0, e <= t))
        return "";
      for (a || (a = "utf8"); ; )
        switch (a) {
          case "hex":
            return ot(this, t, e);
          case "utf8":
          case "utf-8":
            return ut(this, t, e);
          case "ascii":
            return R(this, t, e);
          case "latin1":
          case "binary":
            return At(this, t, e);
          case "base64":
            return nt(this, t, e);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return st(this, t, e);
          default:
            if (o)
              throw new TypeError("Unknown encoding: " + a);
            a = (a + "").toLowerCase(), o = !0;
        }
    }
    c.prototype._isBuffer = !0;
    function I(a, t, e) {
      var o = a[t];
      a[t] = a[e], a[e] = o;
    }
    c.prototype.swap16 = function() {
      var t = this.length;
      if (t % 2 !== 0)
        throw new RangeError("Buffer size must be a multiple of 16-bits");
      for (var e = 0; e < t; e += 2)
        I(this, e, e + 1);
      return this;
    }, c.prototype.swap32 = function() {
      var t = this.length;
      if (t % 4 !== 0)
        throw new RangeError("Buffer size must be a multiple of 32-bits");
      for (var e = 0; e < t; e += 4)
        I(this, e, e + 3), I(this, e + 1, e + 2);
      return this;
    }, c.prototype.swap64 = function() {
      var t = this.length;
      if (t % 8 !== 0)
        throw new RangeError("Buffer size must be a multiple of 64-bits");
      for (var e = 0; e < t; e += 8)
        I(this, e, e + 7), I(this, e + 1, e + 6), I(this, e + 2, e + 5), I(this, e + 3, e + 4);
      return this;
    }, c.prototype.toString = function() {
      var t = this.length;
      return t === 0 ? "" : arguments.length === 0 ? ut(this, 0, t) : b.apply(this, arguments);
    }, c.prototype.toLocaleString = c.prototype.toString, c.prototype.equals = function(t) {
      if (!c.isBuffer(t))
        throw new TypeError("Argument must be a Buffer");
      return this === t ? !0 : c.compare(this, t) === 0;
    }, c.prototype.inspect = function() {
      var t = "", e = i.INSPECT_MAX_BYTES;
      return t = this.toString("hex", 0, e).replace(/(.{2})/g, "$1 ").trim(), this.length > e && (t += " ... "), "<Buffer " + t + ">";
    }, E && (c.prototype[E] = c.prototype.inspect), c.prototype.compare = function(t, e, o, l, d) {
      if (L(t, Uint8Array) && (t = c.from(t, t.offset, t.byteLength)), !c.isBuffer(t))
        throw new TypeError(
          'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof t
        );
      if (e === void 0 && (e = 0), o === void 0 && (o = t ? t.length : 0), l === void 0 && (l = 0), d === void 0 && (d = this.length), e < 0 || o > t.length || l < 0 || d > this.length)
        throw new RangeError("out of range index");
      if (l >= d && e >= o)
        return 0;
      if (l >= d)
        return -1;
      if (e >= o)
        return 1;
      if (e >>>= 0, o >>>= 0, l >>>= 0, d >>>= 0, this === t)
        return 0;
      for (var x = d - l, D = o - e, M = Math.min(x, D), Y = this.slice(l, d), $ = t.slice(e, o), X = 0; X < M; ++X)
        if (Y[X] !== $[X]) {
          x = Y[X], D = $[X];
          break;
        }
      return x < D ? -1 : D < x ? 1 : 0;
    };
    function yt(a, t, e, o, l) {
      if (a.length === 0)
        return -1;
      if (typeof e == "string" ? (o = e, e = 0) : e > 2147483647 ? e = 2147483647 : e < -2147483648 && (e = -2147483648), e = +e, Q(e) && (e = l ? 0 : a.length - 1), e < 0 && (e = a.length + e), e >= a.length) {
        if (l)
          return -1;
        e = a.length - 1;
      } else if (e < 0)
        if (l)
          e = 0;
        else
          return -1;
      if (typeof t == "string" && (t = c.from(t, o)), c.isBuffer(t))
        return t.length === 0 ? -1 : Z(a, t, e, o, l);
      if (typeof t == "number")
        return t = t & 255, typeof Uint8Array.prototype.indexOf == "function" ? l ? Uint8Array.prototype.indexOf.call(a, t, e) : Uint8Array.prototype.lastIndexOf.call(a, t, e) : Z(a, [t], e, o, l);
      throw new TypeError("val must be string, number or Buffer");
    }
    function Z(a, t, e, o, l) {
      var d = 1, x = a.length, D = t.length;
      if (o !== void 0 && (o = String(o).toLowerCase(), o === "ucs2" || o === "ucs-2" || o === "utf16le" || o === "utf-16le")) {
        if (a.length < 2 || t.length < 2)
          return -1;
        d = 2, x /= 2, D /= 2, e /= 2;
      }
      function M(Dt, St) {
        return d === 1 ? Dt[St] : Dt.readUInt16BE(St * d);
      }
      var Y;
      if (l) {
        var $ = -1;
        for (Y = e; Y < x; Y++)
          if (M(a, Y) === M(t, $ === -1 ? 0 : Y - $)) {
            if ($ === -1 && ($ = Y), Y - $ + 1 === D)
              return $ * d;
          } else
            $ !== -1 && (Y -= Y - $), $ = -1;
      } else
        for (e + D > x && (e = x - D), Y = e; Y >= 0; Y--) {
          for (var X = !0, gt = 0; gt < D; gt++)
            if (M(a, Y + gt) !== M(t, gt)) {
              X = !1;
              break;
            }
          if (X)
            return Y;
        }
      return -1;
    }
    c.prototype.includes = function(t, e, o) {
      return this.indexOf(t, e, o) !== -1;
    }, c.prototype.indexOf = function(t, e, o) {
      return yt(this, t, e, o, !0);
    }, c.prototype.lastIndexOf = function(t, e, o) {
      return yt(this, t, e, o, !1);
    };
    function wt(a, t, e, o) {
      e = Number(e) || 0;
      var l = a.length - e;
      o ? (o = Number(o), o > l && (o = l)) : o = l;
      var d = t.length;
      o > d / 2 && (o = d / 2);
      for (var x = 0; x < o; ++x) {
        var D = parseInt(t.substr(x * 2, 2), 16);
        if (Q(D))
          return x;
        a[e + x] = D;
      }
      return x;
    }
    function h(a, t, e, o) {
      return j(r(t, a.length - e), a, e, o);
    }
    function Et(a, t, e, o) {
      return j(g(t), a, e, o);
    }
    function rt(a, t, e, o) {
      return j(U(t), a, e, o);
    }
    function q(a, t, e, o) {
      return j(f(t, a.length - e), a, e, o);
    }
    c.prototype.write = function(t, e, o, l) {
      if (e === void 0)
        l = "utf8", o = this.length, e = 0;
      else if (o === void 0 && typeof e == "string")
        l = e, o = this.length, e = 0;
      else if (isFinite(e))
        e = e >>> 0, isFinite(o) ? (o = o >>> 0, l === void 0 && (l = "utf8")) : (l = o, o = void 0);
      else
        throw new Error(
          "Buffer.write(string, encoding, offset[, length]) is no longer supported"
        );
      var d = this.length - e;
      if ((o === void 0 || o > d) && (o = d), t.length > 0 && (o < 0 || e < 0) || e > this.length)
        throw new RangeError("Attempt to write outside buffer bounds");
      l || (l = "utf8");
      for (var x = !1; ; )
        switch (l) {
          case "hex":
            return wt(this, t, e, o);
          case "utf8":
          case "utf-8":
            return h(this, t, e, o);
          case "ascii":
          case "latin1":
          case "binary":
            return Et(this, t, e, o);
          case "base64":
            return rt(this, t, e, o);
          case "ucs2":
          case "ucs-2":
          case "utf16le":
          case "utf-16le":
            return q(this, t, e, o);
          default:
            if (x)
              throw new TypeError("Unknown encoding: " + l);
            l = ("" + l).toLowerCase(), x = !0;
        }
    }, c.prototype.toJSON = function() {
      return {
        type: "Buffer",
        data: Array.prototype.slice.call(this._arr || this, 0)
      };
    };
    function nt(a, t, e) {
      return t === 0 && e === a.length ? n.fromByteArray(a) : n.fromByteArray(a.slice(t, e));
    }
    function ut(a, t, e) {
      e = Math.min(a.length, e);
      for (var o = [], l = t; l < e; ) {
        var d = a[l], x = null, D = d > 239 ? 4 : d > 223 ? 3 : d > 191 ? 2 : 1;
        if (l + D <= e) {
          var M, Y, $, X;
          switch (D) {
            case 1:
              d < 128 && (x = d);
              break;
            case 2:
              M = a[l + 1], (M & 192) === 128 && (X = (d & 31) << 6 | M & 63, X > 127 && (x = X));
              break;
            case 3:
              M = a[l + 1], Y = a[l + 2], (M & 192) === 128 && (Y & 192) === 128 && (X = (d & 15) << 12 | (M & 63) << 6 | Y & 63, X > 2047 && (X < 55296 || X > 57343) && (x = X));
              break;
            case 4:
              M = a[l + 1], Y = a[l + 2], $ = a[l + 3], (M & 192) === 128 && (Y & 192) === 128 && ($ & 192) === 128 && (X = (d & 15) << 18 | (M & 63) << 12 | (Y & 63) << 6 | $ & 63, X > 65535 && X < 1114112 && (x = X));
          }
        }
        x === null ? (x = 65533, D = 1) : x > 65535 && (x -= 65536, o.push(x >>> 10 & 1023 | 55296), x = 56320 | x & 1023), o.push(x), l += D;
      }
      return mt(o);
    }
    var it = 4096;
    function mt(a) {
      var t = a.length;
      if (t <= it)
        return String.fromCharCode.apply(String, a);
      for (var e = "", o = 0; o < t; )
        e += String.fromCharCode.apply(
          String,
          a.slice(o, o += it)
        );
      return e;
    }
    function R(a, t, e) {
      var o = "";
      e = Math.min(a.length, e);
      for (var l = t; l < e; ++l)
        o += String.fromCharCode(a[l] & 127);
      return o;
    }
    function At(a, t, e) {
      var o = "";
      e = Math.min(a.length, e);
      for (var l = t; l < e; ++l)
        o += String.fromCharCode(a[l]);
      return o;
    }
    function ot(a, t, e) {
      var o = a.length;
      (!t || t < 0) && (t = 0), (!e || e < 0 || e > o) && (e = o);
      for (var l = "", d = t; d < e; ++d)
        l += tt[a[d]];
      return l;
    }
    function st(a, t, e) {
      for (var o = a.slice(t, e), l = "", d = 0; d < o.length - 1; d += 2)
        l += String.fromCharCode(o[d] + o[d + 1] * 256);
      return l;
    }
    c.prototype.slice = function(t, e) {
      var o = this.length;
      t = ~~t, e = e === void 0 ? o : ~~e, t < 0 ? (t += o, t < 0 && (t = 0)) : t > o && (t = o), e < 0 ? (e += o, e < 0 && (e = 0)) : e > o && (e = o), e < t && (e = t);
      var l = this.subarray(t, e);
      return Object.setPrototypeOf(l, c.prototype), l;
    };
    function P(a, t, e) {
      if (a % 1 !== 0 || a < 0)
        throw new RangeError("offset is not uint");
      if (a + t > e)
        throw new RangeError("Trying to access beyond buffer length");
    }
    c.prototype.readUintLE = c.prototype.readUIntLE = function(t, e, o) {
      t = t >>> 0, e = e >>> 0, o || P(t, e, this.length);
      for (var l = this[t], d = 1, x = 0; ++x < e && (d *= 256); )
        l += this[t + x] * d;
      return l;
    }, c.prototype.readUintBE = c.prototype.readUIntBE = function(t, e, o) {
      t = t >>> 0, e = e >>> 0, o || P(t, e, this.length);
      for (var l = this[t + --e], d = 1; e > 0 && (d *= 256); )
        l += this[t + --e] * d;
      return l;
    }, c.prototype.readUint8 = c.prototype.readUInt8 = function(t, e) {
      return t = t >>> 0, e || P(t, 1, this.length), this[t];
    }, c.prototype.readUint16LE = c.prototype.readUInt16LE = function(t, e) {
      return t = t >>> 0, e || P(t, 2, this.length), this[t] | this[t + 1] << 8;
    }, c.prototype.readUint16BE = c.prototype.readUInt16BE = function(t, e) {
      return t = t >>> 0, e || P(t, 2, this.length), this[t] << 8 | this[t + 1];
    }, c.prototype.readUint32LE = c.prototype.readUInt32LE = function(t, e) {
      return t = t >>> 0, e || P(t, 4, this.length), (this[t] | this[t + 1] << 8 | this[t + 2] << 16) + this[t + 3] * 16777216;
    }, c.prototype.readUint32BE = c.prototype.readUInt32BE = function(t, e) {
      return t = t >>> 0, e || P(t, 4, this.length), this[t] * 16777216 + (this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3]);
    }, c.prototype.readIntLE = function(t, e, o) {
      t = t >>> 0, e = e >>> 0, o || P(t, e, this.length);
      for (var l = this[t], d = 1, x = 0; ++x < e && (d *= 256); )
        l += this[t + x] * d;
      return d *= 128, l >= d && (l -= Math.pow(2, 8 * e)), l;
    }, c.prototype.readIntBE = function(t, e, o) {
      t = t >>> 0, e = e >>> 0, o || P(t, e, this.length);
      for (var l = e, d = 1, x = this[t + --l]; l > 0 && (d *= 256); )
        x += this[t + --l] * d;
      return d *= 128, x >= d && (x -= Math.pow(2, 8 * e)), x;
    }, c.prototype.readInt8 = function(t, e) {
      return t = t >>> 0, e || P(t, 1, this.length), this[t] & 128 ? (255 - this[t] + 1) * -1 : this[t];
    }, c.prototype.readInt16LE = function(t, e) {
      t = t >>> 0, e || P(t, 2, this.length);
      var o = this[t] | this[t + 1] << 8;
      return o & 32768 ? o | 4294901760 : o;
    }, c.prototype.readInt16BE = function(t, e) {
      t = t >>> 0, e || P(t, 2, this.length);
      var o = this[t + 1] | this[t] << 8;
      return o & 32768 ? o | 4294901760 : o;
    }, c.prototype.readInt32LE = function(t, e) {
      return t = t >>> 0, e || P(t, 4, this.length), this[t] | this[t + 1] << 8 | this[t + 2] << 16 | this[t + 3] << 24;
    }, c.prototype.readInt32BE = function(t, e) {
      return t = t >>> 0, e || P(t, 4, this.length), this[t] << 24 | this[t + 1] << 16 | this[t + 2] << 8 | this[t + 3];
    }, c.prototype.readFloatLE = function(t, e) {
      return t = t >>> 0, e || P(t, 4, this.length), s.read(this, t, !0, 23, 4);
    }, c.prototype.readFloatBE = function(t, e) {
      return t = t >>> 0, e || P(t, 4, this.length), s.read(this, t, !1, 23, 4);
    }, c.prototype.readDoubleLE = function(t, e) {
      return t = t >>> 0, e || P(t, 8, this.length), s.read(this, t, !0, 52, 8);
    }, c.prototype.readDoubleBE = function(t, e) {
      return t = t >>> 0, e || P(t, 8, this.length), s.read(this, t, !1, 52, 8);
    };
    function H(a, t, e, o, l, d) {
      if (!c.isBuffer(a))
        throw new TypeError('"buffer" argument must be a Buffer instance');
      if (t > l || t < d)
        throw new RangeError('"value" argument is out of bounds');
      if (e + o > a.length)
        throw new RangeError("Index out of range");
    }
    c.prototype.writeUintLE = c.prototype.writeUIntLE = function(t, e, o, l) {
      if (t = +t, e = e >>> 0, o = o >>> 0, !l) {
        var d = Math.pow(2, 8 * o) - 1;
        H(this, t, e, o, d, 0);
      }
      var x = 1, D = 0;
      for (this[e] = t & 255; ++D < o && (x *= 256); )
        this[e + D] = t / x & 255;
      return e + o;
    }, c.prototype.writeUintBE = c.prototype.writeUIntBE = function(t, e, o, l) {
      if (t = +t, e = e >>> 0, o = o >>> 0, !l) {
        var d = Math.pow(2, 8 * o) - 1;
        H(this, t, e, o, d, 0);
      }
      var x = o - 1, D = 1;
      for (this[e + x] = t & 255; --x >= 0 && (D *= 256); )
        this[e + x] = t / D & 255;
      return e + o;
    }, c.prototype.writeUint8 = c.prototype.writeUInt8 = function(t, e, o) {
      return t = +t, e = e >>> 0, o || H(this, t, e, 1, 255, 0), this[e] = t & 255, e + 1;
    }, c.prototype.writeUint16LE = c.prototype.writeUInt16LE = function(t, e, o) {
      return t = +t, e = e >>> 0, o || H(this, t, e, 2, 65535, 0), this[e] = t & 255, this[e + 1] = t >>> 8, e + 2;
    }, c.prototype.writeUint16BE = c.prototype.writeUInt16BE = function(t, e, o) {
      return t = +t, e = e >>> 0, o || H(this, t, e, 2, 65535, 0), this[e] = t >>> 8, this[e + 1] = t & 255, e + 2;
    }, c.prototype.writeUint32LE = c.prototype.writeUInt32LE = function(t, e, o) {
      return t = +t, e = e >>> 0, o || H(this, t, e, 4, 4294967295, 0), this[e + 3] = t >>> 24, this[e + 2] = t >>> 16, this[e + 1] = t >>> 8, this[e] = t & 255, e + 4;
    }, c.prototype.writeUint32BE = c.prototype.writeUInt32BE = function(t, e, o) {
      return t = +t, e = e >>> 0, o || H(this, t, e, 4, 4294967295, 0), this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = t & 255, e + 4;
    }, c.prototype.writeIntLE = function(t, e, o, l) {
      if (t = +t, e = e >>> 0, !l) {
        var d = Math.pow(2, 8 * o - 1);
        H(this, t, e, o, d - 1, -d);
      }
      var x = 0, D = 1, M = 0;
      for (this[e] = t & 255; ++x < o && (D *= 256); )
        t < 0 && M === 0 && this[e + x - 1] !== 0 && (M = 1), this[e + x] = (t / D >> 0) - M & 255;
      return e + o;
    }, c.prototype.writeIntBE = function(t, e, o, l) {
      if (t = +t, e = e >>> 0, !l) {
        var d = Math.pow(2, 8 * o - 1);
        H(this, t, e, o, d - 1, -d);
      }
      var x = o - 1, D = 1, M = 0;
      for (this[e + x] = t & 255; --x >= 0 && (D *= 256); )
        t < 0 && M === 0 && this[e + x + 1] !== 0 && (M = 1), this[e + x] = (t / D >> 0) - M & 255;
      return e + o;
    }, c.prototype.writeInt8 = function(t, e, o) {
      return t = +t, e = e >>> 0, o || H(this, t, e, 1, 127, -128), t < 0 && (t = 255 + t + 1), this[e] = t & 255, e + 1;
    }, c.prototype.writeInt16LE = function(t, e, o) {
      return t = +t, e = e >>> 0, o || H(this, t, e, 2, 32767, -32768), this[e] = t & 255, this[e + 1] = t >>> 8, e + 2;
    }, c.prototype.writeInt16BE = function(t, e, o) {
      return t = +t, e = e >>> 0, o || H(this, t, e, 2, 32767, -32768), this[e] = t >>> 8, this[e + 1] = t & 255, e + 2;
    }, c.prototype.writeInt32LE = function(t, e, o) {
      return t = +t, e = e >>> 0, o || H(this, t, e, 4, 2147483647, -2147483648), this[e] = t & 255, this[e + 1] = t >>> 8, this[e + 2] = t >>> 16, this[e + 3] = t >>> 24, e + 4;
    }, c.prototype.writeInt32BE = function(t, e, o) {
      return t = +t, e = e >>> 0, o || H(this, t, e, 4, 2147483647, -2147483648), t < 0 && (t = 4294967295 + t + 1), this[e] = t >>> 24, this[e + 1] = t >>> 16, this[e + 2] = t >>> 8, this[e + 3] = t & 255, e + 4;
    };
    function pt(a, t, e, o, l, d) {
      if (e + o > a.length)
        throw new RangeError("Index out of range");
      if (e < 0)
        throw new RangeError("Index out of range");
    }
    function ct(a, t, e, o, l) {
      return t = +t, e = e >>> 0, l || pt(a, t, e, 4), s.write(a, t, e, o, 23, 4), e + 4;
    }
    c.prototype.writeFloatLE = function(t, e, o) {
      return ct(this, t, e, !0, o);
    }, c.prototype.writeFloatBE = function(t, e, o) {
      return ct(this, t, e, !1, o);
    };
    function ft(a, t, e, o, l) {
      return t = +t, e = e >>> 0, l || pt(a, t, e, 8), s.write(a, t, e, o, 52, 8), e + 8;
    }
    c.prototype.writeDoubleLE = function(t, e, o) {
      return ft(this, t, e, !0, o);
    }, c.prototype.writeDoubleBE = function(t, e, o) {
      return ft(this, t, e, !1, o);
    }, c.prototype.copy = function(t, e, o, l) {
      if (!c.isBuffer(t))
        throw new TypeError("argument should be a Buffer");
      if (o || (o = 0), !l && l !== 0 && (l = this.length), e >= t.length && (e = t.length), e || (e = 0), l > 0 && l < o && (l = o), l === o || t.length === 0 || this.length === 0)
        return 0;
      if (e < 0)
        throw new RangeError("targetStart out of bounds");
      if (o < 0 || o >= this.length)
        throw new RangeError("Index out of range");
      if (l < 0)
        throw new RangeError("sourceEnd out of bounds");
      l > this.length && (l = this.length), t.length - e < l - o && (l = t.length - e + o);
      var d = l - o;
      return this === t && typeof Uint8Array.prototype.copyWithin == "function" ? this.copyWithin(e, o, l) : Uint8Array.prototype.set.call(
        t,
        this.subarray(o, l),
        e
      ), d;
    }, c.prototype.fill = function(t, e, o, l) {
      if (typeof t == "string") {
        if (typeof e == "string" ? (l = e, e = 0, o = this.length) : typeof o == "string" && (l = o, o = this.length), l !== void 0 && typeof l != "string")
          throw new TypeError("encoding must be a string");
        if (typeof l == "string" && !c.isEncoding(l))
          throw new TypeError("Unknown encoding: " + l);
        if (t.length === 1) {
          var d = t.charCodeAt(0);
          (l === "utf8" && d < 128 || l === "latin1") && (t = d);
        }
      } else
        typeof t == "number" ? t = t & 255 : typeof t == "boolean" && (t = Number(t));
      if (e < 0 || this.length < e || this.length < o)
        throw new RangeError("Out of range index");
      if (o <= e)
        return this;
      e = e >>> 0, o = o === void 0 ? this.length : o >>> 0, t || (t = 0);
      var x;
      if (typeof t == "number")
        for (x = e; x < o; ++x)
          this[x] = t;
      else {
        var D = c.isBuffer(t) ? t : c.from(t, l), M = D.length;
        if (M === 0)
          throw new TypeError('The value "' + t + '" is invalid for argument "value"');
        for (x = 0; x < o - e; ++x)
          this[x + e] = D[x % M];
      }
      return this;
    };
    var Ft = /[^+/0-9A-Za-z-_]/g;
    function u(a) {
      if (a = a.split("=")[0], a = a.trim().replace(Ft, ""), a.length < 2)
        return "";
      for (; a.length % 4 !== 0; )
        a = a + "=";
      return a;
    }
    function r(a, t) {
      t = t || 1 / 0;
      for (var e, o = a.length, l = null, d = [], x = 0; x < o; ++x) {
        if (e = a.charCodeAt(x), e > 55295 && e < 57344) {
          if (!l) {
            if (e > 56319) {
              (t -= 3) > -1 && d.push(239, 191, 189);
              continue;
            } else if (x + 1 === o) {
              (t -= 3) > -1 && d.push(239, 191, 189);
              continue;
            }
            l = e;
            continue;
          }
          if (e < 56320) {
            (t -= 3) > -1 && d.push(239, 191, 189), l = e;
            continue;
          }
          e = (l - 55296 << 10 | e - 56320) + 65536;
        } else
          l && (t -= 3) > -1 && d.push(239, 191, 189);
        if (l = null, e < 128) {
          if ((t -= 1) < 0)
            break;
          d.push(e);
        } else if (e < 2048) {
          if ((t -= 2) < 0)
            break;
          d.push(
            e >> 6 | 192,
            e & 63 | 128
          );
        } else if (e < 65536) {
          if ((t -= 3) < 0)
            break;
          d.push(
            e >> 12 | 224,
            e >> 6 & 63 | 128,
            e & 63 | 128
          );
        } else if (e < 1114112) {
          if ((t -= 4) < 0)
            break;
          d.push(
            e >> 18 | 240,
            e >> 12 & 63 | 128,
            e >> 6 & 63 | 128,
            e & 63 | 128
          );
        } else
          throw new Error("Invalid code point");
      }
      return d;
    }
    function g(a) {
      for (var t = [], e = 0; e < a.length; ++e)
        t.push(a.charCodeAt(e) & 255);
      return t;
    }
    function f(a, t) {
      for (var e, o, l, d = [], x = 0; x < a.length && !((t -= 2) < 0); ++x)
        e = a.charCodeAt(x), o = e >> 8, l = e % 256, d.push(l), d.push(o);
      return d;
    }
    function U(a) {
      return n.toByteArray(u(a));
    }
    function j(a, t, e, o) {
      for (var l = 0; l < o && !(l + e >= t.length || l >= a.length); ++l)
        t[l + e] = a[l];
      return l;
    }
    function L(a, t) {
      return a instanceof t || a != null && a.constructor != null && a.constructor.name != null && a.constructor.name === t.name;
    }
    function Q(a) {
      return a !== a;
    }
    var tt = function() {
      for (var a = "0123456789abcdef", t = new Array(256), e = 0; e < 16; ++e)
        for (var o = e * 16, l = 0; l < 16; ++l)
          t[o + l] = a[e] + a[l];
      return t;
    }();
  }(_t)), _t;
}
var Mt;
function ue() {
  return Mt || (Mt = 1, function(i, n) {
    var s = ae(), E = s.Buffer;
    function m(T, c) {
      for (var S in T)
        c[S] = T[S];
    }
    E.from && E.alloc && E.allocUnsafe && E.allocUnsafeSlow ? i.exports = s : (m(s, n), n.Buffer = w);
    function w(T, c, S) {
      return E(T, c, S);
    }
    m(E, w), w.from = function(T, c, S) {
      if (typeof T == "number")
        throw new TypeError("Argument must not be a number");
      return E(T, c, S);
    }, w.alloc = function(T, c, S) {
      if (typeof T != "number")
        throw new TypeError("Argument must be a number");
      var V = E(T);
      return c !== void 0 ? typeof S == "string" ? V.fill(c, S) : V.fill(c) : V.fill(0), V;
    }, w.allocUnsafe = function(T) {
      if (typeof T != "number")
        throw new TypeError("Argument must be a number");
      return E(T);
    }, w.allocUnsafeSlow = function(T) {
      if (typeof T != "number")
        throw new TypeError("Argument must be a number");
      return s.SlowBuffer(T);
    };
  }(Tt, Tt.exports)), Tt.exports;
}
var Pt;
function oe() {
  if (Pt)
    return It;
  Pt = 1;
  var i = ue().Buffer, n = i.isEncoding || function(p) {
    switch (p = "" + p, p && p.toLowerCase()) {
      case "hex":
      case "utf8":
      case "utf-8":
      case "ascii":
      case "binary":
      case "base64":
      case "ucs2":
      case "ucs-2":
      case "utf16le":
      case "utf-16le":
      case "raw":
        return !0;
      default:
        return !1;
    }
  };
  function s(p) {
    if (!p)
      return "utf8";
    for (var A; ; )
      switch (p) {
        case "utf8":
        case "utf-8":
          return "utf8";
        case "ucs2":
        case "ucs-2":
        case "utf16le":
        case "utf-16le":
          return "utf16le";
        case "latin1":
        case "binary":
          return "latin1";
        case "base64":
        case "ascii":
        case "hex":
          return p;
        default:
          if (A)
            return;
          p = ("" + p).toLowerCase(), A = !0;
      }
  }
  function E(p) {
    var A = s(p);
    if (typeof A != "string" && (i.isEncoding === n || !n(p)))
      throw new Error("Unknown encoding: " + p);
    return A || p;
  }
  It.StringDecoder = m;
  function m(p) {
    this.encoding = E(p);
    var A;
    switch (this.encoding) {
      case "utf16le":
        this.text = B, this.end = W, A = 4;
        break;
      case "utf8":
        this.fillLast = S, A = 4;
        break;
      case "base64":
        this.text = F, this.end = _, A = 3;
        break;
      default:
        this.write = O, this.end = G;
        return;
    }
    this.lastNeed = 0, this.lastTotal = 0, this.lastChar = i.allocUnsafe(A);
  }
  m.prototype.write = function(p) {
    if (p.length === 0)
      return "";
    var A, N;
    if (this.lastNeed) {
      if (A = this.fillLast(p), A === void 0)
        return "";
      N = this.lastNeed, this.lastNeed = 0;
    } else
      N = 0;
    return N < p.length ? A ? A + this.text(p, N) : this.text(p, N) : A || "";
  }, m.prototype.end = C, m.prototype.text = V, m.prototype.fillLast = function(p) {
    if (this.lastNeed <= p.length)
      return p.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    p.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, p.length), this.lastNeed -= p.length;
  };
  function w(p) {
    return p <= 127 ? 0 : p >> 5 === 6 ? 2 : p >> 4 === 14 ? 3 : p >> 3 === 30 ? 4 : p >> 6 === 2 ? -1 : -2;
  }
  function T(p, A, N) {
    var b = A.length - 1;
    if (b < N)
      return 0;
    var I = w(A[b]);
    return I >= 0 ? (I > 0 && (p.lastNeed = I - 1), I) : --b < N || I === -2 ? 0 : (I = w(A[b]), I >= 0 ? (I > 0 && (p.lastNeed = I - 2), I) : --b < N || I === -2 ? 0 : (I = w(A[b]), I >= 0 ? (I > 0 && (I === 2 ? I = 0 : p.lastNeed = I - 3), I) : 0));
  }
  function c(p, A, N) {
    if ((A[0] & 192) !== 128)
      return p.lastNeed = 0, "�";
    if (p.lastNeed > 1 && A.length > 1) {
      if ((A[1] & 192) !== 128)
        return p.lastNeed = 1, "�";
      if (p.lastNeed > 2 && A.length > 2 && (A[2] & 192) !== 128)
        return p.lastNeed = 2, "�";
    }
  }
  function S(p) {
    var A = this.lastTotal - this.lastNeed, N = c(this, p);
    if (N !== void 0)
      return N;
    if (this.lastNeed <= p.length)
      return p.copy(this.lastChar, A, 0, this.lastNeed), this.lastChar.toString(this.encoding, 0, this.lastTotal);
    p.copy(this.lastChar, A, 0, p.length), this.lastNeed -= p.length;
  }
  function V(p, A) {
    var N = T(this, p, A);
    if (!this.lastNeed)
      return p.toString("utf8", A);
    this.lastTotal = N;
    var b = p.length - (N - this.lastNeed);
    return p.copy(this.lastChar, 0, b), p.toString("utf8", A, b);
  }
  function C(p) {
    var A = p && p.length ? this.write(p) : "";
    return this.lastNeed ? A + "�" : A;
  }
  function B(p, A) {
    if ((p.length - A) % 2 === 0) {
      var N = p.toString("utf16le", A);
      if (N) {
        var b = N.charCodeAt(N.length - 1);
        if (b >= 55296 && b <= 56319)
          return this.lastNeed = 2, this.lastTotal = 4, this.lastChar[0] = p[p.length - 2], this.lastChar[1] = p[p.length - 1], N.slice(0, -1);
      }
      return N;
    }
    return this.lastNeed = 1, this.lastTotal = 2, this.lastChar[0] = p[p.length - 1], p.toString("utf16le", A, p.length - 1);
  }
  function W(p) {
    var A = p && p.length ? this.write(p) : "";
    if (this.lastNeed) {
      var N = this.lastTotal - this.lastNeed;
      return A + this.lastChar.toString("utf16le", 0, N);
    }
    return A;
  }
  function F(p, A) {
    var N = (p.length - A) % 3;
    return N === 0 ? p.toString("base64", A) : (this.lastNeed = 3 - N, this.lastTotal = 3, N === 1 ? this.lastChar[0] = p[p.length - 1] : (this.lastChar[0] = p[p.length - 2], this.lastChar[1] = p[p.length - 1]), p.toString("base64", A, p.length - N));
  }
  function _(p) {
    var A = p && p.length ? this.write(p) : "";
    return this.lastNeed ? A + this.lastChar.toString("base64", 0, 3 - this.lastNeed) : A;
  }
  function O(p) {
    return p.toString(this.encoding);
  }
  function G(p) {
    return p && p.length ? this.write(p) : "";
  }
  return It;
}
(function(i) {
  (function(n) {
    n.parser = function(u, r) {
      return new E(u, r);
    }, n.SAXParser = E, n.SAXStream = C, n.createStream = V, n.MAX_BUFFER_LENGTH = 64 * 1024;
    var s = [
      "comment",
      "sgmlDecl",
      "textNode",
      "tagName",
      "doctype",
      "procInstName",
      "procInstBody",
      "entity",
      "attribName",
      "attribValue",
      "cdata",
      "script"
    ];
    n.EVENTS = [
      "text",
      "processinginstruction",
      "sgmldeclaration",
      "doctype",
      "comment",
      "opentagstart",
      "attribute",
      "opentag",
      "closetag",
      "opencdata",
      "cdata",
      "closecdata",
      "error",
      "end",
      "ready",
      "script",
      "opennamespace",
      "closenamespace"
    ];
    function E(u, r) {
      if (!(this instanceof E))
        return new E(u, r);
      var g = this;
      w(g), g.q = g.c = "", g.bufferCheckPosition = n.MAX_BUFFER_LENGTH, g.opt = r || {}, g.opt.lowercase = g.opt.lowercase || g.opt.lowercasetags, g.looseCase = g.opt.lowercase ? "toLowerCase" : "toUpperCase", g.tags = [], g.closed = g.closedRoot = g.sawRoot = !1, g.tag = g.error = null, g.strict = !!u, g.noscript = !!(u || g.opt.noscript), g.state = h.BEGIN, g.strictEntities = g.opt.strictEntities, g.ENTITIES = g.strictEntities ? Object.create(n.XML_ENTITIES) : Object.create(n.ENTITIES), g.attribList = [], g.opt.xmlns && (g.ns = Object.create(O)), g.trackPosition = g.opt.position !== !1, g.trackPosition && (g.position = g.line = g.column = 0), rt(g, "onready");
    }
    Object.create || (Object.create = function(u) {
      function r() {
      }
      r.prototype = u;
      var g = new r();
      return g;
    }), Object.keys || (Object.keys = function(u) {
      var r = [];
      for (var g in u)
        u.hasOwnProperty(g) && r.push(g);
      return r;
    });
    function m(u) {
      for (var r = Math.max(n.MAX_BUFFER_LENGTH, 10), g = 0, f = 0, U = s.length; f < U; f++) {
        var j = u[s[f]].length;
        if (j > r)
          switch (s[f]) {
            case "textNode":
              nt(u);
              break;
            case "cdata":
              q(u, "oncdata", u.cdata), u.cdata = "";
              break;
            case "script":
              q(u, "onscript", u.script), u.script = "";
              break;
            default:
              it(u, "Max buffer length exceeded: " + s[f]);
          }
        g = Math.max(g, j);
      }
      var L = n.MAX_BUFFER_LENGTH - g;
      u.bufferCheckPosition = L + u.position;
    }
    function w(u) {
      for (var r = 0, g = s.length; r < g; r++)
        u[s[r]] = "";
    }
    function T(u) {
      nt(u), u.cdata !== "" && (q(u, "oncdata", u.cdata), u.cdata = ""), u.script !== "" && (q(u, "onscript", u.script), u.script = "");
    }
    E.prototype = {
      end: function() {
        mt(this);
      },
      write: Ft,
      resume: function() {
        return this.error = null, this;
      },
      close: function() {
        return this.write(null);
      },
      flush: function() {
        T(this);
      }
    };
    var c;
    try {
      c = re().Stream;
    } catch {
      c = function() {
      };
    }
    var S = n.EVENTS.filter(function(u) {
      return u !== "error" && u !== "end";
    });
    function V(u, r) {
      return new C(u, r);
    }
    function C(u, r) {
      if (!(this instanceof C))
        return new C(u, r);
      c.apply(this), this._parser = new E(u, r), this.writable = !0, this.readable = !0;
      var g = this;
      this._parser.onend = function() {
        g.emit("end");
      }, this._parser.onerror = function(f) {
        g.emit("error", f), g._parser.error = null;
      }, this._decoder = null, S.forEach(function(f) {
        Object.defineProperty(g, "on" + f, {
          get: function() {
            return g._parser["on" + f];
          },
          set: function(U) {
            if (!U)
              return g.removeAllListeners(f), g._parser["on" + f] = U, U;
            g.on(f, U);
          },
          enumerable: !0,
          configurable: !1
        });
      });
    }
    C.prototype = Object.create(c.prototype, {
      constructor: {
        value: C
      }
    }), C.prototype.write = function(u) {
      if (typeof Buffer == "function" && typeof Buffer.isBuffer == "function" && Buffer.isBuffer(u)) {
        if (!this._decoder) {
          var r = oe().StringDecoder;
          this._decoder = new r("utf8");
        }
        u = this._decoder.write(u);
      }
      return this._parser.write(u.toString()), this.emit("data", u), !0;
    }, C.prototype.end = function(u) {
      return u && u.length && this.write(u), this._parser.end(), !0;
    }, C.prototype.on = function(u, r) {
      var g = this;
      return !g._parser["on" + u] && S.indexOf(u) !== -1 && (g._parser["on" + u] = function() {
        var f = arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments);
        f.splice(0, 0, u), g.emit.apply(g, f);
      }), c.prototype.on.call(g, u, r);
    };
    var B = "[CDATA[", W = "DOCTYPE", F = "http://www.w3.org/XML/1998/namespace", _ = "http://www.w3.org/2000/xmlns/", O = { xml: F, xmlns: _ }, G = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, p = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/, A = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/, N = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/;
    function b(u) {
      return u === " " || u === `
` || u === "\r" || u === "	";
    }
    function I(u) {
      return u === '"' || u === "'";
    }
    function yt(u) {
      return u === ">" || b(u);
    }
    function Z(u, r) {
      return u.test(r);
    }
    function wt(u, r) {
      return !Z(u, r);
    }
    var h = 0;
    n.STATE = {
      BEGIN: h++,
      // leading byte order mark or whitespace
      BEGIN_WHITESPACE: h++,
      // leading whitespace
      TEXT: h++,
      // general stuff
      TEXT_ENTITY: h++,
      // &amp and such.
      OPEN_WAKA: h++,
      // <
      SGML_DECL: h++,
      // <!BLARG
      SGML_DECL_QUOTED: h++,
      // <!BLARG foo "bar
      DOCTYPE: h++,
      // <!DOCTYPE
      DOCTYPE_QUOTED: h++,
      // <!DOCTYPE "//blah
      DOCTYPE_DTD: h++,
      // <!DOCTYPE "//blah" [ ...
      DOCTYPE_DTD_QUOTED: h++,
      // <!DOCTYPE "//blah" [ "foo
      COMMENT_STARTING: h++,
      // <!-
      COMMENT: h++,
      // <!--
      COMMENT_ENDING: h++,
      // <!-- blah -
      COMMENT_ENDED: h++,
      // <!-- blah --
      CDATA: h++,
      // <![CDATA[ something
      CDATA_ENDING: h++,
      // ]
      CDATA_ENDING_2: h++,
      // ]]
      PROC_INST: h++,
      // <?hi
      PROC_INST_BODY: h++,
      // <?hi there
      PROC_INST_ENDING: h++,
      // <?hi "there" ?
      OPEN_TAG: h++,
      // <strong
      OPEN_TAG_SLASH: h++,
      // <strong /
      ATTRIB: h++,
      // <a
      ATTRIB_NAME: h++,
      // <a foo
      ATTRIB_NAME_SAW_WHITE: h++,
      // <a foo _
      ATTRIB_VALUE: h++,
      // <a foo=
      ATTRIB_VALUE_QUOTED: h++,
      // <a foo="bar
      ATTRIB_VALUE_CLOSED: h++,
      // <a foo="bar"
      ATTRIB_VALUE_UNQUOTED: h++,
      // <a foo=bar
      ATTRIB_VALUE_ENTITY_Q: h++,
      // <foo bar="&quot;"
      ATTRIB_VALUE_ENTITY_U: h++,
      // <foo bar=&quot
      CLOSE_TAG: h++,
      // </a
      CLOSE_TAG_SAW_WHITE: h++,
      // </a   >
      SCRIPT: h++,
      // <script> ...
      SCRIPT_ENDING: h++
      // <script> ... <
    }, n.XML_ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'"
    }, n.ENTITIES = {
      amp: "&",
      gt: ">",
      lt: "<",
      quot: '"',
      apos: "'",
      AElig: 198,
      Aacute: 193,
      Acirc: 194,
      Agrave: 192,
      Aring: 197,
      Atilde: 195,
      Auml: 196,
      Ccedil: 199,
      ETH: 208,
      Eacute: 201,
      Ecirc: 202,
      Egrave: 200,
      Euml: 203,
      Iacute: 205,
      Icirc: 206,
      Igrave: 204,
      Iuml: 207,
      Ntilde: 209,
      Oacute: 211,
      Ocirc: 212,
      Ograve: 210,
      Oslash: 216,
      Otilde: 213,
      Ouml: 214,
      THORN: 222,
      Uacute: 218,
      Ucirc: 219,
      Ugrave: 217,
      Uuml: 220,
      Yacute: 221,
      aacute: 225,
      acirc: 226,
      aelig: 230,
      agrave: 224,
      aring: 229,
      atilde: 227,
      auml: 228,
      ccedil: 231,
      eacute: 233,
      ecirc: 234,
      egrave: 232,
      eth: 240,
      euml: 235,
      iacute: 237,
      icirc: 238,
      igrave: 236,
      iuml: 239,
      ntilde: 241,
      oacute: 243,
      ocirc: 244,
      ograve: 242,
      oslash: 248,
      otilde: 245,
      ouml: 246,
      szlig: 223,
      thorn: 254,
      uacute: 250,
      ucirc: 251,
      ugrave: 249,
      uuml: 252,
      yacute: 253,
      yuml: 255,
      copy: 169,
      reg: 174,
      nbsp: 160,
      iexcl: 161,
      cent: 162,
      pound: 163,
      curren: 164,
      yen: 165,
      brvbar: 166,
      sect: 167,
      uml: 168,
      ordf: 170,
      laquo: 171,
      not: 172,
      shy: 173,
      macr: 175,
      deg: 176,
      plusmn: 177,
      sup1: 185,
      sup2: 178,
      sup3: 179,
      acute: 180,
      micro: 181,
      para: 182,
      middot: 183,
      cedil: 184,
      ordm: 186,
      raquo: 187,
      frac14: 188,
      frac12: 189,
      frac34: 190,
      iquest: 191,
      times: 215,
      divide: 247,
      OElig: 338,
      oelig: 339,
      Scaron: 352,
      scaron: 353,
      Yuml: 376,
      fnof: 402,
      circ: 710,
      tilde: 732,
      Alpha: 913,
      Beta: 914,
      Gamma: 915,
      Delta: 916,
      Epsilon: 917,
      Zeta: 918,
      Eta: 919,
      Theta: 920,
      Iota: 921,
      Kappa: 922,
      Lambda: 923,
      Mu: 924,
      Nu: 925,
      Xi: 926,
      Omicron: 927,
      Pi: 928,
      Rho: 929,
      Sigma: 931,
      Tau: 932,
      Upsilon: 933,
      Phi: 934,
      Chi: 935,
      Psi: 936,
      Omega: 937,
      alpha: 945,
      beta: 946,
      gamma: 947,
      delta: 948,
      epsilon: 949,
      zeta: 950,
      eta: 951,
      theta: 952,
      iota: 953,
      kappa: 954,
      lambda: 955,
      mu: 956,
      nu: 957,
      xi: 958,
      omicron: 959,
      pi: 960,
      rho: 961,
      sigmaf: 962,
      sigma: 963,
      tau: 964,
      upsilon: 965,
      phi: 966,
      chi: 967,
      psi: 968,
      omega: 969,
      thetasym: 977,
      upsih: 978,
      piv: 982,
      ensp: 8194,
      emsp: 8195,
      thinsp: 8201,
      zwnj: 8204,
      zwj: 8205,
      lrm: 8206,
      rlm: 8207,
      ndash: 8211,
      mdash: 8212,
      lsquo: 8216,
      rsquo: 8217,
      sbquo: 8218,
      ldquo: 8220,
      rdquo: 8221,
      bdquo: 8222,
      dagger: 8224,
      Dagger: 8225,
      bull: 8226,
      hellip: 8230,
      permil: 8240,
      prime: 8242,
      Prime: 8243,
      lsaquo: 8249,
      rsaquo: 8250,
      oline: 8254,
      frasl: 8260,
      euro: 8364,
      image: 8465,
      weierp: 8472,
      real: 8476,
      trade: 8482,
      alefsym: 8501,
      larr: 8592,
      uarr: 8593,
      rarr: 8594,
      darr: 8595,
      harr: 8596,
      crarr: 8629,
      lArr: 8656,
      uArr: 8657,
      rArr: 8658,
      dArr: 8659,
      hArr: 8660,
      forall: 8704,
      part: 8706,
      exist: 8707,
      empty: 8709,
      nabla: 8711,
      isin: 8712,
      notin: 8713,
      ni: 8715,
      prod: 8719,
      sum: 8721,
      minus: 8722,
      lowast: 8727,
      radic: 8730,
      prop: 8733,
      infin: 8734,
      ang: 8736,
      and: 8743,
      or: 8744,
      cap: 8745,
      cup: 8746,
      int: 8747,
      there4: 8756,
      sim: 8764,
      cong: 8773,
      asymp: 8776,
      ne: 8800,
      equiv: 8801,
      le: 8804,
      ge: 8805,
      sub: 8834,
      sup: 8835,
      nsub: 8836,
      sube: 8838,
      supe: 8839,
      oplus: 8853,
      otimes: 8855,
      perp: 8869,
      sdot: 8901,
      lceil: 8968,
      rceil: 8969,
      lfloor: 8970,
      rfloor: 8971,
      lang: 9001,
      rang: 9002,
      loz: 9674,
      spades: 9824,
      clubs: 9827,
      hearts: 9829,
      diams: 9830
    }, Object.keys(n.ENTITIES).forEach(function(u) {
      var r = n.ENTITIES[u], g = typeof r == "number" ? String.fromCharCode(r) : r;
      n.ENTITIES[u] = g;
    });
    for (var Et in n.STATE)
      n.STATE[n.STATE[Et]] = Et;
    h = n.STATE;
    function rt(u, r, g) {
      u[r] && u[r](g);
    }
    function q(u, r, g) {
      u.textNode && nt(u), rt(u, r, g);
    }
    function nt(u) {
      u.textNode = ut(u.opt, u.textNode), u.textNode && rt(u, "ontext", u.textNode), u.textNode = "";
    }
    function ut(u, r) {
      return u.trim && (r = r.trim()), u.normalize && (r = r.replace(/\s+/g, " ")), r;
    }
    function it(u, r) {
      return nt(u), u.trackPosition && (r += `
Line: ` + u.line + `
Column: ` + u.column + `
Char: ` + u.c), r = new Error(r), u.error = r, rt(u, "onerror", r), u;
    }
    function mt(u) {
      return u.sawRoot && !u.closedRoot && R(u, "Unclosed root tag"), u.state !== h.BEGIN && u.state !== h.BEGIN_WHITESPACE && u.state !== h.TEXT && it(u, "Unexpected end"), nt(u), u.c = "", u.closed = !0, rt(u, "onend"), E.call(u, u.strict, u.opt), u;
    }
    function R(u, r) {
      if (typeof u != "object" || !(u instanceof E))
        throw new Error("bad call to strictFail");
      u.strict && it(u, r);
    }
    function At(u) {
      u.strict || (u.tagName = u.tagName[u.looseCase]());
      var r = u.tags[u.tags.length - 1] || u, g = u.tag = { name: u.tagName, attributes: {} };
      u.opt.xmlns && (g.ns = r.ns), u.attribList.length = 0, q(u, "onopentagstart", g);
    }
    function ot(u, r) {
      var g = u.indexOf(":"), f = g < 0 ? ["", u] : u.split(":"), U = f[0], j = f[1];
      return r && u === "xmlns" && (U = "xmlns", j = ""), { prefix: U, local: j };
    }
    function st(u) {
      if (u.strict || (u.attribName = u.attribName[u.looseCase]()), u.attribList.indexOf(u.attribName) !== -1 || u.tag.attributes.hasOwnProperty(u.attribName)) {
        u.attribName = u.attribValue = "";
        return;
      }
      if (u.opt.xmlns) {
        var r = ot(u.attribName, !0), g = r.prefix, f = r.local;
        if (g === "xmlns")
          if (f === "xml" && u.attribValue !== F)
            R(
              u,
              "xml: prefix must be bound to " + F + `
Actual: ` + u.attribValue
            );
          else if (f === "xmlns" && u.attribValue !== _)
            R(
              u,
              "xmlns: prefix must be bound to " + _ + `
Actual: ` + u.attribValue
            );
          else {
            var U = u.tag, j = u.tags[u.tags.length - 1] || u;
            U.ns === j.ns && (U.ns = Object.create(j.ns)), U.ns[f] = u.attribValue;
          }
        u.attribList.push([u.attribName, u.attribValue]);
      } else
        u.tag.attributes[u.attribName] = u.attribValue, q(u, "onattribute", {
          name: u.attribName,
          value: u.attribValue
        });
      u.attribName = u.attribValue = "";
    }
    function P(u, r) {
      if (u.opt.xmlns) {
        var g = u.tag, f = ot(u.tagName);
        g.prefix = f.prefix, g.local = f.local, g.uri = g.ns[f.prefix] || "", g.prefix && !g.uri && (R(u, "Unbound namespace prefix: " + JSON.stringify(u.tagName)), g.uri = f.prefix);
        var U = u.tags[u.tags.length - 1] || u;
        g.ns && U.ns !== g.ns && Object.keys(g.ns).forEach(function(x) {
          q(u, "onopennamespace", {
            prefix: x,
            uri: g.ns[x]
          });
        });
        for (var j = 0, L = u.attribList.length; j < L; j++) {
          var Q = u.attribList[j], tt = Q[0], a = Q[1], t = ot(tt, !0), e = t.prefix, o = t.local, l = e === "" ? "" : g.ns[e] || "", d = {
            name: tt,
            value: a,
            prefix: e,
            local: o,
            uri: l
          };
          e && e !== "xmlns" && !l && (R(u, "Unbound namespace prefix: " + JSON.stringify(e)), d.uri = e), u.tag.attributes[tt] = d, q(u, "onattribute", d);
        }
        u.attribList.length = 0;
      }
      u.tag.isSelfClosing = !!r, u.sawRoot = !0, u.tags.push(u.tag), q(u, "onopentag", u.tag), r || (!u.noscript && u.tagName.toLowerCase() === "script" ? u.state = h.SCRIPT : u.state = h.TEXT, u.tag = null, u.tagName = ""), u.attribName = u.attribValue = "", u.attribList.length = 0;
    }
    function H(u) {
      if (!u.tagName) {
        R(u, "Weird empty close tag."), u.textNode += "</>", u.state = h.TEXT;
        return;
      }
      if (u.script) {
        if (u.tagName !== "script") {
          u.script += "</" + u.tagName + ">", u.tagName = "", u.state = h.SCRIPT;
          return;
        }
        q(u, "onscript", u.script), u.script = "";
      }
      var r = u.tags.length, g = u.tagName;
      u.strict || (g = g[u.looseCase]());
      for (var f = g; r--; ) {
        var U = u.tags[r];
        if (U.name !== f)
          R(u, "Unexpected close tag");
        else
          break;
      }
      if (r < 0) {
        R(u, "Unmatched closing tag: " + u.tagName), u.textNode += "</" + u.tagName + ">", u.state = h.TEXT;
        return;
      }
      u.tagName = g;
      for (var j = u.tags.length; j-- > r; ) {
        var L = u.tag = u.tags.pop();
        u.tagName = u.tag.name, q(u, "onclosetag", u.tagName);
        var Q = {};
        for (var tt in L.ns)
          Q[tt] = L.ns[tt];
        var a = u.tags[u.tags.length - 1] || u;
        u.opt.xmlns && L.ns !== a.ns && Object.keys(L.ns).forEach(function(t) {
          var e = L.ns[t];
          q(u, "onclosenamespace", { prefix: t, uri: e });
        });
      }
      r === 0 && (u.closedRoot = !0), u.tagName = u.attribValue = u.attribName = "", u.attribList.length = 0, u.state = h.TEXT;
    }
    function pt(u) {
      var r = u.entity, g = r.toLowerCase(), f, U = "";
      return u.ENTITIES[r] ? u.ENTITIES[r] : u.ENTITIES[g] ? u.ENTITIES[g] : (r = g, r.charAt(0) === "#" && (r.charAt(1) === "x" ? (r = r.slice(2), f = parseInt(r, 16), U = f.toString(16)) : (r = r.slice(1), f = parseInt(r, 10), U = f.toString(10))), r = r.replace(/^0+/, ""), isNaN(f) || U.toLowerCase() !== r ? (R(u, "Invalid character entity"), "&" + u.entity + ";") : String.fromCodePoint(f));
    }
    function ct(u, r) {
      r === "<" ? (u.state = h.OPEN_WAKA, u.startTagPosition = u.position) : b(r) || (R(u, "Non-whitespace before first tag."), u.textNode = r, u.state = h.TEXT);
    }
    function ft(u, r) {
      var g = "";
      return r < u.length && (g = u.charAt(r)), g;
    }
    function Ft(u) {
      var r = this;
      if (this.error)
        throw this.error;
      if (r.closed)
        return it(
          r,
          "Cannot write after close. Assign an onready handler."
        );
      if (u === null)
        return mt(r);
      typeof u == "object" && (u = u.toString());
      for (var g = 0, f = ""; f = ft(u, g++), r.c = f, !!f; )
        switch (r.trackPosition && (r.position++, f === `
` ? (r.line++, r.column = 0) : r.column++), r.state) {
          case h.BEGIN:
            if (r.state = h.BEGIN_WHITESPACE, f === "\uFEFF")
              continue;
            ct(r, f);
            continue;
          case h.BEGIN_WHITESPACE:
            ct(r, f);
            continue;
          case h.TEXT:
            if (r.sawRoot && !r.closedRoot) {
              for (var U = g - 1; f && f !== "<" && f !== "&"; )
                f = ft(u, g++), f && r.trackPosition && (r.position++, f === `
` ? (r.line++, r.column = 0) : r.column++);
              r.textNode += u.substring(U, g - 1);
            }
            f === "<" && !(r.sawRoot && r.closedRoot && !r.strict) ? (r.state = h.OPEN_WAKA, r.startTagPosition = r.position) : (!b(f) && (!r.sawRoot || r.closedRoot) && R(r, "Text data outside of root node."), f === "&" ? r.state = h.TEXT_ENTITY : r.textNode += f);
            continue;
          case h.SCRIPT:
            f === "<" ? r.state = h.SCRIPT_ENDING : r.script += f;
            continue;
          case h.SCRIPT_ENDING:
            f === "/" ? r.state = h.CLOSE_TAG : (r.script += "<" + f, r.state = h.SCRIPT);
            continue;
          case h.OPEN_WAKA:
            if (f === "!")
              r.state = h.SGML_DECL, r.sgmlDecl = "";
            else if (!b(f))
              if (Z(G, f))
                r.state = h.OPEN_TAG, r.tagName = f;
              else if (f === "/")
                r.state = h.CLOSE_TAG, r.tagName = "";
              else if (f === "?")
                r.state = h.PROC_INST, r.procInstName = r.procInstBody = "";
              else {
                if (R(r, "Unencoded <"), r.startTagPosition + 1 < r.position) {
                  var j = r.position - r.startTagPosition;
                  f = new Array(j).join(" ") + f;
                }
                r.textNode += "<" + f, r.state = h.TEXT;
              }
            continue;
          case h.SGML_DECL:
            (r.sgmlDecl + f).toUpperCase() === B ? (q(r, "onopencdata"), r.state = h.CDATA, r.sgmlDecl = "", r.cdata = "") : r.sgmlDecl + f === "--" ? (r.state = h.COMMENT, r.comment = "", r.sgmlDecl = "") : (r.sgmlDecl + f).toUpperCase() === W ? (r.state = h.DOCTYPE, (r.doctype || r.sawRoot) && R(
              r,
              "Inappropriately located doctype declaration"
            ), r.doctype = "", r.sgmlDecl = "") : f === ">" ? (q(r, "onsgmldeclaration", r.sgmlDecl), r.sgmlDecl = "", r.state = h.TEXT) : (I(f) && (r.state = h.SGML_DECL_QUOTED), r.sgmlDecl += f);
            continue;
          case h.SGML_DECL_QUOTED:
            f === r.q && (r.state = h.SGML_DECL, r.q = ""), r.sgmlDecl += f;
            continue;
          case h.DOCTYPE:
            f === ">" ? (r.state = h.TEXT, q(r, "ondoctype", r.doctype), r.doctype = !0) : (r.doctype += f, f === "[" ? r.state = h.DOCTYPE_DTD : I(f) && (r.state = h.DOCTYPE_QUOTED, r.q = f));
            continue;
          case h.DOCTYPE_QUOTED:
            r.doctype += f, f === r.q && (r.q = "", r.state = h.DOCTYPE);
            continue;
          case h.DOCTYPE_DTD:
            r.doctype += f, f === "]" ? r.state = h.DOCTYPE : I(f) && (r.state = h.DOCTYPE_DTD_QUOTED, r.q = f);
            continue;
          case h.DOCTYPE_DTD_QUOTED:
            r.doctype += f, f === r.q && (r.state = h.DOCTYPE_DTD, r.q = "");
            continue;
          case h.COMMENT:
            f === "-" ? r.state = h.COMMENT_ENDING : r.comment += f;
            continue;
          case h.COMMENT_ENDING:
            f === "-" ? (r.state = h.COMMENT_ENDED, r.comment = ut(r.opt, r.comment), r.comment && q(r, "oncomment", r.comment), r.comment = "") : (r.comment += "-" + f, r.state = h.COMMENT);
            continue;
          case h.COMMENT_ENDED:
            f !== ">" ? (R(r, "Malformed comment"), r.comment += "--" + f, r.state = h.COMMENT) : r.state = h.TEXT;
            continue;
          case h.CDATA:
            f === "]" ? r.state = h.CDATA_ENDING : r.cdata += f;
            continue;
          case h.CDATA_ENDING:
            f === "]" ? r.state = h.CDATA_ENDING_2 : (r.cdata += "]" + f, r.state = h.CDATA);
            continue;
          case h.CDATA_ENDING_2:
            f === ">" ? (r.cdata && q(r, "oncdata", r.cdata), q(r, "onclosecdata"), r.cdata = "", r.state = h.TEXT) : f === "]" ? r.cdata += "]" : (r.cdata += "]]" + f, r.state = h.CDATA);
            continue;
          case h.PROC_INST:
            f === "?" ? r.state = h.PROC_INST_ENDING : b(f) ? r.state = h.PROC_INST_BODY : r.procInstName += f;
            continue;
          case h.PROC_INST_BODY:
            if (!r.procInstBody && b(f))
              continue;
            f === "?" ? r.state = h.PROC_INST_ENDING : r.procInstBody += f;
            continue;
          case h.PROC_INST_ENDING:
            f === ">" ? (q(r, "onprocessinginstruction", {
              name: r.procInstName,
              body: r.procInstBody
            }), r.procInstName = r.procInstBody = "", r.state = h.TEXT) : (r.procInstBody += "?" + f, r.state = h.PROC_INST_BODY);
            continue;
          case h.OPEN_TAG:
            Z(p, f) ? r.tagName += f : (At(r), f === ">" ? P(r) : f === "/" ? r.state = h.OPEN_TAG_SLASH : (b(f) || R(r, "Invalid character in tag name"), r.state = h.ATTRIB));
            continue;
          case h.OPEN_TAG_SLASH:
            f === ">" ? (P(r, !0), H(r)) : (R(r, "Forward-slash in opening tag not followed by >"), r.state = h.ATTRIB);
            continue;
          case h.ATTRIB:
            if (b(f))
              continue;
            f === ">" ? P(r) : f === "/" ? r.state = h.OPEN_TAG_SLASH : Z(G, f) ? (r.attribName = f, r.attribValue = "", r.state = h.ATTRIB_NAME) : R(r, "Invalid attribute name");
            continue;
          case h.ATTRIB_NAME:
            f === "=" ? r.state = h.ATTRIB_VALUE : f === ">" ? (R(r, "Attribute without value"), r.attribValue = r.attribName, st(r), P(r)) : b(f) ? r.state = h.ATTRIB_NAME_SAW_WHITE : Z(p, f) ? r.attribName += f : R(r, "Invalid attribute name");
            continue;
          case h.ATTRIB_NAME_SAW_WHITE:
            if (f === "=")
              r.state = h.ATTRIB_VALUE;
            else {
              if (b(f))
                continue;
              R(r, "Attribute without value"), r.tag.attributes[r.attribName] = "", r.attribValue = "", q(r, "onattribute", {
                name: r.attribName,
                value: ""
              }), r.attribName = "", f === ">" ? P(r) : Z(G, f) ? (r.attribName = f, r.state = h.ATTRIB_NAME) : (R(r, "Invalid attribute name"), r.state = h.ATTRIB);
            }
            continue;
          case h.ATTRIB_VALUE:
            if (b(f))
              continue;
            I(f) ? (r.q = f, r.state = h.ATTRIB_VALUE_QUOTED) : (R(r, "Unquoted attribute value"), r.state = h.ATTRIB_VALUE_UNQUOTED, r.attribValue = f);
            continue;
          case h.ATTRIB_VALUE_QUOTED:
            if (f !== r.q) {
              f === "&" ? r.state = h.ATTRIB_VALUE_ENTITY_Q : r.attribValue += f;
              continue;
            }
            st(r), r.q = "", r.state = h.ATTRIB_VALUE_CLOSED;
            continue;
          case h.ATTRIB_VALUE_CLOSED:
            b(f) ? r.state = h.ATTRIB : f === ">" ? P(r) : f === "/" ? r.state = h.OPEN_TAG_SLASH : Z(G, f) ? (R(r, "No whitespace between attributes"), r.attribName = f, r.attribValue = "", r.state = h.ATTRIB_NAME) : R(r, "Invalid attribute name");
            continue;
          case h.ATTRIB_VALUE_UNQUOTED:
            if (!yt(f)) {
              f === "&" ? r.state = h.ATTRIB_VALUE_ENTITY_U : r.attribValue += f;
              continue;
            }
            st(r), f === ">" ? P(r) : r.state = h.ATTRIB;
            continue;
          case h.CLOSE_TAG:
            if (r.tagName)
              f === ">" ? H(r) : Z(p, f) ? r.tagName += f : r.script ? (r.script += "</" + r.tagName, r.tagName = "", r.state = h.SCRIPT) : (b(f) || R(r, "Invalid tagname in closing tag"), r.state = h.CLOSE_TAG_SAW_WHITE);
            else {
              if (b(f))
                continue;
              wt(G, f) ? r.script ? (r.script += "</" + f, r.state = h.SCRIPT) : R(r, "Invalid tagname in closing tag.") : r.tagName = f;
            }
            continue;
          case h.CLOSE_TAG_SAW_WHITE:
            if (b(f))
              continue;
            f === ">" ? H(r) : R(r, "Invalid characters in closing tag");
            continue;
          case h.TEXT_ENTITY:
          case h.ATTRIB_VALUE_ENTITY_Q:
          case h.ATTRIB_VALUE_ENTITY_U:
            var L, Q;
            switch (r.state) {
              case h.TEXT_ENTITY:
                L = h.TEXT, Q = "textNode";
                break;
              case h.ATTRIB_VALUE_ENTITY_Q:
                L = h.ATTRIB_VALUE_QUOTED, Q = "attribValue";
                break;
              case h.ATTRIB_VALUE_ENTITY_U:
                L = h.ATTRIB_VALUE_UNQUOTED, Q = "attribValue";
                break;
            }
            f === ";" ? (r[Q] += pt(r), r.entity = "", r.state = L) : Z(r.entity.length ? N : A, f) ? r.entity += f : (R(r, "Invalid character in entity name"), r[Q] += "&" + r.entity + f, r.entity = "", r.state = L);
            continue;
          default:
            throw new Error(r, "Unknown state: " + r.state);
        }
      return r.position >= r.bufferCheckPosition && m(r), r;
    }
    /*! http://mths.be/fromcodepoint v0.1.0 by @mathias */
    String.fromCodePoint || function() {
      var u = String.fromCharCode, r = Math.floor, g = function() {
        var f = 16384, U = [], j, L, Q = -1, tt = arguments.length;
        if (!tt)
          return "";
        for (var a = ""; ++Q < tt; ) {
          var t = Number(arguments[Q]);
          if (!isFinite(t) || // `NaN`, `+Infinity`, or `-Infinity`
          t < 0 || // not a valid Unicode code point
          t > 1114111 || // not a valid Unicode code point
          r(t) !== t)
            throw RangeError("Invalid code point: " + t);
          t <= 65535 ? U.push(t) : (t -= 65536, j = (t >> 10) + 55296, L = t % 1024 + 56320, U.push(j, L)), (Q + 1 === tt || U.length > f) && (a += u.apply(null, U), U.length = 0);
        }
        return a;
      };
      Object.defineProperty ? Object.defineProperty(String, "fromCodePoint", {
        value: g,
        configurable: !0,
        writable: !0
      }) : String.fromCodePoint = g;
    }();
  })(i);
})(Gt);
var Ct = {
  isArray: function(i) {
    return Array.isArray ? Array.isArray(i) : Object.prototype.toString.call(i) === "[object Array]";
  }
}, se = Ct.isArray, bt = {
  copyOptions: function(i) {
    var n, s = {};
    for (n in i)
      i.hasOwnProperty(n) && (s[n] = i[n]);
    return s;
  },
  ensureFlagExists: function(i, n) {
    (!(i in n) || typeof n[i] != "boolean") && (n[i] = !1);
  },
  ensureSpacesExists: function(i) {
    (!("spaces" in i) || typeof i.spaces != "number" && typeof i.spaces != "string") && (i.spaces = 0);
  },
  ensureAlwaysArrayExists: function(i) {
    (!("alwaysArray" in i) || typeof i.alwaysArray != "boolean" && !se(i.alwaysArray)) && (i.alwaysArray = !1);
  },
  ensureKeyExists: function(i, n) {
    (!(i + "Key" in n) || typeof n[i + "Key"] != "string") && (n[i + "Key"] = n.compact ? "_" + i : i);
  },
  checkFnExists: function(i, n) {
    return i + "Fn" in n;
  }
}, ce = Gt, K = bt, at = Ct.isArray, y, v;
function fe(i) {
  return y = K.copyOptions(i), K.ensureFlagExists("ignoreDeclaration", y), K.ensureFlagExists("ignoreInstruction", y), K.ensureFlagExists("ignoreAttributes", y), K.ensureFlagExists("ignoreText", y), K.ensureFlagExists("ignoreComment", y), K.ensureFlagExists("ignoreCdata", y), K.ensureFlagExists("ignoreDoctype", y), K.ensureFlagExists("compact", y), K.ensureFlagExists("alwaysChildren", y), K.ensureFlagExists("addParent", y), K.ensureFlagExists("trim", y), K.ensureFlagExists("nativeType", y), K.ensureFlagExists("nativeTypeAttributes", y), K.ensureFlagExists("sanitize", y), K.ensureFlagExists("instructionHasAttributes", y), K.ensureFlagExists("captureSpacesBetweenElements", y), K.ensureAlwaysArrayExists(y), K.ensureKeyExists("declaration", y), K.ensureKeyExists("instruction", y), K.ensureKeyExists("attributes", y), K.ensureKeyExists("text", y), K.ensureKeyExists("comment", y), K.ensureKeyExists("cdata", y), K.ensureKeyExists("doctype", y), K.ensureKeyExists("type", y), K.ensureKeyExists("name", y), K.ensureKeyExists("elements", y), K.ensureKeyExists("parent", y), y;
}
function Vt(i) {
  var n = Number(i);
  if (!isNaN(n))
    return n;
  var s = i.toLowerCase();
  return s === "true" ? !0 : s === "false" ? !1 : i;
}
function ht(i, n) {
  var s;
  if (y.compact) {
    if (!v[y[i + "Key"]] && (at(y.alwaysArray) ? y.alwaysArray.indexOf(y[i + "Key"]) !== -1 : y.alwaysArray) && (v[y[i + "Key"]] = []), v[y[i + "Key"]] && !at(v[y[i + "Key"]]) && (v[y[i + "Key"]] = [v[y[i + "Key"]]]), i + "Fn" in y && typeof n == "string" && (n = y[i + "Fn"](n, v)), i === "instruction" && ("instructionFn" in y || "instructionNameFn" in y)) {
      for (s in n)
        if (n.hasOwnProperty(s))
          if ("instructionFn" in y)
            n[s] = y.instructionFn(n[s], s, v);
          else {
            var E = n[s];
            delete n[s], n[y.instructionNameFn(s, E, v)] = E;
          }
    }
    at(v[y[i + "Key"]]) ? v[y[i + "Key"]].push(n) : v[y[i + "Key"]] = n;
  } else {
    v[y.elementsKey] || (v[y.elementsKey] = []);
    var m = {};
    if (m[y.typeKey] = i, i === "instruction") {
      for (s in n)
        if (n.hasOwnProperty(s))
          break;
      m[y.nameKey] = "instructionNameFn" in y ? y.instructionNameFn(s, n, v) : s, y.instructionHasAttributes ? (m[y.attributesKey] = n[s][y.attributesKey], "instructionFn" in y && (m[y.attributesKey] = y.instructionFn(m[y.attributesKey], s, v))) : ("instructionFn" in y && (n[s] = y.instructionFn(n[s], s, v)), m[y.instructionKey] = n[s]);
    } else
      i + "Fn" in y && (n = y[i + "Fn"](n, v)), m[y[i + "Key"]] = n;
    y.addParent && (m[y.parentKey] = v), v[y.elementsKey].push(m);
  }
}
function jt(i) {
  if ("attributesFn" in y && i && (i = y.attributesFn(i, v)), (y.trim || "attributeValueFn" in y || "attributeNameFn" in y || y.nativeTypeAttributes) && i) {
    var n;
    for (n in i)
      if (i.hasOwnProperty(n) && (y.trim && (i[n] = i[n].trim()), y.nativeTypeAttributes && (i[n] = Vt(i[n])), "attributeValueFn" in y && (i[n] = y.attributeValueFn(i[n], n, v)), "attributeNameFn" in y)) {
        var s = i[n];
        delete i[n], i[y.attributeNameFn(n, i[n], v)] = s;
      }
  }
  return i;
}
function le(i) {
  var n = {};
  if (i.body && (i.name.toLowerCase() === "xml" || y.instructionHasAttributes)) {
    for (var s = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\w+))\s*/g, E; (E = s.exec(i.body)) !== null; )
      n[E[1]] = E[2] || E[3] || E[4];
    n = jt(n);
  }
  if (i.name.toLowerCase() === "xml") {
    if (y.ignoreDeclaration)
      return;
    v[y.declarationKey] = {}, Object.keys(n).length && (v[y.declarationKey][y.attributesKey] = n), y.addParent && (v[y.declarationKey][y.parentKey] = v);
  } else {
    if (y.ignoreInstruction)
      return;
    y.trim && (i.body = i.body.trim());
    var m = {};
    y.instructionHasAttributes && Object.keys(n).length ? (m[i.name] = {}, m[i.name][y.attributesKey] = n) : m[i.name] = i.body, ht("instruction", m);
  }
}
function he(i, n) {
  var s;
  if (typeof i == "object" && (n = i.attributes, i = i.name), n = jt(n), "elementNameFn" in y && (i = y.elementNameFn(i, v)), y.compact) {
    if (s = {}, !y.ignoreAttributes && n && Object.keys(n).length) {
      s[y.attributesKey] = {};
      var E;
      for (E in n)
        n.hasOwnProperty(E) && (s[y.attributesKey][E] = n[E]);
    }
    !(i in v) && (at(y.alwaysArray) ? y.alwaysArray.indexOf(i) !== -1 : y.alwaysArray) && (v[i] = []), v[i] && !at(v[i]) && (v[i] = [v[i]]), at(v[i]) ? v[i].push(s) : v[i] = s;
  } else
    v[y.elementsKey] || (v[y.elementsKey] = []), s = {}, s[y.typeKey] = "element", s[y.nameKey] = i, !y.ignoreAttributes && n && Object.keys(n).length && (s[y.attributesKey] = n), y.alwaysChildren && (s[y.elementsKey] = []), v[y.elementsKey].push(s);
  s[y.parentKey] = v, v = s;
}
function ye(i) {
  y.ignoreText || !i.trim() && !y.captureSpacesBetweenElements || (y.trim && (i = i.trim()), y.nativeType && (i = Vt(i)), y.sanitize && (i = i.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")), ht("text", i));
}
function Ee(i) {
  y.ignoreComment || (y.trim && (i = i.trim()), ht("comment", i));
}
function me(i) {
  var n = v[y.parentKey];
  y.addParent || delete v[y.parentKey], v = n;
}
function pe(i) {
  y.ignoreCdata || (y.trim && (i = i.trim()), ht("cdata", i));
}
function ge(i) {
  y.ignoreDoctype || (i = i.replace(/^ /, ""), y.trim && (i = i.trim()), ht("doctype", i));
}
function Te(i) {
  i.note = i;
}
var Yt = function(i, n) {
  var s = ce.parser(!0, {}), E = {};
  if (v = E, y = fe(n), s.opt = { strictEntities: !0 }, s.onopentag = he, s.ontext = ye, s.oncomment = Ee, s.onclosetag = me, s.onerror = Te, s.oncdata = pe, s.ondoctype = ge, s.onprocessinginstruction = le, s.write(i).close(), E[y.elementsKey]) {
    var m = E[y.elementsKey];
    delete E[y.elementsKey], E[y.elementsKey] = m, delete E.text;
  }
  return E;
}, kt = bt, de = Yt;
function xe(i) {
  var n = kt.copyOptions(i);
  return kt.ensureSpacesExists(n), n;
}
var we = function(i, n) {
  var s, E, m, w;
  return s = xe(n), E = de(i, s), w = "compact" in s && s.compact ? "_parent" : "parent", "addParent" in s && s.addParent ? m = JSON.stringify(E, function(T, c) {
    return T === w ? "_" : c;
  }, s.spaces) : m = JSON.stringify(E, null, s.spaces), m.replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
}, k = bt, Ae = Ct.isArray, z, J;
function Fe(i) {
  var n = k.copyOptions(i);
  return k.ensureFlagExists("ignoreDeclaration", n), k.ensureFlagExists("ignoreInstruction", n), k.ensureFlagExists("ignoreAttributes", n), k.ensureFlagExists("ignoreText", n), k.ensureFlagExists("ignoreComment", n), k.ensureFlagExists("ignoreCdata", n), k.ensureFlagExists("ignoreDoctype", n), k.ensureFlagExists("compact", n), k.ensureFlagExists("indentText", n), k.ensureFlagExists("indentCdata", n), k.ensureFlagExists("indentAttributes", n), k.ensureFlagExists("indentInstruction", n), k.ensureFlagExists("fullTagEmptyElement", n), k.ensureFlagExists("noQuotesForNativeAttributes", n), k.ensureSpacesExists(n), typeof n.spaces == "number" && (n.spaces = Array(n.spaces + 1).join(" ")), k.ensureKeyExists("declaration", n), k.ensureKeyExists("instruction", n), k.ensureKeyExists("attributes", n), k.ensureKeyExists("text", n), k.ensureKeyExists("comment", n), k.ensureKeyExists("cdata", n), k.ensureKeyExists("doctype", n), k.ensureKeyExists("type", n), k.ensureKeyExists("name", n), k.ensureKeyExists("elements", n), n;
}
function et(i, n, s) {
  return (!s && i.spaces ? `
` : "") + Array(n + 1).join(i.spaces);
}
function xt(i, n, s) {
  if (n.ignoreAttributes)
    return "";
  "attributesFn" in n && (i = n.attributesFn(i, J, z));
  var E, m, w, T, c = [];
  for (E in i)
    i.hasOwnProperty(E) && i[E] !== null && i[E] !== void 0 && (T = n.noQuotesForNativeAttributes && typeof i[E] != "string" ? "" : '"', m = "" + i[E], m = m.replace(/"/g, "&quot;"), w = "attributeNameFn" in n ? n.attributeNameFn(E, m, J, z) : E, c.push(n.spaces && n.indentAttributes ? et(n, s + 1, !1) : " "), c.push(w + "=" + T + ("attributeValueFn" in n ? n.attributeValueFn(m, E, J, z) : m) + T));
  return i && Object.keys(i).length && n.spaces && n.indentAttributes && c.push(et(n, s, !1)), c.join("");
}
function qt(i, n, s) {
  return z = i, J = "xml", n.ignoreDeclaration ? "" : "<?xml" + xt(i[n.attributesKey], n, s) + "?>";
}
function Xt(i, n, s) {
  if (n.ignoreInstruction)
    return "";
  var E;
  for (E in i)
    if (i.hasOwnProperty(E))
      break;
  var m = "instructionNameFn" in n ? n.instructionNameFn(E, i[E], J, z) : E;
  if (typeof i[E] == "object")
    return z = i, J = m, "<?" + m + xt(i[E][n.attributesKey], n, s) + "?>";
  var w = i[E] ? i[E] : "";
  return "instructionFn" in n && (w = n.instructionFn(w, E, J, z)), "<?" + m + (w ? " " + w : "") + "?>";
}
function Wt(i, n) {
  return n.ignoreComment ? "" : "<!--" + ("commentFn" in n ? n.commentFn(i, J, z) : i) + "-->";
}
function Ht(i, n) {
  return n.ignoreCdata ? "" : "<![CDATA[" + ("cdataFn" in n ? n.cdataFn(i, J, z) : i.replace("]]>", "]]]]><![CDATA[>")) + "]]>";
}
function Qt(i, n) {
  return n.ignoreDoctype ? "" : "<!DOCTYPE " + ("doctypeFn" in n ? n.doctypeFn(i, J, z) : i) + ">";
}
function Bt(i, n) {
  return n.ignoreText ? "" : (i = "" + i, i = i.replace(/&amp;/g, "&"), i = i.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"), "textFn" in n ? n.textFn(i, J, z) : i);
}
function Ne(i, n) {
  var s;
  if (i.elements && i.elements.length)
    for (s = 0; s < i.elements.length; ++s)
      switch (i.elements[s][n.typeKey]) {
        case "text":
          if (n.indentText)
            return !0;
          break;
        case "cdata":
          if (n.indentCdata)
            return !0;
          break;
        case "instruction":
          if (n.indentInstruction)
            return !0;
          break;
        case "doctype":
        case "comment":
        case "element":
          return !0;
        default:
          return !0;
      }
  return !1;
}
function ve(i, n, s) {
  z = i, J = i.name;
  var E = [], m = "elementNameFn" in n ? n.elementNameFn(i.name, i) : i.name;
  E.push("<" + m), i[n.attributesKey] && E.push(xt(i[n.attributesKey], n, s));
  var w = i[n.elementsKey] && i[n.elementsKey].length || i[n.attributesKey] && i[n.attributesKey]["xml:space"] === "preserve";
  return w || ("fullTagEmptyElementFn" in n ? w = n.fullTagEmptyElementFn(i.name, i) : w = n.fullTagEmptyElement), w ? (E.push(">"), i[n.elementsKey] && i[n.elementsKey].length && (E.push($t(i[n.elementsKey], n, s + 1)), z = i, J = i.name), E.push(n.spaces && Ne(i, n) ? `
` + Array(s + 1).join(n.spaces) : ""), E.push("</" + m + ">")) : E.push("/>"), E.join("");
}
function $t(i, n, s, E) {
  return i.reduce(function(m, w) {
    var T = et(n, s, E && !m);
    switch (w.type) {
      case "element":
        return m + T + ve(w, n, s);
      case "comment":
        return m + T + Wt(w[n.commentKey], n);
      case "doctype":
        return m + T + Qt(w[n.doctypeKey], n);
      case "cdata":
        return m + (n.indentCdata ? T : "") + Ht(w[n.cdataKey], n);
      case "text":
        return m + (n.indentText ? T : "") + Bt(w[n.textKey], n);
      case "instruction":
        var c = {};
        return c[w[n.nameKey]] = w[n.attributesKey] ? w : w[n.instructionKey], m + (n.indentInstruction ? T : "") + Xt(c, n, s);
    }
  }, "");
}
function zt(i, n, s) {
  var E;
  for (E in i)
    if (i.hasOwnProperty(E))
      switch (E) {
        case n.parentKey:
        case n.attributesKey:
          break;
        case n.textKey:
          if (n.indentText || s)
            return !0;
          break;
        case n.cdataKey:
          if (n.indentCdata || s)
            return !0;
          break;
        case n.instructionKey:
          if (n.indentInstruction || s)
            return !0;
          break;
        case n.doctypeKey:
        case n.commentKey:
          return !0;
        default:
          return !0;
      }
  return !1;
}
function Ie(i, n, s, E, m) {
  z = i, J = n;
  var w = "elementNameFn" in s ? s.elementNameFn(n, i) : n;
  if (typeof i > "u" || i === null || i === "")
    return "fullTagEmptyElementFn" in s && s.fullTagEmptyElementFn(n, i) || s.fullTagEmptyElement ? "<" + w + "></" + w + ">" : "<" + w + "/>";
  var T = [];
  if (n) {
    if (T.push("<" + w), typeof i != "object")
      return T.push(">" + Bt(i, s) + "</" + w + ">"), T.join("");
    i[s.attributesKey] && T.push(xt(i[s.attributesKey], s, E));
    var c = zt(i, s, !0) || i[s.attributesKey] && i[s.attributesKey]["xml:space"] === "preserve";
    if (c || ("fullTagEmptyElementFn" in s ? c = s.fullTagEmptyElementFn(n, i) : c = s.fullTagEmptyElement), c)
      T.push(">");
    else
      return T.push("/>"), T.join("");
  }
  return T.push(Jt(i, s, E + 1, !1)), z = i, J = n, n && T.push((m ? et(s, E, !1) : "") + "</" + w + ">"), T.join("");
}
function Jt(i, n, s, E) {
  var m, w, T, c = [];
  for (w in i)
    if (i.hasOwnProperty(w))
      for (T = Ae(i[w]) ? i[w] : [i[w]], m = 0; m < T.length; ++m) {
        switch (w) {
          case n.declarationKey:
            c.push(qt(T[m], n, s));
            break;
          case n.instructionKey:
            c.push((n.indentInstruction ? et(n, s, E) : "") + Xt(T[m], n, s));
            break;
          case n.attributesKey:
          case n.parentKey:
            break;
          case n.textKey:
            c.push((n.indentText ? et(n, s, E) : "") + Bt(T[m], n));
            break;
          case n.cdataKey:
            c.push((n.indentCdata ? et(n, s, E) : "") + Ht(T[m], n));
            break;
          case n.doctypeKey:
            c.push(et(n, s, E) + Qt(T[m], n));
            break;
          case n.commentKey:
            c.push(et(n, s, E) + Wt(T[m], n));
            break;
          default:
            c.push(et(n, s, E) + Ie(T[m], w, n, s, zt(T[m], n)));
        }
        E = E && !c.length;
      }
  return c.join("");
}
var Zt = function(i, n) {
  n = Fe(n);
  var s = [];
  return z = i, J = "_root_", n.compact ? s.push(Jt(i, n, 0, !0)) : (i[n.declarationKey] && s.push(qt(i[n.declarationKey], n, 0)), i[n.elementsKey] && i[n.elementsKey].length && s.push($t(i[n.elementsKey], n, 0, !s.length))), s.join("");
}, _e = Zt, Ce = function(i, n) {
  i instanceof Buffer && (i = i.toString());
  var s = null;
  if (typeof i == "string")
    try {
      s = JSON.parse(i);
    } catch {
      throw new Error("The JSON structure is invalid");
    }
  else
    s = i;
  return _e(s, n);
}, be = Yt, Be = we, De = Zt, Se = Ce, te = {
  xml2js: be,
  xml2json: Be,
  js2xml: De,
  json2xml: Se
};
const Ue = te.js2xml, Oe = te.xml2js;
export {
  Ue as js2xml,
  Oe as xml2js
};
//# sourceMappingURL=index.js.mjs.map
