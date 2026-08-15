/* ==========================================
   THRONE OF THE CHANGING HEAVENS
   CHAPTER ARCHIVE ENGINE
========================================== */

(() => {

  "use strict";


  /* ==========================================
     HELPERS
  ========================================== */

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);


  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];


  /* ==========================================
     MOUSE GLOW
  ========================================== */

  const glow =
    $("#mouseGlow");

  const root =
    document.documentElement;

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


          root.style.setProperty(
            "--mx",
            `${event.clientX}px`
          );


          root.style.setProperty(
            "--my",
            `${event.clientY}px`
          );

        });

    },
    {
      passive: true
    }
  );


  /* ==========================================
     SCROLL REVEAL
  ========================================== */

  const revealElements =
    $$(".reveal");


  if (
    "IntersectionObserver"
    in window
  ) {

    const observer =
      new IntersectionObserver(
        (entries, obs) => {

          entries.forEach(
            (entry) => {

              if (
                entry.isIntersecting
              ) {

                entry.target
                  .classList
                  .add("active");

                obs.unobserve(
                  entry.target
                );

              }

            });

        },
        {
          threshold: 0.1
        }
      );


    revealElements.forEach(
      (element) => {

        observer.observe(
          element
        );

      });

  }

  else {

    revealElements.forEach(
      (element) => {

        element
          .classList
          .add("active");

      });

  }


  /* ==========================================
     CHAPTER SEARCH
  ========================================== */

  const searchInput =
    $("#chapterSearch");

  const statusFilter =
    $("#statusFilter");

  const chapterCards =
    $$(".chapter-card");

  const chapterCount =
    $("#chapterCount");

  const emptyState =
    $("#emptyState");


  const filterChapters =
    () => {

      const search =
        (
          searchInput?.value || ""
        )
        .trim()
        .toLowerCase();


      const status =
        statusFilter?.value ||
        "all";


      let visible =
        0;


      chapterCards.forEach(
        (card) => {

          const title =
            (
              card.dataset.title ||
              ""
            ).toLowerCase();


          const cardStatus =
            card.dataset.status ||
            "";


          const matchesSearch =
            title.includes(
              search
            );


          const matchesStatus =
            status === "all" ||
            cardStatus === status;


          const visibleCard =
            matchesSearch &&
            matchesStatus;


          card.hidden =
            !visibleCard;


          if (visibleCard) {

            visible++;

          }

        });


      if (chapterCount) {

        chapterCount.textContent =
          visible;

      }


      if (emptyState) {

        emptyState.hidden =
          visible !== 0;

      }

    };


  searchInput?.addEventListener(
    "input",
    filterChapters
  );


  statusFilter?.addEventListener(
    "change",
    filterChapters
  );


  filterChapters();


  /* ==========================================
     COSMIC CANVAS
  ========================================== */

  const canvas =
    $("#cosmos");

  const ctx =
    canvas?.getContext("2d");


  const particles =
    [];


  const colors = [

    "rgba(0,213,255,.70)",

    "rgba(184,155,79,.45)",

    "rgba(255,255,255,.50)"

  ];


  let width =
    window.innerWidth;


  let height =
    window.innerHeight;


  const PARTICLE_COUNT =
    100;


  const resizeCanvas =
    () => {

      if (
        !canvas ||
        !ctx
      )
        return;


      const dpr =
        Math.min(
          window.devicePixelRatio ||
          1,
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

    };


  const createParticles =
    () => {

      particles.length =
        0;


      for (
        let i = 0;
        i < PARTICLE_COUNT;
        i++
      ) {

        particles.push({

          x:
            Math.random()
            * width,

          y:
            Math.random()
            * height,

          radius:
            Math.random()
            * 2
            + .3,

          speed:
            Math.random()
            * 1.2
            + .15,

          color:
            colors[
              Math.floor(
                Math.random()
                * colors.length
              )
            ]

        });

      }

    };


  const animate =
    () => {

      if (
        !canvas ||
        !ctx
      )
        return;


      ctx.clearRect(
        0,
        0,
        width,
        height
      );


      particles.forEach(
        (particle) => {

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
            ) * .3;


          if (
            particle.y >
            height
          ) {

            particle.y =
              -particle.radius;

            particle.x =
              Math.random()
              * width;

          }

        });


      requestAnimationFrame(
        animate
      );

    };


  if (
    canvas &&
    ctx
  ) {

    resizeCanvas();

    createParticles();

    animate();


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
     KEYBOARD SEARCH
  ========================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "/" &&
        document.activeElement !==
          searchInput
      ) {

        event.preventDefault();

        searchInput?.focus();

      }

    }
  );


  /* ==========================================
     SYSTEM
  ========================================== */

  console.log(
    "THRONE OF THE CHANGING HEAVENS",
    "| CHAPTER ARCHIVE ONLINE"
  );


})();