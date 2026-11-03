(function () {
  var btn = document.querySelector(".menu-btn"), menu = document.getElementById("menu");
  if (btn && menu) {
    btn.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    });
  }

  var yr = document.getElementById("yr");
  if (yr) yr.textContent = new Date().getFullYear();

  document.querySelectorAll(".copy").forEach(function (b) {
    b.addEventListener("click", function () {
      var t = b.getAttribute("data-copy");
      function done() { b.textContent = "Copied"; setTimeout(function () { b.textContent = "Copy"; }, 1500); }
      function sel() {
        var el = document.getElementById(b.getAttribute("data-target"));
        if (!el) return;
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      }
      try { navigator.clipboard.writeText(t).then(done, sel); } catch (e) { sel(); }
    });
  });

  var form = document.getElementById("enq");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var g = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ""; };
      var note = document.getElementById("f-note");
      if (!g("f-name")) { note.textContent = "Please add the student's name."; document.getElementById("f-name").focus(); return; }
      var msg = "Hello Matrix Chess Academy, I'd like to know about chess classes.\n\nStudent: " + g("f-name") +
        (g("f-age") ? "\nAge: " + g("f-age") : "") +
        (g("f-parent") ? "\nParent: " + g("f-parent") : "") +
        "\nInterested in: " + g("f-level") +
        (g("f-batch") ? "\nPreferred batch: " + g("f-batch") : "") +
        (g("f-msg") ? "\n\n" + g("f-msg") : "");
      var a = document.createElement("a");
      a.href = "https://wa.me/918548848884?text=" + encodeURIComponent(msg);
      a.target = "_blank"; a.rel = "noopener";
      document.body.appendChild(a); a.click(); a.remove();
      note.textContent = "WhatsApp should open with your message. If it didn't, message us on +91 85488 48884.";
    });
  }
})();

/* Hero board: plays the knight fork as a short animated lesson, then loops. */
(function () {
  var board = document.getElementById("hero-board");
  if (!board || !board.animate) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var capMove = document.getElementById("cap-move"), capText = document.getElementById("cap-text");
  var caption = capMove && capMove.parentNode, replay = document.getElementById("replay");
  var base = (board.querySelector(".sq img") || {}).getAttribute ? board.querySelector(".sq img").getAttribute("src").replace(/[wb][KQRBNP]\.svg$/, "") : "pieces/";
  var START = { a8: "bR", e8: "bK", f7: "bP", g7: "bP", h7: "bP", b5: "wN", g1: "wK", f2: "wP", g2: "wP", h2: "wP" };

  // strip the static picture; the animated layer takes over
  board.querySelectorAll(".sq").forEach(function (s) {
    s.classList.remove("hit", "from", "to");
    var im = s.querySelector("img"); if (im) im.remove();
  });
  var layer = document.createElement("div"); layer.className = "layer"; board.appendChild(layer);
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(NS, "svg"); svg.setAttribute("viewBox", "0 0 8 8"); svg.setAttribute("class", "arrows");
  board.appendChild(svg);

  function xy(sq) { return [sq.charCodeAt(0) - 97, 8 - (+sq[1])]; }
  function tf(sq, dy, s) { var p = xy(sq); return "translate(" + p[0] * 100 + "%," + (p[1] * 100 + (dy || 0)) + "%) scale(" + (s || 1) + ")"; }
  function put(el, sq) { el.style.transform = tf(sq); el.dataset.sq = sq; }
  function mark(cls, sq) { var m = document.createElement("div"); m.className = "mark " + cls; put(m, sq); layer.appendChild(m); requestAnimationFrame(function () { m.classList.add("on"); }); return m; }

  var run = 0, paused = false, visible = true;
  function wait(ms, id) {
    return new Promise(function (res, rej) {
      var left = ms, last = performance.now();
      (function tick(now) {
        if (id !== run) return rej("stop");
        if (!paused && visible) left -= now - last;
        last = now;
        if (left <= 0) res(); else requestAnimationFrame(tick);
      })(last);
    });
  }
  function anim(el, frames, opts, id) {
    var a = el.animate(frames, opts);
    return new Promise(function (res, rej) {
      a.onfinish = function () { id === run ? res() : rej("stop"); };
      a.oncancel = function () { rej("stop"); };
    });
  }
  function say(move, text) {
    caption.classList.add("fade");
    setTimeout(function () { capMove.innerHTML = move; capText.innerHTML = text; caption.classList.remove("fade"); }, 220);
  }
  function arrow(from, to, id) {
    var a = xy(from), b = xy(to), x1 = a[0] + .5, y1 = a[1] + .5, x2 = b[0] + .5, y2 = b[1] + .5;
    var dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
    x1 += ux * .3; y1 += uy * .3; x2 -= ux * .32; y2 -= uy * .32;
    var hx = x2 - ux * .28, hy = y2 - uy * .28;
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", "M" + x1 + " " + y1 + "L" + hx + " " + hy); p.setAttribute("pathLength", "1");
    p.style.strokeDasharray = "1"; p.style.strokeDashoffset = "1";
    var h = document.createElementNS(NS, "polygon");
    h.setAttribute("points", [x2, y2, hx - uy * .2, hy + ux * .2, hx + uy * .2, hy - ux * .2].join(" "));
    svg.appendChild(p); svg.appendChild(h);
    return anim(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: 450, easing: "ease-out", fill: "forwards" }, id)
      .then(function () { svg.classList.add("on"); });
  }
  function ripple(sq) {
    var r = document.createElement("div"); r.className = "ripple"; put(r, sq); layer.appendChild(r);
    r.animate([{ opacity: .9 }, { opacity: 0 }], { duration: 600, easing: "ease-out" });
    r.firstChild; r.animate([{ transform: tf(sq, 0, .4) }, { transform: tf(sq, 0, 1.5) }], { duration: 600, easing: "ease-out" }).onfinish = function () { r.remove(); };
  }
  function jump(el, to, id, lift) {
    var from = el.dataset.sq, a = xy(from), b = xy(to);
    var mid = "translate(" + (a[0] + b[0]) * 50 + "%," + ((a[1] + b[1]) * 50 - (lift || 70)) + "%) scale(1.3)";
    el.classList.add("air");
    var p = anim(el, [{ transform: tf(from) }, { transform: mid, offset: .5 }, { transform: tf(to) }],
      { duration: 700, easing: "cubic-bezier(.45,0,.35,1)" }, id);
    return p.then(function () { put(el, to); el.classList.remove("air"); ripple(to); });
  }
  function slide(el, to, id) {
    var from = el.dataset.sq;
    return anim(el, [{ transform: tf(from) }, { transform: tf(to) }], { duration: 450, easing: "ease-in-out" }, id)
      .then(function () { put(el, to); });
  }

  function reset() {
    layer.innerHTML = ""; svg.innerHTML = ""; svg.classList.remove("on");
    var els = {};
    Object.keys(START).forEach(function (sq) {
      var d = document.createElement("div"); d.className = "pc";
      var im = document.createElement("img"); im.src = base + START[sq] + ".svg"; im.alt = "";
      d.appendChild(im); put(d, sq); layer.appendChild(d); els[sq] = d;
    });
    return els;
  }

  async function play() {
    var id = ++run;
    if (replay) replay.hidden = true;
    try {
      var P = reset(), order = ["a8", "e8", "f7", "g7", "h7", "g1", "f2", "g2", "h2", "b5"];
      say("White to move", "Can you find the winning move?");
      order.forEach(function (sq, i) {
        P[sq].animate([{ transform: tf(sq, -260, .6), opacity: 0 }, { transform: tf(sq), opacity: 1 }],
          { duration: 650, delay: i * 90, easing: "cubic-bezier(.2,.9,.3,1.35)", fill: "backwards" });
      });
      await wait(order.length * 90 + 1500, id);
      var from = mark("from", "b5");
      await wait(500, id);
      await jump(P.b5, "c7", id);
      mark("to", "c7");
      var chk = mark("check", "e8");
      say("1. <code>Nc7+</code>", "Check! And the knight attacks the rook too.");
      await arrow("c7", "e8", id);
      await arrow("c7", "a8", id);
      var r1 = mark("ring", "e8"), r2 = mark("ring", "a8");
      await wait(2200, id);
      say("1… <code>Kd8</code>", "The king must step out of check.");
      r1.remove(); chk.remove(); svg.innerHTML = ""; svg.classList.remove("on");
      await slide(P.e8, "d8", id);
      await wait(1100, id);
      say("2. <code>Nxa8</code>", "The knight takes the rook.");
      from.remove(); layer.querySelectorAll(".mark.to").forEach(function (m) { m.remove(); });
      mark("from", "c7");
      var j = jump(P.b5, "a8", id, 60);
      setTimeout(function () {
        if (id !== run) return;
        r2.remove();
        P.a8.animate([{ transform: tf("a8"), opacity: 1 }, { transform: tf("a8", -120, .2) + " rotate(200deg)", opacity: 0 }],
          { duration: 450, easing: "ease-in", fill: "forwards" });
      }, 480);
      await j;
      mark("to", "a8");
      say('<span class="ok">Rook won!</span>', "One move, two targets. That's a <b>fork</b>.");
      if (replay) replay.hidden = false;
      await wait(4500, id);
      await anim(layer, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }, id);
      layer.style.opacity = 1;
      play();
    } catch (e) { /* a newer run took over */ }
  }

  if (replay) replay.addEventListener("click", function () { play(); });
  document.addEventListener("visibilitychange", function () { paused = document.hidden; });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: .2 }).observe(board);
  }
  play();
})();
