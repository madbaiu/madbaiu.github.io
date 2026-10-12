/* Shared logic for q.html and ct.html */
(function () {
  // Wedding moment, fixed to WITA (UTC+8) so every viewer sees the same numbers
  var WEDDING = new Date("2026-05-17T00:00:00+08:00");
  var SHIFT = 8 * 60 * 60 * 1000;

  function pad(n) { return String(n).padStart(2, "0"); }

  // Calendar-aware time since `from` (months, days, hours, minutes, seconds)
  function elapsed(from, to) {
    var a = new Date(from.getTime() + SHIFT);
    var b = new Date(to.getTime() + SHIFT);
    function anchorFor(m) {
      return new Date(Date.UTC(a.getUTCFullYear(), a.getUTCMonth() + m, a.getUTCDate(),
        a.getUTCHours(), a.getUTCMinutes(), a.getUTCSeconds()));
    }
    var months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
    var anchor = anchorFor(months);
    if (anchor > b) { months -= 1; anchor = anchorFor(months); }
    var rest = Math.floor((b - anchor) / 1000);
    var days = Math.floor(rest / 86400); rest -= days * 86400;
    var hours = Math.floor(rest / 3600); rest -= hours * 3600;
    var minutes = Math.floor(rest / 60);
    return { months: months, days: days, hours: hours, minutes: minutes, seconds: rest - minutes * 60 };
  }

  function ordinal(n) {
    var s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  // Next wedding anniversary after `now`, and progress through the current year
  function anniversary(now) {
    var year = 1;
    var next;
    while (true) {
      next = new Date(WEDDING.getTime() + SHIFT);
      next = new Date(Date.UTC(next.getUTCFullYear() + year, next.getUTCMonth(), next.getUTCDate()) - SHIFT);
      if (next > now) break;
      year++;
    }
    var prev = year === 1 ? WEDDING : (function () {
      var p = new Date(WEDDING.getTime() + SHIFT);
      return new Date(Date.UTC(p.getUTCFullYear() + year - 1, p.getUTCMonth(), p.getUTCDate()) - SHIFT);
    })();
    return {
      year: year,
      daysLeft: Math.ceil((next - now) / 86400000),
      progress: Math.max(0, Math.min(100, ((now - prev) / (next - prev)) * 100))
    };
  }

  function set(key, value) {
    document.querySelectorAll('[data-love="' + key + '"]').forEach(function (el) { el.textContent = value; });
  }

  function update() {
    var now = new Date();
    if (now < WEDDING) { return; }
    var t = elapsed(WEDDING, now);
    set("months", t.months);
    set("days", t.days);
    set("hours", pad(t.hours));
    set("minutes", pad(t.minutes));
    set("seconds", pad(t.seconds));
    set("totalDays", Math.floor((now - WEDDING) / 86400000));

    var an = anniversary(now);
    set("annivYear", ordinal(an.year));
    set("annivLeft", an.daysLeft);
    document.querySelectorAll("[data-love-bar]").forEach(function (b) { b.style.width = an.progress.toFixed(1) + "%"; });
  }

  function startCounter() { update(); setInterval(update, 1000); }

  // Gently rotating message
  function rotate(el, messages) {
    if (!el) return;
    var i = 0;
    function next() {
      el.style.opacity = 0;
      setTimeout(function () { el.textContent = messages[i]; el.style.opacity = 1; i = (i + 1) % messages.length; }, 400);
    }
    next();
    setInterval(next, 4500);
  }

  // Slow floating hearts / leaves (skipped for reduced motion)
  function floaters() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var box = document.createElement("div");
    box.className = "floaters";
    var icons = ["💚", "🍃", "🤍", "🍃", "💚"];
    for (var i = 0; i < 9; i++) {
      var s = document.createElement("span");
      s.textContent = icons[i % icons.length];
      s.style.left = (5 + Math.random() * 90) + "%";
      s.style.fontSize = (14 + Math.random() * 14) + "px";
      s.style.animationDuration = (14 + Math.random() * 14) + "s";
      s.style.animationDelay = (-Math.random() * 20) + "s";
      box.appendChild(s);
    }
    document.body.appendChild(box);
  }

  window.Love = { WEDDING: WEDDING, startCounter: startCounter, rotate: rotate, floaters: floaters };
})();
