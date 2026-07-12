(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const progress = document.getElementById("pageProgress");
  const updateProgress = () => {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = available > 0 ? Math.min(1, window.scrollY / available) : 0;
    progress?.style.setProperty("transform", `scaleX(${ratio})`);
  };

  let progressFrame = 0;
  window.addEventListener("scroll", () => {
    if (progressFrame) return;
    progressFrame = window.requestAnimationFrame(() => {
      updateProgress();
      progressFrame = 0;
    });
  }, { passive: true });
  updateProgress();

  const revealItems = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -48px" });

    revealItems.forEach((item) => {
      if (!item.classList.contains("is-visible")) revealObserver.observe(item);
    });
  }

  const navLinks = [...document.querySelectorAll(".nav-links a")];
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window && navSections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-38% 0px -56%", threshold: 0 });

    navSections.forEach((section) => sectionObserver.observe(section));
  }

  if (finePointer && !reduceMotion) {
    let pointerFrame = 0;
    let pointerX = window.innerWidth * 0.8;
    let pointerY = window.innerHeight * 0.1;

    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = window.requestAnimationFrame(() => {
        root.style.setProperty("--pointer-x", `${pointerX}px`);
        root.style.setProperty("--pointer-y", `${pointerY}px`);
        pointerFrame = 0;
      });
    }, { passive: true });

    document.querySelectorAll("[data-spotlight]").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty("--card-x", `${event.clientX - bounds.left}px`);
        card.style.setProperty("--card-y", `${event.clientY - bounds.top}px`);
      }, { passive: true });
    });
  }

  const photo = document.getElementById("portraitPhoto");
  const portrait = document.getElementById("asciiPortrait");
  const stage = document.getElementById("portraitStage");
  const canvas = document.getElementById("portraitCanvas");
  const toggle = document.getElementById("portraitToggle");
  const consoleShell = document.querySelector(".portrait-console");
  const context = canvas?.getContext("2d", { willReadFrequently: true });
  const characters = " .,:;irsXA253hMHGS#9B&@";
  let renderTimer = 0;

  const renderAscii = () => {
    if (!photo || !portrait || !stage || !canvas || !context || !photo.naturalWidth) return;

    const columns = Math.max(56, Math.min(92, Math.floor(stage.clientWidth / 5.6)));
    const rows = Math.max(42, Math.round(columns * (stage.clientHeight / stage.clientWidth) * 0.78));
    canvas.width = columns;
    canvas.height = rows;

    const sourceRatio = photo.naturalWidth / photo.naturalHeight;
    const targetRatio = columns / rows;
    let sourceWidth = photo.naturalWidth;
    let sourceHeight = photo.naturalHeight;
    let sourceX = 0;
    let sourceY = 0;

    if (sourceRatio > targetRatio) {
      sourceWidth = photo.naturalHeight * targetRatio;
      sourceX = (photo.naturalWidth - sourceWidth) / 2;
    } else {
      sourceHeight = photo.naturalWidth / targetRatio;
      sourceY = Math.max(0, (photo.naturalHeight - sourceHeight) * 0.28);
    }

    context.clearRect(0, 0, columns, rows);
    context.drawImage(photo, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, columns, rows);

    const pixels = context.getImageData(0, 0, columns, rows).data;
    const output = [];

    for (let y = 0; y < rows; y += 1) {
      let line = "";
      for (let x = 0; x < columns; x += 1) {
        const offset = (y * columns + x) * 4;
        const luminance = 0.2126 * pixels[offset] + 0.7152 * pixels[offset + 1] + 0.0722 * pixels[offset + 2];
        const contrast = Math.max(0, Math.min(255, (luminance - 118) * 1.35 + 118));
        const index = Math.round((contrast / 255) * (characters.length - 1));
        line += characters[index];
      }
      output.push(line.replace(/\s+$/, ""));
    }

    portrait.textContent = output.join("\n");
  };

  const queueAsciiRender = () => {
    window.clearTimeout(renderTimer);
    renderTimer = window.setTimeout(renderAscii, 120);
  };

  if (photo) {
    if (photo.complete) {
      photo.decode?.().catch(() => {}).finally(renderAscii);
    } else {
      photo.addEventListener("load", renderAscii, { once: true });
    }

    photo.addEventListener("error", () => {
      if (portrait) portrait.textContent = "Portrait unavailable\nARS / SOFTWARE ENGINEER";
      if (toggle) toggle.hidden = true;
    }, { once: true });
  }

  window.addEventListener("resize", queueAsciiRender, { passive: true });

  toggle?.addEventListener("click", () => {
    const showPhoto = consoleShell?.dataset.mode !== "photo";
    if (consoleShell) consoleShell.dataset.mode = showPhoto ? "photo" : "ascii";
    toggle.setAttribute("aria-pressed", String(showPhoto));
    toggle.textContent = showPhoto ? "View ASCII" : "View photo";
  });
})();
