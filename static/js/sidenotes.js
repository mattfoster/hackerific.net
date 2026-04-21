(function () {
  "use strict";

  var BREAKPOINT = 1100;

  function init() {
    var footnotes = document.querySelector(".footnotes");
    if (!footnotes) return;

    var refs = document.querySelectorAll("a.footnote-ref");
    if (!refs.length) return;

    var postContent = document.querySelector(".post-content");
    if (!postContent) return;

    var sidenotes = [];

    refs.forEach(function (ref) {
      var id = ref.getAttribute("href").replace("#", "");
      var fnLi = document.getElementById(id);
      if (!fnLi) return;

      // Clone footnote content, removing the backref link
      var content = fnLi.cloneNode(true);
      var backrefs = content.querySelectorAll(".footnote-backref");
      backrefs.forEach(function (br) { br.remove(); });

      var num = ref.textContent;

      var sidenote = document.createElement("span");
      sidenote.className = "sidenote";
      sidenote.setAttribute("role", "note");
      sidenote.innerHTML =
        '<span class="sidenote-number">' + num + "</span> " +
        content.innerHTML;

      postContent.appendChild(sidenote);
      sidenotes.push({ el: sidenote, ref: ref });
    });

    function position() {
      var wide = window.innerWidth >= BREAKPOINT;

      if (!wide) {
        sidenotes.forEach(function (sn) { sn.el.style.display = "none"; });
        footnotes.style.display = "";
        return;
      }

      footnotes.style.display = "none";

      var contentRect = postContent.getBoundingClientRect();
      var minTop = 0;

      sidenotes.forEach(function (sn) {
        sn.el.style.display = "block";

        var sup = sn.ref.closest("sup");
        var refRect = sup.getBoundingClientRect();
        var top = refRect.top - contentRect.top;

        // Prevent overlap with previous sidenote
        if (top < minTop) top = minTop;

        sn.el.style.top = top + "px";
        minTop = top + sn.el.offsetHeight + 8;
      });
    }

    position();
    window.addEventListener("resize", position);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
