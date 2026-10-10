(() => {
  document.documentElement.classList.remove("no-js");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const root = document.documentElement;
  const progress = document.getElementById("pageProgress");

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

  const photo = document.getElementById("portraitPhoto");
  const portrait = document.getElementById("asciiPortrait");
  const stage = document.getElementById("portraitStage");
  const canvas = document.getElementById("portraitCanvas");
  const toggle = document.getElementById("portraitToggle");
  const card = document.querySelector(".portrait-card");
  // Start with the ASCII portrait when motion is welcome; preserve the photo on failure.
  const renderAscii = () => {
    const context = canvas?.getContext("2d", { willReadFrequently: true });
    if (!context || !photo?.naturalWidth || !stage?.clientWidth || !portrait) return false;
    const columns = Math.max(48, Math.min(80, Math.floor(stage.clientWidth / 4)));
    const fontSize = stage.clientWidth / (columns * 0.61);
    const lineHeight = fontSize * 1.05;
    const rows = Math.floor(stage.clientHeight / lineHeight);
    canvas.width = columns;
    canvas.height = rows;
    const sourceRatio = photo.naturalWidth / photo.naturalHeight;
    const targetRatio = stage.clientWidth / stage.clientHeight;
    let width = photo.naturalWidth;
    let height = photo.naturalHeight;
    if (sourceRatio > targetRatio) width = height * targetRatio;
    else height = width / targetRatio;
    context.drawImage(photo, (photo.naturalWidth - width) / 2, (photo.naturalHeight - height) * 0.42, width, height, 0, 0, columns, rows);
    const pixels = context.getImageData(0, 0, columns, rows).data;
    const characters = "@%#*+=-:. ";
    const lines = [];
    for (let y = 0; y < rows; y += 1) {
      let line = "";
      for (let x = 0; x < columns; x += 1) {
        const index = (y * columns + x) * 4;
        const luminance = 0.2126 * pixels[index] + 0.7152 * pixels[index + 1] + 0.0722 * pixels[index + 2];
        line += characters[Math.round(luminance / 255 * (characters.length - 1))];
      }
      lines.push(line);
    }
    portrait.style.fontSize = `${fontSize}px`;
    portrait.style.lineHeight = `${lineHeight}px`;
    portrait.textContent = lines.join("\n");
    return true;
  };
  const showPhoto = () => {
    if (card) card.dataset.mode = "photo";
    toggle?.setAttribute("aria-pressed", "false");
    if (toggle) toggle.textContent = "View ASCII";
  };
  const showAscii = () => {
    try {
      if (!renderAscii()) return false;
      card.dataset.mode = "ascii";
      portrait.hidden = false;
      toggle.setAttribute("aria-pressed", "true");
      toggle.textContent = "View photo";
      return true;
    } catch { showPhoto(); if (toggle) toggle.hidden = true; return false; }
  };
  const enableToggle = () => {
    if (!toggle || !photo?.naturalWidth) return;
    toggle.hidden = false;
    if (!reducedMotion.matches) showAscii();
  };
  if (photo?.complete) enableToggle();
  else photo?.addEventListener("load", enableToggle, { once: true });
  photo?.addEventListener("error", () => { showPhoto(); if (toggle) toggle.hidden = true; }, { once: true });
  toggle?.addEventListener("click", () => {
    if (card?.dataset.mode === "ascii") { showPhoto(); return; }
    showAscii();
  });
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    root.classList.remove("motion-ready");
    revealObserver?.disconnect();
    revealItems.forEach((item) => item.classList.add("is-visible"));
    hoverCards.forEach(resetCard);
    showPhoto();
  });
  finePointer.addEventListener("change", () => hoverCards.forEach(resetCard));
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      updateNavigation();
      if (card?.dataset.mode === "ascii") {
        try { if (!renderAscii()) showPhoto(); } catch { showPhoto(); }
      }
    }, 120);
  }, { passive: true });
})();
