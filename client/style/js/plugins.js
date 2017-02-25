/*-----------------------------------------------------------------------------------*/
/*	LOCALSCROLL & SCROLLTO
 /*-----------------------------------------------------------------------------------*/
/**
 * jQuery.LocalScroll - Animated scrolling navigation, using anchors.
 * Copyright (c) 2007-2009 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 3/11/2009
 * @author Ariel Flesler
 * @version 1.2.7
 **/
(function ($) {
    var l = location.href.replace(/#.*/, '');
    var g = $.localScroll = function (a) {
        $('body').localScroll(a)
    };
    g.defaults = {duration: 1e3, axis: 'y', event: 'click', stop: true, target: window, reset: true};
    g.hash = function (a) {
        if (location.hash) {
            a = $.extend({}, g.defaults, a);
            a.hash = false;
            if (a.reset) {
                var e = a.duration;
                delete a.duration;
                $(a.target).scrollTo(0, a);
                a.duration = e
            }
            i(0, location, a)
        }
    };
    $.fn.localScroll = function (b) {
        b = $.extend({}, g.defaults, b);
        return b.lazy ? this.bind(b.event, function (a) {
            var e = $([a.target, a.target.parentNode]).filter(d)[0];
            if (e)i(a, e, b)
        }) : this.find('a,area').filter(d).bind(b.event, function (a) {
            i(a, this, b)
        }).end().end();
        function d() {
            return !!this.href && !!this.hash && this.href.replace(this.hash, '') == l && (!b.filter || $(this).is(b.filter))
        }
    };
    function i(a, e, b) {
        var d = e.hash.slice(1), f = document.getElementById(d) || document.getElementsByName(d)[0];
        if (!f)return;
        if (a)a.preventDefault();
        var h = $(b.target);
        if (b.lock && h.is(':animated') || b.onBefore && b.onBefore.call(b, a, f, h) === false)return;
        if (b.stop)h.stop(true);
        if (b.hash) {
            var j = f.id == d ? 'id' : 'name', k = $('<a> </a>').attr(j, d).css({
                position: 'absolute',
                top: $(window).scrollTop(),
                left: $(window).scrollLeft()
            });
            f[j] = '';
            $('body').prepend(k);
            location = e.hash;
            k.remove();
            f[j] = d
        }
        h.scrollTo(f, b).trigger('notify.serialScroll', [f])
    }
})(jQuery);
/**
 * Copyright (c) 2007-2012 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * @author Ariel Flesler
 * @version 1.4.5 BETA
 */
;(function ($) {
    var h = $.scrollTo = function (a, b, c) {
        $(window).scrollTo(a, b, c)
    };
    h.defaults = {axis: 'xy', duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1, limit: true};
    h.window = function (a) {
        return $(window)._scrollable()
    };
    $.fn._scrollable = function () {
        return this.map(function () {
            var a = this, isWin = !a.nodeName || $.inArray(a.nodeName.toLowerCase(), ['iframe', '#document', 'html', 'body']) != -1;
            if (!isWin)return a;
            var b = (a.contentWindow || a).document || a.ownerDocument || a;
            return /webkit/i.test(navigator.userAgent) || b.compatMode == 'BackCompat' ? b.body : b.documentElement
        })
    };
    $.fn.scrollTo = function (e, f, g) {
        if (typeof f == 'object') {
            g = f;
            f = 0
        }
        if (typeof g == 'function')g = {onAfter: g};
        if (e == 'max')e = 9e9;
        g = $.extend({}, h.defaults, g);
        f = f || g.duration;
        g.queue = g.queue && g.axis.length > 1;
        if (g.queue)f /= 2;
        g.offset = both(g.offset);
        g.over = both(g.over);
        return this._scrollable().each(function () {
            if (e == null)return;
            var d = this, $elem = $(d), targ = e, toff, attr = {}, win = $elem.is('html,body');
            switch (typeof targ) {
                case'number':
                case'string':
                    if (/^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ)) {
                        targ = both(targ);
                        break
                    }
                    targ = $(targ, this);
                    if (!targ.length)return;
                case'object':
                    if (targ.is || targ.style)toff = (targ = $(targ)).offset()
            }
            $.each(g.axis.split(''), function (i, a) {
                var b = a == 'x' ? 'Left' : 'Top', pos = b.toLowerCase(), key = 'scroll' + b, old = d[key], max = h.max(d, a);
                if (toff) {
                    attr[key] = toff[pos] + (win ? 0 : old - $elem.offset()[pos]);
                    if (g.margin) {
                        attr[key] -= parseInt(targ.css('margin' + b)) || 0;
                        attr[key] -= parseInt(targ.css('border' + b + 'Width')) || 0
                    }
                    attr[key] += g.offset[pos] || 0;
                    if (g.over[pos])attr[key] += targ[a == 'x' ? 'width' : 'height']() * g.over[pos]
                } else {
                    var c = targ[pos];
                    attr[key] = c.slice && c.slice(-1) == '%' ? parseFloat(c) / 100 * max : c
                }
                if (g.limit && /^\d+$/.test(attr[key]))attr[key] = attr[key] <= 0 ? 0 : Math.min(attr[key], max);
                if (!i && g.queue) {
                    if (old != attr[key])animate(g.onAfterFirst);
                    delete attr[key]
                }
            });
            animate(g.onAfter);
            function animate(a) {
                $elem.animate(attr, f, g.easing, a && function () {
                        a.call(this, e, g)
                    })
            }
        }).end()
    };
    h.max = function (a, b) {
        var c = b == 'x' ? 'Width' : 'Height', scroll = 'scroll' + c;
        if (!$(a).is('html,body'))return a[scroll] - $(a)[c.toLowerCase()]();
        var d = 'client' + c, html = a.ownerDocument.documentElement, body = a.ownerDocument.body;
        return Math.max(html[scroll], body[scroll]) - Math.min(html[d], body[d])
    };
    function both(a) {
        return typeof a == 'object' ? a : {top: a, left: a}
    }
})(jQuery);
/*
 * Project: Twitter Bootstrap Hover Dropdown
 * Author: Cameron Spear
 * Contributors: Mattia Larentis
 *
 * Dependencies: Bootstrap's Dropdown plugin, jQuery
 *
 * A simple plugin to enable Bootstrap dropdowns to active on hover and provide a nice user experience.
 *
 * License: MIT
 *
 * http://cameronspear.com/blog/twitter-bootstrap-dropdown-on-hover-plugin/
 */
(function (e, t, n) {
    var r = e();
    e.fn.dropdownHover = function (n) {
        r = r.add(this.parent());
        return this.each(function () {
            var i = e(this), s = i.parent(), o = {
                delay: 500,
                instantlyCloseOthers: !0
            }, u = {
                delay: e(this).data("delay"),
                instantlyCloseOthers: e(this).data("close-others")
            }, a = e.extend(!0, {}, o, n, u), f;
            s.hover(function (e) {
                if (!s.hasClass("open") && !i.is(e.target))return !0;
                a.instantlyCloseOthers === !0 && r.removeClass("open");
                t.clearTimeout(f);
                s.addClass("open")
            }, function () {
                f = t.setTimeout(function () {
                    s.removeClass("open")
                }, a.delay)
            });
            i.hover(function () {
                a.instantlyCloseOthers === !0 && r.removeClass("open");
                t.clearTimeout(f);
                s.addClass("open")
            });
            s.find(".dropdown-submenu").each(function () {
                var n = e(this), r;
                n.hover(function () {
                    t.clearTimeout(r);
                    n.children(".dropdown-menu").show();
                    n.siblings().children(".dropdown-menu").hide()
                }, function () {
                    var e = n.children(".dropdown-menu");
                    r = t.setTimeout(function () {
                        e.hide()
                    }, a.delay)
                })
            })
        })
    };
    e(document).ready(function () {
        e('[data-hover="dropdown"]').dropdownHover()
    })
})(jQuery, this);

/*! Backstretch - v2.0.4 - 2013-06-19
 * http://srobbin.com/jquery-plugins/backstretch/
 * Copyright (c) 2013 Scott Robbin; Licensed MIT */
(function (a, d, p) {
    a.fn.backstretch = function (c, b) {
        (c === p || 0 === c.length) && a.error("No images were supplied for Backstretch");
        0 === a(d).scrollTop() && d.scrollTo(0, 0);
        return this.each(function () {
            var d = a(this), g = d.data("backstretch");
            if (g) {
                if ("string" == typeof c && "function" == typeof g[c]) {
                    g[c](b);
                    return
                }
                b = a.extend(g.options, b);
                g.destroy(!0)
            }
            g = new q(this, c, b);
            d.data("backstretch", g)
        })
    };
    a.backstretch = function (c, b) {
        return a("body").backstretch(c, b).data("backstretch")
    };
    a.expr[":"].backstretch = function (c) {
        return a(c).data("backstretch") !== p
    };
    a.fn.backstretch.defaults = {centeredX: !0, centeredY: !0, duration: 5E3, fade: 0};
    var r = {
        left: 0,
        top: 0,
        overflow: "hidden",
        margin: 0,
        padding: 0,
        height: "100%",
        width: "100%",
        zIndex: -999999
    }, s = {
        position: "absolute",
        display: "none",
        margin: 0,
        padding: 0,
        border: "none",
        width: "auto",
        height: "auto",
        maxHeight: "none",
        maxWidth: "none",
        zIndex: -999999
    }, q = function (c, b, e) {
        this.options = a.extend({}, a.fn.backstretch.defaults, e || {});
        this.images = a.isArray(b) ? b : [b];
        a.each(this.images, function () {
            a("<img />")[0].src = this
        });
        this.isBody = c === document.body;
        this.$container = a(c);
        this.$root = this.isBody ? l ? a(d) : a(document) : this.$container;
        c = this.$container.children(".backstretch").first();
        this.$wrap = c.length ? c : a('<div class="backstretch"></div>').css(r).appendTo(this.$container);
        this.isBody || (c = this.$container.css("position"), b = this.$container.css("zIndex"), this.$container.css({
            position: "static" === c ? "relative" : c,
            zIndex: "auto" === b ? 0 : b,
            background: "none"
        }), this.$wrap.css({zIndex: -999998}));
        this.$wrap.css({position: this.isBody && l ? "fixed" : "absolute"});
        this.index = 0;
        this.show(this.index);
        a(d).on("resize.backstretch", a.proxy(this.resize, this)).on("orientationchange.backstretch", a.proxy(function () {
            this.isBody && 0 === d.pageYOffset && (d.scrollTo(0, 1), this.resize())
        }, this))
    };
    q.prototype = {
        resize: function () {
            try {
                var a = {
                    left: 0,
                    top: 0
                }, b = this.isBody ? this.$root.width() : this.$root.innerWidth(), e = b, g = this.isBody ? d.innerHeight ? d.innerHeight : this.$root.height() : this.$root.innerHeight(), j = e / this.$img.data("ratio"), f;
                j >= g ? (f = (j - g) / 2, this.options.centeredY && (a.top = "-" + f + "px")) : (j = g, e = j * this.$img.data("ratio"), f = (e - b) / 2, this.options.centeredX && (a.left = "-" + f + "px"));
                this.$wrap.css({width: b, height: g}).find("img:not(.deleteable)").css({width: e, height: j}).css(a)
            } catch (h) {
            }
            return this
        }, show: function (c) {
            if (!(Math.abs(c) > this.images.length - 1)) {
                var b = this, e = b.$wrap.find("img").addClass("deleteable"), d = {relatedTarget: b.$container[0]};
                b.$container.trigger(a.Event("backstretch.before", d), [b, c]);
                this.index = c;
                clearInterval(b.interval);
                b.$img = a("<img />").css(s).bind("load", function (f) {
                    var h = this.width || a(f.target).width();
                    f = this.height || a(f.target).height();
                    a(this).data("ratio", h / f);
                    a(this).fadeIn(b.options.speed || b.options.fade, function () {
                        e.remove();
                        b.paused || b.cycle();
                        a(["after", "show"]).each(function () {
                            b.$container.trigger(a.Event("backstretch." + this, d), [b, c])
                        })
                    });
                    b.resize()
                }).appendTo(b.$wrap);
                b.$img.attr("src", b.images[c]);
                return b
            }
        }, next: function () {
            return this.show(this.index < this.images.length - 1 ? this.index + 1 : 0)
        }, prev: function () {
            return this.show(0 === this.index ? this.images.length - 1 : this.index - 1)
        }, pause: function () {
            this.paused = !0;
            return this
        }, resume: function () {
            this.paused = !1;
            this.next();
            return this
        }, cycle: function () {
            1 < this.images.length && (clearInterval(this.interval), this.interval = setInterval(a.proxy(function () {
                this.paused || this.next()
            }, this), this.options.duration));
            return this
        }, destroy: function (c) {
            a(d).off("resize.backstretch orientationchange.backstretch");
            clearInterval(this.interval);
            c || this.$wrap.remove();
            this.$container.removeData("backstretch")
        }
    };
    var l, f = navigator.userAgent, m = navigator.platform, e = f.match(/AppleWebKit\/([0-9]+)/), e = !!e && e[1], h = f.match(/Fennec\/([0-9]+)/), h = !!h && h[1], n = f.match(/Opera Mobi\/([0-9]+)/), t = !!n && n[1], k = f.match(/MSIE ([0-9]+)/), k = !!k && k[1];
    l = !((-1 < m.indexOf("iPhone") || -1 < m.indexOf("iPad") || -1 < m.indexOf("iPod")) && e && 534 > e || d.operamini && "[object OperaMini]" === {}.toString.call(d.operamini) || n && 7458 > t || -1 < f.indexOf("Android") && e && 533 > e || h && 6 > h || "palmGetResource" in d && e && 534 > e || -1 < f.indexOf("MeeGo") && -1 < f.indexOf("NokiaBrowser/8.5.0") || k && 6 >= k)
})(jQuery, window);

/*!
 * Cube Portfolio - Responsive jQuery Grid Plugin
 *
 * version: 2.0.1 (21 January, 2015)
 * require: jQuery v1.7+
 *
 * Copyright (c) 2015, Mihai Buricea (http://scriptpie.com)
 * Released under CodeCanyon License http://codecanyon.net/licenses
 *
 */
!function (a, b, c, d) {
    "use strict";
    var e = "cbp", f = "." + e;
    "function" != typeof Object.create && (Object.create = function (a) {
        function b() {
        }

        return b.prototype = a, new b
    }), a.expr[":"].uncached = function (b) {
        if (!a(b).is('img[src][src!=""]'))return !1;
        var c = new Image;
        return c.src = b.src, !c.complete
    };
    var g = {
        init: function (a, b) {
            var c, d = this;
            return d.cubeportfolio = a, d.type = b, d.isOpen = !1, d.options = d.cubeportfolio.options, "singlePageInline" === b ? (d.matrice = [-1, -1], d.height = 0, void d._createMarkupSinglePageInline()) : (d._createMarkup(), void(d.options.singlePageDeeplinking && "singlePage" === b && (d.url = location.href, "#" === d.url.slice(-1) && (d.url = d.url.slice(0, -1)), c = d.cubeportfolio.blocksAvailable.find(d.options.singlePageDelegate).filter(function () {
                return d.url.split("#cbp=")[1] === this.getAttribute("href")
            })[0], c && (d.url = d.url.replace(/#cbp=(.+)/gi, ""), d.openSinglePage(d.cubeportfolio.blocksAvailable.find(d.options.singlePageDelegate), c)))))
        }, _createMarkup: function () {
            var b = this, d = "";
            "singlePage" === b.type && "left" !== b.options.singlePageAnimation && (d = " cbp-popup-singlePage-" + b.options.singlePageAnimation), b.wrap = a("<div/>", {
                "class": "cbp-popup-wrap cbp-popup-" + b.type + d,
                "data-action": "lightbox" === b.type ? "close" : ""
            }).on("click" + f, function (c) {
                if (!b.stopEvents) {
                    var d = a(c.target).attr("data-action");
                    b[d] && (b[d](), c.preventDefault())
                }
            }), b.content = a("<div/>", {"class": "cbp-popup-content"}).appendTo(b.wrap), a("<div/>", {"class": "cbp-popup-loadingBox"}).appendTo(b.wrap), "ie8" === b.cubeportfolio.browser && (b.bg = a("<div/>", {
                "class": "cbp-popup-ie8bg",
                "data-action": "lightbox" === b.type ? "close" : ""
            }).appendTo(b.wrap)), b.navigationWrap = a("<div/>", {"class": "cbp-popup-navigation-wrap"}).appendTo(b.wrap), b.navigation = a("<div/>", {"class": "cbp-popup-navigation"}).appendTo(b.navigationWrap), b.closeButton = a("<div/>", {
                "class": "cbp-popup-close",
                title: "Close (Esc arrow key)",
                "data-action": "close"
            }).appendTo(b.navigation), b.nextButton = a("<div/>", {
                "class": "cbp-popup-next",
                title: "Next (Right arrow key)",
                "data-action": "next"
            }).appendTo(b.navigation), b.prevButton = a("<div/>", {
                "class": "cbp-popup-prev",
                title: "Previous (Left arrow key)",
                "data-action": "prev"
            }).appendTo(b.navigation), "singlePage" === b.type && (b.options.singlePageCounter && (b.counter = a(b.options.singlePageCounter).appendTo(b.navigation), b.counter.text("")), b.content.on("click" + f, b.options.singlePageDelegate, function (a) {
                a.preventDefault();
                var c, d = b.dataArray.length, e = this.getAttribute("href");
                for (c = 0; d > c && b.dataArray[c].url !== e; c++);
                b.singlePageJumpTo(c - b.current)
            }), b.wrap.on("mousewheel" + f + " DOMMouseScroll" + f, function (a) {
                a.stopImmediatePropagation()
            })), a(c).on("keydown" + f, function (a) {
                b.isOpen && (b.stopEvents || (37 === a.keyCode ? b.prev() : 39 === a.keyCode ? b.next() : 27 === a.keyCode && b.close()))
            })
        }, _createMarkupSinglePageInline: function () {
            var b = this;
            b.wrap = a("<div/>", {"class": "cbp-popup-singlePageInline"}).on("click" + f, function (c) {
                if (!b.stopEvents) {
                    var d = a(c.target).attr("data-action");
                    d && b[d] && (b[d](), c.preventDefault())
                }
            }), b.content = a("<div/>", {"class": "cbp-popup-content"}).appendTo(b.wrap), a("<div/>", {"class": "cbp-popup-loadingBox"}).appendTo(b.wrap), b.navigation = a("<div/>", {"class": "cbp-popup-navigation"}).appendTo(b.wrap), b.closeButton = a("<div/>", {
                "class": "cbp-popup-close",
                title: "Close (Esc arrow key)",
                "data-action": "close"
            }).appendTo(b.navigation)
        }, destroy: function () {
            var b = this, d = a("body");
            a(c).off("keydown" + f), d.off("click" + f, b.options.lightboxDelegate), d.off("click" + f, b.options.singlePageDelegate), b.content.off("click" + f, b.options.singlePageDelegate), b.cubeportfolio.$obj.off("click" + f, b.options.singlePageInlineDelegate), b.cubeportfolio.$obj.off("click" + f, b.options.lightboxDelegate), b.cubeportfolio.$obj.off("click" + f, b.options.singlePageDelegate), b.cubeportfolio.$obj.removeClass("cbp-popup-isOpening"), b.cubeportfolio.blocks.removeClass("cbp-singlePageInline-active"), b.wrap.remove()
        }, openLightbox: function (d, e) {
            var f, g, h = this, i = 0, j = [];
            if (!h.isOpen) {
                if (h.isOpen = !0, h.stopEvents = !1, h.dataArray = [], h.current = null, f = e.getAttribute("href"), null === f)throw new Error("HEI! Your clicked element doesn't have a href attribute.");
                a.each(d, function (b, c) {
                    var d, e = c.getAttribute("href"), g = e, k = "isImage";
                    if (-1 === a.inArray(e, j)) {
                        if (f === e)h.current = i; else if (!h.options.lightboxGallery)return;
                        /youtube/i.test(e) ? (d = e.substring(e.lastIndexOf("v=") + 2), /autoplay=/i.test(d) || (d += "&autoplay=1"), d = d.replace(/\?|&/, "?"), g = "//www.youtube.com/embed/" + d, k = "isYoutube") : /vimeo/i.test(e) ? (d = e.substring(e.lastIndexOf("/") + 1), /autoplay=/i.test(d) || (d += "&autoplay=1"), d = d.replace(/\?|&/, "?"), g = "//player.vimeo.com/video/" + d, k = "isVimeo") : /ted\.com/i.test(e) ? (g = "http://embed.ted.com/talks/" + e.substring(e.lastIndexOf("/") + 1) + ".html", k = "isTed") : /(\.mp4)|(\.ogg)|(\.ogv)|(\.webm)/i.test(e) && (g = e.split(-1 !== e.indexOf("|") ? "|" : "%7C"), k = "isSelfHosted"), h.dataArray.push({
                            src: g,
                            title: c.getAttribute(h.options.lightboxTitleSrc),
                            type: k
                        }), i++
                    }
                    j.push(e)
                }), h.counterTotal = h.dataArray.length, 1 === h.counterTotal ? (h.nextButton.hide(), h.prevButton.hide(), h.dataActionImg = "") : (h.nextButton.show(), h.prevButton.show(), h.dataActionImg = 'data-action="next"'), h.wrap.appendTo(c.body), h.scrollTop = a(b).scrollTop(), h.originalStyle = a("html").attr("style"), a("html").css({
                    overflow: "hidden",
                    paddingRight: b.innerWidth - a(c).width()
                }), h.wrap.show(), g = h.dataArray[h.current], h[g.type](g)
            }
        }, openSinglePage: function (d, e) {
            var g, h = this, i = 0, j = [];
            if (!h.isOpen) {
                if (h.cubeportfolio.singlePageInline && h.cubeportfolio.singlePageInline.isOpen && h.cubeportfolio.singlePageInline.close(), h.isOpen = !0, h.stopEvents = !1, h.dataArray = [], h.current = null, g = e.getAttribute("href"), null === g)throw new Error("HEI! Your clicked element doesn't have a href attribute.");
                if (a.each(d, function (b, c) {
                        var d = c.getAttribute("href");
                        -1 === a.inArray(d, j) && (g === d && (h.current = i), h.dataArray.push({
                            url: d,
                            element: c
                        }), i++), j.push(d)
                    }), h.counterTotal = h.dataArray.length, 1 === h.counterTotal ? (h.nextButton.hide(), h.prevButton.hide()) : (h.nextButton.show(), h.prevButton.show()), h.wrap.appendTo(c.body), h.scrollTop = a(b).scrollTop(), a("html").css({
                        overflow: "hidden",
                        paddingRight: b.innerWidth - a(c).width()
                    }), h.wrap.scrollTop(0), h.wrap.show(), h.finishOpen = 2, h.navigationMobile = a(), h.wrap.one(h.cubeportfolio.transitionEnd, function () {
                        var b;
                        h.options.singlePageStickyNavigation && (h.wrap.addClass("cbp-popup-singlePage-sticky"), b = h.wrap[0].clientWidth, h.navigationWrap.width(b), ("android" === h.cubeportfolio.browser || "ios" === h.cubeportfolio.browser) && (h.navigationMobile = a("<div/>", {"class": "cbp-popup-singlePage cbp-popup-singlePage-sticky"}).on("click" + f, function (b) {
                            if (!h.stopEvents) {
                                var c = a(b.target).attr("data-action");
                                h[c] && (h[c](), b.preventDefault())
                            }
                        }), h.navigationMobile.appendTo(c.body).append(h.navigationWrap))), h.finishOpen--, h.finishOpen <= 0 && h.updateSinglePageIsOpen.call(h)
                    }), "ie8" === h.cubeportfolio.browser || "ie9" === h.cubeportfolio.browser) {
                    if (h.options.singlePageStickyNavigation) {
                        var k = h.wrap[0].clientWidth;
                        h.navigationWrap.width(k), setTimeout(function () {
                            h.wrap.addClass("cbp-popup-singlePage-sticky")
                        }, 1e3)
                    }
                    h.finishOpen--
                }
                h.wrap.addClass("cbp-popup-loading"), h.cubeportfolio._forceReflow(h.wrap).addClass("cbp-popup-singlePage-open"), h.options.singlePageDeeplinking && (location.href = h.url + "#cbp=" + h.dataArray[h.current].url), a.isFunction(h.options.singlePageCallback) && h.options.singlePageCallback.call(h, h.dataArray[h.current].url, h.dataArray[h.current].element)
            }
        }, openSinglePageInline: function (b, c, d) {
            var e, f, g, h, i, j, k = this, l = 0, m = 0, n = 0;
            if (d = d || !1, k.fromOpen = d, k.storeBlocks = b, k.storeCurrentBlock = c, k.isOpen)return h = a(c).closest(".cbp-item").index(), void(k.dataArray[k.current].url !== c.getAttribute("href") || k.current !== h ? k.cubeportfolio.singlePageInline.close("open", {
                blocks: b,
                currentBlock: c,
                fromOpen: !0
            }) : k.close());
            if (k.wrap.addClass("cbp-popup-loading"), k.isOpen = !0, k.stopEvents = !1, k.dataArray = [], k.current = null, e = c.getAttribute("href"), null === e)throw new Error("HEI! Your clicked element doesn't have a href attribute.");
            i = a(c).closest(".cbp-item")[0], a.each(b, function (a, b) {
                i === b && (k.current = a)
            }), k.dataArray[k.current] = {
                url: e,
                element: c
            }, j = a(k.dataArray[k.current].element).parents(".cbp-item").addClass("cbp-singlePageInline-active"), k.counterTotal = b.length, k.wrap.insertBefore(k.cubeportfolio.$ul), "top" === k.options.singlePageInlinePosition ? (m = 0, n = k.cubeportfolio.cols - 1) : "bottom" === k.options.singlePageInlinePosition ? (m = k.counterTotal, n = k.counterTotal, k.lastColumn = !0, d ? k.lastColumn && (k.top = k.lastColumnHeight) : (k.lastColumnHeight = k.cubeportfolio.height, k.top = k.lastColumnHeight)) : "above" === k.options.singlePageInlinePosition ? (l = Math.floor(k.current / k.cubeportfolio.cols), m = k.cubeportfolio.cols * l, n = k.cubeportfolio.cols * (l + 1) - 1) : (l = Math.floor(k.current / k.cubeportfolio.cols), m = Math.min(k.cubeportfolio.cols * (l + 1), k.counterTotal), n = Math.min(k.cubeportfolio.cols * (l + 2) - 1, k.counterTotal), f = Math.ceil((k.current + 1) / k.cubeportfolio.cols), g = Math.ceil(k.counterTotal / k.cubeportfolio.cols), k.lastColumn = f === g, d ? k.lastColumn && (k.top = k.lastColumnHeight) : (k.lastColumnHeight = k.cubeportfolio.height, k.top = k.lastColumnHeight)), k.matrice = [m, n], d || (k.finishOpen = 2, k.wrap.one(k.cubeportfolio.transitionEnd, function () {
                k.finishOpen--, k.finishOpen <= 0 && k.singlePageInlineIsOpen.call(k)
            }), k._resizeSinglePageInline(!1, !0), ("ie8" === k.cubeportfolio.browser || "ie9" === k.cubeportfolio.browser) && k.finishOpen--), a.isFunction(k.options.singlePageInlineCallback) && k.options.singlePageInlineCallback.call(k, k.dataArray[k.current].url, k.dataArray[k.current].element)
        }, _resizeSinglePageInline: function (c, d) {
            var e, f = this;
            c = c || !1, d = d || !1, f.height = f.content.outerHeight(!0), f.cubeportfolio._layout(), f.cubeportfolio._processStyle(f.cubeportfolio.transition), c && f.wrap.removeClass("cbp-popup-loading"), f.cubeportfolio.$obj.addClass("cbp-popup-isOpening"), f.wrap.css({height: f.height}), f.wrap.css({top: f.top}), e = f.lastColumn ? f.height : 0, f.cubeportfolio._resizeMainContainer(f.cubeportfolio.transition, e), f.options.singlePageInlineInFocus && d && (f.scrollTop = a(b).scrollTop(), a("body,html").animate({scrollTop: f.wrap.offset().top - 150}))
        }, appendScriptsToWrap: function (a) {
            var b = this, d = 0, e = function (f) {
                var g = c.createElement("script"), h = f.src;
                g.type = "text/javascript", g.readyState ? g.onreadystatechange = function () {
                    ("loaded" == g.readyState || "complete" == g.readyState) && (g.onreadystatechange = null, d++, a[d] && e(a[d]))
                } : g.onload = function () {
                    d++, a[d] && e(a[d])
                }, h ? g.src = h : g.text = f.text, b.content[0].appendChild(g)
            };
            e(a[0])
        }, updateSinglePage: function (b, c, d) {
            var e, f = this;
            f.content.addClass("cbp-popup-content").removeClass("cbp-popup-content-basic"), d === !1 && f.content.removeClass("cbp-popup-content").addClass("cbp-popup-content-basic"), f.counter && (e = a(f._getCounterMarkup(f.options.singlePageCounter, f.current + 1, f.counterTotal)), f.counter.text(e.text())), f.content.html(b), c && f.appendScriptsToWrap(c), f.finishOpen--, f.finishOpen <= 0 && f.updateSinglePageIsOpen.call(f)
        }, updateSinglePageIsOpen: function () {
            var b, c = this;
            c.wrap.addClass("cbp-popup-ready"), c.wrap.removeClass("cbp-popup-loading"), b = c.content.find(".cbp-slider"), b ? (b.find(".cbp-slider-item").addClass("cbp-item"), c.slider = b.cubeportfolio({
                layoutMode: "slider",
                mediaQueries: [{width: 1, cols: 1}],
                gapHorizontal: 0,
                gapVertical: 0,
                caption: ""
            })) : c.slider = null, ("android" === c.cubeportfolio.browser || "ios" === c.cubeportfolio.browser) && a("html").css({position: "fixed"}), c.cubeportfolio.$obj.trigger("updateSinglePageComplete" + f)
        }, updateSinglePageInline: function (a, b) {
            var c = this;
            c.content.html(a), b && c.appendScriptsToWrap(b), c.finishOpen--, c.finishOpen <= 0 && c.singlePageInlineIsOpen.call(c)
        }, singlePageInlineIsOpen: function () {
            var a = this;
            a.cubeportfolio._load(a.wrap, function () {
                var b = a.content.find(".cbp-slider");
                b ? (b.find(".cbp-slider-item").addClass("cbp-item"), a.slider = b.cubeportfolio({
                    layoutMode: "slider",
                    displayType: "default",
                    mediaQueries: [{width: 1, cols: 1}],
                    gapHorizontal: 0,
                    gapVertical: 0,
                    caption: ""
                }), b.on("pluginResize.cbp", function () {
                    a._resizeSinglePageInline(!0)
                })) : a.slider = null, a.cubeportfolio.$obj.trigger("updateSinglePageInlineComplete" + f), a._resizeSinglePageInline(!0)
            })
        }, isImage: function (b) {
            var c = this, d = new Image;
            c.tooggleLoading(!0), a('<img src="' + b.src + '">').is("img:uncached") ? (a(d).on("load" + f + " error" + f, function () {
                c.updateImagesMarkup(b.src, b.title, c._getCounterMarkup(c.options.lightboxCounter, c.current + 1, c.counterTotal)), c.tooggleLoading(!1)
            }), d.src = b.src) : (c.updateImagesMarkup(b.src, b.title, c._getCounterMarkup(c.options.lightboxCounter, c.current + 1, c.counterTotal)), c.tooggleLoading(!1))
        }, isVimeo: function (a) {
            var b = this;
            b.updateVideoMarkup(a.src, a.title, b._getCounterMarkup(b.options.lightboxCounter, b.current + 1, b.counterTotal))
        }, isYoutube: function (a) {
            var b = this;
            b.updateVideoMarkup(a.src, a.title, b._getCounterMarkup(b.options.lightboxCounter, b.current + 1, b.counterTotal))
        }, isTed: function (a) {
            var b = this;
            b.updateVideoMarkup(a.src, a.title, b._getCounterMarkup(b.options.lightboxCounter, b.current + 1, b.counterTotal))
        }, isSelfHosted: function (a) {
            var b = this;
            b.updateSelfHostedVideo(a.src, a.title, b._getCounterMarkup(b.options.lightboxCounter, b.current + 1, b.counterTotal))
        }, _getCounterMarkup: function (a, b, c) {
            if (!a.length)return "";
            var d = {current: b, total: c};
            return a.replace(/\{\{current}}|\{\{total}}/gi, function (a) {
                return d[a.slice(2, -2)]
            })
        }, updateSelfHostedVideo: function (a, b, c) {
            var d, e = this;
            e.wrap.addClass("cbp-popup-lightbox-isIframe");
            var f = '<div class="cbp-popup-lightbox-iframe"><video controls="controls" height="auto" style="width: 100%">';
            for (d = 0; d < a.length; d++)/(\.mp4)/i.test(a[d]) ? f += '<source src="' + a[d] + '" type="video/mp4">' : /(\.ogg)|(\.ogv)/i.test(a[d]) ? f += '<source src="' + a[d] + '" type="video/ogg">' : /(\.webm)/i.test(a[d]) && (f += '<source src="' + a[d] + '" type="video/webm">');
            f += 'Your browser does not support the video tag.</video><div class="cbp-popup-lightbox-bottom">' + (b ? '<div class="cbp-popup-lightbox-title">' + b + "</div>" : "") + c + "</div></div>", e.content.html(f), e.wrap.addClass("cbp-popup-ready"), e.preloadNearbyImages()
        }, updateVideoMarkup: function (a, b, c) {
            var d = this;
            d.wrap.addClass("cbp-popup-lightbox-isIframe");
            var e = '<div class="cbp-popup-lightbox-iframe"><iframe src="' + a + '" frameborder="0" allowfullscreen scrolling="no"></iframe><div class="cbp-popup-lightbox-bottom">' + (b ? '<div class="cbp-popup-lightbox-title">' + b + "</div>" : "") + c + "</div></div>";
            d.content.html(e), d.wrap.addClass("cbp-popup-ready"), d.preloadNearbyImages()
        }, updateImagesMarkup: function (a, b, c) {
            var d = this;
            d.wrap.removeClass("cbp-popup-lightbox-isIframe");
            var e = '<div class="cbp-popup-lightbox-figure"><img src="' + a + '" class="cbp-popup-lightbox-img" ' + d.dataActionImg + ' /><div class="cbp-popup-lightbox-bottom">' + (b ? '<div class="cbp-popup-lightbox-title">' + b + "</div>" : "") + c + "</div></div>";
            d.content.html(e), d.wrap.addClass("cbp-popup-ready"), d.resizeImage(), d.preloadNearbyImages()
        }, next: function () {
            var a = this;
            a[a.type + "JumpTo"](1)
        }, prev: function () {
            var a = this;
            a[a.type + "JumpTo"](-1)
        }, lightboxJumpTo: function (a) {
            var b, c = this;
            c.current = c.getIndex(c.current + a), b = c.dataArray[c.current], c[b.type](b)
        }, singlePageJumpTo: function (b) {
            var c = this;
            c.current = c.getIndex(c.current + b), a.isFunction(c.options.singlePageCallback) && (c.resetWrap(), c.wrap.scrollTop(0), c.wrap.addClass("cbp-popup-loading"), c.options.singlePageCallback.call(c, c.dataArray[c.current].url, c.dataArray[c.current].element), c.options.singlePageDeeplinking && (location.href = c.url + "#cbp=" + c.dataArray[c.current].url))
        }, resetWrap: function () {
            var a = this;
            "singlePage" === a.type && a.options.singlePageDeeplinking && (location.href = a.url + "#")
        }, getIndex: function (a) {
            var b = this;
            return a %= b.counterTotal, 0 > a && (a = b.counterTotal + a), a
        }, close: function (c, d) {
            var e = this;
            e.isOpen = !1, "singlePageInline" === e.type ? "open" === c ? (e.wrap.addClass("cbp-popup-loading"), a(e.dataArray[e.current].element).closest(".cbp-item").removeClass("cbp-singlePageInline-active"), e.openSinglePageInline(d.blocks, d.currentBlock, d.fromOpen)) : (e.matrice = [-1, -1], e.cubeportfolio._layout(), e.cubeportfolio._processStyle(e.cubeportfolio.transition), e.cubeportfolio._resizeMainContainer(e.cubeportfolio.transition), e.wrap.css({height: 0}), a(e.dataArray[e.current].element).parents(".cbp-item").removeClass("cbp-singlePageInline-active"), "ie8" === e.cubeportfolio.browser || "ie9" === e.cubeportfolio.browser ? (e.content.html(""), e.wrap.detach(), e.cubeportfolio.$obj.removeClass("cbp-popup-isOpening"), "promise" === c && a.isFunction(d.callback) && d.callback.call(e.cubeportfolio)) : e.wrap.one(e.cubeportfolio.transitionEnd, function () {
                e.content.html(""), e.wrap.detach(), e.cubeportfolio.$obj.removeClass("cbp-popup-isOpening"), "promise" === c && a.isFunction(d.callback) && d.callback.call(e.cubeportfolio)
            }), e.options.singlePageInlineInFocus && a("body, html").animate({scrollTop: e.scrollTop})) : "singlePage" === e.type ? (e.resetWrap(), e.wrap.removeClass("cbp-popup-ready"), ("android" === e.cubeportfolio.browser || "ios" === e.cubeportfolio.browser) && (a("html").css({position: ""}), e.navigationWrap.appendTo(e.wrap), e.navigationMobile.remove()), a(b).scrollTop(e.scrollTop), setTimeout(function () {
                e.stopScroll = !0, e.navigationWrap.css({top: e.wrap.scrollTop()}), e.wrap.removeClass("cbp-popup-singlePage-open cbp-popup-singlePage-sticky"), ("ie8" === e.cubeportfolio.browser || "ie9" === e.cubeportfolio.browser) && (e.content.html(""), e.wrap.detach(), a("html").css({
                    overflow: "",
                    paddingRight: "",
                    position: ""
                }), e.navigationWrap.removeAttr("style"))
            }, 0), e.wrap.one(e.cubeportfolio.transitionEnd, function () {
                e.content.html(""), e.wrap.detach(), a("html").css({
                    overflow: "",
                    paddingRight: "",
                    position: ""
                }), e.navigationWrap.removeAttr("style")
            })) : (e.originalStyle ? a("html").attr("style", e.originalStyle) : a("html").css({
                overflow: "",
                paddingRight: ""
            }), a(b).scrollTop(e.scrollTop), e.content.html(""), e.wrap.detach())
        }, tooggleLoading: function (a) {
            var b = this;
            b.stopEvents = a, b.wrap[a ? "addClass" : "removeClass"]("cbp-popup-loading")
        }, resizeImage: function () {
            if (this.isOpen) {
                var c = a(b).height(), d = this.content.find("img"), e = parseInt(d.css("margin-top"), 10) + parseInt(d.css("margin-bottom"), 10);
                d.css("max-height", c - e + "px")
            }
        }, preloadNearbyImages: function () {
            var b, c, d = [], e = this;
            d.push(e.getIndex(e.current + 1)), d.push(e.getIndex(e.current + 2)), d.push(e.getIndex(e.current + 3)), d.push(e.getIndex(e.current - 1)), d.push(e.getIndex(e.current - 2)), d.push(e.getIndex(e.current - 3));
            for (var f = d.length - 1; f >= 0; f--)"isImage" === e.dataArray[d[f]].type && (c = e.dataArray[d[f]].src, b = new Image, a('<img src="' + c + '">').is("img:uncached") && (b.src = c))
        }
    }, h = {
        _main: function (b, c, d) {
            var e = this;
            e.styleQueue = [], e.isAnimating = !1, e.defaultFilter = "*", e.registeredEvents = [], a.isFunction(d) && e._registerEvent("initFinish", d, !0), e._extendOptions(c), e.obj = b, e.$obj = a(b), e.width = e.$obj.width(), e.$obj.addClass("cbp cbp-loading"), e.$obj.children().first().hasClass("cbp-item") && e.$obj.wrapInner("<div/>"), e.$ul = e.$obj.children(), e.$ul.addClass("cbp-wrapper"), ("lazyLoading" === e.options.displayType || "fadeIn" === e.options.displayType) && e.$ul.css({opacity: 0}), "fadeInToTop" === e.options.displayType && e.$ul.css({
                opacity: 0,
                marginTop: 30
            }), e._browserInfo(), e._initCSSandEvents(), e._prepareBlocks(), -1 !== a.inArray(e.options.displayType, ["lazyLoading", "sequentially", "bottomToTop", "fadeInToTop"]) ? e._load(e.$obj, e._beforeDisplay) : e._beforeDisplay()
        }, _extendOptions: function (b) {
            var c = this;
            b && !b.hasOwnProperty("lightboxCounter") && b.lightboxShowCounter === !1 && (b.lightboxCounter = ""), b && !b.hasOwnProperty("singlePageCounter") && b.singlePageShowCounter === !1 && (b.singlePageCounter = ""), c.options = a.extend({}, a.fn.cubeportfolio.options, b)
        }, _browserInfo: function () {
            var a, c, d = this, e = navigator.appVersion;
            return d.browser = -1 !== e.indexOf("MSIE 8.") ? "ie8" : -1 !== e.indexOf("MSIE 9.") ? "ie9" : -1 !== e.indexOf("MSIE 10.") ? "ie10" : b.ActiveXObject || "ActiveXObject" in b ? "ie11" : /android/gi.test(e) ? "android" : /iphone|ipad|ipod/gi.test(e) ? "ios" : /chrome/gi.test(e) ? "chrome" : "", d.browser && d.$obj.addClass("cbp-" + d.browser), a = d._styleSupport("transition"), c = d._styleSupport("animation"), d.transition = d.transitionByFilter = a ? "css" : "animate", "animate" === d.transition ? void(d.supportTransform = "_withCSS2") : (d.transitionEnd = {
                WebkitTransition: "webkitTransitionEnd",
                MozTransition: "transitionend",
                OTransition: "oTransitionEnd otransitionend",
                transition: "transitionend"
            }[a], d.animationEnd = {
                WebkitAnimation: "webkitAnimationEnd",
                MozAnimation: "Animationend",
                OAnimation: "oAnimationEnd oanimationend",
                animation: "animationend"
            }[c], d.supportCSSTransform = d._styleSupport("transform"), void(d.supportCSSTransform ? (d._cssHooks(), d.supportTransform = "_withCSS3") : d.supportTransform = "_withCSS2"))
        }, _styleSupport: function (a) {
            var b, d, e, f = a.charAt(0).toUpperCase() + a.slice(1), g = ["Moz", "Webkit", "O", "ms"], h = c.createElement("div");
            if (a in h.style)d = a; else for (e = g.length - 1; e >= 0; e--)if (b = g[e] + f, b in h.style) {
                d = b;
                break
            }
            return h = null, d
        }, _cssHooks: function () {
            function b(b, e, f) {
                var g, h, i, j, k, l, m = a(b), n = m.data("transformFn") || {}, o = {}, p = {};
                o[f] = e, a.extend(n, o);
                for (g in n)n.hasOwnProperty(g) && (h = n[g], p[g] = c[g](h));
                i = p.translate || "", j = p.scale || "", l = p.skew || "", k = i + j + l, m.data("transformFn", n), b.style[d.supportCSSTransform] = k
            }

            var c, d = this;
            c = d._has3d() ? {
                translate: function (a) {
                    return "translate3d(" + a[0] + "px, " + a[1] + "px, 0) "
                }, scale: function (a) {
                    return "scale3d(" + a + ", " + a + ", 1) "
                }, skew: function (a) {
                    return "skew(" + a[0] + "deg, " + a[1] + "deg) "
                }
            } : {
                translate: function (a) {
                    return "translate(" + a[0] + "px, " + a[1] + "px) "
                }, scale: function (a) {
                    return "scale(" + a + ") "
                }, skew: function (a) {
                    return "skew(" + a[0] + "deg, " + a[1] + "deg) "
                }
            }, a.cssNumber.scale = !0, a.cssHooks.scale = {
                set: function (a, c) {
                    "string" == typeof c && (c = parseFloat(c)), b(a, c, "scale")
                }, get: function (b) {
                    var c = a.data(b, "transformFn");
                    return c && c.scale ? c.scale : 1
                }
            }, a.fx.step.scale = function (b) {
                a.cssHooks.scale.set(b.elem, b.now + b.unit)
            }, a.cssNumber.translate = !0, a.cssHooks.translate = {
                set: function (a, c) {
                    b(a, c, "translate")
                }, get: function (b) {
                    var c = a.data(b, "transformFn");
                    return c && c.translate ? c.translate : [0, 0]
                }
            }, a.cssNumber.skew = !0, a.cssHooks.skew = {
                set: function (a, c) {
                    b(a, c, "skew")
                }, get: function (b) {
                    var c = a.data(b, "transformFn");
                    return c && c.skew ? c.skew : [0, 0]
                }
            }
        }, _has3d: function () {
            var a, e, f = c.createElement("p"), g = {
                webkitTransform: "-webkit-transform",
                OTransform: "-o-transform",
                msTransform: "-ms-transform",
                MozTransform: "-moz-transform",
                transform: "transform"
            };
            c.body.insertBefore(f, null);
            for (a in g)g.hasOwnProperty(a) && f.style[a] !== d && (f.style[a] = "translate3d(1px,1px,1px)", e = b.getComputedStyle(f).getPropertyValue(g[a]));
            return c.body.removeChild(f), e !== d && e.length > 0 && "none" !== e
        }, _prepareBlocks: function () {
            var a = this;
            a.blocks = a.$ul.children(".cbp-item"), a.blocksAvailable = a.blocks, a.options.caption && (a.blocks.wrapInner('<div class="cbp-item-wrapper"></div>'), a._captionInit())
        }, _captionInit: function () {
            var a = this;
            ("ie8" === a.browser || "ie9" === a.browser) && (a.options.caption = "minimal"), a.$obj.addClass("cbp-caption-" + a.options.caption)
        }, _captionDestroy: function () {
            var a = this;
            a.$obj.removeClass("cbp-caption-" + a.options.caption)
        }, _initCSSandEvents: function () {
            var c, d, e, g = this, h = a(b), i = h.width();
            h.on("resize" + f, function () {
                c && clearTimeout(c), c = setTimeout(function () {
                    e = h.width(), i !== e && (i = e, g.$obj.removeClass("cbp-no-transition cbp-appendItems-loading"), "responsive" === g.options.gridAdjustment && g._responsiveLayout(), g._layout(), g._processStyle(g.transition), g._resizeMainContainer(g.transition), g.lightbox && g.lightbox.resizeImage(), "slider" === g.options.layoutMode && g._updateSlider(), g.singlePage && g.singlePage.options.singlePageStickyNavigation && (d = g.singlePage.wrap[0].clientWidth, d > 0 && (g.singlePage.navigationWrap.width(d), g.singlePage.navigation.width(d))), g.singlePageInline && g.singlePageInline.isOpen && g.singlePageInline.close())
                }, 50)
            })
        }, _load: function (b, c, d) {
            var e, f = this, g = [], h = 0;
            d = d || [], b.find("img:uncached").each(function () {
                g.push(this.src)
            }), e = g.length, 0 === e && c.apply(f, d), a.each(g, function (b, g) {
                var i = new Image;
                a(i).one("load.cbp error.cbp", function () {
                    return a(this).off("load.cbp error.cbp"), h++, h === e ? (c.apply(f, d), !1) : void 0
                }), i.src = g
            })
        }, _beforeDisplay: function () {
            var a = this;
            a.options.animationType && "grid" === a.options.layoutMode && (("ie8" === a.browser || "ie9" === a.browser) && (a.options.animationType = "fadeOut"), a["_" + a.options.animationType + "Init"] && a["_" + a.options.animationType + "Init"](), a.$obj.addClass("cbp-animation-" + a.options.animationType)), a.localColumnWidth = a.blocks.eq(0).outerWidth() + a.options.gapVertical, a._filterFromUrl(), "" === a.options.defaultFilter || "*" === a.options.defaultFilter ? a._display() : a.filter(a.options.defaultFilter, function () {
                a._display()
            }, a)
        }, _filterFromUrl: function () {
            var a = this, b = /#cbpf=(.*?)([#|?&]|$)/gi.exec(location.href);
            null !== b && (a.options.defaultFilter = b[1])
        }, _display: function () {
            var b, d, e = this, h = a(c.body);
            e.getColumnsType = a.isArray(e.options.mediaQueries) ? "_getColumnsBreakpoints" : "_getColumnsAuto", "responsive" === e.options.gridAdjustment && e._responsiveLayout(), e["_" + e.options.layoutMode + "Markup"](), e._layout(), e._processStyle("css"), e._resizeMainContainer("css"), ("lazyLoading" === e.options.displayType || "fadeIn" === e.options.displayType) && e.$ul.animate({opacity: 1}, e.options.displayTypeSpeed), "fadeInToTop" === e.options.displayType && e.$ul.animate({
                opacity: 1,
                marginTop: 0
            }, e.options.displayTypeSpeed, function () {
                e.$ul.css({marginTop: 0}), e.$ulClone && e.$ulClone.css({marginTop: 0})
            }), "sequentially" === e.options.displayType && (b = 0, e.blocks.css("opacity", 0), function i() {
                d = e.blocksAvailable.eq(b++), d.length && (d.animate({opacity: 1}), setTimeout(i, e.options.displayTypeSpeed))
            }()), "bottomToTop" === e.options.displayType && (b = 0, e.blocks.css({
                opacity: 0,
                marginTop: 80
            }), function j() {
                d = e.blocksAvailable.eq(b++), d.length ? (d.animate({
                    opacity: 1,
                    marginTop: 0
                }, 400), setTimeout(j, e.options.displayTypeSpeed)) : (e.blocks.css({marginTop: 0}), e.blocksClone && e.blocksClone.css({marginTop: 0}))
            }()), e._forceReflow(e.$obj).removeClass("cbp-loading"), e.$obj.addClass("cbp-ready"), e.lightbox = null, e.$obj.find(e.options.lightboxDelegate) && (e.lightbox = Object.create(g), e.lightbox.init(e, "lightbox"), e.$obj.on("click" + f, e.options.lightboxDelegate, function (b) {
                b.preventDefault();
                var c = a(this);
                c.closest(a(".cbp-popup-singlePageInline")).length || e.lightbox.openLightbox(e.blocksAvailable.find(e.options.lightboxDelegate), this)
            })), 1 != h.data("cbpLightboxIsOn") && (h.on("click" + f, e.options.lightboxDelegate, function (b) {
                b.preventDefault();
                var c = a(this), d = c.data("cbpLightbox");
                c.closest(a(".cbp-wrapper")).length || (d ? e.lightbox.openLightbox(a(e.options.lightboxDelegate).filter("[data-cbp-lightbox=" + d + "]"), this) : e.lightbox.openLightbox(c, this))
            }), h.data("cbpLightboxIsOn", !0)), e.singlePage = null, e.$obj.find(e.options.singlePageDelegate) && (e.singlePage = Object.create(g), e.singlePage.init(e, "singlePage"), e.$obj.on("click" + f, e.options.singlePageDelegate, function (a) {
                a.preventDefault(), e.singlePage.openSinglePage(e.blocksAvailable.find(e.options.singlePageDelegate), this)
            })), 1 != h.data("cbpSinglePageIsOn") && (h.on("click" + f, e.options.singlePageDelegate, function (b) {
                b.preventDefault();
                var c = a(this), d = c.data("cbpSinglepage");
                c.closest(a(".cbp")).length || (d ? e.singlePage.openSinglePage(a(e.options.singlePageDelegate).filter("[data-cbp-singlePage=" + d + "]"), this) : e.singlePage.openSinglePage(c, this))
            }), h.data("cbpSinglePageIsOn", !0)), e.singlePageInline = null, e.$obj.find(e.options.singlePageInlineDelegate) && (e.singlePageInline = Object.create(g), e.singlePageInline.init(e, "singlePageInline"), e.$obj.on("click" + f, e.options.singlePageInlineDelegate, function (a) {
                a.preventDefault(), e.singlePageInline.openSinglePageInline(e.blocksAvailable, this)
            })), e._triggerEvent("initFinish"), e.$obj.trigger("initComplete" + f)
        }, _forceReflow: function (a) {
            return a.offset(), a
        }, _layout: function () {
            var a = this;
            a["_" + a.options.layoutMode + "LayoutReset"](), a["_" + a.options.layoutMode + "Layout"](), a.$obj.removeClass(function (a, b) {
                return (b.match(/\bcbp-cols-\d+/gi) || []).join(" ")
            }), a.$obj.addClass("cbp-cols-" + a.cols)
        }, _sliderMarkup: function () {
            var b = this;
            b.sliderStopEvents = !1, b.sliderActive = 0, b.$obj.addClass("cbp-mode-slider"), b.$ul.wrap('<div class="cbp-wrapper-outer"></div>'), b.nav = a("<div/>", {"class": "cbp-nav"}), b.nav.on("click" + f, "[data-slider-action]", function (c) {
                if (c.preventDefault(), c.stopImmediatePropagation(), c.stopPropagation(), !b.sliderStopEvents) {
                    var d = a(this), e = d.attr("data-slider-action");
                    b["_" + e + "Slider"] && b["_" + e + "Slider"](d)
                }
            }), b.options.showNavigation && (b.controls = a("<div/>", {"class": "cbp-nav-controls"}), b.navPrev = a("<div/>", {
                "class": "cbp-nav-prev",
                "data-slider-action": "prev"
            }).appendTo(b.controls), b.navNext = a("<div/>", {
                "class": "cbp-nav-next",
                "data-slider-action": "next"
            }).appendTo(b.controls), b.controls.appendTo(b.nav)), b.options.showPagination && (b.navPagination = a("<div/>", {"class": "cbp-nav-pagination"}).appendTo(b.nav)), (b.controls || b.navPagination) && b.nav.appendTo(b.$obj), b._updateSliderPagination(), b.options.auto && (b.options.autoPauseOnHover && (b.mouseIsEntered = !1, b.$obj.on("mouseenter" + f, function () {
                b.mouseIsEntered = !0, b._stopSliderAuto()
            }).on("mouseleave" + f, function () {
                b.mouseIsEntered = !1, b._startSliderAuto()
            })), b._startSliderAuto()), b.options.drag && "ie8" !== b.browser && "ie9" !== b.browser && b._dragSlider()
        }, _updateSlider: function () {
            var a = this;
            a._updateSliderPosition(), a._updateSliderPagination()
        }, _updateSliderPagination: function () {
            var b, c, d = this;
            if (d.options.showPagination) {
                for (b = Math.ceil(d.blocksAvailable.length / d.cols), d.navPagination.empty(), c = b - 1; c >= 0; c--)a("<div/>", {
                    "class": "cbp-nav-pagination-item",
                    "data-slider-action": "jumpTo"
                }).appendTo(d.navPagination);
                d.navPaginationItems = d.navPagination.children()
            }
            d._enableDisableNavSlider()
        }, _destroySlider: function () {
            var a = this;
            "slider" === a.options.layoutMode && (a.$obj.off("click" + f), a.navNext && a.navNext.remove(), a.navPrev && a.navPrev.remove(), a.navPagination && a.navPagination.remove())
        }, _nextSlider: function () {
            var a = this;
            if (a._isEndSlider()) {
                if (!a.options.rewindNav)return;
                a.sliderActive = 0
            } else a.options.scrollByPage ? a.sliderActive = Math.min(a.sliderActive + a.cols, a.blocksAvailable.length - a.cols) : a.sliderActive += 1;
            a._goToSlider()
        }, _prevSlider: function () {
            var a = this;
            if (a._isStartSlider()) {
                if (!a.options.rewindNav)return;
                a.sliderActive = a.blocksAvailable.length - a.cols
            } else a.options.scrollByPage ? a.sliderActive = Math.max(0, a.sliderActive - a.cols) : a.sliderActive -= 1;
            a._goToSlider()
        }, _jumpToSlider: function (a) {
            var b = this, c = Math.min(a.index() * b.cols, b.blocksAvailable.length - b.cols);
            c !== b.sliderActive && (b.sliderActive = c, b._goToSlider())
        }, _jumpDragToSlider: function (a) {
            var b, c, d, e = this, f = a > 0 ? !0 : !1;
            e.options.scrollByPage ? (b = e.cols * e.localColumnWidth, c = e.cols) : (b = e.localColumnWidth, c = 1), a = Math.abs(a), d = Math.floor(a / b) * c, a % b > 20 && (d += c), e.sliderActive = f ? Math.min(e.sliderActive + d, e.blocksAvailable.length - e.cols) : Math.max(0, e.sliderActive - d), e._goToSlider()
        }, _isStartSlider: function () {
            return 0 === this.sliderActive
        }, _isEndSlider: function () {
            var a = this;
            return a.sliderActive + a.cols > a.blocksAvailable.length - 1
        }, _goToSlider: function () {
            var a = this;
            a._enableDisableNavSlider(), a._updateSliderPosition()
        }, _startSliderAuto: function () {
            var a = this;
            return a.isDrag ? void a._stopSliderAuto() : void(a.timeout = setTimeout(function () {
                a._nextSlider(), a._startSliderAuto()
            }, a.options.autoTimeout))
        }, _stopSliderAuto: function () {
            clearTimeout(this.timeout)
        }, _enableDisableNavSlider: function () {
            var a, b, c = this;
            c.options.showNavigation && (c.options.rewindNav || (b = c._isStartSlider() ? "addClass" : "removeClass", c.navPrev[b]("cbp-nav-stop"), b = c._isEndSlider() ? "addClass" : "removeClass", c.navNext[b]("cbp-nav-stop"))), c.options.showPagination && (a = c.options.scrollByPage ? Math.ceil(c.sliderActive / c.cols) : c._isEndSlider() ? c.navPaginationItems.length - 1 : Math.floor(c.sliderActive / c.cols), c.navPaginationItems.removeClass("cbp-nav-pagination-active").eq(a).addClass("cbp-nav-pagination-active"))
        }, _sliderLayout: function () {
            var b = this;
            b.blocksAvailable.each(function (c, d) {
                var e = a(d), f = 0;
                b.styleQueue.push({
                    $el: e,
                    style: b[b.supportTransform](b.localColumnWidth * c, 0)
                }), f += e.outerHeight(!0) + b.options.gapHorizontal, b.colVert.push(f)
            }), b.sliderColVert = b.colVert.slice(b.sliderActive, b.sliderActive + b.cols), b.ulWidth = b.localColumnWidth * b.blocksAvailable.length - b.options.gapVertical, b.$ul.width(b.ulWidth)
        }, _updateSliderPosition: function () {
            var a = this, b = -a.sliderActive * a.localColumnWidth, c = a[a.supportTransform](b, 0);
            a.$ul[a.transition](c), a.sliderColVert = a.colVert.slice(a.sliderActive, a.sliderActive + a.cols), a._resizeMainContainer(a.transition)
        }, _dragSlider: function () {
            function d(b) {
                return u ? o = b : b.preventDefault(), p.options.auto && p._stopSliderAuto(), s ? void a(l).one("click" + f, function () {
                    return !1
                }) : (l = a(b.target), j = i(b).x, k = 0, m = -p.sliderActive * p.localColumnWidth, n = p.localColumnWidth * (p.blocksAvailable.length - p.cols), q.on(t.move, g), q.on(t.end, e), void p.$obj.addClass("cbp-mode-slider-dragStart"))
            }

            function e() {
                p.$obj.removeClass("cbp-mode-slider-dragStart"), s = !0, 0 !== k ? (l.one("click" + f, function () {
                    return !1
                }), p._jumpDragToSlider(k), p.$ul.one(p.transitionEnd, h)) : h.call(p), q.off(t.move), q.off(t.end)
            }

            function g(a) {
                k = j - i(a).x, (k > 8 || -8 > k) && a.preventDefault(), p.isDrag = !0;
                var b = m - k;
                0 > k && m > k ? b = (m - k) / 5 : k > 0 && -n > m - k && (b = -n + (n + m - k) / 5);
                var c = r(b, 0);
                p.$ul[p.transition](c)
            }

            function h() {
                if (s = !1, p.isDrag = !1, p.options.auto) {
                    if (p.mouseIsEntered)return;
                    p._startSliderAuto()
                }
            }

            function i(a) {
                return {x: a.pageX || a.originalEvent.touches[0].pageX, y: a.pageY || a.originalEvent.touches[0].pageY}
            }

            var j, k, l, m, n, o, p = this, q = a(c), r = p[p.supportTransform], s = !1, t = {}, u = !1;
            p.isDrag = !1, "ontouchstart" in b || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0 ? (t = {
                start: "touchstart" + f,
                move: "touchmove" + f,
                end: "touchend" + f
            }, u = !0) : t = {start: "mousedown" + f, move: "mousemove" + f, end: "mouseup" + f}, p.$ul.on(t.start, d)
        }, _sliderLayoutReset: function () {
            var a = this;
            a.colVert = []
        }, _gridMarkup: function () {
        }, _gridLayout: function () {
            var b = this;
            b.blocksAvailable.each(function (c, d) {
                var e = a(d), f = Math.ceil(e.outerWidth() / b.localColumnWidth), g = 0;
                if (f = Math.min(f, b.cols), b.singlePageInline && c >= b.singlePageInline.matrice[0] && c <= b.singlePageInline.matrice[1] && (g = b.singlePageInline.height), 1 === f)b._placeBlocks(e, b.colVert, g); else {
                    var h, i, j = b.cols + 1 - f, k = [];
                    for (i = 0; j > i; i++)h = b.colVert.slice(i, i + f), k[i] = Math.max.apply(Math, h);
                    b._placeBlocks(e, k, g)
                }
            })
        }, _gridLayoutReset: function () {
            var a, b = this;
            for ("alignCenter" === b.options.gridAdjustment ? (b.$obj.attr("style", ""), b.width = b.$obj.width(), b.cols = Math.max(Math.floor((b.width + b.options.gapVertical) / b.localColumnWidth), 1), b.width = b.cols * b.localColumnWidth - b.options.gapVertical, b.$obj.css("max-width", b.width)) : (b.width = b.$obj.width(), b.cols = Math.max(Math.floor((b.width + b.options.gapVertical) / b.localColumnWidth), 1)), b.colVert = [], a = b.cols; a--;)b.colVert.push(0)
        }, _responsiveLayout: function () {
            var a, b, c = this;
            c.columnWidthCache ? c.localColumnWidth = c.columnWidthCache : c.columnWidthCache = c.localColumnWidth, c.width = c.$obj.outerWidth() + c.options.gapVertical, c.cols = c[c.getColumnsType](), a = c.width - c.options.gapVertical * c.cols, c.localColumnWidth = parseInt(a / c.cols, 10) + c.options.gapVertical, b = c.localColumnWidth - c.options.gapVertical + "px", c.blocks.each(function (a, d) {
                d.style.width = b, c.blocksClone && (c.blocksClone.eq(a)[0].style.width = b)
            })
        }, _getColumnsAuto: function () {
            var a = this;
            return Math.max(Math.round(a.width / a.localColumnWidth), 1)
        }, _getColumnsBreakpoints: function () {
            var b, c = this, e = c.width - c.options.gapVertical;
            return a.each(c.options.mediaQueries, function (a, c) {
                return e >= c.width ? (b = c.cols, !1) : void 0
            }), b === d && (b = c.options.mediaQueries[c.options.mediaQueries.length - 1].cols), b
        }, _resizeMainContainer: function (a, b) {
            var c, d = this, e = d.sliderColVert || d.colVert;
            b = b || 0, c = Math.max.apply(Math, e) + b, c !== d.height && (d.$obj[a]({height: c - d.options.gapHorizontal}, 400), d.height = c, d.$obj.one(d.transitionEnd, function () {
                d.$obj.trigger("pluginResize.cbp")
            }))
        }, _processStyle: function (a) {
            var b, c = this;
            for (b = c.styleQueue.length - 1; b >= 0; b--)c.styleQueue[b].$el[a](c.styleQueue[b].style);
            c.styleQueue = []
        }, _placeBlocks: function (a, b, c) {
            var d, e, f, g, h, i, j = this, k = Math.min.apply(Math, b), l = 0;
            for (h = 0, i = b.length; i > h; h++)if (b[h] === k) {
                l = h;
                break
            }
            for (j.singlePageInline && 0 !== c && (j.singlePageInline.top = k), k += c, d = Math.round(j.localColumnWidth * l), e = Math.round(k), j.styleQueue.push({
                $el: a,
                style: j[j.supportTransform](d, e)
            }), f = k + a.outerHeight() + j.options.gapHorizontal, g = j.cols + 1 - i, h = 0; g > h; h++)j.colVert[l + h] = f
        }, _withCSS2: function (a, b) {
            return {left: a, top: b}
        }, _withCSS3: function (a, b) {
            return {translate: [a, b]}
        }, _duplicateContent: function (a) {
            var b = this;
            b.$ulClone = b.$ul.clone(), b.blocksClone = b.$ulClone.children(), b.$ulClone.css(a), b.ulHidden = "clone", b.$obj.append(b.$ulClone)
        }, _fadeOutFilter: function (a, b, c) {
            var d = this;
            "*" !== c && (b = b.filter(c), a = d.blocks.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), d.blocksAvailable = d.blocks.filter(c), a.length && d.styleQueue.push({
                $el: a,
                style: {opacity: 0}
            }), b.length && d.styleQueue.push({
                $el: b,
                style: {opacity: 1}
            }), d._layout(), d._processStyle(d.transitionByFilter), d._resizeMainContainer(d.transition), setTimeout(function () {
                d._filterFinish()
            }, 400)
        }, _quicksandFilter: function (a, b, c) {
            var d = this;
            "*" !== c && (b = b.filter(c), a = d.blocks.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), d.blocksAvailable = d.blocks.filter(c), a.length && d.styleQueue.push({
                $el: a,
                style: {scale: .01, opacity: 0}
            }), b.length && d.styleQueue.push({
                $el: b,
                style: {scale: 1, opacity: 1}
            }), d._layout(), d._processStyle(d.transitionByFilter), d._resizeMainContainer(d.transition), setTimeout(function () {
                d._filterFinish()
            }, 400)
        }, _flipOutFilter: function (a, b, c) {
            var d = this;
            "*" !== c && (b = b.filter(c), a = d.blocks.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), d.blocksAvailable = d.blocks.filter(c), a.length && a.find(".cbp-item-wrapper").removeClass("cbp-animation-flipOut-in").addClass("cbp-animation-flipOut-out"), b.length && b.find(".cbp-item-wrapper").removeClass("cbp-animation-flipOut-out").addClass("cbp-animation-flipOut-in"), d._layout(), d._processStyle(d.transitionByFilter), d._resizeMainContainer(d.transition), setTimeout(function () {
                d._filterFinish()
            }, 400)
        }, _flipBottomFilter: function (a, b, c) {
            var d = this;
            "*" !== c && (b = b.filter(c), a = d.blocks.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), d.blocksAvailable = d.blocks.filter(c), a.length && a.find(".cbp-item-wrapper").removeClass("cbp-animation-flipBottom-in").addClass("cbp-animation-flipBottom-out"), b.length && b.find(".cbp-item-wrapper").removeClass("cbp-animation-flipBottom-out").addClass("cbp-animation-flipBottom-in"), d._layout(), d._processStyle(d.transitionByFilter), d._resizeMainContainer(d.transition), setTimeout(function () {
                d._filterFinish()
            }, 400)
        }, _scaleSidesFilter: function (a, b, c) {
            var d = this;
            "*" !== c && (b = b.filter(c), a = d.blocks.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), d.blocksAvailable = d.blocks.filter(c), a.length && a.find(".cbp-item-wrapper").removeClass("cbp-animation-scaleSides-in").addClass("cbp-animation-scaleSides-out"), b.length && b.find(".cbp-item-wrapper").removeClass("cbp-animation-scaleSides-out").addClass("cbp-animation-scaleSides-in"), d._layout(), d._processStyle(d.transitionByFilter), d._resizeMainContainer(d.transition), setTimeout(function () {
                d._filterFinish()
            }, 400)
        }, _skewFilter: function (a, b, c) {
            var d = this;
            "*" !== c && (b = b.filter(c), a = d.blocks.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), d.blocksAvailable = d.blocks.filter(c), a.length && d.styleQueue.push({
                $el: a,
                style: {skew: [50, 0], scale: .01, opacity: 0}
            }), b.length && d.styleQueue.push({
                $el: b,
                style: {skew: [0, 0], scale: 1, opacity: 1}
            }), d._layout(), d._processStyle(d.transitionByFilter), d._resizeMainContainer(d.transition), setTimeout(function () {
                d._filterFinish()
            }, 400)
        }, _sequentiallyInit: function () {
            this.transitionByFilter = "css"
        }, _sequentiallyFilter: function (a, b, c) {
            var d = this, e = d.blocksAvailable;
            d.blocksAvailable = d.blocks.filter(c), d.$obj.addClass("cbp-no-transition"), e[d.transition]({
                top: -30,
                opacity: 0
            }), setTimeout(function () {
                "*" !== c && (b = b.filter(c), a = d.blocks.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), a.length && a.css({display: "none"}), b.length && b.css("display", "block"), d._layout(), d._processStyle(d.transitionByFilter), d._resizeMainContainer(d.transition);
                var e, f = 0;
                !function g() {
                    e = d.blocksAvailable.eq(f++), e.length ? (e[d.transition]({
                        top: 0,
                        opacity: 1
                    }), setTimeout(g, 130)) : setTimeout(function () {
                        d._filterFinish()
                    }, 600)
                }()
            }, 600)
        }, _fadeOutTopInit: function () {
            this.transitionByFilter = "css"
        }, _fadeOutTopFilter: function (a, b, c) {
            var d = this;
            d.blocksAvailable = d.blocks.filter(c), d.$ul[d.transition]({
                top: -30,
                opacity: 0
            }), d.$obj.addClass("cbp-no-transition"), setTimeout(function () {
                "*" !== c && (b = b.filter(c), a = d.blocks.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), a.length && a.css("opacity", 0), b.length && b.css("opacity", 1), d._layout(), d._processStyle(d.transitionByFilter), d._resizeMainContainer(d.transition), d.$ul[d.transition]({
                    top: 0,
                    opacity: 1
                }), setTimeout(function () {
                    d._filterFinish()
                }, 400)
            }, 400)
        }, _boxShadowInit: function () {
            var a = this;
            a.blocksAvailable.append('<div class="cbp-animation-boxShadowMask"></div>')
        }, _boxShadowFilter: function (a, b, c) {
            var d = this;
            "*" !== c && (b = b.filter(c), a = d.blocks.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden");
            var e = d.blocks.find(".cbp-animation-boxShadowMask");
            e.addClass("cbp-animation-boxShadowShow"), e.removeClass("cbp-animation-boxShadowActive cbp-animation-boxShadowInactive"), d.blocksAvailable = d.blocks.filter(c);
            var f = {};
            a.length && (a.find(".cbp-animation-boxShadowMask").addClass("cbp-animation-boxShadowActive"), d.styleQueue.push({
                $el: a,
                style: {opacity: 0}
            }), f = a.last()), b.length && (b.find(".cbp-animation-boxShadowMask").addClass("cbp-animation-boxShadowInactive"), d.styleQueue.push({
                $el: b,
                style: {opacity: 1}
            }), f = b.last()), d._layout(), f.length ? f.one(d.transitionEnd, function () {
                e.removeClass("cbp-animation-boxShadowShow"), d._filterFinish()
            }) : (e.removeClass("cbp-animation-boxShadowShow"), d._filterFinish()), d._processStyle(d.transitionByFilter), d._resizeMainContainer(d.transition)
        }, _bounceLeftInit: function () {
            var a = this;
            a._duplicateContent({
                left: "-100%",
                opacity: 0
            }), a.transitionByFilter = "css", a.$ul.addClass("cbp-wrapper-front")
        }, _bounceLeftFilter: function (a, b, c) {
            var d, e, f, g = this;
            g.$obj.addClass("cbp-no-transition"), "clone" === g.ulHidden ? (g.ulHidden = "first", d = g.$ulClone, f = g.$ul, e = g.blocksClone) : (g.ulHidden = "clone", d = g.$ul, f = g.$ulClone, e = g.blocks), b = e.filter(".cbp-item-hidden"), "*" !== c && (b = b.filter(c), e.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), g.blocksAvailable = e.filter(c), g._layout(), f[g.transition]({
                left: "-100%",
                opacity: 0
            }).removeClass("cbp-wrapper-front").addClass("cbp-wrapper-back"), d[g.transition]({
                left: 0,
                opacity: 1
            }).addClass("cbp-wrapper-front").removeClass("cbp-wrapper-back"), g._processStyle(g.transitionByFilter), g._resizeMainContainer(g.transition), setTimeout(function () {
                g._filterFinish()
            }, 400)
        }, _bounceTopInit: function () {
            var a = this;
            a._duplicateContent({
                top: "-100%",
                opacity: 0
            }), a.transitionByFilter = "css", a.$ul.addClass("cbp-wrapper-front")
        }, _bounceTopFilter: function (a, b, c) {
            var d, e, f, g = this;
            g.$obj.addClass("cbp-no-transition"), "clone" === g.ulHidden ? (g.ulHidden = "first", d = g.$ulClone, f = g.$ul, e = g.blocksClone) : (g.ulHidden = "clone", d = g.$ul, f = g.$ulClone, e = g.blocks), b = e.filter(".cbp-item-hidden"), "*" !== c && (b = b.filter(c), e.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), g.blocksAvailable = e.filter(c), g._layout(), f[g.transition]({
                top: "-100%",
                opacity: 0
            }).removeClass("cbp-wrapper-front").addClass("cbp-wrapper-back"), d[g.transition]({
                top: 0,
                opacity: 1
            }).addClass("cbp-wrapper-front").removeClass("cbp-wrapper-back"), g._processStyle(g.transitionByFilter), g._resizeMainContainer(g.transition), setTimeout(function () {
                g._filterFinish()
            }, 400)
        }, _bounceBottomInit: function () {
            var a = this;
            a._duplicateContent({top: "100%", opacity: 0}), a.transitionByFilter = "css"
        }, _bounceBottomFilter: function (a, b, c) {
            var d, e, f, g = this;
            g.$obj.addClass("cbp-no-transition"), "clone" === g.ulHidden ? (g.ulHidden = "first", d = g.$ulClone, f = g.$ul, e = g.blocksClone) : (g.ulHidden = "clone", d = g.$ul, f = g.$ulClone, e = g.blocks), b = e.filter(".cbp-item-hidden"), "*" !== c && (b = b.filter(c), e.not(".cbp-item-hidden").not(c).addClass("cbp-item-hidden")), b.removeClass("cbp-item-hidden"), g.blocksAvailable = e.filter(c), g._layout(), f[g.transition]({
                top: "100%",
                opacity: 0
            }).removeClass("cbp-wrapper-front").addClass("cbp-wrapper-back"), d[g.transition]({
                top: 0,
                opacity: 1
            }).addClass("cbp-wrapper-front").removeClass("cbp-wrapper-back"), g._processStyle(g.transitionByFilter), g._resizeMainContainer(g.transition), setTimeout(function () {
                g._filterFinish()
            }, 400)
        }, _moveLeftInit: function () {
            var a = this;
            a._duplicateContent({
                left: "100%",
                opacity: 0
            }), a.$ulClone.addClass("no-trans"), a.transitionByFilter = "css"
        }, _moveLeftFilter: function (a, b, c) {
            var d, e, f, g = this;
            "*" !== c && (b = b.filter(c)), b.removeClass("cbp-item-hidden"), g.$obj.addClass("cbp-no-transition"), "clone" === g.ulHidden ? (g.ulHidden = "first", d = g.$ulClone, f = g.$ul, e = g.blocksClone) : (g.ulHidden = "clone", d = g.$ul, f = g.$ulClone, e = g.blocks), e.css("opacity", 0), e.addClass("cbp-item-hidden"), g.blocksAvailable = e.filter(c), g.blocksAvailable.css("opacity", 1), g.blocksAvailable.removeClass("cbp-item-hidden"), g._layout(), f[g.transition]({
                left: "-100%",
                opacity: 0
            }), d.removeClass("no-trans"), "css" === g.transition ? (d[g.transition]({
                left: 0,
                opacity: 1
            }), f.one(g.transitionEnd, function () {
                f.addClass("no-trans").css({left: "100%", opacity: 0}), g._filterFinish()
            })) : d[g.transition]({left: 0, opacity: 1}, function () {
                f.addClass("no-trans").css({left: "100%", opacity: 0}), g._filterFinish()
            }), g._processStyle(g.transitionByFilter), g._resizeMainContainer(g.transition)
        }, _slideLeftInit: function () {
            var a = this;
            a._duplicateContent({}), a.$ul.addClass("cbp-wrapper-front"), a.$ulClone.css("opacity", 0), a.transitionByFilter = "css"
        }, _slideLeftFilter: function (a, b, c) {
            var d, e, f, g, h = this;
            h.blocks.show(), h.blocksClone.show(), "*" !== c && (b = b.filter(c)), b.removeClass("cbp-item-hidden"), h.$obj.addClass("cbp-no-transition"), h.blocks.find(".cbp-item-wrapper").removeClass("cbp-animation-slideLeft-out cbp-animation-slideLeft-in"), h.blocksClone.find(".cbp-item-wrapper").removeClass("cbp-animation-slideLeft-out cbp-animation-slideLeft-in"), h.$ul.css({opacity: 1}), h.$ulClone.css({opacity: 1}), "clone" === h.ulHidden ? (h.ulHidden = "first", e = h.blocks, f = h.blocksClone, d = h.blocksClone, h.$ul.removeClass("cbp-wrapper-front"), h.$ulClone.addClass("cbp-wrapper-front")) : (h.ulHidden = "clone", e = h.blocksClone, f = h.blocks, d = h.blocks, h.$ul.addClass("cbp-wrapper-front"), h.$ulClone.removeClass("cbp-wrapper-front")), d.css("opacity", 0), d.addClass("cbp-item-hidden"), h.blocksAvailable = d.filter(c), h.blocksAvailable.css({opacity: 1}), h.blocksAvailable.removeClass("cbp-item-hidden"), h._layout(), "css" === h.transition ? (e.find(".cbp-item-wrapper").addClass("cbp-animation-slideLeft-out"), f.find(".cbp-item-wrapper").addClass("cbp-animation-slideLeft-in"), g = e.find(".cbp-item-wrapper").last(), g.length ? g.one(h.animationEnd, function () {
                h._filterFinish()
            }) : h._filterFinish()) : (e.find(".cbp-item-wrapper").animate({left: "-100%"}, 400, function () {
                h._filterFinish()
            }), f.find(".cbp-item-wrapper").css("left", "100%"), f.find(".cbp-item-wrapper").animate({left: 0}, 400)), h._processStyle(h.transitionByFilter), h._resizeMainContainer("animate")
        }, _slideDelayInit: function () {
            this._wrapperFilterInit()
        }, _slideDelayFilter: function (a, b, c) {
            this._wrapperFilter(a, b, c, "slideDelay", !0)
        }, _3dflipInit: function () {
            this._wrapperFilterInit()
        }, _3dflipFilter: function (a, b, c) {
            this._wrapperFilter(a, b, c, "3dflip", !0)
        }, _rotateSidesInit: function () {
            this._wrapperFilterInit()
        }, _rotateSidesFilter: function (a, b, c) {
            this._wrapperFilter(a, b, c, "rotateSides", !0)
        }, _flipOutDelayInit: function () {
            this._wrapperFilterInit()
        }, _flipOutDelayFilter: function (a, b, c) {
            this._wrapperFilter(a, b, c, "flipOutDelay", !1)
        }, _foldLeftInit: function () {
            this._wrapperFilterInit()
        }, _foldLeftFilter: function (a, b, c) {
            this._wrapperFilter(a, b, c, "foldLeft", !0)
        }, _unfoldInit: function () {
            this._wrapperFilterInit()
        }, _unfoldFilter: function (a, b, c) {
            this._wrapperFilter(a, b, c, "unfold", !0)
        }, _scaleDownInit: function () {
            this._wrapperFilterInit()
        }, _scaleDownFilter: function (a, b, c) {
            this._wrapperFilter(a, b, c, "scaleDown", !0)
        }, _frontRowInit: function () {
            this._wrapperFilterInit()
        }, _frontRowFilter: function (a, b, c) {
            this._wrapperFilter(a, b, c, "frontRow", !0)
        }, _rotateRoomInit: function () {
            this._wrapperFilterInit()
        }, _rotateRoomFilter: function (a, b, c) {
            this._wrapperFilter(a, b, c, "rotateRoom", !0)
        }, _wrapperFilterInit: function () {
            var a = this;
            a._duplicateContent({}), a.$ul.addClass("cbp-wrapper-front"), a.$ulClone.css("opacity", 0), a.transitionByFilter = "css"
        }, _wrapperFilter: function (b, c, d, e, f) {
            var g, h, i, j, k = this;
            if (k.blocks.show(), k.blocksClone.show(), "*" !== d && (c = c.filter(d)), c.removeClass("cbp-item-hidden"), k.$obj.addClass("cbp-no-transition"), k.blocks.find(".cbp-item-wrapper").removeClass("cbp-animation-" + e + "-out cbp-animation-" + e + "-in cbp-animation-" + e + "-fadeOut").css("style", ""), k.blocksClone.find(".cbp-item-wrapper").removeClass("cbp-animation-" + e + "-out cbp-animation-" + e + "-in cbp-animation-" + e + "-fadeOut").css("style", ""), k.$ul.css({opacity: 1}), k.$ulClone.css({opacity: 1}), "clone" === k.ulHidden ? (k.ulHidden = "first", g = k.blocksClone, k.$ul.removeClass("cbp-wrapper-front"), k.$ulClone.addClass("cbp-wrapper-front")) : (k.ulHidden = "clone", g = k.blocks, k.$ul.addClass("cbp-wrapper-front"), k.$ulClone.removeClass("cbp-wrapper-front")), h = k.blocksAvailable, g.css("opacity", 0), g.addClass("cbp-item-hidden"), k.blocksAvailable = g.filter(d), k.blocksAvailable.css({opacity: 1}), k.blocksAvailable.removeClass("cbp-item-hidden"), i = k.blocksAvailable, k._layout(), "css" === k.transition) {
                var l = 0, m = 0;
                i.each(function (b, c) {
                    a(c).find(".cbp-item-wrapper").addClass("cbp-animation-" + e + "-in").css("animation-delay", m / 20 + "s"), m++
                }), h.each(function (b, c) {
                    l >= m && f ? a(c).find(".cbp-item-wrapper").addClass("cbp-animation-" + e + "-fadeOut") : a(c).find(".cbp-item-wrapper").addClass("cbp-animation-" + e + "-out").css("animation-delay", l / 20 + "s"), l++
                }), j = h.find(".cbp-item-wrapper").first(), j.length ? j.one(k.animationEnd, function () {
                    k._filterFinish(), ("ie10" === k.browser || "ie11" === k.browser) && setTimeout(function () {
                        a(".cbp-item-wrapper").removeClass("cbp-animation-" + e + "-in")
                    }, 300)
                }) : (k._filterFinish(), ("ie10" === k.browser || "ie11" === k.browser) && setTimeout(function () {
                    a(".cbp-item-wrapper").removeClass("cbp-animation-" + e + "-in")
                }, 300))
            } else h.find(".cbp-item-wrapper").animate({left: "-100%"}, 400, function () {
                k._filterFinish()
            }), i.find(".cbp-item-wrapper").css("left", "100%"), i.find(".cbp-item-wrapper").animate({left: 0}, 400);
            k._processStyle(k.transitionByFilter), k._resizeMainContainer("animate")
        }, _filterFinish: function () {
            var a = this;
            a.isAnimating = !1, a._triggerEvent("filterFinish"), a.$obj.trigger("filterComplete" + f)
        }, _registerEvent: function (a, b, c) {
            var d = this;
            d.registeredEvents[a] || (d.registeredEvents[a] = []), d.registeredEvents[a].push({
                func: b,
                oneTime: c || !1
            })
        }, _triggerEvent: function (a) {
            var b, c, d = this;
            if (d.registeredEvents[a])for (b = 0, c = d.registeredEvents[a].length; c > b; b++)d.registeredEvents[a][b].func.call(d), d.registeredEvents[a][b].oneTime && (d.registeredEvents[a].splice(b, 1), b--, c--)
        }, init: function (b, c) {
            var d = a.data(this, "cubeportfolio");
            if (d)throw new Error("cubeportfolio is already initialized. Destroy it before initialize again!");
            d = a.data(this, "cubeportfolio", Object.create(h)), d._main(this, b, c)
        }, destroy: function (d) {
            var e = a.data(this, "cubeportfolio");
            if (!e)throw new Error("cubeportfolio is not initialized. Initialize it before calling destroy method!");
            a.isFunction(d) && e._registerEvent("destroyFinish", d, !0), a.removeData(this, "cubeportfolio"), a.each(e.blocks, function () {
                a.removeData(this, "transformFn"), a.removeData(this, "cbp-wxh")
            }), e.$obj.removeClass("cbp cbp-loading cbp-ready cbp-no-transition"), e.$ul.removeClass("cbp-wrapper-front cbp-wrapper-back cbp-wrapper no-trans").removeAttr("style"), "slider" === e.options.layoutMode && e.$ul.unwrap(), e.$obj.removeAttr("style"), e.$ulClone && e.$ulClone.remove(), e.browser && e.$obj.removeClass("cbp-" + e.browser), a(b).off("resize" + f), e.$obj.off(".cbp"), a(c).off(".cbp"), e.lightbox && e.lightbox.destroy(), e.singlePage && e.singlePage.destroy(), e.singlePageInline && e.singlePageInline.destroy(), e.blocks.removeClass("cbp-item-hidden").removeAttr("style"), e.blocks.find(".cbp-item-wrapper").children().unwrap(), e.options.caption && e._captionDestroy(), e.options.animationType && ("boxShadow" === e.options.animationType && a(".cbp-animation-boxShadowMask").remove(), e.$obj.removeClass("cbp-animation-" + e.options.animationType)), e._destroySlider(), e._triggerEvent("destroyFinish")
        }, filter: function (b, c, d) {
            var e, f, g, h = d || a.data(this, "cubeportfolio");
            if (!h)throw new Error("cubeportfolio is not initialized. Initialize it before calling filter method!");
            b = "*" === b || "" === b ? "*" : b, h.isAnimating || h.defaultFilter === b || ("ie8" === h.browser || "ie9" === h.browser ? h.$obj.removeClass("cbp-no-transition cbp-appendItems-loading") : (h.obj.classList.remove("cbp-no-transition"), h.obj.classList.remove("cbp-appendItems-loading")), h.defaultFilter = b, h.isAnimating = !0, a.isFunction(c) && h._registerEvent("filterFinish", c, !0), e = h.blocks.filter(".cbp-item-hidden"), f = [], h.singlePageInline && h.singlePageInline.isOpen ? h.singlePageInline.close("promise", {
                callback: function () {
                    h["_" + h.options.animationType + "Filter"](f, e, b)
                }
            }) : h["_" + h.options.animationType + "Filter"](f, e, b), h.options.filterDeeplinking && (g = location.href.replace(/#cbpf=(.*?)([#|?&]|$)/gi, ""), location.href = g + "#cbpf=" + b, h.singlePage && h.singlePage.url && (h.singlePage.url = location.href)))
        }, showCounter: function (b, c) {
            var d = a.data(this, "cubeportfolio");
            if (!d)throw new Error("cubeportfolio is not initialized. Initialize it before calling showCounter method!");
            d.elems = b, a.each(b, function () {
                var b, c = a(this), e = c.data("filter");
                e = "*" === e || "" === e ? "*" : e, b = d.blocks.filter(e).length, c.find(".cbp-filter-counter").text(b)
            }), a.isFunction(c) && c.call(d)
        }, appendItems: function (b, c) {
            var d = this, e = a.data(d, "cubeportfolio");
            if (!e)throw new Error("cubeportfolio is not initialized. Initialize it before calling appendItems method!");
            e.singlePageInline && e.singlePageInline.isOpen ? e.singlePageInline.close("promise", {
                callback: function () {
                    h._addItems.call(d, b, c)
                }
            }) : h._addItems.call(d, b, c)
        }, _addItems: function (b, c) {
            var d, e, f, g, i = a.data(this, "cubeportfolio"), j = this;
            a.isFunction(c) && i._registerEvent("appendItemsFinish", c, !0), i.$obj.addClass("cbp-no-transition cbp-appendItems-loading"), b = a(b).css("opacity", 0), b.filter(".cbp-item").wrapInner('<div class="cbp-item-wrapper"></div>'), g = b.filter(i.defaultFilter), i.ulHidden ? "first" === i.ulHidden ? (b.appendTo(i.$ulClone), i.blocksClone = i.$ulClone.children(), e = i.blocksClone, f = b.clone(), f.appendTo(i.$ul), i.blocks = i.$ul.children()) : (b.appendTo(i.$ul), i.blocks = i.$ul.children(), e = i.blocks, f = b.clone(), f.appendTo(i.$ulClone), i.blocksClone = i.$ulClone.children()) : (b.appendTo(i.$ul), i.blocks = i.$ul.children(), e = i.blocks), i.options.caption && (i._captionDestroy(), i._captionInit()), d = i.defaultFilter, i.blocksAvailable = e.filter(d), e.not(".cbp-item-hidden").not(d).addClass("cbp-item-hidden"), i._load(i.$obj, function () {
                "responsive" === i.options.gridAdjustment && i._responsiveLayout(), i._layout(), i._processStyle(i.transitionByFilter), i._resizeMainContainer("animate"), "slider" === i.options.layoutMode && (i._updateSlider(), i.$obj.removeClass("cbp-no-transition"));
                var a = b.filter(".cbp-item-hidden");
                switch (i.options.animationType) {
                    case"flipOut":
                        a.find(".cbp-item-wrapper").addClass("cbp-animation-flipOut-out");
                        break;
                    case"scaleSides":
                        a.find(".cbp-item-wrapper").addClass("cbp-animation-scaleSides-out");
                        break;
                    case"flipBottom":
                        a.find(".cbp-item-wrapper").addClass("cbp-animation-flipBottom-out")
                }
                g.animate({opacity: 1}, 800, function () {
                    switch (i.options.animationType) {
                        case"bounceLeft":
                        case"bounceTop":
                        case"bounceBottom":
                            i.blocks.css("opacity", 1), i.blocksClone.css("opacity", 1);
                            break;
                        case"flipOut":
                        case"scaleSides":
                        case"flipBottom":
                            a.css("opacity", 1)
                    }
                }), i.elems && h.showCounter.call(j, i.elems), setTimeout(function () {
                    i._triggerEvent("appendItemsFinish")
                }, 700)
            })
        }
    };
    a.fn.cubeportfolio = function (a) {
        var b = arguments;
        return this.each(function () {
            if (h[a])return h[a].apply(this, Array.prototype.slice.call(b, 1));
            if ("object" != typeof a && a)throw new Error("Method " + a + " does not exist on jquery.cubeportfolio.js");
            return h.init.apply(this, b)
        })
    }, a.fn.cubeportfolio.options = {
        layoutMode: "grid",
        drag: !0,
        auto: !1,
        autoTimeout: 5e3,
        autoPauseOnHover: !0,
        showNavigation: !0,
        showPagination: !0,
        rewindNav: !0,
        scrollByPage: !1,
        defaultFilter: "*",
        filterDeeplinking: !1,
        animationType: "fadeOut",
        gridAdjustment: "responsive",
        mediaQueries: !1,
        gapHorizontal: 10,
        gapVertical: 10,
        caption: "pushTop",
        displayType: "lazyLoading",
        displayTypeSpeed: 400,
        lightboxDelegate: ".cbp-lightbox",
        lightboxGallery: !0,
        lightboxTitleSrc: "data-title",
        lightboxCounter: '<div class="cbp-popup-lightbox-counter">{{current}} of {{total}}</div>',
        singlePageDelegate: ".cbp-singlePage",
        singlePageDeeplinking: !0,
        singlePageStickyNavigation: !0,
        singlePageCounter: '<div class="cbp-popup-singlePage-counter">{{current}} of {{total}}</div>',
        singlePageAnimation: "left",
        singlePageCallback: function () {
        },
        singlePageInlineDelegate: ".cbp-singlePageInline",
        singlePageInlinePosition: "top",
        singlePageInlineInFocus: !0,
        singlePageInlineCallback: function () {
        }
    }
}(jQuery, window, document);

/*!
 *  - v1.1.0
 * Homepage: http://bqworks.com/slider-pro/
 * Author: bqworks
 * Author URL: http://bqworks.com/
 */
!function (a, b) {
    "use strict";
    b.SliderPro = {
        modules: [], addModule: function (a, c) {
            this.modules.push(a), b.extend(d.prototype, c)
        }
    };
    var c = b.SliderPro.namespace = "SliderPro", d = function (a, c) {
        this.instance = a, this.$slider = b(this.instance), this.$slides = null, this.$slidesMask = null, this.$slidesContainer = null, this.slides = [], this.slidesOrder = [], this.options = c, this.settings = {}, this.originalSettings = {}, this.originalGotoSlide = null, this.selectedSlideIndex = 0, this.previousSlideIndex = 0, this.middleSlidePosition = 0, this.supportedAnimation = null, this.vendorPrefix = null, this.transitionEvent = null, this.positionProperty = null, this.isIE = null, this.slidesPosition = 0, this.slideWidth = 0, this.slideHeight = 0, this.slideSize = 0, this.previousSlideWidth = 0, this.previousSlideHeight = 0, this.previousWindowWidth = 0, this.previousWindowHeight = 0, this.visibleOffset = 0, this.allowResize = !0, this.uniqueId = (new Date).valueOf(), this.breakpoints = [], this.currentBreakpoint = -1, this.shuffledIndexes = [], this._init()
    };
    d.prototype = {
        _init: function () {
            var d = this;
            this.supportedAnimation = f.getSupportedAnimation(), this.vendorPrefix = f.getVendorPrefix(), this.transitionEvent = f.getTransitionEvent(), this.isIE = f.checkIE(), this.$slider.removeClass("sp-no-js"), a.navigator.userAgent.match(/(iPad|iPhone|iPod)/g) && this.$slider.addClass("ios");
            var e = /(msie) ([\w.]+)/, g = e.exec(a.navigator.userAgent.toLowerCase());
            this.isIE && this.$slider.addClass("ie"), null !== g && this.$slider.addClass("ie" + parseInt(g[2], 10)), this.$slidesContainer = b('<div class="sp-slides-container"></div>').appendTo(this.$slider), this.$slidesMask = b('<div class="sp-mask"></div>').appendTo(this.$slidesContainer), this.$slides = this.$slider.find(".sp-slides").appendTo(this.$slidesMask), this.$slider.find(".sp-slide").appendTo(this.$slides);
            var h = b.SliderPro.modules;
            if ("undefined" != typeof h)for (var i = 0; i < h.length; i++) {
                var j = h[i].substring(0, 1).toLowerCase() + h[i].substring(1) + "Defaults";
                "undefined" != typeof this[j] && b.extend(this.defaults, this[j])
            }
            if (this.settings = b.extend({}, this.defaults, this.options), "undefined" != typeof h)for (var k = 0; k < h.length; k++)"undefined" != typeof this["init" + h[k]] && this["init" + h[k]]();
            if (this.originalSettings = b.extend({}, this.settings), this.originalGotoSlide = this.gotoSlide, null !== this.settings.breakpoints) {
                for (var l in this.settings.breakpoints)this.breakpoints.push({
                    size: parseInt(l, 10),
                    properties: this.settings.breakpoints[l]
                });
                this.breakpoints = this.breakpoints.sort(function (a, b) {
                    return a.size >= b.size ? 1 : -1
                })
            }
            if (this.selectedSlideIndex = this.settings.startSlide, this.settings.shuffle === !0) {
                var m = this.$slides.find(".sp-slide"), n = [];
                m.each(function (a) {
                    d.shuffledIndexes.push(a)
                });
                for (var o = this.shuffledIndexes.length - 1; o > 0; o--) {
                    var p = Math.floor(Math.random() * (o + 1)), q = this.shuffledIndexes[o];
                    this.shuffledIndexes[o] = this.shuffledIndexes[p], this.shuffledIndexes[p] = q
                }
                b.each(this.shuffledIndexes, function (a, b) {
                    n.push(m[b])
                }), this.$slides.empty().append(n)
            }
            b(a).on("resize." + this.uniqueId + "." + c, function () {
                var c = b(a).width(), e = b(a).height();
                d.allowResize === !1 || d.previousWindowWidth === c && d.previousWindowHeight === e || (d.previousWindowWidth = c, d.previousWindowHeight = e, d.allowResize = !1, setTimeout(function () {
                    d.resize(), d.allowResize = !0
                }, 200))
            }), this.on("update." + c, function () {
                d.previousSlideWidth = 0, d.resize()
            }), this.update(), this.trigger({type: "init"}), b.isFunction(this.settings.init) && this.settings.init.call(this, {type: "init"})
        },
        update: function () {
            var a = this;
            "horizontal" === this.settings.orientation ? (this.$slider.removeClass("sp-vertical").addClass("sp-horizontal"), this.$slider.css({
                height: "",
                "max-height": ""
            }), this.$slides.find(".sp-slide").css("top", "")) : "vertical" === this.settings.orientation && (this.$slider.removeClass("sp-horizontal").addClass("sp-vertical"), this.$slides.find(".sp-slide").css("left", "")), this.positionProperty = "horizontal" === this.settings.orientation ? "left" : "top", this.gotoSlide = this.originalGotoSlide;
            for (var c = this.slides.length - 1; c >= 0; c--)if (0 === this.$slider.find('.sp-slide[data-index="' + c + '"]').length) {
                var d = this.slides[c];
                d.destroy(), this.slides.splice(c, 1)
            }
            this.slidesOrder.length = 0, this.$slider.find(".sp-slide").each(function (c) {
                var d = b(this);
                "undefined" == typeof d.attr("data-init") ? a._createSlide(c, d) : a.slides[c].setIndex(c), a.slidesOrder.push(c)
            }), this.middleSlidePosition = parseInt((a.slidesOrder.length - 1) / 2, 10), this.settings.loop === !0 && this._updateSlidesOrder(), this.trigger({type: "update"}), b.isFunction(this.settings.update) && this.settings.update.call(this, {type: "update"})
        },
        _createSlide: function (a, c) {
            var d = new e(b(c), a, this.settings);
            this.slides.splice(a, 0, d)
        },
        _updateSlidesOrder: function () {
            var a, c, d = b.inArray(this.selectedSlideIndex, this.slidesOrder) - this.middleSlidePosition;
            if (0 > d)for (a = this.slidesOrder.splice(d, Math.abs(d)), c = a.length - 1; c >= 0; c--)this.slidesOrder.unshift(a[c]); else if (d > 0)for (a = this.slidesOrder.splice(0, d), c = 0; c <= a.length - 1; c++)this.slidesOrder.push(a[c])
        },
        _updateSlidesPosition: function () {
            for (var a = parseInt(this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).css(this.positionProperty), 10), b = 0; b < this.slidesOrder.length; b++) {
                var c = this.$slides.find(".sp-slide").eq(this.slidesOrder[b]);
                c.css(this.positionProperty, a + (b - this.middleSlidePosition) * (this.slideSize + this.settings.slideDistance))
            }
        },
        _resetSlidesPosition: function () {
            for (var a = 0; a < this.slidesOrder.length; a++) {
                var b = this.$slides.find(".sp-slide").eq(this.slidesOrder[a]);
                b.css(this.positionProperty, a * (this.slideSize + this.settings.slideDistance))
            }
            var c = -parseInt(this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).css(this.positionProperty), 10) + this.visibleOffset;
            this._moveTo(c, !0)
        },
        resize: function () {
            var c = this;
            if (null !== this.settings.breakpoints && this.breakpoints.length > 0)if (b(a).width() > this.breakpoints[this.breakpoints.length - 1].size && -1 !== this.currentBreakpoint)this.currentBreakpoint = -1, this._setProperties(this.originalSettings, !1); else for (var d = 0, e = this.breakpoints.length; e > d; d++)if (b(a).width() <= this.breakpoints[d].size) {
                if (this.currentBreakpoint !== this.breakpoints[d].size) {
                    var f = {
                        type: "breakpointReach",
                        size: this.breakpoints[d].size,
                        settings: this.breakpoints[d].properties
                    };
                    this.trigger(f), b.isFunction(this.settings.breakpointReach) && this.settings.breakpointReach.call(this, f), this.currentBreakpoint = this.breakpoints[d].size;
                    var g = b.extend({}, this.originalSettings, this.breakpoints[d].properties);
                    return void this._setProperties(g, !1)
                }
                break
            }
            this.settings.responsive === !0 ? "fullWidth" !== this.settings.forceSize && "fullWindow" !== this.settings.forceSize || "auto" !== this.settings.visibleSize && ("auto" === this.settings.visibleSize || "vertical" !== this.settings.orientation) ? this.$slider.css({
                width: "100%",
                "max-width": this.settings.width,
                marginLeft: ""
            }) : (this.$slider.css("margin", 0), this.$slider.css({
                width: b(a).width(),
                "max-width": "",
                marginLeft: -this.$slider.offset().left
            })) : this.$slider.css({width: this.settings.width}), -1 === this.settings.aspectRatio && (this.settings.aspectRatio = this.settings.width / this.settings.height), this.slideWidth = this.$slider.width(), this.slideHeight = "fullWindow" === this.settings.forceSize ? b(a).height() : isNaN(this.settings.aspectRatio) ? this.settings.height : this.slideWidth / this.settings.aspectRatio, (this.previousSlideWidth !== this.slideWidth || this.previousSlideHeight !== this.slideHeight || "auto" !== this.settings.visibleSize || this.$slider.outerWidth() > this.$slider.parent().width() || this.$slider.width() !== this.$slidesMask.width()) && (this.previousSlideWidth = this.slideWidth, this.previousSlideHeight = this.slideHeight, this.slideSize = "horizontal" === this.settings.orientation ? this.slideWidth : this.slideHeight, this.visibleSlidesSize = this.slideSize, this.visibleOffset = 0, b.each(this.slides, function (a, b) {
                b.setSize(c.slideWidth, c.slideHeight)
            }), this.$slidesMask.css({
                width: this.slideWidth,
                height: this.slideHeight
            }), this.settings.autoHeight === !0 ? setTimeout(function () {
                c._resizeHeight()
            }, 1) : this.$slidesMask.css(this.vendorPrefix + "transition", ""), "auto" !== this.settings.visibleSize && ("horizontal" === this.settings.orientation ? ("fullWidth" === this.settings.forceSize || "fullWindow" === this.settings.forceSize ? (this.$slider.css("margin", 0), this.$slider.css({
                width: b(a).width(),
                "max-width": "",
                marginLeft: -this.$slider.offset().left
            })) : this.$slider.css({
                width: this.settings.visibleSize,
                "max-width": "100%",
                marginLeft: 0
            }), this.$slidesMask.css("width", this.$slider.width()), this.visibleSlidesSize = this.$slidesMask.width(), this.visibleOffset = Math.round((this.$slider.width() - this.slideWidth) / 2)) : (this.$slider.css("fullWindow" === this.settings.forceSize ? {
                height: b(a).height(),
                "max-height": ""
            } : {
                height: this.settings.visibleSize,
                "max-height": "100%"
            }), this.$slidesMask.css("height", this.$slider.height()), this.visibleSlidesSize = this.$slidesMask.height(), this.visibleOffset = Math.round((this.$slider.height() - this.slideHeight) / 2))), this._resetSlidesPosition(), this.trigger({type: "sliderResize"}), b.isFunction(this.settings.sliderResize) && this.settings.sliderResize.call(this, {type: "sliderResize"}))
        },
        _resizeHeight: function () {
            var a = this, b = this.getSlideAt(this.selectedSlideIndex), d = b.getSize();
            b.off("imagesLoaded." + c), b.on("imagesLoaded." + c, function (c) {
                if (c.index === a.selectedSlideIndex) {
                    var d = b.getSize();
                    a._resizeHeightTo(d.height)
                }
            }), "loading" !== d && this._resizeHeightTo(d.height)
        },
        gotoSlide: function (a) {
            if (a !== this.selectedSlideIndex && "undefined" != typeof this.slides[a]) {
                var c = this;
                this.previousSlideIndex = this.selectedSlideIndex, this.selectedSlideIndex = a, this.$slides.find(".sp-selected").removeClass("sp-selected"), this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).addClass("sp-selected"), this.settings.loop === !0 && (this._updateSlidesOrder(), this._updateSlidesPosition()), this.settings.autoHeight === !0 && this._resizeHeight();
                var d = -parseInt(this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).css(this.positionProperty), 10) + this.visibleOffset;
                this._moveTo(d, !1, function () {
                    c.settings.loop === !0 && c._resetSlidesPosition(), c.trigger({
                        type: "gotoSlideComplete",
                        index: a,
                        previousIndex: c.previousSlideIndex
                    }), b.isFunction(c.settings.gotoSlideComplete) && c.settings.gotoSlideComplete.call(c, {
                        type: "gotoSlideComplete",
                        index: a,
                        previousIndex: c.previousSlideIndex
                    })
                }), this.trigger({
                    type: "gotoSlide",
                    index: a,
                    previousIndex: this.previousSlideIndex
                }), b.isFunction(this.settings.gotoSlide) && this.settings.gotoSlide.call(this, {
                    type: "gotoSlide",
                    index: a,
                    previousIndex: this.previousSlideIndex
                })
            }
        },
        nextSlide: function () {
            var a = this.selectedSlideIndex >= this.getTotalSlides() - 1 ? 0 : this.selectedSlideIndex + 1;
            this.gotoSlide(a)
        },
        previousSlide: function () {
            var a = this.selectedSlideIndex <= 0 ? this.getTotalSlides() - 1 : this.selectedSlideIndex - 1;
            this.gotoSlide(a)
        },
        _moveTo: function (a, b, c) {
            var d = this, e = {};
            if (a !== this.slidesPosition)if (this.slidesPosition = a, "css-3d" !== this.supportedAnimation && "css-2d" !== this.supportedAnimation || this.isIE !== !1)e["margin-" + this.positionProperty] = a, "undefined" != typeof b && b === !0 ? this.$slides.css(e) : (this.$slides.addClass("sp-animated"), this.$slides.animate(e, this.settings.slideAnimationDuration, function () {
                d.$slides.removeClass("sp-animated"), "function" == typeof c && c()
            })); else {
                var f, g = "horizontal" === this.settings.orientation ? a : 0, h = "horizontal" === this.settings.orientation ? 0 : a;
                e[this.vendorPrefix + "transform"] = "css-3d" === this.supportedAnimation ? "translate3d(" + g + "px, " + h + "px, 0)" : "translate(" + g + "px, " + h + "px)", "undefined" != typeof b && b === !0 ? f = "" : (this.$slides.addClass("sp-animated"), f = this.vendorPrefix + "transform " + this.settings.slideAnimationDuration / 1e3 + "s", this.$slides.on(this.transitionEvent, function (a) {
                    a.target === a.currentTarget && (d.$slides.off(d.transitionEvent), d.$slides.removeClass("sp-animated"), "function" == typeof c && c())
                })), e[this.vendorPrefix + "transition"] = f, this.$slides.css(e)
            }
        },
        _stopMovement: function () {
            var a = {};
            if ("css-3d" !== this.supportedAnimation && "css-2d" !== this.supportedAnimation || this.isIE !== !1)this.$slides.stop(), this.slidesPosition = parseInt(this.$slides.css("margin-" + this.positionProperty), 10); else {
                var b = this.$slides.css(this.vendorPrefix + "transform"), c = -1 !== b.indexOf("matrix3d") ? "matrix3d" : "matrix", d = b.replace(c, "").match(/-?[0-9\.]+/g), e = "matrix3d" === c ? parseInt(d[12], 10) : parseInt(d[4], 10), f = "matrix3d" === c ? parseInt(d[13], 10) : parseInt(d[5], 10);
                a[this.vendorPrefix + "transform"] = "css-3d" === this.supportedAnimation ? "translate3d(" + e + "px, " + f + "px, 0)" : "translate(" + e + "px, " + f + "px)", a[this.vendorPrefix + "transition"] = "", this.$slides.css(a), this.$slides.off(this.transitionEvent), this.slidesPosition = "horizontal" === this.settings.orientation ? e : f
            }
            this.$slides.removeClass("sp-animated")
        },
        _resizeHeightTo: function (a) {
            var b = {height: a};
            "css-3d" === this.supportedAnimation || "css-2d" === this.supportedAnimation ? (b[this.vendorPrefix + "transition"] = "height " + this.settings.heightAnimationDuration / 1e3 + "s", this.$slidesMask.css(b)) : this.$slidesMask.animate(b, this.settings.heightAnimationDuration)
        },
        destroy: function () {
            this.$slider.removeData("sliderPro"), this.$slider.removeAttr("style"), this.$slides.removeAttr("style"), this.off("update." + c), b(a).off("resize." + this.uniqueId + "." + c);
            var d = b.SliderPro.modules;
            if ("undefined" != typeof d)for (var e = 0; e < d.length; e++)"undefined" != typeof this["destroy" + d[e]] && this["destroy" + d[e]]();
            b.each(this.slides, function (a, b) {
                b.destroy()
            }), this.slides.length = 0, this.$slides.prependTo(this.$slider), this.$slidesContainer.remove()
        },
        _setProperties: function (a, b) {
            for (var c in a)this.settings[c] = a[c], b !== !1 && (this.originalSettings[c] = a[c]);
            this.update()
        },
        on: function (a, b) {
            return this.$slider.on(a, b)
        },
        off: function (a) {
            return this.$slider.off(a)
        },
        trigger: function (a) {
            return this.$slider.triggerHandler(a)
        },
        getSlideAt: function (a) {
            return this.slides[a]
        },
        getSelectedSlide: function () {
            return this.selectedSlideIndex
        },
        getTotalSlides: function () {
            return this.slides.length
        },
        defaults: {
            width: 500,
            height: 300,
            responsive: !0,
            aspectRatio: -1,
            imageScaleMode: "cover",
            centerImage: !0,
            autoHeight: !1,
            startSlide: 0,
            shuffle: !1,
            orientation: "horizontal",
            forceSize: "none",
            loop: !0,
            slideDistance: 10,
            slideAnimationDuration: 700,
            heightAnimationDuration: 700,
            visibleSize: "auto",
            breakpoints: null,
            init: function () {
            },
            update: function () {
            },
            sliderResize: function () {
            },
            gotoSlide: function () {
            },
            gotoSlideComplete: function () {
            },
            breakpointReach: function () {
            }
        }
    };
    var e = function (a, b, c) {
        this.$slide = a, this.$mainImage = null, this.$imageContainer = null, this.hasMainImage = !1, this.isMainImageLoaded = !1, this.isMainImageLoading = !1, this.hasImages = !1, this.areImagesLoaded = !1, this.width = 0, this.height = 0, this.settings = c, this.setIndex(b), this._init()
    };
    e.prototype = {
        _init: function () {
            this.$slide.attr("data-init", !0), this.$mainImage = 0 !== this.$slide.find(".sp-image").length ? this.$slide.find(".sp-image") : null, null !== this.$mainImage && (this.hasMainImage = !0, this.$imageContainer = b('<div class="sp-image-container"></div>').prependTo(this.$slide), 0 !== this.$mainImage.parent("a").length ? this.$mainImage.parent("a").appendTo(this.$imageContainer) : this.$mainImage.appendTo(this.$imageContainer)), this.hasImages = 0 !== this.$slide.find("img").length ? !0 : !1
        }, setSize: function (a, b) {
            this.width = a, this.height = this.settings.autoHeight === !0 ? "auto" : b, this.$slide.css({
                width: this.width,
                height: this.height
            }), this.hasMainImage === !0 && (this.$imageContainer.css({
                width: this.width,
                height: this.height
            }), "undefined" == typeof this.$mainImage.attr("data-src") && this.resizeMainImage())
        }, getSize: function () {
            var a, b = this;
            if (this.hasImages === !0 && this.areImagesLoaded === !1 && "undefined" == typeof this.$slide.attr("data-loading")) {
                this.$slide.attr("data-loading", !0);
                var d = f.checkImagesComplete(this.$slide, function () {
                    b.areImagesLoaded = !0, b.$slide.removeAttr("data-loading"), b.trigger({
                        type: "imagesLoaded." + c,
                        index: b.index
                    })
                });
                return "complete" === d ? (a = this.calculateSize(), {width: a.width, height: a.height}) : "loading"
            }
            return a = this.calculateSize(), {width: a.width, height: a.height}
        }, calculateSize: function () {
            var a = this.$slide.width(), c = this.$slide.height();
            return this.$slide.children().each(function (d, e) {
                var f = b(e);
                if (f.is(":hidden") !== !0) {
                    var g = e.getBoundingClientRect(), h = f.position().top + (g.bottom - g.top), i = f.position().left + (g.right - g.left);
                    h > c && (c = h), i > a && (a = i)
                }
            }), {width: a, height: c}
        }, resizeMainImage: function (a) {
            var b = this;
            return a === !0 && (this.isMainImageLoaded = !1, this.isMainImageLoading = !1), this.isMainImageLoaded === !1 && this.isMainImageLoading === !1 ? (this.isMainImageLoading = !0, void f.checkImagesComplete(this.$mainImage, function () {
                b.isMainImageLoaded = !0, b.isMainImageLoading = !1, b.resizeMainImage(), b.trigger({
                    type: "imagesLoaded." + c,
                    index: b.index
                })
            })) : void(this.settings.autoHeight === !0 ? this.$mainImage.css({
                width: "100%",
                height: "auto",
                marginLeft: "",
                marginTop: ""
            }) : ("cover" === this.settings.imageScaleMode ? this.$mainImage.css(this.$mainImage.width() / this.$mainImage.height() <= this.width / this.height ? {
                width: "100%",
                height: "auto"
            } : {
                width: "auto",
                height: "100%"
            }) : "contain" === this.settings.imageScaleMode ? this.$mainImage.css(this.$mainImage.width() / this.$mainImage.height() >= this.width / this.height ? {
                width: "100%",
                height: "auto"
            } : {
                width: "auto",
                height: "100%"
            }) : "exact" === this.settings.imageScaleMode && this.$mainImage.css({
                width: "100%",
                height: "100%"
            }), this.settings.centerImage === !0 && this.$mainImage.css({
                marginLeft: .5 * (this.$imageContainer.width() - this.$mainImage.width()),
                marginTop: .5 * (this.$imageContainer.height() - this.$mainImage.height())
            })))
        }, destroy: function () {
            this.$slide.removeAttr("style"), this.$slide.removeAttr("data-init"), this.$slide.removeAttr("data-index"), this.$slide.removeAttr("data-loaded"), this.hasMainImage === !0 && (this.$slide.find(".sp-image").removeAttr("style").appendTo(this.$slide), this.$slide.find(".sp-image-container").remove())
        }, getIndex: function () {
            return this.index
        }, setIndex: function (a) {
            this.index = a, this.$slide.attr("data-index", this.index)
        }, on: function (a, b) {
            return this.$slide.on(a, b)
        }, off: function (a) {
            return this.$slide.off(a)
        }, trigger: function (a) {
            return this.$slide.triggerHandler(a)
        }
    }, a.SliderPro = d, a.SliderProSlide = e, b.fn.sliderPro = function (a) {
        var c = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            if ("undefined" == typeof b(this).data("sliderPro")) {
                var e = new d(this, a);
                b(this).data("sliderPro", e)
            } else if ("undefined" != typeof a) {
                var f = b(this).data("sliderPro");
                if ("function" == typeof f[a])f[a].apply(f, c); else if ("undefined" != typeof f.settings[a]) {
                    var g = {};
                    g[a] = c[0], f._setProperties(g)
                } else"object" == typeof a ? f._setProperties(a) : b.error(a + " does not exist in sliderPro.")
            }
        })
    };
    var f = {
        supportedAnimation: null,
        vendorPrefix: null,
        transitionEvent: null,
        isIE: null,
        getSupportedAnimation: function () {
            if (null !== this.supportedAnimation)return this.supportedAnimation;
            var a = document.body || document.documentElement, b = a.style, c = "undefined" != typeof b.transition || "undefined" != typeof b.WebkitTransition || "undefined" != typeof b.MozTransition || "undefined" != typeof b.OTransition;
            if (c === !0) {
                var d = document.createElement("div");
                if (("undefined" != typeof d.style.WebkitPerspective || "undefined" != typeof d.style.perspective) && (this.supportedAnimation = "css-3d"), "css-3d" === this.supportedAnimation && "undefined" != typeof d.styleWebkitPerspective) {
                    var e = document.createElement("style");
                    e.textContent = "@media (transform-3d),(-webkit-transform-3d){#test-3d{left:9px;position:absolute;height:5px;margin:0;padding:0;border:0;}}", document.getElementsByTagName("head")[0].appendChild(e), d.id = "test-3d", document.body.appendChild(d), (9 !== d.offsetLeft || 5 !== d.offsetHeight) && (this.supportedAnimation = null), e.parentNode.removeChild(e), d.parentNode.removeChild(d)
                }
                null !== this.supportedAnimation || "undefined" == typeof d.style["-webkit-transform"] && "undefined" == typeof d.style.transform || (this.supportedAnimation = "css-2d")
            } else this.supportedAnimation = "javascript";
            return this.supportedAnimation
        },
        getVendorPrefix: function () {
            if (null !== this.vendorPrefix)return this.vendorPrefix;
            var a = document.createElement("div"), b = ["Webkit", "Moz", "ms", "O"];
            if ("transform" in a.style)return this.vendorPrefix = "", this.vendorPrefix;
            for (var c = 0; c < b.length; c++)if (b[c] + "Transform" in a.style) {
                this.vendorPrefix = "-" + b[c].toLowerCase() + "-";
                break
            }
            return this.vendorPrefix
        },
        getTransitionEvent: function () {
            if (null !== this.transitionEvent)return this.transitionEvent;
            var a = document.createElement("div"), b = {
                transition: "transitionend",
                WebkitTransition: "webkitTransitionEnd",
                MozTransition: "transitionend",
                OTransition: "oTransitionEnd"
            };
            for (var c in b)if (c in a.style) {
                this.transitionEvent = b[c];
                break
            }
            return this.transitionEvent
        },
        checkImagesComplete: function (a, b) {
            var c = this, d = this.checkImagesStatus(a);
            if ("loading" === d)var e = setInterval(function () {
                d = c.checkImagesStatus(a), "complete" === d && (clearInterval(e), "function" == typeof b && b())
            }, 100); else"function" == typeof b && b();
            return d
        },
        checkImagesStatus: function (a) {
            var c = "complete";
            return a.is("img") && a[0].complete === !1 ? c = "loading" : a.find("img").each(function () {
                var a = b(this)[0];
                a.complete === !1 && (c = "loading")
            }), c
        },
        checkIE: function () {
            if (null !== this.isIE)return this.isIE;
            {
                var b = a.navigator.userAgent;
                b.indexOf("MSIE")
            }
            return this.isIE = -1 !== b.indexOf("MSIE") || b.match(/Trident.*rv\:11\./) ? !0 : !1, this.isIE
        }
    };
    a.SliderProUtils = f
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "Thumbnails." + b.SliderPro.namespace, d = {
        $thumbnails: null,
        $thumbnailsContainer: null,
        thumbnails: null,
        selectedThumbnailIndex: 0,
        thumbnailsSize: 0,
        thumbnailsContainerSize: 0,
        thumbnailsPosition: 0,
        thumbnailsOrientation: null,
        thumbnailsPositionProperty: null,
        isThumbnailScroller: !1,
        initThumbnails: function () {
            var a = this;
            this.thumbnails = [], this.on("update." + c, b.proxy(this._thumbnailsOnUpdate, this)), this.on("sliderResize." + c, b.proxy(this._thumbnailsOnResize, this)), this.on("gotoSlide." + c, function (b) {
                a._gotoThumbnail(b.index)
            })
        },
        _thumbnailsOnUpdate: function () {
            var a = this;
            if (0 === this.$slider.find(".sp-thumbnail").length && 0 === this.thumbnails.length)return void(this.isThumbnailScroller = !1);
            if (this.isThumbnailScroller = !0, null === this.$thumbnailsContainer && (this.$thumbnailsContainer = b('<div class="sp-thumbnails-container"></div>').insertAfter(this.$slidesContainer)), null === this.$thumbnails)if (0 !== this.$slider.find(".sp-thumbnails").length) {
                if (this.$thumbnails = this.$slider.find(".sp-thumbnails").appendTo(this.$thumbnailsContainer), this.settings.shuffle === !0) {
                    var c = this.$thumbnails.find(".sp-thumbnail"), d = [];
                    b.each(this.shuffledIndexes, function (a, e) {
                        var f = b(c[e]);
                        0 !== f.parent("a").length && (f = f.parent("a")), d.push(f)
                    }), this.$thumbnails.empty().append(d)
                }
            } else this.$thumbnails = b('<div class="sp-thumbnails"></div>').appendTo(this.$thumbnailsContainer);
            this.$slides.find(".sp-thumbnail").each(function () {
                var c = b(this), d = c.parents(".sp-slide").index(), e = a.$thumbnails.find(".sp-thumbnail").length - 1;
                d > e ? c.appendTo(a.$thumbnails) : c.insertBefore(a.$thumbnails.find(".sp-thumbnail").eq(d))
            });
            for (var e = this.thumbnails.length - 1; e >= 0; e--)if (0 === this.$thumbnails.find('.sp-thumbnail[data-index="' + e + '"]').length) {
                var f = this.thumbnails[e];
                f.destroy(), this.thumbnails.splice(e, 1)
            }
            this.$thumbnails.find(".sp-thumbnail").each(function (c) {
                var d = b(this);
                "undefined" == typeof d.attr("data-init") ? a._createThumbnail(d, c) : a.thumbnails[c].setIndex(c)
            }), this.$thumbnailsContainer.removeClass("sp-top-thumbnails sp-bottom-thumbnails sp-left-thumbnails sp-right-thumbnails"), "top" === this.settings.thumbnailsPosition ? (this.$thumbnailsContainer.addClass("sp-top-thumbnails"), this.thumbnailsOrientation = "horizontal") : "bottom" === this.settings.thumbnailsPosition ? (this.$thumbnailsContainer.addClass("sp-bottom-thumbnails"), this.thumbnailsOrientation = "horizontal") : "left" === this.settings.thumbnailsPosition ? (this.$thumbnailsContainer.addClass("sp-left-thumbnails"), this.thumbnailsOrientation = "vertical") : "right" === this.settings.thumbnailsPosition && (this.$thumbnailsContainer.addClass("sp-right-thumbnails"), this.thumbnailsOrientation = "vertical"), this.settings.thumbnailPointer === !0 ? this.$thumbnailsContainer.addClass("sp-has-pointer") : this.$thumbnailsContainer.removeClass("sp-has-pointer"), this.selectedThumbnailIndex = this.selectedSlideIndex, this.$thumbnails.find(".sp-thumbnail-container").eq(this.selectedThumbnailIndex).addClass("sp-selected-thumbnail"), this.thumbnailsSize = 0, b.each(this.thumbnails, function (b, c) {
                c.setSize(a.settings.thumbnailWidth, a.settings.thumbnailHeight), a.thumbnailsSize += "horizontal" === a.thumbnailsOrientation ? c.getSize().width : c.getSize().height
            }), "horizontal" === this.thumbnailsOrientation ? (this.$thumbnails.css({
                width: this.thumbnailsSize,
                height: this.settings.thumbnailHeight
            }), this.$thumbnailsContainer.css("height", ""), this.thumbnailsPositionProperty = "left") : (this.$thumbnails.css({
                width: this.settings.thumbnailWidth,
                height: this.thumbnailsSize
            }), this.$thumbnailsContainer.css("width", ""), this.thumbnailsPositionProperty = "top"), this.trigger({type: "thumbnailsUpdate"}), b.isFunction(this.settings.thumbnailsUpdate) && this.settings.thumbnailsUpdate.call(this, {type: "thumbnailsUpdate"})
        },
        _createThumbnail: function (a, b) {
            var d = this, f = new e(a, this.$thumbnails, b);
            f.on("thumbnailClick." + c, function (a) {
                d.gotoSlide(a.index)
            }), this.thumbnails.splice(b, 0, f)
        },
        _thumbnailsOnResize: function () {
            if (this.isThumbnailScroller !== !1) {
                var c, d = this;
                "horizontal" === this.thumbnailsOrientation ? (this.thumbnailsContainerSize = Math.min(this.$slidesMask.width(), this.thumbnailsSize), this.$thumbnailsContainer.css("width", this.thumbnailsContainerSize), "fullWindow" === this.settings.forceSize && (this.$slidesMask.css("height", this.$slidesMask.height() - this.$thumbnailsContainer.outerHeight(!0)), this.slideHeight = this.$slidesMask.height(), b.each(this.slides, function (a, b) {
                    b.setSize(d.slideWidth, d.slideHeight)
                }))) : "vertical" === this.thumbnailsOrientation && (this.$slidesMask.width() + this.$thumbnailsContainer.outerWidth(!0) > this.$slider.parent().width() && ("fullWidth" === this.settings.forceSize || "fullWindow" === this.settings.forceSize ? this.$slider.css("max-width", b(a).width() - this.$thumbnailsContainer.outerWidth(!0)) : this.$slider.css("max-width", this.$slider.parent().width() - this.$thumbnailsContainer.outerWidth(!0)), this.$slidesMask.css("width", this.$slider.width()), "horizontal" === this.settings.orientation ? (this.visibleOffset = Math.round((this.$slider.width() - this.slideSize) / 2), this.visibleSlidesSize = this.$slidesMask.width()) : "vertical" === this.settings.orientation && (this.slideWidth = this.$slider.width(), b.each(this.slides, function (a, b) {
                    b.setSize(d.slideWidth, d.slideHeight)
                })), this._resetSlidesPosition()), this.thumbnailsContainerSize = Math.min(this.$slidesMask.height(), this.thumbnailsSize), this.$thumbnailsContainer.css("height", this.thumbnailsContainerSize)), c = this.thumbnailsSize <= this.thumbnailsContainerSize || 0 === this.$thumbnails.find(".sp-selected-thumbnail").length ? 0 : Math.max(-this.thumbnails[this.selectedThumbnailIndex].getPosition()[this.thumbnailsPositionProperty], this.thumbnailsContainerSize - this.thumbnailsSize), "top" === this.settings.thumbnailsPosition ? this.$slider.css({
                    paddingTop: this.$thumbnailsContainer.outerHeight(!0),
                    paddingLeft: "",
                    paddingRight: ""
                }) : "bottom" === this.settings.thumbnailsPosition ? this.$slider.css({
                    paddingTop: "",
                    paddingLeft: "",
                    paddingRight: ""
                }) : "left" === this.settings.thumbnailsPosition ? this.$slider.css({
                    paddingTop: "",
                    paddingLeft: this.$thumbnailsContainer.outerWidth(!0),
                    paddingRight: ""
                }) : "right" === this.settings.thumbnailsPosition && this.$slider.css({
                    paddingTop: "",
                    paddingLeft: "",
                    paddingRight: this.$thumbnailsContainer.outerWidth(!0)
                }), this._moveThumbnailsTo(c, !0)
            }
        },
        _gotoThumbnail: function (a) {
            if (this.isThumbnailScroller !== !1 && "undefined" != typeof this.thumbnails[a]) {
                var c = this.selectedThumbnailIndex, d = this.thumbnailsPosition;
                if (this.selectedThumbnailIndex = a, this.$thumbnails.find(".sp-selected-thumbnail").removeClass("sp-selected-thumbnail"), this.$thumbnails.find(".sp-thumbnail-container").eq(this.selectedThumbnailIndex).addClass("sp-selected-thumbnail"), this.selectedThumbnailIndex >= c) {
                    var e = this.selectedThumbnailIndex === this.thumbnails.length - 1 ? this.selectedThumbnailIndex : this.selectedThumbnailIndex + 1, f = this.thumbnails[e], g = "horizontal" === this.thumbnailsOrientation ? f.getPosition().right : f.getPosition().bottom, h = -this.thumbnailsPosition + this.thumbnailsContainerSize;
                    g > h && (d = this.thumbnailsPosition - (g - h))
                } else if (this.selectedThumbnailIndex < c) {
                    var i = 0 === this.selectedThumbnailIndex ? this.selectedThumbnailIndex : this.selectedThumbnailIndex - 1, j = this.thumbnails[i], k = "horizontal" === this.thumbnailsOrientation ? j.getPosition().left : j.getPosition().top;
                    k < -this.thumbnailsPosition && (d = -k)
                }
                this._moveThumbnailsTo(d), this.trigger({type: "gotoThumbnail"}), b.isFunction(this.settings.gotoThumbnail) && this.settings.gotoThumbnail.call(this, {type: "gotoThumbnail"})
            }
        },
        _moveThumbnailsTo: function (a, c, d) {
            var e = this, f = {};
            if (a !== this.thumbnailsPosition)if (this.thumbnailsPosition = a, "css-3d" === this.supportedAnimation || "css-2d" === this.supportedAnimation) {
                var g, h = "horizontal" === this.thumbnailsOrientation ? a : 0, i = "horizontal" === this.thumbnailsOrientation ? 0 : a;
                f[this.vendorPrefix + "transform"] = "css-3d" === this.supportedAnimation ? "translate3d(" + h + "px, " + i + "px, 0)" : "translate(" + h + "px, " + i + "px)", "undefined" != typeof c && c === !0 ? g = "" : (this.$thumbnails.addClass("sp-animated"), g = this.vendorPrefix + "transform 0.7s", this.$thumbnails.on(this.transitionEvent, function (a) {
                    a.target === a.currentTarget && (e.$thumbnails.off(e.transitionEvent), e.$thumbnails.removeClass("sp-animated"), "function" == typeof d && d(), e.trigger({type: "thumbnailsMoveComplete"}), b.isFunction(e.settings.thumbnailsMoveComplete) && e.settings.thumbnailsMoveComplete.call(e, {type: "thumbnailsMoveComplete"}))
                })), f[this.vendorPrefix + "transition"] = g, this.$thumbnails.css(f)
            } else f["margin-" + this.thumbnailsPositionProperty] = a, "undefined" != typeof c && c === !0 ? this.$thumbnails.css(f) : this.$thumbnails.addClass("sp-animated").animate(f, 700, function () {
                e.$thumbnails.removeClass("sp-animated"), "function" == typeof d && d(), e.trigger({type: "thumbnailsMoveComplete"}), b.isFunction(e.settings.thumbnailsMoveComplete) && e.settings.thumbnailsMoveComplete.call(e, {type: "thumbnailsMoveComplete"})
            })
        },
        _stopThumbnailsMovement: function () {
            var a = {};
            if ("css-3d" === this.supportedAnimation || "css-2d" === this.supportedAnimation) {
                var b = this.$thumbnails.css(this.vendorPrefix + "transform"), c = -1 !== b.indexOf("matrix3d") ? "matrix3d" : "matrix", d = b.replace(c, "").match(/-?[0-9\.]+/g), e = "matrix3d" === c ? parseInt(d[12], 10) : parseInt(d[4], 10), f = "matrix3d" === c ? parseInt(d[13], 10) : parseInt(d[5], 10);
                a[this.vendorPrefix + "transform"] = "css-3d" === this.supportedAnimation ? "translate3d(" + e + "px, " + f + "px, 0)" : "translate(" + e + "px, " + f + "px)", a[this.vendorPrefix + "transition"] = "", this.$thumbnails.css(a), this.$thumbnails.off(this.transitionEvent), this.thumbnailsPosition = "horizontal" === this.thumbnailsOrientation ? parseInt(d[4], 10) : parseInt(d[5], 10)
            } else this.$thumbnails.stop(), this.thumbnailsPosition = parseInt(this.$thumbnails.css("margin-" + this.thumbnailsPositionProperty), 10);
            this.$thumbnails.removeClass("sp-animated")
        },
        destroyThumbnails: function () {
            var d = this;
            this.off("update." + c), this.isThumbnailScroller !== !1 && (this.off("sliderResize." + c), this.off("gotoSlide." + c), b(a).off("resize." + this.uniqueId + "." + c), this.$thumbnails.find(".sp-thumbnail").each(function () {
                var a = b(this), e = parseInt(a.attr("data-index"), 10), f = d.thumbnails[e];
                f.off("thumbnailClick." + c), f.destroy()
            }), this.thumbnails.length = 0, this.$thumbnails.appendTo(this.$slider), this.$thumbnailsContainer.remove(), this.$slider.css({
                paddingTop: "",
                paddingLeft: "",
                paddingRight: ""
            }))
        },
        thumbnailsDefaults: {
            thumbnailWidth: 100,
            thumbnailHeight: 80,
            thumbnailsPosition: "bottom",
            thumbnailPointer: !1,
            thumbnailsUpdate: function () {
            },
            gotoThumbnail: function () {
            },
            thumbnailsMoveComplete: function () {
            }
        }
    }, e = function (a, b, c) {
        this.$thumbnail = a, this.$thumbnails = b, this.$thumbnailContainer = null, this.width = 0, this.height = 0, this.isImageLoaded = !1, this.setIndex(c), this._init()
    };
    e.prototype = {
        _init: function () {
            var a = this;
            this.$thumbnail.attr("data-init", !0), this.$thumbnailContainer = b('<div class="sp-thumbnail-container"></div>').appendTo(this.$thumbnails), 0 !== this.$thumbnail.parent("a").length ? this.$thumbnail.parent("a").appendTo(this.$thumbnailContainer) : this.$thumbnail.appendTo(this.$thumbnailContainer), this.$thumbnailContainer.on("click." + c, function () {
                a.trigger({type: "thumbnailClick." + c, index: a.index})
            })
        }, setSize: function (a, b) {
            this.width = a, this.height = b, this.$thumbnailContainer.css({
                width: this.width,
                height: this.height
            }), this.$thumbnail.is("img") && "undefined" == typeof this.$thumbnail.attr("data-src") && this.resizeImage()
        }, getSize: function () {
            return {width: this.$thumbnailContainer.outerWidth(!0), height: this.$thumbnailContainer.outerHeight(!0)}
        }, getPosition: function () {
            return {
                left: this.$thumbnailContainer.position().left + parseInt(this.$thumbnailContainer.css("marginLeft"), 10),
                right: this.$thumbnailContainer.position().left + parseInt(this.$thumbnailContainer.css("marginLeft"), 10) + this.$thumbnailContainer.outerWidth(),
                top: this.$thumbnailContainer.position().top + parseInt(this.$thumbnailContainer.css("marginTop"), 10),
                bottom: this.$thumbnailContainer.position().top + parseInt(this.$thumbnailContainer.css("marginTop"), 10) + this.$thumbnailContainer.outerHeight()
            }
        }, setIndex: function (a) {
            this.index = a, this.$thumbnail.attr("data-index", this.index)
        }, resizeImage: function () {
            var a = this;
            if (this.isImageLoaded === !1)return void SliderProUtils.checkImagesComplete(this.$thumbnailContainer, function () {
                a.isImageLoaded = !0, a.resizeImage()
            });
            this.$thumbnail = this.$thumbnailContainer.find(".sp-thumbnail");
            var b = this.$thumbnail.width(), c = this.$thumbnail.height();
            this.$thumbnail.css(b / c <= this.width / this.height ? {width: "100%", height: "auto"} : {
                width: "auto",
                height: "100%"
            }), this.$thumbnail.css({
                marginLeft: .5 * (this.$thumbnailContainer.width() - this.$thumbnail.width()),
                marginTop: .5 * (this.$thumbnailContainer.height() - this.$thumbnail.height())
            })
        }, destroy: function () {
            this.$thumbnailContainer.off("click." + c), this.$thumbnail.removeAttr("data-init"), this.$thumbnail.removeAttr("data-index"), 0 !== this.$thumbnail.parent("a").length ? this.$thumbnail.parent("a").insertBefore(this.$thumbnailContainer) : this.$thumbnail.insertBefore(this.$thumbnailContainer), this.$thumbnailContainer.remove()
        }, on: function (a, b) {
            return this.$thumbnailContainer.on(a, b)
        }, off: function (a) {
            return this.$thumbnailContainer.off(a)
        }, trigger: function (a) {
            return this.$thumbnailContainer.triggerHandler(a)
        }
    }, b.SliderPro.addModule("Thumbnails", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "ConditionalImages." + b.SliderPro.namespace, d = {
        previousImageSize: null,
        currentImageSize: null,
        isRetinaScreen: !1,
        initConditionalImages: function () {
            this.currentImageSize = this.previousImageSize = "default", this.isRetinaScreen = "undefined" != typeof this._isRetina && this._isRetina() === !0, this.on("update." + c, b.proxy(this._conditionalImagesOnUpdate, this)), this.on("sliderResize." + c, b.proxy(this._conditionalImagesOnResize, this))
        },
        _conditionalImagesOnUpdate: function () {
            b.each(this.slides, function (a, c) {
                var d = c.$slide;
                d.find("img:not([ data-default ])").each(function () {
                    var a = b(this);
                    "undefined" != typeof a.attr("data-src") ? a.attr("data-default", a.attr("data-src")) : a.attr("data-default", a.attr("src"))
                })
            })
        },
        _conditionalImagesOnResize: function () {
            if (this.currentImageSize = this.slideWidth <= this.settings.smallSize ? "small" : this.slideWidth <= this.settings.mediumSize ? "medium" : this.slideWidth <= this.settings.largeSize ? "large" : "default", this.previousImageSize !== this.currentImageSize) {
                var a = this;
                b.each(this.slides, function (c, d) {
                    var e = d.$slide;
                    e.find("img").each(function () {
                        var c = b(this), e = "";
                        a.isRetinaScreen === !0 && "undefined" != typeof c.attr("data-retina" + a.currentImageSize) ? (e = c.attr("data-retina" + a.currentImageSize), "undefined" != typeof c.attr("data-retina") && c.attr("data-retina") !== e && c.attr("data-retina", e)) : (a.isRetinaScreen === !1 || a.isRetinaScreen === !0 && "undefined" == typeof c.attr("data-retina")) && "undefined" != typeof c.attr("data-" + a.currentImageSize) && (e = c.attr("data-" + a.currentImageSize), "undefined" != typeof c.attr("data-src") && c.attr("data-src") !== e && c.attr("data-src", e)), "" !== e && "undefined" == typeof c.attr("data-src") && c.attr("src") !== e && a._loadConditionalImage(c, e, function (a) {
                            a.hasClass("sp-image") && (d.$mainImage = a, d.resizeMainImage(!0))
                        })
                    })
                }), this.previousImageSize = this.currentImageSize
            }
        },
        _loadConditionalImage: function (a, c, d) {
            var e = b(new Image);
            e.attr("class", a.attr("class")), e.attr("style", a.attr("style")), b.each(a.data(), function (a, b) {
                e.attr("data-" + a, b)
            }), "undefined" != typeof a.attr("width") && e.attr("width", a.attr("width")), "undefined" != typeof a.attr("height") && e.attr("height", a.attr("height")), "undefined" != typeof a.attr("alt") && e.attr("alt", a.attr("alt")), "undefined" != typeof a.attr("title") && e.attr("title", a.attr("title")), e.attr("src", c), e.insertAfter(a), a.remove(), a = null, "function" == typeof d && d(e)
        },
        destroyConditionalImages: function () {
            this.off("update." + c), this.off("sliderResize." + c)
        },
        conditionalImagesDefaults: {smallSize: 480, mediumSize: 768, largeSize: 1024}
    };
    b.SliderPro.addModule("ConditionalImages", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "Retina." + b.SliderPro.namespace, d = {
        initRetina: function () {
            this._isRetina() !== !1 && (this.on("update." + c, b.proxy(this._checkRetinaImages, this)), 0 !== this.$slider.find(".sp-thumbnail").length && this.on("update.Thumbnails." + c, b.proxy(this._checkRetinaThumbnailImages, this)))
        }, _isRetina: function () {
            return a.devicePixelRatio >= 2 ? !0 : a.matchMedia && a.matchMedia("(-webkit-min-device-pixel-ratio: 2),(min-resolution: 2dppx)").matches ? !0 : !1
        }, _checkRetinaImages: function () {
            var a = this;
            b.each(this.slides, function (c, d) {
                var e = d.$slide;
                "undefined" == typeof e.attr("data-retina-loaded") && (e.attr("data-retina-loaded", !0), e.find("img[data-retina]").each(function () {
                    var c = b(this);
                    "undefined" != typeof c.attr("data-src") ? c.attr("data-src", c.attr("data-retina")) : a._loadRetinaImage(c, function (a) {
                        a.hasClass("sp-image") && (d.$mainImage = a, d.resizeMainImage(!0))
                    })
                }))
            })
        }, _checkRetinaThumbnailImages: function () {
            var a = this;
            b.each(this.thumbnails, function (c, d) {
                var e = d.$thumbnailContainer;
                "undefined" == typeof e.attr("data-retina-loaded") && (e.attr("data-retina-loaded", !0), e.find("img[data-retina]").each(function () {
                    var c = b(this);
                    "undefined" != typeof c.attr("data-src") ? c.attr("data-src", c.attr("data-retina")) : a._loadRetinaImage(c, function (a) {
                        a.hasClass("sp-thumbnail") && d.resizeImage()
                    })
                }))
            })
        }, _loadRetinaImage: function (a, c) {
            var d = !1, e = "";
            if ("undefined" != typeof a.attr("data-retina") && (d = !0, e = a.attr("data-retina")), "undefined" != typeof a.attr("data-src") && (d === !1 && (e = a.attr("data-src")), a.removeAttr("data-src")), "" !== e) {
                var f = b(new Image);
                f.attr("class", a.attr("class")), f.attr("style", a.attr("style")), b.each(a.data(), function (a, b) {
                    f.attr("data-" + a, b)
                }), "undefined" != typeof a.attr("width") && f.attr("width", a.attr("width")), "undefined" != typeof a.attr("height") && f.attr("height", a.attr("height")), "undefined" != typeof a.attr("alt") && f.attr("alt", a.attr("alt")), "undefined" != typeof a.attr("title") && f.attr("title", a.attr("title")), f.insertAfter(a), a.remove(), a = null, f.attr("src", e), "function" == typeof c && c(f)
            }
        }, destroyRetina: function () {
            this.off("update." + c), this.off("update.Thumbnails." + c)
        }
    };
    b.SliderPro.addModule("Retina", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "LazyLoading." + b.SliderPro.namespace, d = {
        allowLazyLoadingCheck: !0, initLazyLoading: function () {
            this.on("sliderResize." + c, b.proxy(this._lazyLoadingOnResize, this)), this.on("gotoSlide." + c, b.proxy(this._checkAndLoadVisibleImages, this)), this.on("thumbnailsUpdate." + c + " thumbnailsMoveComplete." + c, b.proxy(this._checkAndLoadVisibleThumbnailImages, this))
        }, _lazyLoadingOnResize: function () {
            var a = this;
            this.allowLazyLoadingCheck !== !1 && (this.allowLazyLoadingCheck = !1, this._checkAndLoadVisibleImages(), 0 !== this.$slider.find(".sp-thumbnail").length && this._checkAndLoadVisibleThumbnailImages(), setTimeout(function () {
                a.allowLazyLoadingCheck = !0
            }, 500))
        }, _checkAndLoadVisibleImages: function () {
            if (0 !== this.$slider.find(".sp-slide:not([ data-loaded ])").length) {
                var a = this, c = this.settings.loop === !0 ? this.middleSlidePosition : this.selectedSlideIndex, d = Math.ceil((this.visibleSlidesSize - this.slideSize) / 2 / this.slideSize), e = c - d - 1 > 0 ? c - d - 1 : 0, f = c + d + 1 < this.getTotalSlides() - 1 ? c + d + 1 : this.getTotalSlides() - 1, g = this.slidesOrder.slice(e, f + 1);
                b.each(g, function (c, d) {
                    var e = a.slides[d], f = e.$slide;
                    "undefined" == typeof f.attr("data-loaded") && (f.attr("data-loaded", !0), f.find("img[ data-src ]").each(function () {
                        var c = b(this);
                        a._loadImage(c, function (a) {
                            a.hasClass("sp-image") && (e.$mainImage = a, e.resizeMainImage(!0))
                        })
                    }))
                })
            }
        }, _checkAndLoadVisibleThumbnailImages: function () {
            if (0 !== this.$slider.find(".sp-thumbnail-container:not([ data-loaded ])").length) {
                var a = this, c = this.thumbnailsSize / this.thumbnails.length, d = Math.floor(Math.abs(this.thumbnailsPosition / c)), e = Math.floor((-this.thumbnailsPosition + this.thumbnailsContainerSize) / c), f = this.thumbnails.slice(d, e + 1);
                b.each(f, function (c, d) {
                    var e = d.$thumbnailContainer;
                    "undefined" == typeof e.attr("data-loaded") && (e.attr("data-loaded", !0), e.find("img[ data-src ]").each(function () {
                        var c = b(this);
                        a._loadImage(c, function () {
                            d.resizeImage()
                        })
                    }))
                })
            }
        }, _loadImage: function (a, c) {
            var d = b(new Image);
            d.attr("class", a.attr("class")), d.attr("style", a.attr("style")), b.each(a.data(), function (a, b) {
                d.attr("data-" + a, b)
            }), "undefined" != typeof a.attr("width") && d.attr("width", a.attr("width")), "undefined" != typeof a.attr("height") && d.attr("height", a.attr("height")), "undefined" != typeof a.attr("alt") && d.attr("alt", a.attr("alt")), "undefined" != typeof a.attr("title") && d.attr("title", a.attr("title")), d.attr("src", a.attr("data-src")), d.removeAttr("data-src"), d.insertAfter(a), a.remove(), a = null, "function" == typeof c && c(d)
        }, destroyLazyLoading: function () {
            this.off("update." + c), this.off("gotoSlide." + c), this.off("sliderResize." + c), this.off("thumbnailsUpdate." + c), this.off("thumbnailsMoveComplete." + c)
        }
    };
    b.SliderPro.addModule("LazyLoading", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "Layers." + b.SliderPro.namespace, d = {
        layersGotoSlideReference: null,
        waitForLayersTimer: null,
        initLayers: function () {
            this.on("update." + c, b.proxy(this._layersOnUpdate, this)), this.on("sliderResize." + c, b.proxy(this._layersOnResize, this)), this.on("gotoSlide." + c, b.proxy(this._layersOnGotoSlide, this))
        },
        _layersOnUpdate: function () {
            var a = this;
            b.each(this.slides, function (a, c) {
                c.$slide;
                this.$slide.find(".sp-layer:not([ data-init ])").each(function () {
                    var a = new f(b(this));
                    "undefined" == typeof c.layers && (c.layers = []), c.layers.push(a), b(this).hasClass("sp-static") === !1 && ("undefined" == typeof c.animatedLayers && (c.animatedLayers = []), c.animatedLayers.push(a))
                })
            }), this.settings.waitForLayers === !0 && (clearTimeout(this.waitForLayersTimer), this.waitForLayersTimer = setTimeout(function () {
                a.layersGotoSlideReference = a.gotoSlide, a.gotoSlide = a._layersGotoSlide
            }, 1))
        },
        _layersOnResize: function () {
            var a, c, d = this, e = this.settings.autoScaleLayers;
            return this.settings.autoScaleLayers === !1 ? void this.showLayers(this.selectedSlideIndex) : (-1 === this.settings.autoScaleReference ? "string" == typeof this.settings.width && -1 !== this.settings.width.indexOf("%") ? e = !1 : a = parseInt(this.settings.width, 10) : a = this.settings.autoScaleReference, c = e === !0 && this.slideWidth < a ? d.slideWidth / a : 1, b.each(this.slides, function (a, d) {
                "undefined" != typeof d.layers && b.each(d.layers, function (a, b) {
                    b.scale(c)
                })
            }), void this.showLayers(this.selectedSlideIndex))
        },
        _layersGotoSlide: function (a) {
            var b = this, d = this.slides[this.selectedSlideIndex].animatedLayers;
            this.$slider.hasClass("sp-swiping") || "undefined" == typeof d || 0 === d.length ? this.layersGotoSlideReference(a) : (this.on("hideLayersComplete." + c, function () {
                b.off("hideLayersComplete." + c), b.layersGotoSlideReference(a)
            }), this.hideLayers(this.selectedSlideIndex))
        },
        _layersOnGotoSlide: function () {
            this.previousSlideIndex !== this.selectedSlideIndex && this.hideLayers(this.previousSlideIndex), this.showLayers(this.selectedSlideIndex)
        },
        showLayers: function (a) {
            var c = this, d = this.slides[a].animatedLayers, e = 0;
            "undefined" != typeof d && b.each(d, function (a, f) {
                f.isVisible() === !0 ? (e++, e === d.length && (c.trigger({
                    type: "showLayersComplete",
                    index: a
                }), b.isFunction(c.settings.showLayersComplete) && c.settings.showLayersComplete.call(c, {
                    type: "showLayersComplete",
                    index: a
                }))) : f.show(function () {
                    e++, e === d.length && (c.trigger({
                        type: "showLayersComplete",
                        index: a
                    }), b.isFunction(c.settings.showLayersComplete) && c.settings.showLayersComplete.call(c, {
                        type: "showLayersComplete",
                        index: a
                    }))
                })
            })
        },
        hideLayers: function (a) {
            var c = this, d = this.slides[a].animatedLayers, e = 0;
            "undefined" != typeof d && b.each(d, function (a, f) {
                f.isVisible() === !1 ? (e++, e === d.length && (c.trigger({
                    type: "hideLayersComplete",
                    index: a
                }), b.isFunction(c.settings.hideLayersComplete) && c.settings.hideLayersComplete.call(c, {
                    type: "hideLayersComplete",
                    index: a
                }))) : f.hide(function () {
                    e++, e === d.length && (c.trigger({
                        type: "hideLayersComplete",
                        index: a
                    }), b.isFunction(c.settings.hideLayersComplete) && c.settings.hideLayersComplete.call(c, {
                        type: "hideLayersComplete",
                        index: a
                    }))
                })
            })
        },
        destroyLayers: function () {
            this.off("update." + c), this.off("resize." + c), this.off("gotoSlide." + c), this.off("hideLayersComplete." + c)
        },
        layersDefaults: {
            waitForLayers: !1,
            autoScaleLayers: !0,
            autoScaleReference: -1,
            showLayersComplete: function () {
            },
            hideLayersComplete: function () {
            }
        }
    }, e = a.SliderProSlide.prototype.destroy;
    a.SliderProSlide.prototype.destroy = function () {
        "undefined" != typeof this.layers && (b.each(this.layers, function (a, b) {
            b.destroy()
        }), this.layers.length = 0), "undefined" != typeof this.animatedLayers && (this.animatedLayers.length = 0), e.apply(this)
    };
    var f = function (a) {
        this.$layer = a, this.visible = !1, this.styled = !1, this.data = null, this.position = null, this.horizontalProperty = null, this.verticalProperty = null, this.horizontalPosition = null, this.verticalPosition = null, this.scaleRatio = 1, this.supportedAnimation = SliderProUtils.getSupportedAnimation(), this.vendorPrefix = SliderProUtils.getVendorPrefix(), this.transitionEvent = SliderProUtils.getTransitionEvent(), this.stayTimer = null, this._init()
    };
    f.prototype = {
        _init: function () {
            this.$layer.attr("data-init", !0), this.$layer.hasClass("sp-static") ? this._setStyle() : this.$layer.css({
                visibility: "hidden",
                display: "none"
            })
        }, _setStyle: function () {
            this.styled = !0, this.$layer.css("display", ""), this.data = this.$layer.data(), "undefined" != typeof this.data.width && this.$layer.css("width", this.data.width), "undefined" != typeof this.data.height && this.$layer.css("height", this.data.height), "undefined" != typeof this.data.depth && this.$layer.css("z-index", this.data.depth), this.position = this.data.position ? this.data.position.toLowerCase() : "topleft", this.horizontalProperty = -1 !== this.position.indexOf("right") ? "right" : -1 !== this.position.indexOf("left") ? "left" : "center", this.verticalProperty = -1 !== this.position.indexOf("bottom") ? "bottom" : -1 !== this.position.indexOf("top") ? "top" : "center", this._setPosition(), this.scale(this.scaleRatio)
        }, _setPosition: function () {
            var a = this.$layer.attr("style");
            this.horizontalPosition = "undefined" != typeof this.data.horizontal ? this.data.horizontal : 0, this.verticalPosition = "undefined" != typeof this.data.vertical ? this.data.vertical : 0, "center" === this.horizontalProperty ? (("undefined" == typeof a || "undefined" != typeof a && -1 === a.indexOf("width")) && (this.$layer.css("white-space", "nowrap"), this.$layer.css("width", this.$layer.outerWidth(!0))), this.$layer.css({
                marginLeft: "auto",
                marginRight: "auto",
                left: this.horizontalPosition,
                right: 0
            })) : this.$layer.css(this.horizontalProperty, this.horizontalPosition), "center" === this.verticalProperty ? (("undefined" == typeof a || "undefined" != typeof a && -1 === a.indexOf("height")) && (this.$layer.css("white-space", "nowrap"), this.$layer.css("height", this.$layer.outerHeight(!0))), this.$layer.css({
                marginTop: "auto",
                marginBottom: "auto",
                top: this.verticalPosition,
                bottom: 0
            })) : this.$layer.css(this.verticalProperty, this.verticalPosition)
        }, scale: function (a) {
            if (!this.$layer.hasClass("sp-no-scale") && (this.scaleRatio = a, this.styled !== !1)) {
                var b = "center" === this.horizontalProperty ? "left" : this.horizontalProperty, c = "center" === this.verticalProperty ? "top" : this.verticalProperty, d = {};
                d[this.vendorPrefix + "transform-origin"] = this.horizontalProperty + " " + this.verticalProperty, d[this.vendorPrefix + "transform"] = "scale(" + this.scaleRatio + ")", "string" != typeof this.horizontalPosition && (d[b] = this.horizontalPosition * this.scaleRatio), "string" != typeof this.verticalPosition && (d[c] = this.verticalPosition * this.scaleRatio), "string" == typeof this.data.width && -1 !== this.data.width.indexOf("%") && (d.width = (parseInt(this.data.width, 10) / this.scaleRatio).toString() + "%"), "string" == typeof this.data.height && -1 !== this.data.height.indexOf("%") && (d.height = (parseInt(this.data.height, 10) / this.scaleRatio).toString() + "%"), this.$layer.css(d)
            }
        }, show: function (a) {
            if (this.visible !== !0) {
                this.visible = !0, this.styled === !1 && this._setStyle();
                var b = this, c = "undefined" != typeof this.data.showOffset ? this.data.showOffset : 50, d = "undefined" != typeof this.data.showDuration ? this.data.showDuration / 1e3 : .4, e = "undefined" != typeof this.data.showDelay ? this.data.showDelay : 10, f = "undefined" != typeof b.data.stayDuration ? parseInt(b.data.stayDuration, 10) : -1;
                if ("javascript" === this.supportedAnimation)this.$layer.stop().delay(e).css({
                    opacity: 0,
                    visibility: "visible"
                }).animate({opacity: 1}, 1e3 * d, function () {
                    -1 !== f && (b.stayTimer = setTimeout(function () {
                        b.hide(), b.stayTimer = null
                    }, f)), "undefined" != typeof a && a()
                }); else {
                    var g = {opacity: 0, visibility: "visible"}, h = {opacity: 1}, i = "";
                    g[this.vendorPrefix + "transform"] = "scale(" + this.scaleRatio + ")", h[this.vendorPrefix + "transform"] = "scale(" + this.scaleRatio + ")", h[this.vendorPrefix + "transition"] = "opacity " + d + "s", "undefined" != typeof this.data.showTransition && ("left" === this.data.showTransition ? i = c + "px, 0" : "right" === this.data.showTransition ? i = "-" + c + "px, 0" : "up" === this.data.showTransition ? i = "0, " + c + "px" : "down" === this.data.showTransition && (i = "0, -" + c + "px"), g[this.vendorPrefix + "transform"] += "css-3d" === this.supportedAnimation ? " translate3d(" + i + ", 0)" : " translate(" + i + ")", h[this.vendorPrefix + "transform"] += "css-3d" === this.supportedAnimation ? " translate3d(0, 0, 0)" : " translate(0, 0)", h[this.vendorPrefix + "transition"] += ", " + this.vendorPrefix + "transform " + d + "s"), this.$layer.on(this.transitionEvent, function (c) {
                        c.target === c.currentTarget && (b.$layer.off(b.transitionEvent).css(b.vendorPrefix + "transition", ""), -1 !== f && (b.stayTimer = setTimeout(function () {
                            b.hide(), b.stayTimer = null
                        }, f)), "undefined" != typeof a && a())
                    }), this.$layer.css(g), setTimeout(function () {
                        b.$layer.css(h)
                    }, e)
                }
            }
        }, hide: function (a) {
            if (this.visible !== !1) {
                var c = this, d = "undefined" != typeof this.data.hideOffset ? this.data.hideOffset : 50, e = "undefined" != typeof this.data.hideDuration ? this.data.hideDuration / 1e3 : .4, f = "undefined" != typeof this.data.hideDelay ? this.data.hideDelay : 10;
                if (this.visible = !1, null !== this.stayTimer && clearTimeout(this.stayTimer), "javascript" === this.supportedAnimation)this.$layer.stop().delay(f).animate({opacity: 0}, 1e3 * e, function () {
                    b(this).css("visibility", "hidden"), "undefined" != typeof a && a()
                }); else {
                    var g = "", h = {opacity: 0};
                    h[this.vendorPrefix + "transform"] = "scale(" + this.scaleRatio + ")", h[this.vendorPrefix + "transition"] = "opacity " + e + "s", "undefined" != typeof this.data.hideTransition && ("left" === this.data.hideTransition ? g = "-" + d + "px, 0" : "right" === this.data.hideTransition ? g = d + "px, 0" : "up" === this.data.hideTransition ? g = "0, -" + d + "px" : "down" === this.data.hideTransition && (g = "0, " + d + "px"), h[this.vendorPrefix + "transform"] += "css-3d" === this.supportedAnimation ? " translate3d(" + g + ", 0)" : " translate(" + g + ")", h[this.vendorPrefix + "transition"] += ", " + this.vendorPrefix + "transform " + e + "s"), this.$layer.on(this.transitionEvent, function (b) {
                        b.target === b.currentTarget && (c.$layer.off(c.transitionEvent).css(c.vendorPrefix + "transition", ""), c.visible === !1 && c.$layer.css("visibility", "hidden"), "undefined" != typeof a && a())
                    }), setTimeout(function () {
                        c.$layer.css(h)
                    }, f)
                }
            }
        }, isVisible: function () {
            return this.visible === !1 || this.$layer.is(":hidden") ? !1 : !0
        }, destroy: function () {
            this.$layer.removeAttr("style"), this.$layer.removeAttr("data-init")
        }
    }, b.SliderPro.addModule("Layers", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "Fade." + b.SliderPro.namespace, d = {
        fadeGotoSlideReference: null, initFade: function () {
            this.on("update." + c, b.proxy(this._fadeOnUpdate, this))
        }, _fadeOnUpdate: function () {
            this.settings.fade === !0 && (this.fadeGotoSlideReference = this.gotoSlide, this.gotoSlide = this._fadeGotoSlide)
        }, _fadeGotoSlide: function (a) {
            if (a !== this.selectedSlideIndex)if (this.$slider.hasClass("sp-swiping"))this.fadeGotoSlideReference(a); else {
                var c, d, e = this, f = a;
                b.each(this.slides, function (a, b) {
                    var g = b.getIndex(), h = b.$slide;
                    g === f ? (h.css({
                        opacity: 0,
                        left: 0,
                        top: 0,
                        "z-index": 20
                    }), c = h) : g === e.selectedSlideIndex ? (h.css({
                        opacity: 1,
                        left: 0,
                        top: 0,
                        "z-index": 10
                    }), d = h) : h.css("visibility", "hidden")
                }), this.previousSlideIndex = this.selectedSlideIndex, this.selectedSlideIndex = a, e.settings.loop === !0 && e._updateSlidesOrder(), this._moveTo(this.visibleOffset, !0), this.settings.fadeOutPreviousSlide === !0 && this._fadeSlideTo(d, 0), this._fadeSlideTo(c, 1, function () {
                    b.each(e.slides, function (a, b) {
                        var c = b.$slide;
                        c.css({visibility: "", opacity: "", "z-index": ""})
                    }), e._resetSlidesPosition(), e.trigger({
                        type: "gotoSlideComplete",
                        index: a,
                        previousIndex: e.previousSlideIndex
                    }), b.isFunction(e.settings.gotoSlideComplete) && e.settings.gotoSlideComplete.call(e, {
                        type: "gotoSlideComplete",
                        index: a,
                        previousIndex: e.previousSlideIndex
                    })
                }), this.settings.autoHeight === !0 && this._resizeHeight(), this.trigger({
                    type: "gotoSlide",
                    index: a,
                    previousIndex: this.previousSlideIndex
                }), b.isFunction(this.settings.gotoSlide) && this.settings.gotoSlide.call(this, {
                    type: "gotoSlide",
                    index: a,
                    previousIndex: this.previousSlideIndex
                })
            }
        }, _fadeSlideTo: function (a, b, c) {
            var d = this;
            "css-3d" === this.supportedAnimation || "css-2d" === this.supportedAnimation ? (setTimeout(function () {
                var c = {opacity: b};
                c[d.vendorPrefix + "transition"] = "opacity " + d.settings.fadeDuration / 1e3 + "s", a.css(c)
            }, 1), a.on(this.transitionEvent, function (b) {
                b.target === b.currentTarget && (a.off(d.transitionEvent), a.css(d.vendorPrefix + "transition", ""), "function" == typeof c && c())
            })) : a.stop().animate({opacity: b}, this.settings.fadeDuration, function () {
                "function" == typeof c && c()
            })
        }, destroyFade: function () {
            this.off("update." + c), null !== this.fadeGotoSlideReference && (this.gotoSlide = this.fadeGotoSlideReference)
        }, fadeDefaults: {fade: !1, fadeOutPreviousSlide: !0, fadeDuration: 500}
    };
    b.SliderPro.addModule("Fade", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "TouchSwipe." + b.SliderPro.namespace, d = {
        isTouchSupport: !1,
        touchStartPoint: {x: 0, y: 0},
        touchEndPoint: {x: 0, y: 0},
        touchDistance: {x: 0, y: 0},
        touchStartPosition: 0,
        isTouchMoving: !1,
        touchSwipeEvents: {startEvent: "", moveEvent: "", endEvent: ""},
        initTouchSwipe: function () {
            this.settings.touchSwipe !== !1 && (this.isTouchSupport = "ontouchstart" in a, this.isTouchSupport === !0 ? (this.touchSwipeEvents.startEvent = "touchstart", this.touchSwipeEvents.moveEvent = "touchmove", this.touchSwipeEvents.endEvent = "touchend") : (this.touchSwipeEvents.startEvent = "mousedown", this.touchSwipeEvents.moveEvent = "mousemove", this.touchSwipeEvents.endEvent = "mouseup"), this.$slidesMask.on(this.touchSwipeEvents.startEvent + "." + c, b.proxy(this._onTouchStart, this)), this.$slidesMask.on("dragstart." + c, function (a) {
                a.preventDefault()
            }), this.$slidesMask.addClass("sp-grab"))
        },
        _onTouchStart: function (a) {
            if (!(b(a.target).closest(".sp-selectable").length >= 1)) {
                var d = this.isTouchSupport ? a.originalEvent.touches[0] : a.originalEvent;
                this.isTouchSupport === !1 && a.preventDefault(), b(a.target).parents(".sp-slide").find("a").one("click." + c, function (a) {
                    a.preventDefault()
                }), this.touchStartPoint.x = d.pageX || d.clientX, this.touchStartPoint.y = d.pageY || d.clientY, this.touchStartPosition = this.slidesPosition, this.touchDistance.x = this.touchDistance.y = 0, this.$slides.hasClass("sp-animated") && (this.isTouchMoving = !0, this._stopMovement(), this.touchStartPosition = this.slidesPosition), this.$slidesMask.on(this.touchSwipeEvents.moveEvent + "." + c, b.proxy(this._onTouchMove, this)), b(document).on(this.touchSwipeEvents.endEvent + "." + this.uniqueId + "." + c, b.proxy(this._onTouchEnd, this)), this.$slidesMask.removeClass("sp-grab").addClass("sp-grabbing"), this.$slider.addClass("sp-swiping")
            }
        },
        _onTouchMove: function (a) {
            var b = this.isTouchSupport ? a.originalEvent.touches[0] : a.originalEvent;
            this.isTouchMoving = !0, this.touchEndPoint.x = b.pageX || b.clientX, this.touchEndPoint.y = b.pageY || b.clientY, this.touchDistance.x = this.touchEndPoint.x - this.touchStartPoint.x, this.touchDistance.y = this.touchEndPoint.y - this.touchStartPoint.y;
            var c = "horizontal" === this.settings.orientation ? this.touchDistance.x : this.touchDistance.y, d = "horizontal" === this.settings.orientation ? this.touchDistance.y : this.touchDistance.x;
            Math.abs(c) > Math.abs(d) && (a.preventDefault(), this.settings.loop === !1 && (this.slidesPosition > this.touchStartPosition && 0 === this.selectedSlideIndex || this.slidesPosition < this.touchStartPosition && this.selectedSlideIndex === this.getTotalSlides() - 1) && (c = .2 * c), this._moveTo(this.touchStartPosition + c, !0))
        },
        _onTouchEnd: function (a) {
            var d = this, e = "horizontal" === this.settings.orientation ? this.touchDistance.x : this.touchDistance.y;
            if (this.$slidesMask.off(this.touchSwipeEvents.moveEvent + "." + c), b(document).off(this.touchSwipeEvents.endEvent + "." + this.uniqueId + "." + c), this.$slidesMask.removeClass("sp-grabbing").addClass("sp-grab"), (this.isTouchMoving === !1 || this.isTouchMoving === !0 && Math.abs(this.touchDistance.x) < 10 && Math.abs(this.touchDistance.y) < 10) && (b(a.target).parents(".sp-slide").find("a").off("click." + c), this.$slider.removeClass("sp-swiping")), setTimeout(function () {
                    d.$slider.removeClass("sp-swiping")
                }, 1), this.isTouchMoving !== !1) {
                this.isTouchMoving = !1, b(a.target).parents(".sp-slide").one("click", function (a) {
                    a.preventDefault()
                });
                var f = -parseInt(this.$slides.find(".sp-slide").eq(this.selectedSlideIndex).css(this.positionProperty), 10) + this.visibleOffset;
                if (Math.abs(e) < this.settings.touchSwipeThreshold)this._moveTo(f); else {
                    var g = e / (this.slideSize + this.settings.slideDistance);
                    g = parseInt(g, 10) + (g > 0 ? 1 : -1);
                    var h = this.slidesOrder[b.inArray(this.selectedSlideIndex, this.slidesOrder) - g];
                    this.settings.loop === !0 ? this.gotoSlide(h) : "undefined" != typeof h ? this.gotoSlide(h) : this._moveTo(f)
                }
            }
        },
        destroyTouchSwipe: function () {
            this.$slidesMask.off(this.touchSwipeEvents.startEvent + "." + c), this.$slidesMask.off(this.touchSwipeEvents.moveEvent + "." + c), this.$slidesMask.off("dragstart." + c), b(document).off(this.touchSwipeEvents.endEvent + "." + this.uniqueId + "." + c), this.$slidesMask.removeClass("sp-grab")
        },
        touchSwipeDefaults: {touchSwipe: !0, touchSwipeThreshold: 50}
    };
    b.SliderPro.addModule("TouchSwipe", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "Caption." + b.SliderPro.namespace, d = {
        $captionContainer: null,
        captionContent: "",
        initCaption: function () {
            this.on("update." + c, b.proxy(this._captionOnUpdate, this)), this.on("gotoSlide." + c, b.proxy(this._updateCaptionContent, this))
        },
        _captionOnUpdate: function () {
            this.$captionContainer = this.$slider.find(".sp-caption-container"), this.$slider.find(".sp-caption").length && 0 === this.$captionContainer.length && (this.$captionContainer = b('<div class="sp-caption-container"></div>').appendTo(this.$slider), this._updateCaptionContent()), this.$slides.find(".sp-caption").each(function () {
                b(this).css("display", "none")
            })
        },
        _updateCaptionContent: function () {
            var a = this, b = this.$slider.find(".sp-slide").eq(this.selectedSlideIndex).find(".sp-caption"), c = 0 !== b.length ? b.html() : "";
            this.settings.fadeCaption === !0 ? "" !== this.captionContent ? (0 === parseFloat(this.$captionContainer.css("opacity"), 10) && (this.$captionContainer.css(this.vendorPrefix + "transition", ""), this.$captionContainer.css("opacity", 1)), this._fadeCaptionTo(0, function () {
                a.captionContent = c, "" !== c ? (a.$captionContainer.html(a.captionContent), a._fadeCaptionTo(1)) : a.$captionContainer.empty()
            })) : (this.captionContent = c, this.$captionContainer.html(this.captionContent), this.$captionContainer.css("opacity", 0), this._fadeCaptionTo(1)) : (this.captionContent = c, this.$captionContainer.html(this.captionContent))
        },
        _fadeCaptionTo: function (a, b) {
            var c = this;
            "css-3d" === this.supportedAnimation || "css-2d" === this.supportedAnimation ? (setTimeout(function () {
                var b = {opacity: a};
                b[c.vendorPrefix + "transition"] = "opacity " + c.settings.captionFadeDuration / 1e3 + "s", c.$captionContainer.css(b)
            }, 1), this.$captionContainer.on(this.transitionEvent, function (a) {
                a.target === a.currentTarget && (c.$captionContainer.off(c.transitionEvent), c.$captionContainer.css(c.vendorPrefix + "transition", ""), "function" == typeof b && b())
            })) : this.$captionContainer.stop().animate({opacity: a}, this.settings.captionFadeDuration, function () {
                "function" == typeof b && b()
            })
        },
        destroyCaption: function () {
            this.off("update." + c), this.off("gotoSlide." + c), this.$captionContainer.remove(), this.$slider.find(".sp-caption").each(function () {
                b(this).css("display", "")
            })
        },
        captionDefaults: {fadeCaption: !0, captionFadeDuration: 500}
    };
    b.SliderPro.addModule("Caption", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "DeepLinking." + b.SliderPro.namespace, d = {
        initDeepLinking: function () {
            var d = this, e = !0;
            this.on("init." + c, function () {
                d._gotoHash(a.location.hash)
            }), this.on("gotoSlide." + c, function (b) {
                e = !1, d.settings.updateHash === !0 && (a.location.hash = d.$slider.attr("id") + "/" + b.index)
            }), b(a).on("hashchange." + this.uniqueId + "." + c, function () {
                e === !0 && d._gotoHash(a.location.hash), e = !0
            })
        }, _parseHash: function (a) {
            if ("" !== a) {
                a = a.substring(1);
                var b = a.split("/"), c = b.pop(), d = a.slice(0, -c.toString().length - 1);
                if (this.$slider.attr("id") === d)return {sliderID: d, slideId: c}
            }
            return !1
        }, _gotoHash: function (a) {
            var b = this._parseHash(a);
            if (b !== !1) {
                var c = b.slideId, d = parseInt(c, 10);
                if (isNaN(d)) {
                    var e = this.$slider.find(".sp-slide#" + c).index();
                    -1 !== e && this.gotoSlide(e)
                } else this.gotoSlide(d)
            }
        }, destroyDeepLinking: function () {
            this.off("init." + c), this.off("gotoSlide." + c), b(a).off("hashchange." + this.uniqueId + "." + c)
        }, deepLinkingDefaults: {updateHash: !1}
    };
    b.SliderPro.addModule("DeepLinking", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "Autoplay." + b.SliderPro.namespace, d = {
        autoplayTimer: null,
        isTimerRunning: !1,
        isTimerPaused: !1,
        initAutoplay: function () {
            this.on("update." + c, b.proxy(this._autoplayOnUpdate, this))
        },
        _autoplayOnUpdate: function () {
            this.settings.autoplay === !0 ? (this.on("gotoSlide." + c, b.proxy(this._autoplayOnGotoSlide, this)), this.on("mouseenter." + c, b.proxy(this._autoplayOnMouseEnter, this)), this.on("mouseleave." + c, b.proxy(this._autoplayOnMouseLeave, this)), this.startAutoplay()) : (this.off("gotoSlide." + c), this.off("mouseenter." + c), this.off("mouseleave." + c), this.stopAutoplay())
        },
        _autoplayOnGotoSlide: function () {
            this.isTimerRunning === !0 && this.stopAutoplay(), this.isTimerPaused === !1 && this.startAutoplay()
        },
        _autoplayOnMouseEnter: function () {
            !this.isTimerRunning || "pause" !== this.settings.autoplayOnHover && "stop" !== this.settings.autoplayOnHover || (this.stopAutoplay(), this.isTimerPaused = !0)
        },
        _autoplayOnMouseLeave: function () {
            this.settings.autoplay === !0 && this.isTimerRunning === !1 && "stop" !== this.settings.autoplayOnHover && (this.startAutoplay(), this.isTimerPaused = !1)
        },
        startAutoplay: function () {
            var a = this;
            this.isTimerRunning = !0, this.autoplayTimer = setTimeout(function () {
                "normal" === a.settings.autoplayDirection ? a.nextSlide() : "backwards" === a.settings.autoplayDirection && a.previousSlide()
            }, this.settings.autoplayDelay)
        },
        stopAutoplay: function () {
            this.isTimerRunning = !1, clearTimeout(this.autoplayTimer)
        },
        destroyAutoplay: function () {
            clearTimeout(this.autoplayTimer), this.off("update." + c), this.off("gotoSlide." + c), this.off("mouseenter." + c), this.off("mouseleave." + c)
        },
        autoplayDefaults: {autoplay: !0, autoplayDelay: 5e3, autoplayDirection: "normal", autoplayOnHover: "pause"}
    };
    b.SliderPro.addModule("Autoplay", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "Keyboard." + b.SliderPro.namespace, d = {
        initKeyboard: function () {
            var a = this, d = !1;
            this.settings.keyboard !== !1 && (this.$slider.on("focus." + c, function () {
                d = !0
            }), this.$slider.on("blur." + c, function () {
                d = !1
            }), b(document).on("keydown." + this.uniqueId + "." + c, function (b) {
                (a.settings.keyboardOnlyOnFocus !== !0 || d !== !1) && (37 === b.which ? a.previousSlide() : 39 === b.which ? a.nextSlide() : 13 === b.which && a.$slider.find(".sp-slide").eq(a.selectedSlideIndex).find(".sp-image-container a")[0].click())
            }))
        }, destroyKeyboard: function () {
            this.$slider.off("focus." + c), this.$slider.off("blur." + c), b(document).off("keydown." + this.uniqueId + "." + c)
        }, keyboardDefaults: {keyboard: !0, keyboardOnlyOnFocus: !1}
    };
    b.SliderPro.addModule("Keyboard", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "FullScreen." + b.SliderPro.namespace, d = {
        isFullScreen: !1, $fullScreenButton: null, sizeBeforeFullScreen: {}, initFullScreen: function () {
            (document.fullscreenEnabled || document.webkitFullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled) && this.on("update." + c, b.proxy(this._fullScreenOnUpdate, this))
        }, _fullScreenOnUpdate: function () {
            this.settings.fullScreen === !0 && null === this.$fullScreenButton ? this._addFullScreen() : this.settings.fullScreen === !1 && null !== this.$fullScreenButton && this._removeFullScreen(), this.settings.fullScreen === !0 && (this.settings.fadeFullScreen === !0 ? this.$fullScreenButton.addClass("sp-fade-full-screen") : this.settings.fadeFullScreen === !1 && this.$fullScreenButton.removeClass("sp-fade-full-screen"))
        }, _addFullScreen: function () {
            this.$fullScreenButton = b('<div class="sp-full-screen-button"></div>').appendTo(this.$slider), this.$fullScreenButton.on("click." + c, b.proxy(this._onFullScreenButtonClick, this)), document.addEventListener("fullscreenchange", b.proxy(this._onFullScreenChange, this)), document.addEventListener("mozfullscreenchange", b.proxy(this._onFullScreenChange, this)), document.addEventListener("webkitfullscreenchange", b.proxy(this._onFullScreenChange, this)), document.addEventListener("MSFullscreenChange", b.proxy(this._onFullScreenChange, this))
        }, _removeFullScreen: function () {
            null !== this.$fullScreenButton && (this.$fullScreenButton.off("click." + c), this.$fullScreenButton.remove(), this.$fullScreenButton = null, document.removeEventListener("fullscreenchange", this._onFullScreenChange), document.removeEventListener("mozfullscreenchange", this._onFullScreenChange), document.removeEventListener("webkitfullscreenchange", this._onFullScreenChange), document.removeEventListener("MSFullscreenChange", this._onFullScreenChange))
        }, _onFullScreenButtonClick: function () {
            this.isFullScreen === !1 ? this.instance.requestFullScreen ? this.instance.requestFullScreen() : this.instance.mozRequestFullScreen ? this.instance.mozRequestFullScreen() : this.instance.webkitRequestFullScreen ? this.instance.webkitRequestFullScreen() : this.instance.msRequestFullscreen && this.instance.msRequestFullscreen() : document.exitFullScreen ? document.exitFullScreen() : document.mozCancelFullScreen ? document.mozCancelFullScreen() : document.webkitCancelFullScreen ? document.webkitCancelFullScreen() : document.msExitFullscreen && document.msExitFullscreen()
        }, _onFullScreenChange: function () {
            this.isFullScreen = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement ? !0 : !1, this.isFullScreen === !0 ? (this.sizeBeforeFullScreen = {
                forceSize: this.settings.forceSize,
                autoHeight: this.settings.autoHeight
            }, this.$slider.addClass("sp-full-screen"), this.settings.forceSize = "fullWindow", this.settings.autoHeight = !1) : (this.$slider.css("margin", ""), this.$slider.removeClass("sp-full-screen"), this.settings.forceSize = this.sizeBeforeFullScreen.forceSize, this.settings.autoHeight = this.sizeBeforeFullScreen.autoHeight), this.resize()
        }, destroyFullScreen: function () {
            this.off("update." + c), this._removeFullScreen()
        }, fullScreenDefaults: {fullScreen: !1, fadeFullScreen: !0}
    };
    b.SliderPro.addModule("FullScreen", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "Buttons." + b.SliderPro.namespace, d = {
        $buttons: null, initButtons: function () {
            this.on("update." + c, b.proxy(this._buttonsOnUpdate, this))
        }, _buttonsOnUpdate: function () {
            this.$buttons = this.$slider.find(".sp-buttons"), this.settings.buttons === !0 && this.getTotalSlides() > 1 && 0 === this.$buttons.length ? this._createButtons() : this.settings.buttons === !0 && this.getTotalSlides() !== this.$buttons.find(".sp-button").length && 0 !== this.$buttons.length ? this._adjustButtons() : (this.settings.buttons === !1 || this.getTotalSlides() <= 1 && 0 !== this.$buttons.length) && this._removeButtons()
        }, _createButtons: function () {
            var a = this;
            this.$buttons = b('<div class="sp-buttons"></div>').appendTo(this.$slider);
            for (var d = 0; d < this.getTotalSlides(); d++)b('<div class="sp-button"></div>').appendTo(this.$buttons);
            this.$buttons.on("click." + c, ".sp-button", function () {
                a.gotoSlide(b(this).index())
            }), this.$buttons.find(".sp-button").eq(this.selectedSlideIndex).addClass("sp-selected-button"), this.on("gotoSlide." + c, function (b) {
                a.$buttons.find(".sp-selected-button").removeClass("sp-selected-button"), a.$buttons.find(".sp-button").eq(b.index).addClass("sp-selected-button")
            }), this.$slider.addClass("sp-has-buttons")
        }, _adjustButtons: function () {
            this.$buttons.empty();
            for (var a = 0; a < this.getTotalSlides(); a++)b('<div class="sp-button"></div>').appendTo(this.$buttons);
            this.$buttons.find(".sp-selected-button").removeClass("sp-selected-button"), this.$buttons.find(".sp-button").eq(this.selectedSlideIndex).addClass("sp-selected-button")
        }, _removeButtons: function () {
            this.$buttons.off("click." + c, ".sp-button"), this.off("gotoSlide." + c), this.$buttons.remove(), this.$slider.removeClass("sp-has-buttons")
        }, destroyButtons: function () {
            this._removeButtons(), this.off("update." + c)
        }, buttonsDefaults: {buttons: !0}
    };
    b.SliderPro.addModule("Buttons", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "Arrows." + b.SliderPro.namespace, d = {
        $arrows: null,
        $previousArrow: null,
        $nextArrow: null,
        initArrows: function () {
            this.on("update." + c, b.proxy(this._arrowsOnUpdate, this)), this.on("gotoSlide." + c, b.proxy(this._checkArrowsVisibility, this))
        },
        _arrowsOnUpdate: function () {
            var a = this;
            this.settings.arrows === !0 && null === this.$arrows ? (this.$arrows = b('<div class="sp-arrows"></div>').appendTo(this.$slidesContainer), this.$previousArrow = b('<div class="sp-arrow sp-previous-arrow"></div>').appendTo(this.$arrows), this.$nextArrow = b('<div class="sp-arrow sp-next-arrow"></div>').appendTo(this.$arrows), this.$previousArrow.on("click." + c, function () {
                a.previousSlide()
            }), this.$nextArrow.on("click." + c, function () {
                a.nextSlide()
            }), this._checkArrowsVisibility()) : this.settings.arrows === !1 && null !== this.$arrows && this._removeArrows(), this.settings.arrows === !0 && (this.settings.fadeArrows === !0 ? this.$arrows.addClass("sp-fade-arrows") : this.settings.fadeArrows === !1 && this.$arrows.removeClass("sp-fade-arrows"))
        },
        _checkArrowsVisibility: function () {
            this.settings.arrows !== !1 && this.settings.loop !== !0 && (0 === this.selectedSlideIndex ? this.$previousArrow.css("display", "none") : this.$previousArrow.css("display", "block"), this.selectedSlideIndex === this.getTotalSlides() - 1 ? this.$nextArrow.css("display", "none") : this.$nextArrow.css("display", "block"))
        },
        _removeArrows: function () {
            null !== this.$arrows && (this.$previousArrow.off("click." + c), this.$nextArrow.off("click." + c), this.$arrows.remove(), this.$arrows = null)
        },
        destroyArrows: function () {
            this._removeArrows(), this.off("update." + c), this.off("gotoSlide." + c)
        },
        arrowsDefaults: {arrows: !1, fadeArrows: !0}
    };
    b.SliderPro.addModule("Arrows", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "ThumbnailTouchSwipe." + b.SliderPro.namespace, d = {
        isThumbnailTouchSupport: !1,
        thumbnailTouchStartPoint: {x: 0, y: 0},
        thumbnailTouchEndPoint: {x: 0, y: 0},
        thumbnailTouchDistance: {x: 0, y: 0},
        thumbnailTouchStartPosition: 0,
        isThumbnailTouchMoving: !1,
        isThumbnailTouchSwipe: !1,
        thumbnailTouchSwipeEvents: {startEvent: "", moveEvent: "", endEvent: ""},
        initThumbnailTouchSwipe: function () {
            this.on("update." + c, b.proxy(this._thumbnailTouchSwipeOnUpdate, this))
        },
        _thumbnailTouchSwipeOnUpdate: function () {
            this.isThumbnailScroller !== !1 && (this.settings.thumbnailTouchSwipe === !0 && this.isThumbnailTouchSwipe === !1 && (this.isThumbnailTouchSwipe = !0, this.isThumbnailTouchSupport = "ontouchstart" in a, this.isThumbnailTouchSupport === !0 ? (this.thumbnailTouchSwipeEvents.startEvent = "touchstart", this.thumbnailTouchSwipeEvents.moveEvent = "touchmove", this.thumbnailTouchSwipeEvents.endEvent = "touchend") : (this.thumbnailTouchSwipeEvents.startEvent = "mousedown", this.thumbnailTouchSwipeEvents.moveEvent = "mousemove", this.thumbnailTouchSwipeEvents.endEvent = "mouseup"), this.$thumbnails.on(this.thumbnailTouchSwipeEvents.startEvent + "." + c, b.proxy(this._onThumbnailTouchStart, this)), this.$thumbnails.on("dragstart." + c, function (a) {
                a.preventDefault()
            }), this.$thumbnails.addClass("sp-grab")), b.each(this.thumbnails, function (a, b) {
                b.off("thumbnailClick")
            }))
        },
        _onThumbnailTouchStart: function (a) {
            if (!(b(a.target).closest(".sp-selectable").length >= 1)) {
                var d = this.isThumbnailTouchSupport ? a.originalEvent.touches[0] : a.originalEvent;
                this.isThumbnailTouchSupport === !1 && a.preventDefault(), b(a.target).parents(".sp-thumbnail-container").find("a").one("click." + c, function (a) {
                    a.preventDefault()
                }), this.thumbnailTouchStartPoint.x = d.pageX || d.clientX, this.thumbnailTouchStartPoint.y = d.pageY || d.clientY, this.thumbnailTouchStartPosition = this.thumbnailsPosition, this.thumbnailTouchDistance.x = this.thumbnailTouchDistance.y = 0, this.$thumbnails.hasClass("sp-animated") && (this.isThumbnailTouchMoving = !0, this._stopThumbnailsMovement(), this.thumbnailTouchStartPosition = this.thumbnailsPosition), this.$thumbnails.on(this.thumbnailTouchSwipeEvents.moveEvent + "." + c, b.proxy(this._onThumbnailTouchMove, this)), b(document).on(this.thumbnailTouchSwipeEvents.endEvent + "." + this.uniqueId + "." + c, b.proxy(this._onThumbnailTouchEnd, this)), this.$thumbnails.removeClass("sp-grab").addClass("sp-grabbing"), this.$thumbnailsContainer.addClass("sp-swiping")
            }
        },
        _onThumbnailTouchMove: function (a) {
            var b = this.isThumbnailTouchSupport ? a.originalEvent.touches[0] : a.originalEvent;
            this.isThumbnailTouchMoving = !0, this.thumbnailTouchEndPoint.x = b.pageX || b.clientX, this.thumbnailTouchEndPoint.y = b.pageY || b.clientY, this.thumbnailTouchDistance.x = this.thumbnailTouchEndPoint.x - this.thumbnailTouchStartPoint.x, this.thumbnailTouchDistance.y = this.thumbnailTouchEndPoint.y - this.thumbnailTouchStartPoint.y;
            var c = "horizontal" === this.thumbnailsOrientation ? this.thumbnailTouchDistance.x : this.thumbnailTouchDistance.y, d = "horizontal" === this.thumbnailsOrientation ? this.thumbnailTouchDistance.y : this.thumbnailTouchDistance.x;
            if (Math.abs(c) > Math.abs(d)) {
                if (a.preventDefault(), this.thumbnailsPosition >= 0) {
                    var e = -this.thumbnailTouchStartPosition;
                    c = e + .2 * (c - e)
                } else if (this.thumbnailsPosition <= -this.thumbnailsSize + this.thumbnailsContainerSize) {
                    var f = this.thumbnailsSize - this.thumbnailsContainerSize + this.thumbnailTouchStartPosition;
                    c = -f + .2 * (c + f)
                }
                this._moveThumbnailsTo(this.thumbnailTouchStartPosition + c, !0)
            }
        },
        _onThumbnailTouchEnd: function (a) {
            {
                var d = this;
                "horizontal" === this.thumbnailsOrientation ? this.thumbnailTouchDistance.x : this.thumbnailTouchDistance.y
            }
            if (this.$thumbnails.off(this.thumbnailTouchSwipeEvents.moveEvent + "." + c), b(document).off(this.thumbnailTouchSwipeEvents.endEvent + "." + this.uniqueId + "." + c), this.$thumbnails.removeClass("sp-grabbing").addClass("sp-grab"), this.isThumbnailTouchMoving === !1 || this.isThumbnailTouchMoving === !0 && Math.abs(this.thumbnailTouchDistance.x) < 10 && Math.abs(this.thumbnailTouchDistance.y) < 10) {
                var e = b(a.target).hasClass("sp-thumbnail-container") ? b(a.target) : b(a.target).parents(".sp-thumbnail-container"), f = e.index();
                return void(0 !== b(a.target).parents("a").length ? (b(a.target).parents("a").off("click." + c), this.$thumbnailsContainer.removeClass("sp-swiping")) : f !== this.selectedThumbnailIndex && -1 !== f && this.gotoSlide(f))
            }
            this.isThumbnailTouchMoving = !1, b(a.target).parents(".sp-thumbnail").one("click", function (a) {
                a.preventDefault()
            }), setTimeout(function () {
                d.$thumbnailsContainer.removeClass("sp-swiping")
            }, 1), this.thumbnailsPosition > 0 ? this._moveThumbnailsTo(0) : this.thumbnailsPosition < this.thumbnailsContainerSize - this.thumbnailsSize && this._moveThumbnailsTo(this.thumbnailsContainerSize - this.thumbnailsSize), this.trigger({type: "thumbnailsMoveComplete"}), b.isFunction(this.settings.thumbnailsMoveComplete) && this.settings.thumbnailsMoveComplete.call(this, {type: "thumbnailsMoveComplete"})
        },
        destroyThumbnailTouchSwipe: function () {
            this.off("update." + c), this.isThumbnailScroller !== !1 && (this.$thumbnails.off(this.thumbnailTouchSwipeEvents.startEvent + "." + c), this.$thumbnails.off(this.thumbnailTouchSwipeEvents.moveEvent + "." + c), this.$thumbnails.off("dragstart." + c), b(document).off(this.thumbnailTouchSwipeEvents.endEvent + "." + this.uniqueId + "." + c), this.$thumbnails.removeClass("sp-grab"))
        },
        thumbnailTouchSwipeDefaults: {thumbnailTouchSwipe: !0}
    };
    b.SliderPro.addModule("ThumbnailTouchSwipe", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "ThumbnailArrows." + b.SliderPro.namespace, d = {
        $thumbnailArrows: null,
        $previousThumbnailArrow: null,
        $nextThumbnailArrow: null,
        initThumbnailArrows: function () {
            var a = this;
            this.on("update." + c, b.proxy(this._thumbnailArrowsOnUpdate, this)), this.on("sliderResize." + c + " thumbnailsMoveComplete." + c, function () {
                a.isThumbnailScroller === !0 && a.settings.thumbnailArrows === !0 && a._checkThumbnailArrowsVisibility()
            })
        },
        _thumbnailArrowsOnUpdate: function () {
            var a = this;
            this.isThumbnailScroller !== !1 && (this.settings.thumbnailArrows === !0 && null === this.$thumbnailArrows ? (this.$thumbnailArrows = b('<div class="sp-thumbnail-arrows"></div>').appendTo(this.$thumbnailsContainer), this.$previousThumbnailArrow = b('<div class="sp-thumbnail-arrow sp-previous-thumbnail-arrow"></div>').appendTo(this.$thumbnailArrows), this.$nextThumbnailArrow = b('<div class="sp-thumbnail-arrow sp-next-thumbnail-arrow"></div>').appendTo(this.$thumbnailArrows), this.$previousThumbnailArrow.on("click." + c, function () {
                var b = Math.min(0, a.thumbnailsPosition + a.thumbnailsContainerSize);
                a._moveThumbnailsTo(b)
            }), this.$nextThumbnailArrow.on("click." + c, function () {
                var b = Math.max(a.thumbnailsContainerSize - a.thumbnailsSize, a.thumbnailsPosition - a.thumbnailsContainerSize);
                a._moveThumbnailsTo(b)
            })) : this.settings.thumbnailArrows === !1 && null !== this.$thumbnailArrows && this._removeThumbnailArrows(), this.settings.thumbnailArrows === !0 && (this.settings.fadeThumbnailArrows === !0 ? this.$thumbnailArrows.addClass("sp-fade-thumbnail-arrows") : this.settings.fadeThumbnailArrows === !1 && this.$thumbnailArrows.removeClass("sp-fade-thumbnail-arrows"), this._checkThumbnailArrowsVisibility()))
        },
        _checkThumbnailArrowsVisibility: function () {
            0 === this.thumbnailsPosition ? this.$previousThumbnailArrow.css("display", "none") : this.$previousThumbnailArrow.css("display", "block"), this.thumbnailsPosition === this.thumbnailsContainerSize - this.thumbnailsSize ? this.$nextThumbnailArrow.css("display", "none") : this.$nextThumbnailArrow.css("display", "block")
        },
        _removeThumbnailArrows: function () {
            null !== this.$thumbnailArrows && (this.$previousThumbnailArrow.off("click." + c), this.$nextThumbnailArrow.off("click." + c), this.$thumbnailArrows.remove(), this.$thumbnailArrows = null)
        },
        destroyThumbnailArrows: function () {
            this._removeThumbnailArrows(), this.off("update." + c), this.off("sliderResize." + c), this.off("thumbnailsMoveComplete." + c)
        },
        thumbnailArrowsDefaults: {thumbnailArrows: !1, fadeThumbnailArrows: !0}
    };
    b.SliderPro.addModule("ThumbnailArrows", d)
}(window, jQuery), function (a, b) {
    "use strict";
    var c = "Video." + b.SliderPro.namespace, d = {
        initVideo: function () {
            this.on("update." + c, b.proxy(this._videoOnUpdate, this)), this.on("gotoSlideComplete." + c, b.proxy(this._videoOnGotoSlideComplete, this))
        },
        _videoOnUpdate: function () {
            var a = this;
            this.$slider.find(".sp-video").not("a, [data-init]").each(function () {
                var c = b(this);
                a._initVideo(c)
            }), this.$slider.find("a.sp-video").not("[data-preinit]").each(function () {
                var c = b(this);
                a._preinitVideo(c)
            })
        },
        _initVideo: function (a) {
            var d = this;
            a.attr("data-init", !0).videoController(), a.on("videoPlay." + c, function () {
                "stopAutoplay" === d.settings.playVideoAction && "undefined" != typeof d.stopAutoplay && (d.stopAutoplay(), d.settings.autoplay = !1);
                var c = {type: "videoPlay", video: a};
                d.trigger(c), b.isFunction(d.settings.videoPlay) && d.settings.videoPlay.call(d, c)
            }), a.on("videoPause." + c, function () {
                "startAutoplay" === d.settings.pauseVideoAction && "undefined" != typeof d.startAutoplay && (d.startAutoplay(), d.settings.autoplay = !0);
                var c = {type: "videoPause", video: a};
                d.trigger(c), b.isFunction(d.settings.videoPause) && d.settings.videoPause.call(d, c)
            }), a.on("videoEnded." + c, function () {
                "startAutoplay" === d.settings.endVideoAction && "undefined" != typeof d.startAutoplay ? (d.startAutoplay(), d.settings.autoplay = !0) : "nextSlide" === d.settings.endVideoAction ? d.nextSlide() : "replayVideo" === d.settings.endVideoAction && a.videoController("replay");
                var c = {type: "videoEnd", video: a};
                d.trigger(c), b.isFunction(d.settings.videoEnd) && d.settings.videoEnd.call(d, c)
            })
        },
        _preinitVideo: function (a) {
            var d = this;
            a.attr("data-preinit", !0), a.on("click." + c, function (c) {
                if (!d.$slider.hasClass("sp-swiping")) {
                    c.preventDefault();
                    var e, f, g, h, i, j, k, l = a.attr("href"), m = a.children("img").attr("width"), n = a.children("img").attr("height");
                    -1 !== l.indexOf("youtube") || -1 !== l.indexOf("youtu.be") ? f = "youtube" : -1 !== l.indexOf("vimeo") && (f = "vimeo"), g = "youtube" === f ? /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/ : /http:\/\/(www\.)?vimeo.com\/(\d+)/, h = l.match(g), i = h[2], j = "youtube" === f ? "http://www.youtube.com/embed/" + i + "?enablejsapi=1&wmode=opaque" : "http://player.vimeo.com/video/" + i + "?api=1", k = l.split("?")[1], "undefined" != typeof k && (k = k.split("&"), b.each(k, function (a, b) {
                        -1 === b.indexOf(i) && (j += "&" + b)
                    })), e = b("<iframe></iframe>").attr({
                        src: j,
                        width: m,
                        height: n,
                        "class": a.attr("class"),
                        frameborder: 0
                    }).insertBefore(a), d._initVideo(e), e.videoController("play"), a.css("display", "none")
                }
            })
        },
        _videoOnGotoSlideComplete: function (a) {
            var b = this.$slides.find(".sp-slide").eq(a.previousIndex).find(".sp-video[data-init]");
            if (-1 !== a.previousIndex && 0 !== b.length && ("stopVideo" === this.settings.leaveVideoAction ? b.videoController("stop") : "pauseVideo" === this.settings.leaveVideoAction ? b.videoController("pause") : "removeVideo" === this.settings.leaveVideoAction && (0 !== b.siblings("a.sp-video").length ? (b.siblings("a.sp-video").css("display", ""), b.videoController("destroy"), b.remove()) : b.videoController("stop"))), "playVideo" === this.settings.reachVideoAction) {
                var d = this.$slides.find(".sp-slide").eq(a.index).find(".sp-video[data-init]"), e = this.$slides.find(".sp-slide").eq(a.index).find(".sp-video[data-preinit]");
                0 !== d.length ? d.videoController("play") : 0 !== e.length && e.trigger("click." + c)
            }
        },
        destroyVideo: function () {
            this.$slider.find(".sp-video[ data-preinit ]").each(function () {
                var a = b(this);
                a.removeAttr("data-preinit"), a.off("click." + c)
            }), this.$slider.find(".sp-video[ data-init ]").each(function () {
                var a = b(this);
                a.removeAttr("data-init"), a.off("Video"), a.videoController("destroy")
            }), this.off("update." + c), this.off("gotoSlideComplete." + c)
        },
        videoDefaults: {
            reachVideoAction: "none",
            leaveVideoAction: "pauseVideo",
            playVideoAction: "stopAutoplay",
            pauseVideoAction: "none",
            endVideoAction: "none",
            videoPlay: function () {
            },
            videoPause: function () {
            },
            videoEnd: function () {
            }
        }
    };
    b.SliderPro.addModule("Video", d)
}(window, jQuery), function (a) {
    "use strict";
    var b = window.navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? !0 : !1, c = function (b, c) {
        this.$video = a(b), this.options = c, this.settings = {}, this.player = null, this._init()
    };
    c.prototype = {
        _init: function () {
            this.settings = a.extend({}, this.defaults, this.options);
            var b = this, c = a.VideoController.players, d = this.$video.attr("id");
            for (var e in c)if ("undefined" != typeof c[e] && c[e].isType(this.$video)) {
                this.player = new c[e](this.$video);
                break
            }
            if (null !== this.player) {
                var f = ["ready", "start", "play", "pause", "ended"];
                a.each(f, function (c, e) {
                    var f = "video" + e.charAt(0).toUpperCase() + e.slice(1);
                    b.player.on(e, function () {
                        b.trigger({type: f, video: d}), a.isFunction(b.settings[f]) && b.settings[f].call(b, {
                            type: f,
                            video: d
                        })
                    })
                })
            }
        }, play: function () {
            b === !0 && this.player.isStarted() === !1 || "playing" === this.player.getState() || this.player.play()
        }, stop: function () {
            b === !0 && this.player.isStarted() === !1 || "stopped" === this.player.getState() || this.player.stop()
        }, pause: function () {
            b === !0 && this.player.isStarted() === !1 || "paused" === this.player.getState() || this.player.pause()
        }, replay: function () {
            (b !== !0 || this.player.isStarted() !== !1) && this.player.replay()
        }, on: function (a, b) {
            return this.$video.on(a, b)
        }, off: function (a) {
            return this.$video.off(a)
        }, trigger: function (a) {
            return this.$video.triggerHandler(a)
        }, destroy: function () {
            this.player.isStarted() === !0 && this.stop(), this.player.off("ready"), this.player.off("start"), this.player.off("play"), this.player.off("pause"), this.player.off("ended"), this.$video.removeData("videoController")
        }, defaults: {
            videoReady: function () {
            }, videoStart: function () {
            }, videoPlay: function () {
            }, videoPause: function () {
            }, videoEnded: function () {
            }
        }
    }, a.VideoController = {
        players: {}, addPlayer: function (a, b) {
            this.players[a] = b
        }
    }, a.fn.videoController = function (b) {
        var d = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
            if ("undefined" == typeof a(this).data("videoController")) {
                var e = new c(this, b);
                a(this).data("videoController", e)
            } else if ("undefined" != typeof b) {
                var f = a(this).data("videoController");
                "function" == typeof f[b] ? f[b].apply(f, d) : a.error(b + " does not exist in videoController.")
            }
        })
    };
    var d = function (b) {
        this.$video = b, this.player = null, this.ready = !1, this.started = !1, this.state = "", this.events = a({}), this._init()
    };
    d.prototype = {
        _init: function () {
        }, play: function () {
        }, pause: function () {
        }, stop: function () {
        }, replay: function () {
        }, isType: function () {
        }, isReady: function () {
            return this.ready
        }, isStarted: function () {
            return this.started
        }, getState: function () {
            return this.state
        }, on: function (a, b) {
            return this.events.on(a, b)
        }, off: function (a) {
            return this.events.off(a)
        }, trigger: function (a) {
            return this.events.triggerHandler(a)
        }
    };
    var e = {youtubeAPIAdded: !1, youtubeVideos: []}, f = function (b) {
        this.init = !1;
        var c = window.YT && window.YT.Player;
        if ("undefined" != typeof c)d.call(this, b); else if (e.youtubeVideos.push({
                video: b,
                scope: this
            }), e.youtubeAPIAdded === !1) {
            e.youtubeAPIAdded = !0;
            var f = document.createElement("script");
            f.src = "http://www.youtube.com/player_api";
            var g = document.getElementsByTagName("script")[0];
            g.parentNode.insertBefore(f, g), window.onYouTubePlayerAPIReady = function () {
                a.each(e.youtubeVideos, function (a, b) {
                    d.call(b.scope, b.video)
                })
            }
        }
    };
    f.prototype = new d, f.prototype.constructor = f, a.VideoController.addPlayer("YoutubeVideo", f), f.isType = function (a) {
        if (a.is("iframe")) {
            var b = a.attr("src");
            if (-1 !== b.indexOf("youtube.com") || -1 !== b.indexOf("youtu.be"))return !0
        }
        return !1
    }, f.prototype._init = function () {
        this.init = !0, this._setup()
    }, f.prototype._setup = function () {
        var a = this;
        this.player = new YT.Player(this.$video[0], {
            events: {
                onReady: function () {
                    a.trigger({type: "ready"}), a.ready = !0
                }, onStateChange: function (b) {
                    switch (b.data) {
                        case YT.PlayerState.PLAYING:
                            a.started === !1 && (a.started = !0, a.trigger({type: "start"})), a.state = "playing", a.trigger({type: "play"});
                            break;
                        case YT.PlayerState.PAUSED:
                            a.state = "paused", a.trigger({type: "pause"});
                            break;
                        case YT.PlayerState.ENDED:
                            a.state = "ended", a.trigger({type: "ended"})
                    }
                }
            }
        })
    }, f.prototype.play = function () {
        var a = this;
        if (this.ready === !0)this.player.playVideo(); else var b = setInterval(function () {
            a.ready === !0 && (clearInterval(b), a.player.playVideo())
        }, 100)
    }, f.prototype.pause = function () {
        b === !0 ? this.stop() : this.player.pauseVideo()
    }, f.prototype.stop = function () {
        this.player.seekTo(1), this.player.stopVideo(), this.state = "stopped"
    }, f.prototype.replay = function () {
        this.player.seekTo(1), this.player.playVideo()
    }, f.prototype.on = function (a, b) {
        var c = this;
        if (this.init === !0)d.prototype.on.call(this, a, b); else var e = setInterval(function () {
            c.init === !0 && (clearInterval(e), d.prototype.on.call(c, a, b))
        }, 100)
    };
    var g = {vimeoAPIAdded: !1, vimeoVideos: []}, h = function (b) {
        if (this.init = !1, "undefined" != typeof window.Froogaloop)d.call(this, b); else if (g.vimeoVideos.push({
                video: b,
                scope: this
            }), g.vimeoAPIAdded === !1) {
            g.vimeoAPIAdded = !0;
            var c = document.createElement("script");
            c.src = "http://a.vimeocdn.com/js/froogaloop2.min.js";
            var e = document.getElementsByTagName("script")[0];
            e.parentNode.insertBefore(c, e);
            var f = setInterval(function () {
                "undefined" != typeof window.Froogaloop && (clearInterval(f), a.each(g.vimeoVideos, function (a, b) {
                    d.call(b.scope, b.video)
                }))
            }, 100)
        }
    };
    h.prototype = new d, h.prototype.constructor = h, a.VideoController.addPlayer("VimeoVideo", h), h.isType = function (a) {
        if (a.is("iframe")) {
            var b = a.attr("src");
            if (-1 !== b.indexOf("vimeo.com"))return !0
        }
        return !1
    }, h.prototype._init = function () {
        this.init = !0, this._setup()
    }, h.prototype._setup = function () {
        var a = this;
        this.player = $f(this.$video[0]), this.player.addEvent("ready", function () {
            a.ready = !0, a.trigger({type: "ready"}), a.player.addEvent("play", function () {
                a.started === !1 && (a.started = !0, a.trigger({type: "start"})), a.state = "playing", a.trigger({type: "play"})
            }), a.player.addEvent("pause", function () {
                a.state = "paused", a.trigger({type: "pause"})
            }), a.player.addEvent("finish", function () {
                a.state = "ended", a.trigger({type: "ended"})
            })
        })
    }, h.prototype.play = function () {
        var a = this;
        if (this.ready === !0)this.player.api("play"); else var b = setInterval(function () {
            a.ready === !0 && (clearInterval(b), a.player.api("play"))
        }, 100)
    }, h.prototype.pause = function () {
        this.player.api("pause")
    }, h.prototype.stop = function () {
        this.player.api("seekTo", 0), this.player.api("pause"), this.state = "stopped"
    }, h.prototype.replay = function () {
        this.player.api("seekTo", 0), this.player.api("play")
    }, h.prototype.on = function (a, b) {
        var c = this;
        if (this.init === !0)d.prototype.on.call(this, a, b); else var e = setInterval(function () {
            c.init === !0 && (clearInterval(e), d.prototype.on.call(c, a, b))
        }, 100)
    };
    var i = function (a) {
        d.call(this, a)
    };
    i.prototype = new d, i.prototype.constructor = i, a.VideoController.addPlayer("HTML5Video", i), i.isType = function (a) {
        return a.is("video") && a.hasClass("video-js") === !1 && a.hasClass("sublime") === !1 ? !0 : !1
    }, i.prototype._init = function () {
        var a = this;
        this.player = this.$video[0], this.ready = !0, this.player.addEventListener("play", function () {
            a.started === !1 && (a.started = !0, a.trigger({type: "start"})), a.state = "playing", a.trigger({type: "play"})
        }), this.player.addEventListener("pause", function () {
            a.state = "paused", a.trigger({type: "pause"})
        }), this.player.addEventListener("ended", function () {
            a.state = "ended", a.trigger({type: "ended"})
        })
    }, i.prototype.play = function () {
        this.player.play()
    }, i.prototype.pause = function () {
        this.player.pause()
    }, i.prototype.stop = function () {
        this.player.currentTime = 0, this.player.pause(), this.state = "stopped"
    }, i.prototype.replay = function () {
        this.player.currentTime = 0, this.player.play()
    };
    var j = function (a) {
        d.call(this, a)
    };
    j.prototype = new d, j.prototype.constructor = j, a.VideoController.addPlayer("VideoJSVideo", j), j.isType = function (a) {
        return "undefined" == typeof a.attr("data-videojs-id") && !a.hasClass("video-js") || "undefined" == typeof videojs ? !1 : !0
    }, j.prototype._init = function () {
        var a = this, b = this.$video.attr(this.$video.hasClass("video-js") ? "id" : "data-videojs-id");
        this.player = videojs(b), this.player.ready(function () {
            a.ready = !0, a.trigger({type: "ready"}), a.player.on("play", function () {
                a.started === !1 && (a.started = !0, a.trigger({type: "start"})), a.state = "playing", a.trigger({type: "play"})
            }), a.player.on("pause", function () {
                a.state = "paused", a.trigger({type: "pause"})
            }), a.player.on("ended", function () {
                a.state = "ended", a.trigger({type: "ended"})
            })
        })
    }, j.prototype.play = function () {
        this.player.play()
    }, j.prototype.pause = function () {
        this.player.pause()
    }, j.prototype.stop = function () {
        this.player.currentTime(0), this.player.pause(), this.state = "stopped"
    }, j.prototype.replay = function () {
        this.player.currentTime(0), this.player.play()
    };
    var k = function (a) {
        d.call(this, a)
    };
    k.prototype = new d, k.prototype.constructor = k, a.VideoController.addPlayer("SublimeVideo", k), k.isType = function (a) {
        return a.hasClass("sublime") && "undefined" != typeof sublime ? !0 : !1
    }, k.prototype._init = function () {
        var a = this;
        sublime.ready(function () {
            a.player = sublime.player(a.$video.attr("id")), a.ready = !0, a.trigger({type: "ready"}), a.player.on("play", function () {
                a.started === !1 && (a.started = !0, a.trigger({type: "start"})), a.state = "playing", a.trigger({type: "play"})
            }), a.player.on("pause", function () {
                a.state = "paused", a.trigger({type: "pause"})
            }), a.player.on("stop", function () {
                a.state = "stopped", a.trigger({type: "stop"})
            }), a.player.on("end", function () {
                a.state = "ended", a.trigger({type: "ended"})
            })
        })
    }, k.prototype.play = function () {
        this.player.play()
    }, k.prototype.pause = function () {
        this.player.pause()
    }, k.prototype.stop = function () {
        this.player.stop()
    }, k.prototype.replay = function () {
        this.player.stop(), this.player.play()
    };
    var l = function (a) {
        d.call(this, a)
    };
    l.prototype = new d, l.prototype.constructor = l, a.VideoController.addPlayer("JWPlayerVideo", l), l.isType = function (a) {
        return "undefined" == typeof a.attr("data-jwplayer-id") && !a.hasClass("jwplayer") && 0 === a.find("object[data*='jwplayer']").length || "undefined" == typeof jwplayer ? !1 : !0
    }, l.prototype._init = function () {
        var a, b = this;
        this.$video.hasClass("jwplayer") ? a = this.$video.attr("id") : "undefined" != typeof this.$video.attr("data-jwplayer-id") ? a = this.$video.attr("data-jwplayer-id") : 0 !== this.$video.find("object[data*='jwplayer']").length && (a = this.$video.find("object").attr("id")), this.player = jwplayer(a), this.player.onReady(function () {
            b.ready = !0, b.trigger({type: "ready"}), b.player.onPlay(function () {
                b.started === !1 && (b.started = !0, b.trigger({type: "start"})), b.state = "playing", b.trigger({type: "play"})
            }), b.player.onPause(function () {
                b.state = "paused", b.trigger({type: "pause"})
            }), b.player.onComplete(function () {
                b.state = "ended", b.trigger({type: "ended"})
            })
        })
    }, l.prototype.play = function () {
        this.player.play(!0)
    }, l.prototype.pause = function () {
        this.player.pause(!0)
    }, l.prototype.stop = function () {
        this.player.stop(), this.state = "stopped"
    }, l.prototype.replay = function () {
        this.player.seek(0), this.player.play(!0)
    }
}(jQuery);

/*
 * Swiper 2.7.5
 * Mobile touch slider and framework with hardware accelerated transitions
 *
 * http://www.idangero.us/sliders/swiper/
 *
 * Copyright 2010-2015, Vladimir Kharlampidi
 * The iDangero.us
 * http://www.idangero.us/
 *
 * Licensed under GPL & MIT
 *
 * Released on: January 4, 2015
 */
var Swiper = function (a, b) {
    "use strict";
    function c(a, b) {
        return document.querySelectorAll ? (b || document).querySelectorAll(a) : jQuery(a, b)
    }

    function d(a) {
        return "[object Array]" === Object.prototype.toString.apply(a) ? !0 : !1
    }

    function e() {
        var a = G - J;
        return b.freeMode && (a = G - J), b.slidesPerView > D.slides.length && !b.centeredSlides && (a = 0), 0 > a && (a = 0), a
    }

    function f() {
        function a(a) {
            var c, d, e = function () {
                "undefined" != typeof D && null !== D && (void 0 !== D.imagesLoaded && D.imagesLoaded++, D.imagesLoaded === D.imagesToLoad.length && (D.reInit(), b.onImagesReady && D.fireCallback(b.onImagesReady, D)))
            };
            a.complete ? e() : (d = a.currentSrc || a.getAttribute("src"), d ? (c = new Image, c.onload = e, c.onerror = e, c.src = d) : e())
        }

        var d = D.h.addEventListener, e = "wrapper" === b.eventTarget ? D.wrapper : D.container;
        if (D.browser.ie10 || D.browser.ie11 ? (d(e, D.touchEvents.touchStart, p), d(document, D.touchEvents.touchMove, q), d(document, D.touchEvents.touchEnd, r)) : (D.support.touch && (d(e, "touchstart", p), d(e, "touchmove", q), d(e, "touchend", r)), b.simulateTouch && (d(e, "mousedown", p), d(document, "mousemove", q), d(document, "mouseup", r))), b.autoResize && d(window, "resize", D.resizeFix), g(), D._wheelEvent = !1, b.mousewheelControl) {
            if (void 0 !== document.onmousewheel && (D._wheelEvent = "mousewheel"), !D._wheelEvent)try {
                new WheelEvent("wheel"), D._wheelEvent = "wheel"
            } catch (f) {
            }
            D._wheelEvent || (D._wheelEvent = "DOMMouseScroll"), D._wheelEvent && d(D.container, D._wheelEvent, j)
        }
        if (b.keyboardControl && d(document, "keydown", i), b.updateOnImagesReady) {
            D.imagesToLoad = c("img", D.container);
            for (var h = 0; h < D.imagesToLoad.length; h++)a(D.imagesToLoad[h])
        }
    }

    function g() {
        var a, d = D.h.addEventListener;
        if (b.preventLinks) {
            var e = c("a", D.container);
            for (a = 0; a < e.length; a++)d(e[a], "click", n)
        }
        if (b.releaseFormElements) {
            var f = c("input, textarea, select", D.container);
            for (a = 0; a < f.length; a++)d(f[a], D.touchEvents.touchStart, o, !0), D.support.touch && b.simulateTouch && d(f[a], "mousedown", o, !0)
        }
        if (b.onSlideClick)for (a = 0; a < D.slides.length; a++)d(D.slides[a], "click", k);
        if (b.onSlideTouch)for (a = 0; a < D.slides.length; a++)d(D.slides[a], D.touchEvents.touchStart, l)
    }

    function h() {
        var a, d = D.h.removeEventListener;
        if (b.onSlideClick)for (a = 0; a < D.slides.length; a++)d(D.slides[a], "click", k);
        if (b.onSlideTouch)for (a = 0; a < D.slides.length; a++)d(D.slides[a], D.touchEvents.touchStart, l);
        if (b.releaseFormElements) {
            var e = c("input, textarea, select", D.container);
            for (a = 0; a < e.length; a++)d(e[a], D.touchEvents.touchStart, o, !0), D.support.touch && b.simulateTouch && d(e[a], "mousedown", o, !0)
        }
        if (b.preventLinks) {
            var f = c("a", D.container);
            for (a = 0; a < f.length; a++)d(f[a], "click", n)
        }
    }

    function i(a) {
        var b = a.keyCode || a.charCode;
        if (!(a.shiftKey || a.altKey || a.ctrlKey || a.metaKey)) {
            if (37 === b || 39 === b || 38 === b || 40 === b) {
                for (var c = !1, d = D.h.getOffset(D.container), e = D.h.windowScroll().left, f = D.h.windowScroll().top, g = D.h.windowWidth(), h = D.h.windowHeight(), i = [[d.left, d.top], [d.left + D.width, d.top], [d.left, d.top + D.height], [d.left + D.width, d.top + D.height]], j = 0; j < i.length; j++) {
                    var k = i[j];
                    k[0] >= e && k[0] <= e + g && k[1] >= f && k[1] <= f + h && (c = !0)
                }
                if (!c)return
            }
            N ? ((37 === b || 39 === b) && (a.preventDefault ? a.preventDefault() : a.returnValue = !1), 39 === b && D.swipeNext(), 37 === b && D.swipePrev()) : ((38 === b || 40 === b) && (a.preventDefault ? a.preventDefault() : a.returnValue = !1), 40 === b && D.swipeNext(), 38 === b && D.swipePrev())
        }
    }

    function j(a) {
        var c = D._wheelEvent, d = 0;
        if (a.detail)d = -a.detail; else if ("mousewheel" === c)if (b.mousewheelControlForceToAxis)if (N) {
            if (!(Math.abs(a.wheelDeltaX) > Math.abs(a.wheelDeltaY)))return;
            d = a.wheelDeltaX
        } else {
            if (!(Math.abs(a.wheelDeltaY) > Math.abs(a.wheelDeltaX)))return;
            d = a.wheelDeltaY
        } else d = a.wheelDelta; else if ("DOMMouseScroll" === c)d = -a.detail; else if ("wheel" === c)if (b.mousewheelControlForceToAxis)if (N) {
            if (!(Math.abs(a.deltaX) > Math.abs(a.deltaY)))return;
            d = -a.deltaX
        } else {
            if (!(Math.abs(a.deltaY) > Math.abs(a.deltaX)))return;
            d = -a.deltaY
        } else d = Math.abs(a.deltaX) > Math.abs(a.deltaY) ? -a.deltaX : -a.deltaY;
        if (b.freeMode) {
            var f = D.getWrapperTranslate() + d;
            if (f > 0 && (f = 0), f < -e() && (f = -e()), D.setWrapperTransition(0), D.setWrapperTranslate(f), D.updateActiveSlide(f), 0 === f || f === -e())return
        } else(new Date).getTime() - V > 60 && (0 > d ? D.swipeNext() : D.swipePrev()), V = (new Date).getTime();
        return b.autoplay && D.stopAutoplay(!0), a.preventDefault ? a.preventDefault() : a.returnValue = !1, !1
    }

    function k(a) {
        D.allowSlideClick && (m(a), D.fireCallback(b.onSlideClick, D, a))
    }

    function l(a) {
        m(a), D.fireCallback(b.onSlideTouch, D, a)
    }

    function m(a) {
        if (a.currentTarget)D.clickedSlide = a.currentTarget; else {
            var c = a.srcElement;
            do {
                if (c.className.indexOf(b.slideClass) > -1)break;
                c = c.parentNode
            } while (c);
            D.clickedSlide = c
        }
        D.clickedSlideIndex = D.slides.indexOf(D.clickedSlide), D.clickedSlideLoopIndex = D.clickedSlideIndex - (D.loopedSlides || 0)
    }

    function n(a) {
        return D.allowLinks ? void 0 : (a.preventDefault ? a.preventDefault() : a.returnValue = !1, b.preventLinksPropagation && "stopPropagation" in a && a.stopPropagation(), !1)
    }

    function o(a) {
        return a.stopPropagation ? a.stopPropagation() : a.returnValue = !1, !1
    }

    function p(a) {
        if (b.preventLinks && (D.allowLinks = !0), D.isTouched || b.onlyExternal)return !1;
        var c = a.target || a.srcElement;
        document.activeElement && document.activeElement !== document.body && document.activeElement !== c && document.activeElement.blur();
        var d = "input select textarea".split(" ");
        if (b.noSwiping && c && t(c))return !1;
        if (_ = !1, D.isTouched = !0, $ = "touchstart" === a.type, !$ && "which" in a && 3 === a.which)return D.isTouched = !1, !1;
        if (!$ || 1 === a.targetTouches.length) {
            D.callPlugins("onTouchStartBegin"), !$ && !D.isAndroid && d.indexOf(c.tagName.toLowerCase()) < 0 && (a.preventDefault ? a.preventDefault() : a.returnValue = !1);
            var e = $ ? a.targetTouches[0].pageX : a.pageX || a.clientX, f = $ ? a.targetTouches[0].pageY : a.pageY || a.clientY;
            D.touches.startX = D.touches.currentX = e, D.touches.startY = D.touches.currentY = f, D.touches.start = D.touches.current = N ? e : f, D.setWrapperTransition(0), D.positions.start = D.positions.current = D.getWrapperTranslate(), D.setWrapperTranslate(D.positions.start), D.times.start = (new Date).getTime(), I = void 0, b.moveStartThreshold > 0 && (X = !1), b.onTouchStart && D.fireCallback(b.onTouchStart, D, a), D.callPlugins("onTouchStartEnd")
        }
    }

    function q(a) {
        if (D.isTouched && !b.onlyExternal && (!$ || "mousemove" !== a.type)) {
            var c = $ ? a.targetTouches[0].pageX : a.pageX || a.clientX, d = $ ? a.targetTouches[0].pageY : a.pageY || a.clientY;
            if ("undefined" == typeof I && N && (I = !!(I || Math.abs(d - D.touches.startY) > Math.abs(c - D.touches.startX))), "undefined" != typeof I || N || (I = !!(I || Math.abs(d - D.touches.startY) < Math.abs(c - D.touches.startX))), I)return void(D.isTouched = !1);
            if (N) {
                if (!b.swipeToNext && c < D.touches.startX || !b.swipeToPrev && c > D.touches.startX)return
            } else if (!b.swipeToNext && d < D.touches.startY || !b.swipeToPrev && d > D.touches.startY)return;
            if (a.assignedToSwiper)return void(D.isTouched = !1);
            if (a.assignedToSwiper = !0, b.preventLinks && (D.allowLinks = !1), b.onSlideClick && (D.allowSlideClick = !1), b.autoplay && D.stopAutoplay(!0), !$ || 1 === a.touches.length) {
                if (D.isMoved || (D.callPlugins("onTouchMoveStart"), b.loop && (D.fixLoop(), D.positions.start = D.getWrapperTranslate()), b.onTouchMoveStart && D.fireCallback(b.onTouchMoveStart, D)), D.isMoved = !0, a.preventDefault ? a.preventDefault() : a.returnValue = !1, D.touches.current = N ? c : d, D.positions.current = (D.touches.current - D.touches.start) * b.touchRatio + D.positions.start, D.positions.current > 0 && b.onResistanceBefore && D.fireCallback(b.onResistanceBefore, D, D.positions.current), D.positions.current < -e() && b.onResistanceAfter && D.fireCallback(b.onResistanceAfter, D, Math.abs(D.positions.current + e())), b.resistance && "100%" !== b.resistance) {
                    var f;
                    if (D.positions.current > 0 && (f = 1 - D.positions.current / J / 2, D.positions.current = .5 > f ? J / 2 : D.positions.current * f), D.positions.current < -e()) {
                        var g = (D.touches.current - D.touches.start) * b.touchRatio + (e() + D.positions.start);
                        f = (J + g) / J;
                        var h = D.positions.current - g * (1 - f) / 2, i = -e() - J / 2;
                        D.positions.current = i > h || 0 >= f ? i : h
                    }
                }
                if (b.resistance && "100%" === b.resistance && (D.positions.current > 0 && (!b.freeMode || b.freeModeFluid) && (D.positions.current = 0), D.positions.current < -e() && (!b.freeMode || b.freeModeFluid) && (D.positions.current = -e())), !b.followFinger)return;
                if (b.moveStartThreshold)if (Math.abs(D.touches.current - D.touches.start) > b.moveStartThreshold || X) {
                    if (!X)return X = !0, void(D.touches.start = D.touches.current);
                    D.setWrapperTranslate(D.positions.current)
                } else D.positions.current = D.positions.start; else D.setWrapperTranslate(D.positions.current);
                return (b.freeMode || b.watchActiveIndex) && D.updateActiveSlide(D.positions.current), b.grabCursor && (D.container.style.cursor = "move", D.container.style.cursor = "grabbing", D.container.style.cursor = "-moz-grabbin", D.container.style.cursor = "-webkit-grabbing"), Y || (Y = D.touches.current), Z || (Z = (new Date).getTime()), D.velocity = (D.touches.current - Y) / ((new Date).getTime() - Z) / 2, Math.abs(D.touches.current - Y) < 2 && (D.velocity = 0), Y = D.touches.current, Z = (new Date).getTime(), D.callPlugins("onTouchMoveEnd"), b.onTouchMove && D.fireCallback(b.onTouchMove, D, a), !1
            }
        }
    }

    function r(a) {
        if (I && D.swipeReset(), !b.onlyExternal && D.isTouched) {
            D.isTouched = !1, b.grabCursor && (D.container.style.cursor = "move", D.container.style.cursor = "grab", D.container.style.cursor = "-moz-grab", D.container.style.cursor = "-webkit-grab"), D.positions.current || 0 === D.positions.current || (D.positions.current = D.positions.start), b.followFinger && D.setWrapperTranslate(D.positions.current), D.times.end = (new Date).getTime(), D.touches.diff = D.touches.current - D.touches.start, D.touches.abs = Math.abs(D.touches.diff), D.positions.diff = D.positions.current - D.positions.start, D.positions.abs = Math.abs(D.positions.diff);
            var c = D.positions.diff, d = D.positions.abs, f = D.times.end - D.times.start;
            5 > d && 300 > f && D.allowLinks === !1 && (b.freeMode || 0 === d || D.swipeReset(), b.preventLinks && (D.allowLinks = !0), b.onSlideClick && (D.allowSlideClick = !0)), setTimeout(function () {
                "undefined" != typeof D && null !== D && (b.preventLinks && (D.allowLinks = !0), b.onSlideClick && (D.allowSlideClick = !0))
            }, 100);
            var g = e();
            if (!D.isMoved && b.freeMode)return D.isMoved = !1, b.onTouchEnd && D.fireCallback(b.onTouchEnd, D, a), void D.callPlugins("onTouchEnd");
            if (!D.isMoved || D.positions.current > 0 || D.positions.current < -g)return D.swipeReset(), b.onTouchEnd && D.fireCallback(b.onTouchEnd, D, a), void D.callPlugins("onTouchEnd");
            if (D.isMoved = !1, b.freeMode) {
                if (b.freeModeFluid) {
                    var h, i = 1e3 * b.momentumRatio, j = D.velocity * i, k = D.positions.current + j, l = !1, m = 20 * Math.abs(D.velocity) * b.momentumBounceRatio;
                    -g > k && (b.momentumBounce && D.support.transitions ? (-m > k + g && (k = -g - m), h = -g, l = !0, _ = !0) : k = -g), k > 0 && (b.momentumBounce && D.support.transitions ? (k > m && (k = m), h = 0, l = !0, _ = !0) : k = 0), 0 !== D.velocity && (i = Math.abs((k - D.positions.current) / D.velocity)), D.setWrapperTranslate(k), D.setWrapperTransition(i), b.momentumBounce && l && D.wrapperTransitionEnd(function () {
                        _ && (b.onMomentumBounce && D.fireCallback(b.onMomentumBounce, D), D.callPlugins("onMomentumBounce"), D.setWrapperTranslate(h), D.setWrapperTransition(300))
                    }), D.updateActiveSlide(k)
                }
                return (!b.freeModeFluid || f >= 300) && D.updateActiveSlide(D.positions.current), b.onTouchEnd && D.fireCallback(b.onTouchEnd, D, a), void D.callPlugins("onTouchEnd")
            }
            H = 0 > c ? "toNext" : "toPrev", "toNext" === H && 300 >= f && (30 > d || !b.shortSwipes ? D.swipeReset() : D.swipeNext(!0, !0)), "toPrev" === H && 300 >= f && (30 > d || !b.shortSwipes ? D.swipeReset() : D.swipePrev(!0, !0));
            var n = 0;
            if ("auto" === b.slidesPerView) {
                for (var o, p = Math.abs(D.getWrapperTranslate()), q = 0, r = 0; r < D.slides.length; r++)if (o = N ? D.slides[r].getWidth(!0, b.roundLengths) : D.slides[r].getHeight(!0, b.roundLengths), q += o, q > p) {
                    n = o;
                    break
                }
                n > J && (n = J)
            } else n = F * b.slidesPerView;
            "toNext" === H && f > 300 && (d >= n * b.longSwipesRatio ? D.swipeNext(!0, !0) : D.swipeReset()), "toPrev" === H && f > 300 && (d >= n * b.longSwipesRatio ? D.swipePrev(!0, !0) : D.swipeReset()), b.onTouchEnd && D.fireCallback(b.onTouchEnd, D, a), D.callPlugins("onTouchEnd")
        }
    }

    function s(a, b) {
        return a && a.getAttribute("class") && a.getAttribute("class").indexOf(b) > -1
    }

    function t(a) {
        var c = !1;
        do s(a, b.noSwipingClass) && (c = !0), a = a.parentElement; while (!c && a.parentElement && !s(a, b.wrapperClass));
        return !c && s(a, b.wrapperClass) && s(a, b.noSwipingClass) && (c = !0), c
    }

    function u(a, b) {
        var c, d = document.createElement("div");
        return d.innerHTML = b, c = d.firstChild, c.className += " " + a, c.outerHTML
    }

    function v(a, c, d) {
        function e() {
            var f = +new Date, l = f - g;
            h += i * l / (1e3 / 60), k = "toNext" === j ? h > a : a > h, k ? (D.setWrapperTranslate(Math.ceil(h)), D._DOMAnimating = !0, window.setTimeout(function () {
                e()
            }, 1e3 / 60)) : (b.onSlideChangeEnd && ("to" === c ? d.runCallbacks === !0 && D.fireCallback(b.onSlideChangeEnd, D, j) : D.fireCallback(b.onSlideChangeEnd, D, j)), D.setWrapperTranslate(a), D._DOMAnimating = !1)
        }

        var f = "to" === c && d.speed >= 0 ? d.speed : b.speed, g = +new Date;
        if (D.support.transitions || !b.DOMAnimation)D.setWrapperTranslate(a), D.setWrapperTransition(f); else {
            var h = D.getWrapperTranslate(), i = Math.ceil((a - h) / f * (1e3 / 60)), j = h > a ? "toNext" : "toPrev", k = "toNext" === j ? h > a : a > h;
            if (D._DOMAnimating)return;
            e()
        }
        D.updateActiveSlide(a), b.onSlideNext && "next" === c && d.runCallbacks === !0 && D.fireCallback(b.onSlideNext, D, a), b.onSlidePrev && "prev" === c && d.runCallbacks === !0 && D.fireCallback(b.onSlidePrev, D, a), b.onSlideReset && "reset" === c && d.runCallbacks === !0 && D.fireCallback(b.onSlideReset, D, a), "next" !== c && "prev" !== c && "to" !== c || d.runCallbacks !== !0 || w(c)
    }

    function w(a) {
        if (D.callPlugins("onSlideChangeStart"), b.onSlideChangeStart)if (b.queueStartCallbacks && D.support.transitions) {
            if (D._queueStartCallbacks)return;
            D._queueStartCallbacks = !0, D.fireCallback(b.onSlideChangeStart, D, a), D.wrapperTransitionEnd(function () {
                D._queueStartCallbacks = !1
            })
        } else D.fireCallback(b.onSlideChangeStart, D, a);
        if (b.onSlideChangeEnd)if (D.support.transitions)if (b.queueEndCallbacks) {
            if (D._queueEndCallbacks)return;
            D._queueEndCallbacks = !0, D.wrapperTransitionEnd(function (c) {
                D.fireCallback(b.onSlideChangeEnd, c, a)
            })
        } else D.wrapperTransitionEnd(function (c) {
            D.fireCallback(b.onSlideChangeEnd, c, a)
        }); else b.DOMAnimation || setTimeout(function () {
            D.fireCallback(b.onSlideChangeEnd, D, a)
        }, 10)
    }

    function x() {
        var a = D.paginationButtons;
        if (a)for (var b = 0; b < a.length; b++)D.h.removeEventListener(a[b], "click", z)
    }

    function y() {
        var a = D.paginationButtons;
        if (a)for (var b = 0; b < a.length; b++)D.h.addEventListener(a[b], "click", z)
    }

    function z(a) {
        for (var c, d = a.target || a.srcElement, e = D.paginationButtons, f = 0; f < e.length; f++)d === e[f] && (c = f);
        b.autoplay && D.stopAutoplay(!0), D.swipeTo(c)
    }

    function A() {
        ab = setTimeout(function () {
            b.loop ? (D.fixLoop(), D.swipeNext(!0, !0)) : D.swipeNext(!0, !0) || (b.autoplayStopOnLast ? (clearTimeout(ab), ab = void 0) : D.swipeTo(0)), D.wrapperTransitionEnd(function () {
                "undefined" != typeof ab && A()
            })
        }, b.autoplay)
    }

    function B() {
        D.calcSlides(), b.loader.slides.length > 0 && 0 === D.slides.length && D.loadSlides(), b.loop && D.createLoop(), D.init(), f(), b.pagination && D.createPagination(!0), b.loop || b.initialSlide > 0 ? D.swipeTo(b.initialSlide, 0, !1) : D.updateActiveSlide(0), b.autoplay && D.startAutoplay(), D.centerIndex = D.activeIndex, b.onSwiperCreated && D.fireCallback(b.onSwiperCreated, D), D.callPlugins("onSwiperCreated")
    }

    if (!document.body.outerHTML && document.body.__defineGetter__ && HTMLElement) {
        var C = HTMLElement.prototype;
        C.__defineGetter__ && C.__defineGetter__("outerHTML", function () {
            return (new XMLSerializer).serializeToString(this)
        })
    }
    if (window.getComputedStyle || (window.getComputedStyle = function (a) {
            return this.el = a, this.getPropertyValue = function (b) {
                var c = /(\-([a-z]){1})/g;
                return "float" === b && (b = "styleFloat"), c.test(b) && (b = b.replace(c, function () {
                    return arguments[2].toUpperCase()
                })), a.currentStyle[b] ? a.currentStyle[b] : null
            }, this
        }), Array.prototype.indexOf || (Array.prototype.indexOf = function (a, b) {
            for (var c = b || 0, d = this.length; d > c; c++)if (this[c] === a)return c;
            return -1
        }), (document.querySelectorAll || window.jQuery) && "undefined" != typeof a && (a.nodeType || 0 !== c(a).length)) {
        var D = this;
        D.touches = {
            start: 0,
            startX: 0,
            startY: 0,
            current: 0,
            currentX: 0,
            currentY: 0,
            diff: 0,
            abs: 0
        }, D.positions = {start: 0, abs: 0, diff: 0, current: 0}, D.times = {
            start: 0,
            end: 0
        }, D.id = (new Date).getTime(), D.container = a.nodeType ? a : c(a)[0], D.isTouched = !1, D.isMoved = !1, D.activeIndex = 0, D.centerIndex = 0, D.activeLoaderIndex = 0, D.activeLoopIndex = 0, D.previousIndex = null, D.velocity = 0, D.snapGrid = [], D.slidesGrid = [], D.imagesToLoad = [], D.imagesLoaded = 0, D.wrapperLeft = 0, D.wrapperRight = 0, D.wrapperTop = 0, D.wrapperBottom = 0, D.isAndroid = navigator.userAgent.toLowerCase().indexOf("android") >= 0;
        var E, F, G, H, I, J, K = {
            eventTarget: "wrapper",
            mode: "horizontal",
            touchRatio: 1,
            speed: 300,
            freeMode: !1,
            freeModeFluid: !1,
            momentumRatio: 1,
            momentumBounce: !0,
            momentumBounceRatio: 1,
            slidesPerView: 1,
            slidesPerGroup: 1,
            slidesPerViewFit: !0,
            simulateTouch: !0,
            followFinger: !0,
            shortSwipes: !0,
            longSwipesRatio: .5,
            moveStartThreshold: !1,
            onlyExternal: !1,
            createPagination: !0,
            pagination: !1,
            paginationElement: "span",
            paginationClickable: !1,
            paginationAsRange: !0,
            resistance: !0,
            scrollContainer: !1,
            preventLinks: !0,
            preventLinksPropagation: !1,
            noSwiping: !1,
            noSwipingClass: "swiper-no-swiping",
            initialSlide: 0,
            keyboardControl: !1,
            mousewheelControl: !1,
            mousewheelControlForceToAxis: !1,
            useCSS3Transforms: !0,
            autoplay: !1,
            autoplayDisableOnInteraction: !0,
            autoplayStopOnLast: !1,
            loop: !1,
            loopAdditionalSlides: 0,
            roundLengths: !1,
            calculateHeight: !1,
            cssWidthAndHeight: !1,
            updateOnImagesReady: !0,
            releaseFormElements: !0,
            watchActiveIndex: !1,
            visibilityFullFit: !1,
            offsetPxBefore: 0,
            offsetPxAfter: 0,
            offsetSlidesBefore: 0,
            offsetSlidesAfter: 0,
            centeredSlides: !1,
            queueStartCallbacks: !1,
            queueEndCallbacks: !1,
            autoResize: !0,
            resizeReInit: !1,
            DOMAnimation: !0,
            loader: {slides: [], slidesHTMLType: "inner", surroundGroups: 1, logic: "reload", loadAllSlides: !1},
            swipeToPrev: !0,
            swipeToNext: !0,
            slideElement: "div",
            slideClass: "swiper-slide",
            slideActiveClass: "swiper-slide-active",
            slideVisibleClass: "swiper-slide-visible",
            slideDuplicateClass: "swiper-slide-duplicate",
            wrapperClass: "swiper-wrapper",
            paginationElementClass: "swiper-pagination-switch",
            paginationActiveClass: "swiper-active-switch",
            paginationVisibleClass: "swiper-visible-switch"
        };
        b = b || {};
        for (var L in K)if (L in b && "object" == typeof b[L])for (var M in K[L])M in b[L] || (b[L][M] = K[L][M]); else L in b || (b[L] = K[L]);
        D.params = b, b.scrollContainer && (b.freeMode = !0, b.freeModeFluid = !0), b.loop && (b.resistance = "100%");
        var N = "horizontal" === b.mode, O = ["mousedown", "mousemove", "mouseup"];
        D.browser.ie10 && (O = ["MSPointerDown", "MSPointerMove", "MSPointerUp"]), D.browser.ie11 && (O = ["pointerdown", "pointermove", "pointerup"]), D.touchEvents = {
            touchStart: D.support.touch || !b.simulateTouch ? "touchstart" : O[0],
            touchMove: D.support.touch || !b.simulateTouch ? "touchmove" : O[1],
            touchEnd: D.support.touch || !b.simulateTouch ? "touchend" : O[2]
        };
        for (var P = D.container.childNodes.length - 1; P >= 0; P--)if (D.container.childNodes[P].className)for (var Q = D.container.childNodes[P].className.split(/\s+/), R = 0; R < Q.length; R++)Q[R] === b.wrapperClass && (E = D.container.childNodes[P]);
        D.wrapper = E, D._extendSwiperSlide = function (a) {
            return a.append = function () {
                return b.loop ? a.insertAfter(D.slides.length - D.loopedSlides) : (D.wrapper.appendChild(a), D.reInit()), a
            }, a.prepend = function () {
                return b.loop ? (D.wrapper.insertBefore(a, D.slides[D.loopedSlides]), D.removeLoopedSlides(), D.calcSlides(), D.createLoop()) : D.wrapper.insertBefore(a, D.wrapper.firstChild), D.reInit(), a
            }, a.insertAfter = function (c) {
                if ("undefined" == typeof c)return !1;
                var d;
                return b.loop ? (d = D.slides[c + 1 + D.loopedSlides], d ? D.wrapper.insertBefore(a, d) : D.wrapper.appendChild(a), D.removeLoopedSlides(), D.calcSlides(), D.createLoop()) : (d = D.slides[c + 1], D.wrapper.insertBefore(a, d)), D.reInit(), a
            }, a.clone = function () {
                return D._extendSwiperSlide(a.cloneNode(!0))
            }, a.remove = function () {
                D.wrapper.removeChild(a), D.reInit()
            }, a.html = function (b) {
                return "undefined" == typeof b ? a.innerHTML : (a.innerHTML = b, a)
            }, a.index = function () {
                for (var b, c = D.slides.length - 1; c >= 0; c--)a === D.slides[c] && (b = c);
                return b
            }, a.isActive = function () {
                return a.index() === D.activeIndex ? !0 : !1
            }, a.swiperSlideDataStorage || (a.swiperSlideDataStorage = {}), a.getData = function (b) {
                return a.swiperSlideDataStorage[b]
            }, a.setData = function (b, c) {
                return a.swiperSlideDataStorage[b] = c, a
            }, a.data = function (b, c) {
                return "undefined" == typeof c ? a.getAttribute("data-" + b) : (a.setAttribute("data-" + b, c), a)
            }, a.getWidth = function (b, c) {
                return D.h.getWidth(a, b, c)
            }, a.getHeight = function (b, c) {
                return D.h.getHeight(a, b, c)
            }, a.getOffset = function () {
                return D.h.getOffset(a)
            }, a
        }, D.calcSlides = function (a) {
            var c = D.slides ? D.slides.length : !1;
            D.slides = [], D.displaySlides = [];
            for (var d = 0; d < D.wrapper.childNodes.length; d++)if (D.wrapper.childNodes[d].className)for (var e = D.wrapper.childNodes[d].className, f = e.split(/\s+/), i = 0; i < f.length; i++)f[i] === b.slideClass && D.slides.push(D.wrapper.childNodes[d]);
            for (d = D.slides.length - 1; d >= 0; d--)D._extendSwiperSlide(D.slides[d]);
            c !== !1 && (c !== D.slides.length || a) && (h(), g(), D.updateActiveSlide(), D.params.pagination && D.createPagination(), D.callPlugins("numberOfSlidesChanged"))
        }, D.createSlide = function (a, c, d) {
            c = c || D.params.slideClass, d = d || b.slideElement;
            var e = document.createElement(d);
            return e.innerHTML = a || "", e.className = c, D._extendSwiperSlide(e)
        }, D.appendSlide = function (a, b, c) {
            return a ? a.nodeType ? D._extendSwiperSlide(a).append() : D.createSlide(a, b, c).append() : void 0
        }, D.prependSlide = function (a, b, c) {
            return a ? a.nodeType ? D._extendSwiperSlide(a).prepend() : D.createSlide(a, b, c).prepend() : void 0
        }, D.insertSlideAfter = function (a, b, c, d) {
            return "undefined" == typeof a ? !1 : b.nodeType ? D._extendSwiperSlide(b).insertAfter(a) : D.createSlide(b, c, d).insertAfter(a)
        }, D.removeSlide = function (a) {
            if (D.slides[a]) {
                if (b.loop) {
                    if (!D.slides[a + D.loopedSlides])return !1;
                    D.slides[a + D.loopedSlides].remove(), D.removeLoopedSlides(), D.calcSlides(), D.createLoop()
                } else D.slides[a].remove();
                return !0
            }
            return !1
        }, D.removeLastSlide = function () {
            return D.slides.length > 0 ? (b.loop ? (D.slides[D.slides.length - 1 - D.loopedSlides].remove(), D.removeLoopedSlides(), D.calcSlides(), D.createLoop()) : D.slides[D.slides.length - 1].remove(), !0) : !1
        }, D.removeAllSlides = function () {
            for (var a = D.slides.length, b = D.slides.length - 1; b >= 0; b--)D.slides[b].remove(), b === a - 1 && D.setWrapperTranslate(0)
        }, D.getSlide = function (a) {
            return D.slides[a]
        }, D.getLastSlide = function () {
            return D.slides[D.slides.length - 1]
        }, D.getFirstSlide = function () {
            return D.slides[0]
        }, D.activeSlide = function () {
            return D.slides[D.activeIndex]
        }, D.fireCallback = function () {
            var a = arguments[0];
            if ("[object Array]" === Object.prototype.toString.call(a))for (var c = 0; c < a.length; c++)"function" == typeof a[c] && a[c](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]); else"[object String]" === Object.prototype.toString.call(a) ? b["on" + a] && D.fireCallback(b["on" + a], arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]) : a(arguments[1], arguments[2], arguments[3], arguments[4], arguments[5])
        }, D.addCallback = function (a, b) {
            var c, e = this;
            return e.params["on" + a] ? d(this.params["on" + a]) ? this.params["on" + a].push(b) : "function" == typeof this.params["on" + a] ? (c = this.params["on" + a], this.params["on" + a] = [], this.params["on" + a].push(c), this.params["on" + a].push(b)) : void 0 : (this.params["on" + a] = [], this.params["on" + a].push(b))
        }, D.removeCallbacks = function (a) {
            D.params["on" + a] && (D.params["on" + a] = null)
        };
        var S = [];
        for (var T in D.plugins)if (b[T]) {
            var U = D.plugins[T](D, b[T]);
            U && S.push(U)
        }
        D.callPlugins = function (a, b) {
            b || (b = {});
            for (var c = 0; c < S.length; c++)a in S[c] && S[c][a](b)
        }, !D.browser.ie10 && !D.browser.ie11 || b.onlyExternal || D.wrapper.classList.add("swiper-wp8-" + (N ? "horizontal" : "vertical")), b.freeMode && (D.container.className += " swiper-free-mode"), D.initialized = !1, D.init = function (a, c) {
            var d = D.h.getWidth(D.container, !1, b.roundLengths), e = D.h.getHeight(D.container, !1, b.roundLengths);
            if (d !== D.width || e !== D.height || a) {
                D.width = d, D.height = e;
                var f, g, h, i, j, k, l;
                J = N ? d : e;
                var m = D.wrapper;
                if (a && D.calcSlides(c), "auto" === b.slidesPerView) {
                    var n = 0, o = 0;
                    b.slidesOffset > 0 && (m.style.paddingLeft = "", m.style.paddingRight = "", m.style.paddingTop = "", m.style.paddingBottom = ""), m.style.width = "", m.style.height = "", b.offsetPxBefore > 0 && (N ? D.wrapperLeft = b.offsetPxBefore : D.wrapperTop = b.offsetPxBefore), b.offsetPxAfter > 0 && (N ? D.wrapperRight = b.offsetPxAfter : D.wrapperBottom = b.offsetPxAfter), b.centeredSlides && (N ? (D.wrapperLeft = (J - this.slides[0].getWidth(!0, b.roundLengths)) / 2, D.wrapperRight = (J - D.slides[D.slides.length - 1].getWidth(!0, b.roundLengths)) / 2) : (D.wrapperTop = (J - D.slides[0].getHeight(!0, b.roundLengths)) / 2, D.wrapperBottom = (J - D.slides[D.slides.length - 1].getHeight(!0, b.roundLengths)) / 2)), N ? (D.wrapperLeft >= 0 && (m.style.paddingLeft = D.wrapperLeft + "px"), D.wrapperRight >= 0 && (m.style.paddingRight = D.wrapperRight + "px")) : (D.wrapperTop >= 0 && (m.style.paddingTop = D.wrapperTop + "px"), D.wrapperBottom >= 0 && (m.style.paddingBottom = D.wrapperBottom + "px")), k = 0;
                    var p = 0;
                    for (D.snapGrid = [], D.slidesGrid = [], h = 0, l = 0; l < D.slides.length; l++) {
                        f = D.slides[l].getWidth(!0, b.roundLengths), g = D.slides[l].getHeight(!0, b.roundLengths), b.calculateHeight && (h = Math.max(h, g));
                        var q = N ? f : g;
                        if (b.centeredSlides) {
                            var r = l === D.slides.length - 1 ? 0 : D.slides[l + 1].getWidth(!0, b.roundLengths), s = l === D.slides.length - 1 ? 0 : D.slides[l + 1].getHeight(!0, b.roundLengths), t = N ? r : s;
                            if (q > J) {
                                if (b.slidesPerViewFit)D.snapGrid.push(k + D.wrapperLeft), D.snapGrid.push(k + q - J + D.wrapperLeft); else for (var u = 0; u <= Math.floor(q / (J + D.wrapperLeft)); u++)D.snapGrid.push(0 === u ? k + D.wrapperLeft : k + D.wrapperLeft + J * u);
                                D.slidesGrid.push(k + D.wrapperLeft)
                            } else D.snapGrid.push(p), D.slidesGrid.push(p);
                            p += q / 2 + t / 2
                        } else {
                            if (q > J)if (b.slidesPerViewFit)D.snapGrid.push(k), D.snapGrid.push(k + q - J); else if (0 !== J)for (var v = 0; v <= Math.floor(q / J); v++)D.snapGrid.push(k + J * v); else D.snapGrid.push(k); else D.snapGrid.push(k);
                            D.slidesGrid.push(k)
                        }
                        k += q, n += f, o += g
                    }
                    b.calculateHeight && (D.height = h), N ? (G = n + D.wrapperRight + D.wrapperLeft, b.cssWidthAndHeight && "height" !== b.cssWidthAndHeight || (m.style.width = n + "px"), b.cssWidthAndHeight && "width" !== b.cssWidthAndHeight || (m.style.height = D.height + "px")) : (b.cssWidthAndHeight && "height" !== b.cssWidthAndHeight || (m.style.width = D.width + "px"), b.cssWidthAndHeight && "width" !== b.cssWidthAndHeight || (m.style.height = o + "px"), G = o + D.wrapperTop + D.wrapperBottom)
                } else if (b.scrollContainer)m.style.width = "", m.style.height = "", i = D.slides[0].getWidth(!0, b.roundLengths), j = D.slides[0].getHeight(!0, b.roundLengths), G = N ? i : j, m.style.width = i + "px", m.style.height = j + "px", F = N ? i : j; else {
                    if (b.calculateHeight) {
                        for (h = 0, j = 0, N || (D.container.style.height = ""), m.style.height = "", l = 0; l < D.slides.length; l++)D.slides[l].style.height = "", h = Math.max(D.slides[l].getHeight(!0), h), N || (j += D.slides[l].getHeight(!0));
                        g = h, D.height = g, N ? j = g : (J = g, D.container.style.height = J + "px")
                    } else g = N ? D.height : D.height / b.slidesPerView, b.roundLengths && (g = Math.ceil(g)), j = N ? D.height : D.slides.length * g;
                    for (f = N ? D.width / b.slidesPerView : D.width, b.roundLengths && (f = Math.ceil(f)), i = N ? D.slides.length * f : D.width, F = N ? f : g, b.offsetSlidesBefore > 0 && (N ? D.wrapperLeft = F * b.offsetSlidesBefore : D.wrapperTop = F * b.offsetSlidesBefore), b.offsetSlidesAfter > 0 && (N ? D.wrapperRight = F * b.offsetSlidesAfter : D.wrapperBottom = F * b.offsetSlidesAfter), b.offsetPxBefore > 0 && (N ? D.wrapperLeft = b.offsetPxBefore : D.wrapperTop = b.offsetPxBefore), b.offsetPxAfter > 0 && (N ? D.wrapperRight = b.offsetPxAfter : D.wrapperBottom = b.offsetPxAfter), b.centeredSlides && (N ? (D.wrapperLeft = (J - F) / 2, D.wrapperRight = (J - F) / 2) : (D.wrapperTop = (J - F) / 2, D.wrapperBottom = (J - F) / 2)), N ? (D.wrapperLeft > 0 && (m.style.paddingLeft = D.wrapperLeft + "px"), D.wrapperRight > 0 && (m.style.paddingRight = D.wrapperRight + "px")) : (D.wrapperTop > 0 && (m.style.paddingTop = D.wrapperTop + "px"), D.wrapperBottom > 0 && (m.style.paddingBottom = D.wrapperBottom + "px")), G = N ? i + D.wrapperRight + D.wrapperLeft : j + D.wrapperTop + D.wrapperBottom, parseFloat(i) > 0 && (!b.cssWidthAndHeight || "height" === b.cssWidthAndHeight) && (m.style.width = i + "px"), parseFloat(j) > 0 && (!b.cssWidthAndHeight || "width" === b.cssWidthAndHeight) && (m.style.height = j + "px"), k = 0, D.snapGrid = [], D.slidesGrid = [], l = 0; l < D.slides.length; l++)D.snapGrid.push(k), D.slidesGrid.push(k), k += F, parseFloat(f) > 0 && (!b.cssWidthAndHeight || "height" === b.cssWidthAndHeight) && (D.slides[l].style.width = f + "px"), parseFloat(g) > 0 && (!b.cssWidthAndHeight || "width" === b.cssWidthAndHeight) && (D.slides[l].style.height = g + "px")
                }
                D.initialized ? (D.callPlugins("onInit"), b.onInit && D.fireCallback(b.onInit, D)) : (D.callPlugins("onFirstInit"), b.onFirstInit && D.fireCallback(b.onFirstInit, D)), D.initialized = !0
            }
        }, D.reInit = function (a) {
            D.init(!0, a)
        }, D.resizeFix = function (a) {
            D.callPlugins("beforeResizeFix"), D.init(b.resizeReInit || a), b.freeMode ? D.getWrapperTranslate() < -e() && (D.setWrapperTransition(0), D.setWrapperTranslate(-e())) : (D.swipeTo(b.loop ? D.activeLoopIndex : D.activeIndex, 0, !1), b.autoplay && (D.support.transitions && "undefined" != typeof ab ? "undefined" != typeof ab && (clearTimeout(ab), ab = void 0, D.startAutoplay()) : "undefined" != typeof bb && (clearInterval(bb), bb = void 0, D.startAutoplay()))), D.callPlugins("afterResizeFix")
        }, D.destroy = function (a) {
            var c = D.h.removeEventListener, d = "wrapper" === b.eventTarget ? D.wrapper : D.container;
            if (D.browser.ie10 || D.browser.ie11 ? (c(d, D.touchEvents.touchStart, p), c(document, D.touchEvents.touchMove, q), c(document, D.touchEvents.touchEnd, r)) : (D.support.touch && (c(d, "touchstart", p), c(d, "touchmove", q), c(d, "touchend", r)), b.simulateTouch && (c(d, "mousedown", p), c(document, "mousemove", q), c(document, "mouseup", r))), b.autoResize && c(window, "resize", D.resizeFix), h(), b.paginationClickable && x(), b.mousewheelControl && D._wheelEvent && c(D.container, D._wheelEvent, j), b.keyboardControl && c(document, "keydown", i), b.autoplay && D.stopAutoplay(), a) {
                D.wrapper.removeAttribute("style");
                for (var e = 0; e < D.slides.length; e++)D.slides[e].removeAttribute("style")
            }
            D.callPlugins("onDestroy"), window.jQuery && window.jQuery(D.container).data("swiper") && window.jQuery(D.container).removeData("swiper"), window.Zepto && window.Zepto(D.container).data("swiper") && window.Zepto(D.container).removeData("swiper"), D = null
        }, D.disableKeyboardControl = function () {
            b.keyboardControl = !1, D.h.removeEventListener(document, "keydown", i)
        }, D.enableKeyboardControl = function () {
            b.keyboardControl = !0, D.h.addEventListener(document, "keydown", i)
        };
        var V = (new Date).getTime();
        if (D.disableMousewheelControl = function () {
                return D._wheelEvent ? (b.mousewheelControl = !1, D.h.removeEventListener(D.container, D._wheelEvent, j), !0) : !1
            }, D.enableMousewheelControl = function () {
                return D._wheelEvent ? (b.mousewheelControl = !0, D.h.addEventListener(D.container, D._wheelEvent, j), !0) : !1
            }, b.grabCursor) {
            var W = D.container.style;
            W.cursor = "move", W.cursor = "grab", W.cursor = "-moz-grab", W.cursor = "-webkit-grab"
        }
        D.allowSlideClick = !0, D.allowLinks = !0;
        var X, Y, Z, $ = !1, _ = !0;
        D.swipeNext = function (a, c) {
            "undefined" == typeof a && (a = !0), !c && b.loop && D.fixLoop(), !c && b.autoplay && D.stopAutoplay(!0), D.callPlugins("onSwipeNext");
            var d = D.getWrapperTranslate().toFixed(2), f = d;
            if ("auto" === b.slidesPerView) {
                for (var g = 0; g < D.snapGrid.length; g++)if (-d >= D.snapGrid[g].toFixed(2) && -d < D.snapGrid[g + 1].toFixed(2)) {
                    f = -D.snapGrid[g + 1];
                    break
                }
            } else {
                var h = F * b.slidesPerGroup;
                f = -(Math.floor(Math.abs(d) / Math.floor(h)) * h + h)
            }
            return f < -e() && (f = -e()), f === d ? !1 : (v(f, "next", {runCallbacks: a}), !0)
        }, D.swipePrev = function (a, c) {
            "undefined" == typeof a && (a = !0), !c && b.loop && D.fixLoop(), !c && b.autoplay && D.stopAutoplay(!0), D.callPlugins("onSwipePrev");
            var d, e = Math.ceil(D.getWrapperTranslate());
            if ("auto" === b.slidesPerView) {
                d = 0;
                for (var f = 1; f < D.snapGrid.length; f++) {
                    if (-e === D.snapGrid[f]) {
                        d = -D.snapGrid[f - 1];
                        break
                    }
                    if (-e > D.snapGrid[f] && -e < D.snapGrid[f + 1]) {
                        d = -D.snapGrid[f];
                        break
                    }
                }
            } else {
                var g = F * b.slidesPerGroup;
                d = -(Math.ceil(-e / g) - 1) * g
            }
            return d > 0 && (d = 0), d === e ? !1 : (v(d, "prev", {runCallbacks: a}), !0)
        }, D.swipeReset = function (a) {
            "undefined" == typeof a && (a = !0), D.callPlugins("onSwipeReset");
            {
                var c, d = D.getWrapperTranslate(), f = F * b.slidesPerGroup;
                -e()
            }
            if ("auto" === b.slidesPerView) {
                c = 0;
                for (var g = 0; g < D.snapGrid.length; g++) {
                    if (-d === D.snapGrid[g])return;
                    if (-d >= D.snapGrid[g] && -d < D.snapGrid[g + 1]) {
                        c = D.positions.diff > 0 ? -D.snapGrid[g + 1] : -D.snapGrid[g];
                        break
                    }
                }
                -d >= D.snapGrid[D.snapGrid.length - 1] && (c = -D.snapGrid[D.snapGrid.length - 1]), d <= -e() && (c = -e())
            } else c = 0 > d ? Math.round(d / f) * f : 0, d <= -e() && (c = -e());
            return b.scrollContainer && (c = 0 > d ? d : 0), c < -e() && (c = -e()), b.scrollContainer && J > F && (c = 0), c === d ? !1 : (v(c, "reset", {runCallbacks: a}), !0)
        }, D.swipeTo = function (a, c, d) {
            a = parseInt(a, 10), D.callPlugins("onSwipeTo", {index: a, speed: c}), b.loop && (a += D.loopedSlides);
            var f = D.getWrapperTranslate();
            if (!(a > D.slides.length - 1 || 0 > a)) {
                var g;
                return g = "auto" === b.slidesPerView ? -D.slidesGrid[a] : -a * F, g < -e() && (g = -e()), g === f ? !1 : ("undefined" == typeof d && (d = !0), v(g, "to", {
                    index: a,
                    speed: c,
                    runCallbacks: d
                }), !0)
            }
        }, D._queueStartCallbacks = !1, D._queueEndCallbacks = !1, D.updateActiveSlide = function (a) {
            if (D.initialized && 0 !== D.slides.length) {
                D.previousIndex = D.activeIndex, "undefined" == typeof a && (a = D.getWrapperTranslate()), a > 0 && (a = 0);
                var c;
                if ("auto" === b.slidesPerView) {
                    if (D.activeIndex = D.slidesGrid.indexOf(-a), D.activeIndex < 0) {
                        for (c = 0; c < D.slidesGrid.length - 1 && !(-a > D.slidesGrid[c] && -a < D.slidesGrid[c + 1]); c++);
                        var d = Math.abs(D.slidesGrid[c] + a), e = Math.abs(D.slidesGrid[c + 1] + a);
                        D.activeIndex = e >= d ? c : c + 1
                    }
                } else D.activeIndex = Math[b.visibilityFullFit ? "ceil" : "round"](-a / F);
                if (D.activeIndex === D.slides.length && (D.activeIndex = D.slides.length - 1), D.activeIndex < 0 && (D.activeIndex = 0), D.slides[D.activeIndex]) {
                    if (D.calcVisibleSlides(a), D.support.classList) {
                        var f;
                        for (c = 0; c < D.slides.length; c++)f = D.slides[c], f.classList.remove(b.slideActiveClass), D.visibleSlides.indexOf(f) >= 0 ? f.classList.add(b.slideVisibleClass) : f.classList.remove(b.slideVisibleClass);
                        D.slides[D.activeIndex].classList.add(b.slideActiveClass)
                    } else {
                        var g = new RegExp("\\s*" + b.slideActiveClass), h = new RegExp("\\s*" + b.slideVisibleClass);
                        for (c = 0; c < D.slides.length; c++)D.slides[c].className = D.slides[c].className.replace(g, "").replace(h, ""), D.visibleSlides.indexOf(D.slides[c]) >= 0 && (D.slides[c].className += " " + b.slideVisibleClass);
                        D.slides[D.activeIndex].className += " " + b.slideActiveClass
                    }
                    if (b.loop) {
                        var i = D.loopedSlides;
                        D.activeLoopIndex = D.activeIndex - i, D.activeLoopIndex >= D.slides.length - 2 * i && (D.activeLoopIndex = D.slides.length - 2 * i - D.activeLoopIndex), D.activeLoopIndex < 0 && (D.activeLoopIndex = D.slides.length - 2 * i + D.activeLoopIndex), D.activeLoopIndex < 0 && (D.activeLoopIndex = 0)
                    } else D.activeLoopIndex = D.activeIndex;
                    b.pagination && D.updatePagination(a)
                }
            }
        }, D.createPagination = function (a) {
            if (b.paginationClickable && D.paginationButtons && x(), D.paginationContainer = b.pagination.nodeType ? b.pagination : c(b.pagination)[0], b.createPagination) {
                var d = "", e = D.slides.length, f = e;
                b.loop && (f -= 2 * D.loopedSlides);
                for (var g = 0; f > g; g++)d += "<" + b.paginationElement + ' class="' + b.paginationElementClass + '"></' + b.paginationElement + ">";
                D.paginationContainer.innerHTML = d
            }
            D.paginationButtons = c("." + b.paginationElementClass, D.paginationContainer), a || D.updatePagination(), D.callPlugins("onCreatePagination"), b.paginationClickable && y()
        }, D.updatePagination = function (a) {
            if (b.pagination && !(D.slides.length < 1)) {
                var d = c("." + b.paginationActiveClass, D.paginationContainer);
                if (d) {
                    var e = D.paginationButtons;
                    if (0 !== e.length) {
                        for (var f = 0; f < e.length; f++)e[f].className = b.paginationElementClass;
                        var g = b.loop ? D.loopedSlides : 0;
                        if (b.paginationAsRange) {
                            D.visibleSlides || D.calcVisibleSlides(a);
                            var h, i = [];
                            for (h = 0; h < D.visibleSlides.length; h++) {
                                var j = D.slides.indexOf(D.visibleSlides[h]) - g;
                                b.loop && 0 > j && (j = D.slides.length - 2 * D.loopedSlides + j), b.loop && j >= D.slides.length - 2 * D.loopedSlides && (j = D.slides.length - 2 * D.loopedSlides - j, j = Math.abs(j)), i.push(j)
                            }
                            for (h = 0; h < i.length; h++)e[i[h]] && (e[i[h]].className += " " + b.paginationVisibleClass);
                            b.loop ? void 0 !== e[D.activeLoopIndex] && (e[D.activeLoopIndex].className += " " + b.paginationActiveClass) : e[D.activeIndex] && (e[D.activeIndex].className += " " + b.paginationActiveClass)
                        } else b.loop ? e[D.activeLoopIndex] && (e[D.activeLoopIndex].className += " " + b.paginationActiveClass + " " + b.paginationVisibleClass) : e[D.activeIndex] && (e[D.activeIndex].className += " " + b.paginationActiveClass + " " + b.paginationVisibleClass)
                    }
                }
            }
        }, D.calcVisibleSlides = function (a) {
            var c = [], d = 0, e = 0, f = 0;
            N && D.wrapperLeft > 0 && (a += D.wrapperLeft), !N && D.wrapperTop > 0 && (a += D.wrapperTop);
            for (var g = 0; g < D.slides.length; g++) {
                d += e, e = "auto" === b.slidesPerView ? N ? D.h.getWidth(D.slides[g], !0, b.roundLengths) : D.h.getHeight(D.slides[g], !0, b.roundLengths) : F, f = d + e;
                var h = !1;
                b.visibilityFullFit ? (d >= -a && -a + J >= f && (h = !0), -a >= d && f >= -a + J && (h = !0)) : (f > -a && -a + J >= f && (h = !0), d >= -a && -a + J > d && (h = !0), -a > d && f > -a + J && (h = !0)), h && c.push(D.slides[g])
            }
            0 === c.length && (c = [D.slides[D.activeIndex]]), D.visibleSlides = c
        };
        var ab, bb;
        D.startAutoplay = function () {
            if (D.support.transitions) {
                if ("undefined" != typeof ab)return !1;
                if (!b.autoplay)return;
                D.callPlugins("onAutoplayStart"), b.onAutoplayStart && D.fireCallback(b.onAutoplayStart, D), A()
            } else {
                if ("undefined" != typeof bb)return !1;
                if (!b.autoplay)return;
                D.callPlugins("onAutoplayStart"), b.onAutoplayStart && D.fireCallback(b.onAutoplayStart, D), bb = setInterval(function () {
                    b.loop ? (D.fixLoop(), D.swipeNext(!0, !0)) : D.swipeNext(!0, !0) || (b.autoplayStopOnLast ? (clearInterval(bb), bb = void 0) : D.swipeTo(0))
                }, b.autoplay)
            }
        }, D.stopAutoplay = function (a) {
            if (D.support.transitions) {
                if (!ab)return;
                ab && clearTimeout(ab), ab = void 0, a && !b.autoplayDisableOnInteraction && D.wrapperTransitionEnd(function () {
                    A()
                }), D.callPlugins("onAutoplayStop"), b.onAutoplayStop && D.fireCallback(b.onAutoplayStop, D)
            } else bb && clearInterval(bb), bb = void 0, D.callPlugins("onAutoplayStop"), b.onAutoplayStop && D.fireCallback(b.onAutoplayStop, D)
        }, D.loopCreated = !1, D.removeLoopedSlides = function () {
            if (D.loopCreated)for (var a = 0; a < D.slides.length; a++)D.slides[a].getData("looped") === !0 && D.wrapper.removeChild(D.slides[a])
        }, D.createLoop = function () {
            if (0 !== D.slides.length) {
                D.loopedSlides = "auto" === b.slidesPerView ? b.loopedSlides || 1 : b.slidesPerView + b.loopAdditionalSlides, D.loopedSlides > D.slides.length && (D.loopedSlides = D.slides.length);
                var a, c = "", d = "", e = "", f = D.slides.length, g = Math.floor(D.loopedSlides / f), h = D.loopedSlides % f;
                for (a = 0; g * f > a; a++) {
                    var i = a;
                    if (a >= f) {
                        var j = Math.floor(a / f);
                        i = a - f * j
                    }
                    e += D.slides[i].outerHTML
                }
                for (a = 0; h > a; a++)d += u(b.slideDuplicateClass, D.slides[a].outerHTML);
                for (a = f - h; f > a; a++)c += u(b.slideDuplicateClass, D.slides[a].outerHTML);
                var k = c + e + E.innerHTML + e + d;
                for (E.innerHTML = k, D.loopCreated = !0, D.calcSlides(), a = 0; a < D.slides.length; a++)(a < D.loopedSlides || a >= D.slides.length - D.loopedSlides) && D.slides[a].setData("looped", !0);
                D.callPlugins("onCreateLoop")
            }
        }, D.fixLoop = function () {
            var a;
            D.activeIndex < D.loopedSlides ? (a = D.slides.length - 3 * D.loopedSlides + D.activeIndex, D.swipeTo(a, 0, !1)) : ("auto" === b.slidesPerView && D.activeIndex >= 2 * D.loopedSlides || D.activeIndex > D.slides.length - 2 * b.slidesPerView) && (a = -D.slides.length + D.activeIndex + D.loopedSlides, D.swipeTo(a, 0, !1))
        }, D.loadSlides = function () {
            var a = "";
            D.activeLoaderIndex = 0;
            for (var c = b.loader.slides, d = b.loader.loadAllSlides ? c.length : b.slidesPerView * (1 + b.loader.surroundGroups), e = 0; d > e; e++)a += "outer" === b.loader.slidesHTMLType ? c[e] : "<" + b.slideElement + ' class="' + b.slideClass + '" data-swiperindex="' + e + '">' + c[e] + "</" + b.slideElement + ">";
            D.wrapper.innerHTML = a, D.calcSlides(!0), b.loader.loadAllSlides || D.wrapperTransitionEnd(D.reloadSlides, !0)
        }, D.reloadSlides = function () {
            var a = b.loader.slides, c = parseInt(D.activeSlide().data("swiperindex"), 10);
            if (!(0 > c || c > a.length - 1)) {
                D.activeLoaderIndex = c;
                var d = Math.max(0, c - b.slidesPerView * b.loader.surroundGroups), e = Math.min(c + b.slidesPerView * (1 + b.loader.surroundGroups) - 1, a.length - 1);
                if (c > 0) {
                    var f = -F * (c - d);
                    D.setWrapperTranslate(f), D.setWrapperTransition(0)
                }
                var g;
                if ("reload" === b.loader.logic) {
                    D.wrapper.innerHTML = "";
                    var h = "";
                    for (g = d; e >= g; g++)h += "outer" === b.loader.slidesHTMLType ? a[g] : "<" + b.slideElement + ' class="' + b.slideClass + '" data-swiperindex="' + g + '">' + a[g] + "</" + b.slideElement + ">";
                    D.wrapper.innerHTML = h
                } else {
                    var i = 1e3, j = 0;
                    for (g = 0; g < D.slides.length; g++) {
                        var k = D.slides[g].data("swiperindex");
                        d > k || k > e ? D.wrapper.removeChild(D.slides[g]) : (i = Math.min(k, i), j = Math.max(k, j))
                    }
                    for (g = d; e >= g; g++) {
                        var l;
                        i > g && (l = document.createElement(b.slideElement), l.className = b.slideClass, l.setAttribute("data-swiperindex", g), l.innerHTML = a[g], D.wrapper.insertBefore(l, D.wrapper.firstChild)), g > j && (l = document.createElement(b.slideElement), l.className = b.slideClass, l.setAttribute("data-swiperindex", g), l.innerHTML = a[g], D.wrapper.appendChild(l))
                    }
                }
                D.reInit(!0)
            }
        }, B()
    }
};
Swiper.prototype = {
    plugins: {}, wrapperTransitionEnd: function (a, b) {
        "use strict";
        function c(h) {
            if (h.target === f && (a(e), e.params.queueEndCallbacks && (e._queueEndCallbacks = !1), !b))for (d = 0; d < g.length; d++)e.h.removeEventListener(f, g[d], c)
        }

        var d, e = this, f = e.wrapper, g = ["webkitTransitionEnd", "transitionend", "oTransitionEnd", "MSTransitionEnd", "msTransitionEnd"];
        if (a)for (d = 0; d < g.length; d++)e.h.addEventListener(f, g[d], c)
    }, getWrapperTranslate: function (a) {
        "use strict";
        var b, c, d, e, f = this.wrapper;
        return "undefined" == typeof a && (a = "horizontal" === this.params.mode ? "x" : "y"), this.support.transforms && this.params.useCSS3Transforms ? (d = window.getComputedStyle(f, null), window.WebKitCSSMatrix ? e = new WebKitCSSMatrix("none" === d.webkitTransform ? "" : d.webkitTransform) : (e = d.MozTransform || d.OTransform || d.MsTransform || d.msTransform || d.transform || d.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,"), b = e.toString().split(",")), "x" === a && (c = window.WebKitCSSMatrix ? e.m41 : parseFloat(16 === b.length ? b[12] : b[4])), "y" === a && (c = window.WebKitCSSMatrix ? e.m42 : parseFloat(16 === b.length ? b[13] : b[5]))) : ("x" === a && (c = parseFloat(f.style.left, 10) || 0), "y" === a && (c = parseFloat(f.style.top, 10) || 0)), c || 0
    }, setWrapperTranslate: function (a, b, c) {
        "use strict";
        var d, e = this.wrapper.style, f = {x: 0, y: 0, z: 0};
        3 === arguments.length ? (f.x = a, f.y = b, f.z = c) : ("undefined" == typeof b && (b = "horizontal" === this.params.mode ? "x" : "y"), f[b] = a), this.support.transforms && this.params.useCSS3Transforms ? (d = this.support.transforms3d ? "translate3d(" + f.x + "px, " + f.y + "px, " + f.z + "px)" : "translate(" + f.x + "px, " + f.y + "px)", e.webkitTransform = e.MsTransform = e.msTransform = e.MozTransform = e.OTransform = e.transform = d) : (e.left = f.x + "px", e.top = f.y + "px"), this.callPlugins("onSetWrapperTransform", f), this.params.onSetWrapperTransform && this.fireCallback(this.params.onSetWrapperTransform, this, f)
    }, setWrapperTransition: function (a) {
        "use strict";
        var b = this.wrapper.style;
        b.webkitTransitionDuration = b.MsTransitionDuration = b.msTransitionDuration = b.MozTransitionDuration = b.OTransitionDuration = b.transitionDuration = a / 1e3 + "s", this.callPlugins("onSetWrapperTransition", {duration: a}), this.params.onSetWrapperTransition && this.fireCallback(this.params.onSetWrapperTransition, this, a)
    }, h: {
        getWidth: function (a, b, c) {
            "use strict";
            var d = window.getComputedStyle(a, null).getPropertyValue("width"), e = parseFloat(d);
            return (isNaN(e) || d.indexOf("%") > 0 || 0 > e) && (e = a.offsetWidth - parseFloat(window.getComputedStyle(a, null).getPropertyValue("padding-left")) - parseFloat(window.getComputedStyle(a, null).getPropertyValue("padding-right"))), b && (e += parseFloat(window.getComputedStyle(a, null).getPropertyValue("padding-left")) + parseFloat(window.getComputedStyle(a, null).getPropertyValue("padding-right"))), c ? Math.ceil(e) : e
        }, getHeight: function (a, b, c) {
            "use strict";
            if (b)return a.offsetHeight;
            var d = window.getComputedStyle(a, null).getPropertyValue("height"), e = parseFloat(d);
            return (isNaN(e) || d.indexOf("%") > 0 || 0 > e) && (e = a.offsetHeight - parseFloat(window.getComputedStyle(a, null).getPropertyValue("padding-top")) - parseFloat(window.getComputedStyle(a, null).getPropertyValue("padding-bottom"))), b && (e += parseFloat(window.getComputedStyle(a, null).getPropertyValue("padding-top")) + parseFloat(window.getComputedStyle(a, null).getPropertyValue("padding-bottom"))), c ? Math.ceil(e) : e
        }, getOffset: function (a) {
            "use strict";
            var b = a.getBoundingClientRect(), c = document.body, d = a.clientTop || c.clientTop || 0, e = a.clientLeft || c.clientLeft || 0, f = window.pageYOffset || a.scrollTop, g = window.pageXOffset || a.scrollLeft;
            return document.documentElement && !window.pageYOffset && (f = document.documentElement.scrollTop, g = document.documentElement.scrollLeft), {
                top: b.top + f - d,
                left: b.left + g - e
            }
        }, windowWidth: function () {
            "use strict";
            return window.innerWidth ? window.innerWidth : document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : void 0
        }, windowHeight: function () {
            "use strict";
            return window.innerHeight ? window.innerHeight : document.documentElement && document.documentElement.clientHeight ? document.documentElement.clientHeight : void 0
        }, windowScroll: function () {
            "use strict";
            return "undefined" != typeof pageYOffset ? {
                left: window.pageXOffset,
                top: window.pageYOffset
            } : document.documentElement ? {
                left: document.documentElement.scrollLeft,
                top: document.documentElement.scrollTop
            } : void 0
        }, addEventListener: function (a, b, c, d) {
            "use strict";
            "undefined" == typeof d && (d = !1), a.addEventListener ? a.addEventListener(b, c, d) : a.attachEvent && a.attachEvent("on" + b, c)
        }, removeEventListener: function (a, b, c, d) {
            "use strict";
            "undefined" == typeof d && (d = !1), a.removeEventListener ? a.removeEventListener(b, c, d) : a.detachEvent && a.detachEvent("on" + b, c)
        }
    }, setTransform: function (a, b) {
        "use strict";
        var c = a.style;
        c.webkitTransform = c.MsTransform = c.msTransform = c.MozTransform = c.OTransform = c.transform = b
    }, setTranslate: function (a, b) {
        "use strict";
        var c = a.style, d = {
            x: b.x || 0,
            y: b.y || 0,
            z: b.z || 0
        }, e = this.support.transforms3d ? "translate3d(" + d.x + "px," + d.y + "px," + d.z + "px)" : "translate(" + d.x + "px," + d.y + "px)";
        c.webkitTransform = c.MsTransform = c.msTransform = c.MozTransform = c.OTransform = c.transform = e, this.support.transforms || (c.left = d.x + "px", c.top = d.y + "px")
    }, setTransition: function (a, b) {
        "use strict";
        var c = a.style;
        c.webkitTransitionDuration = c.MsTransitionDuration = c.msTransitionDuration = c.MozTransitionDuration = c.OTransitionDuration = c.transitionDuration = b + "ms"
    }, support: {
        touch: window.Modernizr && Modernizr.touch === !0 || function () {
            "use strict";
            return !!("ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch)
        }(), transforms3d: window.Modernizr && Modernizr.csstransforms3d === !0 || function () {
            "use strict";
            var a = document.createElement("div").style;
            return "webkitPerspective" in a || "MozPerspective" in a || "OPerspective" in a || "MsPerspective" in a || "perspective" in a
        }(), transforms: window.Modernizr && Modernizr.csstransforms === !0 || function () {
            "use strict";
            var a = document.createElement("div").style;
            return "transform" in a || "WebkitTransform" in a || "MozTransform" in a || "msTransform" in a || "MsTransform" in a || "OTransform" in a
        }(), transitions: window.Modernizr && Modernizr.csstransitions === !0 || function () {
            "use strict";
            var a = document.createElement("div").style;
            return "transition" in a || "WebkitTransition" in a || "MozTransition" in a || "msTransition" in a || "MsTransition" in a || "OTransition" in a
        }(), classList: function () {
            "use strict";
            var a = document.createElement("div");
            return "classList" in a
        }()
    }, browser: {
        ie8: function () {
            "use strict";
            var a = -1;
            if ("Microsoft Internet Explorer" === navigator.appName) {
                var b = navigator.userAgent, c = new RegExp(/MSIE ([0-9]{1,}[\.0-9]{0,})/);
                null !== c.exec(b) && (a = parseFloat(RegExp.$1))
            }
            return -1 !== a && 9 > a
        }(), ie10: window.navigator.msPointerEnabled, ie11: window.navigator.pointerEnabled
    }
}, (window.jQuery || window.Zepto) && !function (a) {
    "use strict";
    a.fn.swiper = function (b) {
        var c;
        return this.each(function (d) {
            var e = a(this), f = new Swiper(e[0], b);
            d || (c = f), e.data("swiper", f)
        }), c
    }
}(window.jQuery || window.Zepto), "undefined" != typeof module && (module.exports = Swiper), "function" == typeof define && define.amd && define([], function () {
    "use strict";
    return Swiper
});

// Generated by CoffeeScript 1.3.3
(function () {
    var e, t;
    e = function () {
        function e(e, t) {
            var n, r;
            this.options = {
                target: "instafeed",
                get: "popular",
                resolution: "thumbnail",
                sortBy: "most-recent",
                links: !0,
                mock: !1,
                useHttp: !1
            };
            if (typeof e == "object")for (n in e)r = e[n], this.options[n] = r;
            this.context = t != null ? t : this, this.unique = this._genKey()
        }

        return e.prototype.hasNext = function () {
            return typeof this.context.nextUrl == "string" && this.context.nextUrl.length > 0
        }, e.prototype.next = function () {
            return this.hasNext() ? this.run(this.context.nextUrl) : !1
        }, e.prototype.run = function (t) {
            var n, r, i;
            if (typeof this.options.clientId != "string" && typeof this.options.accessToken != "string")throw new Error("Missing clientId or accessToken.");
            if (typeof this.options.accessToken != "string" && typeof this.options.clientId != "string")throw new Error("Missing clientId or accessToken.");
            return this.options.before != null && typeof this.options.before == "function" && this.options.before.call(this), typeof document != "undefined" && document !== null && (i = document.createElement("script"), i.id = "instafeed-fetcher", i.src = t || this._buildUrl(), n = document.getElementsByTagName("head"), n[0].appendChild(i), r = "instafeedCache" + this.unique, window[r] = new e(this.options, this), window[r].unique = this.unique), !0
        }, e.prototype.parse = function (e) {
            var t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, m, g, y, b, w, E, S;
            if (typeof e != "object") {
                if (this.options.error != null && typeof this.options.error == "function")return this.options.error.call(this, "Invalid JSON data"), !1;
                throw new Error("Invalid JSON response")
            }
            if (e.meta.code !== 200) {
                if (this.options.error != null && typeof this.options.error == "function")return this.options.error.call(this, e.meta.error_message), !1;
                throw new Error("Error from Instagram: " + e.meta.error_message)
            }
            if (e.data.length === 0) {
                if (this.options.error != null && typeof this.options.error == "function")return this.options.error.call(this, "No images were returned from Instagram"), !1;
                throw new Error("No images were returned from Instagram")
            }
            this.options.success != null && typeof this.options.success == "function" && this.options.success.call(this, e), this.context.nextUrl = "", e.pagination != null && (this.context.nextUrl = e.pagination.next_url);
            if (this.options.sortBy !== "most-recent") {
                this.options.sortBy === "random" ? d = ["", "random"] : d = this.options.sortBy.split("-"), p = d[0] === "least" ? !0 : !1;
                switch (d[1]) {
                    case"random":
                        e.data.sort(function () {
                            return .5 - Math.random()
                        });
                        break;
                    case"recent":
                        e.data = this._sortBy(e.data, "created_time", p);
                        break;
                    case"liked":
                        e.data = this._sortBy(e.data, "likes.count", p);
                        break;
                    case"commented":
                        e.data = this._sortBy(e.data, "comments.count", p);
                        break;
                    default:
                        throw new Error("Invalid option for sortBy: '" + this.options.sortBy + "'.")
                }
            }
            if (typeof document != "undefined" && document !== null && this.options.mock === !1) {
                a = e.data, this.options.limit != null && a.length > this.options.limit && (a = a.slice(0, this.options.limit + 1 || 9e9)), n = document.createDocumentFragment(), this.options.filter != null && typeof this.options.filter == "function" && (a = this._filter(a, this.options.filter));
                if (this.options.template != null && typeof this.options.template == "string") {
                    i = "", o = "", l = "", v = document.createElement("div");
                    for (m = 0, b = a.length; m < b; m++)s = a[m], u = s.images[this.options.resolution].url, this.options.useHttp || (u = u.replace("http://", "//")), o = this._makeTemplate(this.options.template, {
                        model: s,
                        id: s.id,
                        link: s.link,
                        image: u,
                        caption: this._getObjectProperty(s, "caption.text"),
                        likes: s.likes.count,
                        comments: s.comments.count,
                        location: this._getObjectProperty(s, "location.name")
                    }), i += o;
                    v.innerHTML = i, S = [].slice.call(v.childNodes);
                    for (g = 0, w = S.length; g < w; g++)h = S[g], n.appendChild(h)
                } else for (y = 0, E = a.length; y < E; y++)s = a[y], f = document.createElement("img"), f.src = s.images[this.options.resolution].url, this.options.links === !0 ? (t = document.createElement("a"), t.href = s.link, t.appendChild(f), n.appendChild(t)) : n.appendChild(f);
                document.getElementById(this.options.target).appendChild(n), r = document.getElementsByTagName("head")[0], r.removeChild(document.getElementById("instafeed-fetcher")), c = "instafeedCache" + this.unique, window[c] = void 0;
                try {
                    delete window[c]
                } catch (x) {
                }
            }
            return this.options.after != null && typeof this.options.after == "function" && this.options.after.call(this), !0
        }, e.prototype._buildUrl = function () {
            var e, t, n;
            e = "https://api.instagram.com/v1";
            switch (this.options.get) {
                case"popular":
                    t = "media/popular";
                    break;
                case"tagged":
                    if (typeof this.options.tagName != "string")throw new Error("No tag name specified. Use the 'tagName' option.");
                    t = "tags/" + this.options.tagName + "/media/recent";
                    break;
                case"location":
                    if (typeof this.options.locationId != "number")throw new Error("No location specified. Use the 'locationId' option.");
                    t = "locations/" + this.options.locationId + "/media/recent";
                    break;
                case"user":
                    if (typeof this.options.userId != "number")throw new Error("No user specified. Use the 'userId' option.");
                    if (typeof this.options.accessToken != "string")throw new Error("No access token. Use the 'accessToken' option.");
                    t = "users/" + this.options.userId + "/media/recent";
                    break;
                default:
                    throw new Error("Invalid option for get: '" + this.options.get + "'.")
            }
            return n = "" + e + "/" + t, this.options.accessToken != null ? n += "?access_token=" + this.options.accessToken : n += "?client_id=" + this.options.clientId, this.options.limit != null && (n += "&count=" + this.options.limit), n += "&callback=instafeedCache" + this.unique + ".parse", n
        }, e.prototype._genKey = function () {
            var e;
            return e = function () {
                return ((1 + Math.random()) * 65536 | 0).toString(16).substring(1)
            }, "" + e() + e() + e() + e()
        }, e.prototype._makeTemplate = function (e, t) {
            var n, r, i, s, o;
            r = /(?:\{{2})([\w\[\]\.]+)(?:\}{2})/, n = e;
            while (r.test(n))i = n.match(r)[1], s = (o = this._getObjectProperty(t, i)) != null ? o : "", n = n.replace(r, "" + s);
            return n
        }, e.prototype._getObjectProperty = function (e, t) {
            var n, r;
            t = t.replace(/\[(\w+)\]/g, ".$1"), r = t.split(".");
            while (r.length) {
                n = r.shift();
                if (!(e != null && n in e))return null;
                e = e[n]
            }
            return e
        }, e.prototype._sortBy = function (e, t, n) {
            var r;
            return r = function (e, r) {
                var i, s;
                return i = this._getObjectProperty(e, t), s = this._getObjectProperty(r, t), n ? i > s ? 1 : -1 : i < s ? 1 : -1
            }, e.sort(r.bind(this)), e
        }, e.prototype._filter = function (e, t) {
            var n, r, i, s, o;
            n = [], i = function (e) {
                if (t(e))return n.push(e)
            };
            for (s = 0, o = e.length; s < o; s++)r = e[s], i(r);
            return n
        }, e
    }(), t = typeof exports != "undefined" && exports !== null ? exports : window, t.Instafeed = e
}).call(this);

/*! fancyBox v2.1.5 fancyapps.com | fancyapps.com/fancybox/#license */
(function (r, G, f, v) {
    var J = f("html"), n = f(r), p = f(G), b = f.fancybox = function () {
        b.open.apply(this, arguments)
    }, I = navigator.userAgent.match(/msie/i), B = null, s = G.createTouch !== v, t = function (a) {
        return a && a.hasOwnProperty && a instanceof f
    }, q = function (a) {
        return a && "string" === f.type(a)
    }, E = function (a) {
        return q(a) && 0 < a.indexOf("%")
    }, l = function (a, d) {
        var e = parseInt(a, 10) || 0;
        d && E(a) && (e *= b.getViewport()[d] / 100);
        return Math.ceil(e)
    }, w = function (a, b) {
        return l(a, b) + "px"
    };
    f.extend(b, {
        version: "2.1.5",
        defaults: {
            padding: 15,
            margin: 20,
            width: 800,
            height: 600,
            minWidth: 100,
            minHeight: 100,
            maxWidth: 9999,
            maxHeight: 9999,
            pixelRatio: 1,
            autoSize: !0,
            autoHeight: !1,
            autoWidth: !1,
            autoResize: !0,
            autoCenter: !s,
            fitToView: !0,
            aspectRatio: !1,
            topRatio: 0.5,
            leftRatio: 0.5,
            scrolling: "auto",
            wrapCSS: "",
            arrows: !0,
            closeBtn: !0,
            closeClick: !1,
            nextClick: !1,
            mouseWheel: !0,
            autoPlay: !1,
            playSpeed: 3E3,
            preload: 3,
            modal: !1,
            loop: !0,
            ajax: {dataType: "html", headers: {"X-fancyBox": !0}},
            iframe: {scrolling: "auto", preload: !0},
            swf: {wmode: "transparent", allowfullscreen: "true", allowscriptaccess: "always"},
            keys: {
                next: {13: "left", 34: "up", 39: "left", 40: "up"},
                prev: {8: "right", 33: "down", 37: "right", 38: "down"},
                close: [27],
                play: [32],
                toggle: [70]
            },
            direction: {next: "left", prev: "right"},
            scrollOutside: !0,
            index: 0,
            type: null,
            href: null,
            content: null,
            title: null,
            tpl: {
                wrap: '<div class="fancybox-wrap" tabIndex="-1"><div class="fancybox-skin"><div class="fancybox-outer"><div class="fancybox-inner"></div></div></div></div>',
                image: '<img class="fancybox-image" src="{href}" alt="" />',
                iframe: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' +
                (I ? ' allowtransparency="true"' : "") + "></iframe>",
                error: '<p class="fancybox-error">The requested content cannot be loaded.<br/>Please try again later.</p>',
                closeBtn: '<a title="Close" class="fancybox-item fancybox-close" href="javascript:;"></a>',
                next: '<a title="Next" class="fancybox-nav fancybox-next" href="javascript:;"><span></span></a>',
                prev: '<a title="Previous" class="fancybox-nav fancybox-prev" href="javascript:;"><span></span></a>'
            },
            openEffect: "fade",
            openSpeed: 250,
            openEasing: "swing",
            openOpacity: !0,
            openMethod: "zoomIn",
            closeEffect: "fade",
            closeSpeed: 250,
            closeEasing: "swing",
            closeOpacity: !0,
            closeMethod: "zoomOut",
            nextEffect: "elastic",
            nextSpeed: 250,
            nextEasing: "swing",
            nextMethod: "changeIn",
            prevEffect: "elastic",
            prevSpeed: 250,
            prevEasing: "swing",
            prevMethod: "changeOut",
            helpers: {overlay: !0, title: !0},
            onCancel: f.noop,
            beforeLoad: f.noop,
            afterLoad: f.noop,
            beforeShow: f.noop,
            afterShow: f.noop,
            beforeChange: f.noop,
            beforeClose: f.noop,
            afterClose: f.noop
        },
        group: {},
        opts: {},
        previous: null,
        coming: null,
        current: null,
        isActive: !1,
        isOpen: !1,
        isOpened: !1,
        wrap: null,
        skin: null,
        outer: null,
        inner: null,
        player: {timer: null, isActive: !1},
        ajaxLoad: null,
        imgPreload: null,
        transitions: {},
        helpers: {},
        open: function (a, d) {
            if (a && (f.isPlainObject(d) || (d = {}), !1 !== b.close(!0)))return f.isArray(a) || (a = t(a) ? f(a).get() : [a]), f.each(a, function (e, c) {
                var k = {}, g, h, j, m, l;
                "object" === f.type(c) && (c.nodeType && (c = f(c)), t(c) ? (k = {
                    href: c.data("fancybox-href") || c.attr("href"),
                    title: c.data("fancybox-title") || c.attr("title"),
                    isDom: !0,
                    element: c
                }, f.metadata && f.extend(!0, k,
                    c.metadata())) : k = c);
                g = d.href || k.href || (q(c) ? c : null);
                h = d.title !== v ? d.title : k.title || "";
                m = (j = d.content || k.content) ? "html" : d.type || k.type;
                !m && k.isDom && (m = c.data("fancybox-type"), m || (m = (m = c.prop("class").match(/fancybox\.(\w+)/)) ? m[1] : null));
                q(g) && (m || (b.isImage(g) ? m = "image" : b.isSWF(g) ? m = "swf" : "#" === g.charAt(0) ? m = "inline" : q(c) && (m = "html", j = c)), "ajax" === m && (l = g.split(/\s+/, 2), g = l.shift(), l = l.shift()));
                j || ("inline" === m ? g ? j = f(q(g) ? g.replace(/.*(?=#[^\s]+$)/, "") : g) : k.isDom && (j = c) : "html" === m ? j = g : !m && (!g &&
                k.isDom) && (m = "inline", j = c));
                f.extend(k, {href: g, type: m, content: j, title: h, selector: l});
                a[e] = k
            }), b.opts = f.extend(!0, {}, b.defaults, d), d.keys !== v && (b.opts.keys = d.keys ? f.extend({}, b.defaults.keys, d.keys) : !1), b.group = a, b._start(b.opts.index)
        },
        cancel: function () {
            var a = b.coming;
            a && !1 !== b.trigger("onCancel") && (b.hideLoading(), b.ajaxLoad && b.ajaxLoad.abort(), b.ajaxLoad = null, b.imgPreload && (b.imgPreload.onload = b.imgPreload.onerror = null), a.wrap && a.wrap.stop(!0, !0).trigger("onReset").remove(), b.coming = null, b.current ||
            b._afterZoomOut(a))
        },
        close: function (a) {
            b.cancel();
            !1 !== b.trigger("beforeClose") && (b.unbindEvents(), b.isActive && (!b.isOpen || !0 === a ? (f(".fancybox-wrap").stop(!0).trigger("onReset").remove(), b._afterZoomOut()) : (b.isOpen = b.isOpened = !1, b.isClosing = !0, f(".fancybox-item, .fancybox-nav").remove(), b.wrap.stop(!0, !0).removeClass("fancybox-opened"), b.transitions[b.current.closeMethod]())))
        },
        play: function (a) {
            var d = function () {
                clearTimeout(b.player.timer)
            }, e = function () {
                d();
                b.current && b.player.isActive && (b.player.timer =
                    setTimeout(b.next, b.current.playSpeed))
            }, c = function () {
                d();
                p.unbind(".player");
                b.player.isActive = !1;
                b.trigger("onPlayEnd")
            };
            if (!0 === a || !b.player.isActive && !1 !== a) {
                if (b.current && (b.current.loop || b.current.index < b.group.length - 1))b.player.isActive = !0, p.bind({
                    "onCancel.player beforeClose.player": c,
                    "onUpdate.player": e,
                    "beforeLoad.player": d
                }), e(), b.trigger("onPlayStart")
            } else c()
        },
        next: function (a) {
            var d = b.current;
            d && (q(a) || (a = d.direction.next), b.jumpto(d.index + 1, a, "next"))
        },
        prev: function (a) {
            var d = b.current;
            d && (q(a) || (a = d.direction.prev), b.jumpto(d.index - 1, a, "prev"))
        },
        jumpto: function (a, d, e) {
            var c = b.current;
            c && (a = l(a), b.direction = d || c.direction[a >= c.index ? "next" : "prev"], b.router = e || "jumpto", c.loop && (0 > a && (a = c.group.length + a % c.group.length), a %= c.group.length), c.group[a] !== v && (b.cancel(), b._start(a)))
        },
        reposition: function (a, d) {
            var e = b.current, c = e ? e.wrap : null, k;
            c && (k = b._getPosition(d), a && "scroll" === a.type ? (delete k.position, c.stop(!0, !0).animate(k, 200)) : (c.css(k), e.pos = f.extend({}, e.dim, k)))
        },
        update: function (a) {
            var d =
                a && a.type, e = !d || "orientationchange" === d;
            e && (clearTimeout(B), B = null);
            b.isOpen && !B && (B = setTimeout(function () {
                var c = b.current;
                c && !b.isClosing && (b.wrap.removeClass("fancybox-tmp"), (e || "load" === d || "resize" === d && c.autoResize) && b._setDimension(), "scroll" === d && c.canShrink || b.reposition(a), b.trigger("onUpdate"), B = null)
            }, e && !s ? 0 : 300))
        },
        toggle: function (a) {
            b.isOpen && (b.current.fitToView = "boolean" === f.type(a) ? a : !b.current.fitToView, s && (b.wrap.removeAttr("style").addClass("fancybox-tmp"), b.trigger("onUpdate")),
                b.update())
        },
        hideLoading: function () {
            p.unbind(".loading");
            f("#fancybox-loading").remove()
        },
        showLoading: function () {
            var a, d;
            b.hideLoading();
            a = f('<div id="fancybox-loading"><div></div></div>').click(b.cancel).appendTo("body");
            p.bind("keydown.loading", function (a) {
                if (27 === (a.which || a.keyCode))a.preventDefault(), b.cancel()
            });
            b.defaults.fixed || (d = b.getViewport(), a.css({
                position: "absolute",
                top: 0.5 * d.h + d.y,
                left: 0.5 * d.w + d.x
            }))
        },
        getViewport: function () {
            var a = b.current && b.current.locked || !1, d = {
                x: n.scrollLeft(),
                y: n.scrollTop()
            };
            a ? (d.w = a[0].clientWidth, d.h = a[0].clientHeight) : (d.w = s && r.innerWidth ? r.innerWidth : n.width(), d.h = s && r.innerHeight ? r.innerHeight : n.height());
            return d
        },
        unbindEvents: function () {
            b.wrap && t(b.wrap) && b.wrap.unbind(".fb");
            p.unbind(".fb");
            n.unbind(".fb")
        },
        bindEvents: function () {
            var a = b.current, d;
            a && (n.bind("orientationchange.fb" + (s ? "" : " resize.fb") + (a.autoCenter && !a.locked ? " scroll.fb" : ""), b.update), (d = a.keys) && p.bind("keydown.fb", function (e) {
                var c = e.which || e.keyCode, k = e.target || e.srcElement;
                if (27 === c && b.coming)return !1;
                !e.ctrlKey && (!e.altKey && !e.shiftKey && !e.metaKey && (!k || !k.type && !f(k).is("[contenteditable]"))) && f.each(d, function (d, k) {
                    if (1 < a.group.length && k[c] !== v)return b[d](k[c]), e.preventDefault(), !1;
                    if (-1 < f.inArray(c, k))return b[d](), e.preventDefault(), !1
                })
            }), f.fn.mousewheel && a.mouseWheel && b.wrap.bind("mousewheel.fb", function (d, c, k, g) {
                for (var h = f(d.target || null), j = !1; h.length && !j && !h.is(".fancybox-skin") && !h.is(".fancybox-wrap");)j = h[0] && !(h[0].style.overflow && "hidden" === h[0].style.overflow) &&
                    (h[0].clientWidth && h[0].scrollWidth > h[0].clientWidth || h[0].clientHeight && h[0].scrollHeight > h[0].clientHeight), h = f(h).parent();
                if (0 !== c && !j && 1 < b.group.length && !a.canShrink) {
                    if (0 < g || 0 < k)b.prev(0 < g ? "down" : "left"); else if (0 > g || 0 > k)b.next(0 > g ? "up" : "right");
                    d.preventDefault()
                }
            }))
        },
        trigger: function (a, d) {
            var e, c = d || b.coming || b.current;
            if (c) {
                f.isFunction(c[a]) && (e = c[a].apply(c, Array.prototype.slice.call(arguments, 1)));
                if (!1 === e)return !1;
                c.helpers && f.each(c.helpers, function (d, e) {
                    if (e && b.helpers[d] && f.isFunction(b.helpers[d][a]))b.helpers[d][a](f.extend(!0,
                        {}, b.helpers[d].defaults, e), c)
                });
                p.trigger(a)
            }
        },
        isImage: function (a) {
            return q(a) && a.match(/(^data:image\/.*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg)((\?|#).*)?$)/i)
        },
        isSWF: function (a) {
            return q(a) && a.match(/\.(swf)((\?|#).*)?$/i)
        },
        _start: function (a) {
            var d = {}, e, c;
            a = l(a);
            e = b.group[a] || null;
            if (!e)return !1;
            d = f.extend(!0, {}, b.opts, e);
            e = d.margin;
            c = d.padding;
            "number" === f.type(e) && (d.margin = [e, e, e, e]);
            "number" === f.type(c) && (d.padding = [c, c, c, c]);
            d.modal && f.extend(!0, d, {
                closeBtn: !1, closeClick: !1, nextClick: !1, arrows: !1,
                mouseWheel: !1, keys: null, helpers: {overlay: {closeClick: !1}}
            });
            d.autoSize && (d.autoWidth = d.autoHeight = !0);
            "auto" === d.width && (d.autoWidth = !0);
            "auto" === d.height && (d.autoHeight = !0);
            d.group = b.group;
            d.index = a;
            b.coming = d;
            if (!1 === b.trigger("beforeLoad"))b.coming = null; else {
                c = d.type;
                e = d.href;
                if (!c)return b.coming = null, b.current && b.router && "jumpto" !== b.router ? (b.current.index = a, b[b.router](b.direction)) : !1;
                b.isActive = !0;
                if ("image" === c || "swf" === c)d.autoHeight = d.autoWidth = !1, d.scrolling = "visible";
                "image" === c && (d.aspectRatio = !0);
                "iframe" === c && s && (d.scrolling = "scroll");
                d.wrap = f(d.tpl.wrap).addClass("fancybox-" + (s ? "mobile" : "desktop") + " fancybox-type-" + c + " fancybox-tmp " + d.wrapCSS).appendTo(d.parent || "body");
                f.extend(d, {
                    skin: f(".fancybox-skin", d.wrap),
                    outer: f(".fancybox-outer", d.wrap),
                    inner: f(".fancybox-inner", d.wrap)
                });
                f.each(["Top", "Right", "Bottom", "Left"], function (a, b) {
                    d.skin.css("padding" + b, w(d.padding[a]))
                });
                b.trigger("onReady");
                if ("inline" === c || "html" === c) {
                    if (!d.content || !d.content.length)return b._error("content")
                } else if (!e)return b._error("href");
                "image" === c ? b._loadImage() : "ajax" === c ? b._loadAjax() : "iframe" === c ? b._loadIframe() : b._afterLoad()
            }
        },
        _error: function (a) {
            f.extend(b.coming, {
                type: "html",
                autoWidth: !0,
                autoHeight: !0,
                minWidth: 0,
                minHeight: 0,
                scrolling: "no",
                hasError: a,
                content: b.coming.tpl.error
            });
            b._afterLoad()
        },
        _loadImage: function () {
            var a = b.imgPreload = new Image;
            a.onload = function () {
                this.onload = this.onerror = null;
                b.coming.width = this.width / b.opts.pixelRatio;
                b.coming.height = this.height / b.opts.pixelRatio;
                b._afterLoad()
            };
            a.onerror = function () {
                this.onload =
                    this.onerror = null;
                b._error("image")
            };
            a.src = b.coming.href;
            !0 !== a.complete && b.showLoading()
        },
        _loadAjax: function () {
            var a = b.coming;
            b.showLoading();
            b.ajaxLoad = f.ajax(f.extend({}, a.ajax, {
                url: a.href, error: function (a, e) {
                    b.coming && "abort" !== e ? b._error("ajax", a) : b.hideLoading()
                }, success: function (d, e) {
                    "success" === e && (a.content = d, b._afterLoad())
                }
            }))
        },
        _loadIframe: function () {
            var a = b.coming, d = f(a.tpl.iframe.replace(/\{rnd\}/g, (new Date).getTime())).attr("scrolling", s ? "auto" : a.iframe.scrolling).attr("src", a.href);
            f(a.wrap).bind("onReset", function () {
                try {
                    f(this).find("iframe").hide().attr("src", "//about:blank").end().empty()
                } catch (a) {
                }
            });
            a.iframe.preload && (b.showLoading(), d.one("load", function () {
                f(this).data("ready", 1);
                s || f(this).bind("load.fb", b.update);
                f(this).parents(".fancybox-wrap").width("100%").removeClass("fancybox-tmp").show();
                b._afterLoad()
            }));
            a.content = d.appendTo(a.inner);
            a.iframe.preload || b._afterLoad()
        },
        _preloadImages: function () {
            var a = b.group, d = b.current, e = a.length, c = d.preload ? Math.min(d.preload,
                e - 1) : 0, f, g;
            for (g = 1; g <= c; g += 1)f = a[(d.index + g) % e], "image" === f.type && f.href && ((new Image).src = f.href)
        },
        _afterLoad: function () {
            var a = b.coming, d = b.current, e, c, k, g, h;
            b.hideLoading();
            if (a && !1 !== b.isActive)if (!1 === b.trigger("afterLoad", a, d))a.wrap.stop(!0).trigger("onReset").remove(), b.coming = null; else {
                d && (b.trigger("beforeChange", d), d.wrap.stop(!0).removeClass("fancybox-opened").find(".fancybox-item, .fancybox-nav").remove());
                b.unbindEvents();
                e = a.content;
                c = a.type;
                k = a.scrolling;
                f.extend(b, {
                    wrap: a.wrap, skin: a.skin,
                    outer: a.outer, inner: a.inner, current: a, previous: d
                });
                g = a.href;
                switch (c) {
                    case "inline":
                    case "ajax":
                    case "html":
                        a.selector ? e = f("<div>").html(e).find(a.selector) : t(e) && (e.data("fancybox-placeholder") || e.data("fancybox-placeholder", f('<div class="fancybox-placeholder"></div>').insertAfter(e).hide()), e = e.show().detach(), a.wrap.bind("onReset", function () {
                            f(this).find(e).length && e.hide().replaceAll(e.data("fancybox-placeholder")).data("fancybox-placeholder", !1)
                        }));
                        break;
                    case "image":
                        e = a.tpl.image.replace("{href}",
                            g);
                        break;
                    case "swf":
                        e = '<object id="fancybox-swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="100%" height="100%"><param name="movie" value="' + g + '"></param>', h = "", f.each(a.swf, function (a, b) {
                            e += '<param name="' + a + '" value="' + b + '"></param>';
                            h += " " + a + '="' + b + '"'
                        }), e += '<embed src="' + g + '" type="application/x-shockwave-flash" width="100%" height="100%"' + h + "></embed></object>"
                }
                (!t(e) || !e.parent().is(a.inner)) && a.inner.append(e);
                b.trigger("beforeShow");
                a.inner.css("overflow", "yes" === k ? "scroll" :
                    "no" === k ? "hidden" : k);
                b._setDimension();
                b.reposition();
                b.isOpen = !1;
                b.coming = null;
                b.bindEvents();
                if (b.isOpened) {
                    if (d.prevMethod)b.transitions[d.prevMethod]()
                } else f(".fancybox-wrap").not(a.wrap).stop(!0).trigger("onReset").remove();
                b.transitions[b.isOpened ? a.nextMethod : a.openMethod]();
                b._preloadImages()
            }
        },
        _setDimension: function () {
            var a = b.getViewport(), d = 0, e = !1, c = !1, e = b.wrap, k = b.skin, g = b.inner, h = b.current, c = h.width, j = h.height, m = h.minWidth, u = h.minHeight, n = h.maxWidth, p = h.maxHeight, s = h.scrolling, q = h.scrollOutside ?
                h.scrollbarWidth : 0, x = h.margin, y = l(x[1] + x[3]), r = l(x[0] + x[2]), v, z, t, C, A, F, B, D, H;
            e.add(k).add(g).width("auto").height("auto").removeClass("fancybox-tmp");
            x = l(k.outerWidth(!0) - k.width());
            v = l(k.outerHeight(!0) - k.height());
            z = y + x;
            t = r + v;
            C = E(c) ? (a.w - z) * l(c) / 100 : c;
            A = E(j) ? (a.h - t) * l(j) / 100 : j;
            if ("iframe" === h.type) {
                if (H = h.content, h.autoHeight && 1 === H.data("ready"))try {
                    H[0].contentWindow.document.location && (g.width(C).height(9999), F = H.contents().find("body"), q && F.css("overflow-x", "hidden"), A = F.outerHeight(!0))
                } catch (G) {
                }
            } else if (h.autoWidth ||
                h.autoHeight)g.addClass("fancybox-tmp"), h.autoWidth || g.width(C), h.autoHeight || g.height(A), h.autoWidth && (C = g.width()), h.autoHeight && (A = g.height()), g.removeClass("fancybox-tmp");
            c = l(C);
            j = l(A);
            D = C / A;
            m = l(E(m) ? l(m, "w") - z : m);
            n = l(E(n) ? l(n, "w") - z : n);
            u = l(E(u) ? l(u, "h") - t : u);
            p = l(E(p) ? l(p, "h") - t : p);
            F = n;
            B = p;
            h.fitToView && (n = Math.min(a.w - z, n), p = Math.min(a.h - t, p));
            z = a.w - y;
            r = a.h - r;
            h.aspectRatio ? (c > n && (c = n, j = l(c / D)), j > p && (j = p, c = l(j * D)), c < m && (c = m, j = l(c / D)), j < u && (j = u, c = l(j * D))) : (c = Math.max(m, Math.min(c, n)), h.autoHeight &&
            "iframe" !== h.type && (g.width(c), j = g.height()), j = Math.max(u, Math.min(j, p)));
            if (h.fitToView)if (g.width(c).height(j), e.width(c + x), a = e.width(), y = e.height(), h.aspectRatio)for (; (a > z || y > r) && (c > m && j > u) && !(19 < d++);)j = Math.max(u, Math.min(p, j - 10)), c = l(j * D), c < m && (c = m, j = l(c / D)), c > n && (c = n, j = l(c / D)), g.width(c).height(j), e.width(c + x), a = e.width(), y = e.height(); else c = Math.max(m, Math.min(c, c - (a - z))), j = Math.max(u, Math.min(j, j - (y - r)));
            q && ("auto" === s && j < A && c + x + q < z) && (c += q);
            g.width(c).height(j);
            e.width(c + x);
            a = e.width();
            y = e.height();
            e = (a > z || y > r) && c > m && j > u;
            c = h.aspectRatio ? c < F && j < B && c < C && j < A : (c < F || j < B) && (c < C || j < A);
            f.extend(h, {
                dim: {width: w(a), height: w(y)},
                origWidth: C,
                origHeight: A,
                canShrink: e,
                canExpand: c,
                wPadding: x,
                hPadding: v,
                wrapSpace: y - k.outerHeight(!0),
                skinSpace: k.height() - j
            });
            !H && (h.autoHeight && j > u && j < p && !c) && g.height("auto")
        },
        _getPosition: function (a) {
            var d = b.current, e = b.getViewport(), c = d.margin, f = b.wrap.width() + c[1] + c[3], g = b.wrap.height() + c[0] + c[2], c = {
                position: "absolute",
                top: c[0],
                left: c[3]
            };
            d.autoCenter && d.fixed && !a && g <= e.h && f <= e.w ? c.position = "fixed" : d.locked || (c.top += e.y, c.left += e.x);
            c.top = w(Math.max(c.top, c.top + (e.h - g) * d.topRatio));
            c.left = w(Math.max(c.left, c.left + (e.w - f) * d.leftRatio));
            return c
        },
        _afterZoomIn: function () {
            var a = b.current;
            a && (b.isOpen = b.isOpened = !0, b.wrap.css("overflow", "visible").addClass("fancybox-opened"), b.update(), (a.closeClick || a.nextClick && 1 < b.group.length) && b.inner.css("cursor", "pointer").bind("click.fb", function (d) {
                !f(d.target).is("a") && !f(d.target).parent().is("a") && (d.preventDefault(),
                    b[a.closeClick ? "close" : "next"]())
            }), a.closeBtn && f(a.tpl.closeBtn).appendTo(b.skin).bind("click.fb", function (a) {
                a.preventDefault();
                b.close()
            }), a.arrows && 1 < b.group.length && ((a.loop || 0 < a.index) && f(a.tpl.prev).appendTo(b.outer).bind("click.fb", b.prev), (a.loop || a.index < b.group.length - 1) && f(a.tpl.next).appendTo(b.outer).bind("click.fb", b.next)), b.trigger("afterShow"), !a.loop && a.index === a.group.length - 1 ? b.play(!1) : b.opts.autoPlay && !b.player.isActive && (b.opts.autoPlay = !1, b.play()))
        },
        _afterZoomOut: function (a) {
            a =
                a || b.current;
            f(".fancybox-wrap").trigger("onReset").remove();
            f.extend(b, {
                group: {},
                opts: {},
                router: !1,
                current: null,
                isActive: !1,
                isOpened: !1,
                isOpen: !1,
                isClosing: !1,
                wrap: null,
                skin: null,
                outer: null,
                inner: null
            });
            b.trigger("afterClose", a)
        }
    });
    b.transitions = {
        getOrigPosition: function () {
            var a = b.current, d = a.element, e = a.orig, c = {}, f = 50, g = 50, h = a.hPadding, j = a.wPadding, m = b.getViewport();
            !e && (a.isDom && d.is(":visible")) && (e = d.find("img:first"), e.length || (e = d));
            t(e) ? (c = e.offset(), e.is("img") && (f = e.outerWidth(), g = e.outerHeight())) :
                (c.top = m.y + (m.h - g) * a.topRatio, c.left = m.x + (m.w - f) * a.leftRatio);
            if ("fixed" === b.wrap.css("position") || a.locked)c.top -= m.y, c.left -= m.x;
            return c = {
                top: w(c.top - h * a.topRatio),
                left: w(c.left - j * a.leftRatio),
                width: w(f + j),
                height: w(g + h)
            }
        }, step: function (a, d) {
            var e, c, f = d.prop;
            c = b.current;
            var g = c.wrapSpace, h = c.skinSpace;
            if ("width" === f || "height" === f)e = d.end === d.start ? 1 : (a - d.start) / (d.end - d.start), b.isClosing && (e = 1 - e), c = "width" === f ? c.wPadding : c.hPadding, c = a - c, b.skin[f](l("width" === f ? c : c - g * e)), b.inner[f](l("width" ===
            f ? c : c - g * e - h * e))
        }, zoomIn: function () {
            var a = b.current, d = a.pos, e = a.openEffect, c = "elastic" === e, k = f.extend({opacity: 1}, d);
            delete k.position;
            c ? (d = this.getOrigPosition(), a.openOpacity && (d.opacity = 0.1)) : "fade" === e && (d.opacity = 0.1);
            b.wrap.css(d).animate(k, {
                duration: "none" === e ? 0 : a.openSpeed,
                easing: a.openEasing,
                step: c ? this.step : null,
                complete: b._afterZoomIn
            })
        }, zoomOut: function () {
            var a = b.current, d = a.closeEffect, e = "elastic" === d, c = {opacity: 0.1};
            e && (c = this.getOrigPosition(), a.closeOpacity && (c.opacity = 0.1));
            b.wrap.animate(c,
                {
                    duration: "none" === d ? 0 : a.closeSpeed,
                    easing: a.closeEasing,
                    step: e ? this.step : null,
                    complete: b._afterZoomOut
                })
        }, changeIn: function () {
            var a = b.current, d = a.nextEffect, e = a.pos, c = {opacity: 1}, f = b.direction, g;
            e.opacity = 0.1;
            "elastic" === d && (g = "down" === f || "up" === f ? "top" : "left", "down" === f || "right" === f ? (e[g] = w(l(e[g]) - 200), c[g] = "+=200px") : (e[g] = w(l(e[g]) + 200), c[g] = "-=200px"));
            "none" === d ? b._afterZoomIn() : b.wrap.css(e).animate(c, {
                duration: a.nextSpeed,
                easing: a.nextEasing,
                complete: b._afterZoomIn
            })
        }, changeOut: function () {
            var a =
                b.previous, d = a.prevEffect, e = {opacity: 0.1}, c = b.direction;
            "elastic" === d && (e["down" === c || "up" === c ? "top" : "left"] = ("up" === c || "left" === c ? "-" : "+") + "=200px");
            a.wrap.animate(e, {
                duration: "none" === d ? 0 : a.prevSpeed, easing: a.prevEasing, complete: function () {
                    f(this).trigger("onReset").remove()
                }
            })
        }
    };
    b.helpers.overlay = {
        defaults: {closeClick: !0, speedOut: 200, showEarly: !0, css: {}, locked: !s, fixed: !0},
        overlay: null,
        fixed: !1,
        el: f("html"),
        create: function (a) {
            a = f.extend({}, this.defaults, a);
            this.overlay && this.close();
            this.overlay =
                f('<div class="fancybox-overlay"></div>').appendTo(b.coming ? b.coming.parent : a.parent);
            this.fixed = !1;
            a.fixed && b.defaults.fixed && (this.overlay.addClass("fancybox-overlay-fixed"), this.fixed = !0)
        },
        open: function (a) {
            var d = this;
            a = f.extend({}, this.defaults, a);
            this.overlay ? this.overlay.unbind(".overlay").width("auto").height("auto") : this.create(a);
            this.fixed || (n.bind("resize.overlay", f.proxy(this.update, this)), this.update());
            a.closeClick && this.overlay.bind("click.overlay", function (a) {
                if (f(a.target).hasClass("fancybox-overlay"))return b.isActive ?
                    b.close() : d.close(), !1
            });
            this.overlay.css(a.css).show()
        },
        close: function () {
            var a, b;
            n.unbind("resize.overlay");
            this.el.hasClass("fancybox-lock") && (f(".fancybox-margin").removeClass("fancybox-margin"), a = n.scrollTop(), b = n.scrollLeft(), this.el.removeClass("fancybox-lock"), n.scrollTop(a).scrollLeft(b));
            f(".fancybox-overlay").remove().hide();
            f.extend(this, {overlay: null, fixed: !1})
        },
        update: function () {
            var a = "100%", b;
            this.overlay.width(a).height("100%");
            I ? (b = Math.max(G.documentElement.offsetWidth, G.body.offsetWidth),
            p.width() > b && (a = p.width())) : p.width() > n.width() && (a = p.width());
            this.overlay.width(a).height(p.height())
        },
        onReady: function (a, b) {
            var e = this.overlay;
            f(".fancybox-overlay").stop(!0, !0);
            e || this.create(a);
            a.locked && (this.fixed && b.fixed) && (e || (this.margin = p.height() > n.height() ? f("html").css("margin-right").replace("px", "") : !1), b.locked = this.overlay.append(b.wrap), b.fixed = !1);
            !0 === a.showEarly && this.beforeShow.apply(this, arguments)
        },
        beforeShow: function (a, b) {
            var e, c;
            b.locked && (!1 !== this.margin && (f("*").filter(function () {
                return "fixed" ===
                    f(this).css("position") && !f(this).hasClass("fancybox-overlay") && !f(this).hasClass("fancybox-wrap")
            }).addClass("fancybox-margin"), this.el.addClass("fancybox-margin")), e = n.scrollTop(), c = n.scrollLeft(), this.el.addClass("fancybox-lock"), n.scrollTop(e).scrollLeft(c));
            this.open(a)
        },
        onUpdate: function () {
            this.fixed || this.update()
        },
        afterClose: function (a) {
            this.overlay && !b.coming && this.overlay.fadeOut(a.speedOut, f.proxy(this.close, this))
        }
    };
    b.helpers.title = {
        defaults: {type: "float", position: "bottom"}, beforeShow: function (a) {
            var d =
                b.current, e = d.title, c = a.type;
            f.isFunction(e) && (e = e.call(d.element, d));
            if (q(e) && "" !== f.trim(e)) {
                d = f('<div class="fancybox-title fancybox-title-' + c + '-wrap">' + e + "</div>");
                switch (c) {
                    case "inside":
                        c = b.skin;
                        break;
                    case "outside":
                        c = b.wrap;
                        break;
                    case "over":
                        c = b.inner;
                        break;
                    default:
                        c = b.skin, d.appendTo("body"), I && d.width(d.width()), d.wrapInner('<span class="child"></span>'), b.current.margin[2] += Math.abs(l(d.css("margin-bottom")))
                }
                d["top" === a.position ? "prependTo" : "appendTo"](c)
            }
        }
    };
    f.fn.fancybox = function (a) {
        var d,
            e = f(this), c = this.selector || "", k = function (g) {
                var h = f(this).blur(), j = d, k, l;
                !g.ctrlKey && (!g.altKey && !g.shiftKey && !g.metaKey) && !h.is(".fancybox-wrap") && (k = a.groupAttr || "data-fancybox-group", l = h.attr(k), l || (k = "rel", l = h.get(0)[k]), l && ("" !== l && "nofollow" !== l) && (h = c.length ? f(c) : e, h = h.filter("[" + k + '="' + l + '"]'), j = h.index(this)), a.index = j, !1 !== b.open(h, a) && g.preventDefault())
            };
        a = a || {};
        d = a.index || 0;
        !c || !1 === a.live ? e.unbind("click.fb-start").bind("click.fb-start", k) : p.undelegate(c, "click.fb-start").delegate(c +
            ":not('.fancybox-item, .fancybox-nav')", "click.fb-start", k);
        this.filter("[data-fancybox-start=1]").trigger("click");
        return this
    };
    p.ready(function () {
        var a, d;
        f.scrollbarWidth === v && (f.scrollbarWidth = function () {
            var a = f('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo("body"), b = a.children(), b = b.innerWidth() - b.height(99).innerWidth();
            a.remove();
            return b
        });
        if (f.support.fixedPosition === v) {
            a = f.support;
            d = f('<div style="position:fixed;top:20px;"></div>').appendTo("body");
            var e = 20 ===
                d[0].offsetTop || 15 === d[0].offsetTop;
            d.remove();
            a.fixedPosition = e
        }
        f.extend(b.defaults, {scrollbarWidth: f.scrollbarWidth(), fixed: f.support.fixedPosition, parent: f("body")});
        a = f(r).width();
        J.addClass("fancybox-lock-test");
        d = f(r).width();
        J.removeClass("fancybox-lock-test");
        f("<style type='text/css'>.fancybox-margin{margin-right:" + (d - a) + "px;}</style>").appendTo("head")
    })
})(window, document, jQuery);

/*!
 * Media helper for fancyBox
 * version: 1.0.6 (Fri, 14 Jun 2013)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             media: true
 *         }
 *     });
 *
 * Set custom URL parameters:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             media: {
 *                 youtube : {
 *                     params : {
 *                         autoplay : 0
 *                     }
 *                 }
 *             }
 *         }
 *     });
 *
 * Or:
 *     $(".fancybox").fancybox({,
 *         helpers : {
 *             media: true
 *         },
 *         youtube : {
 *             autoplay: 0
 *         }
 *     });
 *
 *  Supports:
 *
 *      Youtube
 *          http://www.youtube.com/watch?v=opj24KnzrWo
 *          http://www.youtube.com/embed/opj24KnzrWo
 *          http://youtu.be/opj24KnzrWo
 *			http://www.youtube-nocookie.com/embed/opj24KnzrWo
 *      Vimeo
 *          http://vimeo.com/40648169
 *          http://vimeo.com/channels/staffpicks/38843628
 *          http://vimeo.com/groups/surrealism/videos/36516384
 *          http://player.vimeo.com/video/45074303
 *      Metacafe
 *          http://www.metacafe.com/watch/7635964/dr_seuss_the_lorax_movie_trailer/
 *          http://www.metacafe.com/watch/7635964/
 *      Dailymotion
 *          http://www.dailymotion.com/video/xoytqh_dr-seuss-the-lorax-premiere_people
 *      Twitvid
 *          http://twitvid.com/QY7MD
 *      Twitpic
 *          http://twitpic.com/7p93st
 *      Instagram
 *          http://instagr.am/p/IejkuUGxQn/
 *          http://instagram.com/p/IejkuUGxQn/
 *      Google maps
 *          http://maps.google.com/maps?q=Eiffel+Tower,+Avenue+Gustave+Eiffel,+Paris,+France&t=h&z=17
 *          http://maps.google.com/?ll=48.857995,2.294297&spn=0.007666,0.021136&t=m&z=16
 *          http://maps.google.com/?ll=48.859463,2.292626&spn=0.000965,0.002642&t=m&z=19&layer=c&cbll=48.859524,2.292532&panoid=YJ0lq28OOy3VT2IqIuVY0g&cbp=12,151.58,,0,-15.56
 */
(function ($) {
    "use strict";

    //Shortcut for fancyBox object
    var F = $.fancybox,
        format = function (url, rez, params) {
            params = params || '';

            if ($.type(params) === "object") {
                params = $.param(params, true);
            }

            $.each(rez, function (key, value) {
                url = url.replace('$' + key, value || '');
            });

            if (params.length) {
                url += ( url.indexOf('?') > 0 ? '&' : '?' ) + params;
            }

            return url;
        };

    //Add helper object
    F.helpers.media = {
        defaults: {
            youtube: {
                matcher: /(youtube\.com|youtu\.be|youtube-nocookie\.com)\/(watch\?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*)).*/i,
                params: {
                    autoplay: 1,
                    autohide: 1,
                    fs: 1,
                    rel: 0,
                    hd: 1,
                    wmode: 'opaque',
                    enablejsapi: 1
                },
                type: 'iframe',
                url: '//www.youtube.com/embed/$3'
            },
            vimeo: {
                matcher: /(?:vimeo(?:pro)?.com)\/(?:[^\d]+)?(\d+)(?:.*)/,
                params: {
                    autoplay: 1,
                    hd: 1,
                    show_title: 1,
                    show_byline: 1,
                    show_portrait: 0,
                    fullscreen: 1
                },
                type: 'iframe',
                url: '//player.vimeo.com/video/$1'
            },
            metacafe: {
                matcher: /metacafe.com\/(?:watch|fplayer)\/([\w\-]{1,10})/,
                params: {
                    autoPlay: 'yes'
                },
                type: 'swf',
                url: function (rez, params, obj) {
                    obj.swf.flashVars = 'playerVars=' + $.param(params, true);

                    return '//www.metacafe.com/fplayer/' + rez[1] + '/.swf';
                }
            },
            dailymotion: {
                matcher: /dailymotion.com\/video\/(.*)\/?(.*)/,
                params: {
                    additionalInfos: 0,
                    autoStart: 1
                },
                type: 'swf',
                url: '//www.dailymotion.com/swf/video/$1'
            },
            twitvid: {
                matcher: /twitvid\.com\/([a-zA-Z0-9_\-\?\=]+)/i,
                params: {
                    autoplay: 0
                },
                type: 'iframe',
                url: '//www.twitvid.com/embed.php?guid=$1'
            },
            twitpic: {
                matcher: /twitpic\.com\/(?!(?:place|photos|events)\/)([a-zA-Z0-9\?\=\-]+)/i,
                type: 'image',
                url: '//twitpic.com/show/full/$1/'
            },
            instagram: {
                matcher: /(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,
                type: 'image',
                url: '//$1/p/$2/media/?size=l'
            },
            google_maps: {
                matcher: /maps\.google\.([a-z]{2,3}(\.[a-z]{2})?)\/(\?ll=|maps\?)(.*)/i,
                type: 'iframe',
                url: function (rez) {
                    return '//maps.google.' + rez[1] + '/' + rez[3] + '' + rez[4] + '&output=' + (rez[4].indexOf('layer=c') > 0 ? 'svembed' : 'embed');
                }
            }
        },

        beforeLoad: function (opts, obj) {
            var url = obj.href || '',
                type = false,
                what,
                item,
                rez,
                params;

            for (what in opts) {
                if (opts.hasOwnProperty(what)) {
                    item = opts[what];
                    rez = url.match(item.matcher);

                    if (rez) {
                        type = item.type;
                        params = $.extend(true, {}, item.params, obj[what] || ($.isPlainObject(opts[what]) ? opts[what].params : null));

                        url = $.type(item.url) === "function" ? item.url.call(this, rez, params, obj) : format(item.url, rez, params);

                        break;
                    }
                }
            }

            if (type) {
                obj.href = url;
                obj.type = type;

                obj.autoHeight = false;
            }
        }
    };

}(jQuery));

/*!
 * Thumbnail helper for fancyBox
 * version: 1.0.7 (Mon, 01 Oct 2012)
 * @requires fancyBox v2.0 or later
 *
 * Usage:
 *     $(".fancybox").fancybox({
 *         helpers : {
 *             thumbs: {
 *                 width  : 50,
 *                 height : 50
 *             }
 *         }
 *     });
 *
 */
(function ($) {
    //Shortcut for fancyBox object
    var F = $.fancybox;

    //Add helper object
    F.helpers.thumbs = {
        defaults: {
            width: 300,       // thumbnail width
            height: 300,       // thumbnail height
            position: 'bottom', // 'top' or 'bottom'
            source: function (item) {  // function to obtain the URL of the thumbnail image
                var href;

                if (item.element) {
                    href = $(item.element).find('img').attr('src');
                }

                if (!href && item.type === 'image' && item.href) {
                    href = item.href;
                }

                return href;
            }
        },

        wrap: null,
        list: null,
        width: 0,

        init: function (opts, obj) {
            var that = this,
                list,
                thumbWidth = opts.width,
                thumbHeight = opts.height,
                thumbSource = opts.source;

            //Build list structure
            list = '';

            for (var n = 0; n < obj.group.length; n++) {
                list += '<li><a style="width:' + thumbWidth + 'px;height:' + thumbHeight + 'px;" href="javascript:jQuery.fancybox.jumpto(' + n + ');"></a></li>';
            }

            this.wrap = $('<div id="fancybox-thumbs"></div>').addClass(opts.position).appendTo('body');
            this.list = $('<ul>' + list + '</ul>').appendTo(this.wrap);

            //Load each thumbnail
            $.each(obj.group, function (i) {
                var href = thumbSource(obj.group[i]);

                if (!href) {
                    return;
                }

                $("<img />").load(function () {
                    var width = this.width,
                        height = this.height,
                        widthRatio, heightRatio, parent;

                    if (!that.list || !width || !height) {
                        return;
                    }

                    //Calculate thumbnail width/height and center it
                    widthRatio = width / thumbWidth;
                    heightRatio = height / thumbHeight;

                    parent = that.list.children().eq(i).find('a');

                    if (widthRatio >= 1 && heightRatio >= 1) {
                        if (widthRatio > heightRatio) {
                            width = Math.floor(width / heightRatio);
                            height = thumbHeight;

                        } else {
                            width = thumbWidth;
                            height = Math.floor(height / widthRatio);
                        }
                    }

                    $(this).css({
                        width: width,
                        height: height,
                        top: Math.floor(thumbHeight / 2 - height / 2),
                        left: Math.floor(thumbWidth / 2 - width / 2)
                    });

                    parent.width(thumbWidth).height(thumbHeight);

                    $(this).hide().appendTo(parent).fadeIn(300);

                }).attr('src', href);
            });

            //Set initial width
            this.width = this.list.children().eq(0).outerWidth(true);

            this.list.width(this.width * (obj.group.length + 1)).css('left', Math.floor($(window).width() * 0.5 - (obj.index * this.width + this.width * 0.5)));
        },

        beforeLoad: function (opts, obj) {
            //Remove self if gallery do not have at least two items
            if (obj.group.length < 2) {
                obj.helpers.thumbs = false;

                return;
            }

            //Increase bottom margin to give space for thumbs
            obj.margin[opts.position === 'top' ? 0 : 2] += ((opts.height) + 15);
        },

        afterShow: function (opts, obj) {
            //Check if exists and create or update list
            if (this.list) {
                this.onUpdate(opts, obj);

            } else {
                this.init(opts, obj);
            }

            //Set active element
            this.list.children().removeClass('active').eq(obj.index).addClass('active');
        },

        //Center list
        onUpdate: function (opts, obj) {
            if (this.list) {
                this.list.stop(true).animate({
                    'left': Math.floor($(window).width() * 0.5 - (obj.index * this.width + this.width * 0.5))
                }, 150);
            }
        },

        beforeClose: function () {
            if (this.wrap) {
                this.wrap.remove();
            }

            this.wrap = null;
            this.list = null;
            this.width = 0;
        }
    }

}(jQuery));

/*!
 * Isotope PACKAGED v2.0.0
 * Filter & sort magical layouts
 * http://isotope.metafizzy.co
 */

(function (t) {
    function e() {
    }

    function i(t) {
        function i(e) {
            e.prototype.option || (e.prototype.option = function (e) {
                t.isPlainObject(e) && (this.options = t.extend(!0, this.options, e))
            })
        }

        function n(e, i) {
            t.fn[e] = function (n) {
                if ("string" == typeof n) {
                    for (var s = o.call(arguments, 1), a = 0, u = this.length; u > a; a++) {
                        var p = this[a], h = t.data(p, e);
                        if (h)if (t.isFunction(h[n]) && "_" !== n.charAt(0)) {
                            var f = h[n].apply(h, s);
                            if (void 0 !== f)return f
                        } else r("no such method '" + n + "' for " + e + " instance"); else r("cannot call methods on " + e + " prior to initialization; " + "attempted to call '" + n + "'")
                    }
                    return this
                }
                return this.each(function () {
                    var o = t.data(this, e);
                    o ? (o.option(n), o._init()) : (o = new i(this, n), t.data(this, e, o))
                })
            }
        }

        if (t) {
            var r = "undefined" == typeof console ? e : function (t) {
                console.error(t)
            };
            return t.bridget = function (t, e) {
                i(e), n(t, e)
            }, t.bridget
        }
    }

    var o = Array.prototype.slice;
    "function" == typeof define && define.amd ? define("jquery-bridget/jquery.bridget", ["jquery"], i) : i(t.jQuery)
})(window), function (t) {
    function e(e) {
        var i = t.event;
        return i.target = i.target || i.srcElement || e, i
    }

    var i = document.documentElement, o = function () {
    };
    i.addEventListener ? o = function (t, e, i) {
        t.addEventListener(e, i, !1)
    } : i.attachEvent && (o = function (t, i, o) {
        t[i + o] = o.handleEvent ? function () {
            var i = e(t);
            o.handleEvent.call(o, i)
        } : function () {
            var i = e(t);
            o.call(t, i)
        }, t.attachEvent("on" + i, t[i + o])
    });
    var n = function () {
    };
    i.removeEventListener ? n = function (t, e, i) {
        t.removeEventListener(e, i, !1)
    } : i.detachEvent && (n = function (t, e, i) {
        t.detachEvent("on" + e, t[e + i]);
        try {
            delete t[e + i]
        } catch (o) {
            t[e + i] = void 0
        }
    });
    var r = {bind: o, unbind: n};
    "function" == typeof define && define.amd ? define("eventie/eventie", r) : "object" == typeof exports ? module.exports = r : t.eventie = r
}(this), function (t) {
    function e(t) {
        "function" == typeof t && (e.isReady ? t() : r.push(t))
    }

    function i(t) {
        var i = "readystatechange" === t.type && "complete" !== n.readyState;
        if (!e.isReady && !i) {
            e.isReady = !0;
            for (var o = 0, s = r.length; s > o; o++) {
                var a = r[o];
                a()
            }
        }
    }

    function o(o) {
        return o.bind(n, "DOMContentLoaded", i), o.bind(n, "readystatechange", i), o.bind(t, "load", i), e
    }

    var n = t.document, r = [];
    e.isReady = !1, "function" == typeof define && define.amd ? (e.isReady = "function" == typeof requirejs, define("doc-ready/doc-ready", ["eventie/eventie"], o)) : t.docReady = o(t.eventie)
}(this), function () {
    function t() {
    }

    function e(t, e) {
        for (var i = t.length; i--;)if (t[i].listener === e)return i;
        return -1
    }

    function i(t) {
        return function () {
            return this[t].apply(this, arguments)
        }
    }

    var o = t.prototype, n = this, r = n.EventEmitter;
    o.getListeners = function (t) {
        var e, i, o = this._getEvents();
        if (t instanceof RegExp) {
            e = {};
            for (i in o)o.hasOwnProperty(i) && t.test(i) && (e[i] = o[i])
        } else e = o[t] || (o[t] = []);
        return e
    }, o.flattenListeners = function (t) {
        var e, i = [];
        for (e = 0; t.length > e; e += 1)i.push(t[e].listener);
        return i
    }, o.getListenersAsObject = function (t) {
        var e, i = this.getListeners(t);
        return i instanceof Array && (e = {}, e[t] = i), e || i
    }, o.addListener = function (t, i) {
        var o, n = this.getListenersAsObject(t), r = "object" == typeof i;
        for (o in n)n.hasOwnProperty(o) && -1 === e(n[o], i) && n[o].push(r ? i : {listener: i, once: !1});
        return this
    }, o.on = i("addListener"), o.addOnceListener = function (t, e) {
        return this.addListener(t, {listener: e, once: !0})
    }, o.once = i("addOnceListener"), o.defineEvent = function (t) {
        return this.getListeners(t), this
    }, o.defineEvents = function (t) {
        for (var e = 0; t.length > e; e += 1)this.defineEvent(t[e]);
        return this
    }, o.removeListener = function (t, i) {
        var o, n, r = this.getListenersAsObject(t);
        for (n in r)r.hasOwnProperty(n) && (o = e(r[n], i), -1 !== o && r[n].splice(o, 1));
        return this
    }, o.off = i("removeListener"), o.addListeners = function (t, e) {
        return this.manipulateListeners(!1, t, e)
    }, o.removeListeners = function (t, e) {
        return this.manipulateListeners(!0, t, e)
    }, o.manipulateListeners = function (t, e, i) {
        var o, n, r = t ? this.removeListener : this.addListener, s = t ? this.removeListeners : this.addListeners;
        if ("object" != typeof e || e instanceof RegExp)for (o = i.length; o--;)r.call(this, e, i[o]); else for (o in e)e.hasOwnProperty(o) && (n = e[o]) && ("function" == typeof n ? r.call(this, o, n) : s.call(this, o, n));
        return this
    }, o.removeEvent = function (t) {
        var e, i = typeof t, o = this._getEvents();
        if ("string" === i)delete o[t]; else if (t instanceof RegExp)for (e in o)o.hasOwnProperty(e) && t.test(e) && delete o[e]; else delete this._events;
        return this
    }, o.removeAllListeners = i("removeEvent"), o.emitEvent = function (t, e) {
        var i, o, n, r, s = this.getListenersAsObject(t);
        for (n in s)if (s.hasOwnProperty(n))for (o = s[n].length; o--;)i = s[n][o], i.once === !0 && this.removeListener(t, i.listener), r = i.listener.apply(this, e || []), r === this._getOnceReturnValue() && this.removeListener(t, i.listener);
        return this
    }, o.trigger = i("emitEvent"), o.emit = function (t) {
        var e = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(t, e)
    }, o.setOnceReturnValue = function (t) {
        return this._onceReturnValue = t, this
    }, o._getOnceReturnValue = function () {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
    }, o._getEvents = function () {
        return this._events || (this._events = {})
    }, t.noConflict = function () {
        return n.EventEmitter = r, t
    }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function () {
        return t
    }) : "object" == typeof module && module.exports ? module.exports = t : this.EventEmitter = t
}.call(this), function (t) {
    function e(t) {
        if (t) {
            if ("string" == typeof o[t])return t;
            t = t.charAt(0).toUpperCase() + t.slice(1);
            for (var e, n = 0, r = i.length; r > n; n++)if (e = i[n] + t, "string" == typeof o[e])return e
        }
    }

    var i = "Webkit Moz ms Ms O".split(" "), o = document.documentElement.style;
    "function" == typeof define && define.amd ? define("get-style-property/get-style-property", [], function () {
        return e
    }) : "object" == typeof exports ? module.exports = e : t.getStyleProperty = e
}(window), function (t) {
    function e(t) {
        var e = parseFloat(t), i = -1 === t.indexOf("%") && !isNaN(e);
        return i && e
    }

    function i() {
        for (var t = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0
        }, e = 0, i = s.length; i > e; e++) {
            var o = s[e];
            t[o] = 0
        }
        return t
    }

    function o(t) {
        function o(t) {
            if ("string" == typeof t && (t = document.querySelector(t)), t && "object" == typeof t && t.nodeType) {
                var o = r(t);
                if ("none" === o.display)return i();
                var n = {};
                n.width = t.offsetWidth, n.height = t.offsetHeight;
                for (var h = n.isBorderBox = !(!p || !o[p] || "border-box" !== o[p]), f = 0, c = s.length; c > f; f++) {
                    var d = s[f], l = o[d];
                    l = a(t, l);
                    var y = parseFloat(l);
                    n[d] = isNaN(y) ? 0 : y
                }
                var m = n.paddingLeft + n.paddingRight, g = n.paddingTop + n.paddingBottom, v = n.marginLeft + n.marginRight, _ = n.marginTop + n.marginBottom, I = n.borderLeftWidth + n.borderRightWidth, L = n.borderTopWidth + n.borderBottomWidth, z = h && u, S = e(o.width);
                S !== !1 && (n.width = S + (z ? 0 : m + I));
                var b = e(o.height);
                return b !== !1 && (n.height = b + (z ? 0 : g + L)), n.innerWidth = n.width - (m + I), n.innerHeight = n.height - (g + L), n.outerWidth = n.width + v, n.outerHeight = n.height + _, n
            }
        }

        function a(t, e) {
            if (n || -1 === e.indexOf("%"))return e;
            var i = t.style, o = i.left, r = t.runtimeStyle, s = r && r.left;
            return s && (r.left = t.currentStyle.left), i.left = e, e = i.pixelLeft, i.left = o, s && (r.left = s), e
        }

        var u, p = t("boxSizing");
        return function () {
            if (p) {
                var t = document.createElement("div");
                t.style.width = "200px", t.style.padding = "1px 2px 3px 4px", t.style.borderStyle = "solid", t.style.borderWidth = "1px 2px 3px 4px", t.style[p] = "border-box";
                var i = document.body || document.documentElement;
                i.appendChild(t);
                var o = r(t);
                u = 200 === e(o.width), i.removeChild(t)
            }
        }(), o
    }

    var n = t.getComputedStyle, r = n ? function (t) {
        return n(t, null)
    } : function (t) {
        return t.currentStyle
    }, s = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"];
    "function" == typeof define && define.amd ? define("get-size/get-size", ["get-style-property/get-style-property"], o) : "object" == typeof exports ? module.exports = o(require("get-style-property")) : t.getSize = o(t.getStyleProperty)
}(window), function (t, e) {
    function i(t, e) {
        return t[a](e)
    }

    function o(t) {
        if (!t.parentNode) {
            var e = document.createDocumentFragment();
            e.appendChild(t)
        }
    }

    function n(t, e) {
        o(t);
        for (var i = t.parentNode.querySelectorAll(e), n = 0, r = i.length; r > n; n++)if (i[n] === t)return !0;
        return !1
    }

    function r(t, e) {
        return o(t), i(t, e)
    }

    var s, a = function () {
        if (e.matchesSelector)return "matchesSelector";
        for (var t = ["webkit", "moz", "ms", "o"], i = 0, o = t.length; o > i; i++) {
            var n = t[i], r = n + "MatchesSelector";
            if (e[r])return r
        }
    }();
    if (a) {
        var u = document.createElement("div"), p = i(u, "div");
        s = p ? i : r
    } else s = n;
    "function" == typeof define && define.amd ? define("matches-selector/matches-selector", [], function () {
        return s
    }) : window.matchesSelector = s
}(this, Element.prototype), function (t) {
    function e(t, e) {
        for (var i in e)t[i] = e[i];
        return t
    }

    function i(t) {
        for (var e in t)return !1;
        return e = null, !0
    }

    function o(t) {
        return t.replace(/([A-Z])/g, function (t) {
            return "-" + t.toLowerCase()
        })
    }

    function n(t, n, r) {
        function a(t, e) {
            t && (this.element = t, this.layout = e, this.position = {x: 0, y: 0}, this._create())
        }

        var u = r("transition"), p = r("transform"), h = u && p, f = !!r("perspective"), c = {
            WebkitTransition: "webkitTransitionEnd",
            MozTransition: "transitionend",
            OTransition: "otransitionend",
            transition: "transitionend"
        }[u], d = ["transform", "transition", "transitionDuration", "transitionProperty"], l = function () {
            for (var t = {}, e = 0, i = d.length; i > e; e++) {
                var o = d[e], n = r(o);
                n && n !== o && (t[o] = n)
            }
            return t
        }();
        e(a.prototype, t.prototype), a.prototype._create = function () {
            this._transn = {ingProperties: {}, clean: {}, onEnd: {}}, this.css({position: "absolute"})
        }, a.prototype.handleEvent = function (t) {
            var e = "on" + t.type;
            this[e] && this[e](t)
        }, a.prototype.getSize = function () {
            this.size = n(this.element)
        }, a.prototype.css = function (t) {
            var e = this.element.style;
            for (var i in t) {
                var o = l[i] || i;
                e[o] = t[i]
            }
        }, a.prototype.getPosition = function () {
            var t = s(this.element), e = this.layout.options, i = e.isOriginLeft, o = e.isOriginTop, n = parseInt(t[i ? "left" : "right"], 10), r = parseInt(t[o ? "top" : "bottom"], 10);
            n = isNaN(n) ? 0 : n, r = isNaN(r) ? 0 : r;
            var a = this.layout.size;
            n -= i ? a.paddingLeft : a.paddingRight, r -= o ? a.paddingTop : a.paddingBottom, this.position.x = n, this.position.y = r
        }, a.prototype.layoutPosition = function () {
            var t = this.layout.size, e = this.layout.options, i = {};
            e.isOriginLeft ? (i.left = this.position.x + t.paddingLeft + "px", i.right = "") : (i.right = this.position.x + t.paddingRight + "px", i.left = ""), e.isOriginTop ? (i.top = this.position.y + t.paddingTop + "px", i.bottom = "") : (i.bottom = this.position.y + t.paddingBottom + "px", i.top = ""), this.css(i), this.emitEvent("layout", [this])
        };
        var y = f ? function (t, e) {
            return "translate3d(" + t + "px, " + e + "px, 0)"
        } : function (t, e) {
            return "translate(" + t + "px, " + e + "px)"
        };
        a.prototype._transitionTo = function (t, e) {
            this.getPosition();
            var i = this.position.x, o = this.position.y, n = parseInt(t, 10), r = parseInt(e, 10), s = n === this.position.x && r === this.position.y;
            if (this.setPosition(t, e), s && !this.isTransitioning)return this.layoutPosition(), void 0;
            var a = t - i, u = e - o, p = {}, h = this.layout.options;
            a = h.isOriginLeft ? a : -a, u = h.isOriginTop ? u : -u, p.transform = y(a, u), this.transition({
                to: p,
                onTransitionEnd: {transform: this.layoutPosition},
                isCleaning: !0
            })
        }, a.prototype.goTo = function (t, e) {
            this.setPosition(t, e), this.layoutPosition()
        }, a.prototype.moveTo = h ? a.prototype._transitionTo : a.prototype.goTo, a.prototype.setPosition = function (t, e) {
            this.position.x = parseInt(t, 10), this.position.y = parseInt(e, 10)
        }, a.prototype._nonTransition = function (t) {
            this.css(t.to), t.isCleaning && this._removeStyles(t.to);
            for (var e in t.onTransitionEnd)t.onTransitionEnd[e].call(this)
        }, a.prototype._transition = function (t) {
            if (!parseFloat(this.layout.options.transitionDuration))return this._nonTransition(t), void 0;
            var e = this._transn;
            for (var i in t.onTransitionEnd)e.onEnd[i] = t.onTransitionEnd[i];
            for (i in t.to)e.ingProperties[i] = !0, t.isCleaning && (e.clean[i] = !0);
            if (t.from) {
                this.css(t.from);
                var o = this.element.offsetHeight;
                o = null
            }
            this.enableTransition(t.to), this.css(t.to), this.isTransitioning = !0
        };
        var m = p && o(p) + ",opacity";
        a.prototype.enableTransition = function () {
            this.isTransitioning || (this.css({
                transitionProperty: m,
                transitionDuration: this.layout.options.transitionDuration
            }), this.element.addEventListener(c, this, !1))
        }, a.prototype.transition = a.prototype[u ? "_transition" : "_nonTransition"], a.prototype.onwebkitTransitionEnd = function (t) {
            this.ontransitionend(t)
        }, a.prototype.onotransitionend = function (t) {
            this.ontransitionend(t)
        };
        var g = {"-webkit-transform": "transform", "-moz-transform": "transform", "-o-transform": "transform"};
        a.prototype.ontransitionend = function (t) {
            if (t.target === this.element) {
                var e = this._transn, o = g[t.propertyName] || t.propertyName;
                if (delete e.ingProperties[o], i(e.ingProperties) && this.disableTransition(), o in e.clean && (this.element.style[t.propertyName] = "", delete e.clean[o]), o in e.onEnd) {
                    var n = e.onEnd[o];
                    n.call(this), delete e.onEnd[o]
                }
                this.emitEvent("transitionEnd", [this])
            }
        }, a.prototype.disableTransition = function () {
            this.removeTransitionStyles(), this.element.removeEventListener(c, this, !1), this.isTransitioning = !1
        }, a.prototype._removeStyles = function (t) {
            var e = {};
            for (var i in t)e[i] = "";
            this.css(e)
        };
        var v = {transitionProperty: "", transitionDuration: ""};
        return a.prototype.removeTransitionStyles = function () {
            this.css(v)
        }, a.prototype.removeElem = function () {
            this.element.parentNode.removeChild(this.element), this.emitEvent("remove", [this])
        }, a.prototype.remove = function () {
            if (!u || !parseFloat(this.layout.options.transitionDuration))return this.removeElem(), void 0;
            var t = this;
            this.on("transitionEnd", function () {
                return t.removeElem(), !0
            }), this.hide()
        }, a.prototype.reveal = function () {
            delete this.isHidden, this.css({display: ""});
            var t = this.layout.options;
            this.transition({from: t.hiddenStyle, to: t.visibleStyle, isCleaning: !0})
        }, a.prototype.hide = function () {
            this.isHidden = !0, this.css({display: ""});
            var t = this.layout.options;
            this.transition({
                from: t.visibleStyle,
                to: t.hiddenStyle,
                isCleaning: !0,
                onTransitionEnd: {
                    opacity: function () {
                        this.isHidden && this.css({display: "none"})
                    }
                }
            })
        }, a.prototype.destroy = function () {
            this.css({position: "", left: "", right: "", top: "", bottom: "", transition: "", transform: ""})
        }, a
    }

    var r = t.getComputedStyle, s = r ? function (t) {
        return r(t, null)
    } : function (t) {
        return t.currentStyle
    };
    "function" == typeof define && define.amd ? define("outlayer/item", ["eventEmitter/EventEmitter", "get-size/get-size", "get-style-property/get-style-property"], n) : (t.Outlayer = {}, t.Outlayer.Item = n(t.EventEmitter, t.getSize, t.getStyleProperty))
}(window), function (t) {
    function e(t, e) {
        for (var i in e)t[i] = e[i];
        return t
    }

    function i(t) {
        return "[object Array]" === f.call(t)
    }

    function o(t) {
        var e = [];
        if (i(t))e = t; else if (t && "number" == typeof t.length)for (var o = 0, n = t.length; n > o; o++)e.push(t[o]); else e.push(t);
        return e
    }

    function n(t, e) {
        var i = d(e, t);
        -1 !== i && e.splice(i, 1)
    }

    function r(t) {
        return t.replace(/(.)([A-Z])/g, function (t, e, i) {
            return e + "-" + i
        }).toLowerCase()
    }

    function s(i, s, f, d, l, y) {
        function m(t, i) {
            if ("string" == typeof t && (t = a.querySelector(t)), !t || !c(t))return u && u.error("Bad " + this.constructor.namespace + " element: " + t), void 0;
            this.element = t, this.options = e({}, this.constructor.defaults), this.option(i);
            var o = ++g;
            this.element.outlayerGUID = o, v[o] = this, this._create(), this.options.isInitLayout && this.layout()
        }

        var g = 0, v = {};
        return m.namespace = "outlayer", m.Item = y, m.defaults = {
            containerStyle: {position: "relative"},
            isInitLayout: !0,
            isOriginLeft: !0,
            isOriginTop: !0,
            isResizeBound: !0,
            isResizingContainer: !0,
            transitionDuration: "0.4s",
            hiddenStyle: {opacity: 0, transform: "scale(0.001)"},
            visibleStyle: {opacity: 1, transform: "scale(1)"}
        }, e(m.prototype, f.prototype), m.prototype.option = function (t) {
            e(this.options, t)
        }, m.prototype._create = function () {
            this.reloadItems(), this.stamps = [], this.stamp(this.options.stamp), e(this.element.style, this.options.containerStyle), this.options.isResizeBound && this.bindResize()
        }, m.prototype.reloadItems = function () {
            this.items = this._itemize(this.element.children)
        }, m.prototype._itemize = function (t) {
            for (var e = this._filterFindItemElements(t), i = this.constructor.Item, o = [], n = 0, r = e.length; r > n; n++) {
                var s = e[n], a = new i(s, this);
                o.push(a)
            }
            return o
        }, m.prototype._filterFindItemElements = function (t) {
            t = o(t);
            for (var e = this.options.itemSelector, i = [], n = 0, r = t.length; r > n; n++) {
                var s = t[n];
                if (c(s))if (e) {
                    l(s, e) && i.push(s);
                    for (var a = s.querySelectorAll(e), u = 0, p = a.length; p > u; u++)i.push(a[u])
                } else i.push(s)
            }
            return i
        }, m.prototype.getItemElements = function () {
            for (var t = [], e = 0, i = this.items.length; i > e; e++)t.push(this.items[e].element);
            return t
        }, m.prototype.layout = function () {
            this._resetLayout(), this._manageStamps();
            var t = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
            this.layoutItems(this.items, t), this._isLayoutInited = !0
        }, m.prototype._init = m.prototype.layout, m.prototype._resetLayout = function () {
            this.getSize()
        }, m.prototype.getSize = function () {
            this.size = d(this.element)
        }, m.prototype._getMeasurement = function (t, e) {
            var i, o = this.options[t];
            o ? ("string" == typeof o ? i = this.element.querySelector(o) : c(o) && (i = o), this[t] = i ? d(i)[e] : o) : this[t] = 0
        }, m.prototype.layoutItems = function (t, e) {
            t = this._getItemsForLayout(t), this._layoutItems(t, e), this._postLayout()
        }, m.prototype._getItemsForLayout = function (t) {
            for (var e = [], i = 0, o = t.length; o > i; i++) {
                var n = t[i];
                n.isIgnored || e.push(n)
            }
            return e
        }, m.prototype._layoutItems = function (t, e) {
            function i() {
                o.emitEvent("layoutComplete", [o, t])
            }

            var o = this;
            if (!t || !t.length)return i(), void 0;
            this._itemsOn(t, "layout", i);
            for (var n = [], r = 0, s = t.length; s > r; r++) {
                var a = t[r], u = this._getItemLayoutPosition(a);
                u.item = a, u.isInstant = e || a.isLayoutInstant, n.push(u)
            }
            this._processLayoutQueue(n)
        }, m.prototype._getItemLayoutPosition = function () {
            return {x: 0, y: 0}
        }, m.prototype._processLayoutQueue = function (t) {
            for (var e = 0, i = t.length; i > e; e++) {
                var o = t[e];
                this._positionItem(o.item, o.x, o.y, o.isInstant)
            }
        }, m.prototype._positionItem = function (t, e, i, o) {
            o ? t.goTo(e, i) : t.moveTo(e, i)
        }, m.prototype._postLayout = function () {
            this.resizeContainer()
        }, m.prototype.resizeContainer = function () {
            if (this.options.isResizingContainer) {
                var t = this._getContainerSize();
                t && (this._setContainerMeasure(t.width, !0), this._setContainerMeasure(t.height, !1))
            }
        }, m.prototype._getContainerSize = h, m.prototype._setContainerMeasure = function (t, e) {
            if (void 0 !== t) {
                var i = this.size;
                i.isBorderBox && (t += e ? i.paddingLeft + i.paddingRight + i.borderLeftWidth + i.borderRightWidth : i.paddingBottom + i.paddingTop + i.borderTopWidth + i.borderBottomWidth), t = Math.max(t, 0), this.element.style[e ? "width" : "height"] = t + "px"
            }
        }, m.prototype._itemsOn = function (t, e, i) {
            function o() {
                return n++, n === r && i.call(s), !0
            }

            for (var n = 0, r = t.length, s = this, a = 0, u = t.length; u > a; a++) {
                var p = t[a];
                p.on(e, o)
            }
        }, m.prototype.ignore = function (t) {
            var e = this.getItem(t);
            e && (e.isIgnored = !0)
        }, m.prototype.unignore = function (t) {
            var e = this.getItem(t);
            e && delete e.isIgnored
        }, m.prototype.stamp = function (t) {
            if (t = this._find(t)) {
                this.stamps = this.stamps.concat(t);
                for (var e = 0, i = t.length; i > e; e++) {
                    var o = t[e];
                    this.ignore(o)
                }
            }
        }, m.prototype.unstamp = function (t) {
            if (t = this._find(t))for (var e = 0, i = t.length; i > e; e++) {
                var o = t[e];
                n(o, this.stamps), this.unignore(o)
            }
        }, m.prototype._find = function (t) {
            return t ? ("string" == typeof t && (t = this.element.querySelectorAll(t)), t = o(t)) : void 0
        }, m.prototype._manageStamps = function () {
            if (this.stamps && this.stamps.length) {
                this._getBoundingRect();
                for (var t = 0, e = this.stamps.length; e > t; t++) {
                    var i = this.stamps[t];
                    this._manageStamp(i)
                }
            }
        }, m.prototype._getBoundingRect = function () {
            var t = this.element.getBoundingClientRect(), e = this.size;
            this._boundingRect = {
                left: t.left + e.paddingLeft + e.borderLeftWidth,
                top: t.top + e.paddingTop + e.borderTopWidth,
                right: t.right - (e.paddingRight + e.borderRightWidth),
                bottom: t.bottom - (e.paddingBottom + e.borderBottomWidth)
            }
        }, m.prototype._manageStamp = h, m.prototype._getElementOffset = function (t) {
            var e = t.getBoundingClientRect(), i = this._boundingRect, o = d(t), n = {
                left: e.left - i.left - o.marginLeft,
                top: e.top - i.top - o.marginTop,
                right: i.right - e.right - o.marginRight,
                bottom: i.bottom - e.bottom - o.marginBottom
            };
            return n
        }, m.prototype.handleEvent = function (t) {
            var e = "on" + t.type;
            this[e] && this[e](t)
        }, m.prototype.bindResize = function () {
            this.isResizeBound || (i.bind(t, "resize", this), this.isResizeBound = !0)
        }, m.prototype.unbindResize = function () {
            this.isResizeBound && i.unbind(t, "resize", this), this.isResizeBound = !1
        }, m.prototype.onresize = function () {
            function t() {
                e.resize(), delete e.resizeTimeout
            }

            this.resizeTimeout && clearTimeout(this.resizeTimeout);
            var e = this;
            this.resizeTimeout = setTimeout(t, 100)
        }, m.prototype.resize = function () {
            this.isResizeBound && this.needsResizeLayout() && this.layout()
        }, m.prototype.needsResizeLayout = function () {
            var t = d(this.element), e = this.size && t;
            return e && t.innerWidth !== this.size.innerWidth
        }, m.prototype.addItems = function (t) {
            var e = this._itemize(t);
            return e.length && (this.items = this.items.concat(e)), e
        }, m.prototype.appended = function (t) {
            var e = this.addItems(t);
            e.length && (this.layoutItems(e, !0), this.reveal(e))
        }, m.prototype.prepended = function (t) {
            var e = this._itemize(t);
            if (e.length) {
                var i = this.items.slice(0);
                this.items = e.concat(i), this._resetLayout(), this._manageStamps(), this.layoutItems(e, !0), this.reveal(e), this.layoutItems(i)
            }
        }, m.prototype.reveal = function (t) {
            var e = t && t.length;
            if (e)for (var i = 0; e > i; i++) {
                var o = t[i];
                o.reveal()
            }
        }, m.prototype.hide = function (t) {
            var e = t && t.length;
            if (e)for (var i = 0; e > i; i++) {
                var o = t[i];
                o.hide()
            }
        }, m.prototype.getItem = function (t) {
            for (var e = 0, i = this.items.length; i > e; e++) {
                var o = this.items[e];
                if (o.element === t)return o
            }
        }, m.prototype.getItems = function (t) {
            if (t && t.length) {
                for (var e = [], i = 0, o = t.length; o > i; i++) {
                    var n = t[i], r = this.getItem(n);
                    r && e.push(r)
                }
                return e
            }
        }, m.prototype.remove = function (t) {
            t = o(t);
            var e = this.getItems(t);
            if (e && e.length) {
                this._itemsOn(e, "remove", function () {
                    this.emitEvent("removeComplete", [this, e])
                });
                for (var i = 0, r = e.length; r > i; i++) {
                    var s = e[i];
                    s.remove(), n(s, this.items)
                }
            }
        }, m.prototype.destroy = function () {
            var t = this.element.style;
            t.height = "", t.position = "", t.width = "";
            for (var e = 0, i = this.items.length; i > e; e++) {
                var o = this.items[e];
                o.destroy()
            }
            this.unbindResize(), delete this.element.outlayerGUID, p && p.removeData(this.element, this.constructor.namespace)
        }, m.data = function (t) {
            var e = t && t.outlayerGUID;
            return e && v[e]
        }, m.create = function (t, i) {
            function o() {
                m.apply(this, arguments)
            }

            return Object.create ? o.prototype = Object.create(m.prototype) : e(o.prototype, m.prototype), o.prototype.constructor = o, o.defaults = e({}, m.defaults), e(o.defaults, i), o.prototype.settings = {}, o.namespace = t, o.data = m.data, o.Item = function () {
                y.apply(this, arguments)
            }, o.Item.prototype = new y, s(function () {
                for (var e = r(t), i = a.querySelectorAll(".js-" + e), n = "data-" + e + "-options", s = 0, h = i.length; h > s; s++) {
                    var f, c = i[s], d = c.getAttribute(n);
                    try {
                        f = d && JSON.parse(d)
                    } catch (l) {
                        u && u.error("Error parsing " + n + " on " + c.nodeName.toLowerCase() + (c.id ? "#" + c.id : "") + ": " + l);
                        continue
                    }
                    var y = new o(c, f);
                    p && p.data(c, t, y)
                }
            }), p && p.bridget && p.bridget(t, o), o
        }, m.Item = y, m
    }

    var a = t.document, u = t.console, p = t.jQuery, h = function () {
    }, f = Object.prototype.toString, c = "object" == typeof HTMLElement ? function (t) {
        return t instanceof HTMLElement
    } : function (t) {
        return t && "object" == typeof t && 1 === t.nodeType && "string" == typeof t.nodeName
    }, d = Array.prototype.indexOf ? function (t, e) {
        return t.indexOf(e)
    } : function (t, e) {
        for (var i = 0, o = t.length; o > i; i++)if (t[i] === e)return i;
        return -1
    };
    "function" == typeof define && define.amd ? define("outlayer/outlayer", ["eventie/eventie", "doc-ready/doc-ready", "eventEmitter/EventEmitter", "get-size/get-size", "matches-selector/matches-selector", "./item"], s) : t.Outlayer = s(t.eventie, t.docReady, t.EventEmitter, t.getSize, t.matchesSelector, t.Outlayer.Item)
}(window), function (t) {
    function e(t) {
        function e() {
            t.Item.apply(this, arguments)
        }

        return e.prototype = new t.Item, e.prototype._create = function () {
            this.id = this.layout.itemGUID++, t.Item.prototype._create.call(this), this.sortData = {}
        }, e.prototype.updateSortData = function () {
            if (!this.isIgnored) {
                this.sortData.id = this.id, this.sortData["original-order"] = this.id, this.sortData.random = Math.random();
                var t = this.layout.options.getSortData, e = this.layout._sorters;
                for (var i in t) {
                    var o = e[i];
                    this.sortData[i] = o(this.element, this)
                }
            }
        }, e
    }

    "function" == typeof define && define.amd ? define("isotope/js/item", ["outlayer/outlayer"], e) : (t.Isotope = t.Isotope || {}, t.Isotope.Item = e(t.Outlayer))
}(window), function (t) {
    function e(t, e) {
        function i(t) {
            this.isotope = t, t && (this.options = t.options[this.namespace], this.element = t.element, this.items = t.filteredItems, this.size = t.size)
        }

        return function () {
            function t(t) {
                return function () {
                    return e.prototype[t].apply(this.isotope, arguments)
                }
            }

            for (var o = ["_resetLayout", "_getItemLayoutPosition", "_manageStamp", "_getContainerSize", "_getElementOffset", "needsResizeLayout"], n = 0, r = o.length; r > n; n++) {
                var s = o[n];
                i.prototype[s] = t(s)
            }
        }(), i.prototype.needsVerticalResizeLayout = function () {
            var e = t(this.isotope.element), i = this.isotope.size && e;
            return i && e.innerHeight !== this.isotope.size.innerHeight
        }, i.prototype._getMeasurement = function () {
            this.isotope._getMeasurement.apply(this, arguments)
        }, i.prototype.getColumnWidth = function () {
            this.getSegmentSize("column", "Width")
        }, i.prototype.getRowHeight = function () {
            this.getSegmentSize("row", "Height")
        }, i.prototype.getSegmentSize = function (t, e) {
            var i = t + e, o = "outer" + e;
            if (this._getMeasurement(i, o), !this[i]) {
                var n = this.getFirstItemSize();
                this[i] = n && n[o] || this.isotope.size["inner" + e]
            }
        }, i.prototype.getFirstItemSize = function () {
            var e = this.isotope.filteredItems[0];
            return e && e.element && t(e.element)
        }, i.prototype.layout = function () {
            this.isotope.layout.apply(this.isotope, arguments)
        }, i.prototype.getSize = function () {
            this.isotope.getSize(), this.size = this.isotope.size
        }, i.modes = {}, i.create = function (t, e) {
            function o() {
                i.apply(this, arguments)
            }

            return o.prototype = new i, e && (o.options = e), o.prototype.namespace = t, i.modes[t] = o, o
        }, i
    }

    "function" == typeof define && define.amd ? define("isotope/js/layout-mode", ["get-size/get-size", "outlayer/outlayer"], e) : (t.Isotope = t.Isotope || {}, t.Isotope.LayoutMode = e(t.getSize, t.Outlayer))
}(window), function (t) {
    function e(t, e) {
        var o = t.create("masonry");
        return o.prototype._resetLayout = function () {
            this.getSize(), this._getMeasurement("columnWidth", "outerWidth"), this._getMeasurement("gutter", "outerWidth"), this.measureColumns();
            var t = this.cols;
            for (this.colYs = []; t--;)this.colYs.push(0);
            this.maxY = 0
        }, o.prototype.measureColumns = function () {
            if (this.getContainerWidth(), !this.columnWidth) {
                var t = this.items[0], i = t && t.element;
                this.columnWidth = i && e(i).outerWidth || this.containerWidth
            }
            this.columnWidth += this.gutter, this.cols = Math.floor((this.containerWidth + this.gutter) / this.columnWidth), this.cols = Math.max(this.cols, 1)
        }, o.prototype.getContainerWidth = function () {
            var t = this.options.isFitWidth ? this.element.parentNode : this.element, i = e(t);
            this.containerWidth = i && i.innerWidth
        }, o.prototype._getItemLayoutPosition = function (t) {
            t.getSize();
            var e = t.size.outerWidth % this.columnWidth, o = e && 1 > e ? "round" : "ceil", n = Math[o](t.size.outerWidth / this.columnWidth);
            n = Math.min(n, this.cols);
            for (var r = this._getColGroup(n), s = Math.min.apply(Math, r), a = i(r, s), u = {
                x: this.columnWidth * a,
                y: s
            }, p = s + t.size.outerHeight, h = this.cols + 1 - r.length, f = 0; h > f; f++)this.colYs[a + f] = p;
            return u
        }, o.prototype._getColGroup = function (t) {
            if (2 > t)return this.colYs;
            for (var e = [], i = this.cols + 1 - t, o = 0; i > o; o++) {
                var n = this.colYs.slice(o, o + t);
                e[o] = Math.max.apply(Math, n)
            }
            return e
        }, o.prototype._manageStamp = function (t) {
            var i = e(t), o = this._getElementOffset(t), n = this.options.isOriginLeft ? o.left : o.right, r = n + i.outerWidth, s = Math.floor(n / this.columnWidth);
            s = Math.max(0, s);
            var a = Math.floor(r / this.columnWidth);
            a -= r % this.columnWidth ? 0 : 1, a = Math.min(this.cols - 1, a);
            for (var u = (this.options.isOriginTop ? o.top : o.bottom) + i.outerHeight, p = s; a >= p; p++)this.colYs[p] = Math.max(u, this.colYs[p])
        }, o.prototype._getContainerSize = function () {
            this.maxY = Math.max.apply(Math, this.colYs);
            var t = {height: this.maxY};
            return this.options.isFitWidth && (t.width = this._getContainerFitWidth()), t
        }, o.prototype._getContainerFitWidth = function () {
            for (var t = 0, e = this.cols; --e && 0 === this.colYs[e];)t++;
            return (this.cols - t) * this.columnWidth - this.gutter
        }, o.prototype.needsResizeLayout = function () {
            var t = this.containerWidth;
            return this.getContainerWidth(), t !== this.containerWidth
        }, o
    }

    var i = Array.prototype.indexOf ? function (t, e) {
        return t.indexOf(e)
    } : function (t, e) {
        for (var i = 0, o = t.length; o > i; i++) {
            var n = t[i];
            if (n === e)return i
        }
        return -1
    };
    "function" == typeof define && define.amd ? define("masonry/masonry", ["outlayer/outlayer", "get-size/get-size"], e) : t.Masonry = e(t.Outlayer, t.getSize)
}(window), function (t) {
    function e(t, e) {
        for (var i in e)t[i] = e[i];
        return t
    }

    function i(t, i) {
        var o = t.create("masonry"), n = o.prototype._getElementOffset, r = o.prototype.layout, s = o.prototype._getMeasurement;
        e(o.prototype, i.prototype), o.prototype._getElementOffset = n, o.prototype.layout = r, o.prototype._getMeasurement = s;
        var a = o.prototype.measureColumns;
        o.prototype.measureColumns = function () {
            this.items = this.isotope.filteredItems, a.call(this)
        };
        var u = o.prototype._manageStamp;
        return o.prototype._manageStamp = function () {
            this.options.isOriginLeft = this.isotope.options.isOriginLeft, this.options.isOriginTop = this.isotope.options.isOriginTop, u.apply(this, arguments)
        }, o
    }

    "function" == typeof define && define.amd ? define("isotope/js/layout-modes/masonry", ["../layout-mode", "masonry/masonry"], i) : i(t.Isotope.LayoutMode, t.Masonry)
}(window), function (t) {
    function e(t) {
        var e = t.create("fitRows");
        return e.prototype._resetLayout = function () {
            this.x = 0, this.y = 0, this.maxY = 0
        }, e.prototype._getItemLayoutPosition = function (t) {
            t.getSize(), 0 !== this.x && t.size.outerWidth + this.x > this.isotope.size.innerWidth && (this.x = 0, this.y = this.maxY);
            var e = {x: this.x, y: this.y};
            return this.maxY = Math.max(this.maxY, this.y + t.size.outerHeight), this.x += t.size.outerWidth, e
        }, e.prototype._getContainerSize = function () {
            return {height: this.maxY}
        }, e
    }

    "function" == typeof define && define.amd ? define("isotope/js/layout-modes/fit-rows", ["../layout-mode"], e) : e(t.Isotope.LayoutMode)
}(window), function (t) {
    function e(t) {
        var e = t.create("vertical", {horizontalAlignment: 0});
        return e.prototype._resetLayout = function () {
            this.y = 0
        }, e.prototype._getItemLayoutPosition = function (t) {
            t.getSize();
            var e = (this.isotope.size.innerWidth - t.size.outerWidth) * this.options.horizontalAlignment, i = this.y;
            return this.y += t.size.outerHeight, {x: e, y: i}
        }, e.prototype._getContainerSize = function () {
            return {height: this.y}
        }, e
    }

    "function" == typeof define && define.amd ? define("isotope/js/layout-modes/vertical", ["../layout-mode"], e) : e(t.Isotope.LayoutMode)
}(window), function (t) {
    function e(t, e) {
        for (var i in e)t[i] = e[i];
        return t
    }

    function i(t) {
        return "[object Array]" === h.call(t)
    }

    function o(t) {
        var e = [];
        if (i(t))e = t; else if (t && "number" == typeof t.length)for (var o = 0, n = t.length; n > o; o++)e.push(t[o]); else e.push(t);
        return e
    }

    function n(t, e) {
        var i = f(e, t);
        -1 !== i && e.splice(i, 1)
    }

    function r(t, i, r, u, h) {
        function f(t, e) {
            return function (i, o) {
                for (var n = 0, r = t.length; r > n; n++) {
                    var s = t[n], a = i.sortData[s], u = o.sortData[s];
                    if (a > u || u > a) {
                        var p = void 0 !== e[s] ? e[s] : e, h = p ? 1 : -1;
                        return (a > u ? 1 : -1) * h
                    }
                }
                return 0
            }
        }

        var c = t.create("isotope", {layoutMode: "masonry", isJQueryFiltering: !0, sortAscending: !0});
        c.Item = u, c.LayoutMode = h, c.prototype._create = function () {
            this.itemGUID = 0, this._sorters = {}, this._getSorters(), t.prototype._create.call(this), this.modes = {}, this.filteredItems = this.items, this.sortHistory = ["original-order"];
            for (var e in h.modes)this._initLayoutMode(e)
        }, c.prototype.reloadItems = function () {
            this.itemGUID = 0, t.prototype.reloadItems.call(this)
        }, c.prototype._itemize = function () {
            for (var e = t.prototype._itemize.apply(this, arguments), i = 0, o = e.length; o > i; i++) {
                var n = e[i];
                n.id = this.itemGUID++
            }
            return this._updateItemsSortData(e), e
        }, c.prototype._initLayoutMode = function (t) {
            var i = h.modes[t], o = this.options[t] || {};
            this.options[t] = i.options ? e(i.options, o) : o, this.modes[t] = new i(this)
        }, c.prototype.layout = function () {
            return !this._isLayoutInited && this.options.isInitLayout ? (this.arrange(), void 0) : (this._layout(), void 0)
        }, c.prototype._layout = function () {
            var t = this._getIsInstant();
            this._resetLayout(), this._manageStamps(), this.layoutItems(this.filteredItems, t), this._isLayoutInited = !0
        }, c.prototype.arrange = function (t) {
            this.option(t), this._getIsInstant(), this.filteredItems = this._filter(this.items), this._sort(), this._layout()
        }, c.prototype._init = c.prototype.arrange, c.prototype._getIsInstant = function () {
            var t = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
            return this._isInstant = t, t
        }, c.prototype._filter = function (t) {
            function e() {
                f.reveal(n), f.hide(r)
            }

            var i = this.options.filter;
            i = i || "*";
            for (var o = [], n = [], r = [], s = this._getFilterTest(i), a = 0, u = t.length; u > a; a++) {
                var p = t[a];
                if (!p.isIgnored) {
                    var h = s(p);
                    h && o.push(p), h && p.isHidden ? n.push(p) : h || p.isHidden || r.push(p)
                }
            }
            var f = this;
            return this._isInstant ? this._noTransition(e) : e(), o
        }, c.prototype._getFilterTest = function (t) {
            return s && this.options.isJQueryFiltering ? function (e) {
                return s(e.element).is(t)
            } : "function" == typeof t ? function (e) {
                return t(e.element)
            } : function (e) {
                return r(e.element, t)
            }
        }, c.prototype.updateSortData = function (t) {
            this._getSorters(), t = o(t);
            var e = this.getItems(t);
            e = e.length ? e : this.items, this._updateItemsSortData(e)
        }, c.prototype._getSorters = function () {
            var t = this.options.getSortData;
            for (var e in t) {
                var i = t[e];
                this._sorters[e] = d(i)
            }
        }, c.prototype._updateItemsSortData = function (t) {
            for (var e = 0, i = t.length; i > e; e++) {
                var o = t[e];
                o.updateSortData()
            }
        };
        var d = function () {
            function t(t) {
                if ("string" != typeof t)return t;
                var i = a(t).split(" "), o = i[0], n = o.match(/^\[(.+)\]$/), r = n && n[1], s = e(r, o), u = c.sortDataParsers[i[1]];
                return t = u ? function (t) {
                    return t && u(s(t))
                } : function (t) {
                    return t && s(t)
                }
            }

            function e(t, e) {
                var i;
                return i = t ? function (e) {
                    return e.getAttribute(t)
                } : function (t) {
                    var i = t.querySelector(e);
                    return i && p(i)
                }
            }

            return t
        }();
        c.sortDataParsers = {
            parseInt: function (t) {
                return parseInt(t, 10)
            }, parseFloat: function (t) {
                return parseFloat(t)
            }
        }, c.prototype._sort = function () {
            var t = this.options.sortBy;
            if (t) {
                var e = [].concat.apply(t, this.sortHistory), i = f(e, this.options.sortAscending);
                this.filteredItems.sort(i), t !== this.sortHistory[0] && this.sortHistory.unshift(t)
            }
        }, c.prototype._mode = function () {
            var t = this.options.layoutMode, e = this.modes[t];
            if (!e)throw Error("No layout mode: " + t);
            return e.options = this.options[t], e
        }, c.prototype._resetLayout = function () {
            t.prototype._resetLayout.call(this), this._mode()._resetLayout()
        }, c.prototype._getItemLayoutPosition = function (t) {
            return this._mode()._getItemLayoutPosition(t)
        }, c.prototype._manageStamp = function (t) {
            this._mode()._manageStamp(t)
        }, c.prototype._getContainerSize = function () {
            return this._mode()._getContainerSize()
        }, c.prototype.needsResizeLayout = function () {
            return this._mode().needsResizeLayout()
        }, c.prototype.appended = function (t) {
            var e = this.addItems(t);
            if (e.length) {
                var i = this._filterRevealAdded(e);
                this.filteredItems = this.filteredItems.concat(i)
            }
        }, c.prototype.prepended = function (t) {
            var e = this._itemize(t);
            if (e.length) {
                var i = this.items.slice(0);
                this.items = e.concat(i), this._resetLayout(), this._manageStamps();
                var o = this._filterRevealAdded(e);
                this.layoutItems(i), this.filteredItems = o.concat(this.filteredItems)
            }
        }, c.prototype._filterRevealAdded = function (t) {
            var e = this._noTransition(function () {
                return this._filter(t)
            });
            return this.layoutItems(e, !0), this.reveal(e), t
        }, c.prototype.insert = function (t) {
            var e = this.addItems(t);
            if (e.length) {
                var i, o, n = e.length;
                for (i = 0; n > i; i++)o = e[i], this.element.appendChild(o.element);
                var r = this._filter(e);
                for (this._noTransition(function () {
                    this.hide(r)
                }), i = 0; n > i; i++)e[i].isLayoutInstant = !0;
                for (this.arrange(), i = 0; n > i; i++)delete e[i].isLayoutInstant;
                this.reveal(r)
            }
        };
        var l = c.prototype.remove;
        return c.prototype.remove = function (t) {
            t = o(t);
            var e = this.getItems(t);
            if (l.call(this, t), e && e.length)for (var i = 0, r = e.length; r > i; i++) {
                var s = e[i];
                n(s, this.filteredItems)
            }
        }, c.prototype._noTransition = function (t) {
            var e = this.options.transitionDuration;
            this.options.transitionDuration = 0;
            var i = t.call(this);
            return this.options.transitionDuration = e, i
        }, c
    }

    var s = t.jQuery, a = String.prototype.trim ? function (t) {
        return t.trim()
    } : function (t) {
        return t.replace(/^\s+|\s+$/g, "")
    }, u = document.documentElement, p = u.textContent ? function (t) {
        return t.textContent
    } : function (t) {
        return t.innerText
    }, h = Object.prototype.toString, f = Array.prototype.indexOf ? function (t, e) {
        return t.indexOf(e)
    } : function (t, e) {
        for (var i = 0, o = t.length; o > i; i++)if (t[i] === e)return i;
        return -1
    };
    "function" == typeof define && define.amd ? define(["outlayer/outlayer", "get-size/get-size", "matches-selector/matches-selector", "isotope/js/item", "isotope/js/layout-mode", "isotope/js/layout-modes/masonry", "isotope/js/layout-modes/fit-rows", "isotope/js/layout-modes/vertical"], r) : t.Isotope = r(t.Outlayer, t.getSize, t.matchesSelector, t.Isotope.Item, t.Isotope.LayoutMode)
}(window);

/*!
 * imagesLoaded PACKAGED v3.1.8
 * JavaScript is all like "You images are done yet or what?"
 * MIT License
 */

(function () {
    function e() {
    }

    function t(e, t) {
        for (var n = e.length; n--;)if (e[n].listener === t)return n;
        return -1
    }

    function n(e) {
        return function () {
            return this[e].apply(this, arguments)
        }
    }

    var i = e.prototype, r = this, o = r.EventEmitter;
    i.getListeners = function (e) {
        var t, n, i = this._getEvents();
        if ("object" == typeof e) {
            t = {};
            for (n in i)i.hasOwnProperty(n) && e.test(n) && (t[n] = i[n])
        } else t = i[e] || (i[e] = []);
        return t
    }, i.flattenListeners = function (e) {
        var t, n = [];
        for (t = 0; e.length > t; t += 1)n.push(e[t].listener);
        return n
    }, i.getListenersAsObject = function (e) {
        var t, n = this.getListeners(e);
        return n instanceof Array && (t = {}, t[e] = n), t || n
    }, i.addListener = function (e, n) {
        var i, r = this.getListenersAsObject(e), o = "object" == typeof n;
        for (i in r)r.hasOwnProperty(i) && -1 === t(r[i], n) && r[i].push(o ? n : {listener: n, once: !1});
        return this
    }, i.on = n("addListener"), i.addOnceListener = function (e, t) {
        return this.addListener(e, {listener: t, once: !0})
    }, i.once = n("addOnceListener"), i.defineEvent = function (e) {
        return this.getListeners(e), this
    }, i.defineEvents = function (e) {
        for (var t = 0; e.length > t; t += 1)this.defineEvent(e[t]);
        return this
    }, i.removeListener = function (e, n) {
        var i, r, o = this.getListenersAsObject(e);
        for (r in o)o.hasOwnProperty(r) && (i = t(o[r], n), -1 !== i && o[r].splice(i, 1));
        return this
    }, i.off = n("removeListener"), i.addListeners = function (e, t) {
        return this.manipulateListeners(!1, e, t)
    }, i.removeListeners = function (e, t) {
        return this.manipulateListeners(!0, e, t)
    }, i.manipulateListeners = function (e, t, n) {
        var i, r, o = e ? this.removeListener : this.addListener, s = e ? this.removeListeners : this.addListeners;
        if ("object" != typeof t || t instanceof RegExp)for (i = n.length; i--;)o.call(this, t, n[i]); else for (i in t)t.hasOwnProperty(i) && (r = t[i]) && ("function" == typeof r ? o.call(this, i, r) : s.call(this, i, r));
        return this
    }, i.removeEvent = function (e) {
        var t, n = typeof e, i = this._getEvents();
        if ("string" === n)delete i[e]; else if ("object" === n)for (t in i)i.hasOwnProperty(t) && e.test(t) && delete i[t]; else delete this._events;
        return this
    }, i.removeAllListeners = n("removeEvent"), i.emitEvent = function (e, t) {
        var n, i, r, o, s = this.getListenersAsObject(e);
        for (r in s)if (s.hasOwnProperty(r))for (i = s[r].length; i--;)n = s[r][i], n.once === !0 && this.removeListener(e, n.listener), o = n.listener.apply(this, t || []), o === this._getOnceReturnValue() && this.removeListener(e, n.listener);
        return this
    }, i.trigger = n("emitEvent"), i.emit = function (e) {
        var t = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(e, t)
    }, i.setOnceReturnValue = function (e) {
        return this._onceReturnValue = e, this
    }, i._getOnceReturnValue = function () {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
    }, i._getEvents = function () {
        return this._events || (this._events = {})
    }, e.noConflict = function () {
        return r.EventEmitter = o, e
    }, "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function () {
        return e
    }) : "object" == typeof module && module.exports ? module.exports = e : this.EventEmitter = e
}).call(this), function (e) {
    function t(t) {
        var n = e.event;
        return n.target = n.target || n.srcElement || t, n
    }

    var n = document.documentElement, i = function () {
    };
    n.addEventListener ? i = function (e, t, n) {
        e.addEventListener(t, n, !1)
    } : n.attachEvent && (i = function (e, n, i) {
        e[n + i] = i.handleEvent ? function () {
            var n = t(e);
            i.handleEvent.call(i, n)
        } : function () {
            var n = t(e);
            i.call(e, n)
        }, e.attachEvent("on" + n, e[n + i])
    });
    var r = function () {
    };
    n.removeEventListener ? r = function (e, t, n) {
        e.removeEventListener(t, n, !1)
    } : n.detachEvent && (r = function (e, t, n) {
        e.detachEvent("on" + t, e[t + n]);
        try {
            delete e[t + n]
        } catch (i) {
            e[t + n] = void 0
        }
    });
    var o = {bind: i, unbind: r};
    "function" == typeof define && define.amd ? define("eventie/eventie", o) : e.eventie = o
}(this), function (e, t) {
    "function" == typeof define && define.amd ? define(["eventEmitter/EventEmitter", "eventie/eventie"], function (n, i) {
        return t(e, n, i)
    }) : "object" == typeof exports ? module.exports = t(e, require("wolfy87-eventemitter"), require("eventie")) : e.imagesLoaded = t(e, e.EventEmitter, e.eventie)
}(window, function (e, t, n) {
    function i(e, t) {
        for (var n in t)e[n] = t[n];
        return e
    }

    function r(e) {
        return "[object Array]" === d.call(e)
    }

    function o(e) {
        var t = [];
        if (r(e))t = e; else if ("number" == typeof e.length)for (var n = 0, i = e.length; i > n; n++)t.push(e[n]); else t.push(e);
        return t
    }

    function s(e, t, n) {
        if (!(this instanceof s))return new s(e, t);
        "string" == typeof e && (e = document.querySelectorAll(e)), this.elements = o(e), this.options = i({}, this.options), "function" == typeof t ? n = t : i(this.options, t), n && this.on("always", n), this.getImages(), a && (this.jqDeferred = new a.Deferred);
        var r = this;
        setTimeout(function () {
            r.check()
        })
    }

    function f(e) {
        this.img = e
    }

    function c(e) {
        this.src = e, v[e] = this
    }

    var a = e.jQuery, u = e.console, h = u !== void 0, d = Object.prototype.toString;
    s.prototype = new t, s.prototype.options = {}, s.prototype.getImages = function () {
        this.images = [];
        for (var e = 0, t = this.elements.length; t > e; e++) {
            var n = this.elements[e];
            "IMG" === n.nodeName && this.addImage(n);
            var i = n.nodeType;
            if (i && (1 === i || 9 === i || 11 === i))for (var r = n.querySelectorAll("img"), o = 0, s = r.length; s > o; o++) {
                var f = r[o];
                this.addImage(f)
            }
        }
    }, s.prototype.addImage = function (e) {
        var t = new f(e);
        this.images.push(t)
    }, s.prototype.check = function () {
        function e(e, r) {
            return t.options.debug && h && u.log("confirm", e, r), t.progress(e), n++, n === i && t.complete(), !0
        }

        var t = this, n = 0, i = this.images.length;
        if (this.hasAnyBroken = !1, !i)return this.complete(), void 0;
        for (var r = 0; i > r; r++) {
            var o = this.images[r];
            o.on("confirm", e), o.check()
        }
    }, s.prototype.progress = function (e) {
        this.hasAnyBroken = this.hasAnyBroken || !e.isLoaded;
        var t = this;
        setTimeout(function () {
            t.emit("progress", t, e), t.jqDeferred && t.jqDeferred.notify && t.jqDeferred.notify(t, e)
        })
    }, s.prototype.complete = function () {
        var e = this.hasAnyBroken ? "fail" : "done";
        this.isComplete = !0;
        var t = this;
        setTimeout(function () {
            if (t.emit(e, t), t.emit("always", t), t.jqDeferred) {
                var n = t.hasAnyBroken ? "reject" : "resolve";
                t.jqDeferred[n](t)
            }
        })
    }, a && (a.fn.imagesLoaded = function (e, t) {
        var n = new s(this, e, t);
        return n.jqDeferred.promise(a(this))
    }), f.prototype = new t, f.prototype.check = function () {
        var e = v[this.img.src] || new c(this.img.src);
        if (e.isConfirmed)return this.confirm(e.isLoaded, "cached was confirmed"), void 0;
        if (this.img.complete && void 0 !== this.img.naturalWidth)return this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), void 0;
        var t = this;
        e.on("confirm", function (e, n) {
            return t.confirm(e.isLoaded, n), !0
        }), e.check()
    }, f.prototype.confirm = function (e, t) {
        this.isLoaded = e, this.emit("confirm", this, t)
    };
    var v = {};
    return c.prototype = new t, c.prototype.check = function () {
        if (!this.isChecked) {
            var e = new Image;
            n.bind(e, "load", this), n.bind(e, "error", this), e.src = this.src, this.isChecked = !0
        }
    }, c.prototype.handleEvent = function (e) {
        var t = "on" + e.type;
        this[t] && this[t](e)
    }, c.prototype.onload = function (e) {
        this.confirm(!0, "onload"), this.unbindProxyEvents(e)
    }, c.prototype.onerror = function (e) {
        this.confirm(!1, "onerror"), this.unbindProxyEvents(e)
    }, c.prototype.confirm = function (e, t) {
        this.isConfirmed = !0, this.isLoaded = e, this.emit("confirm", this, t)
    }, c.prototype.unbindProxyEvents = function (e) {
        n.unbind(e.target, "load", this), n.unbind(e.target, "error", this)
    }, s
});

/*  RETINISE.JS --------------------------------------------------*

 Author:         Simon Sturgess
 @dahliacreative
 simon@dahliacreative.com
 http://www.dahliacreative.com

 Thanks to:      Pedro Piedade
 @iampedropiedade
 http://pedropiedade.com/

 Documentation:  http://www.dahliacreative.com/retinisejs

 Release date:   27/09/2012
 Version:        v.1.0
 Licensing:      © Copyright 2012 DahliaCreative.
 Free to use under the GPLv2 license.
 http://www.gnu.org/licenses/gpl-2.0.html

 *--------------------------------------------------------------------*/
(function (e) {
    e.fn.extend({
        retinise: function (t) {
            var n = {
                suffix: "@2x",
                srcattr: "data-src",
                retattr: "data-ret",
                altattr: "data-alt"
            }, r = e.extend(n, t), i = window.devicePixelRatio, s = i > 1 ? !0 : !1;
            e(this).each(function () {
                var t = e(this), n = t.css("display");
                t.css("display", "none");
                if (t.attr(r.srcattr)) {
                    var o = t.attr(r.srcattr), u = t.attr(r.altattr), a = t.attr(r.retattr);
                    if (s === !0) {
                        t.attr(r.retattr) ? t.attr({src: a, alt: u}) : t.attr({
                            src: o.replace(/\.\w+$/, function (e) {
                                return r.suffix + e
                            }), alt: u
                        });
                        t.load(function () {
                            var e = t.height() / i, r = t.width() / i;
                            t.attr({height: e, width: r}).css({display: n})
                        })
                    } else t.attr({src: o, alt: u}).css({display: n})
                }
            })
        }
    })
})(jQuery);

/*
 * DC jQuery Slick Forms - jQuery Slick Forms
 * Copyright (c) 2011 Design Chemical
 * http://www.designchemical.com
 *
 * Dual licensed under the MIT and GPL licenses:
 * 	http://www.opensource.org/licenses/mit-license.php
 * 	http://www.gnu.org/licenses/gpl.html
 *
 */

(function ($) {

    //define the plugin
    $.fn.dcSlickForms = function (options) {

        //set default options
        var defaults = {
            classError: 'error',
            classForm: 'slick-form',
            align: 'left',
            animateError: true,
            animateD: 10,
            ajaxSubmit: true,
            errorH: 24,
            successH: 40
        };

        //call in the default otions
        var options = $.extend(defaults, options);

        //act upon the element that is passed into the design
        return this.each(function (options) {

            // Declare the function variables:
            var formAction = $(this).attr('action');
            var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
            var textError = $('.v-error', this).val();
            var textEmail = $('.v-email', this).val();
            var $error = $('<span class="error"></span>');
            var $form = this;
            var $loading = $('<div class="loading"><span></span></div>');
            var errorText = '* Required Fields';
            var check = 0;

            $('input', $form).focus(function () {
                $(this).addClass('focus');
            });
            $('input', $form).blur(function () {
                $(this).removeClass('focus');
                masonryHeight();
            });
            $('.nocomment').hide();
            $('.defaultText', this).dcDefaultText();
            $('.' + defaults.classForm + ' label').hide();

            // Form submit & Validation
            $(this).submit(function () {

                if (check == 0) {
                    horig = $('#bottom-container .boxes').height();
                }
                check = 1;
                formReset($form);
                $('.defaultText', $form).dcDefaultText({action: 'remove'});

                // Validate all inputs with the class "required"
                $('.required', $form).each(function () {
                    var label = $(this).attr('title');
                    var inputVal = $(this).val();
                    var $parentTag = $(this).parent();
                    if (inputVal == '') {
                        $parentTag.addClass('error').append($error.clone().text(textError));
                    }

                    // Run the email validation using the regex for those input items also having class "email"
                    if ($(this).hasClass('email') == true) {
                        if (!emailReg.test(inputVal)) {
                            $parentTag.addClass('error').append($error.clone().text(textEmail));
                        }
                    }
                });

                // All validation complete - Check if any errors exist
                // If has errors
                if ($('.error', $form).length) {
                    masonryHeight();
                    $('.btn-submit', this).before($error.clone().text(textError));
                } else {
                    if (defaults.ajaxSubmit == true) {

                        $(this).addClass('submit').after($loading.clone());
                        $('.defaultText', $form).dcDefaultText({action: 'remove'});
                        $.post(formAction, $(this).serialize(), function (data) {
                            $('.loading').fadeOut().remove();
                            $('.response').html(data).fadeIn();
                            var x = horig + defaults.successH;
                            $('.boxes.masoned').animate({height: x + 'px'}, 400);
                            $('fieldset', this).slideUp();
                        });
                    } else {
                        $form.submit();
                    }
                }
                // Prevent form submission
                return false;
            });

            // Fade out error message when input field gains focus
            $('input, textarea').focus(function () {
                var $parent = $(this).parent();
                $parent.addClass('focus');
                $parent.removeClass('error');

            });
            $('input, textarea').blur(function () {
                var $parent = $(this).parent();
                var checkVal = $(this).attr('title');
                if (!$(this).val() == checkVal) {
                    $(this).removeClass('defaulttextActive');
                }
                $parent.removeClass('error focus');
                $('span.error', $parent).hide();
            });

            function formReset(obj) {
                $('li', obj).removeClass('error');
                $('span.error', obj).remove();
                masonryHeight();
            }

            function masonryHeight() {
                var q = $('li.error', $form).length;
                if (q > 0) {
                    var x = horig + (q * defaults.errorH);
                    $('.boxes.masoned').animate({height: x + 'px'}, 400);
                }
            }
        });
    };
})(jQuery);
/*
 * DC jQuery Default Text - jQuery Default Text
 * Copyright (c) 2011 Design Chemical
 * http://www.designchemical.com
 */

(function ($) {

    //define the plugin
    $.fn.dcDefaultText = function (options) {

        //set default options
        var defaults = {
            action: 'add', // alternative 'remove'
            classActive: 'defaultTextActive'
        };

        //call in the default otions
        var options = $.extend(defaults, options);

        return this.each(function (options) {

            if (defaults.action == 'add') {

                $(this).focus(function (srcc) {
                    if ($(this).val() == $(this)[0].title) {
                        $(this).removeClass(defaults.classActive);
                        $(this).val('');
                    }
                });

                $(this).blur(function () {
                    if ($(this).val() == "") {
                        $(this).addClass(defaults.classActive);
                        $(this).val($(this)[0].title);
                    }
                });
                $(this).addClass(defaults.classActive).blur();
            }

            if (defaults.action == 'remove') {

                var checkVal = $(this).attr('title');
                if ($(this).val() == checkVal) {
                    $(this).val('');
                }

            }
        });
    };
})(jQuery);

/*
 * jQuery EasyTabs plugin 3.2.0
 *
 * Copyright (c) 2010-2011 Steve Schwartz (JangoSteve)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Date: Thu May 09 17:30:00 2013 -0500
 */
(function (a) {
    a.easytabs = function (j, e) {
        var f = this, q = a(j), i = {
            animate: true,
            panelActiveClass: "active",
            tabActiveClass: "active",
            defaultTab: "li:first-child",
            animationSpeed: "normal",
            tabs: "> ul > li",
            updateHash: true,
            cycle: false,
            collapsible: false,
            collapsedClass: "collapsed",
            collapsedByDefault: true,
            uiTabs: false,
            transitionIn: "fadeIn",
            transitionOut: "fadeOut",
            transitionInEasing: "swing",
            transitionOutEasing: "swing",
            transitionCollapse: "slideUp",
            transitionUncollapse: "slideDown",
            transitionCollapseEasing: "swing",
            transitionUncollapseEasing: "swing",
            containerClass: "",
            tabsClass: "",
            tabClass: "",
            panelClass: "",
            cache: true,
            event: "click",
            panelContext: q
        }, h, l, v, m, d, t = {fast: 200, normal: 400, slow: 600}, r;
        f.init = function () {
            f.settings = r = a.extend({}, i, e);
            r.bind_str = r.event + ".easytabs";
            if (r.uiTabs) {
                r.tabActiveClass = "ui-tabs-selected";
                r.containerClass = "ui-tabs ui-widget ui-widget-content ui-corner-all";
                r.tabsClass = "ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all";
                r.tabClass = "ui-state-default ui-corner-top";
                r.panelClass = "ui-tabs-panel ui-widget-content ui-corner-bottom"
            }
            if (r.collapsible && e.defaultTab !== undefined && e.collpasedByDefault === undefined) {
                r.collapsedByDefault = false
            }
            if (typeof(r.animationSpeed) === "string") {
                r.animationSpeed = t[r.animationSpeed]
            }
            a("a.anchor").remove().prependTo("body");
            q.data("easytabs", {});
            f.setTransitions();
            f.getTabs();
            b();
            g();
            w();
            n();
            c();
            q.attr("data-easytabs", true)
        };
        f.setTransitions = function () {
            v = (r.animate) ? {
                show: r.transitionIn,
                hide: r.transitionOut,
                speed: r.animationSpeed,
                collapse: r.transitionCollapse,
                uncollapse: r.transitionUncollapse,
                halfSpeed: r.animationSpeed / 2
            } : {show: "show", hide: "hide", speed: 0, collapse: "hide", uncollapse: "show", halfSpeed: 0}
        };
        f.getTabs = function () {
            var x;
            f.tabs = q.find(r.tabs), f.panels = a(), f.tabs.each(function () {
                var A = a(this), z = A.children("a"), y = A.children("a").data("target");
                A.data("easytabs", {});
                if (y !== undefined && y !== null) {
                    A.data("easytabs").ajax = z.attr("href")
                } else {
                    y = z.attr("href")
                }
                y = y.match(/#([^\?]+)/)[1];
                x = r.panelContext.find("#" + y);
                if (x.length) {
                    x.data("easytabs", {position: x.css("position"), visibility: x.css("visibility")});
                    x.not(r.panelActiveClass).hide();
                    f.panels = f.panels.add(x);
                    A.data("easytabs").panel = x
                } else {
                    f.tabs = f.tabs.not(A);
                    if ("console" in window) {
                        console.warn("Warning: tab without matching panel for selector '#" + y + "' removed from set")
                    }
                }
            })
        };
        f.selectTab = function (x, C) {
            var y = window.location, B = y.hash.match(/^[^\?]*/)[0], z = x.parent().data("easytabs").panel, A = x.parent().data("easytabs").ajax;
            if (r.collapsible && !d && (x.hasClass(r.tabActiveClass) || x.hasClass(r.collapsedClass))) {
                f.toggleTabCollapse(x, z, A, C)
            } else {
                if (!x.hasClass(r.tabActiveClass) || !z.hasClass(r.panelActiveClass)) {
                    o(x, z, A, C)
                } else {
                    if (!r.cache) {
                        o(x, z, A, C)
                    }
                }
            }
        };
        f.toggleTabCollapse = function (x, y, z, A) {
            f.panels.stop(true, true);
            if (u(q, "easytabs:before", [x, y, r])) {
                f.tabs.filter("." + r.tabActiveClass).removeClass(r.tabActiveClass).children().removeClass(r.tabActiveClass);
                if (x.hasClass(r.collapsedClass)) {
                    if (z && (!r.cache || !x.parent().data("easytabs").cached)) {
                        q.trigger("easytabs:ajax:beforeSend", [x, y]);
                        y.load(z, function (C, B, D) {
                            x.parent().data("easytabs").cached = true;
                            q.trigger("easytabs:ajax:complete", [x, y, C, B, D])
                        })
                    }
                    x.parent().removeClass(r.collapsedClass).addClass(r.tabActiveClass).children().removeClass(r.collapsedClass).addClass(r.tabActiveClass);
                    y.addClass(r.panelActiveClass)[v.uncollapse](v.speed, r.transitionUncollapseEasing, function () {
                        q.trigger("easytabs:midTransition", [x, y, r]);
                        if (typeof A == "function") {
                            A()
                        }
                    })
                } else {
                    x.addClass(r.collapsedClass).parent().addClass(r.collapsedClass);
                    y.removeClass(r.panelActiveClass)[v.collapse](v.speed, r.transitionCollapseEasing, function () {
                        q.trigger("easytabs:midTransition", [x, y, r]);
                        if (typeof A == "function") {
                            A()
                        }
                    })
                }
            }
        };
        f.matchTab = function (x) {
            return f.tabs.find("[href='" + x + "'],[data-target='" + x + "']").first()
        };
        f.matchInPanel = function (x) {
            return (x && f.validId(x) ? f.panels.filter(":has(" + x + ")").first() : [])
        };
        f.validId = function (x) {
            return x.substr(1).match(/^[A-Za-z]+[A-Za-z0-9\-_:\.].$/)
        };
        f.selectTabFromHashChange = function () {
            var y = window.location.hash.match(/^[^\?]*/)[0], x = f.matchTab(y), z;
            if (r.updateHash) {
                if (x.length) {
                    d = true;
                    f.selectTab(x)
                } else {
                    z = f.matchInPanel(y);
                    if (z.length) {
                        y = "#" + z.attr("id");
                        x = f.matchTab(y);
                        d = true;
                        f.selectTab(x)
                    } else {
                        if (!h.hasClass(r.tabActiveClass) && !r.cycle) {
                            if (y === "" || f.matchTab(m).length || q.closest(y).length) {
                                d = true;
                                f.selectTab(l)
                            }
                        }
                    }
                }
            }
        };
        f.cycleTabs = function (x) {
            if (r.cycle) {
                x = x % f.tabs.length;
                $tab = a(f.tabs[x]).children("a").first();
                d = true;
                f.selectTab($tab, function () {
                    setTimeout(function () {
                        f.cycleTabs(x + 1)
                    }, r.cycle)
                })
            }
        };
        f.publicMethods = {
            select: function (x) {
                var y;
                if ((y = f.tabs.filter(x)).length === 0) {
                    if ((y = f.tabs.find("a[href='" + x + "']")).length === 0) {
                        if ((y = f.tabs.find("a" + x)).length === 0) {
                            if ((y = f.tabs.find("[data-target='" + x + "']")).length === 0) {
                                if ((y = f.tabs.find("a[href$='" + x + "']")).length === 0) {
                                    a.error("Tab '" + x + "' does not exist in tab set")
                                }
                            }
                        }
                    }
                } else {
                    y = y.children("a").first()
                }
                f.selectTab(y)
            }
        };
        var u = function (A, x, z) {
            var y = a.Event(x);
            A.trigger(y, z);
            return y.result !== false
        };
        var b = function () {
            q.addClass(r.containerClass);
            f.tabs.parent().addClass(r.tabsClass);
            f.tabs.addClass(r.tabClass);
            f.panels.addClass(r.panelClass)
        };
        var g = function () {
            var y = window.location.hash.match(/^[^\?]*/)[0], x = f.matchTab(y).parent(), z;
            if (x.length === 1) {
                h = x;
                r.cycle = false
            } else {
                z = f.matchInPanel(y);
                if (z.length) {
                    y = "#" + z.attr("id");
                    h = f.matchTab(y).parent()
                } else {
                    h = f.tabs.parent().find(r.defaultTab);
                    if (h.length === 0) {
                        a.error("The specified default tab ('" + r.defaultTab + "') could not be found in the tab set ('" + r.tabs + "') out of " + f.tabs.length + " tabs.")
                    }
                }
            }
            l = h.children("a").first();
            p(x)
        };
        var p = function (z) {
            var y, x;
            if (r.collapsible && z.length === 0 && r.collapsedByDefault) {
                h.addClass(r.collapsedClass).children().addClass(r.collapsedClass)
            } else {
                y = a(h.data("easytabs").panel);
                x = h.data("easytabs").ajax;
                if (x && (!r.cache || !h.data("easytabs").cached)) {
                    q.trigger("easytabs:ajax:beforeSend", [l, y]);
                    y.load(x, function (B, A, C) {
                        h.data("easytabs").cached = true;
                        q.trigger("easytabs:ajax:complete", [l, y, B, A, C])
                    })
                }
                h.data("easytabs").panel.show().addClass(r.panelActiveClass);
                h.addClass(r.tabActiveClass).children().addClass(r.tabActiveClass)
            }
            q.trigger("easytabs:initialised", [l, y])
        };
        var w = function () {
            f.tabs.children("a").bind(r.bind_str, function (x) {
                r.cycle = false;
                d = false;
                f.selectTab(a(this));
                x.preventDefault ? x.preventDefault() : x.returnValue = false
            })
        };
        var o = function (z, D, E, H) {
            f.panels.stop(true, true);
            if (u(q, "easytabs:before", [z, D, r])) {
                var A = f.panels.filter(":visible"), y = D.parent(), F, x, C, G, B = window.location.hash.match(/^[^\?]*/)[0];
                if (r.animate) {
                    F = s(D);
                    x = A.length ? k(A) : 0;
                    C = F - x
                }
                m = B;
                G = function () {
                    q.trigger("easytabs:midTransition", [z, D, r]);
                    if (r.animate && r.transitionIn == "fadeIn") {
                        if (C < 0) {
                            y.animate({height: y.height() + C}, v.halfSpeed).css({"min-height": ""})
                        }
                    }
                    if (r.updateHash && !d) {
                        window.location.hash = "#" + D.attr("id")
                    } else {
                        d = false
                    }
                    D[v.show](v.speed, r.transitionInEasing, function () {
                        y.css({height: "", "min-height": ""});
                        q.trigger("easytabs:after", [z, D, r]);
                        if (typeof H == "function") {
                            H()
                        }
                    })
                };
                if (E && (!r.cache || !z.parent().data("easytabs").cached)) {
                    q.trigger("easytabs:ajax:beforeSend", [z, D]);
                    D.load(E, function (J, I, K) {
                        z.parent().data("easytabs").cached = true;
                        q.trigger("easytabs:ajax:complete", [z, D, J, I, K])
                    })
                }
                if (r.animate && r.transitionOut == "fadeOut") {
                    if (C > 0) {
                        y.animate({height: (y.height() + C)}, v.halfSpeed)
                    } else {
                        y.css({"min-height": y.height()})
                    }
                }
                f.tabs.filter("." + r.tabActiveClass).removeClass(r.tabActiveClass).children().removeClass(r.tabActiveClass);
                f.tabs.filter("." + r.collapsedClass).removeClass(r.collapsedClass).children().removeClass(r.collapsedClass);
                z.parent().addClass(r.tabActiveClass).children().addClass(r.tabActiveClass);
                f.panels.filter("." + r.panelActiveClass).removeClass(r.panelActiveClass);
                D.addClass(r.panelActiveClass);
                if (A.length) {
                    A[v.hide](v.speed, r.transitionOutEasing, G)
                } else {
                    D[v.uncollapse](v.speed, r.transitionUncollapseEasing, G)
                }
            }
        };
        var s = function (z) {
            if (z.data("easytabs") && z.data("easytabs").lastHeight) {
                return z.data("easytabs").lastHeight
            }
            var B = z.css("display"), y, x;
            try {
                y = a("<div></div>", {position: "absolute", visibility: "hidden", overflow: "hidden"})
            } catch (A) {
                y = a("<div></div>", {visibility: "hidden", overflow: "hidden"})
            }
            x = z.wrap(y).css({position: "relative", visibility: "hidden", display: "block"}).outerHeight();
            z.unwrap();
            z.css({position: z.data("easytabs").position, visibility: z.data("easytabs").visibility, display: B});
            z.data("easytabs").lastHeight = x;
            return x
        };
        var k = function (y) {
            var x = y.outerHeight();
            if (y.data("easytabs")) {
                y.data("easytabs").lastHeight = x
            } else {
                y.data("easytabs", {lastHeight: x})
            }
            return x
        };
        var n = function () {
            if (typeof a(window).hashchange === "function") {
                a(window).hashchange(function () {
                    f.selectTabFromHashChange()
                })
            } else {
                if (a.address && typeof a.address.change === "function") {
                    a.address.change(function () {
                        f.selectTabFromHashChange()
                    })
                }
            }
        };
        var c = function () {
            var x;
            if (r.cycle) {
                x = f.tabs.index(h);
                setTimeout(function () {
                    f.cycleTabs(x + 1)
                }, r.cycle)
            }
        };
        f.init()
    };
    a.fn.easytabs = function (c) {
        var b = arguments;
        return this.each(function () {
            var e = a(this), d = e.data("easytabs");
            if (undefined === d) {
                d = new a.easytabs(this, c);
                e.data("easytabs", d)
            }
            if (d.publicMethods[c]) {
                return d.publicMethods[c](Array.prototype.slice.call(b, 1))
            }
        })
    }
})(jQuery);


/*global jQuery */
/*jshint browser:true */
/*!
 * FitVids 1.1
 *
 * Copyright 2013, Chris Coyier - http://css-tricks.com + Dave Rupert - http://daverupert.com
 * Credit to Thierry Koblentz - http://www.alistapart.com/articles/creating-intrinsic-ratios-for-video/
 * Released under the WTFPL license - http://sam.zoy.org/wtfpl/
 *
 */

(function ($) {

    "use strict";

    $.fn.fitVids = function (options) {
        var settings = {
            customSelector: null
        };

        if (!document.getElementById('fit-vids-style')) {
            // appendStyles: https://github.com/toddmotto/fluidvids/blob/master/dist/fluidvids.js
            var head = document.head || document.getElementsByTagName('head')[0];
            var css = '.fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}';
            var div = document.createElement('div');
            div.innerHTML = '<p>x</p><style id="fit-vids-style">' + css + '</style>';
            head.appendChild(div.childNodes[1]);
        }

        if (options) {
            $.extend(settings, options);
        }

        return this.each(function () {
            var selectors = [
                "iframe[src*='player.vimeo.com']",
                "iframe[src*='youtube.com']",
                "iframe[src*='youtube-nocookie.com']",
                "iframe[src*='kickstarter.com'][src*='video.html']",
                "object",
                "embed"
            ];

            if (settings.customSelector) {
                selectors.push(settings.customSelector);
            }

            var $allVideos = $(this).find(selectors.join(','));
            $allVideos = $allVideos.not("object object"); // SwfObj conflict patch

            $allVideos.each(function () {
                var $this = $(this);
                if (this.tagName.toLowerCase() === 'embed' && $this.parent('object').length || $this.parent('.fluid-width-video-wrapper').length) {
                    return;
                }
                var height = ( this.tagName.toLowerCase() === 'object' || ($this.attr('height') && !isNaN(parseInt($this.attr('height'), 10))) ) ? parseInt($this.attr('height'), 10) : $this.height(),
                    width = !isNaN(parseInt($this.attr('width'), 10)) ? parseInt($this.attr('width'), 10) : $this.width(),
                    aspectRatio = height / width;
                if (!$this.attr('id')) {
                    var videoID = 'fitvid' + Math.floor(Math.random() * 999999);
                    $this.attr('id', videoID);
                }
                $this.wrap('<div class="fluid-width-video-wrapper"></div>').parent('.fluid-width-video-wrapper').css('padding-top', (aspectRatio * 100) + "%");
                $this.removeAttr('height').removeAttr('width');
            });
        });
    };
// Works with either jQuery or Zepto
})(window.jQuery || window.Zepto);


var q = null;
window.PR_SHOULD_USE_CONTINUATION = !0;
(function () {
    function L(a) {
        function m(a) {
            var f = a.charCodeAt(0);
            if (f !== 92)return f;
            var b = a.charAt(1);
            return (f = r[b]) ? f : "0" <= b && b <= "7" ? parseInt(a.substring(1), 8) : b === "u" || b === "x" ? parseInt(a.substring(2), 16) : a.charCodeAt(1)
        }

        function e(a) {
            if (a < 32)return (a < 16 ? "\\x0" : "\\x") + a.toString(16);
            a = String.fromCharCode(a);
            if (a === "\\" || a === "-" || a === "[" || a === "]")a = "\\" + a;
            return a
        }

        function h(a) {
            for (var f = a.substring(1, a.length - 1).match(/\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\[0-3][0-7]{0,2}|\\[0-7]{1,2}|\\[\S\s]|[^\\]/g), a =
                [], b = [], o = f[0] === "^", c = o ? 1 : 0, i = f.length; c < i; ++c) {
                var j = f[c];
                if (/\\[bdsw]/i.test(j))a.push(j); else {
                    var j = m(j), d;
                    c + 2 < i && "-" === f[c + 1] ? (d = m(f[c + 2]), c += 2) : d = j;
                    b.push([j, d]);
                    d < 65 || j > 122 || (d < 65 || j > 90 || b.push([Math.max(65, j) | 32, Math.min(d, 90) | 32]), d < 97 || j > 122 || b.push([Math.max(97, j) & -33, Math.min(d, 122) & -33]))
                }
            }
            b.sort(function (a, f) {
                return a[0] - f[0] || f[1] - a[1]
            });
            f = [];
            j = [NaN, NaN];
            for (c = 0; c < b.length; ++c)i = b[c], i[0] <= j[1] + 1 ? j[1] = Math.max(j[1], i[1]) : f.push(j = i);
            b = ["["];
            o && b.push("^");
            b.push.apply(b, a);
            for (c = 0; c <
            f.length; ++c)i = f[c], b.push(e(i[0])), i[1] > i[0] && (i[1] + 1 > i[0] && b.push("-"), b.push(e(i[1])));
            b.push("]");
            return b.join("")
        }

        function y(a) {
            for (var f = a.source.match(/\[(?:[^\\\]]|\\[\S\s])*]|\\u[\dA-Fa-f]{4}|\\x[\dA-Fa-f]{2}|\\\d+|\\[^\dux]|\(\?[!:=]|[()^]|[^()[\\^]+/g), b = f.length, d = [], c = 0, i = 0; c < b; ++c) {
                var j = f[c];
                j === "(" ? ++i : "\\" === j.charAt(0) && (j = +j.substring(1)) && j <= i && (d[j] = -1)
            }
            for (c = 1; c < d.length; ++c)-1 === d[c] && (d[c] = ++t);
            for (i = c = 0; c < b; ++c)j = f[c], j === "(" ? (++i, d[i] === void 0 && (f[c] = "(?:")) : "\\" === j.charAt(0) &&
            (j = +j.substring(1)) && j <= i && (f[c] = "\\" + d[i]);
            for (i = c = 0; c < b; ++c)"^" === f[c] && "^" !== f[c + 1] && (f[c] = "");
            if (a.ignoreCase && s)for (c = 0; c < b; ++c)j = f[c], a = j.charAt(0), j.length >= 2 && a === "[" ? f[c] = h(j) : a !== "\\" && (f[c] = j.replace(/[A-Za-z]/g, function (a) {
                a = a.charCodeAt(0);
                return "[" + String.fromCharCode(a & -33, a | 32) + "]"
            }));
            return f.join("")
        }

        for (var t = 0, s = !1, l = !1, p = 0, d = a.length; p < d; ++p) {
            var g = a[p];
            if (g.ignoreCase)l = !0; else if (/[a-z]/i.test(g.source.replace(/\\u[\da-f]{4}|\\x[\da-f]{2}|\\[^UXux]/gi, ""))) {
                s = !0;
                l = !1;
                break
            }
        }
        for (var r =
        {b: 8, t: 9, n: 10, v: 11, f: 12, r: 13}, n = [], p = 0, d = a.length; p < d; ++p) {
            g = a[p];
            if (g.global || g.multiline)throw Error("" + g);
            n.push("(?:" + y(g) + ")")
        }
        return RegExp(n.join("|"), l ? "gi" : "g")
    }

    function M(a) {
        function m(a) {
            switch (a.nodeType) {
                case 1:
                    if (e.test(a.className))break;
                    for (var g = a.firstChild; g; g = g.nextSibling)m(g);
                    g = a.nodeName;
                    if ("BR" === g || "LI" === g)h[s] = "\n", t[s << 1] = y++, t[s++ << 1 | 1] = a;
                    break;
                case 3:
                case 4:
                    g = a.nodeValue, g.length && (g = p ? g.replace(/\r\n?/g, "\n") : g.replace(/[\t\n\r ]+/g, " "), h[s] = g, t[s << 1] = y, y += g.length,
                        t[s++ << 1 | 1] = a)
            }
        }

        var e = /(?:^|\s)nocode(?:\s|$)/, h = [], y = 0, t = [], s = 0, l;
        a.currentStyle ? l = a.currentStyle.whiteSpace : window.getComputedStyle && (l = document.defaultView.getComputedStyle(a, q).getPropertyValue("white-space"));
        var p = l && "pre" === l.substring(0, 3);
        m(a);
        return {a: h.join("").replace(/\n$/, ""), c: t}
    }

    function B(a, m, e, h) {
        m && (a = {a: m, d: a}, e(a), h.push.apply(h, a.e))
    }

    function x(a, m) {
        function e(a) {
            for (var l = a.d, p = [l, "pln"], d = 0, g = a.a.match(y) || [], r = {}, n = 0, z = g.length; n < z; ++n) {
                var f = g[n], b = r[f], o = void 0, c;
                if (typeof b ===
                    "string")c = !1; else {
                    var i = h[f.charAt(0)];
                    if (i)o = f.match(i[1]), b = i[0]; else {
                        for (c = 0; c < t; ++c)if (i = m[c], o = f.match(i[1])) {
                            b = i[0];
                            break
                        }
                        o || (b = "pln")
                    }
                    if ((c = b.length >= 5 && "lang-" === b.substring(0, 5)) && !(o && typeof o[1] === "string"))c = !1, b = "src";
                    c || (r[f] = b)
                }
                i = d;
                d += f.length;
                if (c) {
                    c = o[1];
                    var j = f.indexOf(c), k = j + c.length;
                    o[2] && (k = f.length - o[2].length, j = k - c.length);
                    b = b.substring(5);
                    B(l + i, f.substring(0, j), e, p);
                    B(l + i + j, c, C(b, c), p);
                    B(l + i + k, f.substring(k), e, p)
                } else p.push(l + i, b)
            }
            a.e = p
        }

        var h = {}, y;
        (function () {
            for (var e = a.concat(m),
                     l = [], p = {}, d = 0, g = e.length; d < g; ++d) {
                var r = e[d], n = r[3];
                if (n)for (var k = n.length; --k >= 0;)h[n.charAt(k)] = r;
                r = r[1];
                n = "" + r;
                p.hasOwnProperty(n) || (l.push(r), p[n] = q)
            }
            l.push(/[\S\s]/);
            y = L(l)
        })();
        var t = m.length;
        return e
    }

    function u(a) {
        var m = [], e = [];
        a.tripleQuotedStrings ? m.push(["str", /^(?:'''(?:[^'\\]|\\[\S\s]|''?(?=[^']))*(?:'''|$)|"""(?:[^"\\]|\\[\S\s]|""?(?=[^"]))*(?:"""|$)|'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$))/, q, "'\""]) : a.multiLineStrings ? m.push(["str", /^(?:'(?:[^'\\]|\\[\S\s])*(?:'|$)|"(?:[^"\\]|\\[\S\s])*(?:"|$)|`(?:[^\\`]|\\[\S\s])*(?:`|$))/,
            q, "'\"`"]) : m.push(["str", /^(?:'(?:[^\n\r'\\]|\\.)*(?:'|$)|"(?:[^\n\r"\\]|\\.)*(?:"|$))/, q, "\"'"]);
        a.verbatimStrings && e.push(["str", /^@"(?:[^"]|"")*(?:"|$)/, q]);
        var h = a.hashComments;
        h && (a.cStyleComments ? (h > 1 ? m.push(["com", /^#(?:##(?:[^#]|#(?!##))*(?:###|$)|.*)/, q, "#"]) : m.push(["com", /^#(?:(?:define|elif|else|endif|error|ifdef|include|ifndef|line|pragma|undef|warning)\b|[^\n\r]*)/, q, "#"]), e.push(["str", /^<(?:(?:(?:\.\.\/)*|\/?)(?:[\w-]+(?:\/[\w-]+)+)?[\w-]+\.h|[a-z]\w*)>/, q])) : m.push(["com", /^#[^\n\r]*/,
            q, "#"]));
        a.cStyleComments && (e.push(["com", /^\/\/[^\n\r]*/, q]), e.push(["com", /^\/\*[\S\s]*?(?:\*\/|$)/, q]));
        a.regexLiterals && e.push(["lang-regex", /^(?:^^\.?|[!+-]|!=|!==|#|%|%=|&|&&|&&=|&=|\(|\*|\*=|\+=|,|-=|->|\/|\/=|:|::|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|[?@[^]|\^=|\^\^|\^\^=|{|\||\|=|\|\||\|\|=|~|break|case|continue|delete|do|else|finally|instanceof|return|throw|try|typeof)\s*(\/(?=[^*/])(?:[^/[\\]|\\[\S\s]|\[(?:[^\\\]]|\\[\S\s])*(?:]|$))+\/)/]);
        (h = a.types) && e.push(["typ", h]);
        a = ("" + a.keywords).replace(/^ | $/g,
            "");
        a.length && e.push(["kwd", RegExp("^(?:" + a.replace(/[\s,]+/g, "|") + ")\\b"), q]);
        m.push(["pln", /^\s+/, q, " \r\n\t\xa0"]);
        e.push(["lit", /^@[$_a-z][\w$@]*/i, q], ["typ", /^(?:[@_]?[A-Z]+[a-z][\w$@]*|\w+_t\b)/, q], ["pln", /^[$_a-z][\w$@]*/i, q], ["lit", /^(?:0x[\da-f]+|(?:\d(?:_\d+)*\d*(?:\.\d*)?|\.\d\+)(?:e[+-]?\d+)?)[a-z]*/i, q, "0123456789"], ["pln", /^\\[\S\s]?/, q], ["pun", /^.[^\s\w"-$'./@\\`]*/, q]);
        return x(m, e)
    }

    function D(a, m) {
        function e(a) {
            switch (a.nodeType) {
                case 1:
                    if (k.test(a.className))break;
                    if ("BR" === a.nodeName)h(a),
                    a.parentNode && a.parentNode.removeChild(a); else for (a = a.firstChild; a; a = a.nextSibling)e(a);
                    break;
                case 3:
                case 4:
                    if (p) {
                        var b = a.nodeValue, d = b.match(t);
                        if (d) {
                            var c = b.substring(0, d.index);
                            a.nodeValue = c;
                            (b = b.substring(d.index + d[0].length)) && a.parentNode.insertBefore(s.createTextNode(b), a.nextSibling);
                            h(a);
                            c || a.parentNode.removeChild(a)
                        }
                    }
            }
        }

        function h(a) {
            function b(a, d) {
                var e = d ? a.cloneNode(!1) : a, f = a.parentNode;
                if (f) {
                    var f = b(f, 1), g = a.nextSibling;
                    f.appendChild(e);
                    for (var h = g; h; h = g)g = h.nextSibling, f.appendChild(h)
                }
                return e
            }

            for (; !a.nextSibling;)if (a = a.parentNode, !a)return;
            for (var a = b(a.nextSibling, 0), e; (e = a.parentNode) && e.nodeType === 1;)a = e;
            d.push(a)
        }

        var k = /(?:^|\s)nocode(?:\s|$)/, t = /\r\n?|\n/, s = a.ownerDocument, l;
        a.currentStyle ? l = a.currentStyle.whiteSpace : window.getComputedStyle && (l = s.defaultView.getComputedStyle(a, q).getPropertyValue("white-space"));
        var p = l && "pre" === l.substring(0, 3);
        for (l = s.createElement("LI"); a.firstChild;)l.appendChild(a.firstChild);
        for (var d = [l], g = 0; g < d.length; ++g)e(d[g]);
        m === (m | 0) && d[0].setAttribute("value",
            m);
        var r = s.createElement("OL");
        r.className = "linenums";
        for (var n = Math.max(0, m - 1 | 0) || 0, g = 0, z = d.length; g < z; ++g)l = d[g], l.className = "L" + (g + n) % 10, l.firstChild || l.appendChild(s.createTextNode("\xa0")), r.appendChild(l);
        a.appendChild(r)
    }

    function k(a, m) {
        for (var e = m.length; --e >= 0;) {
            var h = m[e];
            A.hasOwnProperty(h) ? window.console && console.warn("cannot override language handler %s", h) : A[h] = a
        }
    }

    function C(a, m) {
        if (!a || !A.hasOwnProperty(a))a = /^\s*</.test(m) ? "default-markup" : "default-code";
        return A[a]
    }

    function E(a) {
        var m =
            a.g;
        try {
            var e = M(a.h), h = e.a;
            a.a = h;
            a.c = e.c;
            a.d = 0;
            C(m, h)(a);
            var k = /\bMSIE\b/.test(navigator.userAgent), m = /\n/g, t = a.a, s = t.length, e = 0, l = a.c, p = l.length, h = 0, d = a.e, g = d.length, a = 0;
            d[g] = s;
            var r, n;
            for (n = r = 0; n < g;)d[n] !== d[n + 2] ? (d[r++] = d[n++], d[r++] = d[n++]) : n += 2;
            g = r;
            for (n = r = 0; n < g;) {
                for (var z = d[n], f = d[n + 1], b = n + 2; b + 2 <= g && d[b + 1] === f;)b += 2;
                d[r++] = z;
                d[r++] = f;
                n = b
            }
            for (d.length = r; h < p;) {
                var o = l[h + 2] || s, c = d[a + 2] || s, b = Math.min(o, c), i = l[h + 1], j;
                if (i.nodeType !== 1 && (j = t.substring(e, b))) {
                    k && (j = j.replace(m, "\r"));
                    i.nodeValue =
                        j;
                    var u = i.ownerDocument, v = u.createElement("SPAN");
                    v.className = d[a + 1];
                    var x = i.parentNode;
                    x.replaceChild(v, i);
                    v.appendChild(i);
                    e < o && (l[h + 1] = i = u.createTextNode(t.substring(b, o)), x.insertBefore(i, v.nextSibling))
                }
                e = b;
                e >= o && (h += 2);
                e >= c && (a += 2)
            }
        } catch (w) {
            "console" in window && console.log(w && w.stack ? w.stack : w)
        }
    }

    var v = ["break,continue,do,else,for,if,return,while"], w = [[v, "auto,case,char,const,default,double,enum,extern,float,goto,int,long,register,short,signed,sizeof,static,struct,switch,typedef,union,unsigned,void,volatile"],
            "catch,class,delete,false,import,new,operator,private,protected,public,this,throw,true,try,typeof"], F = [w, "alignof,align_union,asm,axiom,bool,concept,concept_map,const_cast,constexpr,decltype,dynamic_cast,explicit,export,friend,inline,late_check,mutable,namespace,nullptr,reinterpret_cast,static_assert,static_cast,template,typeid,typename,using,virtual,where"], G = [w, "abstract,boolean,byte,extends,final,finally,implements,import,instanceof,null,native,package,strictfp,super,synchronized,throws,transient"],
        H = [G, "as,base,by,checked,decimal,delegate,descending,dynamic,event,fixed,foreach,from,group,implicit,in,interface,internal,into,is,lock,object,out,override,orderby,params,partial,readonly,ref,sbyte,sealed,stackalloc,string,select,uint,ulong,unchecked,unsafe,ushort,var"], w = [w, "debugger,eval,export,function,get,null,set,undefined,var,with,Infinity,NaN"], I = [v, "and,as,assert,class,def,del,elif,except,exec,finally,from,global,import,in,is,lambda,nonlocal,not,or,pass,print,raise,try,with,yield,False,True,None"],
        J = [v, "alias,and,begin,case,class,def,defined,elsif,end,ensure,false,in,module,next,nil,not,or,redo,rescue,retry,self,super,then,true,undef,unless,until,when,yield,BEGIN,END"], v = [v, "case,done,elif,esac,eval,fi,function,in,local,set,then,until"], K = /^(DIR|FILE|vector|(de|priority_)?queue|list|stack|(const_)?iterator|(multi)?(set|map)|bitset|u?(int|float)\d*)/, N = /\S/, O = u({
            keywords: [F, H, w, "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END" +
            I, J, v], hashComments: !0, cStyleComments: !0, multiLineStrings: !0, regexLiterals: !0
        }), A = {};
    k(O, ["default-code"]);
    k(x([], [["pln", /^[^<?]+/], ["dec", /^<!\w[^>]*(?:>|$)/], ["com", /^<\!--[\S\s]*?(?:--\>|$)/], ["lang-", /^<\?([\S\s]+?)(?:\?>|$)/], ["lang-", /^<%([\S\s]+?)(?:%>|$)/], ["pun", /^(?:<[%?]|[%?]>)/], ["lang-", /^<xmp\b[^>]*>([\S\s]+?)<\/xmp\b[^>]*>/i], ["lang-js", /^<script\b[^>]*>([\S\s]*?)(<\/script\b[^>]*>)/i], ["lang-css", /^<style\b[^>]*>([\S\s]*?)(<\/style\b[^>]*>)/i], ["lang-in.tag", /^(<\/?[a-z][^<>]*>)/i]]),
        ["default-markup", "htm", "html", "mxml", "xhtml", "xml", "xsl"]);
    k(x([["pln", /^\s+/, q, " \t\r\n"], ["atv", /^(?:"[^"]*"?|'[^']*'?)/, q, "\"'"]], [["tag", /^^<\/?[a-z](?:[\w-.:]*\w)?|\/?>$/i], ["atn", /^(?!style[\s=]|on)[a-z](?:[\w:-]*\w)?/i], ["lang-uq.val", /^=\s*([^\s"'>]*(?:[^\s"'/>]|\/(?=\s)))/], ["pun", /^[/<->]+/], ["lang-js", /^on\w+\s*=\s*"([^"]+)"/i], ["lang-js", /^on\w+\s*=\s*'([^']+)'/i], ["lang-js", /^on\w+\s*=\s*([^\s"'>]+)/i], ["lang-css", /^style\s*=\s*"([^"]+)"/i], ["lang-css", /^style\s*=\s*'([^']+)'/i], ["lang-css",
        /^style\s*=\s*([^\s"'>]+)/i]]), ["in.tag"]);
    k(x([], [["atv", /^[\S\s]+/]]), ["uq.val"]);
    k(u({keywords: F, hashComments: !0, cStyleComments: !0, types: K}), ["c", "cc", "cpp", "cxx", "cyc", "m"]);
    k(u({keywords: "null,true,false"}), ["json"]);
    k(u({keywords: H, hashComments: !0, cStyleComments: !0, verbatimStrings: !0, types: K}), ["cs"]);
    k(u({keywords: G, cStyleComments: !0}), ["java"]);
    k(u({keywords: v, hashComments: !0, multiLineStrings: !0}), ["bsh", "csh", "sh"]);
    k(u({keywords: I, hashComments: !0, multiLineStrings: !0, tripleQuotedStrings: !0}),
        ["cv", "py"]);
    k(u({
        keywords: "caller,delete,die,do,dump,elsif,eval,exit,foreach,for,goto,if,import,last,local,my,next,no,our,print,package,redo,require,sub,undef,unless,until,use,wantarray,while,BEGIN,END",
        hashComments: !0,
        multiLineStrings: !0,
        regexLiterals: !0
    }), ["perl", "pl", "pm"]);
    k(u({keywords: J, hashComments: !0, multiLineStrings: !0, regexLiterals: !0}), ["rb"]);
    k(u({keywords: w, cStyleComments: !0, regexLiterals: !0}), ["js"]);
    k(u({
        keywords: "all,and,by,catch,class,else,extends,false,finally,for,if,in,is,isnt,loop,new,no,not,null,of,off,on,or,return,super,then,true,try,unless,until,when,while,yes",
        hashComments: 3, cStyleComments: !0, multilineStrings: !0, tripleQuotedStrings: !0, regexLiterals: !0
    }), ["coffee"]);
    k(x([], [["str", /^[\S\s]+/]]), ["regex"]);
    window.prettyPrintOne = function (a, m, e) {
        var h = document.createElement("PRE");
        h.innerHTML = a;
        e && D(h, e);
        E({g: m, i: e, h: h});
        return h.innerHTML
    };
    window.prettyPrint = function (a) {
        function m() {
            for (var e = window.PR_SHOULD_USE_CONTINUATION ? l.now() + 250 : Infinity; p < h.length && l.now() < e; p++) {
                var n = h[p], k = n.className;
                if (k.indexOf("prettyprint") >= 0) {
                    var k = k.match(g), f, b;
                    if (b = !k) {
                        b = n;
                        for (var o = void 0, c = b.firstChild; c; c = c.nextSibling)var i = c.nodeType, o = i === 1 ? o ? b : c : i === 3 ? N.test(c.nodeValue) ? b : o : o;
                        b = (f = o === b ? void 0 : o) && "CODE" === f.tagName
                    }
                    b && (k = f.className.match(g));
                    k && (k = k[1]);
                    b = !1;
                    for (o = n.parentNode; o; o = o.parentNode)if ((o.tagName === "pre" || o.tagName === "code" || o.tagName === "xmp") && o.className && o.className.indexOf("prettyprint") >= 0) {
                        b = !0;
                        break
                    }
                    b || ((b = (b = n.className.match(/\blinenums\b(?::(\d+))?/)) ? b[1] && b[1].length ? +b[1] : !0 : !1) && D(n, b), d = {
                        g: k,
                        h: n,
                        i: b
                    }, E(d))
                }
            }
            p < h.length ? setTimeout(m,
                250) : a && a()
        }

        for (var e = [document.getElementsByTagName("pre"), document.getElementsByTagName("code"), document.getElementsByTagName("xmp")], h = [], k = 0; k < e.length; ++k)for (var t = 0, s = e[k].length; t < s; ++t)h.push(e[k][t]);
        var e = q, l = Date;
        l.now || (l = {
            now: function () {
                return +new Date
            }
        });
        var p = 0, d, g = /\blang(?:uage)?-([\w.]+)(?!\S)/;
        m()
    };
    window.PR = {
        createSimpleLexer: x,
        registerLangHandler: k,
        sourceDecorator: u,
        PR_ATTRIB_NAME: "atn",
        PR_ATTRIB_VALUE: "atv",
        PR_COMMENT: "com",
        PR_DECLARATION: "dec",
        PR_KEYWORD: "kwd",
        PR_LITERAL: "lit",
        PR_NOCODE: "nocode",
        PR_PLAIN: "pln",
        PR_PUNCTUATION: "pun",
        PR_SOURCE: "src",
        PR_STRING: "str",
        PR_TAG: "tag",
        PR_TYPE: "typ"
    }
})();

/**************************************************************************
 * jquery.themepunch.revolution.js - jQuery Plugin for Revolution Slider
 * @version: 4.6.4 (26.11.2014)
 * @requires jQuery v1.7 or later (tested on 1.9)
 * @author ThemePunch
 **************************************************************************/


function revslider_showDoubleJqueryError(e) {
    var t = "Revolution Slider Error: You have some jquery.js library include that comes after the revolution files js include.";
    t += "<br> This includes make eliminates the revolution slider libraries, and make it not work.";
    t += "<br><br> To fix it you can:<br>&nbsp;&nbsp;&nbsp; 1. In the Slider Settings -> Troubleshooting set option:  <strong><b>Put JS Includes To Body</b></strong> option to true.";
    t += "<br>&nbsp;&nbsp;&nbsp; 2. Find the double jquery.js include and remove it.";
    t = "<span style='font-size:16px;color:#BC0C06;'>" + t + "</span>";
    jQuery(e).show().html(t)
}
(function (e, t) {
    function n() {
        var e = false;
        if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/iPad/i)) {
            if (navigator.userAgent.match(/OS 4_\d like Mac OS X/i)) {
                e = true
            }
        } else {
            e = false
        }
        return e
    }

    function r(r, i) {
        if (r == t)return false;
        if (r.data("aimg") != t) {
            if (r.data("aie8") == "enabled" && a(8) || r.data("amobile") == "enabled" && J())r.html('<img class="tp-slider-alternative-image" src="' + r.data("aimg") + '">')
        }
        if (i.navigationStyle == "preview1" || i.navigationStyle == "preview3" || i.navigationStyle == "preview4") {
            i.soloArrowLeftHalign = "left";
            i.soloArrowLeftValign = "center";
            i.soloArrowLeftHOffset = 0;
            i.soloArrowLeftVOffset = 0;
            i.soloArrowRightHalign = "right";
            i.soloArrowRightValign = "center";
            i.soloArrowRightHOffset = 0;
            i.soloArrowRightVOffset = 0;
            i.navigationArrows = "solo"
        }
        if (i.simplifyAll == "on" && (a(8) || n())) {
            r.find(".tp-caption").each(function () {
                var t = e(this);
                t.removeClass("customin").removeClass("customout").addClass("fadein").addClass("fadeout");
                t.data("splitin", "");
                t.data("speed", 400)
            });
            r.find(">ul>li").each(function () {
                var t = e(this);
                t.data("transition", "fade");
                t.data("masterspeed", 500);
                t.data("slotamount", 1);
                var n = t.find(">img").first();
                n.data("kenburns", "off")
            })
        }
        i.desktop = !navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|BB10|mobi|tablet|opera mini|nexus 7)/i);
        if (i.fullWidth != "on" && i.fullScreen != "on")i.autoHeight = "off";
        if (i.fullScreen == "on")i.autoHeight = "on";
        if (i.fullWidth != "on" && i.fullScreen != "on")forceFulWidth = "off";
        if (i.fullWidth == "on" && i.autoHeight == "off")r.css({maxHeight: i.startheight + "px"});
        if (J() && i.hideThumbsOnMobile == "on" && i.navigationType == "thumb")i.navigationType = "none";
        if (J() && i.hideBulletsOnMobile == "on" && i.navigationType == "bullet")i.navigationType = "none";
        if (J() && i.hideBulletsOnMobile == "on" && i.navigationType == "both")i.navigationType = "none";
        if (J() && i.hideArrowsOnMobile == "on")i.navigationArrows = "none";
        if (i.forceFullWidth == "on" && r.closest(".forcefullwidth_wrapper_tp_banner").length == 0) {
            var f = r.parent().offset().left;
            var v = r.parent().css("marginBottom");
            var m = r.parent().css("marginTop");
            if (v == t)v = 0;
            if (m == t)m = 0;
            r.parent().wrap('<div style="position:relative;width:100%;height:auto;margin-top:' + m + ";margin-bottom:" + v + '" class="forcefullwidth_wrapper_tp_banner"></div>');
            r.closest(".forcefullwidth_wrapper_tp_banner").append('<div class="tp-fullwidth-forcer" style="width:100%;height:' + r.height() + 'px"></div>');
            r.css({
                backgroundColor: r.parent().css("backgroundColor"),
                backgroundImage: r.parent().css("backgroundImage")
            });
            r.parent().css({left: 0 - f + "px", position: "absolute", width: e(window).width()});
            i.width = e(window).width()
        }
        try {
            if (i.hideThumbsUnderResolution > e(window).width() && i.hideThumbsUnderResolution != 0) {
                r.parent().find(".tp-bullets.tp-thumbs").css({display: "none"})
            } else {
                r.parent().find(".tp-bullets.tp-thumbs").css({display: "block"})
            }
        } catch (g) {
        }
        if (!r.hasClass("revslider-initialised")) {
            r.addClass("revslider-initialised");
            if (r.attr("id") == t)r.attr("id", "revslider-" + Math.round(Math.random() * 1e3 + 5));
            i.firefox13 = false;
            i.ie = !e.support.opacity;
            i.ie9 = document.documentMode == 9;
            i.origcd = i.delay;
            var b = e.fn.jquery.split("."), w = parseFloat(b[0]), E = parseFloat(b[1]), S = parseFloat(b[2] || "0");
            if (w == 1 && E < 7) {
                r.html('<div style="text-align:center; padding:40px 0px; font-size:20px; color:#992222;"> The Current Version of jQuery:' + b + " <br>Please update your jQuery Version to min. 1.7 in Case you wish to use the Revolution Slider Plugin</div>")
            }
            if (w > 1)i.ie = false;
            if (!e.support.transition)e.fn.transition = e.fn.animate;
            r.find(".caption").each(function () {
                e(this).addClass("tp-caption")
            });
            if (J()) {
                r.find(".tp-caption").each(function () {
                    var t = e(this);
                    if (t.data("autoplayonlyfirsttime") == true || t.data("autoplayonlyfirsttime") == "true")t.data("autoplayonlyfirsttime", "false");
                    if (t.data("autoplay") == true || t.data("autoplay") == "true")t.data("autoplay", false)
                })
            }
            var x = 0;
            var T = 0;
            var C = 0;
            var k = "http";
            if (location.protocol === "https:") {
                k = "https"
            }
            r.find(".tp-caption").each(function (n) {
                try {
                    if ((e(this).data("ytid") != t || e(this).find("iframe").attr("src").toLowerCase().indexOf("youtube") > 0) && x == 0) {
                        x = 1;
                        var r = document.createElement("script");
                        var i = "https";
                        r.src = i + "://www.youtube.com/iframe_api";
                        var s = document.getElementsByTagName("script")[0];
                        var o = true;
                        e("head").find("*").each(function () {
                            if (e(this).attr("src") == i + "://www.youtube.com/iframe_api")o = false
                        });
                        if (o) {
                            s.parentNode.insertBefore(r, s)
                        }
                    }
                } catch (u) {
                }
                try {
                    if ((e(this).data("vimeoid") != t || e(this).find("iframe").attr("src").toLowerCase().indexOf("vimeo") > 0) && T == 0) {
                        T = 1;
                        var a = document.createElement("script");
                        a.src = k + "://a.vimeocdn.com/js/froogaloop2.min.js";
                        var s = document.getElementsByTagName("script")[0];
                        var o = true;
                        e("head").find("*").each(function () {
                            if (e(this).attr("src") == k + "://a.vimeocdn.com/js/froogaloop2.min.js")o = false
                        });
                        if (o)s.parentNode.insertBefore(a, s)
                    }
                } catch (u) {
                }
                try {
                    if (e(this).data("videomp4") != t || e(this).data("videowebm") != t) {
                    }
                } catch (u) {
                }
            });
            r.find(".tp-caption video").each(function (t) {
                e(this).removeClass("video-js").removeClass("vjs-default-skin");
                e(this).attr("preload", "");
                e(this).css({display: "none"})
            });
            r.find(">ul:first-child >li").each(function () {
                var t = e(this);
                t.data("origindex", t.index())
            });
            if (i.shuffle == "on") {
                var L = new Object, A = r.find(">ul:first-child >li:first-child");
                L.fstransition = A.data("fstransition");
                L.fsmasterspeed = A.data("fsmasterspeed");
                L.fsslotamount = A.data("fsslotamount");
                for (var O = 0; O < r.find(">ul:first-child >li").length; O++) {
                    var M = Math.round(Math.random() * r.find(">ul:first-child >li").length);
                    r.find(">ul:first-child >li:eq(" + M + ")").prependTo(r.find(">ul:first-child"))
                }
                var _ = r.find(">ul:first-child >li:first-child");
                _.data("fstransition", L.fstransition);
                _.data("fsmasterspeed", L.fsmasterspeed);
                _.data("fsslotamount", L.fsslotamount)
            }
            i.slots = 4;
            i.act = -1;
            i.next = 0;
            if (i.startWithSlide != t)i.next = i.startWithSlide;
            var D = o("#")[0];
            if (D.length < 9) {
                if (D.split("slide").length > 1) {
                    var P = parseInt(D.split("slide")[1], 0);
                    if (P < 1)P = 1;
                    if (P > r.find(">ul:first >li").length)P = r.find(">ul:first >li").length;
                    i.next = P - 1
                }
            }
            i.firststart = 1;
            if (i.navigationHOffset == t)i.navOffsetHorizontal = 0;
            if (i.navigationVOffset == t)i.navOffsetVertical = 0;
            r.append('<div class="tp-loader ' + i.spinner + '">' + '<div class="dot1"></div>' + '<div class="dot2"></div>' + '<div class="bounce1"></div>' + '<div class="bounce2"></div>' + '<div class="bounce3"></div>' + "</div>");
            if (r.find(".tp-bannertimer").length == 0)r.append('<div class="tp-bannertimer" style="visibility:hidden"></div>');
            var H = r.find(".tp-bannertimer");
            if (H.length > 0) {
                H.css({width: "0%"})
            }
            r.addClass("tp-simpleresponsive");
            i.container = r;
            i.slideamount = r.find(">ul:first >li").length;
            if (r.height() == 0)r.height(i.startheight);
            if (i.startwidth == t || i.startwidth == 0)i.startwidth = r.width();
            if (i.startheight == t || i.startheight == 0)i.startheight = r.height();
            i.width = r.width();
            i.height = r.height();
            i.bw = i.startwidth / r.width();
            i.bh = i.startheight / r.height();
            if (i.width != i.startwidth) {
                i.height = Math.round(i.startheight * (i.width / i.startwidth));
                r.height(i.height)
            }
            if (i.shadow != 0) {
                r.parent().append('<div class="tp-bannershadow tp-shadow' + i.shadow + '"></div>');
                var f = 0;
                if (i.forceFullWidth == "on")f = 0 - i.container.parent().offset().left;
                r.parent().find(".tp-bannershadow").css({width: i.width, left: f})
            }
            r.find("ul").css({display: "none"});
            var B = r;
            r.find("ul").css({display: "block"});
            y(r, i);
            if (i.parallax != "off")et(r, i);
            if (i.slideamount > 1)l(r, i);
            if (i.slideamount > 1 && i.navigationType == "thumb")nt(r, i);
            if (i.slideamount > 1)c(r, i);
            if (i.keyboardNavigation == "on")h(r, i);
            p(r, i);
            if (i.hideThumbs > 0)d(r, i);
            setTimeout(function () {
                N(r, i)
            }, i.startDelay);
            i.startDelay = 0;
            if (i.slideamount > 1)$(r, i);
            setTimeout(function () {
                r.trigger("revolution.slide.onloaded")
            }, 500);
            e("body").data("rs-fullScreenMode", false);
            e(window).on("mozfullscreenchange webkitfullscreenchange fullscreenchange", function () {
                e("body").data("rs-fullScreenMode", !e("body").data("rs-fullScreenMode"));
                if (e("body").data("rs-fullScreenMode")) {
                    setTimeout(function () {
                        e(window).trigger("resize")
                    }, 200)
                }
            });
            var j = "resize.revslider-" + r.attr("id");
            e(window).on(j, function () {
                if (r == t)return false;
                if (e("body").find(r) != 0)if (i.forceFullWidth == "on") {
                    var n = i.container.closest(".forcefullwidth_wrapper_tp_banner").offset().left;
                    i.container.parent().css({left: 0 - n + "px", width: e(window).width()})
                }
                if (r.outerWidth(true) != i.width || r.is(":hidden")) {
                    u(r, i)
                }
            });
            try {
                if (i.hideThumbsUnderResoluition != 0 && i.navigationType == "thumb") {
                    if (i.hideThumbsUnderResoluition > e(window).width())e(".tp-bullets").css({display: "none"}); else e(".tp-bullets").css({display: "block"})
                }
            } catch (g) {
            }
            r.find(".tp-scrollbelowslider").on("click", function () {
                var t = 0;
                try {
                    t = e("body").find(i.fullScreenOffsetContainer).height()
                } catch (n) {
                }
                try {
                    t = t - parseInt(e(this).data("scrolloffset"), 0)
                } catch (n) {
                }
                e("body,html").animate({scrollTop: r.offset().top + r.find(">ul >li").height() - t + "px"}, {duration: 400})
            });
            var F = r.parent();
            if (e(window).width() < i.hideSliderAtLimit) {
                r.trigger("stoptimer");
                if (F.css("display") != "none")F.data("olddisplay", F.css("display"));
                F.css({display: "none"})
            }
            s(r, i)
        }
    }

    e.fn.extend({
        revolution: function (n) {
            var i = {
                delay: 9e3,
                startheight: 500,
                startwidth: 960,
                fullScreenAlignForce: "off",
                autoHeight: "off",
                hideTimerBar: "off",
                hideThumbs: 200,
                hideNavDelayOnMobile: 1500,
                thumbWidth: 100,
                thumbHeight: 50,
                thumbAmount: 3,
                navigationType: "bullet",
                navigationArrows: "solo",
                navigationInGrid: "off",
                hideThumbsOnMobile: "off",
                hideBulletsOnMobile: "off",
                hideArrowsOnMobile: "off",
                hideThumbsUnderResoluition: 0,
                navigationStyle: "round",
                navigationHAlign: "center",
                navigationVAlign: "bottom",
                navigationHOffset: 0,
                navigationVOffset: 20,
                soloArrowLeftHalign: "left",
                soloArrowLeftValign: "center",
                soloArrowLeftHOffset: 20,
                soloArrowLeftVOffset: 0,
                soloArrowRightHalign: "right",
                soloArrowRightValign: "center",
                soloArrowRightHOffset: 20,
                soloArrowRightVOffset: 0,
                keyboardNavigation: "on",
                touchenabled: "on",
                onHoverStop: "on",
                stopAtSlide: -1,
                stopAfterLoops: -1,
                hideCaptionAtLimit: 0,
                hideAllCaptionAtLimit: 0,
                hideSliderAtLimit: 0,
                shadow: 0,
                fullWidth: "off",
                fullScreen: "off",
                minFullScreenHeight: 0,
                fullScreenOffsetContainer: "",
                fullScreenOffset: "0",
                dottedOverlay: "none",
                forceFullWidth: "off",
                spinner: "spinner0",
                swipe_treshold: 75,
                swipe_min_touches: 1,
                drag_block_vertical: false,
                isJoomla: false,
                parallax: "off",
                parallaxLevels: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85],
                parallaxBgFreeze: "off",
                parallaxOpacity: "on",
                parallaxDisableOnMobile: "off",
                panZoomDisableOnMobile: "off",
                simplifyAll: "on",
                minHeight: 0,
                nextSlideOnWindowFocus: "off",
                startDelay: 0
            };
            n = e.extend({}, i, n);
            return this.each(function () {
                if (window.tplogs == true)try {
                    console.groupCollapsed("Slider Revolution 4.6.3 Initialisation on " + e(this).attr("id"));
                    console.groupCollapsed("Used Options:");
                    console.info(n);
                    console.groupEnd();
                    console.groupCollapsed("Tween Engine:")
                } catch (i) {
                }
                if (punchgs.TweenLite == t) {
                    if (window.tplogs == true)try {
                        console.error("GreenSock Engine Does not Exist!")
                    } catch (i) {
                    }
                    return false
                }
                punchgs.force3D = true;
                if (window.tplogs == true)try {
                    console.info("GreenSock Engine Version in Slider Revolution:" + punchgs.TweenLite.version)
                } catch (i) {
                }
                if (n.simplifyAll == "on") {
                } else {
                    punchgs.TweenLite.lagSmoothing(1e3, 16);
                    punchgs.force3D = "true"
                }
                if (window.tplogs == true)try {
                    console.groupEnd();
                    console.groupEnd()
                } catch (i) {
                }
                r(e(this), n)
            })
        }, revscroll: function (n) {
            return this.each(function () {
                var r = e(this);
                if (r != t && r.length > 0 && e("body").find("#" + r.attr("id")).length > 0)e("body,html").animate({scrollTop: r.offset().top + r.find(">ul >li").height() - n + "px"}, {duration: 400})
            })
        }, revredraw: function (n) {
            return this.each(function () {
                var n = e(this);
                if (n != t && n.length > 0 && e("body").find("#" + n.attr("id")).length > 0) {
                    var r = n.parent().find(".tp-bannertimer");
                    var i = r.data("opt");
                    u(n, i)
                }
            })
        }, revkill: function (n) {
            var r = this, i = e(this);
            if (i != t && i.length > 0 && e("body").find("#" + i.attr("id")).length > 0) {
                i.data("conthover", 1);
                i.data("conthover-changed", 1);
                i.trigger("revolution.slide.onpause");
                var s = i.parent().find(".tp-bannertimer");
                var o = s.data("opt");
                o.bannertimeronpause = true;
                i.trigger("stoptimer");
                punchgs.TweenLite.killTweensOf(i.find("*"), false);
                punchgs.TweenLite.killTweensOf(i, false);
                i.unbind("hover, mouseover, mouseenter,mouseleave, resize");
                var u = "resize.revslider-" + i.attr("id");
                e(window).off(u);
                i.find("*").each(function () {
                    var n = e(this);
                    n.unbind("on, hover, mouseenter,mouseleave,mouseover, resize,restarttimer, stoptimer");
                    n.off("on, hover, mouseenter,mouseleave,mouseover, resize");
                    n.data("mySplitText", null);
                    n.data("ctl", null);
                    if (n.data("tween") != t)n.data("tween").kill();
                    if (n.data("kenburn") != t)n.data("kenburn").kill();
                    n.remove();
                    n.empty();
                    n = null
                });
                punchgs.TweenLite.killTweensOf(i.find("*"), false);
                punchgs.TweenLite.killTweensOf(i, false);
                s.remove();
                try {
                    i.closest(".forcefullwidth_wrapper_tp_banner").remove()
                } catch (a) {
                }
                try {
                    i.closest(".rev_slider_wrapper").remove()
                } catch (a) {
                }
                try {
                    i.remove()
                } catch (a) {
                }
                i.empty();
                i.html();
                i = null;
                o = null;
                delete r.container;
                delete r.opt;
                return true
            } else {
                return false
            }
        }, revpause: function (n) {
            return this.each(function () {
                var n = e(this);
                if (n != t && n.length > 0 && e("body").find("#" + n.attr("id")).length > 0) {
                    n.data("conthover", 1);
                    n.data("conthover-changed", 1);
                    n.trigger("revolution.slide.onpause");
                    var r = n.parent().find(".tp-bannertimer");
                    var i = r.data("opt");
                    i.bannertimeronpause = true;
                    n.trigger("stoptimer")
                }
            })
        }, revresume: function (n) {
            return this.each(function () {
                var n = e(this);
                if (n != t && n.length > 0 && e("body").find("#" + n.attr("id")).length > 0) {
                    n.data("conthover", 0);
                    n.data("conthover-changed", 1);
                    n.trigger("revolution.slide.onresume");
                    var r = n.parent().find(".tp-bannertimer");
                    var i = r.data("opt");
                    i.bannertimeronpause = false;
                    n.trigger("starttimer")
                }
            })
        }, revnext: function (n) {
            return this.each(function () {
                var n = e(this);
                if (n != t && n.length > 0 && e("body").find("#" + n.attr("id")).length > 0)n.parent().find(".tp-rightarrow").click()
            })
        }, revprev: function (n) {
            return this.each(function () {
                var n = e(this);
                if (n != t && n.length > 0 && e("body").find("#" + n.attr("id")).length > 0)n.parent().find(".tp-leftarrow").click()
            })
        }, revmaxslide: function (t) {
            return e(this).find(">ul:first-child >li").length
        }, revcurrentslide: function (n) {
            var r = e(this);
            if (r != t && r.length > 0 && e("body").find("#" + r.attr("id")).length > 0) {
                var i = r.parent().find(".tp-bannertimer");
                var s = i.data("opt");
                return s.act
            }
        }, revlastslide: function (n) {
            var r = e(this);
            if (r != t && r.length > 0 && e("body").find("#" + r.attr("id")).length > 0) {
                var i = r.parent().find(".tp-bannertimer");
                var s = i.data("opt");
                return s.lastslide
            }
        }, revshowslide: function (n) {
            return this.each(function () {
                var r = e(this);
                if (r != t && r.length > 0 && e("body").find("#" + r.attr("id")).length > 0) {
                    r.data("showus", n);
                    r.parent().find(".tp-rightarrow").click()
                }
            })
        }
    });
    var i = function () {
        var e, t, n = {
            hidden: "visibilitychange",
            webkitHidden: "webkitvisibilitychange",
            mozHidden: "mozvisibilitychange",
            msHidden: "msvisibilitychange"
        };
        for (e in n) {
            if (e in document) {
                t = n[e];
                break
            }
        }
        return function (n) {
            if (n)document.addEventListener(t, n);
            return !document[e]
        }
    }();
    var s = function (n, r) {
        var i = document.documentMode === t, s = window.chrome;
        if (i && !s) {
            e(window).on("focusin", function () {
                if (n == t)return false;
                setTimeout(function () {
                    if (r.nextSlideOnWindowFocus == "on")n.revnext();
                    n.revredraw()
                }, 300)
            }).on("focusout", function () {
            })
        } else {
            if (window.addEventListener) {
                window.addEventListener("focus", function (e) {
                    if (n == t)return false;
                    setTimeout(function () {
                        if (r.nextSlideOnWindowFocus == "on")n.revnext();
                        n.revredraw()
                    }, 300)
                }, false);
                window.addEventListener("blur", function (e) {
                }, false)
            } else {
                window.attachEvent("focus", function (e) {
                    setTimeout(function () {
                        if (n == t)return false;
                        if (r.nextSlideOnWindowFocus == "on")n.revnext();
                        n.revredraw()
                    }, 300)
                });
                window.attachEvent("blur", function (e) {
                })
            }
        }
    };
    var o = function (e) {
        var t = [], n;
        var r = window.location.href.slice(window.location.href.indexOf(e) + 1).split("_");
        for (var i = 0; i < r.length; i++) {
            r[i] = r[i].replace("%3D", "=");
            n = r[i].split("=");
            t.push(n[0]);
            t[n[0]] = n[1]
        }
        return t
    };
    var u = function (n, r) {
        if (n == t)return false;
        try {
            if (r.hideThumbsUnderResoluition != 0 && r.navigationType == "thumb") {
                if (r.hideThumbsUnderResoluition > e(window).width())e(".tp-bullets").css({display: "none"}); else e(".tp-bullets").css({display: "block"})
            }
        } catch (i) {
        }
        n.find(".defaultimg").each(function (t) {
            g(e(this), r)
        });
        var s = n.parent();
        if (e(window).width() < r.hideSliderAtLimit) {
            n.trigger("stoptimer");
            if (s.css("display") != "none")s.data("olddisplay", s.css("display"));
            s.css({display: "none"})
        } else {
            if (n.is(":hidden")) {
                if (s.data("olddisplay") != t && s.data("olddisplay") != "undefined" && s.data("olddisplay") != "none")s.css({display: s.data("olddisplay")}); else s.css({display: "block"});
                n.trigger("restarttimer");
                setTimeout(function () {
                    u(n, r)
                }, 150)
            }
        }
        var o = 0;
        if (r.forceFullWidth == "on")o = 0 - r.container.parent().offset().left;
        try {
            n.parent().find(".tp-bannershadow").css({width: r.width, left: o})
        } catch (i) {
        }
        var a = n.find(">ul >li:eq(" + r.act + ") .slotholder");
        var f = n.find(">ul >li:eq(" + r.next + ") .slotholder");
        E(n, r, n);
        punchgs.TweenLite.set(f.find(".defaultimg"), {opacity: 0});
        a.find(".defaultimg").css({opacity: 1});
        f.find(".defaultimg").each(function () {
            var i = e(this);
            if (r.panZoomDisableOnMobile == "on") {
            } else {
                if (i.data("kenburn") != t) {
                    i.data("kenburn").restart();
                    Q(n, r, true)
                }
            }
        });
        var l = n.find(">ul >li:eq(" + r.next + ")");
        var c = n.parent().find(".tparrows");
        if (c.hasClass("preview2"))c.css({width: parseInt(c.css("minWidth"), 0)});
        j(l, r, true);
        v(n, r)
    };
    var a = function (t, n) {
        var r = e('<div style="display:none;"/>').appendTo(e("body"));
        r.html("<!--[if " + (n || "") + " IE " + (t || "") + "]><a>&nbsp;</a><![endif]-->");
        var i = r.find("a").length;
        r.remove();
        return i
    };
    var f = function (e, t) {
        if (e.next == t.find(">ul >li").length - 1) {
            e.looptogo = e.looptogo - 1;
            if (e.looptogo <= 0)e.stopLoop = "on"
        }
        N(t, e)
    };
    var l = function (t, n) {
        var r = "hidebullets";
        if (n.hideThumbs == 0)r = "";
        if (n.navigationType == "bullet" || n.navigationType == "both") {
            t.parent().append('<div class="tp-bullets ' + r + " simplebullets " + n.navigationStyle + '"></div>')
        }
        var i = t.parent().find(".tp-bullets");
        t.find(">ul:first >li").each(function (e) {
            var n = t.find(">ul:first >li:eq(" + e + ") img:first").attr("src");
            i.append('<div class="bullet"></div>');
            var r = i.find(".bullet:first")
        });
        i.find(".bullet").each(function (r) {
            var i = e(this);
            if (r == n.slideamount - 1)i.addClass("last");
            if (r == 0)i.addClass("first");
            i.click(function () {
                var e = false, r = i.index();
                if (n.navigationArrows == "withbullet" || n.navigationArrows == "nexttobullets")r = i.index() - 1;
                if (r == n.act)e = true;
                if (n.transition == 0 && !e) {
                    n.next = r;
                    f(n, t)
                }
            })
        });
        i.append('<div class="tpclear"></div>');
        v(t, n)
    };
    var c = function (e, n) {
        function u(t) {
            e.parent().append('<div style="' + i + '" class="tp-' + t + "arrow " + s + " tparrows " + o + '"><div class="tp-arr-allwrapper"><div class="tp-arr-iwrapper"><div class="tp-arr-imgholder"></div><div class="tp-arr-imgholder2"></div><div class="tp-arr-titleholder"></div><div class="tp-arr-subtitleholder"></div></div></div></div>')
        }

        var r = e.find(".tp-bullets"), i = "", s = "hidearrows", o = n.navigationStyle;
        if (n.hideThumbs == 0)s = "";
        if (n.navigationArrows == "none")i = "visibility:hidden;display:none";
        n.soloArrowStyle = "default" + " " + n.navigationStyle;
        if (n.navigationArrows != "none" && n.navigationArrows != "nexttobullets")o = n.soloArrowStyle;
        u("left");
        u("right");
        e.parent().find(".tp-rightarrow").click(function () {
            if (n.transition == 0) {
                if (e.data("showus") != t && e.data("showus") != -1)n.next = e.data("showus") - 1; else n.next = n.next + 1;
                e.data("showus", -1);
                if (n.next >= n.slideamount)n.next = 0;
                if (n.next < 0)n.next = 0;
                if (n.act != n.next)f(n, e)
            }
        });
        e.parent().find(".tp-leftarrow").click(function () {
            if (n.transition == 0) {
                n.next = n.next - 1;
                n.leftarrowpressed = 1;
                if (n.next < 0)n.next = n.slideamount - 1;
                f(n, e)
            }
        });
        v(e, n)
    };
    var h = function (n, r) {
        e(document).keydown(function (e) {
            if (r.transition == 0 && e.keyCode == 39) {
                if (n.data("showus") != t && n.data("showus") != -1)r.next = n.data("showus") - 1; else r.next = r.next + 1;
                n.data("showus", -1);
                if (r.next >= r.slideamount)r.next = 0;
                if (r.next < 0)r.next = 0;
                if (r.act != r.next)f(r, n)
            }
            if (r.transition == 0 && e.keyCode == 37) {
                r.next = r.next - 1;
                r.leftarrowpressed = 1;
                if (r.next < 0)r.next = r.slideamount - 1;
                f(r, n)
            }
        });
        v(n, r)
    };
    var p = function (t, n) {
        var r = "vertical";
        if (n.touchenabled == "on") {
            if (n.drag_block_vertical == true)r = "none";
            t.swipe({
                allowPageScroll: r,
                fingers: n.swipe_min_touches,
                treshold: n.swipe_treshold,
                swipe: function (i, s, o, u, a, l) {
                    switch (s) {
                        case"left":
                            if (n.transition == 0) {
                                n.next = n.next + 1;
                                if (n.next == n.slideamount)n.next = 0;
                                f(n, t)
                            }
                            break;
                        case"right":
                            if (n.transition == 0) {
                                n.next = n.next - 1;
                                n.leftarrowpressed = 1;
                                if (n.next < 0)n.next = n.slideamount - 1;
                                f(n, t)
                            }
                            break;
                        case"up":
                            if (r == "none")e("html, body").animate({scrollTop: t.offset().top + t.height() + "px"});
                            break;
                        case"down":
                            if (r == "none")e("html, body").animate({scrollTop: t.offset().top - e(window).height() + "px"});
                            break
                    }
                }
            })
        }
    };
    var d = function (e, t) {
        var n = e.parent().find(".tp-bullets"), r = e.parent().find(".tparrows");
        if (n == null) {
            e.append('<div class=".tp-bullets"></div>');
            var n = e.parent().find(".tp-bullets")
        }
        if (r == null) {
            e.append('<div class=".tparrows"></div>');
            var r = e.parent().find(".tparrows")
        }
        e.data("hideThumbs", t.hideThumbs);
        n.addClass("hidebullets");
        r.addClass("hidearrows");
        if (J()) {
            try {
                e.hammer().on("touch", function () {
                    e.addClass("hovered");
                    if (t.onHoverStop == "on")e.trigger("stoptimer");
                    clearTimeout(e.data("hideThumbs"));
                    n.removeClass("hidebullets");
                    r.removeClass("hidearrows")
                });
                e.hammer().on("release", function () {
                    e.removeClass("hovered");
                    e.trigger("starttimer");
                    if (!e.hasClass("hovered") && !n.hasClass("hovered"))e.data("hideThumbs", setTimeout(function () {
                        n.addClass("hidebullets");
                        r.addClass("hidearrows");
                        e.trigger("starttimer")
                    }, t.hideNavDelayOnMobile))
                })
            } catch (i) {
            }
        } else {
            n.hover(function () {
                t.overnav = true;
                if (t.onHoverStop == "on")e.trigger("stoptimer");
                n.addClass("hovered");
                clearTimeout(e.data("hideThumbs"));
                n.removeClass("hidebullets");
                r.removeClass("hidearrows")
            }, function () {
                t.overnav = false;
                e.trigger("starttimer");
                n.removeClass("hovered");
                if (!e.hasClass("hovered") && !n.hasClass("hovered"))e.data("hideThumbs", setTimeout(function () {
                    n.addClass("hidebullets");
                    r.addClass("hidearrows")
                }, t.hideThumbs))
            });
            r.hover(function () {
                t.overnav = true;
                if (t.onHoverStop == "on")e.trigger("stoptimer");
                n.addClass("hovered");
                clearTimeout(e.data("hideThumbs"));
                n.removeClass("hidebullets");
                r.removeClass("hidearrows")
            }, function () {
                t.overnav = false;
                e.trigger("starttimer");
                n.removeClass("hovered")
            });
            e.on("mouseenter", function () {
                e.addClass("hovered");
                if (t.onHoverStop == "on")e.trigger("stoptimer");
                clearTimeout(e.data("hideThumbs"));
                n.removeClass("hidebullets");
                r.removeClass("hidearrows")
            });
            e.on("mouseleave", function () {
                e.removeClass("hovered");
                e.trigger("starttimer");
                if (!e.hasClass("hovered") && !n.hasClass("hovered"))e.data("hideThumbs", setTimeout(function () {
                    n.addClass("hidebullets");
                    r.addClass("hidearrows")
                }, t.hideThumbs))
            })
        }
    };
    var v = function (t, n) {
        var r = t.parent();
        var i = r.find(".tp-bullets");
        if (n.navigationType == "thumb") {
            i.find(".thumb").each(function (t) {
                var r = e(this);
                r.css({width: n.thumbWidth * n.bw + "px", height: n.thumbHeight * n.bh + "px"})
            });
            var s = i.find(".tp-mask");
            s.width(n.thumbWidth * n.thumbAmount * n.bw);
            s.height(n.thumbHeight * n.bh);
            s.parent().width(n.thumbWidth * n.thumbAmount * n.bw);
            s.parent().height(n.thumbHeight * n.bh)
        }
        var o = r.find(".tp-leftarrow");
        var u = r.find(".tp-rightarrow");
        if (n.navigationType == "thumb" && n.navigationArrows == "nexttobullets")n.navigationArrows = "solo";
        if (n.navigationArrows == "nexttobullets") {
            o.prependTo(i).css({"float": "left"});
            u.insertBefore(i.find(".tpclear")).css({"float": "left"})
        }
        var a = 0;
        if (n.forceFullWidth == "on")a = 0 - n.container.parent().offset().left;
        var f = 0, l = 0;
        if (n.navigationInGrid == "on") {
            f = t.width() > n.startwidth ? (t.width() - n.startwidth) / 2 : 0, l = t.height() > n.startheight ? (t.height() - n.startheight) / 2 : 0
        }
        if (n.navigationArrows != "none" && n.navigationArrows != "nexttobullets") {
            var c = n.soloArrowLeftValign, h = n.soloArrowLeftHalign, p = n.soloArrowRightValign, d = n.soloArrowRightHalign, v = n.soloArrowLeftVOffset, m = n.soloArrowLeftHOffset, g = n.soloArrowRightVOffset, y = n.soloArrowRightHOffset;
            o.css({position: "absolute"});
            u.css({position: "absolute"});
            if (c == "center")o.css({
                top: "50%",
                marginTop: v - Math.round(o.innerHeight() / 2) + "px"
            }); else if (c == "bottom")o.css({
                top: "auto",
                bottom: 0 + v + "px"
            }); else if (c == "top")o.css({bottom: "auto", top: 0 + v + "px"});
            if (h == "center")o.css({
                left: "50%",
                marginLeft: a + m - Math.round(o.innerWidth() / 2) + "px"
            }); else if (h == "left")o.css({left: f + m + a + "px"}); else if (h == "right")o.css({right: f + m - a + "px"});
            if (p == "center")u.css({
                top: "50%",
                marginTop: g - Math.round(u.innerHeight() / 2) + "px"
            }); else if (p == "bottom")u.css({
                top: "auto",
                bottom: 0 + g + "px"
            }); else if (p == "top")u.css({bottom: "auto", top: 0 + g + "px"});
            if (d == "center")u.css({
                left: "50%",
                marginLeft: a + y - Math.round(u.innerWidth() / 2) + "px"
            }); else if (d == "left")u.css({left: f + y + a + "px"}); else if (d == "right")u.css({right: f + y - a + "px"});
            if (o.position() != null)o.css({top: Math.round(parseInt(o.position().top, 0)) + "px"});
            if (u.position() != null)u.css({top: Math.round(parseInt(u.position().top, 0)) + "px"})
        }
        if (n.navigationArrows == "none") {
            o.css({visibility: "hidden"});
            u.css({visibility: "hidden"})
        }
        var b = n.navigationVAlign, w = n.navigationHAlign, E = n.navigationVOffset * n.bh, S = n.navigationHOffset * n.bw;
        if (b == "center")i.css({top: "50%", marginTop: E - Math.round(i.innerHeight() / 2) + "px"});
        if (b == "bottom")i.css({bottom: 0 + E + "px"});
        if (b == "top")i.css({top: 0 + E + "px"});
        if (w == "center")i.css({left: "50%", marginLeft: a + S - Math.round(i.innerWidth() / 2) + "px"});
        if (w == "left")i.css({left: 0 + S + a + "px"});
        if (w == "right")i.css({right: 0 + S - a + "px"})
    };
    var m = function (n) {
        var r = n.container;
        n.beforli = n.next - 1;
        n.comingli = n.next + 1;
        if (n.beforli < 0)n.beforli = n.slideamount - 1;
        if (n.comingli >= n.slideamount)n.comingli = 0;
        var i = r.find(">ul:first-child >li:eq(" + n.comingli + ")"), s = r.find(">ul:first-child >li:eq(" + n.beforli + ")"), o = s.find(".defaultimg").attr("src"), u = i.find(".defaultimg").attr("src");
        if (n.arr == t) {
            n.arr = r.parent().find(".tparrows"), n.rar = r.parent().find(".tp-rightarrow"), n.lar = r.parent().find(".tp-leftarrow"), n.raimg = n.rar.find(".tp-arr-imgholder"), n.laimg = n.lar.find(".tp-arr-imgholder"), n.raimg_b = n.rar.find(".tp-arr-imgholder2"), n.laimg_b = n.lar.find(".tp-arr-imgholder2"), n.ratit = n.rar.find(".tp-arr-titleholder"), n.latit = n.lar.find(".tp-arr-titleholder")
        }
        var a = n.arr, f = n.rar, l = n.lar, c = n.raimg, h = n.laimg, p = n.raimg_b, d = n.laimg_b, v = n.ratit, m = n.latit;
        if (i.data("title") != t)v.html(i.data("title"));
        if (s.data("title") != t)m.html(s.data("title"));
        if (f.hasClass("itishovered")) {
            f.width(v.outerWidth(true) + parseInt(f.css("minWidth"), 0))
        }
        if (l.hasClass("itishovered")) {
            l.width(m.outerWidth(true) + parseInt(l.css("minWidth"), 0))
        }
        if (a.hasClass("preview2") && !a.hasClass("hashoveralready")) {
            a.addClass("hashoveralready");
            if (!J())a.hover(function () {
                var t = e(this), n = t.find(".tp-arr-titleholder");
                if (e(window).width() > 767)t.width(n.outerWidth(true) + parseInt(t.css("minWidth"), 0));
                t.addClass("itishovered")
            }, function () {
                var t = e(this), n = t.find(".tp-arr-titleholder");
                t.css({width: parseInt(t.css("minWidth"), 0)});
                t.removeClass("itishovered")
            }); else {
                var a = e(this), g = a.find(".tp-arr-titleholder");
                g.addClass("alwayshidden");
                punchgs.TweenLite.set(g, {autoAlpha: 0})
            }
        }
        if (s.data("thumb") != t)o = s.data("thumb");
        if (i.data("thumb") != t)u = i.data("thumb");
        if (!a.hasClass("preview4")) {
            punchgs.TweenLite.to(c, .5, {
                autoAlpha: 0, onComplete: function () {
                    c.css({backgroundImage: "url(" + u + ")"});
                    h.css({backgroundImage: "url(" + o + ")"})
                }
            });
            punchgs.TweenLite.to(h, .5, {
                autoAlpha: 0, onComplete: function () {
                    punchgs.TweenLite.to(c, .5, {autoAlpha: 1, delay: .2});
                    punchgs.TweenLite.to(h, .5, {autoAlpha: 1, delay: .2})
                }
            })
        } else {
            p.css({backgroundImage: "url(" + u + ")"});
            d.css({backgroundImage: "url(" + o + ")"});
            punchgs.TweenLite.fromTo(p, .8, {force3D: punchgs.force3d, x: 0}, {
                x: -c.width(),
                ease: punchgs.Power3.easeOut,
                delay: 1,
                onComplete: function () {
                    c.css({backgroundImage: "url(" + u + ")"});
                    punchgs.TweenLite.set(p, {x: 0})
                }
            });
            punchgs.TweenLite.fromTo(d, .8, {force3D: punchgs.force3d, x: 0}, {
                x: c.width(),
                ease: punchgs.Power3.easeOut,
                delay: 1,
                onComplete: function () {
                    h.css({backgroundImage: "url(" + o + ")"});
                    punchgs.TweenLite.set(d, {x: 0})
                }
            });
            punchgs.TweenLite.fromTo(c, .8, {x: 0}, {
                force3D: punchgs.force3d,
                x: -c.width(),
                ease: punchgs.Power3.easeOut,
                delay: 1,
                onComplete: function () {
                    punchgs.TweenLite.set(c, {x: 0})
                }
            });
            punchgs.TweenLite.fromTo(h, .8, {x: 0}, {
                force3D: punchgs.force3d,
                x: c.width(),
                ease: punchgs.Power3.easeOut,
                delay: 1,
                onComplete: function () {
                    punchgs.TweenLite.set(h, {x: 0})
                }
            })
        }
        if (f.hasClass("preview4") && !f.hasClass("hashoveralready")) {
            f.addClass("hashoveralready");
            f.hover(function () {
                var t = e(this).find(".tp-arr-iwrapper");
                var n = e(this).find(".tp-arr-allwrapper");
                punchgs.TweenLite.fromTo(t, .4, {x: t.width()}, {
                    x: 0,
                    delay: .3,
                    ease: punchgs.Power3.easeOut,
                    overwrite: "all"
                });
                punchgs.TweenLite.to(n, .2, {autoAlpha: 1, overwrite: "all"})
            }, function () {
                var t = e(this).find(".tp-arr-iwrapper");
                var n = e(this).find(".tp-arr-allwrapper");
                punchgs.TweenLite.to(t, .4, {x: t.width(), ease: punchgs.Power3.easeOut, delay: .2, overwrite: "all"});
                punchgs.TweenLite.to(n, .2, {delay: .6, autoAlpha: 0, overwrite: "all"})
            });
            l.hover(function () {
                var t = e(this).find(".tp-arr-iwrapper");
                var n = e(this).find(".tp-arr-allwrapper");
                punchgs.TweenLite.fromTo(t, .4, {x: 0 - t.width()}, {
                    x: 0,
                    delay: .3,
                    ease: punchgs.Power3.easeOut,
                    overwrite: "all"
                });
                punchgs.TweenLite.to(n, .2, {autoAlpha: 1, overwrite: "all"})
            }, function () {
                var t = e(this).find(".tp-arr-iwrapper");
                var n = e(this).find(".tp-arr-allwrapper");
                punchgs.TweenLite.to(t, .4, {
                    x: 0 - t.width(),
                    ease: punchgs.Power3.easeOut,
                    delay: .2,
                    overwrite: "all"
                });
                punchgs.TweenLite.to(n, .2, {delay: .6, autoAlpha: 0, overwrite: "all"})
            })
        }
    };
    var g = function (n, r) {
        r.container.closest(".forcefullwidth_wrapper_tp_banner").find(".tp-fullwidth-forcer").css({height: r.container.height()});
        r.container.closest(".rev_slider_wrapper").css({height: r.container.height()});
        r.width = parseInt(r.container.width(), 0);
        r.height = parseInt(r.container.height(), 0);
        r.bw = r.width / r.startwidth;
        r.bh = r.height / r.startheight;
        if (r.bh > r.bw)r.bh = r.bw;
        if (r.bh < r.bw)r.bw = r.bh;
        if (r.bw < r.bh)r.bh = r.bw;
        if (r.bh > 1) {
            r.bw = 1;
            r.bh = 1
        }
        if (r.bw > 1) {
            r.bw = 1;
            r.bh = 1
        }
        r.height = Math.round(r.startheight * (r.width / r.startwidth));
        if (r.height > r.startheight && r.autoHeight != "on")r.height = r.startheight;
        if (r.fullScreen == "on") {
            r.height = r.bw * r.startheight;
            var i = r.container.parent().width();
            var s = e(window).height();
            if (r.fullScreenOffsetContainer != t) {
                try {
                    var o = r.fullScreenOffsetContainer.split(",");
                    e.each(o, function (t, n) {
                        s = s - e(n).outerHeight(true);
                        if (s < r.minFullScreenHeight)s = r.minFullScreenHeight
                    })
                } catch (u) {
                }
                try {
                    if (r.fullScreenOffset.split("%").length > 1 && r.fullScreenOffset != t && r.fullScreenOffset.length > 0) {
                        s = s - e(window).height() * parseInt(r.fullScreenOffset, 0) / 100
                    } else {
                        if (r.fullScreenOffset != t && r.fullScreenOffset.length > 0)s = s - parseInt(r.fullScreenOffset, 0)
                    }
                    if (s < r.minFullScreenHeight)s = r.minFullScreenHeight
                } catch (u) {
                }
            }
            r.container.parent().height(s);
            r.container.closest(".rev_slider_wrapper").height(s);
            r.container.css({height: "100%"});
            r.height = s;
            if (r.minHeight != t && r.height < r.minHeight)r.height = r.minHeight
        } else {
            if (r.minHeight != t && r.height < r.minHeight)r.height = r.minHeight;
            r.container.height(r.height)
        }
        r.slotw = Math.ceil(r.width / r.slots);
        if (r.fullScreen == "on")r.sloth = Math.ceil(e(window).height() / r.slots); else r.sloth = Math.ceil(r.height / r.slots);
        if (r.autoHeight == "on")r.sloth = Math.ceil(n.height() / r.slots)
    };
    var y = function (n, r) {
        n.find(".tp-caption").each(function () {
            e(this).addClass(e(this).data("transition"));
            e(this).addClass("start")
        });
        n.find(">ul:first").css({
            overflow: "hidden",
            width: "100%",
            height: "100%",
            maxHeight: n.parent().css("maxHeight")
        }).addClass("tp-revslider-mainul");
        if (r.autoHeight == "on") {
            n.find(">ul:first").css({overflow: "hidden", width: "100%", height: "100%", maxHeight: "none"});
            n.css({maxHeight: "none"});
            n.parent().css({maxHeight: "none"})
        }
        n.find(">ul:first >li").each(function (r) {
            var i = e(this);
            i.addClass("tp-revslider-slidesli");
            i.css({width: "100%", height: "100%", overflow: "hidden"});
            if (i.data("link") != t) {
                var s = i.data("link");
                var o = "_self";
                var u = 60;
                if (i.data("slideindex") == "back")u = 0;
                var a = checksl = i.data("linktoslide");
                if (a != t) {
                    if (a != "next" && a != "prev")n.find(">ul:first-child >li").each(function () {
                        var t = e(this);
                        if (t.data("origindex") + 1 == checksl)a = t.index() + 1
                    })
                }
                if (i.data("target") != t)o = i.data("target");
                if (s != "slide")a = "no";
                var f = '<div class="tp-caption sft slidelink" style="width:100%;height:100%;z-index:' + u + ';" data-x="center" data-y="center" data-linktoslide="' + a + '" data-start="0"><a style="width:100%;height:100%;display:block"';
                if (s != "slide")f = f + ' target="' + o + '" href="' + s + '"';
                f = f + '><span style="width:100%;height:100%;display:block"></span></a></div>';
                i.append(f)
            }
        });
        n.parent().css({overflow: "visible"});
        n.find(">ul:first >li >img").each(function (n) {
            var i = e(this);
            i.addClass("defaultimg");
            if (i.data("lazyload") != t && i.data("lazydone") != 1) {
            } else {
                g(i, r)
            }
            if (a(8)) {
                i.data("kenburns", "off")
            }
            if (r.panZoomDisableOnMobile == "on" && J()) {
                i.data("kenburns", "off");
                i.data("bgfit", "cover")
            }
            i.wrap('<div class="slotholder" style="width:100%;height:100%;"' + 'data-duration="' + i.data("duration") + '"' + 'data-zoomstart="' + i.data("zoomstart") + '"' + 'data-zoomend="' + i.data("zoomend") + '"' + 'data-rotationstart="' + i.data("rotationstart") + '"' + 'data-rotationend="' + i.data("rotationend") + '"' + 'data-ease="' + i.data("ease") + '"' + 'data-duration="' + i.data("duration") + '"' + 'data-bgpositionend="' + i.data("bgpositionend") + '"' + 'data-bgposition="' + i.data("bgposition") + '"' + 'data-duration="' + i.data("duration") + '"' + 'data-kenburns="' + i.data("kenburns") + '"' + 'data-easeme="' + i.data("ease") + '"' + 'data-bgfit="' + i.data("bgfit") + '"' + 'data-bgfitend="' + i.data("bgfitend") + '"' + 'data-owidth="' + i.data("owidth") + '"' + 'data-oheight="' + i.data("oheight") + '"' + "></div>");
            if (r.dottedOverlay != "none" && r.dottedOverlay != t)i.closest(".slotholder").append('<div class="tp-dottedoverlay ' + r.dottedOverlay + '"></div>');
            var s = i.attr("src"), o = i.data("lazyload"), u = i.data("bgfit"), f = i.data("bgrepeat"), l = i.data("bgposition");
            if (u == t)u = "cover";
            if (f == t)f = "no-repeat";
            if (l == t)l = "center center";
            var c = i.closest(".slotholder");
            i.replaceWith('<div class="tp-bgimg defaultimg" data-lazyload="' + i.data("lazyload") + '" data-bgfit="' + u + '"data-bgposition="' + l + '" data-bgrepeat="' + f + '" data-lazydone="' + i.data("lazydone") + '" src="' + s + '" data-src="' + s + '" style="background-color:' + i.css("backgroundColor") + ";background-repeat:" + f + ";background-image:url(" + s + ");background-size:" + u + ";background-position:" + l + ';width:100%;height:100%;"></div>');
            if (a(8)) {
                c.find(".tp-bgimg").css({backgroundImage: "none", "background-image": "none"});
                c.find(".tp-bgimg").append('<img class="ieeightfallbackimage defaultimg" src="' + s + '" style="width:100%">')
            }
            i.css({opacity: 0});
            i.data("li-id", n)
        })
    };
    var b = function (e, n, r, i) {
        var s = e, o = s.find(".defaultimg"), u = s.data("zoomstart"), f = s.data("rotationstart");
        if (o.data("currotate") != t)f = o.data("currotate");
        if (o.data("curscale") != t && i == "box")u = o.data("curscale") * 100; else if (o.data("curscale") != t)u = o.data("curscale");
        g(o, n);
        var l = o.data("src"), c = o.css("backgroundColor"), h = n.width, p = n.height, d = o.data("fxof"), v = 0;
        if (n.autoHeight == "on")p = n.container.height();
        if (d == t)d = 0;
        var m = 0, y = o.data("bgfit"), b = o.data("bgrepeat"), E = o.data("bgposition");
        if (y == t)y = "cover";
        if (b == t)b = "no-repeat";
        if (E == t)E = "center center";
        if (a(8)) {
            s.data("kenburns", "off");
            var S = l;
            l = ""
        }
        switch (i) {
            case"box":
                var x = 0, T = 0, N = 0;
                if (n.sloth > n.slotw)x = n.sloth; else x = n.slotw;
                if (!r) {
                    var m = 0 - x
                }
                n.slotw = x;
                n.sloth = x;
                var T = 0;
                var N = 0;
                if (s.data("kenburns") == "on") {
                    y = u;
                    if (y.toString().length < 4)y = K(y, s, n)
                }
                for (var C = 0; C < n.slots; C++) {
                    N = 0;
                    for (var k = 0; k < n.slots; k++) {
                        s.append('<div class="slot" ' + 'style="position:absolute;' + "top:" + (v + N) + "px;" + "left:" + (d + T) + "px;" + "width:" + x + "px;" + "height:" + x + "px;" + 'overflow:hidden;">' + '<div class="slotslide" data-x="' + T + '" data-y="' + N + '" ' + 'style="position:absolute;' + "top:" + 0 + "px;" + "left:" + 0 + "px;" + "width:" + x + "px;" + "height:" + x + "px;" + 'overflow:hidden;">' + '<div style="position:absolute;' + "top:" + (0 - N) + "px;" + "left:" + (0 - T) + "px;" + "width:" + h + "px;" + "height:" + p + "px;" + "background-color:" + c + ";" + "background-image:url(" + l + ");" + "background-repeat:" + b + ";" + "background-size:" + y + ";background-position:" + E + ';">' + "</div></div></div>");
                        N = N + x;
                        if (a(8)) {
                            s.find(".slot ").last().find(".slotslide").append('<img src="' + S + '">');
                            w(s, n)
                        }
                        if (u != t && f != t)punchgs.TweenLite.set(s.find(".slot").last(), {rotationZ: f})
                    }
                    T = T + x
                }
                break;
            case"vertical":
            case"horizontal":
                if (s.data("kenburns") == "on") {
                    y = u;
                    if (y.toString().length < 4)y = K(y, s, n)
                }
                if (i == "horizontal") {
                    if (!r)var m = 0 - n.slotw;
                    for (var k = 0; k < n.slots; k++) {
                        s.append('<div class="slot" style="position:absolute;' + "top:" + (0 + v) + "px;" + "left:" + (d + k * n.slotw) + "px;" + "overflow:hidden;width:" + (n.slotw + .6) + "px;" + "height:" + p + 'px">' + '<div class="slotslide" style="position:absolute;' + "top:0px;left:" + m + "px;" + "width:" + (n.slotw + .6) + "px;" + "height:" + p + 'px;overflow:hidden;">' + '<div style="background-color:' + c + ";" + "position:absolute;top:0px;" + "left:" + (0 - k * n.slotw) + "px;" + "width:" + h + "px;height:" + p + "px;" + "background-image:url(" + l + ");" + "background-repeat:" + b + ";" + "background-size:" + y + ";background-position:" + E + ';">' + "</div></div></div>");
                        if (u != t && f != t)punchgs.TweenLite.set(s.find(".slot").last(), {rotationZ: f});
                        if (a(8)) {
                            s.find(".slot ").last().find(".slotslide").append('<img class="ieeightfallbackimage" src="' + S + '" style="width:100%;height:auto">');
                            w(s, n)
                        }
                    }
                } else {
                    if (!r)var m = 0 - n.sloth;
                    for (var k = 0; k < n.slots + 2; k++) {
                        s.append('<div class="slot" style="position:absolute;' + "top:" + (v + k * n.sloth) + "px;" + "left:" + d + "px;" + "overflow:hidden;" + "width:" + h + "px;" + "height:" + n.sloth + 'px">' + '<div class="slotslide" style="position:absolute;' + "top:" + m + "px;" + "left:0px;width:" + h + "px;" + "height:" + n.sloth + "px;" + 'overflow:hidden;">' + '<div style="background-color:' + c + ";" + "position:absolute;" + "top:" + (0 - k * n.sloth) + "px;" + "left:0px;" + "width:" + h + "px;height:" + p + "px;" + "background-image:url(" + l + ");" + "background-repeat:" + b + ";" + "background-size:" + y + ";background-position:" + E + ';">' + "</div></div></div>");
                        if (u != t && f != t)punchgs.TweenLite.set(s.find(".slot").last(), {rotationZ: f});
                        if (a(8)) {
                            s.find(".slot ").last().find(".slotslide").append('<img class="ieeightfallbackimage" src="' + S + '" style="width:100%;height:auto;">');
                            w(s, n)
                        }
                    }
                }
                break
        }
    };
    var w = function (e, t) {
        if (a(8)) {
            var n = e.find(".ieeightfallbackimage");
            var r = n.width(), i = n.height();
            if (t.startwidth / t.startheight < e.data("owidth") / e.data("oheight"))n.css({
                width: "auto",
                height: "100%"
            }); else n.css({width: "100%", height: "auto"});
            setTimeout(function () {
                var r = n.width(), i = n.height(), s = e.data("bgposition");
                if (s == "center center")n.css({
                    position: "absolute",
                    top: t.height / 2 - i / 2 + "px",
                    left: t.width / 2 - r / 2 + "px"
                });
                if (s == "center top" || s == "top center")n.css({
                    position: "absolute",
                    top: "0px",
                    left: t.width / 2 - r / 2 + "px"
                });
                if (s == "center bottom" || s == "bottom center")n.css({
                    position: "absolute",
                    bottom: "0px",
                    left: t.width / 2 - r / 2 + "px"
                });
                if (s == "right top" || s == "top right")n.css({position: "absolute", top: "0px", right: "0px"});
                if (s == "right bottom" || s == "bottom right")n.css({
                    position: "absolute",
                    bottom: "0px",
                    right: "0px"
                });
                if (s == "right center" || s == "center right")n.css({
                    position: "absolute",
                    top: t.height / 2 - i / 2 + "px",
                    right: "0px"
                });
                if (s == "left bottom" || s == "bottom left")n.css({position: "absolute", bottom: "0px", left: "0px"});
                if (s == "left center" || s == "center left")n.css({
                    position: "absolute",
                    top: t.height / 2 - i / 2 + "px",
                    left: "0px"
                })
            }, 20)
        }
    };
    var E = function (t, n, r) {
        r.find(".slot").each(function () {
            e(this).remove()
        });
        n.transition = 0
    };
    var S = function (n, r) {
        n.find("img, .defaultimg").each(function (n) {
            var i = e(this), s = i.data("lazyload");
            if (s != i.attr("src") && r < 3 && s != t && s != "undefined") {
                if (s != t && s != "undefined") {
                    i.attr("src", s);
                    var o = new Image;
                    o.onload = function (e) {
                        i.data("lazydone", 1);
                        if (i.hasClass("defaultimg"))x(i, o)
                    };
                    o.error = function () {
                        i.data("lazydone", 1)
                    };
                    o.src = i.attr("src");
                    if (o.complete) {
                        if (i.hasClass("defaultimg"))x(i, o);
                        i.data("lazydone", 1)
                    }
                }
            } else {
                if ((s === t || s === "undefined") && i.data("lazydone") != 1) {
                    var o = new Image;
                    o.onload = function () {
                        if (i.hasClass("defaultimg"))x(i, o);
                        i.data("lazydone", 1)
                    };
                    o.error = function () {
                        i.data("lazydone", 1)
                    };
                    if (i.attr("src") != t && i.attr("src") != "undefined") {
                        o.src = i.attr("src")
                    } else o.src = i.data("src");
                    if (o.complete) {
                        if (i.hasClass("defaultimg")) {
                            x(i, o)
                        }
                        i.data("lazydone", 1)
                    }
                }
            }
        })
    };
    var x = function (e, t) {
        var n = e.closest("li"), r = t.width, i = t.height;
        n.data("owidth", r);
        n.data("oheight", i);
        n.find(".slotholder").data("owidth", r);
        n.find(".slotholder").data("oheight", i);
        n.data("loadeddone", 1)
    };
    var T = function (n, r, i) {
        S(n, 0);
        var s = setInterval(function () {
            i.bannertimeronpause = true;
            i.container.trigger("stoptimer");
            i.cd = 0;
            var o = 0;
            n.find("img, .defaultimg").each(function (t) {
                if (e(this).data("lazydone") != 1) {
                    o++
                }
            });
            if (o > 0)S(n, o); else {
                clearInterval(s);
                if (r != t)r()
            }
        }, 100)
    };
    var N = function (e, n) {
        try {
            var r = e.find(">ul:first-child >li:eq(" + n.act + ")")
        } catch (i) {
            var r = e.find(">ul:first-child >li:eq(1)")
        }
        n.lastslide = n.act;
        var s = e.find(">ul:first-child >li:eq(" + n.next + ")");
        var o = s.find(".defaultimg");
        n.bannertimeronpause = true;
        e.trigger("stoptimer");
        n.cd = 0;
        if (o.data("lazyload") != t && o.data("lazyload") != "undefined" && o.data("lazydone") != 1) {
            if (!a(8))o.css({backgroundImage: 'url("' + s.find(".defaultimg").data("lazyload") + '")'}); else {
                o.attr("src", s.find(".defaultimg").data("lazyload"))
            }
            o.data("src", s.find(".defaultimg").data("lazyload"));
            o.data("lazydone", 1);
            o.data("orgw", 0);
            s.data("loadeddone", 1);
            e.find(".tp-loader").css({display: "block"});
            T(e.find(".tp-static-layers"), function () {
                T(s, function () {
                    var t = s.find(".slotholder");
                    if (t.data("kenburns") == "on") {
                        var r = setInterval(function () {
                            var i = t.data("owidth");
                            if (i >= 0) {
                                clearInterval(r);
                                C(n, o, e)
                            }
                        }, 10)
                    } else C(n, o, e)
                }, n)
            }, n)
        } else {
            if (s.data("loadeddone") === t) {
                s.data("loadeddone", 1);
                T(s, function () {
                    C(n, o, e)
                }, n)
            } else C(n, o, e)
        }
    };
    var C = function (e, t, n) {
        e.bannertimeronpause = false;
        e.cd = 0;
        n.trigger("nulltimer");
        n.find(".tp-loader").css({display: "none"});
        g(t, e);
        v(n, e);
        g(t, e);
        k(n, e)
    };
    var k = function (e, n) {
        e.trigger("revolution.slide.onbeforeswap");
        n.transition = 1;
        n.videoplaying = false;
        try {
            var r = e.find(">ul:first-child >li:eq(" + n.act + ")")
        } catch (i) {
            var r = e.find(">ul:first-child >li:eq(1)")
        }
        n.lastslide = n.act;
        var s = e.find(">ul:first-child >li:eq(" + n.next + ")");
        setTimeout(function () {
            m(n)
        }, 200);
        var o = r.find(".slotholder"), u = s.find(".slotholder");
        if (u.data("kenburns") == "on" || o.data("kenburns") == "on") {
            Z(e, n);
            e.find(".kenburnimg").remove()
        }
        if (s.data("delay") != t) {
            n.cd = 0;
            n.delay = s.data("delay")
        } else {
            n.delay = n.origcd
        }
        if (n.firststart == 1)punchgs.TweenLite.set(r, {autoAlpha: 0});
        punchgs.TweenLite.set(r, {zIndex: 18});
        punchgs.TweenLite.set(s, {autoAlpha: 0, zIndex: 20});
        var a = 0;
        if (r.index() != s.index() && n.firststart != 1) {
            a = z(r, n)
        }
        if (r.data("saveperformance") != "on")a = 0;
        setTimeout(function () {
            e.trigger("restarttimer");
            L(e, n, s, r, o, u)
        }, a)
    };
    var L = function (n, r, i, s, o, u) {
        function x() {
            e.each(d, function (e, t) {
                if (t[0] == h || t[8] == h) {
                    f = t[1];
                    p = t[2];
                    g = y
                }
                y = y + 1
            })
        }

        if (i.data("differentissplayed") == "prepared") {
            i.data("differentissplayed", "done");
            i.data("transition", i.data("savedtransition"));
            i.data("slotamount", i.data("savedslotamount"));
            i.data("masterspeed", i.data("savedmasterspeed"))
        }
        if (i.data("fstransition") != t && i.data("differentissplayed") != "done") {
            i.data("savedtransition", i.data("transition"));
            i.data("savedslotamount", i.data("slotamount"));
            i.data("savedmasterspeed", i.data("masterspeed"));
            i.data("transition", i.data("fstransition"));
            i.data("slotamount", i.data("fsslotamount"));
            i.data("masterspeed", i.data("fsmasterspeed"));
            i.data("differentissplayed", "prepared")
        }
        n.find(".active-revslide").removeClass(".active-revslide");
        i.addClass("active-revslide");
        if (i.data("transition") == t)i.data("transition", "random");
        var f = 0, l = i.data("transition").split(","), c = i.data("nexttransid") == t ? -1 : i.data("nexttransid");
        if (i.data("randomtransition") == "on")c = Math.round(Math.random() * l.length); else c = c + 1;
        if (c == l.length)c = 0;
        i.data("nexttransid", c);
        var h = l[c];
        if (r.ie) {
            if (h == "boxfade")h = "boxslide";
            if (h == "slotfade-vertical")h = "slotzoom-vertical";
            if (h == "slotfade-horizontal")h = "slotzoom-horizontal"
        }
        if (a(8)) {
            h = 11
        }
        var p = 0;
        if (r.parallax == "scroll" && r.parallaxFirstGo == t) {
            r.parallaxFirstGo = true;
            tt(n, r);
            setTimeout(function () {
                tt(n, r)
            }, 210);
            setTimeout(function () {
                tt(n, r)
            }, 420)
        }
        if (h == "slidehorizontal") {
            h = "slideleft";
            if (r.leftarrowpressed == 1)h = "slideright"
        }
        if (h == "slidevertical") {
            h = "slideup";
            if (r.leftarrowpressed == 1)h = "slidedown"
        }
        if (h == "parallaxhorizontal") {
            h = "parallaxtoleft";
            if (r.leftarrowpressed == 1)h = "parallaxtoright"
        }
        if (h == "parallaxvertical") {
            h = "parallaxtotop";
            if (r.leftarrowpressed == 1)h = "parallaxtobottom"
        }
        var d = [["boxslide", 0, 1, 10, 0, "box", false, null, 0], ["boxfade", 1, 0, 10, 0, "box", false, null, 1], ["slotslide-horizontal", 2, 0, 0, 200, "horizontal", true, false, 2], ["slotslide-vertical", 3, 0, 0, 200, "vertical", true, false, 3], ["curtain-1", 4, 3, 0, 0, "horizontal", true, true, 4], ["curtain-2", 5, 3, 0, 0, "horizontal", true, true, 5], ["curtain-3", 6, 3, 25, 0, "horizontal", true, true, 6], ["slotzoom-horizontal", 7, 0, 0, 400, "horizontal", true, true, 7], ["slotzoom-vertical", 8, 0, 0, 0, "vertical", true, true, 8], ["slotfade-horizontal", 9, 0, 0, 500, "horizontal", true, null, 9], ["slotfade-vertical", 10, 0, 0, 500, "vertical", true, null, 10], ["fade", 11, 0, 1, 300, "horizontal", true, null, 11], ["slideleft", 12, 0, 1, 0, "horizontal", true, true, 12], ["slideup", 13, 0, 1, 0, "horizontal", true, true, 13], ["slidedown", 14, 0, 1, 0, "horizontal", true, true, 14], ["slideright", 15, 0, 1, 0, "horizontal", true, true, 15], ["papercut", 16, 0, 0, 600, "", null, null, 16], ["3dcurtain-horizontal", 17, 0, 20, 100, "vertical", false, true, 17], ["3dcurtain-vertical", 18, 0, 10, 100, "horizontal", false, true, 18], ["cubic", 19, 0, 20, 600, "horizontal", false, true, 19], ["cube", 19, 0, 20, 600, "horizontal", false, true, 20], ["flyin", 20, 0, 4, 600, "vertical", false, true, 21], ["turnoff", 21, 0, 1, 1600, "horizontal", false, true, 22], ["incube", 22, 0, 20, 200, "horizontal", false, true, 23], ["cubic-horizontal", 23, 0, 20, 500, "vertical", false, true, 24], ["cube-horizontal", 23, 0, 20, 500, "vertical", false, true, 25], ["incube-horizontal", 24, 0, 20, 500, "vertical", false, true, 26], ["turnoff-vertical", 25, 0, 1, 200, "horizontal", false, true, 27], ["fadefromright", 12, 1, 1, 0, "horizontal", true, true, 28], ["fadefromleft", 15, 1, 1, 0, "horizontal", true, true, 29], ["fadefromtop", 14, 1, 1, 0, "horizontal", true, true, 30], ["fadefrombottom", 13, 1, 1, 0, "horizontal", true, true, 31], ["fadetoleftfadefromright", 12, 2, 1, 0, "horizontal", true, true, 32], ["fadetorightfadetoleft", 15, 2, 1, 0, "horizontal", true, true, 33], ["fadetobottomfadefromtop", 14, 2, 1, 0, "horizontal", true, true, 34], ["fadetotopfadefrombottom", 13, 2, 1, 0, "horizontal", true, true, 35], ["parallaxtoright", 12, 3, 1, 0, "horizontal", true, true, 36], ["parallaxtoleft", 15, 3, 1, 0, "horizontal", true, true, 37], ["parallaxtotop", 14, 3, 1, 0, "horizontal", true, true, 38], ["parallaxtobottom", 13, 3, 1, 0, "horizontal", true, true, 39], ["scaledownfromright", 12, 4, 1, 0, "horizontal", true, true, 40], ["scaledownfromleft", 15, 4, 1, 0, "horizontal", true, true, 41], ["scaledownfromtop", 14, 4, 1, 0, "horizontal", true, true, 42], ["scaledownfrombottom", 13, 4, 1, 0, "horizontal", true, true, 43], ["zoomout", 13, 5, 1, 0, "horizontal", true, true, 44], ["zoomin", 13, 6, 1, 0, "horizontal", true, true, 45], ["notransition", 26, 0, 1, 0, "horizontal", true, null, 46]];
        var v = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
        var m = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27];
        var f = 0;
        var p = 1;
        var g = 0;
        var y = 0;
        var w = new Array;
        if (u.data("kenburns") == "on") {
            if (h == "boxslide" || h == 0 || h == "boxfade" || h == 1 || h == "papercut" || h == 16)h = 11;
            Q(n, r, true, true)
        }
        if (h == "random") {
            h = Math.round(Math.random() * d.length - 1);
            if (h > d.length - 1)h = d.length - 1
        }
        if (h == "random-static") {
            h = Math.round(Math.random() * v.length - 1);
            if (h > v.length - 1)h = v.length - 1;
            h = v[h]
        }
        if (h == "random-premium") {
            h = Math.round(Math.random() * m.length - 1);
            if (h > m.length - 1)h = m.length - 1;
            h = m[h]
        }
        var E = [12, 13, 14, 15, 16, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
        if (r.isJoomla == true && window.MooTools != t && E.indexOf(h) != -1) {
            var S = Math.round(Math.random() * (m.length - 2)) + 1;
            if (S > m.length - 1)S = m.length - 1;
            if (S == 0)S = 1;
            h = m[S]
        }
        x();
        if (a(8) && f > 15 && f < 28) {
            h = Math.round(Math.random() * v.length - 1);
            if (h > v.length - 1)h = v.length - 1;
            h = v[h];
            y = 0;
            x()
        }
        var T = -1;
        if (r.leftarrowpressed == 1 || r.act > r.next)T = 1;
        r.leftarrowpressed = 0;
        if (f > 26)f = 26;
        if (f < 0)f = 0;
        var N = 300;
        if (i.data("masterspeed") != t && i.data("masterspeed") > 99 && i.data("masterspeed") < r.delay)N = i.data("masterspeed");
        if (i.data("masterspeed") != t && i.data("masterspeed") > r.delay)N = r.delay;
        w = d[g];
        n.parent().find(".bullet").each(function () {
            var t = e(this), n = t.index();
            t.removeClass("selected");
            if (r.navigationArrows == "withbullet" || r.navigationArrows == "nexttobullets")n = t.index() - 1;
            if (n == r.next)t.addClass("selected")
        });
        var C = new punchgs.TimelineLite({
            onComplete: function () {
                A(n, r, u, o, i, s, C)
            }
        });
        C.add(punchgs.TweenLite.set(u.find(".defaultimg"), {opacity: 0}));
        C.pause();
        if (i.data("slotamount") == t || i.data("slotamount") < 1) {
            r.slots = Math.round(Math.random() * 12 + 4);
            if (h == "boxslide")r.slots = Math.round(Math.random() * 6 + 3); else if (h == "flyin")r.slots = Math.round(Math.random() * 4 + 1)
        } else {
            r.slots = i.data("slotamount")
        }
        if (i.data("rotate") == t)r.rotate = 0; else if (i.data("rotate") == 999)r.rotate = Math.round(Math.random() * 360); else r.rotate = i.data("rotate");
        if (!e.support.transition || r.ie || r.ie9)r.rotate = 0;
        if (r.firststart == 1)r.firststart = 0;
        N = N + w[4];
        if ((f == 4 || f == 5 || f == 6) && r.slots < 3)r.slots = 3;
        if (w[3] != 0)r.slots = Math.min(r.slots, w[3]);
        if (f == 9)r.slots = r.width / 20;
        if (f == 10)r.slots = r.height / 20;
        if (w[7] != null)b(o, r, w[7], w[5]);
        if (w[6] != null)b(u, r, w[6], w[5]);
        if (f == 0) {
            var k = Math.ceil(r.height / r.sloth);
            var L = 0;
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                L = L + 1;
                if (L == k)L = 0;
                C.add(punchgs.TweenLite.from(n, N / 600, {
                    opacity: 0,
                    top: 0 - r.sloth,
                    left: 0 - r.slotw,
                    rotation: r.rotate,
                    force3D: "auto",
                    ease: punchgs.Power2.easeOut
                }), (t * 15 + L * 30) / 1500)
            })
        }
        if (f == 1) {
            var O, M = 0;
            u.find(".slotslide").each(function (t) {
                var n = e(this), i = Math.random() * N + 300, s = Math.random() * 500 + 200;
                if (i + s > O) {
                    O = s + s;
                    M = t
                }
                C.add(punchgs.TweenLite.from(n, i / 1e3, {
                    autoAlpha: 0,
                    force3D: "auto",
                    rotation: r.rotate,
                    ease: punchgs.Power2.easeInOut
                }), s / 1e3)
            })
        }
        if (f == 2) {
            var _ = new punchgs.TimelineLite;
            o.find(".slotslide").each(function () {
                var t = e(this);
                _.add(punchgs.TweenLite.to(t, N / 1e3, {left: r.slotw, force3D: "auto", rotation: 0 - r.rotate}), 0);
                C.add(_, 0)
            });
            u.find(".slotslide").each(function () {
                var t = e(this);
                _.add(punchgs.TweenLite.from(t, N / 1e3, {left: 0 - r.slotw, force3D: "auto", rotation: r.rotate}), 0);
                C.add(_, 0)
            })
        }
        if (f == 3) {
            var _ = new punchgs.TimelineLite;
            o.find(".slotslide").each(function () {
                var t = e(this);
                _.add(punchgs.TweenLite.to(t, N / 1e3, {
                    top: r.sloth,
                    rotation: r.rotate,
                    force3D: "auto",
                    transformPerspective: 600
                }), 0);
                C.add(_, 0)
            });
            u.find(".slotslide").each(function () {
                var t = e(this);
                _.add(punchgs.TweenLite.from(t, N / 1e3, {
                    top: 0 - r.sloth,
                    rotation: r.rotate,
                    ease: punchgs.Power2.easeOut,
                    force3D: "auto",
                    transformPerspective: 600
                }), 0);
                C.add(_, 0)
            })
        }
        if (f == 4 || f == 5) {
            setTimeout(function () {
                o.find(".defaultimg").css({opacity: 0})
            }, 100);
            var D = N / 1e3, P = D, _ = new punchgs.TimelineLite;
            o.find(".slotslide").each(function (t) {
                var n = e(this);
                var i = t * D / r.slots;
                if (f == 5)i = (r.slots - t - 1) * D / r.slots / 1.5;
                _.add(punchgs.TweenLite.to(n, D * 3, {
                    transformPerspective: 600,
                    force3D: "auto",
                    top: 0 + r.height,
                    opacity: .5,
                    rotation: r.rotate,
                    ease: punchgs.Power2.easeInOut,
                    delay: i
                }), 0);
                C.add(_, 0)
            });
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                var i = t * D / r.slots;
                if (f == 5)i = (r.slots - t - 1) * D / r.slots / 1.5;
                _.add(punchgs.TweenLite.from(n, D * 3, {
                    top: 0 - r.height,
                    opacity: .5,
                    rotation: r.rotate,
                    force3D: "auto",
                    ease: punchgs.Power2.easeInOut,
                    delay: i
                }), 0);
                C.add(_, 0)
            })
        }
        if (f == 6) {
            if (r.slots < 2)r.slots = 2;
            if (r.slots % 2)r.slots = r.slots + 1;
            var _ = new punchgs.TimelineLite;
            setTimeout(function () {
                o.find(".defaultimg").css({opacity: 0})
            }, 100);
            o.find(".slotslide").each(function (t) {
                var n = e(this);
                if (t + 1 < r.slots / 2)var i = (t + 2) * 90; else var i = (2 + r.slots - t) * 90;
                _.add(punchgs.TweenLite.to(n, (N + i) / 1e3, {
                    top: 0 + r.height,
                    opacity: 1,
                    force3D: "auto",
                    rotation: r.rotate,
                    ease: punchgs.Power2.easeInOut
                }), 0);
                C.add(_, 0)
            });
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                if (t + 1 < r.slots / 2)var i = (t + 2) * 90; else var i = (2 + r.slots - t) * 90;
                _.add(punchgs.TweenLite.from(n, (N + i) / 1e3, {
                    top: 0 - r.height,
                    opacity: 1,
                    force3D: "auto",
                    rotation: r.rotate,
                    ease: punchgs.Power2.easeInOut
                }), 0);
                C.add(_, 0)
            })
        }
        if (f == 7) {
            N = N * 2;
            if (N > r.delay)N = r.delay;
            var _ = new punchgs.TimelineLite;
            setTimeout(function () {
                o.find(".defaultimg").css({opacity: 0})
            }, 100);
            o.find(".slotslide").each(function () {
                var t = e(this).find("div");
                _.add(punchgs.TweenLite.to(t, N / 1e3, {
                    left: 0 - r.slotw / 2 + "px",
                    top: 0 - r.height / 2 + "px",
                    width: r.slotw * 2 + "px",
                    height: r.height * 2 + "px",
                    opacity: 0,
                    rotation: r.rotate,
                    force3D: "auto",
                    ease: punchgs.Power2.easeOut
                }), 0);
                C.add(_, 0)
            });
            u.find(".slotslide").each(function (t) {
                var n = e(this).find("div");
                _.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    left: 0,
                    top: 0,
                    opacity: 0,
                    transformPerspective: 600
                }, {
                    left: 0 - t * r.slotw + "px",
                    ease: punchgs.Power2.easeOut,
                    force3D: "auto",
                    top: 0 + "px",
                    width: r.width,
                    height: r.height,
                    opacity: 1,
                    rotation: 0,
                    delay: .1
                }), 0);
                C.add(_, 0)
            })
        }
        if (f == 8) {
            N = N * 3;
            if (N > r.delay)N = r.delay;
            var _ = new punchgs.TimelineLite;
            o.find(".slotslide").each(function () {
                var t = e(this).find("div");
                _.add(punchgs.TweenLite.to(t, N / 1e3, {
                    left: 0 - r.width / 2 + "px",
                    top: 0 - r.sloth / 2 + "px",
                    width: r.width * 2 + "px",
                    height: r.sloth * 2 + "px",
                    force3D: "auto",
                    opacity: 0,
                    rotation: r.rotate
                }), 0);
                C.add(_, 0)
            });
            u.find(".slotslide").each(function (t) {
                var n = e(this).find("div");
                _.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    left: 0,
                    top: 0,
                    opacity: 0,
                    force3D: "auto"
                }, {
                    left: 0 + "px",
                    top: 0 - t * r.sloth + "px",
                    width: u.find(".defaultimg").data("neww") + "px",
                    height: u.find(".defaultimg").data("newh") + "px",
                    opacity: 1,
                    rotation: 0
                }), 0);
                C.add(_, 0)
            })
        }
        if (f == 9 || f == 10) {
            var H = 0;
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                H++;
                C.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    autoAlpha: 0,
                    force3D: "auto",
                    transformPerspective: 600
                }, {autoAlpha: 1, ease: punchgs.Power2.easeInOut, delay: t * 5 / 1e3}), 0)
            })
        }
        if (f == 11 || f == 26) {
            var H = 0;
            if (f == 26)N = 0;
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                C.add(punchgs.TweenLite.from(n, N / 1e3, {
                    autoAlpha: 0,
                    force3D: "auto",
                    ease: punchgs.Power2.easeInOut
                }), 0)
            })
        }
        if (f == 12 || f == 13 || f == 14 || f == 15) {
            N = N;
            if (N > r.delay)N = r.delay;
            setTimeout(function () {
                punchgs.TweenLite.set(o.find(".defaultimg"), {autoAlpha: 0})
            }, 100);
            var B = r.width, F = r.height, I = u.find(".slotslide"), q = 0, R = 0, U = 1, z = 1, W = 1, X = punchgs.Power2.easeInOut, V = punchgs.Power2.easeInOut, $ = N / 1e3, J = $;
            if (r.fullWidth == "on" || r.fullScreen == "on") {
                B = I.width();
                F = I.height()
            }
            if (f == 12)q = B; else if (f == 15)q = 0 - B; else if (f == 13)R = F; else if (f == 14)R = 0 - F;
            if (p == 1)U = 0;
            if (p == 2)U = 0;
            if (p == 3) {
                X = punchgs.Power2.easeInOut;
                V = punchgs.Power1.easeInOut;
                $ = N / 1200
            }
            if (p == 4 || p == 5)z = .6;
            if (p == 6)z = 1.4;
            if (p == 5 || p == 6) {
                W = 1.4;
                U = 0;
                B = 0;
                F = 0;
                q = 0;
                R = 0
            }
            if (p == 6)W = .6;
            var K = 0;
            C.add(punchgs.TweenLite.from(I, $, {
                left: q,
                top: R,
                scale: W,
                opacity: U,
                rotation: r.rotate,
                ease: V,
                force3D: "auto"
            }), 0);
            var G = o.find(".slotslide");
            if (p == 4 || p == 5) {
                B = 0;
                F = 0
            }
            if (p != 1)switch (f) {
                case 12:
                    C.add(punchgs.TweenLite.to(G, J, {
                        left: 0 - B + "px",
                        force3D: "auto",
                        scale: z,
                        opacity: U,
                        rotation: r.rotate,
                        ease: X
                    }), 0);
                    break;
                case 15:
                    C.add(punchgs.TweenLite.to(G, J, {
                        left: B + "px",
                        force3D: "auto",
                        scale: z,
                        opacity: U,
                        rotation: r.rotate,
                        ease: X
                    }), 0);
                    break;
                case 13:
                    C.add(punchgs.TweenLite.to(G, J, {
                        top: 0 - F + "px",
                        force3D: "auto",
                        scale: z,
                        opacity: U,
                        rotation: r.rotate,
                        ease: X
                    }), 0);
                    break;
                case 14:
                    C.add(punchgs.TweenLite.to(G, J, {
                        top: F + "px",
                        force3D: "auto",
                        scale: z,
                        opacity: U,
                        rotation: r.rotate,
                        ease: X
                    }), 0);
                    break
            }
        }
        if (f == 16) {
            var _ = new punchgs.TimelineLite;
            C.add(punchgs.TweenLite.set(s, {position: "absolute", "z-index": 20}), 0);
            C.add(punchgs.TweenLite.set(i, {position: "absolute", "z-index": 15}), 0);
            s.wrapInner('<div class="tp-half-one" style="position:relative; width:100%;height:100%"></div>');
            s.find(".tp-half-one").clone(true).appendTo(s).addClass("tp-half-two");
            s.find(".tp-half-two").removeClass("tp-half-one");
            var B = r.width, F = r.height;
            if (r.autoHeight == "on")F = n.height();
            s.find(".tp-half-one .defaultimg").wrap('<div class="tp-papercut" style="width:' + B + "px;height:" + F + 'px;"></div>');
            s.find(".tp-half-two .defaultimg").wrap('<div class="tp-papercut" style="width:' + B + "px;height:" + F + 'px;"></div>');
            s.find(".tp-half-two .defaultimg").css({position: "absolute", top: "-50%"});
            s.find(".tp-half-two .tp-caption").wrapAll('<div style="position:absolute;top:-50%;left:0px;"></div>');
            C.add(punchgs.TweenLite.set(s.find(".tp-half-two"), {
                width: B,
                height: F,
                overflow: "hidden",
                zIndex: 15,
                position: "absolute",
                top: F / 2,
                left: "0px",
                transformPerspective: 600,
                transformOrigin: "center bottom"
            }), 0);
            C.add(punchgs.TweenLite.set(s.find(".tp-half-one"), {
                width: B,
                height: F / 2,
                overflow: "visible",
                zIndex: 10,
                position: "absolute",
                top: "0px",
                left: "0px",
                transformPerspective: 600,
                transformOrigin: "center top"
            }), 0);
            var Y = s.find(".defaultimg"), Z = Math.round(Math.random() * 20 - 10), et = Math.round(Math.random() * 20 - 10), nt = Math.round(Math.random() * 20 - 10), rt = Math.random() * .4 - .2, it = Math.random() * .4 - .2, st = Math.random() * 1 + 1, ot = Math.random() * 1 + 1, ut = Math.random() * .3 + .3;
            C.add(punchgs.TweenLite.set(s.find(".tp-half-one"), {overflow: "hidden"}), 0);
            C.add(punchgs.TweenLite.fromTo(s.find(".tp-half-one"), N / 800, {
                width: B,
                height: F / 2,
                position: "absolute",
                top: "0px",
                left: "0px",
                force3D: "auto",
                transformOrigin: "center top"
            }, {scale: st, rotation: Z, y: 0 - F - F / 4, autoAlpha: 0, ease: punchgs.Power2.easeInOut}), 0);
            C.add(punchgs.TweenLite.fromTo(s.find(".tp-half-two"), N / 800, {
                width: B,
                height: F,
                overflow: "hidden",
                position: "absolute",
                top: F / 2,
                left: "0px",
                force3D: "auto",
                transformOrigin: "center bottom"
            }, {
                scale: ot,
                rotation: et,
                y: F + F / 4,
                ease: punchgs.Power2.easeInOut,
                autoAlpha: 0,
                onComplete: function () {
                    punchgs.TweenLite.set(s, {position: "absolute", "z-index": 15});
                    punchgs.TweenLite.set(i, {position: "absolute", "z-index": 20});
                    if (s.find(".tp-half-one").length > 0) {
                        s.find(".tp-half-one .defaultimg").unwrap();
                        s.find(".tp-half-one .slotholder").unwrap()
                    }
                    s.find(".tp-half-two").remove()
                }
            }), 0);
            _.add(punchgs.TweenLite.set(u.find(".defaultimg"), {autoAlpha: 1}), 0);
            if (s.html() != null)C.add(punchgs.TweenLite.fromTo(i, (N - 200) / 1e3, {
                scale: ut,
                x: r.width / 4 * rt,
                y: F / 4 * it,
                rotation: nt,
                force3D: "auto",
                transformOrigin: "center center",
                ease: punchgs.Power2.easeOut
            }, {autoAlpha: 1, scale: 1, x: 0, y: 0, rotation: 0}), 0);
            C.add(_, 0)
        }
        if (f == 17) {
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                C.add(punchgs.TweenLite.fromTo(n, N / 800, {
                    opacity: 0,
                    rotationY: 0,
                    scale: .9,
                    rotationX: -110,
                    force3D: "auto",
                    transformPerspective: 600,
                    transformOrigin: "center center"
                }, {
                    opacity: 1,
                    top: 0,
                    left: 0,
                    scale: 1,
                    rotation: 0,
                    rotationX: 0,
                    force3D: "auto",
                    rotationY: 0,
                    ease: punchgs.Power3.easeOut,
                    delay: t * .06
                }), 0)
            })
        }
        if (f == 18) {
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                C.add(punchgs.TweenLite.fromTo(n, N / 500, {
                    autoAlpha: 0,
                    rotationY: 310,
                    scale: .9,
                    rotationX: 10,
                    force3D: "auto",
                    transformPerspective: 600,
                    transformOrigin: "center center"
                }, {
                    autoAlpha: 1,
                    top: 0,
                    left: 0,
                    scale: 1,
                    rotation: 0,
                    rotationX: 0,
                    force3D: "auto",
                    rotationY: 0,
                    ease: punchgs.Power3.easeOut,
                    delay: t * .06
                }), 0)
            })
        }
        if (f == 19 || f == 22) {
            var _ = new punchgs.TimelineLite;
            C.add(punchgs.TweenLite.set(s, {zIndex: 20}), 0);
            C.add(punchgs.TweenLite.set(i, {zIndex: 20}), 0);
            setTimeout(function () {
                o.find(".defaultimg").css({opacity: 0})
            }, 100);
            var at = i.css("z-index"), ft = s.css("z-index"), lt = 90, U = 1, ct = "center center ";
            if (T == 1)lt = -90;
            if (f == 19) {
                ct = ct + "-" + r.height / 2;
                U = 0
            } else {
                ct = ct + r.height / 2
            }
            punchgs.TweenLite.set(n, {transformStyle: "flat", backfaceVisibility: "hidden", transformPerspective: 600});
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                _.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    transformStyle: "flat",
                    backfaceVisibility: "hidden",
                    left: 0,
                    rotationY: r.rotate,
                    z: 10,
                    top: 0,
                    scale: 1,
                    force3D: "auto",
                    transformPerspective: 600,
                    transformOrigin: ct,
                    rotationX: lt
                }, {
                    left: 0,
                    rotationY: 0,
                    top: 0,
                    z: 0,
                    scale: 1,
                    force3D: "auto",
                    rotationX: 0,
                    delay: t * 50 / 1e3,
                    ease: punchgs.Power2.easeInOut
                }), 0);
                _.add(punchgs.TweenLite.to(n, .1, {autoAlpha: 1, delay: t * 50 / 1e3}), 0);
                C.add(_)
            });
            o.find(".slotslide").each(function (t) {
                var n = e(this);
                var i = -90;
                if (T == 1)i = 90;
                _.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    transformStyle: "flat",
                    backfaceVisibility: "hidden",
                    autoAlpha: 1,
                    rotationY: 0,
                    top: 0,
                    z: 0,
                    scale: 1,
                    force3D: "auto",
                    transformPerspective: 600,
                    transformOrigin: ct,
                    rotationX: 0
                }, {
                    autoAlpha: 1,
                    rotationY: r.rotate,
                    top: 0,
                    z: 10,
                    scale: 1,
                    rotationX: i,
                    delay: t * 50 / 1e3,
                    force3D: "auto",
                    ease: punchgs.Power2.easeInOut
                }), 0);
                C.add(_)
            })
        }
        if (f == 20) {
            setTimeout(function () {
                o.find(".defaultimg").css({opacity: 0})
            }, 100);
            var at = i.css("z-index"), ft = s.css("z-index");
            if (T == 1) {
                var ht = -r.width;
                var lt = 70;
                var ct = "left center -" + r.height / 2
            } else {
                var ht = r.width;
                var lt = -70;
                var ct = "right center -" + r.height / 2
            }
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                C.add(punchgs.TweenLite.fromTo(n, N / 1500, {
                    left: ht,
                    rotationX: 40,
                    z: -600,
                    opacity: U,
                    top: 0,
                    force3D: "auto",
                    transformPerspective: 600,
                    transformOrigin: ct,
                    rotationY: lt
                }, {left: 0, delay: t * 50 / 1e3, ease: punchgs.Power2.easeInOut}), 0);
                C.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    rotationX: 40,
                    z: -600,
                    opacity: U,
                    top: 0,
                    scale: 1,
                    force3D: "auto",
                    transformPerspective: 600,
                    transformOrigin: ct,
                    rotationY: lt
                }, {
                    rotationX: 0,
                    opacity: 1,
                    top: 0,
                    z: 0,
                    scale: 1,
                    rotationY: 0,
                    delay: t * 50 / 1e3,
                    ease: punchgs.Power2.easeInOut
                }), 0);
                C.add(punchgs.TweenLite.to(n, .1, {opacity: 1, force3D: "auto", delay: t * 50 / 1e3 + N / 2e3}), 0)
            });
            o.find(".slotslide").each(function (t) {
                var n = e(this);
                if (T != 1) {
                    var i = -r.width;
                    var s = 70;
                    var o = "left center -" + r.height / 2
                } else {
                    var i = r.width;
                    var s = -70;
                    var o = "right center -" + r.height / 2
                }
                C.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    opacity: 1,
                    rotationX: 0,
                    top: 0,
                    z: 0,
                    scale: 1,
                    left: 0,
                    force3D: "auto",
                    transformPerspective: 600,
                    transformOrigin: o,
                    rotationY: 0
                }, {
                    opacity: 1,
                    rotationX: 40,
                    top: 0,
                    z: -600,
                    left: i,
                    force3D: "auto",
                    scale: .8,
                    rotationY: s,
                    delay: t * 50 / 1e3,
                    ease: punchgs.Power2.easeInOut
                }), 0);
                C.add(punchgs.TweenLite.to(n, .1, {
                    force3D: "auto",
                    opacity: 0,
                    delay: t * 50 / 1e3 + (N / 1e3 - N / 1e4)
                }), 0)
            })
        }
        if (f == 21 || f == 25) {
            setTimeout(function () {
                o.find(".defaultimg").css({opacity: 0})
            }, 100);
            var at = i.css("z-index"), ft = s.css("z-index"), lt = 90, ht = -r.width, pt = -lt;
            if (T == 1) {
                if (f == 25) {
                    var ct = "center top 0";
                    lt = r.rotate
                } else {
                    var ct = "left center 0";
                    pt = r.rotate
                }
            } else {
                ht = r.width;
                lt = -90;
                if (f == 25) {
                    var ct = "center bottom 0";
                    pt = -lt;
                    lt = r.rotate
                } else {
                    var ct = "right center 0";
                    pt = r.rotate
                }
            }
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                C.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    left: 0,
                    transformStyle: "flat",
                    rotationX: pt,
                    z: 0,
                    autoAlpha: 0,
                    top: 0,
                    scale: 1,
                    force3D: "auto",
                    transformPerspective: 600,
                    transformOrigin: ct,
                    rotationY: lt
                }, {
                    left: 0,
                    rotationX: 0,
                    top: 0,
                    z: 0,
                    autoAlpha: 1,
                    scale: 1,
                    rotationY: 0,
                    force3D: "auto",
                    ease: punchgs.Power3.easeInOut
                }), 0)
            });
            if (T != 1) {
                ht = -r.width;
                lt = 90;
                if (f == 25) {
                    ct = "center top 0";
                    pt = -lt;
                    lt = r.rotate
                } else {
                    ct = "left center 0";
                    pt = r.rotate
                }
            } else {
                ht = r.width;
                lt = -90;
                if (f == 25) {
                    ct = "center bottom 0";
                    pt = -lt;
                    lt = r.rotate
                } else {
                    ct = "right center 0";
                    pt = r.rotate
                }
            }
            o.find(".slotslide").each(function (t) {
                var n = e(this);
                C.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    left: 0,
                    transformStyle: "flat",
                    rotationX: 0,
                    z: 0,
                    autoAlpha: 1,
                    top: 0,
                    scale: 1,
                    force3D: "auto",
                    transformPerspective: 600,
                    transformOrigin: ct,
                    rotationY: 0
                }, {
                    left: 0,
                    rotationX: pt,
                    top: 0,
                    z: 0,
                    autoAlpha: 1,
                    force3D: "auto",
                    scale: 1,
                    rotationY: lt,
                    ease: punchgs.Power1.easeInOut
                }), 0)
            })
        }
        if (f == 23 || f == 24) {
            setTimeout(function () {
                o.find(".defaultimg").css({opacity: 0})
            }, 100);
            var at = i.css("z-index"), ft = s.css("z-index"), lt = -90, U = 1, dt = 0;
            if (T == 1)lt = 90;
            if (f == 23) {
                var ct = "center center -" + r.width / 2;
                U = 0
            } else var ct = "center center " + r.width / 2;
            punchgs.TweenLite.set(n, {transformStyle: "preserve-3d", backfaceVisibility: "hidden", perspective: 2500});
            u.find(".slotslide").each(function (t) {
                var n = e(this);
                C.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    left: dt,
                    rotationX: r.rotate,
                    force3D: "auto",
                    opacity: U,
                    top: 0,
                    scale: 1,
                    transformPerspective: 600,
                    transformOrigin: ct,
                    rotationY: lt
                }, {
                    left: 0,
                    rotationX: 0,
                    autoAlpha: 1,
                    top: 0,
                    z: 0,
                    scale: 1,
                    rotationY: 0,
                    delay: t * 50 / 500,
                    ease: punchgs.Power2.easeInOut
                }), 0)
            });
            lt = 90;
            if (T == 1)lt = -90;
            o.find(".slotslide").each(function (t) {
                var n = e(this);
                C.add(punchgs.TweenLite.fromTo(n, N / 1e3, {
                    left: 0,
                    autoAlpha: 1,
                    rotationX: 0,
                    top: 0,
                    z: 0,
                    scale: 1,
                    force3D: "auto",
                    transformPerspective: 600,
                    transformOrigin: ct,
                    rotationY: 0
                }, {
                    left: dt,
                    autoAlpha: 1,
                    rotationX: r.rotate,
                    top: 0,
                    scale: 1,
                    rotationY: lt,
                    delay: t * 50 / 500,
                    ease: punchgs.Power2.easeInOut
                }), 0)
            })
        }
        C.pause();
        j(i, r, null, C);
        punchgs.TweenLite.to(i, .001, {autoAlpha: 1});
        var vt = {};
        vt.slideIndex = r.next + 1;
        vt.slide = i;
        n.trigger("revolution.slide.onchange", vt);
        setTimeout(function () {
            n.trigger("revolution.slide.onafterswap")
        }, N);
        n.trigger("revolution.slide.onvideostop")
    };
    var A = function (e, t, n, r, i, s, o) {
        punchgs.TweenLite.to(n.find(".defaultimg"), .001, {
            autoAlpha: 1, onComplete: function () {
                E(e, t, i)
            }
        });
        if (i.index() != s.index()) {
            punchgs.TweenLite.to(s, .2, {
                autoAlpha: 0, onComplete: function () {
                    E(e, t, s)
                }
            })
        }
        t.act = t.next;
        if (t.navigationType == "thumb")rt(e);
        if (n.data("kenburns") == "on") {
            Q(e, t)
        }
        e.find(".current-sr-slide-visible").removeClass("current-sr-slide-visible");
        i.addClass("current-sr-slide-visible");
        if (t.parallax == "scroll" || t.parallax == "scroll+mouse" || t.parallax == "mouse+scroll") {
            tt(e, t)
        }
        o.clear()
    };
    var O = function (t) {
        var n = t.target.getVideoEmbedCode();
        var r = e("#" + n.split('id="')[1].split('"')[0]);
        var i = r.closest(".tp-simpleresponsive");
        var s = r.parent().data("player");
        if (t.data == YT.PlayerState.PLAYING) {
            var o = i.find(".tp-bannertimer");
            var u = o.data("opt");
            if (r.closest(".tp-caption").data("volume") == "mute")s.mute();
            u.videoplaying = true;
            i.trigger("stoptimer");
            i.trigger("revolution.slide.onvideoplay")
        } else {
            var o = i.find(".tp-bannertimer");
            var u = o.data("opt");
            if (t.data != -1 && t.data != 3) {
                u.videoplaying = false;
                i.trigger("starttimer");
                i.trigger("revolution.slide.onvideostop")
            }
            if (t.data == 0 && u.nextslideatend == true)u.container.revnext(); else {
                u.videoplaying = false;
                i.trigger("starttimer");
                i.trigger("revolution.slide.onvideostop")
            }
        }
    };
    var M = function (e, t, n) {
        if (e.addEventListener)e.addEventListener(t, n, false); else e.attachEvent(t, n, false)
    };
    var _ = function (t, n) {
        var r = $f(t), i = e("#" + t), s = i.closest(".tp-simpleresponsive"), o = i.closest(".tp-caption");
        setTimeout(function () {
            r.addEvent("ready", function (t) {
                if (n)r.api("play");
                r.addEvent("play", function (e) {
                    var t = s.find(".tp-bannertimer");
                    var n = t.data("opt");
                    n.videoplaying = true;
                    s.trigger("stoptimer");
                    if (o.data("volume") == "mute")r.api("setVolume", "0")
                });
                r.addEvent("finish", function (e) {
                    var t = s.find(".tp-bannertimer");
                    var n = t.data("opt");
                    n.videoplaying = false;
                    s.trigger("starttimer");
                    s.trigger("revolution.slide.onvideoplay");
                    if (n.nextslideatend == true)n.container.revnext()
                });
                r.addEvent("pause", function (e) {
                    var t = s.find(".tp-bannertimer");
                    var n = t.data("opt");
                    n.videoplaying = false;
                    s.trigger("starttimer");
                    s.trigger("revolution.slide.onvideostop")
                });
                o.find(".tp-thumb-image").click(function () {
                    punchgs.TweenLite.to(e(this), .3, {autoAlpha: 0, force3D: "auto", ease: punchgs.Power3.easeInOut});
                    r.api("play")
                })
            })
        }, 150)
    };
    var D = function (e, n) {
        var r = n.width();
        var i = n.height();
        var s = e.data("mediaAspect");
        if (s == t)s = 1;
        var o = r / i;
        e.css({position: "absolute"});
        var u = e.find("video");
        if (o < s) {
            punchgs.TweenLite.to(e, 1e-4, {width: i * s, force3D: "auto", top: 0, left: 0 - (i * s - r) / 2, height: i})
        } else {
            punchgs.TweenLite.to(e, 1e-4, {width: r, force3D: "auto", top: 0 - (r / s - i) / 2, left: 0, height: r / s})
        }
    };
    var P = function () {
        var e = new Object;
        e.x = 0;
        e.y = 0;
        e.rotationX = 0;
        e.rotationY = 0;
        e.rotationZ = 0;
        e.scale = 1;
        e.scaleX = 1;
        e.scaleY = 1;
        e.skewX = 0;
        e.skewY = 0;
        e.opacity = 0;
        e.transformOrigin = "center, center";
        e.transformPerspective = 400;
        e.rotation = 0;
        return e
    };
    var H = function (t, n) {
        var r = n.split(";");
        e.each(r, function (e, n) {
            n = n.split(":");
            var r = n[0], i = n[1];
            if (r == "rotationX")t.rotationX = parseInt(i, 0);
            if (r == "rotationY")t.rotationY = parseInt(i, 0);
            if (r == "rotationZ")t.rotationZ = parseInt(i, 0);
            if (r == "rotationZ")t.rotation = parseInt(i, 0);
            if (r == "scaleX")t.scaleX = parseFloat(i);
            if (r == "scaleY")t.scaleY = parseFloat(i);
            if (r == "opacity")t.opacity = parseFloat(i);
            if (r == "skewX")t.skewX = parseInt(i, 0);
            if (r == "skewY")t.skewY = parseInt(i, 0);
            if (r == "x")t.x = parseInt(i, 0);
            if (r == "y")t.y = parseInt(i, 0);
            if (r == "z")t.z = parseInt(i, 0);
            if (r == "transformOrigin")t.transformOrigin = i.toString();
            if (r == "transformPerspective")t.transformPerspective = parseInt(i, 0)
        });
        return t
    };
    var B = function (t) {
        var n = t.split("animation:");
        var r = new Object;
        r.animation = H(P(), n[1]);
        var i = n[0].split(";");
        e.each(i, function (e, t) {
            t = t.split(":");
            var n = t[0], i = t[1];
            if (n == "typ")r.typ = i;
            if (n == "speed")r.speed = parseInt(i, 0) / 1e3;
            if (n == "start")r.start = parseInt(i, 0) / 1e3;
            if (n == "elementdelay")r.elementdelay = parseFloat(i);
            if (n == "ease")r.ease = i
        });
        return r
    };
    var j = function (n, r, i, s) {
        function o() {
        }

        function u() {
        }

        if (n.data("ctl") == t) {
            n.data("ctl", new punchgs.TimelineLite)
        }
        var f = n.data("ctl"), l = 0, c = 0, h = n.find(".tp-caption"), p = r.container.find(".tp-static-layers").find(".tp-caption");
        f.pause();
        e.each(p, function (e, t) {
            h.push(t)
        });
        h.each(function (n) {
            var s = i, f = -1, h = e(this);
            if (h.hasClass("tp-static-layer")) {
                var p = h.data("startslide"), d = h.data("endslide");
                if (p == -1 || p == "-1")h.data("startslide", 0);
                if (d == -1 || d == "-1")h.data("endslide", r.slideamount);
                if (p == 0 && d == r.slideamount - 1)h.data("endslide", r.slideamount + 1);
                p = h.data("startslide"), d = h.data("endslide");
                if (!h.hasClass("tp-is-shown")) {
                    if (p <= r.next && d >= r.next || p == r.next || d == r.next) {
                        h.addClass("tp-is-shown");
                        f = 1
                    } else {
                        f = 0
                    }
                } else {
                    if (d == r.next || p > r.next || d < r.next) {
                        f = 2
                    } else {
                        f = 0
                    }
                }
            }
            l = r.width / 2 - r.startwidth * r.bw / 2;
            var v = r.bw;
            var m = r.bh;
            if (r.fullScreen == "on")c = r.height / 2 - r.startheight * r.bh / 2;
            if (r.autoHeight == "on" || r.minHeight != t && r.minHeight > 0)c = r.container.height() / 2 - r.startheight * r.bh / 2;
            if (c < 0)c = 0;
            var g = 0;
            if (r.width < r.hideCaptionAtLimit && h.data("captionhidden") == "on") {
                h.addClass("tp-hidden-caption");
                g = 1
            } else {
                if (r.width < r.hideAllCaptionAtLimit || r.width < r.hideAllCaptionAtLilmit) {
                    h.addClass("tp-hidden-caption");
                    g = 1
                } else {
                    h.removeClass("tp-hidden-caption")
                }
            }
            if (g == 0) {
                if (h.data("linktoslide") != t && !h.hasClass("hasclicklistener")) {
                    h.addClass("hasclicklistener");
                    h.css({cursor: "pointer"});
                    if (h.data("linktoslide") != "no") {
                        h.click(function () {
                            var t = e(this);
                            var n = t.data("linktoslide");
                            if (n != "next" && n != "prev") {
                                r.container.data("showus", n);
                                r.container.parent().find(".tp-rightarrow").click()
                            } else if (n == "next")r.container.parent().find(".tp-rightarrow").click(); else if (n == "prev")r.container.parent().find(".tp-leftarrow").click()
                        })
                    }
                }
                if (l < 0)l = 0;
                if (h.hasClass("tp-videolayer") || h.find("iframe").length > 0 || h.find("video").length > 0) {
                    var y = "iframe" + Math.round(Math.random() * 1e5 + 1), b = h.data("videowidth"), w = h.data("videoheight"), E = h.data("videoattributes"), S = h.data("ytid"), x = h.data("vimeoid"), T = h.data("videpreload"), N = h.data("videomp4"), C = h.data("videowebm"), k = h.data("videoogv"), L = h.data("videocontrols"), A = "http", j = h.data("videoloop") == "loop" ? "loop" : h.data("videoloop") == "loopandnoslidestop" ? "loop" : "";
                    if (h.data("thumbimage") != t && h.data("videoposter") == t)h.data("videoposter", h.data("thumbimage"));
                    if (S != t && String(S).length > 1 && h.find("iframe").length == 0) {
                        A = "https";
                        if (L == "none") {
                            E = E.replace("controls=1", "controls=0");
                            if (E.toLowerCase().indexOf("controls") == -1)E = E + "&controls=0"
                        }
                        h.append('<iframe style="visible:hidden" src="' + A + "://www.youtube.com/embed/" + S + "?" + E + '" width="' + b + '" height="' + w + '" style="width:' + b + "px;height:" + w + 'px"></iframe>')
                    }
                    if (x != t && String(x).length > 1 && h.find("iframe").length == 0) {
                        if (location.protocol === "https:")A = "https";
                        h.append('<iframe style="visible:hidden" src="' + A + "://player.vimeo.com/video/" + x + "?" + E + '" width="' + b + '" height="' + w + '" style="width:' + b + "px;height:" + w + 'px"></iframe>')
                    }
                    if ((N != t || C != t) && h.find("video").length == 0) {
                        if (L != "controls")L = "";
                        var I = '<video style="visible:hidden" class="" ' + j + ' preload="' + T + '" width="' + b + '" height="' + w + '"';
                        if (h.data("videoposter") != t)if (h.data("videoposter") != t)I = I + 'poster="' + h.data("videoposter") + '">';
                        if (C != t && F().toLowerCase() == "firefox")I = I + '<source src="' + C + '" type="video/webm" />';
                        if (N != t)I = I + '<source src="' + N + '" type="video/mp4" />';
                        if (k != t)I = I + '<source src="' + k + '" type="video/ogg" />';
                        I = I + "</video>";
                        h.append(I);
                        if (L == "controls")h.append('<div class="tp-video-controls">' + '<div class="tp-video-button-wrap"><button type="button" class="tp-video-button tp-vid-play-pause">Play</button></div>' + '<div class="tp-video-seek-bar-wrap"><input  type="range" class="tp-seek-bar" value="0"></div>' + '<div class="tp-video-button-wrap"><button  type="button" class="tp-video-button tp-vid-mute">Mute</button></div>' + '<div class="tp-video-vol-bar-wrap"><input  type="range" class="tp-volume-bar" min="0" max="1" step="0.1" value="1"></div>' + '<div class="tp-video-button-wrap"><button  type="button" class="tp-video-button tp-vid-full-screen">Full-Screen</button></div>' + "</div>")
                    }
                    var z = false;
                    if (h.data("autoplayonlyfirsttime") == true || h.data("autoplayonlyfirsttime") == "true" || h.data("autoplay") == true) {
                        h.data("autoplay", true);
                        z = true
                    }
                    h.find("iframe").each(function () {
                        var n = e(this);
                        punchgs.TweenLite.to(n, .1, {
                            autoAlpha: 1,
                            zIndex: 0,
                            transformStyle: "preserve-3d",
                            z: 0,
                            rotationX: 0,
                            force3D: "auto"
                        });
                        if (J()) {
                            var o = n.attr("src");
                            n.attr("src", "");
                            n.attr("src", o)
                        }
                        r.nextslideatend = h.data("nextslideatend");
                        if (h.data("videoposter") != t && h.data("videoposter").length > 2 && h.data("autoplay") != true && !s) {
                            if (h.find(".tp-thumb-image").length == 0)h.append('<div class="tp-thumb-image" style="cursor:pointer; position:absolute;top:0px;left:0px;width:100%;height:100%;background-image:url(' + h.data("videoposter") + '); background-size:cover"></div>'); else punchgs.TweenLite.set(h.find(".tp-thumb-image"), {autoAlpha: 1})
                        }
                        if (n.attr("src").toLowerCase().indexOf("youtube") >= 0) {
                            if (!n.hasClass("HasListener")) {
                                try {
                                    n.attr("id", y);
                                    var u;
                                    var a = setInterval(function () {
                                        if (YT != t)if (typeof YT.Player != t && typeof YT.Player != "undefined") {
                                            u = new YT.Player(y, {
                                                events: {
                                                    onStateChange: O, onReady: function (n) {
                                                        var r = n.target.getVideoEmbedCode(), i = e("#" + r.split('id="')[1].split('"')[0]), s = i.closest(".tp-caption"), o = s.data("videorate"), a = s.data("videostart");
                                                        if (o != t)n.target.setPlaybackRate(parseFloat(o));
                                                        if (!J() && s.data("autoplay") == true || z) {
                                                            s.data("timerplay", setTimeout(function () {
                                                                n.target.playVideo()
                                                            }, s.data("start")))
                                                        }
                                                        s.find(".tp-thumb-image").click(function () {
                                                            punchgs.TweenLite.to(e(this), .3, {
                                                                autoAlpha: 0,
                                                                force3D: "auto",
                                                                ease: punchgs.Power3.easeInOut
                                                            });
                                                            if (!J()) {
                                                                u.playVideo()
                                                            }
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                        n.addClass("HasListener");
                                        h.data("player", u);
                                        clearInterval(a)
                                    }, 100)
                                } catch (f) {
                                }
                            } else {
                                if (!i) {
                                    var u = h.data("player");
                                    if (h.data("forcerewind") == "on" && !J())u.seekTo(0);
                                    if (!J() && h.data("autoplay") == true || z) {
                                        h.data("timerplay", setTimeout(function () {
                                            u.playVideo()
                                        }, h.data("start")))
                                    }
                                }
                            }
                        } else if (n.attr("src").toLowerCase().indexOf("vimeo") >= 0) {
                            if (!n.hasClass("HasListener")) {
                                n.addClass("HasListener");
                                n.attr("id", y);
                                var l = n.attr("src");
                                var c = {}, p = l, d = /([^&=]+)=([^&]*)/g, v;
                                while (v = d.exec(p)) {
                                    c[decodeURIComponent(v[1])] = decodeURIComponent(v[2])
                                }
                                if (c["player_id"] != t)l = l.replace(c["player_id"], y); else l = l + "&player_id=" + y;
                                try {
                                    l = l.replace("api=0", "api=1")
                                } catch (f) {
                                }
                                l = l + "&api=1";
                                n.attr("src", l);
                                var u = h.find("iframe")[0];
                                var m = setInterval(function () {
                                    if ($f != t) {
                                        if (typeof $f(y).api != t && typeof $f(y).api != "undefined") {
                                            $f(u).addEvent("ready", function () {
                                                _(y, z)
                                            });
                                            clearInterval(m)
                                        }
                                    }
                                }, 100)
                            } else {
                                if (!i) {
                                    if (!J() && (h.data("autoplay") == true || h.data("forcerewind") == "on")) {
                                        var n = h.find("iframe");
                                        var g = n.attr("id");
                                        var b = $f(g);
                                        if (h.data("forcerewind") == "on")b.api("seekTo", 0);
                                        h.data("timerplay", setTimeout(function () {
                                            if (h.data("autoplay") == true)b.api("play")
                                        }, h.data("start")))
                                    }
                                }
                            }
                        }
                    });
                    if (J() && h.data("disablevideoonmobile") == 1 || a(8))h.find("video").remove();
                    if (h.find("video").length > 0) {
                        h.find("video").each(function (n) {
                            var i = this, s = e(this);
                            if (!s.parent().hasClass("html5vid"))s.wrap('<div class="html5vid" style="position:relative;top:0px;left:0px;width:auto;height:auto"></div>');
                            var o = s.parent();
                            M(i, "loadedmetadata", function (e) {
                                e.data("metaloaded", 1)
                            }(o));
                            clearInterval(o.data("interval"));
                            o.data("interval", setInterval(function () {
                                if (o.data("metaloaded") == 1 || i.duration != NaN) {
                                    clearInterval(o.data("interval"));
                                    if (!o.hasClass("HasListener")) {
                                        o.addClass("HasListener");
                                        if (h.data("dottedoverlay") != "none" && h.data("dottedoverlay") != t)if (h.find(".tp-dottedoverlay").length != 1)o.append('<div class="tp-dottedoverlay ' + h.data("dottedoverlay") + '"></div>');
                                        if (s.attr("control") == t) {
                                            if (o.find(".tp-video-play-button").length == 0)o.append('<div class="tp-video-play-button"><i class="revicon-right-dir"></i><div class="tp-revstop"></div></div>');
                                            o.find("video, .tp-poster, .tp-video-play-button").click(function () {
                                                if (o.hasClass("videoisplaying"))i.pause(); else i.play()
                                            })
                                        }
                                        if (h.data("forcecover") == 1 || h.hasClass("fullscreenvideo")) {
                                            if (h.data("forcecover") == 1) {
                                                D(o, r.container);
                                                o.addClass("fullcoveredvideo");
                                                h.addClass("fullcoveredvideo")
                                            }
                                            o.css({width: "100%", height: "100%"})
                                        }
                                        var e = h.find(".tp-vid-play-pause")[0], n = h.find(".tp-vid-mute")[0], u = h.find(".tp-vid-full-screen")[0], a = h.find(".tp-seek-bar")[0], f = h.find(".tp-volume-bar")[0];
                                        if (e != t) {
                                            M(e, "click", function () {
                                                if (i.paused == true)i.play(); else i.pause()
                                            });
                                            M(n, "click", function () {
                                                if (i.muted == false) {
                                                    i.muted = true;
                                                    n.innerHTML = "Unmute"
                                                } else {
                                                    i.muted = false;
                                                    n.innerHTML = "Mute"
                                                }
                                            });
                                            M(u, "click", function () {
                                                if (i.requestFullscreen) {
                                                    i.requestFullscreen()
                                                } else if (i.mozRequestFullScreen) {
                                                    i.mozRequestFullScreen()
                                                } else if (i.webkitRequestFullscreen) {
                                                    i.webkitRequestFullscreen()
                                                }
                                            });
                                            M(a, "change", function () {
                                                var e = i.duration * (a.value / 100);
                                                i.currentTime = e
                                            });
                                            M(i, "timeupdate", function () {
                                                var e = 100 / i.duration * i.currentTime;
                                                a.value = e
                                            });
                                            M(a, "mousedown", function () {
                                                i.pause()
                                            });
                                            M(a, "mouseup", function () {
                                                i.play()
                                            });
                                            M(f, "change", function () {
                                                i.volume = f.value
                                            })
                                        }
                                        M(i, "play", function () {
                                            if (h.data("volume") == "mute")i.muted = true;
                                            o.addClass("videoisplaying");
                                            if (h.data("videoloop") == "loopandnoslidestop") {
                                                r.videoplaying = false;
                                                r.container.trigger("starttimer");
                                                r.container.trigger("revolution.slide.onvideostop")
                                            } else {
                                                r.videoplaying = true;
                                                r.container.trigger("stoptimer");
                                                r.container.trigger("revolution.slide.onvideoplay")
                                            }
                                            var e = h.find(".tp-vid-play-pause")[0], n = h.find(".tp-vid-mute")[0];
                                            if (e != t)e.innerHTML = "Pause";
                                            if (n != t && i.muted)n.innerHTML = "Unmute"
                                        });
                                        M(i, "pause", function () {
                                            o.removeClass("videoisplaying");
                                            r.videoplaying = false;
                                            r.container.trigger("starttimer");
                                            r.container.trigger("revolution.slide.onvideostop");
                                            var e = h.find(".tp-vid-play-pause")[0];
                                            if (e != t)e.innerHTML = "Play"
                                        });
                                        M(i, "ended", function () {
                                            o.removeClass("videoisplaying");
                                            r.videoplaying = false;
                                            r.container.trigger("starttimer");
                                            r.container.trigger("revolution.slide.onvideostop");
                                            if (r.nextslideatend == true)r.container.revnext()
                                        })
                                    }
                                    var l = false;
                                    if (h.data("autoplayonlyfirsttime") == true || h.data("autoplayonlyfirsttime") == "true")l = true;
                                    var c = 16 / 9;
                                    if (h.data("aspectratio") == "4:3")c = 4 / 3;
                                    o.data("mediaAspect", c);
                                    if (o.closest(".tp-caption").data("forcecover") == 1) {
                                        D(o, r.container);
                                        o.addClass("fullcoveredvideo")
                                    }
                                    s.css({display: "block"});
                                    r.nextslideatend = h.data("nextslideatend");
                                    if (h.data("autoplay") == true || l == true) {
                                        if (h.data("videoloop") == "loopandnoslidestop") {
                                            r.videoplaying = false;
                                            r.container.trigger("starttimer");
                                            r.container.trigger("revolution.slide.onvideostop")
                                        } else {
                                            r.videoplaying = true;
                                            r.container.trigger("stoptimer");
                                            r.container.trigger("revolution.slide.onvideoplay")
                                        }
                                        if (h.data("forcerewind") == "on" && !o.hasClass("videoisplaying"))if (i.currentTime > 0)i.currentTime = 0;
                                        if (h.data("volume") == "mute")i.muted = true;
                                        o.data("timerplay", setTimeout(function () {
                                            if (h.data("forcerewind") == "on" && !o.hasClass("videoisplaying"))if (i.currentTime > 0)i.currentTime = 0;
                                            if (h.data("volume") == "mute")i.muted = true;
                                            i.play()
                                        }, 10 + h.data("start")))
                                    }
                                    if (o.data("ww") == t)o.data("ww", s.attr("width"));
                                    if (o.data("hh") == t)o.data("hh", s.attr("height"));
                                    if (!h.hasClass("fullscreenvideo") && h.data("forcecover") == 1) {
                                        try {
                                            o.width(o.data("ww") * r.bw);
                                            o.height(o.data("hh") * r.bh)
                                        } catch (p) {
                                        }
                                    }
                                    clearInterval(o.data("interval"))
                                }
                            }), 100)
                        })
                    }
                    if (h.data("autoplay") == true) {
                        setTimeout(function () {
                            if (h.data("videoloop") != "loopandnoslidestop") {
                                r.videoplaying = true;
                                r.container.trigger("stoptimer")
                            }
                        }, 200);
                        if (h.data("videoloop") != "loopandnoslidestop") {
                            r.videoplaying = true;
                            r.container.trigger("stoptimer")
                        }
                        if (h.data("autoplayonlyfirsttime") == true || h.data("autoplayonlyfirsttime") == "true") {
                            h.data("autoplay", false);
                            h.data("autoplayonlyfirsttime", false)
                        }
                    }
                }
                var V = 0;
                var $ = 0;
                if (h.find("img").length > 0) {
                    var K = h.find("img");
                    if (K.width() == 0)K.css({width: "auto"});
                    if (K.height() == 0)K.css({height: "auto"});
                    if (K.data("ww") == t && K.width() > 0)K.data("ww", K.width());
                    if (K.data("hh") == t && K.height() > 0)K.data("hh", K.height());
                    var Q = K.data("ww");
                    var G = K.data("hh");
                    if (Q == t)Q = 0;
                    if (G == t)G = 0;
                    K.width(Q * r.bw);
                    K.height(G * r.bh);
                    V = K.width();
                    $ = K.height()
                } else {
                    if (h.find("iframe").length > 0 || h.find("video").length > 0) {
                        var Y = false, K = h.find("iframe");
                        if (K.length == 0) {
                            K = h.find("video");
                            Y = true
                        }
                        K.css({display: "block"});
                        if (h.data("ww") == t)h.data("ww", K.width());
                        if (h.data("hh") == t)h.data("hh", K.height());
                        var Q = h.data("ww"), G = h.data("hh");
                        var Z = h;
                        if (Z.data("fsize") == t)Z.data("fsize", parseInt(Z.css("font-size"), 0) || 0);
                        if (Z.data("pt") == t)Z.data("pt", parseInt(Z.css("paddingTop"), 0) || 0);
                        if (Z.data("pb") == t)Z.data("pb", parseInt(Z.css("paddingBottom"), 0) || 0);
                        if (Z.data("pl") == t)Z.data("pl", parseInt(Z.css("paddingLeft"), 0) || 0);
                        if (Z.data("pr") == t)Z.data("pr", parseInt(Z.css("paddingRight"), 0) || 0);
                        if (Z.data("mt") == t)Z.data("mt", parseInt(Z.css("marginTop"), 0) || 0);
                        if (Z.data("mb") == t)Z.data("mb", parseInt(Z.css("marginBottom"), 0) || 0);
                        if (Z.data("ml") == t)Z.data("ml", parseInt(Z.css("marginLeft"), 0) || 0);
                        if (Z.data("mr") == t)Z.data("mr", parseInt(Z.css("marginRight"), 0) || 0);
                        if (Z.data("bt") == t)Z.data("bt", parseInt(Z.css("borderTop"), 0) || 0);
                        if (Z.data("bb") == t)Z.data("bb", parseInt(Z.css("borderBottom"), 0) || 0);
                        if (Z.data("bl") == t)Z.data("bl", parseInt(Z.css("borderLeft"), 0) || 0);
                        if (Z.data("br") == t)Z.data("br", parseInt(Z.css("borderRight"), 0) || 0);
                        if (Z.data("lh") == t)Z.data("lh", parseInt(Z.css("lineHeight"), 0) || 0);
                        if (Z.data("lh") == "auto")Z.data("lh", Z.data("fsize") + 4);
                        var et = r.width, tt = r.height;
                        if (et > r.startwidth)et = r.startwidth;
                        if (tt > r.startheight)tt = r.startheight;
                        if (!h.hasClass("fullscreenvideo"))h.css({
                            "font-size": Z.data("fsize") * r.bw + "px",
                            "padding-top": Z.data("pt") * r.bh + "px",
                            "padding-bottom": Z.data("pb") * r.bh + "px",
                            "padding-left": Z.data("pl") * r.bw + "px",
                            "padding-right": Z.data("pr") * r.bw + "px",
                            "margin-top": Z.data("mt") * r.bh + "px",
                            "margin-bottom": Z.data("mb") * r.bh + "px",
                            "margin-left": Z.data("ml") * r.bw + "px",
                            "margin-right": Z.data("mr") * r.bw + "px",
                            "border-top": Z.data("bt") * r.bh + "px",
                            "border-bottom": Z.data("bb") * r.bh + "px",
                            "border-left": Z.data("bl") * r.bw + "px",
                            "border-right": Z.data("br") * r.bw + "px",
                            "line-height": Z.data("lh") * r.bh + "px",
                            height: G * r.bh + "px"
                        }); else {
                            l = 0;
                            c = 0;
                            h.data("x", 0);
                            h.data("y", 0);
                            var nt = r.height;
                            if (r.autoHeight == "on")nt = r.container.height();
                            h.css({width: r.width, height: nt})
                        }
                        if (Y == false) {
                            K.width(Q * r.bw);
                            K.height(G * r.bh)
                        } else if (h.data("forcecover") != 1 && !h.hasClass("fullscreenvideo")) {
                            K.width(Q * r.bw);
                            K.height(G * r.bh)
                        }
                        V = K.width();
                        $ = K.height()
                    } else {
                        h.find(".tp-resizeme, .tp-resizeme *").each(function () {
                            q(e(this), r)
                        });
                        if (h.hasClass("tp-resizeme")) {
                            h.find("*").each(function () {
                                q(e(this), r)
                            })
                        }
                        q(h, r);
                        $ = h.outerHeight(true);
                        V = h.outerWidth(true);
                        var rt = h.outerHeight();
                        var it = h.css("backgroundColor");
                        h.find(".frontcorner").css({
                            borderWidth: rt + "px",
                            left: 0 - rt + "px",
                            borderRight: "0px solid transparent",
                            borderTopColor: it
                        });
                        h.find(".frontcornertop").css({
                            borderWidth: rt + "px",
                            left: 0 - rt + "px",
                            borderRight: "0px solid transparent",
                            borderBottomColor: it
                        });
                        h.find(".backcorner").css({
                            borderWidth: rt + "px",
                            right: 0 - rt + "px",
                            borderLeft: "0px solid transparent",
                            borderBottomColor: it
                        });
                        h.find(".backcornertop").css({
                            borderWidth: rt + "px",
                            right: 0 - rt + "px",
                            borderLeft: "0px solid transparent",
                            borderTopColor: it
                        })
                    }
                }
                if (r.fullScreenAlignForce == "on") {
                    l = 0;
                    c = 0
                }
                if (h.data("voffset") == t)h.data("voffset", 0);
                if (h.data("hoffset") == t)h.data("hoffset", 0);
                var st = h.data("voffset") * v;
                var ot = h.data("hoffset") * v;
                var ut = r.startwidth * v;
                var at = r.startheight * v;
                if (r.fullScreenAlignForce == "on") {
                    ut = r.container.width();
                    at = r.container.height()
                }
                if (h.data("x") == "center" || h.data("xcenter") == "center") {
                    h.data("xcenter", "center");
                    h.data("x", ut / 2 - h.outerWidth(true) / 2 + ot)
                }
                if (h.data("x") == "left" || h.data("xleft") == "left") {
                    h.data("xleft", "left");
                    h.data("x", 0 / v + ot)
                }
                if (h.data("x") == "right" || h.data("xright") == "right") {
                    h.data("xright", "right");
                    h.data("x", (ut - h.outerWidth(true) + ot) / v)
                }
                if (h.data("y") == "center" || h.data("ycenter") == "center") {
                    h.data("ycenter", "center");
                    h.data("y", at / 2 - h.outerHeight(true) / 2 + st)
                }
                if (h.data("y") == "top" || h.data("ytop") == "top") {
                    h.data("ytop", "top");
                    h.data("y", 0 / r.bh + st)
                }
                if (h.data("y") == "bottom" || h.data("ybottom") == "bottom") {
                    h.data("ybottom", "bottom");
                    h.data("y", (at - h.outerHeight(true) + st) / v)
                }
                if (h.data("start") == t)h.data("start", 1e3);
                var ft = h.data("easing");
                if (ft == t)ft = "punchgs.Power1.easeOut";
                var lt = h.data("start") / 1e3, ct = h.data("speed") / 1e3;
                if (h.data("x") == "center" || h.data("xcenter") == "center")var ht = h.data("x") + l; else {
                    var ht = v * h.data("x") + l
                }
                if (h.data("y") == "center" || h.data("ycenter") == "center")var pt = h.data("y") + c; else {
                    var pt = r.bh * h.data("y") + c
                }
                punchgs.TweenLite.set(h, {top: pt, left: ht, overwrite: "auto"});
                if (f == 0)s = true;
                if (h.data("timeline") != t && !s) {
                    if (f != 2)h.data("timeline").gotoAndPlay(0);
                    s = true
                }
                if (!s) {
                    if (h.data("timeline") != t) {
                    }
                    var dt = new punchgs.TimelineLite({smoothChildTiming: true, onStart: u});
                    dt.pause();
                    if (r.fullScreenAlignForce == "on") {
                    }
                    var vt = h;
                    if (h.data("mySplitText") != t)h.data("mySplitText").revert();
                    if (h.data("splitin") == "chars" || h.data("splitin") == "words" || h.data("splitin") == "lines" || h.data("splitout") == "chars" || h.data("splitout") == "words" || h.data("splitout") == "lines") {
                        if (h.find("a").length > 0)h.data("mySplitText", new punchgs.SplitText(h.find("a"), {
                            type: "lines,words,chars",
                            charsClass: "tp-splitted",
                            wordsClass: "tp-splitted",
                            linesClass: "tp-splitted"
                        })); else if (h.find(".tp-layer-inner-rotation").length > 0)h.data("mySplitText", new punchgs.SplitText(h.find(".tp-layer-inner-rotation"), {
                            type: "lines,words,chars",
                            charsClass: "tp-splitted",
                            wordsClass: "tp-splitted",
                            linesClass: "tp-splitted"
                        })); else h.data("mySplitText", new punchgs.SplitText(h, {
                            type: "lines,words,chars",
                            charsClass: "tp-splitted",
                            wordsClass: "tp-splitted",
                            linesClass: "tp-splitted"
                        }));
                        h.addClass("splitted")
                    }
                    if (h.data("splitin") == "chars")vt = h.data("mySplitText").chars;
                    if (h.data("splitin") == "words")vt = h.data("mySplitText").words;
                    if (h.data("splitin") == "lines")vt = h.data("mySplitText").lines;
                    var mt = P();
                    var gt = P();
                    if (h.data("repeat") != t)repeatV = h.data("repeat");
                    if (h.data("yoyo") != t)yoyoV = h.data("yoyo");
                    if (h.data("repeatdelay") != t)repeatdelayV = h.data("repeatdelay");
                    var yt = h.attr("class");
                    if (yt.match("customin"))mt = H(mt, h.data("customin")); else if (yt.match("randomrotate")) {
                        mt.scale = Math.random() * 3 + 1;
                        mt.rotation = Math.round(Math.random() * 200 - 100);
                        mt.x = Math.round(Math.random() * 200 - 100);
                        mt.y = Math.round(Math.random() * 200 - 100)
                    } else if (yt.match("lfr") || yt.match("skewfromright"))mt.x = 15 + r.width; else if (yt.match("lfl") || yt.match("skewfromleft"))mt.x = -15 - V; else if (yt.match("sfl") || yt.match("skewfromleftshort"))mt.x = -50; else if (yt.match("sfr") || yt.match("skewfromrightshort"))mt.x = 50; else if (yt.match("lft"))mt.y = -25 - $; else if (yt.match("lfb"))mt.y = 25 + r.height; else if (yt.match("sft"))mt.y = -50; else if (yt.match("sfb"))mt.y = 50;
                    if (yt.match("skewfromright") || h.hasClass("skewfromrightshort"))mt.skewX = -85; else if (yt.match("skewfromleft") || h.hasClass("skewfromleftshort"))mt.skewX = 85;
                    if (yt.match("fade") || yt.match("sft") || yt.match("sfl") || yt.match("sfb") || yt.match("skewfromleftshort") || yt.match("sfr") || yt.match("skewfromrightshort"))mt.opacity = 0;
                    if (F().toLowerCase() == "safari") {
                    }
                    var bt = h.data("elementdelay") == t ? 0 : h.data("elementdelay");
                    gt.ease = mt.ease = h.data("easing") == t ? punchgs.Power1.easeInOut : h.data("easing");
                    mt.data = new Object;
                    mt.data.oldx = mt.x;
                    mt.data.oldy = mt.y;
                    gt.data = new Object;
                    gt.data.oldx = gt.x;
                    gt.data.oldy = gt.y;
                    mt.x = mt.x * v;
                    mt.y = mt.y * v;
                    var wt = new punchgs.TimelineLite;
                    if (f != 2) {
                        if (yt.match("customin")) {
                            if (vt != h)dt.add(punchgs.TweenLite.set(h, {
                                force3D: "auto",
                                opacity: 1,
                                scaleX: 1,
                                scaleY: 1,
                                rotationX: 0,
                                rotationY: 0,
                                rotationZ: 0,
                                skewX: 0,
                                skewY: 0,
                                z: 0,
                                x: 0,
                                y: 0,
                                visibility: "visible",
                                delay: 0,
                                overwrite: "all"
                            }));
                            mt.visibility = "hidden";
                            gt.visibility = "visible";
                            gt.overwrite = "all";
                            gt.opacity = 1;
                            gt.onComplete = o();
                            gt.delay = lt;
                            gt.force3D = "auto";
                            dt.add(wt.staggerFromTo(vt, ct, mt, gt, bt), "frame0")
                        } else {
                            mt.visibility = "visible";
                            mt.transformPerspective = 600;
                            if (vt != h)dt.add(punchgs.TweenLite.set(h, {
                                force3D: "auto",
                                opacity: 1,
                                scaleX: 1,
                                scaleY: 1,
                                rotationX: 0,
                                rotationY: 0,
                                rotationZ: 0,
                                skewX: 0,
                                skewY: 0,
                                z: 0,
                                x: 0,
                                y: 0,
                                visibility: "visible",
                                delay: 0,
                                overwrite: "all"
                            }));
                            gt.visibility = "visible";
                            gt.delay = lt;
                            gt.onComplete = o();
                            gt.opacity = 1;
                            gt.force3D = "auto";
                            if (yt.match("randomrotate") && vt != h) {
                                for (var n = 0; n < vt.length; n++) {
                                    var Et = new Object;
                                    var St = new Object;
                                    e.extend(Et, mt);
                                    e.extend(St, gt);
                                    mt.scale = Math.random() * 3 + 1;
                                    mt.rotation = Math.round(Math.random() * 200 - 100);
                                    mt.x = Math.round(Math.random() * 200 - 100);
                                    mt.y = Math.round(Math.random() * 200 - 100);
                                    if (n != 0)St.delay = lt + n * bt;
                                    dt.append(punchgs.TweenLite.fromTo(vt[n], ct, Et, St), "frame0")
                                }
                            } else dt.add(wt.staggerFromTo(vt, ct, mt, gt, bt), "frame0")
                        }
                    }
                    h.data("timeline", dt);
                    var xt = new Array;
                    if (h.data("frames") != t) {
                        var Tt = h.data("frames");
                        Tt = Tt.replace(/\s+/g, "");
                        Tt = Tt.replace("{", "");
                        var Nt = Tt.split("}");
                        e.each(Nt, function (e, t) {
                            if (t.length > 0) {
                                var n = B(t);
                                W(h, r, n, "frame" + (e + 10), v)
                            }
                        })
                    }
                    dt = h.data("timeline");
                    if (h.data("end") != t && (f == -1 || f == 2)) {
                        X(h, r, h.data("end") / 1e3, mt, "frame99", v)
                    } else {
                        if (f == -1 || f == 2)X(h, r, 999999, mt, "frame99", v); else X(h, r, 200, mt, "frame99", v)
                    }
                    dt = h.data("timeline");
                    h.data("timeline", dt);
                    R(h, v);
                    dt.resume()
                }
            }
            if (s) {
                U(h);
                R(h, v);
                if (h.data("timeline") != t) {
                    var Ct = h.data("timeline").getTweensOf();
                    e.each(Ct, function (e, n) {
                        if (n.vars.data != t) {
                            var r = n.vars.data.oldx * v;
                            var i = n.vars.data.oldy * v;
                            if (n.progress() != 1 && n.progress() != 0) {
                                try {
                                    n.vars.x = r;
                                    n.vary.y = i
                                } catch (s) {
                                }
                            } else {
                                if (n.progress() == 1) {
                                    punchgs.TweenLite.set(n.target, {x: r, y: i})
                                }
                            }
                        }
                    })
                }
            }
        });
        var d = e("body").find("#" + r.container.attr("id")).find(".tp-bannertimer");
        d.data("opt", r);
        if (s != t)setTimeout(function () {
            s.resume()
        }, 30)
    };
    var F = function () {
        var e = navigator.appName, t = navigator.userAgent, n;
        var r = t.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
        if (r && (n = t.match(/version\/([\.\d]+)/i)) != null)r[2] = n[1];
        r = r ? [r[1], r[2]] : [e, navigator.appVersion, "-?"];
        return r[0]
    };
    var I = function () {
        var e = navigator.appName, t = navigator.userAgent, n;
        var r = t.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
        if (r && (n = t.match(/version\/([\.\d]+)/i)) != null)r[2] = n[1];
        r = r ? [r[1], r[2]] : [e, navigator.appVersion, "-?"];
        return r[1]
    };
    var q = function (e, n) {
        if (e.data("fsize") == t)e.data("fsize", parseInt(e.css("font-size"), 0) || 0);
        if (e.data("pt") == t)e.data("pt", parseInt(e.css("paddingTop"), 0) || 0);
        if (e.data("pb") == t)e.data("pb", parseInt(e.css("paddingBottom"), 0) || 0);
        if (e.data("pl") == t)e.data("pl", parseInt(e.css("paddingLeft"), 0) || 0);
        if (e.data("pr") == t)e.data("pr", parseInt(e.css("paddingRight"), 0) || 0);
        if (e.data("mt") == t)e.data("mt", parseInt(e.css("marginTop"), 0) || 0);
        if (e.data("mb") == t)e.data("mb", parseInt(e.css("marginBottom"), 0) || 0);
        if (e.data("ml") == t)e.data("ml", parseInt(e.css("marginLeft"), 0) || 0);
        if (e.data("mr") == t)e.data("mr", parseInt(e.css("marginRight"), 0) || 0);
        if (e.data("bt") == t)e.data("bt", parseInt(e.css("borderTopWidth"), 0) || 0);
        if (e.data("bb") == t)e.data("bb", parseInt(e.css("borderBottomWidth"), 0) || 0);
        if (e.data("bl") == t)e.data("bl", parseInt(e.css("borderLeftWidth"), 0) || 0);
        if (e.data("br") == t)e.data("br", parseInt(e.css("borderRightWidth"), 0) || 0);
        if (e.data("ls") == t)e.data("ls", parseInt(e.css("letterSpacing"), 0) || 0);
        if (e.data("lh") == t)e.data("lh", parseInt(e.css("lineHeight"), 0) || "auto");
        if (e.data("minwidth") == t)e.data("minwidth", parseInt(e.css("minWidth"), 0) || 0);
        if (e.data("minheight") == t)e.data("minheight", parseInt(e.css("minHeight"), 0) || 0);
        if (e.data("maxwidth") == t)e.data("maxwidth", parseInt(e.css("maxWidth"), 0) || "none");
        if (e.data("maxheight") == t)e.data("maxheight", parseInt(e.css("maxHeight"), 0) || "none");
        if (e.data("wii") == t)e.data("wii", parseInt(e.css("width"), 0) || 0);
        if (e.data("hii") == t)e.data("hii", parseInt(e.css("height"), 0) || 0);
        if (e.data("wan") == t)e.data("wan", e.css("-webkit-transition"));
        if (e.data("moan") == t)e.data("moan", e.css("-moz-animation-transition"));
        if (e.data("man") == t)e.data("man", e.css("-ms-animation-transition"));
        if (e.data("ani") == t)e.data("ani", e.css("transition"));
        if (e.data("lh") == "auto")e.data("lh", e.data("fsize") + 4);
        if (!e.hasClass("tp-splitted")) {
            e.css("-webkit-transition", "none");
            e.css("-moz-transition", "none");
            e.css("-ms-transition", "none");
            e.css("transition", "none");
            punchgs.TweenLite.set(e, {
                fontSize: Math.round(e.data("fsize") * n.bw) + "px",
                letterSpacing: Math.floor(e.data("ls") * n.bw) + "px",
                paddingTop: Math.round(e.data("pt") * n.bh) + "px",
                paddingBottom: Math.round(e.data("pb") * n.bh) + "px",
                paddingLeft: Math.round(e.data("pl") * n.bw) + "px",
                paddingRight: Math.round(e.data("pr") * n.bw) + "px",
                marginTop: e.data("mt") * n.bh + "px",
                marginBottom: e.data("mb") * n.bh + "px",
                marginLeft: e.data("ml") * n.bw + "px",
                marginRight: e.data("mr") * n.bw + "px",
                borderTopWidth: Math.round(e.data("bt") * n.bh) + "px",
                borderBottomWidth: Math.round(e.data("bb") * n.bh) + "px",
                borderLeftWidth: Math.round(e.data("bl") * n.bw) + "px",
                borderRightWidth: Math.round(e.data("br") * n.bw) + "px",
                lineHeight: Math.round(e.data("lh") * n.bh) + "px",
                minWidth: e.data("minwidth") * n.bw + "px",
                minHeight: e.data("minheight") * n.bh + "px",
                overwrite: "auto"
            });
            setTimeout(function () {
                e.css("-webkit-transition", e.data("wan"));
                e.css("-moz-transition", e.data("moan"));
                e.css("-ms-transition", e.data("man"));
                e.css("transition", e.data("ani"))
            }, 30);
            if (e.data("maxheight") != "none")e.css({maxHeight: e.data("maxheight") * n.bh + "px"});
            if (e.data("maxwidth") != "none")e.css({maxWidth: e.data("maxwidth") * n.bw + "px"})
        }
    };
    var R = function (n, r) {
        n.find(".rs-pendulum").each(function () {
            var n = e(this);
            if (n.data("timeline") == t) {
                n.data("timeline", new punchgs.TimelineLite);
                var i = n.data("startdeg") == t ? -20 : n.data("startdeg"), s = n.data("enddeg") == t ? 20 : n.data("enddeg"), o = n.data("speed") == t ? 2 : n.data("speed"), u = n.data("origin") == t ? "50% 50%" : n.data("origin"), a = n.data("easing") == t ? punchgs.Power2.easeInOut : n.data("ease");
                i = i * r;
                s = s * r;
                n.data("timeline").append(new punchgs.TweenLite.fromTo(n, o, {
                    force3D: "auto",
                    rotation: i,
                    transformOrigin: u
                }, {rotation: s, ease: a}));
                n.data("timeline").append(new punchgs.TweenLite.fromTo(n, o, {
                    force3D: "auto",
                    rotation: s,
                    transformOrigin: u
                }, {
                    rotation: i, ease: a, onComplete: function () {
                        n.data("timeline").restart()
                    }
                }))
            }
        });
        n.find(".rs-rotate").each(function () {
            var n = e(this);
            if (n.data("timeline") == t) {
                n.data("timeline", new punchgs.TimelineLite);
                var i = n.data("startdeg") == t ? 0 : n.data("startdeg"), s = n.data("enddeg") == t ? 360 : n.data("enddeg");
                speed = n.data("speed") == t ? 2 : n.data("speed"), origin = n.data("origin") == t ? "50% 50%" : n.data("origin"), easing = n.data("easing") == t ? punchgs.Power2.easeInOut : n.data("easing");
                i = i * r;
                s = s * r;
                n.data("timeline").append(new punchgs.TweenLite.fromTo(n, speed, {
                    force3D: "auto",
                    rotation: i,
                    transformOrigin: origin
                }, {
                    rotation: s, ease: easing, onComplete: function () {
                        n.data("timeline").restart()
                    }
                }))
            }
        });
        n.find(".rs-slideloop").each(function () {
            var n = e(this);
            if (n.data("timeline") == t) {
                n.data("timeline", new punchgs.TimelineLite);
                var i = n.data("xs") == t ? 0 : n.data("xs"), s = n.data("ys") == t ? 0 : n.data("ys"), o = n.data("xe") == t ? 0 : n.data("xe"), u = n.data("ye") == t ? 0 : n.data("ye"), a = n.data("speed") == t ? 2 : n.data("speed"), f = n.data("easing") == t ? punchgs.Power2.easeInOut : n.data("easing");
                i = i * r;
                s = s * r;
                o = o * r;
                u = u * r;
                n.data("timeline").append(new punchgs.TweenLite.fromTo(n, a, {force3D: "auto", x: i, y: s}, {
                    x: o,
                    y: u,
                    ease: f
                }));
                n.data("timeline").append(new punchgs.TweenLite.fromTo(n, a, {force3D: "auto", x: o, y: u}, {
                    x: i,
                    y: s,
                    onComplete: function () {
                        n.data("timeline").restart()
                    }
                }))
            }
        });
        n.find(".rs-pulse").each(function () {
            var n = e(this);
            if (n.data("timeline") == t) {
                n.data("timeline", new punchgs.TimelineLite);
                var r = n.data("zoomstart") == t ? 0 : n.data("zoomstart"), i = n.data("zoomend") == t ? 0 : n.data("zoomend"), s = n.data("speed") == t ? 2 : n.data("speed"), o = n.data("easing") == t ? punchgs.Power2.easeInOut : n.data("easing");
                n.data("timeline").append(new punchgs.TweenLite.fromTo(n, s, {force3D: "auto", scale: r}, {
                    scale: i,
                    ease: o
                }));
                n.data("timeline").append(new punchgs.TweenLite.fromTo(n, s, {force3D: "auto", scale: i}, {
                    scale: r,
                    onComplete: function () {
                        n.data("timeline").restart()
                    }
                }))
            }
        });
        n.find(".rs-wave").each(function () {
            var n = e(this);
            if (n.data("timeline") == t) {
                n.data("timeline", new punchgs.TimelineLite);
                var i = n.data("angle") == t ? 10 : n.data("angle"), s = n.data("radius") == t ? 10 : n.data("radius"), o = n.data("speed") == t ? -20 : n.data("speed"), u = n.data("origin") == t ? -20 : n.data("origin");
                i = i * r;
                s = s * r;
                var a = {a: 0, ang: i, element: n, unit: s};
                n.data("timeline").append(new punchgs.TweenLite.fromTo(a, o, {a: 360}, {
                    a: 0,
                    force3D: "auto",
                    ease: punchgs.Linear.easeNone,
                    onUpdate: function () {
                        var e = a.a * (Math.PI / 180);
                        punchgs.TweenLite.to(a.element, .1, {
                            force3D: "auto",
                            x: Math.cos(e) * a.unit,
                            y: a.unit * (1 - Math.sin(e))
                        })
                    },
                    onComplete: function () {
                        n.data("timeline").restart()
                    }
                }))
            }
        })
    };
    var U = function (n) {
        n.find(".rs-pendulum, .rs-slideloop, .rs-pulse, .rs-wave").each(function () {
            var n = e(this);
            if (n.data("timeline") != t) {
                n.data("timeline").pause();
                n.data("timeline", null)
            }
        })
    };
    var z = function (n, r) {
        var i = 0;
        var s = n.find(".tp-caption"), o = r.container.find(".tp-static-layers").find(".tp-caption");
        e.each(o, function (e, t) {
            s.push(t)
        });
        s.each(function (n) {
            var s = -1;
            var o = e(this);
            if (o.hasClass("tp-static-layer")) {
                if (o.data("startslide") == -1 || o.data("startslide") == "-1")o.data("startslide", 0);
                if (o.data("endslide") == -1 || o.data("endslide") == "-1")o.data("endslide", r.slideamount);
                if (o.hasClass("tp-is-shown")) {
                    if (o.data("startslide") > r.next || o.data("endslide") < r.next) {
                        s = 2;
                        o.removeClass("tp-is-shown")
                    } else {
                        s = 0
                    }
                } else {
                    s = 2
                }
            }
            if (s != 0) {
                U(o);
                if (o.find("iframe").length > 0) {
                    punchgs.TweenLite.to(o.find("iframe"), .2, {autoAlpha: 0});
                    if (J())o.find("iframe").remove();
                    try {
                        var u = o.find("iframe");
                        var a = u.attr("id");
                        var f = $f(a);
                        f.api("pause");
                        clearTimeout(o.data("timerplay"))
                    } catch (l) {
                    }
                    try {
                        var c = o.data("player");
                        c.stopVideo();
                        clearTimeout(o.data("timerplay"))
                    } catch (l) {
                    }
                }
                if (o.find("video").length > 0) {
                    try {
                        o.find("video").each(function (t) {
                            var n = e(this).parent();
                            var r = n.attr("id");
                            clearTimeout(n.data("timerplay"));
                            var i = this;
                            i.pause()
                        })
                    } catch (l) {
                    }
                }
                try {
                    var h = o.data("timeline");
                    var p = h.getLabelTime("frame99");
                    var d = h.time();
                    if (p > d) {
                        var v = h.getTweensOf(o);
                        e.each(v, function (e, t) {
                            if (e != 0)t.pause()
                        });
                        if (o.css("opacity") != 0) {
                            var m = o.data("endspeed") == t ? o.data("speed") : o.data("endspeed");
                            if (m > i)i = m;
                            h.play("frame99")
                        } else h.progress(1, false)
                    }
                } catch (l) {
                }
            }
        });
        return i
    };
    var W = function (e, n, r, i, s) {
        var o = e.data("timeline");
        var u = new punchgs.TimelineLite;
        var a = e;
        if (r.typ == "chars")a = e.data("mySplitText").chars; else if (r.typ == "words")a = e.data("mySplitText").words; else if (r.typ == "lines")a = e.data("mySplitText").lines;
        r.animation.ease = r.ease;
        if (r.animation.rotationZ != t)r.animation.rotation = r.animation.rotationZ;
        r.animation.data = new Object;
        r.animation.data.oldx = r.animation.x;
        r.animation.data.oldy = r.animation.y;
        r.animation.x = r.animation.x * s;
        r.animation.y = r.animation.y * s;
        o.add(u.staggerTo(a, r.speed, r.animation, r.elementdelay), r.start);
        o.addLabel(i, r.start);
        e.data("timeline", o)
    };
    var X = function (e, n, r, i, s, o) {
        var u = e.data("timeline"), a = new punchgs.TimelineLite;
        var f = P(), l = e.data("endspeed") == t ? e.data("speed") : e.data("endspeed"), c = e.attr("class");
        f.ease = e.data("endeasing") == t ? punchgs.Power1.easeInOut : e.data("endeasing");
        l = l / 1e3;
        if (c.match("ltr") || c.match("ltl") || c.match("str") || c.match("stl") || c.match("ltt") || c.match("ltb") || c.match("stt") || c.match("stb") || c.match("skewtoright") || c.match("skewtorightshort") || c.match("skewtoleft") || c.match("skewtoleftshort") || c.match("fadeout") || c.match("randomrotateout")) {
            if (c.match("skewtoright") || c.match("skewtorightshort"))f.skewX = 35; else if (c.match("skewtoleft") || c.match("skewtoleftshort"))f.skewX = -35;
            if (c.match("ltr") || c.match("skewtoright"))f.x = n.width + 60; else if (c.match("ltl") || c.match("skewtoleft"))f.x = 0 - (n.width + 60); else if (c.match("ltt"))f.y = 0 - (n.height + 60); else if (c.match("ltb"))f.y = n.height + 60; else if (c.match("str") || c.match("skewtorightshort")) {
                f.x = 50;
                f.opacity = 0
            } else if (c.match("stl") || c.match("skewtoleftshort")) {
                f.x = -50;
                f.opacity = 0
            } else if (c.match("stt")) {
                f.y = -50;
                f.opacity = 0
            } else if (c.match("stb")) {
                f.y = 50;
                f.opacity = 0
            } else if (c.match("randomrotateout")) {
                f.x = Math.random() * n.width;
                f.y = Math.random() * n.height;
                f.scale = Math.random() * 2 + .3;
                f.rotation = Math.random() * 360 - 180;
                f.opacity = 0
            } else if (c.match("fadeout")) {
                f.opacity = 0
            }
            if (c.match("skewtorightshort"))f.x = 270; else if (c.match("skewtoleftshort"))f.x = -270;
            f.data = new Object;
            f.data.oldx = f.x;
            f.data.oldy = f.y;
            f.x = f.x * o;
            f.y = f.y * o;
            f.overwrite = "auto";
            var h = e;
            var h = e;
            if (e.data("splitout") == "chars")h = e.data("mySplitText").chars; else if (e.data("splitout") == "words")h = e.data("mySplitText").words; else if (e.data("splitout") == "lines")h = e.data("mySplitText").lines;
            var p = e.data("endelementdelay") == t ? 0 : e.data("endelementdelay");
            u.add(a.staggerTo(h, l, f, p), r)
        } else if (e.hasClass("customout")) {
            f = H(f, e.data("customout"));
            var h = e;
            if (e.data("splitout") == "chars")h = e.data("mySplitText").chars; else if (e.data("splitout") == "words")h = e.data("mySplitText").words; else if (e.data("splitout") == "lines")h = e.data("mySplitText").lines;
            var p = e.data("endelementdelay") == t ? 0 : e.data("endelementdelay");
            f.onStart = function () {
                punchgs.TweenLite.set(e, {
                    transformPerspective: f.transformPerspective,
                    transformOrigin: f.transformOrigin,
                    overwrite: "auto"
                })
            };
            f.data = new Object;
            f.data.oldx = f.x;
            f.data.oldy = f.y;
            f.x = f.x * o;
            f.y = f.y * o;
            u.add(a.staggerTo(h, l, f, p), r)
        } else {
            i.delay = 0;
            u.add(punchgs.TweenLite.to(e, l, i), r)
        }
        u.addLabel(s, r);
        e.data("timeline", u)
    };
    var V = function (t, n) {
        t.children().each(function () {
            try {
                e(this).die("click")
            } catch (t) {
            }
            try {
                e(this).die("mouseenter")
            } catch (t) {
            }
            try {
                e(this).die("mouseleave")
            } catch (t) {
            }
            try {
                e(this).unbind("hover")
            } catch (t) {
            }
        });
        try {
            t.die("click", "mouseenter", "mouseleave")
        } catch (r) {
        }
        clearInterval(n.cdint);
        t = null
    };
    var $ = function (n, r) {
        r.cd = 0;
        r.loop = 0;
        if (r.stopAfterLoops != t && r.stopAfterLoops > -1)r.looptogo = r.stopAfterLoops; else r.looptogo = 9999999;
        if (r.stopAtSlide != t && r.stopAtSlide > -1)r.lastslidetoshow = r.stopAtSlide; else r.lastslidetoshow = 999;
        r.stopLoop = "off";
        if (r.looptogo == 0)r.stopLoop = "on";
        if (r.slideamount > 1 && !(r.stopAfterLoops == 0 && r.stopAtSlide == 1)) {
            var i = n.find(".tp-bannertimer");
            n.on("stoptimer", function () {
                var t = e(this).find(".tp-bannertimer");
                t.data("tween").pause();
                if (r.hideTimerBar == "on")t.css({visibility: "hidden"})
            });
            n.on("starttimer", function () {
                if (r.conthover != 1 && r.videoplaying != true && r.width > r.hideSliderAtLimit && r.bannertimeronpause != true && r.overnav != true)if (r.stopLoop == "on" && r.next == r.lastslidetoshow - 1 || r.noloopanymore == 1)r.noloopanymore = 1; else {
                    i.css({visibility: "visible"});
                    i.data("tween").resume()
                }
                if (r.hideTimerBar == "on")i.css({visibility: "hidden"})
            });
            n.on("restarttimer", function () {
                var t = e(this).find(".tp-bannertimer");
                if (r.stopLoop == "on" && r.next == r.lastslidetoshow - 1 || r.noloopanymore == 1)r.noloopanymore = 1; else {
                    t.css({visibility: "visible"});
                    t.data("tween").kill();
                    t.data("tween", punchgs.TweenLite.fromTo(t, r.delay / 1e3, {width: "0%"}, {
                        force3D: "auto",
                        width: "100%",
                        ease: punchgs.Linear.easeNone,
                        onComplete: s,
                        delay: 1
                    }))
                }
                if (r.hideTimerBar == "on")t.css({visibility: "hidden"})
            });
            n.on("nulltimer", function () {
                i.data("tween").pause(0);
                if (r.hideTimerBar == "on")i.css({visibility: "hidden"})
            });
            var s = function () {
                if (e("body").find(n).length == 0) {
                    V(n, r);
                    clearInterval(r.cdint)
                }
                n.trigger("revolution.slide.slideatend");
                if (n.data("conthover-changed") == 1) {
                    r.conthover = n.data("conthover");
                    n.data("conthover-changed", 0)
                }
                r.act = r.next;
                r.next = r.next + 1;
                if (r.next > n.find(">ul >li").length - 1) {
                    r.next = 0;
                    r.looptogo = r.looptogo - 1;
                    if (r.looptogo <= 0) {
                        r.stopLoop = "on"
                    }
                }
                if (r.stopLoop == "on" && r.next == r.lastslidetoshow - 1) {
                    n.find(".tp-bannertimer").css({visibility: "hidden"});
                    n.trigger("revolution.slide.onstop");
                    r.noloopanymore = 1
                } else {
                    i.data("tween").restart()
                }
                N(n, r)
            };
            i.data("tween", punchgs.TweenLite.fromTo(i, r.delay / 1e3, {width: "0%"}, {
                force3D: "auto",
                width: "100%",
                ease: punchgs.Linear.easeNone,
                onComplete: s,
                delay: 1
            }));
            i.data("opt", r);
            n.hover(function () {
                if (r.onHoverStop == "on" && !J()) {
                    n.trigger("stoptimer");
                    n.trigger("revolution.slide.onpause");
                    var i = n.find(">ul >li:eq(" + r.next + ") .slotholder");
                    i.find(".defaultimg").each(function () {
                        var n = e(this);
                        if (n.data("kenburn") != t) {
                            n.data("kenburn").pause()
                        }
                    })
                }
            }, function () {
                if (n.data("conthover") != 1) {
                    n.trigger("revolution.slide.onresume");
                    n.trigger("starttimer");
                    var i = n.find(">ul >li:eq(" + r.next + ") .slotholder");
                    i.find(".defaultimg").each(function () {
                        var n = e(this);
                        if (n.data("kenburn") != t) {
                            n.data("kenburn").play()
                        }
                    })
                }
            })
        }
    };
    var J = function () {
        var e = ["android", "webos", "iphone", "ipad", "blackberry", "Android", "webos", , "iPod", "iPhone", "iPad", "Blackberry", "BlackBerry"];
        var t = false;
        for (var n in e) {
            if (navigator.userAgent.split(e[n]).length > 1) {
                t = true
            }
        }
        return t
    };
    var K = function (e, t, n) {
        var r = t.data("owidth");
        var i = t.data("oheight");
        if (r / i > n.width / n.height) {
            var s = n.container.width() / r;
            var o = i * s;
            var u = o / n.container.height() * e;
            e = e * (100 / u);
            u = 100;
            e = e;
            return e + "% " + u + "%" + " 1"
        } else {
            var s = n.container.width() / r;
            var o = i * s;
            var u = o / n.container.height() * e;
            return e + "% " + u + "%"
        }
    };
    var Q = function (n, r, i, s) {
        try {
            var o = n.find(">ul:first-child >li:eq(" + r.act + ")")
        } catch (u) {
            var o = n.find(">ul:first-child >li:eq(1)")
        }
        r.lastslide = r.act;
        var f = n.find(">ul:first-child >li:eq(" + r.next + ")"), l = f.find(".slotholder"), c = l.data("bgposition"), h = l.data("bgpositionend"), p = l.data("zoomstart") / 100, d = l.data("zoomend") / 100, v = l.data("rotationstart"), m = l.data("rotationend"), g = l.data("bgfit"), y = l.data("bgfitend"), b = l.data("easeme"), w = l.data("duration") / 1e3, E = 100;
        if (g == t)g = 100;
        if (y == t)y = 100;
        var S = g, x = y;
        g = K(g, l, r);
        y = K(y, l, r);
        E = K(100, l, r);
        if (p == t)p = 1;
        if (d == t)d = 1;
        if (v == t)v = 0;
        if (m == t)m = 0;
        if (p < 1)p = 1;
        if (d < 1)d = 1;
        var T = new Object;
        T.w = parseInt(E.split(" ")[0], 0), T.h = parseInt(E.split(" ")[1], 0);
        var N = false;
        if (E.split(" ")[2] == "1") {
            N = true
        }
        l.find(".defaultimg").each(function () {
            var t = e(this);
            if (l.find(".kenburnimg").length == 0)l.append('<div class="kenburnimg" style="position:absolute;z-index:1;width:100%;height:100%;top:0px;left:0px;"><img src="' + t.attr("src") + '" style="-webkit-touch-callout: none;-webkit-user-select: none;-khtml-user-select: none;-moz-user-select: none;-ms-user-select: none;user-select: none;position:absolute;width:' + T.w + "%;height:" + T.h + '%;"></div>'); else {
                l.find(".kenburnimg img").css({width: T.w + "%", height: T.h + "%"})
            }
            var n = l.find(".kenburnimg img");
            var i = G(r, c, g, n, N), o = G(r, h, y, n, N);
            if (N) {
                i.w = S / 100;
                o.w = x / 100
            }
            if (s) {
                punchgs.TweenLite.set(n, {
                    autoAlpha: 0,
                    transformPerspective: 1200,
                    transformOrigin: "0% 0%",
                    top: 0,
                    left: 0,
                    scale: i.w,
                    x: i.x,
                    y: i.y
                });
                var u = i.w, f = u * n.width() - r.width, p = u * n.height() - r.height, d = Math.abs(i.x / f * 100), v = Math.abs(i.y / p * 100);
                if (p == 0)v = 0;
                if (f == 0)d = 0;
                t.data("bgposition", d + "% " + v + "%");
                if (!a(8))t.data("currotate", Y(n));
                if (!a(8))t.data("curscale", T.w * u + "%  " + (T.h * u + "%"));
                l.find(".kenburnimg").remove()
            } else t.data("kenburn", punchgs.TweenLite.fromTo(n, w, {
                autoAlpha: 1,
                force3D: punchgs.force3d,
                transformOrigin: "0% 0%",
                top: 0,
                left: 0,
                scale: i.w,
                x: i.x,
                y: i.y
            }, {
                autoAlpha: 1, rotationZ: m, ease: b, x: o.x, y: o.y, scale: o.w, onUpdate: function () {
                    var e = n[0]._gsTransform.scaleX;
                    var i = e * n.width() - r.width, s = e * n.height() - r.height, o = Math.abs(n[0]._gsTransform.x / i * 100), u = Math.abs(n[0]._gsTransform.y / s * 100);
                    if (s == 0)u = 0;
                    if (i == 0)o = 0;
                    t.data("bgposition", o + "% " + u + "%");
                    if (!a(8))t.data("currotate", Y(n));
                    if (!a(8))t.data("curscale", T.w * e + "%  " + (T.h * e + "%"))
                }
            }))
        })
    };
    var G = function (e, t, n, r, i) {
        var s = new Object;
        if (!i)s.w = parseInt(n.split(" ")[0], 0) / 100; else s.w = parseInt(n.split(" ")[1], 0) / 100;
        switch (t) {
            case"left top":
            case"top left":
                s.x = 0;
                s.y = 0;
                break;
            case"center top":
            case"top center":
                s.x = ((0 - r.width()) * s.w + parseInt(e.width, 0)) / 2;
                s.y = 0;
                break;
            case"top right":
            case"right top":
                s.x = (0 - r.width()) * s.w + parseInt(e.width, 0);
                s.y = 0;
                break;
            case"center left":
            case"left center":
                s.x = 0;
                s.y = ((0 - r.height()) * s.w + parseInt(e.height, 0)) / 2;
                break;
            case"center center":
                s.x = ((0 - r.width()) * s.w + parseInt(e.width, 0)) / 2;
                s.y = ((0 - r.height()) * s.w + parseInt(e.height, 0)) / 2;
                break;
            case"center right":
            case"right center":
                s.x = (0 - r.width()) * s.w + parseInt(e.width, 0);
                s.y = ((0 - r.height()) * s.w + parseInt(e.height, 0)) / 2;
                break;
            case"bottom left":
            case"left bottom":
                s.x = 0;
                s.y = (0 - r.height()) * s.w + parseInt(e.height, 0);
                break;
            case"bottom center":
            case"center bottom":
                s.x = ((0 - r.width()) * s.w + parseInt(e.width, 0)) / 2;
                s.y = (0 - r.height()) * s.w + parseInt(e.height, 0);
                break;
            case"bottom right":
            case"right bottom":
                s.x = (0 - r.width()) * s.w + parseInt(e.width, 0);
                s.y = (0 - r.height()) * s.w + parseInt(e.height, 0);
                break
        }
        return s
    };
    var Y = function (e) {
        var t = e.css("-webkit-transform") || e.css("-moz-transform") || e.css("-ms-transform") || e.css("-o-transform") || e.css("transform");
        if (t !== "none") {
            var n = t.split("(")[1].split(")")[0].split(",");
            var r = n[0];
            var i = n[1];
            var s = Math.round(Math.atan2(i, r) * (180 / Math.PI))
        } else {
            var s = 0
        }
        return s < 0 ? s += 360 : s
    };
    var Z = function (n, r) {
        try {
            var i = n.find(">ul:first-child >li:eq(" + r.act + ")")
        } catch (s) {
            var i = n.find(">ul:first-child >li:eq(1)")
        }
        r.lastslide = r.act;
        var o = n.find(">ul:first-child >li:eq(" + r.next + ")");
        var u = i.find(".slotholder");
        var a = o.find(".slotholder");
        n.find(".defaultimg").each(function () {
            var n = e(this);
            punchgs.TweenLite.killTweensOf(n, false);
            punchgs.TweenLite.set(n, {scale: 1, rotationZ: 0});
            punchgs.TweenLite.killTweensOf(n.data("kenburn img"), false);
            if (n.data("kenburn") != t) {
                n.data("kenburn").pause()
            }
            if (n.data("currotate") != t && n.data("bgposition") != t && n.data("curscale") != t)punchgs.TweenLite.set(n, {
                rotation: n.data("currotate"),
                backgroundPosition: n.data("bgposition"),
                backgroundSize: n.data("curscale")
            });
            if (n != t && n.data("kenburn img") != t && n.data("kenburn img").length > 0)punchgs.TweenLite.set(n.data("kenburn img"), {autoAlpha: 0})
        })
    };
    var et = function (t, n) {
        if (J() && n.parallaxDisableOnMobile == "on")return false;
        t.find(">ul:first-child >li").each(function () {
            var t = e(this);
            for (var r = 1; r <= 10; r++)t.find(".rs-parallaxlevel-" + r).each(function () {
                var t = e(this);
                t.wrap('<div style="position:absolute;top:0px;left:0px;width:100%;height:100%;z-index:' + t.css("zIndex") + '" class="tp-parallax-container" data-parallaxlevel="' + n.parallaxLevels[r - 1] + '"></div>')
            })
        });
        if (n.parallax == "mouse" || n.parallax == "scroll+mouse" || n.parallax == "mouse+scroll") {
            t.mouseenter(function (e) {
                var n = t.find(".current-sr-slide-visible");
                var r = t.offset().top, i = t.offset().left, s = e.pageX - i, o = e.pageY - r;
                n.data("enterx", s);
                n.data("entery", o)
            });
            t.on("mousemove.hoverdir, mouseleave.hoverdir", function (r) {
                var i = t.find(".current-sr-slide-visible");
                switch (r.type) {
                    case"mousemove":
                        var s = t.offset().top, o = t.offset().left, u = i.data("enterx"), a = i.data("entery"), f = u - (r.pageX - o), l = a - (r.pageY - s);
                        i.find(".tp-parallax-container").each(function () {
                            var t = e(this), r = parseInt(t.data("parallaxlevel"), 0) / 100, i = f * r, s = l * r;
                            if (n.parallax == "scroll+mouse" || n.parallax == "mouse+scroll")punchgs.TweenLite.to(t, .4, {
                                force3D: "auto",
                                x: i,
                                ease: punchgs.Power3.easeOut,
                                overwrite: "all"
                            }); else punchgs.TweenLite.to(t, .4, {
                                force3D: "auto",
                                x: i,
                                y: s,
                                ease: punchgs.Power3.easeOut,
                                overwrite: "all"
                            })
                        });
                        break;
                    case"mouseleave":
                        i.find(".tp-parallax-container").each(function () {
                            var t = e(this);
                            if (n.parallax == "scroll+mouse" || n.parallax == "mouse+scroll")punchgs.TweenLite.to(t, 1.5, {
                                force3D: "auto",
                                x: 0,
                                ease: punchgs.Power3.easeOut
                            }); else punchgs.TweenLite.to(t, 1.5, {
                                force3D: "auto",
                                x: 0,
                                y: 0,
                                ease: punchgs.Power3.easeOut
                            })
                        });
                        break
                }
            });
            if (J())window.ondeviceorientation = function (n) {
                var r = Math.round(n.beta || 0), i = Math.round(n.gamma || 0);
                var s = t.find(".current-sr-slide-visible");
                if (e(window).width() > e(window).height()) {
                    var o = i;
                    i = r;
                    r = o
                }
                var u = 360 / t.width() * i, a = 180 / t.height() * r;
                s.find(".tp-parallax-container").each(function () {
                    var t = e(this), n = parseInt(t.data("parallaxlevel"), 0) / 100, r = u * n, i = a * n;
                    punchgs.TweenLite.to(t, .2, {force3D: "auto", x: r, y: i, ease: punchgs.Power3.easeOut})
                })
            }
        }
        if (n.parallax == "scroll" || n.parallax == "scroll+mouse" || n.parallax == "mouse+scroll") {
            e(window).on("scroll", function (e) {
                tt(t, n)
            })
        }
    };
    var tt = function (t, n) {
        if (J() && n.parallaxDisableOnMobile == "on")return false;
        var r = t.offset().top, i = e(window).scrollTop(), s = r + t.height() / 2, o = r + t.height() / 2 - i, u = e(window).height() / 2, a = u - o;
        if (s < u)a = a - (u - s);
        var f = t.find(".current-sr-slide-visible");
        t.find(".tp-parallax-container").each(function (t) {
            var n = e(this), r = parseInt(n.data("parallaxlevel"), 0) / 100, i = a * r;
            n.data("parallaxoffset", i);
            punchgs.TweenLite.to(n, .2, {force3D: "auto", y: i, ease: punchgs.Power3.easeOut})
        });
        if (n.parallaxBgFreeze != "on") {
            var l = n.parallaxLevels[0] / 100, c = a * l;
            punchgs.TweenLite.to(t, .2, {force3D: "auto", y: c, ease: punchgs.Power3.easeOut})
        }
    };
    var nt = function (n, r) {
        var i = n.parent();
        if (r.navigationType == "thumb" || r.navsecond == "both") {
            i.append('<div class="tp-bullets tp-thumbs ' + r.navigationStyle + '"><div class="tp-mask"><div class="tp-thumbcontainer"></div></div></div>')
        }
        var s = i.find(".tp-bullets.tp-thumbs .tp-mask .tp-thumbcontainer");
        var o = s.parent();
        o.width(r.thumbWidth * r.thumbAmount);
        o.height(r.thumbHeight);
        o.parent().width(r.thumbWidth * r.thumbAmount);
        o.parent().height(r.thumbHeight);
        n.find(">ul:first >li").each(function (e) {
            var i = n.find(">ul:first >li:eq(" + e + ")");
            var o = i.find(".defaultimg").css("backgroundColor");
            if (i.data("thumb") != t)var u = i.data("thumb"); else var u = i.find("img:first").attr("src");
            s.append('<div class="bullet thumb" style="background-color:' + o + ";position:relative;width:" + r.thumbWidth + "px;height:" + r.thumbHeight + "px;background-image:url(" + u + ') !important;background-size:cover;background-position:center center;"></div>');
            var a = s.find(".bullet:first")
        });
        var u = 10;
        s.find(".bullet").each(function (t) {
            var i = e(this);
            if (t == r.slideamount - 1)i.addClass("last");
            if (t == 0)i.addClass("first");
            i.width(r.thumbWidth);
            i.height(r.thumbHeight);
            if (u < i.outerWidth(true))u = i.outerWidth(true);
            i.click(function () {
                if (r.transition == 0 && i.index() != r.act) {
                    r.next = i.index();
                    f(r, n)
                }
            })
        });
        var a = u * n.find(">ul:first >li").length;
        var l = s.parent().width();
        r.thumbWidth = u;
        if (l < a) {
            e(document).mousemove(function (t) {
                e("body").data("mousex", t.pageX)
            });
            s.parent().mouseenter(function () {
                var t = e(this);
                var r = t.offset(), i = e("body").data("mousex") - r.left, s = t.width(), o = t.find(".bullet:first").outerWidth(true), u = o * n.find(">ul:first >li").length, a = u - s + 15, f = a / s;
                t.addClass("over");
                i = i - 30;
                var l = 0 - i * f;
                if (l > 0)l = 0;
                if (l < 0 - u + s)l = 0 - u + s;
                it(t, l, 200)
            });
            s.parent().mousemove(function () {
                var t = e(this), r = t.offset(), i = e("body").data("mousex") - r.left, s = t.width(), o = t.find(".bullet:first").outerWidth(true), u = o * n.find(">ul:first >li").length - 1, a = u - s + 15, f = a / s;
                i = i - 3;
                if (i < 6)i = 0;
                if (i + 3 > s - 6)i = s;
                var l = 0 - i * f;
                if (l > 0)l = 0;
                if (l < 0 - u + s)l = 0 - u + s;
                it(t, l, 0)
            });
            s.parent().mouseleave(function () {
                var t = e(this);
                t.removeClass("over");
                rt(n)
            })
        }
    };
    var rt = function (e) {
        var t = e.parent().find(".tp-bullets.tp-thumbs .tp-mask .tp-thumbcontainer"), n = t.parent(), r = n.offset(), i = n.find(".bullet:first").outerWidth(true), s = n.find(".bullet.selected").index() * i, o = n.width(), i = n.find(".bullet:first").outerWidth(true), u = i * e.find(">ul:first >li").length, a = u - o, f = a / o, l = 0 - s;
        if (l > 0)l = 0;
        if (l < 0 - u + o)l = 0 - u + o;
        if (!n.hasClass("over")) {
            it(n, l, 200)
        }
    };
    var it = function (e, t, n) {
        punchgs.TweenLite.to(e.find(".tp-thumbcontainer"), .2, {
            force3D: "auto",
            left: t,
            ease: punchgs.Power3.easeOut,
            overwrite: "auto"
        })
    }
})(jQuery)


