/* ==========================================================
   THRONE OF THE CHANGING HEAVENS
   FORGOTTEN CELESTIAL EDITION
   STORIES ENGINE
========================================================== */


/* ==========================================================
   CONFIGURATION
========================================================== */

const STORIES_CONFIG = {
    AUTO_PLAY: false,
    STORY_DURATION: 5000,

    SWIPE_THRESHOLD: 60,
    DRAG_THRESHOLD: 70,

    PARTICLE_COUNT: 55,

    ENABLE_MOUSE_PARALLAX: true,
    ENABLE_PARTICLES: true
};


/* ==========================================================
   STORY DATA
   Para agregar 100+ historias solamente añade objetos aquí.
========================================================== */

const stories = [
    {
        id: 1,
        image: "../images/story-01.jpg",
        title: "Celestial I"
    },
    {
        id: 2,
        image: "../images/story-02.png",
        title: "Celestial II"
    },
    {
        id: 3,
        image: "../images/story-03.png",
        title: "Celestial III"
    },
    {
        id: 4,
        image: "../images/story-04.jpg",
        title: "Celestial IV"
    },
    {
        id: 5,
        image: "../images/story-05.jpg",
        title: "Celestial V"
    },
    {
        id: 6,
        image: "../images/story-06.jpg",
        title: "Celestial VI"
    },
    {
        id: 7,
        image: "../images/story-07.jpg",
        title: "Celestial VII"
    },
    {
        id: 8,
        image: "../images/story-08.jpg",
        title: "Celestial VIII"
    },
    {
        id: 9,
        image: "../images/story-09.jpg",
        title: "Celestial IX"
    },
    {
        id: 10,
        image: "../images/story-10.jpg",
        title: "Celestial X"
    }
];
/* ==========================================================
   DOM
========================================================== */

const elements = {
    storiesContainer: document.getElementById("storiesContainer"),

    viewer: document.getElementById("storyViewer"),
    viewerContent: document.getElementById("viewerContent"),
    viewerImage: document.getElementById("viewerImage"),
    viewerTitle: document.getElementById("viewerTitle"),
    viewerCounter: document.getElementById("viewerCounter"),
    viewerProgress: document.getElementById("viewerProgress"),

    viewerClose: document.getElementById("viewerClose"),
    viewerPrev: document.getElementById("viewerPrev"),
    viewerNext: document.getElementById("viewerNext"),

    viewerParticles: document.getElementById("viewerParticles"),
    viewerHint: document.getElementById("viewerHint")
};


/* ==========================================================
   STATE
========================================================== */

const state = {
    currentStoryIndex: 0,

    isOpen: false,

    isDragging: false,

    touchStartX: 0,
    touchCurrentX: 0,

    mouseStartX: 0,
    mouseCurrentX: 0,

    dragOffset: 0,

    autoplayTimer: null,

    previousBodyOverflow: "",

    hintShown: false,

    viewedStories: new Set()
};


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener("DOMContentLoaded", initializeStories);

function initializeStories() {

    if (!elements.storiesContainer) {
        return;
    }

    renderStories();
    renderProgress();

    if (STORIES_CONFIG.ENABLE_PARTICLES) {
        createParticles();
    }

    bindEvents();

    preloadImages();

    setupMouseParallax();
}


/* ==========================================================
   RENDER STORIES
========================================================== */

function renderStories() {

    const fragment = document.createDocumentFragment();

    stories.forEach((story, index) => {

        const article = document.createElement("article");
        article.className = "story-card";
        article.dataset.storyIndex = index;

        const button = document.createElement("button");

        button.type = "button";
        button.className = "story-trigger";
        button.setAttribute(
            "aria-label",
            `Abrir historia ${index + 1}: ${story.title}`
        );

        const ring = document.createElement("div");
        ring.className = "story-ring";

        const image = document.createElement("img");

        image.src = story.image;
        image.alt = story.title;
        image.loading = "lazy";
        image.decoding = "async";

        ring.appendChild(image);

        const title = document.createElement("span");

        title.className = "story-title";
        title.textContent = story.title;

        button.appendChild(ring);
        button.appendChild(title);

        article.appendChild(button);

        button.addEventListener("click", () => {
            openStory(index);
        });

        fragment.appendChild(article);
    });

    elements.storiesContainer.replaceChildren(fragment);
}


/* ==========================================================
   PROGRESS
========================================================== */

function renderProgress() {

    elements.viewerProgress.replaceChildren();

    stories.forEach((_, index) => {

        const segment = document.createElement("span");

        segment.className = "viewer-progress-segment";
        segment.dataset.index = index;

        elements.viewerProgress.appendChild(segment);
    });
}


function updateProgress() {

    const segments = [
        ...elements.viewerProgress.children
    ];

    segments.forEach((segment, index) => {

        segment.classList.remove(
            "is-active",
            "is-complete"
        );

        if (index < state.currentStoryIndex) {
            segment.classList.add("is-complete");
        }

        if (index === state.currentStoryIndex) {
            segment.classList.add("is-active");
        }
    });
}


/* ==========================================================
   OPEN STORY
========================================================== */

function openStory(index = 0) {

    if (!stories.length) {
        return;
    }

    state.currentStoryIndex = clamp(
        index,
        0,
        stories.length - 1
    );

    state.isOpen = true;

    lockScroll();

    elements.viewer.classList.add("is-open");
    elements.viewer.setAttribute("aria-hidden", "false");

    markStoryAsViewed(state.currentStoryIndex);

    showStory(
        state.currentStoryIndex,
        "initial"
    );

    updateNavigation();

    window.setTimeout(() => {
        elements.viewerClose.focus({
            preventScroll: true
        });
    }, 100);

    showInteractionHint();

    startAutoplay();
}


/* ==========================================================
   CLOSE STORY
========================================================== */

function closeStory() {

    if (!state.isOpen) {
        return;
    }

    state.isOpen = false;

    stopAutoplay();

    elements.viewer.classList.remove("is-open");
    elements.viewer.setAttribute("aria-hidden", "true");

    unlockScroll();

    resetDrag();

    document.body.style.cursor = "";
}


/* ==========================================================
   SHOW STORY
========================================================== */

function showStory(index, direction = "next") {

    if (!stories[index]) {
        return;
    }

    const story = stories[index];

    state.currentStoryIndex = index;

    elements.viewerImage.classList.remove(
        "is-changing-next",
        "is-changing-prev"
    );

    elements.viewerImage.classList.add("is-loading");

    const animationClass =
        direction === "prev"
            ? "is-changing-prev"
            : "is-changing-next";

    requestAnimationFrame(() => {

        elements.viewerImage.src = story.image;
        elements.viewerImage.alt = story.title;

        elements.viewerImage.onload = () => {

            elements.viewerImage.classList.remove(
                "is-loading"
            );

            void elements.viewerImage.offsetWidth;

            if (direction !== "initial") {
                elements.viewerImage.classList.add(
                    animationClass
                );
            }
        };

        elements.viewerTitle.textContent =
            story.title;

        elements.viewerCounter.textContent =
            `${formatNumber(index + 1)} / ${formatNumber(stories.length)}`;

        updateProgress();
        updateNavigation();

        markStoryAsViewed(index);
    });

    resetAutoplay();
}


/* ==========================================================
   NEXT
========================================================== */

function nextStory() {

    if (!state.isOpen) {
        return;
    }

    if (state.currentStoryIndex >= stories.length - 1) {

        animateBoundary("next");

        return;
    }

    showStory(
        state.currentStoryIndex + 1,
        "next"
    );
}


/* ==========================================================
   PREVIOUS
========================================================== */

function previousStory() {

    if (!state.isOpen) {
        return;
    }

    if (state.currentStoryIndex <= 0) {

        animateBoundary("prev");

        return;
    }

    showStory(
        state.currentStoryIndex - 1,
        "prev"
    );
}


/* ==========================================================
   NAVIGATION STATE
========================================================== */

function updateNavigation() {

    elements.viewerPrev.disabled =
        state.currentStoryIndex <= 0;

    elements.viewerNext.disabled =
        state.currentStoryIndex >= stories.length - 1;

    elements.viewerPrev.setAttribute(
        "aria-disabled",
        String(elements.viewerPrev.disabled)
    );

    elements.viewerNext.setAttribute(
        "aria-disabled",
        String(elements.viewerNext.disabled)
    );
}


/* ==========================================================
   BOUNDARY ANIMATION
========================================================== */

function animateBoundary(direction) {

    const distance =
        direction === "next"
            ? -15
            : 15;

    elements.viewerContent.animate(
        [
            {
                transform: "translateX(0)"
            },
            {
                transform: `translateX(${distance}px)`
            },
            {
                transform: "translateX(0)"
            }
        ],
        {
            duration: 260,
            easing: "ease-out"
        }
    );
}


/* ==========================================================
   TOUCH
========================================================== */

function handleTouchStart(event) {

    if (!state.isOpen) {
        return;
    }

    if (event.touches.length !== 1) {
        return;
    }

    state.touchStartX =
        event.touches[0].clientX;

    state.touchCurrentX =
        state.touchStartX;

    state.isDragging = true;

    elements.viewerContent.classList.add(
        "is-dragging"
    );
}


function handleTouchMove(event) {

    if (!state.isDragging) {
        return;
    }

    state.touchCurrentX =
        event.touches[0].clientX;

    state.dragOffset =
        state.touchCurrentX -
        state.touchStartX;

    if (Math.abs(state.dragOffset) > 10) {
        event.preventDefault();
    }

    applyDragVisual();
}


function handleTouchEnd() {

    if (!state.isDragging) {
        return;
    }

    const distance =
        state.touchCurrentX -
        state.touchStartX;

    finishDrag(distance);
}


/* ==========================================================
   MOUSE DRAG
========================================================== */

function handleMouseDown(event) {

    if (!state.isOpen) {
        return;
    }

    if (event.button !== 0) {
        return;
    }

    state.isDragging = true;

    state.mouseStartX = event.clientX;
    state.mouseCurrentX = event.clientX;

    elements.viewerContent.classList.add(
        "is-dragging"
    );
}


function handleMouseMove(event) {

    if (!state.isDragging) {
        return;
    }

    state.mouseCurrentX = event.clientX;

    state.dragOffset =
        state.mouseCurrentX -
        state.mouseStartX;

    applyDragVisual();
}


function handleMouseUp() {

    if (!state.isDragging) {
        return;
    }

    const distance =
        state.mouseCurrentX -
        state.mouseStartX;

    finishDrag(distance);
}


/* ==========================================================
   DRAG VISUAL
========================================================== */

function applyDragVisual() {

    const offset = state.dragOffset;

    const resistance =
        Math.abs(offset) > 120
            ? 0.35
            : 0.7;

    const visualOffset =
        offset * resistance;

    const rotation =
        visualOffset * 0.015;

    elements.viewerContent.style.transform =
        `translate3d(${visualOffset}px, 0, 0) rotate(${rotation}deg)`;
}


function finishDrag(distance) {

    state.isDragging = false;

    elements.viewerContent.classList.remove(
        "is-dragging"
    );

    resetDrag();

    if (
        Math.abs(distance) <
        STORIES_CONFIG.SWIPE_THRESHOLD
    ) {
        return;
    }

    if (distance < 0) {
        nextStory();
    } else {
        previousStory();
    }
}


function resetDrag() {

    state.dragOffset = 0;

    elements.viewerContent.style.transform = "";
}


/* ==========================================================
   KEYBOARD
========================================================== */

function handleKeyboard(event) {

    if (!state.isOpen) {
        return;
    }

    switch (event.key) {

        case "ArrowLeft":
            event.preventDefault();
            previousStory();
            break;

        case "ArrowRight":
            event.preventDefault();
            nextStory();
            break;

        case "Escape":
            event.preventDefault();
            closeStory();
            break;

        case "Home":
            event.preventDefault();

            showStory(
                0,
                "prev"
            );

            break;

        case "End":
            event.preventDefault();

            showStory(
                stories.length - 1,
                "next"
            );

            break;
    }
}


/* ==========================================================
   AUTOPLAY
========================================================== */

function startAutoplay() {

    if (!STORIES_CONFIG.AUTO_PLAY) {
        return;
    }

    resetAutoplay();
}


function resetAutoplay() {

    stopAutoplay();

    if (
        !STORIES_CONFIG.AUTO_PLAY ||
        !state.isOpen
    ) {
        return;
    }

    state.autoplayTimer =
        window.setTimeout(() => {

            if (
                state.currentStoryIndex <
                stories.length - 1
            ) {
                nextStory();
            } else {
                closeStory();
            }

        }, STORIES_CONFIG.STORY_DURATION);
}


function stopAutoplay() {

    if (state.autoplayTimer !== null) {

        window.clearTimeout(
            state.autoplayTimer
        );

        state.autoplayTimer = null;
    }
}


/* ==========================================================
   PAUSE AUTOPLAY
========================================================== */

function pauseAutoplay() {

    stopAutoplay();
}


function resumeAutoplay() {

    if (state.isOpen) {
        resetAutoplay();
    }
}


/* ==========================================================
   SCROLL LOCK
========================================================== */

function lockScroll() {

    state.previousBodyOverflow =
        document.body.style.overflow;

    document.body.style.overflow = "hidden";
}


function unlockScroll() {

    document.body.style.overflow =
        state.previousBodyOverflow;
}


/* ==========================================================
   VIEWED STORIES
========================================================== */

function markStoryAsViewed(index) {

    state.viewedStories.add(index);

    const cards = document.querySelectorAll(
        ".story-card"
    );

    const card = cards[index];

    if (card) {
        card.classList.add("is-viewed");
    }
}


/* ==========================================================
   PARTICLES
========================================================== */

function createParticles() {

    const fragment =
        document.createDocumentFragment();

    const colors = [
        "#00d5ff",
        "#b89b4f",
        "#57217e",
        "#dadada"
    ];

    for (
        let i = 0;
        i < STORIES_CONFIG.PARTICLE_COUNT;
        i++
    ) {

        const particle =
            document.createElement("span");

        particle.className =
            "viewer-particle";

        particle.style.setProperty(
            "--x",
            `${random(2, 98)}%`
        );

        particle.style.setProperty(
            "--y",
            `${random(2, 98)}%`
        );

        particle.style.setProperty(
            "--size",
            `${random(.8, 3)}px`
        );

        particle.style.setProperty(
            "--opacity",
            random(.2, .9).toFixed(2)
        );

        particle.style.setProperty(
            "--duration",
            `${random(3, 9)}s`
        );

        particle.style.setProperty(
            "--delay",
            `${random(-8, 0)}s`
        );

        particle.style.setProperty(
            "--move-x",
            `${random(-35, 35)}px`
        );

        particle.style.setProperty(
            "--move-y",
            `${random(-45, 45)}px`
        );

        particle.style.setProperty(
            "--color",
            colors[
                Math.floor(
                    Math.random() * colors.length
                )
            ]
        );

        fragment.appendChild(particle);
    }

    elements.viewerParticles.replaceChildren(
        fragment
    );
}


/* ==========================================================
   MOUSE PARALLAX
========================================================== */

function setupMouseParallax() {

    if (
        !STORIES_CONFIG.ENABLE_MOUSE_PARALLAX ||
        !window.matchMedia("(pointer: fine)").matches
    ) {
        return;
    }

    let animationFrame = null;

    window.addEventListener(
        "mousemove",
        event => {

            if (!state.isOpen) {
                return;
            }

            if (animationFrame) {
                cancelAnimationFrame(
                    animationFrame
                );
            }

            animationFrame =
                requestAnimationFrame(() => {

                    const x =
                        event.clientX /
                        window.innerWidth -
                        .5;

                    const y =
                        event.clientY /
                        window.innerHeight -
                        .5;

                    const moveX =
                        x * 15;

                    const moveY =
                        y * 10;

                    if (!state.isDragging) {

                        elements.viewerContent.style.transform =
                            `translate3d(${moveX}px, ${moveY}px, 0)`;
                    }
                });
        },
        {
            passive: true
        }
    );
}


/* ==========================================================
   IMAGE PRELOADING
========================================================== */

function preloadImages() {

    if (!("requestIdleCallback" in window)) {
        return;
    }

    window.requestIdleCallback(() => {

        stories.forEach(story => {

            const image =
                new Image();

            image.src =
                story.image;
        });

    }, {
        timeout: 3000
    });
}


/* ==========================================================
   INTERACTION HINT
========================================================== */

function showInteractionHint() {

    if (state.hintShown) {
        return;
    }

    state.hintShown = true;

    elements.viewerHint.style.opacity = "1";

    window.setTimeout(() => {

        elements.viewerHint.style.opacity = "0";

    }, 3500);
}


/* ==========================================================
   EVENTS
========================================================== */

function bindEvents() {

    elements.viewerClose.addEventListener(
        "click",
        closeStory
    );

    elements.viewerPrev.addEventListener(
        "click",
        previousStory
    );

    elements.viewerNext.addEventListener(
        "click",
        nextStory
    );


    /* Touch */

    elements.viewerContent.addEventListener(
        "touchstart",
        handleTouchStart,
        {
            passive: true
        }
    );

    elements.viewerContent.addEventListener(
        "touchmove",
        handleTouchMove,
        {
            passive: false
        }
    );

    elements.viewerContent.addEventListener(
        "touchend",
        handleTouchEnd,
        {
            passive: true
        }
    );


    /* Mouse */

    elements.viewerContent.addEventListener(
        "mousedown",
        handleMouseDown
    );

    window.addEventListener(
        "mousemove",
        handleMouseMove
    );

    window.addEventListener(
        "mouseup",
        handleMouseUp
    );


    /* Keyboard */

    document.addEventListener(
        "keydown",
        handleKeyboard
    );


    /* Autoplay pause */

    elements.viewer.addEventListener(
        "mouseenter",
        pauseAutoplay
    );

    elements.viewer.addEventListener(
        "mouseleave",
        resumeAutoplay
    );


    elements.viewer.addEventListener(
        "touchstart",
        pauseAutoplay,
        {
            passive: true
        }
    );

    elements.viewer.addEventListener(
        "touchend",
        resumeAutoplay,
        {
            passive: true
        }
    );


    /* Backdrop */

    elements.viewer
        .querySelector(".viewer-backdrop")
        .addEventListener(
            "click",
            closeStory
        );


    /* Prevent accidental image dragging */

    elements.viewerImage.addEventListener(
        "dragstart",
        event => {
            event.preventDefault();
        }
    );


    /* Resize */

    window.addEventListener(
        "resize",
        () => {

            if (!state.isOpen) {
                return;
            }

            resetDrag();
        },
        {
            passive: true
        }
    );


    /* Visibility */

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.hidden
            ) {
                pauseAutoplay();
            } else {
                resumeAutoplay();
            }
        }
    );
}


/* ==========================================================
   UTILITIES
========================================================== */

function clamp(value, min, max) {

    return Math.min(
        Math.max(value, min),
        max
    );
}


function random(min, max) {

    return (
        Math.random() *
        (max - min)
    ) + min;
}


function formatNumber(number) {

    return String(number)
        .padStart(2, "0");
}


/* ==========================================================
   OPTIONAL PUBLIC API
   Permite controlar el sistema desde otro script.
========================================================== */

window.CelestialStories = {

    open(index = 0) {
        openStory(index);
    },

    close() {
        closeStory();
    },

    next() {
        nextStory();
    },

    previous() {
        previousStory();
    },

    goTo(index) {

        if (
            index < 0 ||
            index >= stories.length
        ) {
            return;
        }

        if (!state.isOpen) {
            openStory(index);
            return;
        }

        const direction =
            index >= state.currentStoryIndex
                ? "next"
                : "prev";

        showStory(
            index,
            direction
        );
    },

    getCurrentIndex() {
        return state.currentStoryIndex;
    },

    getStories() {
        return [...stories];
    }
};
