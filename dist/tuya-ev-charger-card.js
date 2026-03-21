// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t3, e4, o5) {
    if (this._$cssResult$ = true, o5 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t3, this.t = e4;
  }
  get styleSheet() {
    let t3 = this.o;
    const s4 = this.t;
    if (e && void 0 === t3) {
      const e4 = void 0 !== s4 && 1 === s4.length;
      e4 && (t3 = o.get(s4)), void 0 === t3 && ((this.o = t3 = new CSSStyleSheet()).replaceSync(this.cssText), e4 && o.set(s4, t3));
    }
    return t3;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t3) => new n("string" == typeof t3 ? t3 : t3 + "", void 0, s);
var i = (t3, ...e4) => {
  const o5 = 1 === t3.length ? t3[0] : e4.reduce((e5, s4, o6) => e5 + ((t4) => {
    if (true === t4._$cssResult$) return t4.cssText;
    if ("number" == typeof t4) return t4;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t4 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t3[o6 + 1], t3[0]);
  return new n(o5, t3, s);
};
var S = (s4, o5) => {
  if (e) s4.adoptedStyleSheets = o5.map((t3) => t3 instanceof CSSStyleSheet ? t3 : t3.styleSheet);
  else for (const e4 of o5) {
    const o6 = document.createElement("style"), n4 = t.litNonce;
    void 0 !== n4 && o6.setAttribute("nonce", n4), o6.textContent = e4.cssText, s4.appendChild(o6);
  }
};
var c = e ? (t3) => t3 : (t3) => t3 instanceof CSSStyleSheet ? ((t4) => {
  let e4 = "";
  for (const s4 of t4.cssRules) e4 += s4.cssText;
  return r(e4);
})(t3) : t3;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t3, s4) => t3;
var u = { toAttribute(t3, s4) {
  switch (s4) {
    case Boolean:
      t3 = t3 ? l : null;
      break;
    case Object:
    case Array:
      t3 = null == t3 ? t3 : JSON.stringify(t3);
  }
  return t3;
}, fromAttribute(t3, s4) {
  let i5 = t3;
  switch (s4) {
    case Boolean:
      i5 = null !== t3;
      break;
    case Number:
      i5 = null === t3 ? null : Number(t3);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t3);
      } catch (t4) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t3, s4) => !i2(t3, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t3) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t3);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t3, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t3) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t3, s4), !s4.noAccessor) {
      const i5 = Symbol(), h3 = this.getPropertyDescriptor(t3, i5, s4);
      void 0 !== h3 && e2(this.prototype, t3, h3);
    }
  }
  static getPropertyDescriptor(t3, s4, i5) {
    const { get: e4, set: r4 } = h(this.prototype, t3) ?? { get() {
      return this[s4];
    }, set(t4) {
      this[s4] = t4;
    } };
    return { get: e4, set(s5) {
      const h3 = e4?.call(this);
      r4?.call(this, s5), this.requestUpdate(t3, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t3) {
    return this.elementProperties.get(t3) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t3 = n2(this);
    t3.finalize(), void 0 !== t3.l && (this.l = [...t3.l]), this.elementProperties = new Map(t3.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t4 = this.properties, s4 = [...r2(t4), ...o2(t4)];
      for (const i5 of s4) this.createProperty(i5, t4[i5]);
    }
    const t3 = this[Symbol.metadata];
    if (null !== t3) {
      const s4 = litPropertyMetadata.get(t3);
      if (void 0 !== s4) for (const [t4, i5] of s4) this.elementProperties.set(t4, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t4, s4] of this.elementProperties) {
      const i5 = this._$Eu(t4, s4);
      void 0 !== i5 && this._$Eh.set(i5, t4);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e4 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e4) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t3, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t3 ? t3.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t3) => this.enableUpdating = t3), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t3) => t3(this));
  }
  addController(t3) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t3), void 0 !== this.renderRoot && this.isConnected && t3.hostConnected?.();
  }
  removeController(t3) {
    this._$EO?.delete(t3);
  }
  _$E_() {
    const t3 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t3.set(i5, this[i5]), delete this[i5]);
    t3.size > 0 && (this._$Ep = t3);
  }
  createRenderRoot() {
    const t3 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t3, this.constructor.elementStyles), t3;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t3) => t3.hostConnected?.());
  }
  enableUpdating(t3) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t3) => t3.hostDisconnected?.());
  }
  attributeChangedCallback(t3, s4, i5) {
    this._$AK(t3, i5);
  }
  _$ET(t3, s4) {
    const i5 = this.constructor.elementProperties.get(t3), e4 = this.constructor._$Eu(t3, i5);
    if (void 0 !== e4 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t3, null == h3 ? this.removeAttribute(e4) : this.setAttribute(e4, h3), this._$Em = null;
    }
  }
  _$AK(t3, s4) {
    const i5 = this.constructor, e4 = i5._$Eh.get(t3);
    if (void 0 !== e4 && this._$Em !== e4) {
      const t4 = i5.getPropertyOptions(e4), h3 = "function" == typeof t4.converter ? { fromAttribute: t4.converter } : void 0 !== t4.converter?.fromAttribute ? t4.converter : u;
      this._$Em = e4;
      const r4 = h3.fromAttribute(s4, t4.type);
      this[e4] = r4 ?? this._$Ej?.get(e4) ?? r4, this._$Em = null;
    }
  }
  requestUpdate(t3, s4, i5, e4 = false, h3) {
    if (void 0 !== t3) {
      const r4 = this.constructor;
      if (false === e4 && (h3 = this[t3]), i5 ?? (i5 = r4.getPropertyOptions(t3)), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t3) && !this.hasAttribute(r4._$Eu(t3, i5)))) return;
      this.C(t3, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t3, s4, { useDefault: i5, reflect: e4, wrapped: h3 }, r4) {
    i5 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t3) && (this._$Ej.set(t3, r4 ?? s4 ?? this[t3]), true !== h3 || void 0 !== r4) || (this._$AL.has(t3) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t3, s4)), true === e4 && this._$Em !== t3 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t3));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t4) {
      Promise.reject(t4);
    }
    const t3 = this.scheduleUpdate();
    return null != t3 && await t3, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t5, s5] of this._$Ep) this[t5] = s5;
        this._$Ep = void 0;
      }
      const t4 = this.constructor.elementProperties;
      if (t4.size > 0) for (const [s5, i5] of t4) {
        const { wrapped: t5 } = i5, e4 = this[s5];
        true !== t5 || this._$AL.has(s5) || void 0 === e4 || this.C(s5, void 0, i5, e4);
      }
    }
    let t3 = false;
    const s4 = this._$AL;
    try {
      t3 = this.shouldUpdate(s4), t3 ? (this.willUpdate(s4), this._$EO?.forEach((t4) => t4.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t3 = false, this._$EM(), s5;
    }
    t3 && this._$AE(s4);
  }
  willUpdate(t3) {
  }
  _$AE(t3) {
    this._$EO?.forEach((t4) => t4.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t3)), this.updated(t3);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t3) {
    return true;
  }
  update(t3) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t4) => this._$ET(t4, this[t4]))), this._$EM();
  }
  updated(t3) {
  }
  firstUpdated(t3) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t3) => t3;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t3) => t3 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t3) => null === t3 || "object" != typeof t3 && "function" != typeof t3;
var u2 = Array.isArray;
var d2 = (t3) => u2(t3) || "function" == typeof t3?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t3) => (i5, ...s4) => ({ _$litType$: t3, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = Symbol.for("lit-noChange");
var A = Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t3, i5) {
  if (!u2(t3) || !t3.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t3, i5) => {
  const s4 = t3.length - 1, e4 = [];
  let n4, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t3[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n4 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n4 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n4 = void 0);
    const x2 = c4 === p2 && t3[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e4.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t3, l3 + (t3[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e4];
};
var S2 = class _S {
  constructor({ strings: t3, _$litType$: i5 }, e4) {
    let r4;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t3.length - 1, d3 = this.parts, [f3, v2] = N(t3, i5);
    if (this.el = _S.createElement(f3, e4), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t4 = this.el.content.firstChild;
      t4.replaceWith(...t4.childNodes);
    }
    for (; null !== (r4 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r4.nodeType) {
        if (r4.hasAttributes()) for (const t4 of r4.getAttributeNames()) if (t4.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r4.getAttribute(t4).split(o3), e5 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e5[2], strings: s4, ctor: "." === e5[1] ? I : "?" === e5[1] ? L : "@" === e5[1] ? z : H }), r4.removeAttribute(t4);
        } else t4.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r4.removeAttribute(t4));
        if (y2.test(r4.tagName)) {
          const t4 = r4.textContent.split(o3), i6 = t4.length - 1;
          if (i6 > 0) {
            r4.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r4.append(t4[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r4.append(t4[i6], c3());
          }
        }
      } else if (8 === r4.nodeType) if (r4.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t4 = -1;
        for (; -1 !== (t4 = r4.data.indexOf(o3, t4 + 1)); ) d3.push({ type: 7, index: l3 }), t4 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t3, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t3, s4;
  }
};
function M(t3, i5, s4 = t3, e4) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e4 ? s4._$Co?.[e4] : s4._$Cl;
  const o5 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o5 && (h3?._$AO?.(false), void 0 === o5 ? h3 = void 0 : (h3 = new o5(t3), h3._$AT(t3, s4, e4)), void 0 !== e4 ? (s4._$Co ?? (s4._$Co = []))[e4] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t3, h3._$AS(t3, i5.values), h3, e4)), i5;
}
var R = class {
  constructor(t3, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t3, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t3) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e4 = (t3?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e4;
    let h3 = P.nextNode(), o5 = 0, n4 = 0, r4 = s4[0];
    for (; void 0 !== r4; ) {
      if (o5 === r4.index) {
        let i6;
        2 === r4.type ? i6 = new k(h3, h3.nextSibling, this, t3) : 1 === r4.type ? i6 = new r4.ctor(h3, r4.name, r4.strings, this, t3) : 6 === r4.type && (i6 = new Z(h3, this, t3)), this._$AV.push(i6), r4 = s4[++n4];
      }
      o5 !== r4?.index && (h3 = P.nextNode(), o5++);
    }
    return P.currentNode = l2, e4;
  }
  p(t3) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t3, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t3[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t3, i5, s4, e4) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t3, this._$AB = i5, this._$AM = s4, this.options = e4, this._$Cv = e4?.isConnected ?? true;
  }
  get parentNode() {
    let t3 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t3?.nodeType && (t3 = i5.parentNode), t3;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t3, i5 = this) {
    t3 = M(this, t3, i5), a2(t3) ? t3 === A || null == t3 || "" === t3 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t3 !== this._$AH && t3 !== E && this._(t3) : void 0 !== t3._$litType$ ? this.$(t3) : void 0 !== t3.nodeType ? this.T(t3) : d2(t3) ? this.k(t3) : this._(t3);
  }
  O(t3) {
    return this._$AA.parentNode.insertBefore(t3, this._$AB);
  }
  T(t3) {
    this._$AH !== t3 && (this._$AR(), this._$AH = this.O(t3));
  }
  _(t3) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t3 : this.T(l2.createTextNode(t3)), this._$AH = t3;
  }
  $(t3) {
    const { values: i5, _$litType$: s4 } = t3, e4 = "number" == typeof s4 ? this._$AC(t3) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e4) this._$AH.p(i5);
    else {
      const t4 = new R(e4, this), s5 = t4.u(this.options);
      t4.p(i5), this.T(s5), this._$AH = t4;
    }
  }
  _$AC(t3) {
    let i5 = C.get(t3.strings);
    return void 0 === i5 && C.set(t3.strings, i5 = new S2(t3)), i5;
  }
  k(t3) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e4 = 0;
    for (const h3 of t3) e4 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e4], s4._$AI(h3), e4++;
    e4 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e4), i5.length = e4);
  }
  _$AR(t3 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t3 !== this._$AB; ) {
      const s5 = i3(t3).nextSibling;
      i3(t3).remove(), t3 = s5;
    }
  }
  setConnected(t3) {
    void 0 === this._$AM && (this._$Cv = t3, this._$AP?.(t3));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t3, i5, s4, e4, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t3, this.name = i5, this._$AM = e4, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t3, i5 = this, s4, e4) {
    const h3 = this.strings;
    let o5 = false;
    if (void 0 === h3) t3 = M(this, t3, i5, 0), o5 = !a2(t3) || t3 !== this._$AH && t3 !== E, o5 && (this._$AH = t3);
    else {
      const e5 = t3;
      let n4, r4;
      for (t3 = h3[0], n4 = 0; n4 < h3.length - 1; n4++) r4 = M(this, e5[s4 + n4], i5, n4), r4 === E && (r4 = this._$AH[n4]), o5 || (o5 = !a2(r4) || r4 !== this._$AH[n4]), r4 === A ? t3 = A : t3 !== A && (t3 += (r4 ?? "") + h3[n4 + 1]), this._$AH[n4] = r4;
    }
    o5 && !e4 && this.j(t3);
  }
  j(t3) {
    t3 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t3 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t3) {
    this.element[this.name] = t3 === A ? void 0 : t3;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t3) {
    this.element.toggleAttribute(this.name, !!t3 && t3 !== A);
  }
};
var z = class extends H {
  constructor(t3, i5, s4, e4, h3) {
    super(t3, i5, s4, e4, h3), this.type = 5;
  }
  _$AI(t3, i5 = this) {
    if ((t3 = M(this, t3, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e4 = t3 === A && s4 !== A || t3.capture !== s4.capture || t3.once !== s4.once || t3.passive !== s4.passive, h3 = t3 !== A && (s4 === A || e4);
    e4 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t3), this._$AH = t3;
  }
  handleEvent(t3) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t3) : this._$AH.handleEvent(t3);
  }
};
var Z = class {
  constructor(t3, i5, s4) {
    this.element = t3, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t3) {
    M(this, t3);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.2");
var D = (t3, i5, s4) => {
  const e4 = s4?.renderBefore ?? i5;
  let h3 = e4._$litPart$;
  if (void 0 === h3) {
    const t4 = s4?.renderBefore ?? null;
    e4._$litPart$ = h3 = new k(i5.insertBefore(c3(), t4), t4, void 0, s4 ?? {});
  }
  return h3._$AI(t3), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t3 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t3.firstChild), t3;
  }
  update(t3) {
    const r4 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t3), this._$Do = D(r4, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// src/tuya-ev-charger-card.ts
var PROFILE_OPTIONS = ["eco", "balanced", "fast"];
var PROFILE_META = {
  eco: { label: "Eco", start: 2200, stop: 1700, icon: "eco" },
  balanced: { label: "Balanced", start: 1600, stop: 1200, icon: "balance" },
  fast: { label: "Fast", start: 1200, stop: 900, icon: "bolt" }
};
var ATTR_CARD_ROLE = "tuya_ev_charger_card_role";
var ATTR_CHARGER_TOKEN = "tuya_ev_charger_token";
var GRAPH_SAMPLE_INTERVAL_MS = 3e4;
var GRAPH_WINDOW_MS = 36e5;
var GRAPH_MAX_POINTS = GRAPH_WINDOW_MS / GRAPH_SAMPLE_INTERVAL_MS;
var GRAPH_HISTORY_RETRY_MS = 6e4;
var OPTIMISTIC_TIMEOUT_MS = 12e3;
var GAUGE_R = 43;
var GAUGE_CIRC = 2 * Math.PI * GAUGE_R;
var GAUGE_MAX_W = 11e3;
var THRESHOLD_MAX_W = 6e3;
var THRESHOLD_STEP_W = 100;
var TuyaEvChargerCard = class extends i4 {
  constructor() {
    super(...arguments);
    this._activeTab = "dashboard";
    this._graphHistory = [];
    this._graphHistoryLoading = false;
    this._resolvedEntities = {};
    this._lastRenderSignature = "";
    this._optimisticStates = {};
    this._optimisticTimeouts = /* @__PURE__ */ new Map();
    this._sliderValues = {};
    this._graphHistoryFetchInFlight = false;
    this._graphHistoryHydratedKey = "";
    this._graphHistoryLastFailedAt = 0;
  }
  static getStubConfig() {
    return { type: "custom:tuya-ev-charger-card", title: "EV Charger" };
  }
  static getConfigElement() {
    return document.createElement("tuya-ev-charger-card-editor");
  }
  connectedCallback() {
    super.connectedCallback();
    this._injectFonts();
  }
  _injectFonts() {
    if (document.querySelector("#tuya-ev-charger-fonts")) return;
    const link = document.createElement("link");
    link.id = "tuya-ev-charger-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;900&family=Inter:wght@400;500;600;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap";
    document.head.appendChild(link);
  }
  setConfig(config) {
    if (!config || config.type !== "custom:tuya-ev-charger-card") {
      throw new Error("Invalid card configuration.");
    }
    this._config = config;
    this._resolvedEntities = this._resolveEntities(config);
    this._graphHistory = [];
    this._graphHistoryLoading = false;
    this._graphHistoryHydratedKey = "";
    this._graphHistoryLastFailedAt = 0;
    this._clearAllOptimisticStates();
    this._sliderValues = {};
    this._lastRenderSignature = "";
  }
  disconnectedCallback() {
    this._clearAllOptimisticStates();
    this._graphHistoryFetchInFlight = false;
    this._graphHistoryLoading = false;
    super.disconnectedCallback();
  }
  shouldUpdate(changed) {
    if (changed.has("_config") || changed.has("_resolvedEntities") || changed.has("_activeTab") || changed.has("_graphHistory") || changed.has("_optimisticStates") || changed.has("_sliderValues")) {
      return true;
    }
    if (changed.has("hass")) {
      this._syncOptimisticStatesWithHass();
      this._maybeHydrateGraphHistory();
      const graphChanged = this._appendGraphSample();
      const next = this._stateSignature();
      const stateChanged = next !== this._lastRenderSignature;
      if (stateChanged) this._lastRenderSignature = next;
      return graphChanged || stateChanged;
    }
    return false;
  }
  /* ─── Render ─────────────────────────────────────────────────────────── */
  render() {
    if (!this._config || !this.hass) {
      return b2`<ha-card><div class="pad">Card not ready.</div></ha-card>`;
    }
    return b2`
      <ha-card>
        <div class="app">
          <div class="app-content">${this._renderTab()}</div>
          ${this._renderNav()}
        </div>
      </ha-card>
    `;
  }
  _renderTab() {
    switch (this._activeTab) {
      case "dashboard":
        return this._renderDashboard();
      case "strategy":
        return this._renderStrategy();
      case "logs":
        return this._renderLogs();
    }
  }
  /* ─── Dashboard ──────────────────────────────────────────────────────── */
  _renderDashboard() {
    const e4 = this._resolvedEntities;
    const chargeOn = this._isOn(e4.chargeSession);
    const surplusOn = this._isOn(e4.surplusMode);
    const regulationOn = this._isOn(e4.regulationActive);
    const powerW = this._powerW(e4.power);
    const currentA = this._numberState(e4.current);
    const voltageV = this._numberState(e4.voltage);
    const tempC = this._numberState(e4.temperature);
    const workState = this._state(e4.workState) ?? "\u2014";
    const chargeCurrentA = this._numberState(e4.chargeCurrent);
    const chargeCurrentEntity = this._entity(e4.chargeCurrent);
    const allowedCurrents = this._allowedCurrents(chargeCurrentEntity);
    const currentMin = this._attrNumber(chargeCurrentEntity, "min") ?? this._attrNumber(chargeCurrentEntity, "native_min_value") ?? 6;
    const currentMax = this._attrNumber(chargeCurrentEntity, "max") ?? this._attrNumber(chargeCurrentEntity, "native_max_value") ?? 16;
    const currentStep = this._attrNumber(chargeCurrentEntity, "step") ?? this._attrNumber(chargeCurrentEntity, "native_step") ?? 1;
    const title = this._config?.title ?? "EV Charger";
    const isWorking = chargeOn || workState.toUpperCase() === "WORKING";
    return b2`
      <div class="dashboard">
        <!-- Header -->
        <header class="dash-header">
          <div>
            <div class="app-label">KINETIC</div>
            <div class="dash-title">${title}</div>
          </div>
          <div class="chips">
            <span class="chip ${chargeOn ? "chip-ok" : "chip-off"}">
              ${chargeOn ? "Charging" : "Idle"}
            </span>
            <span class="chip ${surplusOn ? "chip-ok" : "chip-off"}">
              ${surplusOn ? "Surplus" : "Manual"}
            </span>
            ${regulationOn ? b2`<span class="chip chip-ok">Regulating</span>` : A}
          </div>
        </header>

        <!-- Hero Gauge -->
        <section class="gauge-section">
          ${this._renderGauge(powerW, isWorking)}
          <!-- Status bar -->
          <div class="status-bar ${isWorking ? "status-bar--active" : ""}">
            <span class="status-dot ${isWorking ? "status-dot--pulse" : ""}"></span>
            <span class="status-label">${workState.toUpperCase()}</span>
            <div class="status-divider"></div>
            <span class="mso status-icon">ev_station</span>
            <span class="status-sub">${surplusOn ? "SOLAR" : "GRID"}</span>
          </div>
        </section>

        <!-- Telemetry grid -->
        <div class="tele-grid">
          <div class="tele-tile">
            <span class="mso tele-icon tele-icon--tertiary">bolt</span>
            <div class="tele-label">Voltage</div>
            <div class="tele-value">
              ${voltageV !== null ? voltageV.toFixed(0) : "\u2014"}
              <span class="tele-unit">V</span>
            </div>
          </div>
          <div class="tele-tile">
            <span class="mso tele-icon tele-icon--secondary">speed</span>
            <div class="tele-label">Current</div>
            <div class="tele-value">
              ${currentA !== null ? currentA.toFixed(0) : "\u2014"}
              <span class="tele-unit">A</span>
            </div>
          </div>
          <div class="tele-tile">
            <span class="mso tele-icon tele-icon--error">thermostat</span>
            <div class="tele-label">Charger</div>
            <div class="tele-value">
              ${tempC !== null ? tempC.toFixed(0) : "\u2014"}
              <span class="tele-unit">°C</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="action-grid">
          <button
            class="btn-action btn-pause"
            @click=${this._onChargeToggle}
            ?disabled=${!e4.chargeSession}
          >
            <span class="mso">${chargeOn ? "pause_circle" : "play_circle"}</span>
            ${chargeOn ? "Pause Session" : "Start Session"}
          </button>
          <button
            class="btn-action btn-emergency"
            @click=${this._onReboot}
            ?disabled=${!e4.reboot}
          >
            <span class="mso" style="font-variation-settings:'FILL' 1">emergency_home</span>
            Emergency Stop
          </button>
        </div>

        <!-- Charge current control -->
        <div class="current-box">
          <div class="current-label">
            <span class="mso" style="font-size:1rem;color:var(--kin-primary)">current_ac</span>
            Charge current
          </div>
          <div class="current-ctrl">
            <button
              class="btn-step"
              @click=${() => {
      const t3 = this._stepCurrent(-1, chargeCurrentA, allowedCurrents, currentMin, currentMax, currentStep);
      this._setChargeCurrent(t3, currentMin, currentMax, allowedCurrents);
    }}
              ?disabled=${!e4.chargeCurrent}
            >−</button>
            <div class="current-val">${this._formatAmp(chargeCurrentA)}</div>
            <button
              class="btn-step"
              @click=${() => {
      const t3 = this._stepCurrent(1, chargeCurrentA, allowedCurrents, currentMin, currentMax, currentStep);
      this._setChargeCurrent(t3, currentMin, currentMax, allowedCurrents);
    }}
              ?disabled=${!e4.chargeCurrent}
            >+</button>
          </div>
        </div>
      </div>
    `;
  }
  _renderGauge(powerW, active) {
    const pct = powerW !== null ? Math.max(0, Math.min(1, powerW / GAUGE_MAX_W)) : 0;
    const fill = pct * GAUGE_CIRC;
    const displayKw = powerW !== null ? (powerW / 1e3).toFixed(2) : "\u2014";
    const unit = powerW !== null ? "kW" : "";
    return b2`
      <div class="gauge-wrap">
        <svg class="gauge-svg" viewBox="0 0 100 100" aria-label="Power gauge">
          <!-- Track -->
          <circle
            cx="50" cy="50" r="${GAUGE_R}"
            fill="none" stroke="#20201f" stroke-width="8"
          />
          <!-- Arc -->
          <circle
            cx="50" cy="50" r="${GAUGE_R}"
            fill="none"
            stroke="var(--kin-primary)"
            stroke-width="8"
            stroke-linecap="round"
            stroke-dasharray="${fill.toFixed(2)} ${GAUGE_CIRC.toFixed(2)}"
            transform="rotate(-90 50 50)"
            class="${active ? "gauge-arc--glow" : ""}"
          />
        </svg>
        <div class="gauge-center">
          <div class="gauge-sublabel">Power Output</div>
          <div class="gauge-value">${displayKw}</div>
          <div class="gauge-unit">${unit}</div>
        </div>
      </div>
    `;
  }
  /* ─── Strategy ───────────────────────────────────────────────────────── */
  _renderStrategy() {
    const e4 = this._resolvedEntities;
    const surplusOn = this._isOn(e4.surplusMode);
    const profile = this._state(e4.surplusProfile) ?? "balanced";
    const startW = this._sliderValues[e4.surplusStartThreshold ?? ""] ?? this._numberState(e4.surplusStartThreshold) ?? 1600;
    const stopW = this._sliderValues[e4.surplusStopThreshold ?? ""] ?? this._numberState(e4.surplusStopThreshold) ?? 1200;
    const startPct = (startW / THRESHOLD_MAX_W * 100).toFixed(1);
    const stopPct = (stopW / THRESHOLD_MAX_W * 100).toFixed(1);
    const lastDecision = this._state(e4.lastDecision) ?? "\u2014";
    const targetA = this._numberState(e4.surplusTargetCurrent);
    return b2`
      <div class="strategy">
        <header class="page-header">
          <div class="page-sup">Energy Management</div>
          <div class="page-title">Surplus Strategy</div>
        </header>

        <!-- Surplus mode toggle -->
        <section class="strat-section">
          <div class="strat-row">
            <div class="strat-row-left">
              <span class="mso strat-icon">solar_power</span>
              <div>
                <div class="strat-row-title">Surplus Mode</div>
                <div class="strat-row-sub">Solar regulation active</div>
              </div>
            </div>
            <button
              class="toggle ${surplusOn ? "toggle--on" : ""}"
              @click=${this._onSurplusToggle}
              ?disabled=${!e4.surplusMode}
              aria-label="Toggle surplus mode"
            >
              <div class="toggle-thumb"></div>
            </button>
          </div>
        </section>

        <!-- Profile selector -->
        <section class="strat-section">
          <div class="strat-section-label">Strategy Profile</div>
          <div class="profile-grid">
            ${PROFILE_OPTIONS.map((p3) => {
      const m2 = PROFILE_META[p3];
      const active = profile === p3;
      return b2`
                <button
                  class="profile-btn ${active ? "profile-btn--active" : ""}"
                  @click=${() => this._setProfile(p3)}
                  ?disabled=${!e4.surplusProfile}
                >
                  <span class="mso profile-icon">${m2.icon}</span>
                  <span class="profile-name">${m2.label}</span>
                  <span class="profile-thresholds">${m2.start}/${m2.stop}W</span>
                </button>
              `;
    })}
          </div>
        </section>

        <!-- Thresholds -->
        <section class="strat-section">
          <div class="strat-section-label">Power Thresholds</div>

          <!-- Start threshold -->
          <div class="threshold-block">
            <div class="threshold-header">
              <div>
                <div class="threshold-label">Start Threshold</div>
                <div class="threshold-value">
                  ${startW}<span class="threshold-unit">W</span>
                </div>
              </div>
              <div class="threshold-right-label">Surplus Power</div>
            </div>
            <input
              type="range"
              min="0"
              max="${THRESHOLD_MAX_W}"
              step="${THRESHOLD_STEP_W}"
              .value=${String(startW)}
              style="--pct: ${startPct}%"
              @input=${(ev) => this._onThresholdInput(e4.surplusStartThreshold, ev)}
              @change=${(ev) => this._onThresholdChange(e4.surplusStartThreshold, ev)}
              ?disabled=${!e4.surplusStartThreshold}
              class="slider slider--primary"
            />
          </div>

          <!-- Stop threshold -->
          <div class="threshold-block">
            <div class="threshold-header">
              <div>
                <div class="threshold-label">Stop Threshold</div>
                <div class="threshold-value threshold-value--stop">
                  ${stopW}<span class="threshold-unit">W</span>
                </div>
              </div>
              <div class="threshold-right-label">Grid Draw</div>
            </div>
            <input
              type="range"
              min="0"
              max="${THRESHOLD_MAX_W}"
              step="${THRESHOLD_STEP_W}"
              .value=${String(stopW)}
              style="--pct: ${stopPct}%"
              @input=${(ev) => this._onThresholdInput(e4.surplusStopThreshold, ev)}
              @change=${(ev) => this._onThresholdChange(e4.surplusStopThreshold, ev)}
              ?disabled=${!e4.surplusStopThreshold}
              class="slider slider--error"
            />
          </div>
        </section>

        <!-- Live status -->
        <section class="strat-section">
          <div class="strat-section-label">Live Status</div>
          <div class="live-grid">
            <div class="live-item">
              <div class="live-item-label">Target Current</div>
              <div class="live-item-value">${this._formatAmp(targetA)}</div>
            </div>
            <div class="live-item">
              <div class="live-item-label">Last Decision</div>
              <div class="live-item-value live-item-value--decision">${lastDecision}</div>
            </div>
          </div>
        </section>
      </div>
    `;
  }
  /* ─── Logs ───────────────────────────────────────────────────────────── */
  _renderLogs() {
    const e4 = this._resolvedEntities;
    const selftest = this._state(e4.selftest) ?? "\u2014";
    const alarm = this._state(e4.alarm) ?? "\u2014";
    const lastDecision = this._state(e4.lastDecision) ?? "\u2014";
    const surplusRawW = this._powerW(e4.surplusRaw);
    const surplusEffectiveW = this._powerW(e4.surplusEffective);
    const selftestOk = selftest.toUpperCase().includes("OK") || selftest.toUpperCase().includes("PASS") || selftest === "\u2014";
    const alarmOk = alarm === "\u2014" || alarm === "" || alarm === "0" || alarm.toUpperCase() === "NONE" || alarm.toUpperCase() === "OK";
    return b2`
      <div class="logs">
        <header class="page-header">
          <div class="page-sup">Monitoring</div>
          <div class="page-title">Charge Logs</div>
        </header>

        <!-- Graph -->
        <section class="logs-section">
          <div class="logs-section-label">Last Hour — Power &amp; Surplus</div>
          ${this._renderGraph()}
        </section>

        <!-- Diagnostics -->
        <section class="logs-section">
          <div class="logs-section-label">Diagnostics</div>
          <div class="diag-row">
            <div class="diag-card">
              <div class="diag-icon-wrap ${selftestOk ? "diag-icon-wrap--ok" : "diag-icon-wrap--warn"}">
                <span class="mso">${selftestOk ? "health_and_safety" : "warning"}</span>
              </div>
              <div>
                <div class="diag-label">Self-Test</div>
                <div class="diag-value">${selftest.toUpperCase()}</div>
              </div>
            </div>
            <div class="diag-card">
              <div class="diag-icon-wrap ${alarmOk ? "" : "diag-icon-wrap--warn"}">
                <span class="mso">${alarmOk ? "notifications_off" : "notification_important"}</span>
              </div>
              <div>
                <div class="diag-label">Alarms</div>
                <div class="diag-value">${alarmOk ? "NONE ACTIVE" : alarm.toUpperCase()}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- Surplus debug -->
        <section class="logs-section">
          <div class="logs-section-label">Surplus Debug</div>
          <div class="debug-grid">
            <div class="debug-item">
              <div class="debug-item-label">Raw surplus</div>
              <div class="debug-item-value">${this._formatPower(surplusRawW)}</div>
            </div>
            <div class="debug-item">
              <div class="debug-item-label">Effective surplus</div>
              <div class="debug-item-value">${this._formatPower(surplusEffectiveW)}</div>
            </div>
          </div>
        </section>

        <!-- Terminal log -->
        <section class="logs-section">
          <div class="logs-section-label">Decision Log</div>
          <div class="terminal">
            <div class="terminal-icon-bg">
              <span class="mso">terminal</span>
            </div>
            <div class="terminal-line">
              <span class="terminal-ts">${this._nowHMS()}</span>
              <span class="terminal-tag terminal-tag--active">LIVE</span>
              <span class="terminal-msg">${lastDecision}</span>
            </div>
            <div class="terminal-footer">
              <div class="terminal-live">
                <span class="terminal-live-dot"></span>
                <span>Live Monitoring Active</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    `;
  }
  /* ─── Graph (1h history) ─────────────────────────────────────────────── */
  _renderGraph() {
    const points = this._graphHistory;
    if (points.length < 2) {
      return b2`
        <div class="graph-empty">
          ${this._graphHistoryLoading ? "Loading history\u2026" : "Collecting samples\u2026"}
        </div>
      `;
    }
    const width = 360;
    const height = 90;
    const allValues = points.flatMap(
      (s4) => [s4.powerW, s4.surplusW].filter((v2) => v2 !== null)
    );
    const maxAbs = Math.max(500, ...allValues.map((v2) => Math.abs(v2)));
    const min = -maxAbs;
    const max = maxAbs;
    const powerPath = this._buildPath(points.map((s4) => s4.powerW), min, max, width, height);
    const surplusPath = this._buildPath(points.map((s4) => s4.surplusW), min, max, width, height);
    const zeroY = this._scaleY(0, min, max, height);
    return b2`
      <div class="graph-wrap">
        <svg class="graph-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-label="Power graph">
          <line x1="0" y1="${zeroY}" x2="${width}" y2="${zeroY}" class="graph-axis"></line>
          <path d="${powerPath}" class="graph-line graph-line--power"></path>
          <path d="${surplusPath}" class="graph-line graph-line--surplus"></path>
        </svg>
        <div class="graph-legend">
          <span class="legend-item">
            <i class="legend-dot legend-dot--power"></i>Power
          </span>
          <span class="legend-item">
            <i class="legend-dot legend-dot--surplus"></i>Eff. Surplus
          </span>
        </div>
      </div>
    `;
  }
  /* ─── Bottom nav ─────────────────────────────────────────────────────── */
  _renderNav() {
    const tabs = [
      { id: "dashboard", icon: "speed", label: "Dashboard" },
      { id: "strategy", icon: "settings_suggest", label: "Strategy" },
      { id: "logs", icon: "history", label: "Logs" }
    ];
    return b2`
      <nav class="bottom-nav">
        ${tabs.map(
      (t3) => b2`
            <button
              class="nav-item ${this._activeTab === t3.id ? "nav-item--active" : ""}"
              @click=${() => {
        this._activeTab = t3.id;
      }}
            >
              <span class="mso nav-icon">${t3.icon}</span>
              <span class="nav-label">${t3.label}</span>
            </button>
          `
    )}
      </nav>
    `;
  }
  /* ─── Graph data / history ───────────────────────────────────────────── */
  _appendGraphSample() {
    if (!this.hass) return false;
    const now = Date.now();
    const last = this._graphHistory[this._graphHistory.length - 1];
    if (last && now - last.ts < GRAPH_SAMPLE_INTERVAL_MS) return false;
    const powerW = this._powerW(this._resolvedEntities.power);
    const surplusW = this._powerW(this._resolvedEntities.surplusEffective);
    const next = { ts: now, powerW, surplusW };
    const cutoff = now - GRAPH_WINDOW_MS;
    this._graphHistory = [...this._graphHistory, next].filter((s4) => s4.ts >= cutoff).slice(-GRAPH_MAX_POINTS);
    return true;
  }
  _graphHydrationKey() {
    return [this._resolvedEntities.power, this._resolvedEntities.surplusEffective].filter((v2) => Boolean(v2)).join("|");
  }
  _maybeHydrateGraphHistory() {
    const key = this._graphHydrationKey();
    if (!this.hass?.callApi || !key) return;
    if (this._graphHistoryFetchInFlight) return;
    if (this._graphHistoryHydratedKey === key && this._graphHistory.length >= 2) return;
    if (this._graphHistoryLastFailedAt > 0 && Date.now() - this._graphHistoryLastFailedAt < GRAPH_HISTORY_RETRY_MS) return;
    void this._hydrateGraphHistory(key);
  }
  async _hydrateGraphHistory(key) {
    if (!this.hass?.callApi) return;
    const entityIds = [
      this._resolvedEntities.power,
      this._resolvedEntities.surplusEffective
    ].filter((v2) => Boolean(v2));
    if (!entityIds.length) return;
    this._graphHistoryFetchInFlight = true;
    this._graphHistoryLoading = true;
    const endTs = Date.now();
    const startTs = endTs - GRAPH_WINDOW_MS;
    const startIso = encodeURIComponent(new Date(startTs).toISOString());
    const endIso = encodeURIComponent(new Date(endTs).toISOString());
    const filterEntityId = encodeURIComponent([...new Set(entityIds)].join(","));
    const path = `history/period/${startIso}?filter_entity_id=${filterEntityId}&end_time=${endIso}&significant_changes_only=0`;
    try {
      const payload = await this.hass.callApi("GET", path);
      if (key !== this._graphHydrationKey()) return;
      const merged = this._buildHistoryGraphSamples(payload, startTs, endTs);
      this._graphHistoryHydratedKey = key;
      if (merged.length) {
        this._graphHistory = merged;
        this._graphHistoryLastFailedAt = 0;
      }
    } catch {
      this._graphHistoryLastFailedAt = Date.now();
    } finally {
      this._graphHistoryFetchInFlight = false;
      this._graphHistoryLoading = false;
    }
  }
  _buildHistoryGraphSamples(payload, startTs, endTs) {
    const grouped = this._historyByEntity(payload);
    const powerSeries = this._seriesFromHistory(
      grouped.get(this._resolvedEntities.power ?? "") ?? [],
      this._resolvedEntities.power
    );
    const surplusSeries = this._seriesFromHistory(
      grouped.get(this._resolvedEntities.surplusEffective ?? "") ?? [],
      this._resolvedEntities.surplusEffective
    );
    if (!powerSeries.length && !surplusSeries.length) return [];
    const alignedStart = Math.floor(startTs / GRAPH_SAMPLE_INTERVAL_MS) * GRAPH_SAMPLE_INTERVAL_MS;
    const points = [];
    let pi = 0, si = 0;
    let powerValue = null;
    let surplusValue = null;
    for (let ts = alignedStart; ts <= endTs; ts += GRAPH_SAMPLE_INTERVAL_MS) {
      while (pi < powerSeries.length && powerSeries[pi].ts <= ts) {
        powerValue = powerSeries[pi].valueW;
        pi++;
      }
      while (si < surplusSeries.length && surplusSeries[si].ts <= ts) {
        surplusValue = surplusSeries[si].valueW;
        si++;
      }
      points.push({ ts, powerW: powerValue, surplusW: surplusValue });
    }
    return points.filter((s4) => s4.powerW !== null || s4.surplusW !== null).slice(-GRAPH_MAX_POINTS);
  }
  _historyByEntity(payload) {
    const grouped = /* @__PURE__ */ new Map();
    if (!Array.isArray(payload)) return grouped;
    for (const rawSeries of payload) {
      if (!Array.isArray(rawSeries)) continue;
      let fallback = "";
      for (const rawState of rawSeries) {
        if (!rawState || typeof rawState !== "object") continue;
        const state = rawState;
        const id = state.entity_id;
        if (typeof id === "string" && id.trim()) fallback = id.trim();
        if (!fallback) continue;
        const list = grouped.get(fallback) ?? [];
        list.push(state);
        grouped.set(fallback, list);
      }
    }
    return grouped;
  }
  _seriesFromHistory(history, entityId) {
    const unit = this._entityPowerUnit(entityId);
    const series = [];
    for (const row of history) {
      const rawTs = row.last_changed ?? row.last_updated;
      if (typeof rawTs !== "string") continue;
      const ts = Date.parse(rawTs);
      if (!Number.isFinite(ts)) continue;
      const raw = String(row.state ?? "").trim().toLowerCase();
      if (!raw || raw === "unknown" || raw === "unavailable" || raw === "none") {
        series.push({ ts, valueW: null });
        continue;
      }
      const parsed = Number(row.state);
      const valueW = Number.isFinite(parsed) ? this._convertPowerToWatts(parsed, unit) : null;
      series.push({ ts, valueW });
    }
    series.sort((a3, b3) => a3.ts - b3.ts);
    return series;
  }
  _buildPath(values, min, max, width, height) {
    const step = width / Math.max(1, values.length - 1);
    let path = "";
    values.forEach((v2, i5) => {
      if (v2 === null) return;
      const x2 = i5 * step;
      const y3 = this._scaleY(v2, min, max, height);
      path += path ? ` L ${x2.toFixed(2)} ${y3.toFixed(2)}` : `M ${x2.toFixed(2)} ${y3.toFixed(2)}`;
    });
    return path;
  }
  _scaleY(v2, min, max, height) {
    if (max <= min) return height / 2;
    return height - (v2 - min) / (max - min) * height;
  }
  /* ─── Entity accessors ───────────────────────────────────────────────── */
  _entity(id) {
    if (!id || !this.hass) return void 0;
    return this.hass.states[id];
  }
  _state(id) {
    if (!id) return void 0;
    const opt = this._optimisticStates[id];
    if (opt !== void 0) return opt;
    return this._entity(id)?.state;
  }
  _isOn(id) {
    return this._state(id) === "on";
  }
  _numberState(id) {
    const s4 = this._state(id);
    if (s4 === void 0 || s4 === "unknown" || s4 === "unavailable") return null;
    const n4 = Number(s4);
    return Number.isFinite(n4) ? n4 : null;
  }
  _powerW(id) {
    const entity = this._entity(id);
    if (!entity) return null;
    const n4 = this._numberState(id);
    if (n4 === null) return null;
    return this._convertPowerToWatts(n4, this._entityPowerUnit(id));
  }
  _entityPowerUnit(id) {
    const e4 = this._entity(id);
    return String(
      e4?.attributes.unit_of_measurement ?? e4?.attributes.native_unit_of_measurement ?? ""
    ).trim().toLowerCase();
  }
  _convertPowerToWatts(v2, unit) {
    return unit === "kw" ? v2 * 1e3 : v2;
  }
  _attrNumber(entity, key) {
    if (!entity) return null;
    const n4 = Number(entity.attributes[key]);
    return Number.isFinite(n4) ? n4 : null;
  }
  _allowedCurrents(entity) {
    if (!entity) return [];
    const raws = [
      entity.attributes.allowed_currents,
      entity.attributes.available_currents,
      entity.attributes.adjust_current_options
    ];
    const parsed = [];
    for (const raw of raws) {
      if (Array.isArray(raw)) {
        for (const v2 of raw) {
          const n4 = Number(v2);
          if (Number.isFinite(n4)) parsed.push(Math.round(n4));
        }
      } else if (typeof raw === "string") {
        for (const chunk of raw.split(",")) {
          const n4 = Number(chunk.trim());
          if (Number.isFinite(n4)) parsed.push(Math.round(n4));
        }
      }
    }
    return [...new Set(parsed)].filter((v2) => v2 > 0).sort((a3, b3) => a3 - b3);
  }
  /* ─── Formatters ─────────────────────────────────────────────────────── */
  _formatPower(w2) {
    if (w2 === null) return "\u2014";
    const abs = Math.abs(w2);
    return abs >= 1e3 ? `${(w2 / 1e3).toFixed(2)} kW` : `${Math.round(w2)} W`;
  }
  _formatAmp(a3) {
    if (a3 === null) return "\u2014";
    return `${Math.round(a3)} A`;
  }
  _nowHMS() {
    return (/* @__PURE__ */ new Date()).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }
  /* ─── State signature ────────────────────────────────────────────────── */
  _stateSignature() {
    if (!this.hass) return "no-hass";
    const ids = this._trackedEntityIds();
    if (!ids.length) return "no-entities";
    return ids.map((id) => {
      const e4 = this.hass.states[id];
      if (!e4) return `${id}:missing`;
      return `${id}:${e4.state}`;
    }).join(";");
  }
  _trackedEntityIds() {
    const r4 = this._resolvedEntities;
    const all = [
      r4.power,
      r4.current,
      r4.voltage,
      r4.temperature,
      r4.workState,
      r4.chargeCurrent,
      r4.chargeSession,
      r4.reboot,
      r4.surplusMode,
      r4.surplusProfile,
      r4.surplusStartThreshold,
      r4.surplusStopThreshold,
      r4.regulationActive,
      r4.lastDecision,
      r4.surplusRaw,
      r4.surplusEffective,
      r4.surplusDischargeOverLimit,
      r4.surplusTargetCurrent,
      r4.selftest,
      r4.alarm
    ];
    return [...new Set(all.filter((v2) => Boolean(v2)))];
  }
  /* ─── Entity resolution ──────────────────────────────────────────────── */
  _resolveEntities(config) {
    const token = this._normalizeToken(config.charger_name);
    const c4 = config.entities ?? {};
    const fb = (domain, suffix) => token ? `${domain}.${token}_${suffix}` : void 0;
    const byRole = this._discoverByRole();
    return {
      power: c4.power ?? byRole.power ?? fb("sensor", "power_l1"),
      current: c4.current ?? byRole.current ?? fb("sensor", "current_l1"),
      voltage: c4.voltage ?? fb("sensor", "voltage_l1"),
      temperature: c4.temperature ?? fb("sensor", "temperature"),
      workState: c4.work_state ?? fb("sensor", "work_state"),
      chargeCurrent: c4.charge_current ?? byRole.chargeCurrent ?? fb("number", "charge_current"),
      chargeSession: c4.charge_session ?? byRole.chargeSession ?? fb("switch", "charge_session"),
      reboot: c4.reboot ?? fb("button", "reboot_charger"),
      surplusMode: c4.surplus_mode ?? byRole.surplusMode ?? fb("switch", "surplus_mode"),
      surplusProfile: c4.surplus_profile ?? byRole.surplusProfile ?? fb("select", "surplus_profile"),
      surplusStartThreshold: c4.surplus_start_threshold ?? fb("number", "surplus_start_threshold_w"),
      surplusStopThreshold: c4.surplus_stop_threshold ?? fb("number", "surplus_stop_threshold_w"),
      regulationActive: c4.regulation_active ?? byRole.regulationActive ?? fb("binary_sensor", "surplus_regulation_active"),
      lastDecision: c4.last_decision ?? byRole.lastDecision ?? fb("sensor", "surplus_last_decision_reason"),
      surplusRaw: c4.surplus_raw ?? byRole.surplusRaw ?? fb("sensor", "surplus_raw_w"),
      surplusEffective: c4.surplus_effective ?? byRole.surplusEffective ?? fb("sensor", "surplus_effective_w"),
      surplusDischargeOverLimit: c4.surplus_discharge_over_limit ?? byRole.surplusDischargeOverLimit ?? fb("sensor", "surplus_battery_discharge_over_limit_w"),
      surplusTargetCurrent: c4.surplus_target_current ?? byRole.surplusTargetCurrent ?? fb("sensor", "surplus_target_current_a"),
      selftest: c4.selftest ?? fb("sensor", "selftest"),
      alarm: c4.alarm ?? fb("sensor", "alarm")
    };
  }
  _discoverByRole() {
    if (!this.hass) return {};
    const result = {};
    for (const [entityId, entity] of Object.entries(this.hass.states)) {
      const role = entity.attributes[ATTR_CARD_ROLE];
      if (!role) continue;
      switch (role) {
        case "power":
          result.power = entityId;
          break;
        case "current":
          result.current = entityId;
          break;
        case "charge_current":
          result.chargeCurrent = entityId;
          break;
        case "charge_session":
          result.chargeSession = entityId;
          break;
        case "surplus_mode":
          result.surplusMode = entityId;
          break;
        case "surplus_profile":
          result.surplusProfile = entityId;
          break;
        case "regulation_active":
          result.regulationActive = entityId;
          break;
        case "last_decision":
          result.lastDecision = entityId;
          break;
        case "surplus_raw":
          result.surplusRaw = entityId;
          break;
        case "surplus_effective":
          result.surplusEffective = entityId;
          break;
        case "surplus_discharge_over_limit":
          result.surplusDischargeOverLimit = entityId;
          break;
        case "surplus_target_current":
          result.surplusTargetCurrent = entityId;
          break;
      }
    }
    return result;
  }
  _normalizeToken(input) {
    return String(input ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  }
  /* ─── Optimistic states ──────────────────────────────────────────────── */
  _syncOptimisticStatesWithHass() {
    if (!this.hass) return;
    const entries = Object.entries(this._optimisticStates);
    if (!entries.length) return;
    let changed = false;
    const next = { ...this._optimisticStates };
    for (const [id, opt] of entries) {
      const real = this.hass.states[id]?.state;
      if (real === void 0 || real === opt) {
        delete next[id];
        const t3 = this._optimisticTimeouts.get(id);
        if (t3) {
          clearTimeout(t3);
          this._optimisticTimeouts.delete(id);
        }
        changed = true;
      }
    }
    if (changed) this._optimisticStates = next;
  }
  _setOptimisticState(id, state) {
    if (!id) return;
    const prev = this._optimisticTimeouts.get(id);
    if (prev) clearTimeout(prev);
    this._optimisticStates = { ...this._optimisticStates, [id]: state };
    const t3 = setTimeout(() => this._clearOptimisticState(id), OPTIMISTIC_TIMEOUT_MS);
    this._optimisticTimeouts.set(id, t3);
  }
  _clearOptimisticState(id) {
    if (!id || !(id in this._optimisticStates)) return;
    const next = { ...this._optimisticStates };
    delete next[id];
    this._optimisticStates = next;
    const t3 = this._optimisticTimeouts.get(id);
    if (t3) {
      clearTimeout(t3);
      this._optimisticTimeouts.delete(id);
    }
  }
  _clearAllOptimisticStates() {
    for (const t3 of this._optimisticTimeouts.values()) clearTimeout(t3);
    this._optimisticTimeouts.clear();
    this._optimisticStates = {};
  }
  /* ─── Action handlers ────────────────────────────────────────────────── */
  async _onChargeToggle() {
    const id = this._resolvedEntities.chargeSession;
    if (!this.hass || !id) return;
    const next = this._isOn(id) ? "off" : "on";
    this._setOptimisticState(id, next);
    try {
      await this.hass.callService("switch", next === "on" ? "turn_on" : "turn_off", { entity_id: id });
    } catch {
      this._clearOptimisticState(id);
    }
  }
  async _onSurplusToggle() {
    const id = this._resolvedEntities.surplusMode;
    if (!this.hass || !id) return;
    const next = this._isOn(id) ? "off" : "on";
    this._setOptimisticState(id, next);
    try {
      await this.hass.callService("switch", next === "on" ? "turn_on" : "turn_off", { entity_id: id });
    } catch {
      this._clearOptimisticState(id);
    }
  }
  async _onReboot() {
    const id = this._resolvedEntities.reboot;
    if (!this.hass || !id) return;
    try {
      await this.hass.callService("button", "press", { entity_id: id });
    } catch {
    }
  }
  async _setProfile(option) {
    const id = this._resolvedEntities.surplusProfile;
    if (!this.hass || !id) return;
    this._setOptimisticState(id, option);
    try {
      await this.hass.callService("select", "select_option", { entity_id: id, option });
    } catch {
      this._clearOptimisticState(id);
    }
  }
  _onThresholdInput(entityId, ev) {
    if (!entityId) return;
    const value = parseInt(ev.target.value, 10);
    this._sliderValues = { ...this._sliderValues, [entityId]: value };
  }
  async _onThresholdChange(entityId, ev) {
    if (!this.hass || !entityId) return;
    const value = parseInt(ev.target.value, 10);
    const next = { ...this._sliderValues };
    delete next[entityId];
    this._sliderValues = next;
    this._setOptimisticState(entityId, String(value));
    try {
      await this.hass.callService("number", "set_value", { entity_id: entityId, value });
    } catch {
      this._clearOptimisticState(entityId);
    }
  }
  async _setChargeCurrent(value, minimum, maximum, allowed = []) {
    const id = this._resolvedEntities.chargeCurrent;
    if (!this.hass || !id) return;
    const clamped = Math.max(minimum, Math.min(maximum, Math.round(value)));
    const target = allowed.length > 0 ? allowed.filter((c4) => c4 >= minimum && c4 <= maximum).reduce((best, c4) => Math.abs(c4 - clamped) < Math.abs(best - clamped) ? c4 : best, clamped) : clamped;
    this._setOptimisticState(id, String(target));
    try {
      await this.hass.callService("number", "set_value", { entity_id: id, value: target });
    } catch {
      this._clearOptimisticState(id);
    }
  }
  _stepCurrent(dir, current, allowed, min, max, step) {
    const filtered = allowed.filter((c4) => c4 >= min && c4 <= max).sort((a3, b3) => a3 - b3);
    if (filtered.length > 0) {
      const cur = current ?? filtered[0];
      if (dir < 0) {
        for (let i5 = filtered.length - 1; i5 >= 0; i5--) {
          if (filtered[i5] < cur) return filtered[i5];
        }
        return filtered[0];
      }
      for (const c4 of filtered) {
        if (c4 > cur) return c4;
      }
      return filtered[filtered.length - 1];
    }
    return (current ?? min) + dir * step;
  }
};
TuyaEvChargerCard.properties = {
  hass: { attribute: false },
  _config: { attribute: false, state: true },
  _activeTab: { state: true },
  _graphHistory: { state: true },
  _graphHistoryLoading: { state: true },
  _resolvedEntities: { state: true },
  _optimisticStates: { state: true },
  _sliderValues: { state: true }
};
/* ─── Styles ─────────────────────────────────────────────────────────── */
TuyaEvChargerCard.styles = i`
    /* ── Design tokens ── */
    :host {
      --kin-primary: #8eff71;
      --kin-on-primary: #0d6100;
      --kin-secondary: #6bfe9c;
      --kin-tertiary: #69daff;
      --kin-error: #ff7351;
      --kin-surface: #0e0e0e;
      --kin-surface-low: #131313;
      --kin-surface-container: #1a1a1a;
      --kin-surface-high: #20201f;
      --kin-surface-highest: #262626;
      --kin-on-surface: #ffffff;
      --kin-on-variant: #adaaaa;
      --kin-outline: #484847;

      display: block;
      font-family: 'Inter', 'Segoe UI', sans-serif;
      color: var(--kin-on-surface);
    }

    ha-card {
      background: var(--kin-surface);
      border-radius: 20px;
      overflow: hidden;
      border: none;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
    }

    .pad { padding: 16px; }

    /* ── App shell ── */
    .app {
      display: flex;
      flex-direction: column;
      min-height: 560px;
    }
    .app-content {
      flex: 1;
      overflow-y: auto;
    }

    /* Material Symbols icon class */
    .mso {
      font-family: 'Material Symbols Outlined', sans-serif;
      font-weight: normal;
      font-style: normal;
      font-size: 1.25rem;
      line-height: 1;
      display: inline-block;
      vertical-align: middle;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    /* ── Dashboard ── */
    .dashboard {
      padding: 20px 20px 8px;
      display: grid;
      gap: 16px;
    }

    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }

    .app-label {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: var(--kin-primary);
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .dash-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.3rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      text-transform: uppercase;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      justify-content: flex-end;
    }

    .chip {
      border-radius: 999px;
      padding: 3px 10px;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .chip-ok {
      background: rgba(142, 255, 113, 0.12);
      color: var(--kin-primary);
      border: 1px solid rgba(142, 255, 113, 0.3);
    }
    .chip-off {
      background: rgba(255, 255, 255, 0.05);
      color: var(--kin-on-variant);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    /* ── Gauge ── */
    .gauge-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
    }

    .gauge-wrap {
      position: relative;
      width: 220px;
      height: 220px;
    }

    .gauge-svg {
      width: 100%;
      height: 100%;
    }

    .gauge-arc--glow {
      filter: drop-shadow(0 0 10px rgba(142, 255, 113, 0.55));
    }

    .gauge-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .gauge-sublabel {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      margin-bottom: 4px;
    }

    .gauge-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2.8rem;
      font-weight: 700;
      line-height: 1;
      color: var(--kin-primary);
      letter-spacing: -0.03em;
    }

    .gauge-unit {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.2rem;
      font-weight: 500;
      color: var(--kin-primary);
      margin-top: 2px;
    }

    /* ── Status bar ── */
    .status-bar {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--kin-surface-low);
      padding: 8px 20px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .status-bar--active {
      border-color: rgba(142, 255, 113, 0.2);
    }

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--kin-on-variant);
      flex-shrink: 0;
    }
    .status-dot--pulse {
      background: var(--kin-primary);
      animation: pulse-ring 1.5s ease-out infinite;
    }

    @keyframes pulse-ring {
      0%   { box-shadow: 0 0 0 0 rgba(142, 255, 113, 0.5); }
      70%  { box-shadow: 0 0 0 7px rgba(142, 255, 113, 0); }
      100% { box-shadow: 0 0 0 0 rgba(142, 255, 113, 0); }
    }

    .status-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .status-divider {
      width: 1px;
      height: 14px;
      background: rgba(255,255,255,0.15);
    }
    .status-icon {
      font-size: 1rem;
      color: var(--kin-secondary);
    }
    .status-sub {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
    }

    /* ── Telemetry ── */
    .tele-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    .tele-tile {
      background: var(--kin-surface-low);
      border-radius: 14px;
      padding: 14px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .tele-icon { font-size: 1.3rem; }
    .tele-icon--tertiary { color: var(--kin-tertiary); }
    .tele-icon--secondary { color: var(--kin-secondary); }
    .tele-icon--error { color: var(--kin-error); }

    .tele-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
    }

    .tele-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.2rem;
      font-weight: 700;
      line-height: 1;
    }

    .tele-unit {
      font-size: 0.65rem;
      font-weight: 400;
      color: var(--kin-on-variant);
      margin-left: 1px;
    }

    /* ── Action buttons ── */
    .action-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .btn-action {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px 10px;
      border-radius: 14px;
      border: none;
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .btn-action:active { transform: scale(0.96); }
    .btn-action:disabled { opacity: 0.4; cursor: not-allowed; }

    .btn-pause {
      background: rgba(255, 255, 255, 0.06);
      color: var(--kin-on-surface);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .btn-pause:not(:disabled):hover { background: rgba(255,255,255,0.1); }

    .btn-emergency {
      background: #b92902;
      color: #ffd2c8;
      box-shadow: 0 6px 24px rgba(185, 41, 2, 0.3);
    }
    .btn-emergency:not(:disabled):hover { opacity: 0.9; }

    /* ── Charge current control ── */
    .current-box {
      background: var(--kin-surface-low);
      border-radius: 14px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .current-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--kin-on-variant);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .current-ctrl {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-step {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.1);
      background: var(--kin-surface-highest);
      color: var(--kin-on-surface);
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.12s;
    }
    .btn-step:not(:disabled):hover { background: rgba(142, 255, 113, 0.12); }
    .btn-step:disabled { opacity: 0.4; cursor: not-allowed; }

    .current-val {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      min-width: 52px;
      text-align: center;
      color: var(--kin-primary);
    }

    /* ── Strategy ── */
    .strategy {
      padding: 20px 20px 8px;
      display: grid;
      gap: 16px;
    }

    .page-header { display: grid; gap: 4px; }

    .page-sup {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--kin-primary);
    }

    .page-title {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1.6rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .strat-section {
      background: var(--kin-surface-container);
      border-radius: 16px;
      padding: 16px;
      display: grid;
      gap: 12px;
    }

    .strat-section-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
    }

    .strat-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .strat-row-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .strat-icon {
      font-size: 1.4rem;
      color: var(--kin-primary);
    }

    .strat-row-title {
      font-size: 0.88rem;
      font-weight: 600;
    }

    .strat-row-sub {
      font-size: 0.72rem;
      color: var(--kin-on-variant);
    }

    /* Toggle switch */
    .toggle {
      width: 52px;
      height: 30px;
      border-radius: 999px;
      background: var(--kin-surface-highest);
      border: none;
      position: relative;
      cursor: pointer;
      transition: background 0.2s;
      flex-shrink: 0;
    }
    .toggle--on { background: var(--kin-primary); }
    .toggle:disabled { opacity: 0.4; cursor: not-allowed; }

    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--kin-on-variant);
      transition: transform 0.2s, background 0.2s;
    }
    .toggle--on .toggle-thumb {
      transform: translateX(22px);
      background: var(--kin-on-primary);
    }

    /* Profile grid */
    .profile-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .profile-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 5px;
      padding: 14px 8px;
      border-radius: 14px;
      border: 2px solid rgba(255,255,255,0.06);
      background: var(--kin-surface-highest);
      color: var(--kin-on-variant);
      cursor: pointer;
      transition: border-color 0.15s, background 0.15s;
    }
    .profile-btn--active {
      border-color: rgba(142, 255, 113, 0.5);
      background: rgba(142, 255, 113, 0.08);
      color: var(--kin-on-surface);
    }
    .profile-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .profile-icon {
      font-size: 1.2rem;
      color: inherit;
    }
    .profile-btn--active .profile-icon { color: var(--kin-primary); }

    .profile-name {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .profile-thresholds {
      font-size: 0.58rem;
      color: var(--kin-on-variant);
    }

    /* Threshold sliders */
    .threshold-block { display: grid; gap: 10px; }

    .threshold-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
    }

    .threshold-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      margin-bottom: 4px;
    }

    .threshold-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
      color: var(--kin-on-surface);
    }
    .threshold-value--stop { color: var(--kin-error); }

    .threshold-unit {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 1rem;
      font-weight: 500;
      color: var(--kin-primary);
      margin-left: 3px;
    }
    .threshold-value--stop .threshold-unit { color: var(--kin-error); }

    .threshold-right-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      padding-bottom: 2px;
    }

    /* Range inputs */
    .slider {
      -webkit-appearance: none;
      appearance: none;
      width: 100%;
      height: 5px;
      border-radius: 999px;
      outline: none;
      cursor: pointer;
      border: none;
      padding: 0;
    }
    .slider:disabled { opacity: 0.4; cursor: not-allowed; }

    .slider--primary {
      background: linear-gradient(
        to right,
        var(--kin-primary) var(--pct, 0%),
        var(--kin-surface-highest) var(--pct, 0%)
      );
    }
    .slider--error {
      background: linear-gradient(
        to right,
        var(--kin-error) var(--pct, 0%),
        var(--kin-surface-highest) var(--pct, 0%)
      );
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--kin-on-surface);
      cursor: pointer;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
      transition: transform 0.1s;
    }
    .slider:not(:disabled)::-webkit-slider-thumb:active { transform: scale(1.15); }

    .slider::-moz-range-thumb {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--kin-on-surface);
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 12px rgba(0,0,0,0.4);
    }

    /* Live status */
    .live-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .live-item {
      background: var(--kin-surface-high);
      border-radius: 12px;
      padding: 12px;
    }

    .live-item-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      margin-bottom: 5px;
    }

    .live-item-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--kin-primary);
    }

    .live-item-value--decision {
      font-family: 'Inter', sans-serif;
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--kin-on-surface);
      word-break: break-word;
    }

    /* ── Logs ── */
    .logs {
      padding: 20px 20px 8px;
      display: grid;
      gap: 16px;
    }

    .logs-section { display: grid; gap: 10px; }

    .logs-section-label {
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
    }

    /* Graph */
    .graph-wrap {
      background: var(--kin-surface-low);
      border-radius: 14px;
      padding: 10px 10px 8px;
    }

    .graph-svg {
      width: 100%;
      height: 90px;
      display: block;
    }

    .graph-empty {
      background: var(--kin-surface-low);
      border-radius: 14px;
      color: var(--kin-on-variant);
      font-size: 0.78rem;
      padding: 20px;
      text-align: center;
    }

    .graph-axis { stroke: rgba(255,255,255,0.1); stroke-width: 1; }

    .graph-line {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .graph-line--power   { stroke: #69daff; }
    .graph-line--surplus { stroke: var(--kin-primary); }

    .graph-legend {
      display: flex;
      gap: 14px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      color: var(--kin-on-variant);
    }
    .legend-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
    .legend-dot--power   { background: #69daff; }
    .legend-dot--surplus { background: var(--kin-primary); }

    /* Diagnostics */
    .diag-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .diag-card {
      background: var(--kin-surface-container);
      border-radius: 14px;
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .diag-icon-wrap {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--kin-on-variant);
      flex-shrink: 0;
    }
    .diag-icon-wrap--ok   { background: rgba(142, 255, 113, 0.1); color: var(--kin-primary); }
    .diag-icon-wrap--warn { background: rgba(255, 115, 81, 0.12); color: var(--kin-error); }

    .diag-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      margin-bottom: 3px;
    }

    .diag-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.78rem;
      font-weight: 700;
    }

    /* Debug grid */
    .debug-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .debug-item {
      background: var(--kin-surface-container);
      border-radius: 12px;
      padding: 12px;
    }

    .debug-item-label {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--kin-on-variant);
      margin-bottom: 5px;
    }

    .debug-item-value {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--kin-primary);
    }

    /* Terminal log */
    .terminal {
      background: #000;
      border-radius: 14px;
      padding: 16px;
      font-family: 'Courier New', monospace;
      font-size: 0.75rem;
      border: 1px solid rgba(255,255,255,0.06);
      position: relative;
      overflow: hidden;
    }

    .terminal-icon-bg {
      position: absolute;
      top: 8px;
      right: 10px;
      opacity: 0.08;
      pointer-events: none;
      font-size: 2.5rem;
      color: var(--kin-on-surface);
    }

    .terminal-line {
      display: flex;
      gap: 10px;
      align-items: baseline;
      flex-wrap: wrap;
    }

    .terminal-ts { color: var(--kin-on-variant); flex-shrink: 0; }

    .terminal-tag {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 4px;
      flex-shrink: 0;
    }
    .terminal-tag--active {
      background: rgba(142, 255, 113, 0.15);
      color: var(--kin-primary);
    }

    .terminal-msg { color: var(--kin-on-surface); flex: 1; word-break: break-word; }

    .terminal-footer {
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .terminal-live {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.6rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--kin-on-variant);
    }

    .terminal-live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--kin-primary);
      animation: pulse-ring 1.5s ease-out infinite;
    }

    /* ── Bottom nav ── */
    .bottom-nav {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      background: rgba(19, 19, 19, 0.85);
      backdrop-filter: blur(16px);
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 10px 8px 14px;
      gap: 4px;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 4px;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: var(--kin-on-variant);
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
    }
    .nav-item:hover { color: var(--kin-on-surface); }
    .nav-item--active {
      background: var(--kin-surface-highest);
      color: var(--kin-primary);
    }

    .nav-icon {
      font-size: 1.3rem;
      transition: color 0.15s;
    }

    .nav-label {
      font-size: 0.58rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }

    /* ── Responsive ── */
    @media (max-width: 380px) {
      .tele-grid, .action-grid { grid-template-columns: 1fr; }
      .profile-grid { grid-template-columns: repeat(3, 1fr); }
      .diag-row, .debug-grid, .live-grid { grid-template-columns: 1fr; }
    }
  `;
customElements.define("tuya-ev-charger-card", TuyaEvChargerCard);
var ENTITY_FIELD_SPECS = [
  { key: "charge_session", label: "Charge session switch", domain: "switch", suffixes: ["charge_session"] },
  { key: "surplus_mode", label: "Surplus mode switch", domain: "switch", suffixes: ["surplus_mode"] },
  { key: "surplus_profile", label: "Surplus profile select", domain: "select", suffixes: ["surplus_profile"] },
  { key: "charge_current", label: "Charge current number", domain: "number", suffixes: ["charge_current"] },
  { key: "surplus_start_threshold", label: "Start threshold number", domain: "number", suffixes: ["surplus_start_threshold_w"] },
  { key: "surplus_stop_threshold", label: "Stop threshold number", domain: "number", suffixes: ["surplus_stop_threshold_w"] },
  { key: "power", label: "Power sensor", domain: "sensor", suffixes: ["power_l1"] },
  { key: "current", label: "Current sensor", domain: "sensor", suffixes: ["current_l1"] },
  { key: "voltage", label: "Voltage sensor", domain: "sensor", suffixes: ["voltage_l1"] },
  { key: "temperature", label: "Temperature sensor", domain: "sensor", suffixes: ["temperature"] },
  { key: "work_state", label: "Work state sensor", domain: "sensor", suffixes: ["work_state"] },
  { key: "selftest", label: "Self-test sensor", domain: "sensor", suffixes: ["selftest"] },
  { key: "alarm", label: "Alarm sensor", domain: "sensor", suffixes: ["alarm"] },
  { key: "last_decision", label: "Last decision sensor", domain: "sensor", suffixes: ["surplus_last_decision_reason"] },
  { key: "surplus_effective", label: "Effective surplus sensor", domain: "sensor", suffixes: ["surplus_effective_w"] },
  { key: "surplus_raw", label: "Raw surplus sensor", domain: "sensor", suffixes: ["surplus_raw_w"] },
  { key: "surplus_discharge_over_limit", label: "Battery over-limit sensor", domain: "sensor", suffixes: ["surplus_battery_discharge_over_limit_w"] },
  { key: "surplus_target_current", label: "Target current sensor", domain: "sensor", suffixes: ["surplus_target_current_a"] },
  { key: "regulation_active", label: "Regulation active binary sensor", domain: "binary_sensor", suffixes: ["surplus_regulation_active"] },
  { key: "reboot", label: "Reboot button", domain: "button", suffixes: ["reboot_charger"] }
];
var normalizeToken = (input) => String(input ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
var ENTITY_FIELD_KEY_SET = new Set(ENTITY_FIELD_SPECS.map((f3) => f3.key));
var TuyaEvChargerCardEditor = class extends i4 {
  constructor() {
    super(...arguments);
    this._config = TuyaEvChargerCard.getStubConfig();
    this._stateIndexCache = /* @__PURE__ */ new WeakMap();
  }
  setConfig(config) {
    this._config = {
      ...TuyaEvChargerCard.getStubConfig(),
      ...config,
      entities: { ...config.entities ?? {} }
    };
  }
  render() {
    const cfg = this._config;
    const entities = cfg.entities ?? {};
    const detectedTokens = this._detectedChargerTokens();
    const selectedToken = normalizeToken(cfg.charger_name);
    return b2`
      <div class="editor">
        <h3>Layout</h3>
        <label>
          <span>Card title</span>
          <input
            type="text"
            .value=${cfg.title ?? ""}
            @input=${(e4) => this._updateRootText("title", e4.target.value)}
          />
        </label>
        <label>
          <span>Detected EV Charger instance</span>
          <div class="inline">
            <select
              .value=${selectedToken}
              @change=${(e4) => this._autoFillFromToken(e4.target.value)}
            >
              <option value="">Select…</option>
              ${detectedTokens.map(
      (t3) => b2`<option value=${t3}>${t3}</option>`
    )}
            </select>
            ${selectedToken ? b2`<button @click=${this._clearAutoFill}>Clear</button>` : A}
          </div>
        </label>

        <h3>Entities</h3>
        ${ENTITY_FIELD_SPECS.map((spec) => {
      const value = entities[spec.key] ?? "";
      const suggestions = this._suggestionsForField(spec, selectedToken);
      return b2`
            <label>
              <span>${spec.label}</span>
              <input
                type="text"
                .value=${value}
                list="suggestions-${spec.key}"
                @input=${(e4) => this._updateEntityField(spec.key, e4.target.value)}
                placeholder=${suggestions[0] ?? `${spec.domain}.*`}
              />
              <datalist id="suggestions-${spec.key}">
                ${suggestions.map((s4) => b2`<option value=${s4}></option>`)}
              </datalist>
            </label>
          `;
    })}
      </div>
    `;
  }
  _detectedChargerTokens() {
    if (!this.hass) return [];
    const idx = this._stateIndex();
    return [...idx.rolesByToken.keys()].sort();
  }
  _stateIndex() {
    if (!this.hass) {
      return { all: [], byDomain: /* @__PURE__ */ new Map(), byRole: /* @__PURE__ */ new Map(), rolesByToken: /* @__PURE__ */ new Map() };
    }
    const states = this.hass.states;
    if (this._stateIndexCache.has(states)) {
      return this._stateIndexCache.get(states);
    }
    const all = Object.keys(states);
    const byDomain = /* @__PURE__ */ new Map();
    const byRole = /* @__PURE__ */ new Map();
    const rolesByToken = /* @__PURE__ */ new Map();
    for (const id of all) {
      const domain = id.split(".")[0];
      const existing = byDomain.get(domain) ?? [];
      existing.push(id);
      byDomain.set(domain, existing);
      const attrs = states[id].attributes;
      const role = attrs[ATTR_CARD_ROLE];
      const token = attrs[ATTR_CHARGER_TOKEN];
      if (role && ENTITY_FIELD_KEY_SET.has(role)) {
        const rKey = role;
        const rList = byRole.get(rKey) ?? [];
        rList.push(id);
        byRole.set(rKey, rList);
        if (token) {
          const tokenSet = rolesByToken.get(token) ?? /* @__PURE__ */ new Set();
          tokenSet.add(rKey);
          rolesByToken.set(token, tokenSet);
        }
      }
    }
    const idx = { all, byDomain, byRole, rolesByToken };
    this._stateIndexCache.set(states, idx);
    return idx;
  }
  _suggestionsForField(spec, token) {
    if (!this.hass) return [];
    const idx = this._stateIndex();
    const fromRole = idx.byRole.get(spec.key) ?? [];
    const fromDomain = idx.byDomain.get(spec.domain) ?? [];
    const fromSuffix = token ? spec.suffixes.map((s4) => `${spec.domain}.${token}_${s4}`).filter((id) => this.hass.states[id]) : [];
    return [.../* @__PURE__ */ new Set([...fromSuffix, ...fromRole, ...fromDomain])].slice(0, 8);
  }
  _autoFillFromToken(token) {
    if (!token || !this.hass) {
      this._updateRootText("charger_name", "");
      return;
    }
    this._updateRootText("charger_name", token);
    const newEntities = { ...this._config.entities ?? {} };
    for (const spec of ENTITY_FIELD_SPECS) {
      for (const suffix of spec.suffixes) {
        const candidate = `${spec.domain}.${token}_${suffix}`;
        if (this.hass.states[candidate]) {
          newEntities[spec.key] = candidate;
          break;
        }
      }
    }
    this._fireConfigChanged({ ...this._config, charger_name: token, entities: newEntities });
  }
  _clearAutoFill() {
    this._fireConfigChanged({ ...this._config, charger_name: void 0, entities: {} });
  }
  _updateRootText(key, value) {
    this._fireConfigChanged({ ...this._config, [key]: value || void 0 });
  }
  _updateEntityField(key, value) {
    const entities = { ...this._config.entities ?? {}, [key]: value || void 0 };
    this._fireConfigChanged({ ...this._config, entities });
  }
  _fireConfigChanged(config) {
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
};
TuyaEvChargerCardEditor.properties = {
  hass: { attribute: false },
  _config: { attribute: false, state: true }
};
TuyaEvChargerCardEditor.styles = i`
    .editor { display: grid; gap: 10px; padding: 8px 0; }
    h3 { margin: 8px 0 2px; font-size: 0.85rem; font-weight: 600; color: var(--secondary-text-color); }
    label { display: grid; gap: 4px; font-size: 0.82rem; }
    label span { color: var(--secondary-text-color); font-size: 0.78rem; }
    input, select {
      width: 100%;
      padding: 6px 10px;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 0.85rem;
      box-sizing: border-box;
    }
    .inline { display: flex; gap: 6px; }
    .inline select { flex: 1; }
    .inline button {
      padding: 6px 10px;
      border-radius: 6px;
      border: 1px solid var(--divider-color);
      background: transparent;
      color: var(--primary-text-color);
      cursor: pointer;
      font-size: 0.8rem;
      white-space: nowrap;
    }
  `;
customElements.define("tuya-ev-charger-card-editor", TuyaEvChargerCardEditor);
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
lit-html/lit-html.js:
lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
