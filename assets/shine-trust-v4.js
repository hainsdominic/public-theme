!function (e, t) {
    var n, r;
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (n = e.Base64, (r = t()).noConflict = function () {
        return e.Base64 = n, r
    }, e.Meteor && (Base64 = r), e.Base64 = r)
}("undefined" != typeof self ? self : "undefined" != typeof window ? window : "undefined" != typeof global ? global : this, (function () {
    "use strict";
    var e, t = "function" == typeof atob, n = "function" == typeof btoa, r = "function" == typeof Buffer,
        o = "function" == typeof TextDecoder ? new TextDecoder : void 0,
        i = "function" == typeof TextEncoder ? new TextEncoder : void 0,
        u = Array.prototype.slice.call("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="),
        c = (e = {}, u.forEach((function (t, n) {
            return e[t] = n
        })), e), f = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/,
        a = String.fromCharCode.bind(String),
        s = "function" == typeof Uint8Array.from ? Uint8Array.from.bind(Uint8Array) : function (e, t) {
            return void 0 === t && (t = function (e) {
                return e
            }), new Uint8Array(Array.prototype.slice.call(e, 0).map(t))
        }, d = function (e) {
            return e.replace(/=/g, "").replace(/[+\/]/g, (function (e) {
                return "+" == e ? "-" : "_"
            }))
        }, l = function (e) {
            return e.replace(/[^A-Za-z0-9\+\/]/g, "")
        }, p = function (e) {
            for (var t, n, r, o, i = "", c = e.length % 3, f = 0; f < e.length;) {
                if ((n = e.charCodeAt(f++)) > 255 || (r = e.charCodeAt(f++)) > 255 || (o = e.charCodeAt(f++)) > 255) throw new TypeError("invalid character found");
                i += u[(t = n << 16 | r << 8 | o) >> 18 & 63] + u[t >> 12 & 63] + u[t >> 6 & 63] + u[63 & t]
            }
            return c ? i.slice(0, c - 3) + "===".substring(c) : i
        }, h = n ? function (e) {
            return btoa(e)
        } : r ? function (e) {
            return Buffer.from(e, "binary").toString("base64")
        } : p, y = r ? function (e) {
            return Buffer.from(e).toString("base64")
        } : function (e) {
            for (var t = [], n = 0, r = e.length; n < r; n += 4096) t.push(a.apply(null, e.subarray(n, n + 4096)));
            return h(t.join(""))
        }, A = function (e, t) {
            return void 0 === t && (t = !1), t ? d(y(e)) : y(e)
        }, C = function (e) {
            if (e.length < 2) return (t = e.charCodeAt(0)) < 128 ? e : t < 2048 ? a(192 | t >>> 6) + a(128 | 63 & t) : a(224 | t >>> 12 & 15) + a(128 | t >>> 6 & 63) + a(128 | 63 & t);
            var t = 65536 + 1024 * (e.charCodeAt(0) - 55296) + (e.charCodeAt(1) - 56320);
            return a(240 | t >>> 18 & 7) + a(128 | t >>> 12 & 63) + a(128 | t >>> 6 & 63) + a(128 | 63 & t)
        }, b = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g, m = function (e) {
            return e.replace(b, C)
        }, g = r ? function (e) {
            return Buffer.from(e, "utf8").toString("base64")
        } : i ? function (e) {
            return y(i.encode(e))
        } : function (e) {
            return h(m(e))
        }, v = function (e, t) {
            return void 0 === t && (t = !1), t ? d(g(e)) : g(e)
        }, B = function (e) {
            return v(e, !0)
        }, x = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g, w = function (e) {
            switch (e.length) {
                case 4:
                    var t = ((7 & e.charCodeAt(0)) << 18 | (63 & e.charCodeAt(1)) << 12 | (63 & e.charCodeAt(2)) << 6 | 63 & e.charCodeAt(3)) - 65536;
                    return a(55296 + (t >>> 10)) + a(56320 + (1023 & t));
                case 3:
                    return a((15 & e.charCodeAt(0)) << 12 | (63 & e.charCodeAt(1)) << 6 | 63 & e.charCodeAt(2));
                default:
                    return a((31 & e.charCodeAt(0)) << 6 | 63 & e.charCodeAt(1))
            }
        }, S = function (e) {
            return e.replace(x, w)
        }, U = function (e) {
            if (e = e.replace(/\s+/g, ""), !f.test(e)) throw new TypeError("malformed base64.");
            e += "==".slice(2 - (3 & e.length));
            for (var t, n, r, o = "", i = 0; i < e.length;) t = c[e.charAt(i++)] << 18 | c[e.charAt(i++)] << 12 | (n = c[e.charAt(i++)]) << 6 | (r = c[e.charAt(i++)]), o += 64 === n ? a(t >> 16 & 255) : 64 === r ? a(t >> 16 & 255, t >> 8 & 255) : a(t >> 16 & 255, t >> 8 & 255, 255 & t);
            return o
        }, F = t ? function (e) {
            return atob(l(e))
        } : r ? function (e) {
            return Buffer.from(e, "base64").toString("binary")
        } : U, R = r ? function (e) {
            return s(Buffer.from(e, "base64"))
        } : function (e) {
            return s(F(e), (function (e) {
                return e.charCodeAt(0)
            }))
        }, D = function (e) {
            return R(I(e))
        }, E = r ? function (e) {
            return Buffer.from(e, "base64").toString("utf8")
        } : o ? function (e) {
            return o.decode(R(e))
        } : function (e) {
            return S(F(e))
        }, I = function (e) {
            return l(e.replace(/[-_]/g, (function (e) {
                return "-" == e ? "+" : "/"
            })))
        }, T = function (e) {
            return E(I(e))
        }, j = function (e) {
            return {value: e, enumerable: !1, writable: !0, configurable: !0}
        }, O = function () {
            var e = function (e, t) {
                return Object.defineProperty(String.prototype, e, j(t))
            };
            e("fromBase64", (function () {
                return T(this)
            })), e("toBase64", (function (e) {
                return v(this, e)
            })), e("toBase64URI", (function () {
                return v(this, !0)
            })), e("toBase64URL", (function () {
                return v(this, !0)
            })), e("toUint8Array", (function () {
                return D(this)
            }))
        }, k = function () {
            var e = function (e, t) {
                return Object.defineProperty(Uint8Array.prototype, e, j(t))
            };
            e("toBase64", (function (e) {
                return A(this, e)
            })), e("toBase64URI", (function () {
                return A(this, !0)
            })), e("toBase64URL", (function () {
                return A(this, !0)
            }))
        }, z = {
            version: "3.7.3",
            VERSION: "3.7.3",
            atob: F,
            atobPolyfill: U,
            btoa: h,
            btoaPolyfill: p,
            fromBase64: T,
            toBase64: v,
            encode: v,
            encodeURI: B,
            encodeURL: B,
            utob: m,
            btou: S,
            decode: T,
            isValid: function (e) {
                if ("string" != typeof e) return !1;
                var t = e.replace(/\s+/g, "").replace(/={0,2}$/, "");
                return !/[^\s0-9a-zA-Z\+/]/.test(t) || !/[^\s0-9a-zA-Z\-_]/.test(t)
            },
            fromUint8Array: A,
            toUint8Array: D,
            extendString: O,
            extendUint8Array: k,
            extendBuiltins: function () {
                O(), k()
            },
            Base64: {}
        };
    return Object.keys(z).forEach((function (e) {
        return z.Base64[e] = z[e]
    })), z
})), function (e, t) {
    var n, r;
    "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = e || self, n = e.Cookies, (r = e.Cookies = t()).noConflict = function () {
        return e.Cookies = n, r
    })
}(this, (function () {
    "use strict";

    function e(e) {
        for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) e[r] = n[r]
        }
        return e
    }

    return function t(n, r) {
        function o(t, o, i) {
            if ("undefined" != typeof document) {
                "number" == typeof (i = e({}, r, i)).expires && (i.expires = new Date(Date.now() + 864e5 * i.expires)), i.expires && (i.expires = i.expires.toUTCString()), t = encodeURIComponent(t).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
                var u = "";
                for (var c in i) i[c] && (u += "; " + c, !0 !== i[c] && (u += "=" + i[c].split(";")[0]));
                return document.cookie = t + "=" + n.write(o, t) + u
            }
        }

        return Object.create({
            set: o, get: function (e) {
                if ("undefined" != typeof document && (!arguments.length || e)) {
                    for (var t = document.cookie ? document.cookie.split("; ") : [], r = {}, o = 0; o < t.length; o++) {
                        var i = t[o].split("="), u = i.slice(1).join("=");
                        try {
                            var c = decodeURIComponent(i[0]);
                            if (r[c] = n.read(u, c), e === c) break
                        } catch (e) {
                        }
                    }
                    return e ? r[e] : r
                }
            }, remove: function (t, n) {
                o(t, "", e({}, n, {expires: -1}))
            }, withAttributes: function (n) {
                return t(this.converter, e({}, this.attributes, n))
            }, withConverter: function (n) {
                return t(e({}, this.converter, n), this.attributes)
            }
        }, {attributes: {value: Object.freeze(r)}, converter: {value: Object.freeze(n)}})
    }({
        read: function (e) {
            return '"' === e[0] && (e = e.slice(1, -1)), e.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
        }, write: function (e) {
            return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent)
        }
    }, {path: "/"})
})), function (e) {
    "use strict";
    const t = setInterval((() => {
        window.ST_GLOBALS && (r(), clearInterval(t))
    }));

    class n {
        constructor() {
            this.customCss = window.ST_META_DATA.customCSS
        }

        renderCustomCSS() {
            return window.ST_GLOBALS.addStyle(this.customCss)
        }
    }

    const r = function () {
        (new n).renderCustomCSS()
    }
}(window.document);