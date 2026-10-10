(() => {
  document.documentElement.classList.remove("no-js");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const root = document.documentElement;
  const progress = document.getElementById("pageProgress");
  const spotlight = document.getElementById("pageSpotlight");
  const cursorHalo = document.getElementById("cursorHalo");
  let cursorFrame = 0;
  let cursorX = 0;
  let cursorY = 0;
  let targetX = 0;
  let targetY = 0;
  const clearCursor = () => {
    window.cancelAnimationFrame(cursorFrame);
    cursorFrame = 0;
    root.classList.remove("pointer-active", "pointer-interactive");
  };
  const animateCursor = () => {
    if (reducedMotion.matches || !finePointer.matches || document.hidden) { clearCursor(); return; }
    cursorX += (targetX - cursorX) * 0.22;
    cursorY += (targetY - cursorY) * 0.22;
    const location = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
    if (spotlight) spotlight.style.transform = location;
    if (cursorHalo) cursorHalo.style.transform = location;
    if (Math.abs(targetX - cursorX) + Math.abs(targetY - cursorY) > 0.25) {
      cursorFrame = window.requestAnimationFrame(animateCursor);
    } else cursorFrame = 0;
  };
  document.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === "touch") return;
    targetX = event.clientX;
    targetY = event.clientY;
    if (!root.classList.contains("pointer-active")) { cursorX = targetX; cursorY = targetY; }
    root.classList.add("pointer-active");
    root.classList.toggle("pointer-interactive", !!event.target.closest("a, button, summary"));
    if (!cursorFrame) cursorFrame = window.requestAnimationFrame(animateCursor);
  }, { passive: true });
  document.addEventListener("pointerleave", clearCursor);
  window.addEventListener("blur", clearCursor);
  document.addEventListener("visibilitychange", () => { if (document.hidden) clearCursor(); });

  // Enhancement only: content is fully visible without JavaScript or with reduced motion.
  const revealItems = [...document.querySelectorAll(
    ".section-heading, .about-copy, .experience-row, .project-card, .additional-grid article, .skill-grid article, .education-card, .achievement-list li, .contact-section > div, .resume-card"
  )];
  let revealObserver;
  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    root.classList.add("motion-ready");
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (!isIntersecting) return;
        target.classList.add("is-visible");
        observer.unobserve(target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -20px" });
    revealItems.forEach((item) => {
      item.classList.add("reveal");
      const siblings = [...item.parentElement.children];
      item.style.setProperty("--reveal-delay", `${Math.min(siblings.indexOf(item), 3) * 65}ms`);
      revealObserver.observe(item);
    });
    document.addEventListener("focusin", (event) => {
      const item = event.target.closest(".reveal");
      if (item) { item.classList.add("is-visible"); revealObserver.unobserve(item); }
    });
  }

  const hoverCards = [...document.querySelectorAll(".project-card, .education-card, .resume-card, .portrait-card")];
  const resetCard = (item) => {
    item.style.removeProperty("--spot-x");
    item.style.removeProperty("--spot-y");
    item.style.removeProperty("--tilt-x");
    item.style.removeProperty("--tilt-y");
  };
  hoverCards.forEach((item) => {
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    item.addEventListener("pointermove", (event) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        pointerFrame = 0;
        if (!finePointer.matches || reducedMotion.matches) return;
        const bounds = item.getBoundingClientRect();
        const x = pointerX - bounds.left;
        const y = pointerY - bounds.top;
        item.style.setProperty("--spot-x", `${x}px`);
        item.style.setProperty("--spot-y", `${y}px`);
        if (item.classList.contains("portrait-card")) {
          item.style.setProperty("--tilt-x", `${(0.5 - y / bounds.height) * 5}deg`);
          item.style.setProperty("--tilt-y", `${(x / bounds.width - 0.5) * 5}deg`);
        }
      });
    }, { passive: true });
    item.addEventListener("pointerleave", () => {
      window.cancelAnimationFrame(pointerFrame);
      pointerFrame = 0;
      resetCard(item);
    });
  });

  const menuToggle = document.getElementById("menuToggle");
  const mobileNav = document.getElementById("mobileNav");
  const closeMenu = (restoreFocus = false) => {
    if (!mobileNav || !menuToggle) return;
    mobileNav.hidden = true;
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.innerHTML = 'Menu <span aria-hidden="true">+</span>';
    if (restoreFocus) menuToggle.focus();
  };
  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    mobileNav.hidden = !open;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.innerHTML = open ? 'Close <span aria-hidden="true">−</span>' : 'Menu <span aria-hidden="true">+</span>';
  });
  mobileNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileNav && !mobileNav.hidden) closeMenu(true);
  });
  const mobileViewport = window.matchMedia("(max-width: 760px)");
  mobileViewport.addEventListener("change", () => closeMenu());

  const navLinks = [...document.querySelectorAll(".nav-links a, .mobile-nav a")];
  const sections = [...new Set(navLinks.map((link) => document.querySelector(link.hash)).filter(Boolean))];
  let scrollFrame = 0;
  const updateNavigation = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = available > 0 ? Math.max(0, Math.min(1, window.scrollY / available)) : 0;
    progress?.style.setProperty("transform", `scaleX(${ratio})`);
    const offset = (document.querySelector(".site-header")?.offsetHeight || 80) + 80;
    let active = null;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= offset) active = section.id;
    }
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) active = "contact";
    navLinks.forEach((link) => {
      const selected = link.hash === `#${active}`;
      link.classList.toggle("is-active", selected);
      if (selected) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    scrollFrame = 0;
  };
  window.addEventListener("scroll", () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateNavigation);
  }, { passive: true });
  updateNavigation();

  // The portrait is a static ASCII asset, independent of motion and JavaScript.
  const stage = document.getElementById("portraitStage");
  const updatePortraitScan = () => {
    if (stage) stage.style.setProperty("--scan-distance", `${stage.clientHeight}px`);
  };
  updatePortraitScan();
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    root.classList.remove("motion-ready");
    revealObserver?.disconnect();
    revealItems.forEach((item) => item.classList.add("is-visible"));
    hoverCards.forEach(resetCard);
    clearCursor();
  });
  finePointer.addEventListener("change", () => { hoverCards.forEach(resetCard); clearCursor(); });
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      updateNavigation();
      updatePortraitScan();
    }, 120);
  }, { passive: true });
})();
