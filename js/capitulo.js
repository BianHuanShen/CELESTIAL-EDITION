/* ==========================================
   THRONE OF THE CHANGING HEAVENS
   CHAPTER READER ENGINE
========================================== */

(() => {

  "use strict";


  /* ==========================================
     HELPERS
  ========================================== */

  const $ =
    (selector) =>
      document.querySelector(selector);


  /* ==========================================
     MOUSE GLOW
  ========================================== */

  const glow =
    $("#mouseGlow");

  let mouseFrame = null;


  window.addEventListener(
    "mousemove",
    (event) => {

      if (mouseFrame)
        return;


      mouseFrame =
        requestAnimationFrame(() => {

          mouseFrame = null;


          if (glow) {

            glow.style.left =
              `${event.clientX}px`;

            glow.style.top =
              `${event.clientY}px`;

          }

        });

    },
    {
      passive: true
    }
  );


  /* ==========================================
     READING PROGRESS
  ========================================== */

  const progressBar =
    $("#progressBar");


  const updateProgress =
    () => {

      if (!progressBar)
        return;


      const scrollTop =
        window.scrollY;


      const documentHeight =
        document.documentElement
          .scrollHeight;


      const viewportHeight =
        window.innerHeight;


      const scrollable =
        documentHeight -
        viewportHeight;


      const progress =
        scrollable > 0
          ? (scrollTop / scrollable) * 100
          : 0;


      progressBar.style.width =
        `${Math.min(
          100,
          Math.max(
            0,
            progress
          )
        )}%`;

    };


  window.addEventListener(
    "scroll",
    updateProgress,
    {
      passive: true
    }
  );


  window.addEventListener(
    "resize",
    updateProgress,
    {
      passive: true
    }
  );


  updateProgress();


  /* ==========================================
     BOOKMARK
  ========================================== */

  const bookmarkBtn =
    $("#bookmarkBtn");


  const BOOKMARK_KEY =
    "throne_chapter_1_bookmark";


  const updateBookmarkUI =
    (saved) => {

      if (!bookmarkBtn)
        return;


      bookmarkBtn.classList
        .toggle(
          "active",
          saved
        );


      bookmarkBtn.innerHTML =
        saved
          ? "★ <span>SAVED</span>"
          : "☆ <span>BOOKMARK</span>";

    };


  let bookmarked =
    localStorage.getItem(
      BOOKMARK_KEY
    ) === "true";


  updateBookmarkUI(
    bookmarked
  );


  bookmarkBtn?.addEventListener(
    "click",
    () => {

      bookmarked =
        !bookmarked;


      localStorage.setItem(
        BOOKMARK_KEY,
        bookmarked
      );


      updateBookmarkUI(
        bookmarked
      );

    }
  );


  /* ==========================================
     SHARE
  ========================================== */

  const shareBtn =
    $("#shareBtn");


  shareBtn?.addEventListener(
    "click",
    async () => {

      const shareData = {

        title:
          "Chapter 1 — The Forgotten Heaven's Ashes",

        text:
          "Read Chapter 1 of Throne of the Changing Heavens.",

        url:
          window.location.href

      };


      try {

        if (
          navigator.share
        ) {

          await navigator.share(
            shareData
          );

          return;

        }


        if (
          navigator.clipboard
        ) {

          await navigator.clipboard
            .writeText(
              window.location.href
            );


          showShareSuccess();

          return;

        }


        fallbackCopy(
          window.location.href
        );


      }
      catch (error) {

        /*
          User cancelled native share.
          No action required.
        */

        console.log(
          "Share cancelled."
        );

      }

    }
  );


  function showShareSuccess() {

    if (!shareBtn)
      return;


    const original =
      shareBtn.innerHTML;


    shareBtn.innerHTML =
      "✓ <span>COPIED</span>";


    setTimeout(
      () => {

        shareBtn.innerHTML =
          original;

      },
      2000
    );

  }


  function fallbackCopy(
    text
  ) {

    const textarea =
      document.createElement(
        "textarea"
      );


    textarea.value =
      text;


    textarea.style.position =
      "fixed";

    textarea.style.opacity =
      "0";


    document.body.appendChild(
      textarea
    );


    textarea.select();


    try {

      document.execCommand(
        "copy"
      );

      showShareSuccess();

    }
    catch {

      alert(
        "Copy this link:\n\n" +
        text
      );

    }


    textarea.remove();

  }


  /* ==========================================
     KEYBOARD NAVIGATION
  ========================================== */

  const nextChapter =
    $("#nextChapter");


  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.target.tagName ===
        "INPUT"
      )
        return;


      if (
        event.key ===
        "ArrowRight" &&
        nextChapter
      ) {

        window.location.href =
          nextChapter.href;

      }


      if (
        event.key ===
        "Escape"
      ) {

        window.location.href =
          "../capitulos.html";

      }

    }
  );


  /* ==========================================
     COSMIC CANVAS
  ========================================== */

  const canvas =
    $("#cosmos");

  const ctx =
    canvas?.getContext(
      "2d"
    );


  const particles = [];

  const colors = [

    "rgba(0,213,255,.70)",

    "rgba(184,155,79,.45)",

    "rgba(255,255,255,.45)"

  ];


  let width =
    window.innerWidth;

  let height =
    window.innerHeight;


  const PARTICLES =
    90;


  function resizeCanvas() {

    if (!canvas || !ctx)
      return;


    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );


    width =
      window.innerWidth;


    height =
      window.innerHeight;


    canvas.width =
      width * dpr;


    canvas.height =
      height * dpr;


    canvas.style.width =
      `${width}px`;


    canvas.style.height =
      `${height}px`;


    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

  }


  function createParticles() {

    particles.length = 0;


    for (
      let i = 0;
      i < PARTICLES;
      i++
    ) {

      particles.push({

        x:
          Math.random() *
          width,

        y:
          Math.random() *
          height,

        radius:
          Math.random() * 1.8 + .3,

        speed:
          Math.random() * .8 + .1,

        color:
          colors[
            Math.floor(
              Math.random() *
              colors.length
            )
          ]

      });

    }

  }


  function animateCosmos() {

    if (!canvas || !ctx)
      return;


    ctx.clearRect(
      0,
      0,
      width,
      height
    );


    particles.forEach(
      particle => {

        ctx.beginPath();


        ctx.fillStyle =
          particle.color;


        ctx.arc(

          particle.x,

          particle.y,

          particle.radius,

          0,

          Math.PI * 2

        );


        ctx.fill();


        particle.y +=
          particle.speed;


        particle.x +=
          Math.sin(
            particle.y * .01
          ) * .25;


        if (
          particle.y >
          height
        ) {

          particle.y =
            -particle.radius;

          particle.x =
            Math.random() *
            width;

        }

      }
    );


    requestAnimationFrame(
      animateCosmos
    );

  }


  if (
    canvas &&
    ctx
  ) {

    resizeCanvas();

    createParticles();

    animateCosmos();


    window.addEventListener(
      "resize",
      () => {

        resizeCanvas();

        createParticles();

      },
      {
        passive: true
      }
    );

  }


  /* ==========================================
     SAVE READING POSITION
  ========================================== */

  const POSITION_KEY =
    "throne_chapter_1_position";


  let saveTimer = null;


  window.addEventListener(
    "scroll",
    () => {

      clearTimeout(
        saveTimer
      );


      saveTimer =
        setTimeout(
          () => {

            localStorage.setItem(
              POSITION_KEY,
              window.scrollY
            );

          },
          300
        );

    },
    {
      passive: true
    }
  );


  /* ==========================================
     RESTORE READING POSITION
  ========================================== */

  window.addEventListener(
    "load",
    () => {

      const savedPosition =
        localStorage.getItem(
          POSITION_KEY
        );


      if (
        savedPosition &&
        Number(savedPosition) > 100
      ) {

        /*
          Delayed slightly so the page
          has time to calculate its height.
        */

        setTimeout(
          () => {

            window.scrollTo({

              top:
                Number(
                  savedPosition
                ),

              behavior:
                "smooth"

            });

          },
          500
        );

      }

    }
  );


  /* ==========================================
     SYSTEM
  ========================================== */

  console.log(
    "THRONE OF THE CHANGING HEAVENS",
    "| CHAPTER 1 ONLINE"
  );

})();