/* ==========================================
   THRONE OF THE CHANGING HEAVENS
   FORGOTTEN CELESTIAL EDITION
========================================== */

(() => {
  "use strict";

  /* ========= HELPERS ========= */

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

  /* ========= LOADER ========= */

  const loader = $("#loader");

  const hideLoader = () => {
    if (loader) loader.classList.add("hide");
  };

  if (document.readyState === "complete") {
    window.setTimeout(hideLoader, 800);
  } else {
    window.addEventListener("load", () => {
      window.setTimeout(hideLoader, 800);
    }, { once: true });
  }

  /* ========= MOUSE GLOW ========= */

  const glow = $("#mouseGlow");
  const root = document.documentElement;

  let mouseFrame = null;
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  const updateMouse = () => {
    mouseFrame = null;

    if (glow) {
      glow.style.left = `${mouseX}px`;
      glow.style.top = `${mouseY}px`;
    }

    root.style.setProperty("--mx", `${mouseX}px`);
    root.style.setProperty("--my", `${mouseY}px`);
  };

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;

    if (!mouseFrame) {
      mouseFrame = requestAnimationFrame(updateMouse);
    }
  }, { passive: true });

  /* ========= SCROLL REVEAL ========= */

  const revealElements = $$(".reveal");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });

    revealElements.forEach((element) => observer.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add("active"));
  }

  /* ========= COSMIC CANVAS ENGINE ========= */

  const canvas = $("#cosmos");
  const ctx = canvas?.getContext("2d");
  const particles = [];

  const cosmicColors = [
    "rgba(0,213,255,.75)",
    "rgba(184,155,79,.45)",
    "rgba(255,255,255,.55)"
  ];

  const particleCount = 120;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let animationId = null;

  const resizeCanvas = () => {
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;

    canvas.width = Math.floor(canvasWidth * dpr);
    canvas.height = Math.floor(canvasHeight * dpr);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const createParticles = () => {
    particles.length = 0;

    for (let i = 0; i < particleCount; i += 1) {
      particles.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        r: Math.random() * 2.2 + 0.3,
        s: Math.random() * 1.2 + 0.15,
        color: cosmicColors[Math.floor(Math.random() * cosmicColors.length)]
      });
    }
  };

  const animateCosmos = () => {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    particles.forEach((particle) => {
      ctx.beginPath();
      ctx.fillStyle = particle.color;
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();

      particle.y += particle.s;
      particle.x += Math.sin(particle.y * 0.01) * 0.35;

      if (particle.y > canvasHeight + particle.r) {
        particle.y = -particle.r;
        particle.x = Math.random() * canvasWidth;
      }

      if (particle.x < -particle.r) particle.x = canvasWidth + particle.r;
      if (particle.x > canvasWidth + particle.r) particle.x = -particle.r;
    });

    animationId = requestAnimationFrame(animateCosmos);
  };

  if (canvas && ctx) {
    resizeCanvas();
    createParticles();
    animateCosmos();

    window.addEventListener("resize", () => {
      resizeCanvas();
      createParticles();
    }, { passive: true });
  }

  /* ========= READING PROGRESS ========= */

  const progressBar = $("#progressBar");

  const updateProgress = () => {
    if (!progressBar) return;

    const documentElement = document.documentElement;
    const scrollTop = window.scrollY || documentElement.scrollTop;
    const scrollHeight = documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0
      ? Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100))
      : 0;

    progressBar.style.width = `${progress}%`;
  };

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress();

  /* ========= BOOKMARK ========= */

  const bookmarkBtn = $("#bookmarkBtn");
  const BOOKMARK_KEY = "throne-changing-heavens-chapter-1-bookmarked";

  const setBookmarkState = (saved) => {
    if (!bookmarkBtn) return;

    bookmarkBtn.classList.toggle("active", saved);
    bookmarkBtn.textContent = saved ? "★ Saved" : "☆ Bookmark";
    bookmarkBtn.setAttribute("aria-pressed", String(saved));
  };

  let bookmarked = false;

  try {
    bookmarked = localStorage.getItem(BOOKMARK_KEY) === "true";
  } catch {
    bookmarked = false;
  }

  setBookmarkState(bookmarked);

  bookmarkBtn?.addEventListener("click", () => {
    bookmarked = !bookmarked;
    setBookmarkState(bookmarked);

    try {
      localStorage.setItem(BOOKMARK_KEY, String(bookmarked));
    } catch {
      // Storage can be unavailable in private/restricted browser contexts.
    }
  });

  /* ========= SHARE ========= */

  const shareBtn = $("#shareBtn");
  const chapterStatus = $("#chapterStatus");

  const showStatus = (message) => {
    if (!chapterStatus) return;

    chapterStatus.textContent = message;

    window.clearTimeout(showStatus.timeout);
    showStatus.timeout = window.setTimeout(() => {
      chapterStatus.textContent = "";
    }, 2500);
  };

  const copyCurrentUrl = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: "THRONE OF THE CHANGING HEAVENS — Chapter 1",
          url
        });
        return true;
      } catch (error) {
        if (error?.name === "AbortError") return false;
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        return true;
      } catch {
        // Continue to fallback below.
      }
    }

    try {
      const input = document.createElement("input");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();

      const copied = document.execCommand("copy");
      input.remove();

      return copied;
    } catch {
      return false;
    }
  };

  shareBtn?.addEventListener("click", async () => {
    const originalText = shareBtn.textContent;
    shareBtn.disabled = true;

    const shared = await copyCurrentUrl();

    shareBtn.disabled = false;
    shareBtn.textContent = shared ? "✓ Copied" : originalText;

    showStatus(
      shared
        ? "Enlace copiado al portapapeles."
        : "No fue posible copiar el enlace."
    );

    window.setTimeout(() => {
      shareBtn.textContent = "⤴ Share";
    }, 2000);
  });

  /* ========= CHAPTER NAVIGATION ========= */

  const nextBtn = $("#nextBtn");
  const prevBtn = $("#prevBtn");

  prevBtn?.addEventListener("click", () => {
    showStatus("Ya estás en el Capítulo 1.");
  });

  nextBtn?.addEventListener("click", () => {
    showStatus("Próximo capítulo — próximamente.");
  });

  /* ========= PARALLAX ENGINE ========= */

  const parallaxTargets = $$(".hero-content");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let parallaxFrame = null;
  let parallaxX = 0;
  let parallaxY = 0;

  const applyParallax = () => {
    parallaxFrame = null;

    if (reducedMotion.matches) {
      parallaxTargets.forEach((element) => {
        element.style.transform = "";
      });
      return;
    }

    parallaxTargets.forEach((element) => {
      element.style.transform = `translate3d(${parallaxX}px, ${parallaxY}px, 0)`;
    });
  };

  window.addEventListener("mousemove", (event) => {
    parallaxX = ((event.clientX / window.innerWidth) - 0.5) * 12;
    parallaxY = ((event.clientY / window.innerHeight) - 0.5) * 12;

    if (!parallaxFrame) {
      parallaxFrame = requestAnimationFrame(applyParallax);
    }
  }, { passive: true });

  reducedMotion.addEventListener?.("change", applyParallax);

  /* ========= CLEANUP ========= */

  window.addEventListener("pagehide", () => {
    if (animationId) cancelAnimationFrame(animationId);
  }, { once: true });

  console.log("THRONE OF THE CHANGING HEAVENS | FORGOTTEN CELESTIAL EDITION | SYSTEM ONLINE");
})();
