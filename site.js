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
        (g("f-msg") ? "\n\n" + g("f-msg") : "");
      var a = document.createElement("a");
      a.href = "https://wa.me/918548848884?text=" + encodeURIComponent(msg);
      a.target = "_blank"; a.rel = "noopener";
      document.body.appendChild(a); a.click(); a.remove();
      note.textContent = "WhatsApp should open with your message. If it didn't, message us on +91 85488 48884.";
    });
  }
})();
