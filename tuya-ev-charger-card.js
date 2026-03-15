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
var ATTR_CARD_ROLE = "tuya_ev_charger_card_role";
var ATTR_CARD_INDEX = "tuya_ev_charger_card_index";
var ATTR_CHARGER_TOKEN = "tuya_ev_charger_token";
var GRAPH_SAMPLE_INTERVAL_MS = 3e4;
var GRAPH_WINDOW_MS = 36e5;
var GRAPH_MAX_POINTS = GRAPH_WINDOW_MS / GRAPH_SAMPLE_INTERVAL_MS;
var GRAPH_HISTORY_RETRY_MS = 6e4;
var OPTIMISTIC_TIMEOUT_MS = 12e3;
var TuyaEvChargerCard = class extends i4 {
  constructor() {
    super(...arguments);
    this._detailsOpen = false;
    this._debugOpen = false;
    this._graphHistory = [];
    this._graphHistoryLoading = false;
    this._resolvedEntities = {};
    this._lastRenderSignature = "";
    this._optimisticStates = {};
    this._optimisticTimeouts = /* @__PURE__ */ new Map();
    this._graphHistoryFetchInFlight = false;
    this._graphHistoryHydratedKey = "";
    this._graphHistoryLastFailedAt = 0;
    this._toggleDetails = () => {
      this._detailsOpen = !this._detailsOpen;
    };
    this._toggleDebug = () => {
      this._debugOpen = !this._debugOpen;
    };
  }
  static getStubConfig() {
    return {
      type: "custom:tuya-ev-charger-card",
      title: "EV Charger"
    };
  }
  static getConfigElement() {
    return document.createElement("tuya-ev-charger-card-editor");
  }
  setConfig(config) {
    if (!config || config.type !== "custom:tuya-ev-charger-card") {
      throw new Error("Invalid card configuration.");
    }
    this._config = config;
    this._resolvedEntities = this._resolveConfiguredEntities(config);
    this._graphHistory = [];
    this._graphHistoryLoading = false;
    this._graphHistoryHydratedKey = "";
    this._graphHistoryLastFailedAt = 0;
    this._clearAllOptimisticStates();
    this._lastRenderSignature = "";
  }
  disconnectedCallback() {
    this._clearAllOptimisticStates();
    this._graphHistoryFetchInFlight = false;
    this._graphHistoryLoading = false;
    super.disconnectedCallback();
  }
  shouldUpdate(changed) {
    if (changed.has("_config") || changed.has("_resolvedEntities") || changed.has("_detailsOpen") || changed.has("_debugOpen") || changed.has("_graphHistory") || changed.has("_optimisticStates")) {
      return true;
    }
    if (changed.has("hass")) {
      this._syncOptimisticStatesWithHass();
      this._maybeHydrateGraphHistory();
      const graphChanged = this._appendGraphSample();
      const nextSignature = this._stateSignature();
      const stateChanged = nextSignature !== this._lastRenderSignature;
      if (stateChanged) {
        this._lastRenderSignature = nextSignature;
      }
      return graphChanged || stateChanged;
    }
    return false;
  }
  render() {
    if (!this._config || !this.hass) {
      return b2`<ha-card><div class="pad">Card not ready.</div></ha-card>`;
    }
    const title = this._config.title ?? "Tuya EV Charger";
    const chargeOn = this._isOn(this._resolvedEntities.chargeSession);
    const surplusOn = this._isOn(this._resolvedEntities.surplusMode);
    const regulationOn = this._isOn(this._resolvedEntities.regulationActive);
    const powerW = this._powerW(this._resolvedEntities.power);
    const currentA = this._numberState(this._resolvedEntities.current);
    const targetA = this._numberState(this._resolvedEntities.surplusTargetCurrent);
    const profile = this._state(this._resolvedEntities.surplusProfile) ?? "balanced";
    const lastDecision = this._state(this._resolvedEntities.lastDecision) ?? "unavailable";
    const rawSurplusW = this._powerW(this._resolvedEntities.surplusRaw);
    const effectiveSurplusW = this._powerW(this._resolvedEntities.surplusEffective);
    const dischargeOverLimitW = this._powerW(
      this._resolvedEntities.surplusDischargeOverLimit
    );
    const chargeCurrentEntity = this._entity(this._resolvedEntities.chargeCurrent);
    const chargeCurrentSetpoint = this._numberState(this._resolvedEntities.chargeCurrent);
    const allowedCurrents = this._allowedCurrents(chargeCurrentEntity);
    const currentMin = this._attrNumber(chargeCurrentEntity, "min") ?? this._attrNumber(chargeCurrentEntity, "native_min_value") ?? 6;
    const currentMax = this._attrNumber(chargeCurrentEntity, "max") ?? this._attrNumber(chargeCurrentEntity, "native_max_value") ?? 16;
    const currentStep = this._attrNumber(chargeCurrentEntity, "step") ?? this._attrNumber(chargeCurrentEntity, "native_step") ?? 1;
    return b2`
      <ha-card>
        <div class="card">
          <div class="header">
            <div>
              <div class="title">${title}</div>
              <div class="subtitle">Tuya EV Charger Local</div>
            </div>
            <div class="chips">
              <span class="chip ${chargeOn ? "ok" : "off"}"
                >${chargeOn ? "Charging" : "Idle"}</span
              >
              <span class="chip ${surplusOn ? "ok" : "off"}"
                >${surplusOn ? "Surplus" : "Manual"}</span
              >
              <span class="chip ${regulationOn ? "ok" : "off"}"
                >${regulationOn ? "Regulating" : "Hold"}</span
              >
            </div>
          </div>

          <div class="metrics">
            ${this._metric("Power", this._formatPower(powerW))}
            ${this._metric("Current", this._formatAmp(currentA))}
            ${this._metric("Target", this._formatAmp(targetA))}
          </div>

          ${this._renderGraph()}

          <div class="controls">
            <button
              class="btn primary"
              @click=${this._onChargeSessionToggle}
              ?disabled=${!this._resolvedEntities.chargeSession}
            >
              ${chargeOn ? "Stop" : "Start"}
            </button>
            <button
              class="btn"
              @click=${this._onSurplusModeToggle}
              ?disabled=${!this._resolvedEntities.surplusMode}
            >
              ${surplusOn ? "Surplus On" : "Surplus Off"}
            </button>
          </div>

          <div class="current-box">
            <button
              class="btn tiny"
              @click=${() => {
      const target = this._stepChargeCurrent(
        -1,
        chargeCurrentSetpoint,
        allowedCurrents,
        currentMin,
        currentMax,
        currentStep
      );
      this._setChargeCurrent(target, currentMin, currentMax, allowedCurrents);
    }}
              ?disabled=${!this._resolvedEntities.chargeCurrent}
            >
              -
            </button>
            <div class="current-value">${this._formatAmp(chargeCurrentSetpoint)}</div>
            <button
              class="btn tiny"
              @click=${() => {
      const target = this._stepChargeCurrent(
        1,
        chargeCurrentSetpoint,
        allowedCurrents,
        currentMin,
        currentMax,
        currentStep
      );
      this._setChargeCurrent(target, currentMin, currentMax, allowedCurrents);
    }}
              ?disabled=${!this._resolvedEntities.chargeCurrent}
            >
              +
            </button>
          </div>

          <div class="profiles">
            ${PROFILE_OPTIONS.map(
      (option) => b2`
                <button
                  class="profile ${profile === option ? "active" : ""}"
                  @click=${() => this._setProfile(option)}
                  ?disabled=${!this._resolvedEntities.surplusProfile}
                >
                  ${option}
                </button>
              `
    )}
          </div>

          <button class="details-toggle" @click=${this._toggleDetails}>
            ${this._detailsOpen ? "Hide details" : "Show details"}
          </button>

          ${this._detailsOpen ? b2`
                <div class="details">
                  <div class="detail-row">
                    <span>Last decision</span>
                    <strong>${lastDecision}</strong>
                  </div>
                  <div class="detail-row">
                    <span>Surplus effective</span>
                    <strong>${this._formatPower(effectiveSurplusW)}</strong>
                  </div>
                  <button class="debug-toggle" @click=${this._toggleDebug}>
                    ${this._debugOpen ? "Hide debug" : "Show debug"}
                  </button>
                  ${this._debugOpen ? b2`
                        <div class="debug-grid">
                          ${this._debugValue("Raw surplus", this._formatPower(rawSurplusW))}
                          ${this._debugValue(
      "Effective surplus",
      this._formatPower(effectiveSurplusW)
    )}
                          ${this._debugValue(
      "Battery over limit",
      this._formatPower(dischargeOverLimitW)
    )}
                          ${this._debugValue(
      "Target current",
      this._formatAmp(targetA)
    )}
                        </div>
                      ` : A}
                </div>
              ` : A}
        </div>
      </ha-card>
    `;
  }
  _renderGraph() {
    const points = this._graphHistory;
    if (points.length < 2) {
      return b2`<div class="graph-empty"
        >${this._graphHistoryLoading ? "Loading history..." : "Collecting graph samples..."}</div
      >`;
    }
    const width = 360;
    const height = 90;
    const allValues = points.flatMap(
      (sample) => [sample.powerW, sample.surplusW].filter((v2) => v2 !== null)
    );
    const maxAbs = Math.max(500, ...allValues.map((v2) => Math.abs(v2)));
    const min = -maxAbs;
    const max = maxAbs;
    const powerPath = this._buildPath(
      points.map((sample) => sample.powerW),
      min,
      max,
      width,
      height
    );
    const surplusPath = this._buildPath(
      points.map((sample) => sample.surplusW),
      min,
      max,
      width,
      height
    );
    const zeroY = this._scaleY(0, min, max, height);
    return b2`
      <div class="graph-wrap">
        <svg
          class="graph"
          viewBox="0 0 ${width} ${height}"
          preserveAspectRatio="none"
          aria-label="Power and surplus graph"
        >
          <line x1="0" y1="${zeroY}" x2="${width}" y2="${zeroY}" class="axis"></line>
          <path d="${powerPath}" class="line power"></path>
          <path d="${surplusPath}" class="line surplus"></path>
        </svg>
        <div class="legend">
          <span class="leg"><i class="dot power"></i>Grid+EV power</span>
          <span class="leg"><i class="dot surplus"></i>Effective surplus</span>
        </div>
      </div>
    `;
  }
  _metric(label, value) {
    return b2`<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
  }
  _debugValue(label, value) {
    return b2`<div class="debug-item"><span>${label}</span><strong>${value}</strong></div>`;
  }
  _resolveConfiguredEntities(config) {
    const token = this._normalizeToken(config.charger_name);
    const configured = config.entities ?? {};
    const fallback = (domain, suffix) => token ? `${domain}.${token}_${suffix}` : void 0;
    return {
      power: configured.power ?? fallback("sensor", "power_l1"),
      current: configured.current ?? fallback("sensor", "current_l1"),
      chargeCurrent: configured.charge_current ?? fallback("number", "charge_current"),
      chargeSession: configured.charge_session ?? fallback("switch", "charge_session"),
      surplusMode: configured.surplus_mode ?? fallback("switch", "surplus_mode"),
      surplusProfile: configured.surplus_profile ?? fallback("select", "surplus_profile"),
      regulationActive: configured.regulation_active ?? fallback("binary_sensor", "surplus_regulation_active"),
      lastDecision: configured.last_decision ?? fallback("sensor", "surplus_last_decision_reason"),
      surplusRaw: configured.surplus_raw ?? fallback("sensor", "surplus_raw_w"),
      surplusEffective: configured.surplus_effective ?? fallback("sensor", "surplus_effective_w"),
      surplusDischargeOverLimit: configured.surplus_discharge_over_limit ?? fallback("sensor", "surplus_battery_discharge_over_limit_w"),
      surplusTargetCurrent: configured.surplus_target_current ?? fallback("sensor", "surplus_target_current_a")
    };
  }
  _stateSignature() {
    if (!this.hass) {
      return "no-hass";
    }
    const trackedIds = this._trackedEntityIds();
    if (!trackedIds.length) {
      return "no-tracked-entities";
    }
    const parts = [];
    for (const entityId of trackedIds) {
      const entity = this.hass.states[entityId];
      if (!entity) {
        parts.push(`${entityId}:missing`);
        continue;
      }
      parts.push(`${entityId}:${entity.state}`);
      if (entityId === this._resolvedEntities.chargeCurrent) {
        const attributes = entity.attributes;
        const rawAllowed = attributes.allowed_currents ?? attributes.available_currents ?? attributes.adjust_current_options ?? "";
        const allowed = Array.isArray(rawAllowed) ? rawAllowed.join(",") : String(rawAllowed);
        const min = attributes.min ?? attributes.native_min_value ?? "";
        const max = attributes.max ?? attributes.native_max_value ?? "";
        const step = attributes.step ?? attributes.native_step ?? "";
        parts.push(`charge_meta:${allowed}|${min}|${max}|${step}`);
      }
    }
    return parts.join(";");
  }
  _trackedEntityIds() {
    const all = [
      this._resolvedEntities.power,
      this._resolvedEntities.current,
      this._resolvedEntities.chargeCurrent,
      this._resolvedEntities.chargeSession,
      this._resolvedEntities.surplusMode,
      this._resolvedEntities.surplusProfile,
      this._resolvedEntities.regulationActive,
      this._resolvedEntities.lastDecision,
      this._resolvedEntities.surplusRaw,
      this._resolvedEntities.surplusEffective,
      this._resolvedEntities.surplusDischargeOverLimit,
      this._resolvedEntities.surplusTargetCurrent
    ];
    return [...new Set(all.filter((value) => Boolean(value)))];
  }
  _syncOptimisticStatesWithHass() {
    if (!this.hass) {
      return;
    }
    const entries = Object.entries(this._optimisticStates);
    if (!entries.length) {
      return;
    }
    let changed = false;
    const next = { ...this._optimisticStates };
    for (const [entityId, optimisticState] of entries) {
      const realState = this.hass.states[entityId]?.state;
      if (realState === void 0 || realState === optimisticState) {
        delete next[entityId];
        const timeout = this._optimisticTimeouts.get(entityId);
        if (timeout) {
          clearTimeout(timeout);
          this._optimisticTimeouts.delete(entityId);
        }
        changed = true;
      }
    }
    if (changed) {
      this._optimisticStates = next;
    }
  }
  _setOptimisticState(entityId, state) {
    if (!entityId) {
      return;
    }
    const previous = this._optimisticTimeouts.get(entityId);
    if (previous) {
      clearTimeout(previous);
    }
    this._optimisticStates = {
      ...this._optimisticStates,
      [entityId]: state
    };
    const timeout = setTimeout(
      () => this._clearOptimisticState(entityId),
      OPTIMISTIC_TIMEOUT_MS
    );
    this._optimisticTimeouts.set(entityId, timeout);
  }
  _clearOptimisticState(entityId) {
    if (!entityId || !(entityId in this._optimisticStates)) {
      return;
    }
    const next = { ...this._optimisticStates };
    delete next[entityId];
    this._optimisticStates = next;
    const timeout = this._optimisticTimeouts.get(entityId);
    if (timeout) {
      clearTimeout(timeout);
      this._optimisticTimeouts.delete(entityId);
    }
  }
  _clearAllOptimisticStates() {
    if (!Object.keys(this._optimisticStates).length && this._optimisticTimeouts.size === 0) {
      return;
    }
    for (const timeout of this._optimisticTimeouts.values()) {
      clearTimeout(timeout);
    }
    this._optimisticTimeouts.clear();
    this._optimisticStates = {};
  }
  _normalizeToken(input) {
    return String(input ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  }
  _appendGraphSample() {
    if (!this.hass) {
      return false;
    }
    const now = Date.now();
    const lastSample = this._graphHistory[this._graphHistory.length - 1];
    if (lastSample && now - lastSample.ts < GRAPH_SAMPLE_INTERVAL_MS) {
      return false;
    }
    const powerW = this._powerW(this._resolvedEntities.power);
    const surplusW = this._powerW(this._resolvedEntities.surplusEffective);
    const next = { ts: now, powerW, surplusW };
    const cutoffTs = now - GRAPH_WINDOW_MS;
    const history = [...this._graphHistory, next].filter((sample) => sample.ts >= cutoffTs).slice(-GRAPH_MAX_POINTS);
    this._graphHistory = history;
    return true;
  }
  _graphHydrationKey() {
    return [this._resolvedEntities.power, this._resolvedEntities.surplusEffective].filter((value) => Boolean(value)).join("|");
  }
  _maybeHydrateGraphHistory() {
    const key = this._graphHydrationKey();
    if (!this.hass || !this.hass.callApi || !key) {
      return;
    }
    if (this._graphHistoryFetchInFlight) {
      return;
    }
    if (this._graphHistoryHydratedKey === key && this._graphHistory.length >= 2) {
      return;
    }
    if (this._graphHistoryLastFailedAt > 0 && Date.now() - this._graphHistoryLastFailedAt < GRAPH_HISTORY_RETRY_MS) {
      return;
    }
    void this._hydrateGraphHistory(key);
  }
  async _hydrateGraphHistory(key) {
    if (!this.hass || !this.hass.callApi) {
      return;
    }
    const entityIds = [
      this._resolvedEntities.power,
      this._resolvedEntities.surplusEffective
    ].filter((value) => Boolean(value));
    if (!entityIds.length) {
      return;
    }
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
      if (key !== this._graphHydrationKey()) {
        return;
      }
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
    if (!powerSeries.length && !surplusSeries.length) {
      return [];
    }
    const alignedStartTs = Math.floor(startTs / GRAPH_SAMPLE_INTERVAL_MS) * GRAPH_SAMPLE_INTERVAL_MS;
    const points = [];
    let powerIndex = 0;
    let surplusIndex = 0;
    let powerValue = null;
    let surplusValue = null;
    for (let ts = alignedStartTs; ts <= endTs; ts += GRAPH_SAMPLE_INTERVAL_MS) {
      while (powerIndex < powerSeries.length && powerSeries[powerIndex].ts <= ts) {
        powerValue = powerSeries[powerIndex].valueW;
        powerIndex += 1;
      }
      while (surplusIndex < surplusSeries.length && surplusSeries[surplusIndex].ts <= ts) {
        surplusValue = surplusSeries[surplusIndex].valueW;
        surplusIndex += 1;
      }
      points.push({ ts, powerW: powerValue, surplusW: surplusValue });
    }
    return points.filter((sample) => sample.powerW !== null || sample.surplusW !== null).slice(-GRAPH_MAX_POINTS);
  }
  _historyByEntity(payload) {
    const grouped = /* @__PURE__ */ new Map();
    if (!Array.isArray(payload)) {
      return grouped;
    }
    for (const rawSeries of payload) {
      if (!Array.isArray(rawSeries)) {
        continue;
      }
      let fallbackEntityId = "";
      for (const rawState of rawSeries) {
        if (!rawState || typeof rawState !== "object") {
          continue;
        }
        const state = rawState;
        const entityIdRaw = state.entity_id;
        if (typeof entityIdRaw === "string" && entityIdRaw.trim()) {
          fallbackEntityId = entityIdRaw.trim();
        }
        if (!fallbackEntityId) {
          continue;
        }
        const list = grouped.get(fallbackEntityId) ?? [];
        list.push(state);
        grouped.set(fallbackEntityId, list);
      }
    }
    return grouped;
  }
  _seriesFromHistory(history, entityId) {
    const unit = this._entityPowerUnit(entityId);
    const series = [];
    for (const row of history) {
      const ts = this._historyTimestamp(row);
      if (ts === null) {
        continue;
      }
      const value = this._historyPowerValue(row.state);
      const valueW = value === null ? null : this._convertPowerToWatts(value, unit);
      series.push({ ts, valueW });
    }
    series.sort((a3, b3) => a3.ts - b3.ts);
    return series;
  }
  _historyTimestamp(row) {
    const rawTimestamp = row.last_changed ?? row.last_updated;
    if (typeof rawTimestamp !== "string") {
      return null;
    }
    const parsed = Date.parse(rawTimestamp);
    return Number.isFinite(parsed) ? parsed : null;
  }
  _historyPowerValue(value) {
    if (value === null || value === void 0) {
      return null;
    }
    const raw = String(value).trim().toLowerCase();
    if (!raw || raw === "unknown" || raw === "unavailable" || raw === "none") {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  _buildPath(values, min, max, width, height) {
    const step = width / Math.max(1, values.length - 1);
    let path = "";
    values.forEach((value, i5) => {
      if (value === null) {
        return;
      }
      const x2 = i5 * step;
      const y3 = this._scaleY(value, min, max, height);
      path += path ? ` L ${x2.toFixed(2)} ${y3.toFixed(2)}` : `M ${x2.toFixed(2)} ${y3.toFixed(2)}`;
    });
    return path;
  }
  _scaleY(value, min, max, height) {
    if (max <= min) {
      return height / 2;
    }
    const ratio = (value - min) / (max - min);
    return height - ratio * height;
  }
  _entity(entityId) {
    if (!entityId || !this.hass) {
      return void 0;
    }
    return this.hass.states[entityId];
  }
  _state(entityId) {
    if (!entityId) {
      return void 0;
    }
    const optimisticState = this._optimisticStates[entityId];
    if (optimisticState !== void 0) {
      return optimisticState;
    }
    return this._entity(entityId)?.state;
  }
  _isOn(entityId) {
    return this._state(entityId) === "on";
  }
  _numberState(entityId) {
    const state = this._state(entityId);
    if (state === void 0 || state === "unknown" || state === "unavailable") {
      return null;
    }
    const parsed = Number(state);
    return Number.isFinite(parsed) ? parsed : null;
  }
  _powerW(entityId) {
    const entity = this._entity(entityId);
    if (!entity) {
      return null;
    }
    const parsed = this._numberState(entityId);
    if (parsed === null) {
      return null;
    }
    const unit = this._entityPowerUnit(entityId);
    return this._convertPowerToWatts(parsed, unit);
  }
  _entityPowerUnit(entityId) {
    const entity = this._entity(entityId);
    return String(
      entity?.attributes.unit_of_measurement ?? entity?.attributes.native_unit_of_measurement ?? ""
    ).trim().toLowerCase();
  }
  _convertPowerToWatts(value, unit) {
    return unit === "kw" ? value * 1e3 : value;
  }
  _attrNumber(entity, key) {
    if (!entity) {
      return null;
    }
    const raw = entity.attributes[key];
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }
  _allowedCurrents(entity) {
    if (!entity) {
      return [];
    }
    const rawValues = [
      entity.attributes.allowed_currents,
      entity.attributes.available_currents,
      entity.attributes.adjust_current_options
    ];
    const parsed = [];
    for (const raw of rawValues) {
      if (Array.isArray(raw)) {
        for (const value of raw) {
          const numberValue = Number(value);
          if (Number.isFinite(numberValue)) {
            parsed.push(Math.round(numberValue));
          }
        }
        continue;
      }
      if (typeof raw === "string") {
        for (const chunk of raw.split(",")) {
          const numberValue = Number(chunk.trim());
          if (Number.isFinite(numberValue)) {
            parsed.push(Math.round(numberValue));
          }
        }
      }
    }
    return [...new Set(parsed)].filter((value) => value > 0).sort((a3, b3) => a3 - b3);
  }
  _formatPower(valueW) {
    if (valueW === null) {
      return "--";
    }
    const abs = Math.abs(valueW);
    if (abs >= 1e3) {
      return `${(valueW / 1e3).toFixed(2)} kW`;
    }
    return `${Math.round(valueW)} W`;
  }
  _formatAmp(valueA) {
    if (valueA === null) {
      return "--";
    }
    return `${Math.round(valueA)} A`;
  }
  async _onChargeSessionToggle() {
    if (!this.hass || !this._resolvedEntities.chargeSession) {
      return;
    }
    const entityId = this._resolvedEntities.chargeSession;
    const nextState = this._isOn(entityId) ? "off" : "on";
    const service = nextState === "on" ? "turn_on" : "turn_off";
    this._setOptimisticState(entityId, nextState);
    try {
      await this.hass.callService("switch", service, { entity_id: entityId });
    } catch {
      this._clearOptimisticState(entityId);
    }
  }
  async _onSurplusModeToggle() {
    if (!this.hass || !this._resolvedEntities.surplusMode) {
      return;
    }
    const entityId = this._resolvedEntities.surplusMode;
    const nextState = this._isOn(entityId) ? "off" : "on";
    const service = nextState === "on" ? "turn_on" : "turn_off";
    this._setOptimisticState(entityId, nextState);
    try {
      await this.hass.callService("switch", service, { entity_id: entityId });
    } catch {
      this._clearOptimisticState(entityId);
    }
  }
  async _setProfile(option) {
    if (!this.hass || !this._resolvedEntities.surplusProfile) {
      return;
    }
    const entityId = this._resolvedEntities.surplusProfile;
    this._setOptimisticState(entityId, option);
    try {
      await this.hass.callService("select", "select_option", {
        entity_id: entityId,
        option
      });
    } catch {
      this._clearOptimisticState(entityId);
    }
  }
  async _setChargeCurrent(value, minimum, maximum, allowedCurrents = []) {
    if (!this.hass || !this._resolvedEntities.chargeCurrent) {
      return;
    }
    const rounded = Math.round(value);
    const clamped = Math.max(minimum, Math.min(maximum, rounded));
    const allowed = allowedCurrents.filter(
      (candidate) => candidate >= minimum && candidate <= maximum
    );
    const target = allowed.length > 0 ? allowed.reduce(
      (best, candidate) => Math.abs(candidate - clamped) < Math.abs(best - clamped) ? candidate : best
    ) : clamped;
    const entityId = this._resolvedEntities.chargeCurrent;
    this._setOptimisticState(entityId, String(target));
    try {
      await this.hass.callService("number", "set_value", {
        entity_id: entityId,
        value: target
      });
    } catch {
      this._clearOptimisticState(entityId);
    }
  }
  _stepChargeCurrent(direction, currentValue, allowedCurrents, minimum, maximum, step) {
    const allowed = allowedCurrents.filter((candidate) => candidate >= minimum && candidate <= maximum).sort((a3, b3) => a3 - b3);
    if (allowed.length > 0) {
      const current = currentValue ?? allowed[0];
      if (direction < 0) {
        for (let index = allowed.length - 1; index >= 0; index -= 1) {
          if (allowed[index] < current) {
            return allowed[index];
          }
        }
        return allowed[0];
      }
      for (const candidate of allowed) {
        if (candidate > current) {
          return candidate;
        }
      }
      return allowed[allowed.length - 1];
    }
    const base = currentValue ?? minimum;
    return base + direction * step;
  }
};
TuyaEvChargerCard.properties = {
  hass: { attribute: false },
  _config: { attribute: false, state: true },
  _detailsOpen: { state: true },
  _debugOpen: { state: true },
  _graphHistory: { state: true },
  _graphHistoryLoading: { state: true },
  _resolvedEntities: { state: true },
  _optimisticStates: { state: true }
};
TuyaEvChargerCard.styles = i`
    :host {
      --ev-accent: #2d6a4f;
      --ev-accent-soft: #d8ede5;
      --ev-warn: #9c4221;
      --ev-border: rgba(120, 135, 150, 0.28);
      --ev-text-muted: var(--secondary-text-color);
      font-family: "Manrope", "Avenir Next", "Segoe UI", sans-serif;
    }

    ha-card {
      border-radius: 18px;
      border: 1px solid var(--ev-border);
      box-shadow: 0 10px 30px rgba(20, 30, 38, 0.08);
      background:
        linear-gradient(150deg, rgba(45, 106, 79, 0.08), transparent 42%),
        var(--card-background-color);
      overflow: hidden;
    }

    .card {
      padding: 16px;
      display: grid;
      gap: 12px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 10px;
    }

    .title {
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .subtitle {
      margin-top: 2px;
      color: var(--ev-text-muted);
      font-size: 0.78rem;
      letter-spacing: 0.01em;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      justify-content: flex-end;
    }

    .chip {
      border-radius: 999px;
      padding: 3px 9px;
      font-size: 0.72rem;
      border: 1px solid var(--ev-border);
      background: rgba(120, 135, 150, 0.08);
    }

    .chip.ok {
      border-color: rgba(45, 106, 79, 0.35);
      background: rgba(45, 106, 79, 0.12);
      color: var(--ev-accent);
    }

    .chip.off {
      color: var(--ev-text-muted);
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .metric {
      border: 1px solid var(--ev-border);
      border-radius: 12px;
      padding: 10px;
      display: grid;
      gap: 4px;
      background: rgba(120, 135, 150, 0.06);
    }

    .metric span {
      color: var(--ev-text-muted);
      font-size: 0.73rem;
    }

    .metric strong {
      font-size: 1rem;
      line-height: 1.1;
    }

    .graph-wrap {
      border: 1px solid var(--ev-border);
      border-radius: 12px;
      padding: 8px 8px 6px;
      background: rgba(120, 135, 150, 0.05);
    }

    .graph {
      width: 100%;
      height: 90px;
      display: block;
    }

    .graph-empty {
      border: 1px dashed var(--ev-border);
      border-radius: 12px;
      color: var(--ev-text-muted);
      font-size: 0.8rem;
      padding: 12px;
      text-align: center;
    }

    .axis {
      stroke: rgba(120, 135, 150, 0.35);
      stroke-width: 1;
    }

    .line {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .line.power {
      stroke: #2f4858;
    }

    .line.surplus {
      stroke: #2d6a4f;
    }

    .legend {
      margin-top: 6px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .leg {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.72rem;
      color: var(--ev-text-muted);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }

    .dot.power {
      background: #2f4858;
    }

    .dot.surplus {
      background: #2d6a4f;
    }

    .controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .btn {
      height: 36px;
      border-radius: 10px;
      border: 1px solid var(--ev-border);
      background: rgba(120, 135, 150, 0.08);
      font-size: 0.83rem;
      font-weight: 600;
      color: var(--primary-text-color);
      cursor: pointer;
    }

    .btn.primary {
      border-color: rgba(45, 106, 79, 0.45);
      background: rgba(45, 106, 79, 0.16);
      color: #204738;
    }

    .btn.tiny {
      width: 38px;
      height: 32px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .current-box {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .current-value {
      min-width: 70px;
      text-align: center;
      font-size: 0.95rem;
      font-weight: 700;
    }

    .profiles {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .profile {
      height: 34px;
      border-radius: 999px;
      border: 1px solid var(--ev-border);
      background: transparent;
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      cursor: pointer;
    }

    .profile.active {
      border-color: rgba(45, 106, 79, 0.45);
      background: rgba(45, 106, 79, 0.18);
      color: #204738;
      font-weight: 700;
    }

    .details-toggle,
    .debug-toggle {
      background: transparent;
      border: 0;
      color: var(--ev-text-muted);
      font-size: 0.78rem;
      cursor: pointer;
      justify-self: start;
      padding: 0;
    }

    .details {
      border-top: 1px dashed var(--ev-border);
      padding-top: 10px;
      display: grid;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      font-size: 0.82rem;
    }

    .debug-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .debug-item {
      border: 1px solid var(--ev-border);
      border-radius: 10px;
      padding: 8px;
      display: grid;
      gap: 4px;
      background: rgba(120, 135, 150, 0.05);
      font-size: 0.78rem;
    }

    .debug-item span {
      color: var(--ev-text-muted);
    }

    @media (max-width: 460px) {
      .metrics {
        grid-template-columns: 1fr;
      }
      .controls {
        grid-template-columns: 1fr;
      }
      .debug-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
customElements.define("tuya-ev-charger-card", TuyaEvChargerCard);
var ENTITY_FIELD_SPECS = [
  {
    key: "charge_session",
    label: "Charge session switch",
    domain: "switch",
    suffixes: ["charge_session"]
  },
  {
    key: "surplus_mode",
    label: "Surplus mode switch",
    domain: "switch",
    suffixes: ["surplus_mode"]
  },
  {
    key: "surplus_profile",
    label: "Surplus profile select",
    domain: "select",
    suffixes: ["surplus_profile"]
  },
  {
    key: "charge_current",
    label: "Charge current number",
    domain: "number",
    suffixes: ["charge_current"]
  },
  {
    key: "power",
    label: "Power sensor",
    domain: "sensor",
    suffixes: ["power_l1"]
  },
  {
    key: "current",
    label: "Current sensor",
    domain: "sensor",
    suffixes: ["current_l1"]
  },
  {
    key: "last_decision",
    label: "Last decision sensor",
    domain: "sensor",
    suffixes: ["surplus_last_decision_reason"]
  },
  {
    key: "surplus_effective",
    label: "Effective surplus sensor",
    domain: "sensor",
    suffixes: ["surplus_effective_w"]
  },
  {
    key: "surplus_raw",
    label: "Raw surplus sensor",
    domain: "sensor",
    suffixes: ["surplus_raw_w"]
  },
  {
    key: "surplus_discharge_over_limit",
    label: "Battery over-limit sensor",
    domain: "sensor",
    suffixes: ["surplus_battery_discharge_over_limit_w"]
  },
  {
    key: "surplus_target_current",
    label: "Target current sensor",
    domain: "sensor",
    suffixes: ["surplus_target_current_a"]
  },
  {
    key: "regulation_active",
    label: "Regulation active binary sensor",
    domain: "binary_sensor",
    suffixes: ["surplus_regulation_active"]
  }
];
var normalizeToken = (input) => String(input ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
var ENTITY_FIELD_KEY_SET = new Set(ENTITY_FIELD_SPECS.map((field) => field.key));
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
            @input=${(event) => this._updateRootText("title", event.target.value)}
          />
        </label>
        <label>
          <span>Detected EV Charger instance</span>
          <div class="inline">
            <select
              .value=${selectedToken}
              @change=${(event) => this._autoFillFromToken(event.target.value)}
            >
              <option value="">Select...</option>
              ${detectedTokens.map(
      (token) => b2`<option value=${token}>${token}</option>`
    )}
            </select>
            <button
              type="button"
              class="action"
              @click=${() => this._autoFillFromToken(cfg.charger_name ?? "")}
              ?disabled=${!selectedToken}
            >
              Auto-fill
            </button>
          </div>
        </label>
        <label>
          <span>Charger token (advanced)</span>
          <input
            type="text"
            .value=${cfg.charger_name ?? ""}
            @input=${(event) => this._updateRootText(
      "charger_name",
      event.target.value
    )}
          />
        </label>
        <h3>Entity overrides</h3>
        <p class="hint">
          Optional. Keep "Auto-detected" when possible.
        </p>
        <div class="grid">
          ${ENTITY_FIELD_SPECS.map(
      (field) => b2`
              <label>
                <span>${field.label}</span>
                <select
                  .value=${entities[field.key] ?? ""}
                  @change=${(event) => this._updateEntity(
        field.key,
        event.target.value
      )}
                >
                  <option value="">Auto-detected</option>
                  ${this._entityOptions(field).map(
        (entityId) => b2`<option value=${entityId}>${entityId}</option>`
      )}
                </select>
              </label>
            `
    )}
        </div>
      </div>
    `;
  }
  _stateIndex() {
    if (!this.hass) {
      return {
        all: [],
        byDomain: /* @__PURE__ */ new Map(),
        byRole: /* @__PURE__ */ new Map(),
        rolesByToken: /* @__PURE__ */ new Map()
      };
    }
    const states = this.hass.states;
    const cached = this._stateIndexCache.get(states);
    if (cached) {
      return cached;
    }
    const byDomain = /* @__PURE__ */ new Map();
    const byRole = /* @__PURE__ */ new Map();
    const rolesByToken = /* @__PURE__ */ new Map();
    const all = Object.keys(states).sort();
    for (const entityId of all) {
      const [domain] = entityId.split(".");
      if (domain) {
        const list = byDomain.get(domain) ?? [];
        list.push(entityId);
        byDomain.set(domain, list);
      }
      const rawRole = String(states[entityId]?.attributes[ATTR_CARD_ROLE] ?? "").trim();
      if (!ENTITY_FIELD_KEY_SET.has(rawRole)) {
        continue;
      }
      const role = rawRole;
      const roleList = byRole.get(role) ?? [];
      roleList.push(entityId);
      byRole.set(role, roleList);
      const token = normalizeToken(
        String(states[entityId]?.attributes[ATTR_CHARGER_TOKEN] ?? "")
      );
      if (!token) {
        continue;
      }
      const tokenRoles = rolesByToken.get(token) ?? /* @__PURE__ */ new Set();
      tokenRoles.add(role);
      rolesByToken.set(token, tokenRoles);
    }
    const index = { all, byDomain, byRole, rolesByToken };
    this._stateIndexCache.set(states, index);
    return index;
  }
  _detectedChargerTokens() {
    if (!this.hass) {
      return [];
    }
    const stateIndex = this._stateIndex();
    const technicalRanked = [...stateIndex.rolesByToken.entries()].filter(([, roles]) => roles.size >= 2).sort((a3, b3) => b3[1].size - a3[1].size || a3[0].localeCompare(b3[0])).map(([token]) => token);
    if (technicalRanked.length) {
      const selected2 = normalizeToken(this._config.charger_name);
      if (selected2 && !technicalRanked.includes(selected2)) {
        technicalRanked.unshift(selected2);
      }
      return technicalRanked.slice(0, 20);
    }
    const weighted = /* @__PURE__ */ new Map();
    const all = stateIndex.all;
    for (const field of ENTITY_FIELD_SPECS) {
      const domainEntities = stateIndex.byDomain.get(field.domain) ?? [];
      domainEntities.forEach((entityId) => {
        const token = this._extractToken(entityId, field.suffixes);
        if (!token) {
          return;
        }
        const bucket = weighted.get(token) ?? { count: 0, domains: /* @__PURE__ */ new Set() };
        bucket.count += 4;
        bucket.domains.add(field.domain);
        weighted.set(token, bucket);
      });
    }
    const eligibleDomains = new Set(ENTITY_FIELD_SPECS.map((field) => field.domain));
    all.forEach((entityId) => {
      const [domain, objectIdRaw] = entityId.split(".");
      const objectId = normalizeToken(objectIdRaw);
      if (!domain || !objectId || !eligibleDomains.has(domain)) {
        return;
      }
      for (const token of this._candidatePrefixTokens(objectId)) {
        const bucket = weighted.get(token) ?? { count: 0, domains: /* @__PURE__ */ new Set() };
        bucket.count += 1;
        bucket.domains.add(domain);
        weighted.set(token, bucket);
      }
    });
    const ranked = [...weighted.entries()].filter(([, value]) => value.count >= 3 && value.domains.size >= 2).sort((a3, b3) => {
      const scoreDiff = b3[1].count - a3[1].count;
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return b3[0].length - a3[0].length;
    }).map(([token]) => token);
    const selected = normalizeToken(this._config.charger_name);
    if (selected && !ranked.includes(selected)) {
      ranked.unshift(selected);
    }
    return ranked.slice(0, 20);
  }
  _entityOptions(field) {
    if (!this.hass) {
      return [];
    }
    const stateIndex = this._stateIndex();
    const token = normalizeToken(this._config.charger_name);
    const all = (stateIndex.byDomain.get(field.domain) ?? []).slice();
    const roleMatches = (stateIndex.byRole.get(field.key) ?? []).filter(
      (entityId) => entityId.startsWith(`${field.domain}.`)
    );
    const matchingSuffix = all.filter(
      (entityId) => this._matchesSuffix(entityId, field.suffixes)
    );
    const source = (roleMatches.length ? roleMatches : matchingSuffix.length ? matchingSuffix : all).slice();
    source.sort((a3, b3) => {
      const aScore = this._tokenScore(a3, token);
      const bScore = this._tokenScore(b3, token);
      if (aScore !== bScore) {
        return aScore - bScore;
      }
      const indexDiff = this._entityIndex(a3) - this._entityIndex(b3);
      if (indexDiff !== 0) {
        return indexDiff;
      }
      return a3.localeCompare(b3);
    });
    return source;
  }
  _autoFillFromToken(rawToken) {
    const token = normalizeToken(rawToken);
    const next = { ...this._config };
    if (token) {
      next.charger_name = token;
    } else {
      delete next.charger_name;
    }
    const entities = {};
    for (const field of ENTITY_FIELD_SPECS) {
      const guessed = this._guessEntity(field, token);
      if (guessed) {
        entities[field.key] = guessed;
      }
    }
    if (Object.keys(entities).length) {
      next.entities = entities;
    } else {
      delete next.entities;
    }
    this._emit(next);
  }
  _guessEntity(field, token) {
    if (!this.hass) {
      return void 0;
    }
    const stateIndex = this._stateIndex();
    const all = (stateIndex.byDomain.get(field.domain) ?? []).slice();
    const roleMatches = (stateIndex.byRole.get(field.key) ?? []).filter(
      (entityId) => entityId.startsWith(`${field.domain}.`)
    );
    const rankedByRole = roleMatches.sort((a3, b3) => {
      const scoreDiff = this._tokenScore(a3, token) - this._tokenScore(b3, token);
      if (scoreDiff !== 0) {
        return scoreDiff;
      }
      return this._entityIndex(a3) - this._entityIndex(b3);
    });
    if (rankedByRole.length) {
      return rankedByRole[0];
    }
    const matches = all.filter(
      (entityId) => this._matchesSuffix(entityId, field.suffixes)
    );
    const tokenMatches = token ? all.filter((entityId) => this._tokenScore(entityId, token) <= 1) : [];
    const source = matches.length ? matches : tokenMatches;
    if (!source.length) {
      return void 0;
    }
    if (!token) {
      return source[0];
    }
    return source.sort((a3, b3) => this._tokenScore(a3, token) - this._tokenScore(b3, token))[0];
  }
  _matchesSuffix(entityId, suffixes) {
    return suffixes.some(
      (suffix) => entityId.endsWith(`_${suffix}`) || entityId.endsWith(suffix)
    );
  }
  _entityToken(entityId) {
    if (!this.hass) {
      return "";
    }
    const raw = this.hass.states[entityId]?.attributes[ATTR_CHARGER_TOKEN];
    return normalizeToken(String(raw ?? ""));
  }
  _entityIndex(entityId) {
    if (!this.hass) {
      return 9999;
    }
    const raw = this.hass.states[entityId]?.attributes[ATTR_CARD_INDEX];
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : 9999;
  }
  _candidatePrefixTokens(objectId) {
    const normalized = normalizeToken(objectId);
    const parts = normalized.split("_").filter(Boolean);
    const tokens = [];
    for (let index = 1; index < parts.length; index += 1) {
      const token = parts.slice(0, index).join("_");
      if (token.length >= 3) {
        tokens.push(token);
      }
    }
    return tokens;
  }
  _tokenScore(entityId, token) {
    if (!token) {
      return 1;
    }
    const technicalToken = this._entityToken(entityId);
    if (technicalToken && technicalToken === token) {
      return 0;
    }
    const objectId = normalizeToken(entityId.split(".")[1] ?? "");
    if (!objectId) {
      return 4;
    }
    if (objectId === token || objectId.startsWith(`${token}_`)) {
      return 1;
    }
    if (objectId.includes(token)) {
      return 2;
    }
    return 3;
  }
  _extractToken(entityId, suffixes) {
    const objectId = entityId.split(".")[1] ?? "";
    if (!objectId) {
      return void 0;
    }
    for (const suffix of suffixes) {
      if (objectId === suffix) {
        continue;
      }
      const underscored = `_${suffix}`;
      if (objectId.endsWith(underscored)) {
        const token = normalizeToken(
          objectId.slice(0, objectId.length - underscored.length)
        );
        return token || void 0;
      }
      if (objectId.endsWith(suffix)) {
        const token = normalizeToken(
          objectId.slice(0, objectId.length - suffix.length).replace(/_+$/, "")
        );
        return token || void 0;
      }
    }
    return void 0;
  }
  _updateRootText(key, value) {
    const next = { ...this._config };
    const trimmed = key === "charger_name" ? normalizeToken(value) : value.trim();
    if (trimmed) {
      next[key] = trimmed;
    } else {
      delete next[key];
    }
    this._emit(next);
  }
  _updateEntity(key, value) {
    const trimmed = value.trim();
    const entities = {
      ...this._config.entities ?? {}
    };
    if (trimmed) {
      entities[key] = trimmed;
    } else {
      delete entities[key];
    }
    const next = { ...this._config };
    if (Object.keys(entities).length) {
      next.entities = entities;
    } else {
      delete next.entities;
    }
    this._emit(next);
  }
  _emit(next) {
    const normalized = {
      ...next,
      type: "custom:tuya-ev-charger-card"
    };
    this._config = normalized;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: normalized },
        bubbles: true,
        composed: true
      })
    );
  }
};
TuyaEvChargerCardEditor.properties = {
  hass: { attribute: false },
  _config: { attribute: false, state: true }
};
TuyaEvChargerCardEditor.styles = i`
    .editor {
      display: grid;
      gap: 12px;
      padding: 8px 0;
    }

    h3 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 700;
    }

    .hint {
      margin: -6px 0 0;
      color: var(--secondary-text-color);
      font-size: 0.78rem;
    }

    .grid {
      display: grid;
      gap: 8px;
    }

    .inline {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 8px;
    }

    label {
      display: grid;
      gap: 4px;
    }

    span {
      font-size: 0.78rem;
      color: var(--secondary-text-color);
    }

    input,
    select {
      height: 34px;
      border: 1px solid rgba(120, 135, 150, 0.35);
      border-radius: 9px;
      padding: 0 10px;
      font: inherit;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }

    .action {
      height: 34px;
      padding: 0 12px;
      border: 1px solid rgba(45, 106, 79, 0.45);
      border-radius: 9px;
      font: inherit;
      font-size: 0.78rem;
      font-weight: 600;
      color: #204738;
      background: rgba(45, 106, 79, 0.14);
      cursor: pointer;
    }

    .action:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `;
customElements.define("tuya-ev-charger-card-editor", TuyaEvChargerCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "tuya-ev-charger-card",
  name: "Tuya EV Charger Card",
  description: "Modern and sober dashboard card for Tuya EV Charger Local",
  preview: true,
  configurable: true
});
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
