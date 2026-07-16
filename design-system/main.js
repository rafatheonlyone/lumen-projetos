/* ==========================================================================
   LUMEN DESIGN SYSTEM — INTERACTIONS
   Vanilla JS, no dependencies. Each module is self-contained and only
   activates if its markup is present on the page, so this file is safe
   to include on every Lumen site regardless of which components it uses.
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     THEME TOGGLE — persists to localStorage, defaults to dark (Lumen's
     native canvas). Any element with [data-theme-toggle] flips it.
     ------------------------------------------------------------------ */
  const Theme = {
    key: 'lumen-theme',
    init() {
      const saved = localStorage.getItem(this.key);
      if (saved) document.documentElement.setAttribute('data-theme', saved);
      document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
        btn.addEventListener('click', (e) => this.toggleWithTransition(e));
      });
    },
    toggle() {
      const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      if (next === 'dark') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', next);
      }
      localStorage.setItem(this.key, next);
    },
    /* Wraps the plain toggle in a circular reveal that expands from the
       toggle button's position, using the View Transitions API where
       supported. This is pure progressive enhancement: unsupported
       browsers and reduced-motion users get the instant/cross-fade
       behavior that already existed (see base.css's color-transition
       on <body>) with no functional difference. */
    toggleWithTransition(event) {
      if (!document.startViewTransition || prefersReducedMotion) {
        this.toggle();
        return;
      }
      const x = event?.clientX ?? window.innerWidth / 2;
      const y = event?.clientY ?? window.innerHeight / 2;
      const root = document.documentElement;
      root.style.setProperty('--theme-x', `${x}px`);
      root.style.setProperty('--theme-y', `${y}px`);
      root.setAttribute('data-theme-transitioning', 'true');
      const transition = document.startViewTransition(() => this.toggle());
      transition.finished.finally(() => root.removeAttribute('data-theme-transitioning'));
    },
  };

  /* ------------------------------------------------------------------
     NAVBAR — glass state on scroll + mobile menu toggle
     ------------------------------------------------------------------ */
  const Navbar = {
    init() {
      const nav = document.querySelector('.navbar');
      if (!nav) return;

      const onScroll = () => {
        nav.setAttribute('data-scrolled', window.scrollY > 12 ? 'true' : 'false');
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });

      const toggle = nav.querySelector('.navbar__toggle');
      if (toggle) {
        toggle.addEventListener('click', () => {
          const open = nav.getAttribute('data-menu-open') === 'true';
          nav.setAttribute('data-menu-open', String(!open));
          toggle.setAttribute('aria-expanded', String(!open));
          document.body.style.overflow = !open ? 'hidden' : '';
        });

        nav.querySelectorAll('.navbar__mobile-panel .navbar__link').forEach((link) => {
          link.addEventListener('click', () => {
            nav.setAttribute('data-menu-open', 'false');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
          });
        });
      }
    },
  };

  /* ------------------------------------------------------------------
     SCROLL REVEAL — observes every [data-reveal] element, adds
     [data-revealed] once it enters the viewport. Reveals only once
     (unless [data-reveal-repeat] is present) to avoid distracting
     re-triggers on scroll-back.
     ------------------------------------------------------------------ */
  const ScrollReveal = {
    init() {
      const targets = document.querySelectorAll('[data-reveal]');
      if (!targets.length) return;

      if (prefersReducedMotion) {
        targets.forEach((el) => el.setAttribute('data-revealed', 'true'));
        return;
      }

      document.querySelectorAll('[data-reveal-group]').forEach((group) => {
        [...group.querySelectorAll('[data-reveal]')].forEach((el, i) => {
          el.style.setProperty('--stagger-index', i);
        });
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.setAttribute('data-revealed', 'true');
              if (!entry.target.hasAttribute('data-reveal-repeat')) {
                observer.unobserve(entry.target);
              }
            } else if (entry.target.hasAttribute('data-reveal-repeat')) {
              entry.target.removeAttribute('data-revealed');
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
      );

      targets.forEach((el) => observer.observe(el));
    },
  };

  /* ------------------------------------------------------------------
     TABS — ARIA tabs pattern, keyboard-navigable (arrow keys)
     ------------------------------------------------------------------ */
  const Tabs = {
    init() {
      document.querySelectorAll('[data-tabs]').forEach((root) => {
        const triggers = [...root.querySelectorAll('.tabs__trigger')];
        const panels = [...root.querySelectorAll('.tabs__panel')];

        const activate = (index) => {
          triggers.forEach((t, i) => t.setAttribute('aria-selected', String(i === index)));
          panels.forEach((p, i) => (p.hidden = i !== index));
          triggers[index].focus();
        };

        triggers.forEach((trigger, index) => {
          trigger.addEventListener('click', () => activate(index));
          trigger.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') activate((index + 1) % triggers.length);
            if (e.key === 'ArrowLeft') activate((index - 1 + triggers.length) % triggers.length);
          });
        });
      });
    },
  };

  /* ------------------------------------------------------------------
     MODAL — wraps native <dialog>. Open via [data-modal-open="id"],
     close via [data-modal-close] inside the dialog.
     ------------------------------------------------------------------ */
  const Modal = {
    /* Native <dialog>.close() removes the element from the top layer
       immediately — there's no event to hook to animate it out first.
       So closing plays a reverse keyframe (see overlay.css's
       [data-closing]) and only calls the real .close() once that
       animation finishes (or instantly, if reduced motion is on). */
    closeAnimated(dialog) {
      if (prefersReducedMotion) {
        dialog.close();
        return;
      }
      dialog.setAttribute('data-closing', 'true');
      dialog.addEventListener('animationend', () => {
        dialog.removeAttribute('data-closing');
        dialog.close();
      }, { once: true });
    },
    init() {
      document.querySelectorAll('[data-modal-open]').forEach((btn) => {
        const dialog = document.getElementById(btn.getAttribute('data-modal-open'));
        if (!dialog) return;
        btn.addEventListener('click', () => dialog.showModal());
      });

      document.querySelectorAll('dialog.modal').forEach((dialog) => {
        dialog.querySelectorAll('[data-modal-close]').forEach((btn) => {
          btn.addEventListener('click', () => this.closeAnimated(dialog));
        });
        // Click outside the modal panel (on the ::backdrop) closes it.
        dialog.addEventListener('click', (e) => {
          if (e.target === dialog) this.closeAnimated(dialog);
        });
      });
    },
  };

  /* ------------------------------------------------------------------
     TOAST — programmatic API: Lumen.toast({ variant, title, text })
     ------------------------------------------------------------------ */
  const Toast = {
    region: null,
    init() {
      this.region = document.querySelector('.toast-region');
      if (!this.region) {
        this.region = document.createElement('div');
        this.region.className = 'toast-region';
        this.region.setAttribute('role', 'status');
        this.region.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.region);
      }
    },
    icons: {
      success: '<svg viewBox="0 0 20 20" fill="none"><path d="M16.7 5.3 8 14l-4.7-4.7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      warning: '<svg viewBox="0 0 20 20" fill="none"><path d="M10 7v4m0 3h.01M8.6 2.9 1.4 15.5a1.5 1.5 0 0 0 1.3 2.3h14.6a1.5 1.5 0 0 0 1.3-2.3L11.4 2.9a1.5 1.5 0 0 0-2.8 0Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      danger:  '<svg viewBox="0 0 20 20" fill="none"><path d="M10 6v5m0 3h.01M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      info:    '<svg viewBox="0 0 20 20" fill="none"><path d="M10 9v5m0-8h.01M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    show({ variant = 'info', title = '', text = '', duration = 4200 } = {}) {
      const el = document.createElement('div');
      el.className = `toast toast--${variant}`;
      el.innerHTML = `
        <span class="toast__icon">${this.icons[variant] || this.icons.info}</span>
        <div>
          ${title ? `<div class="toast__title">${title}</div>` : ''}
          ${text ? `<div class="toast__text">${text}</div>` : ''}
        </div>
        <button class="toast__close" aria-label="Dismiss notification">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1 1 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
        </button>`;
      this.region.appendChild(el);

      const dismiss = () => {
        el.setAttribute('data-leaving', 'true');
        el.addEventListener('animationend', () => el.remove(), { once: true });
      };
      el.querySelector('.toast__close').addEventListener('click', dismiss);
      if (duration) setTimeout(dismiss, duration);
    },
  };

  /* ------------------------------------------------------------------
     COUNTER — animates numeric stat values on reveal, e.g.
     <span data-counter="248">0</span>
     ------------------------------------------------------------------ */
  const Counter = {
    init() {
      const targets = document.querySelectorAll('[data-counter]');
      if (!targets.length) return;

      const animate = (el) => {
        const end = parseFloat(el.getAttribute('data-counter'));
        const suffix = el.getAttribute('data-counter-suffix') || '';
        if (prefersReducedMotion) {
          el.textContent = end + suffix;
          return;
        }
        const duration = 1400;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(end * eased) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      targets.forEach((el) => observer.observe(el));
    },
  };

  /* ------------------------------------------------------------------
     CHIP GROUP — toggles aria-pressed for single/multi-select filters
     ------------------------------------------------------------------ */
  const Chips = {
    init() {
      document.querySelectorAll('.chip[aria-pressed]').forEach((chip) => {
        chip.addEventListener('click', () => {
          const pressed = chip.getAttribute('aria-pressed') === 'true';
          chip.setAttribute('aria-pressed', String(!pressed));
        });
      });
    },
  };

  /* ------------------------------------------------------------------
     CAROUSEL — powers .testimonial-carousel (and any [data-carousel]
     track). Supports arrow buttons, dot nav, swipe/drag, and autoplay
     via [data-autoplay="4000"] on the root.
     ------------------------------------------------------------------ */
  const Carousel = {
    init() {
      document.querySelectorAll('[data-carousel]').forEach((root) => {
        const track = root.querySelector('.testimonial-carousel__track, [data-carousel-track]');
        if (!track) return;
        const slides = [...track.children];
        const dotsWrap = root.querySelector('[data-carousel-dots]');
        const prevBtn = root.querySelector('.testimonial-carousel__arrow--prev, [data-carousel-prev]');
        const nextBtn = root.querySelector('.testimonial-carousel__arrow--next, [data-carousel-next]');
        let index = 0;
        let dots = [];

        if (dotsWrap) {
          dots = slides.map((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'testimonial-carousel__dot';
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            dot.addEventListener('click', () => goTo(i));
            dotsWrap.appendChild(dot);
            return dot;
          });
        }

        const goTo = (i) => {
          index = (i + slides.length) % slides.length;
          track.style.transform = `translateX(-${index * 100}%)`;
          dots.forEach((d, di) => d.setAttribute('aria-current', String(di === index)));
        };

        prevBtn?.addEventListener('click', () => goTo(index - 1));
        nextBtn?.addEventListener('click', () => goTo(index + 1));
        goTo(0);

        // Pointer drag / swipe
        let startX = 0, delta = 0, dragging = false;
        const onDown = (x) => { dragging = true; startX = x; track.style.transition = 'none'; };
        const onMove = (x) => { if (!dragging) return; delta = x - startX; track.style.transform = `translateX(calc(-${index * 100}% + ${delta}px))`; };
        const onUp = () => {
          if (!dragging) return;
          dragging = false;
          track.style.transition = '';
          if (Math.abs(delta) > 60) goTo(index + (delta < 0 ? 1 : -1));
          else goTo(index);
          delta = 0;
        };
        track.addEventListener('pointerdown', (e) => onDown(e.clientX));
        track.addEventListener('pointermove', (e) => onMove(e.clientX));
        window.addEventListener('pointerup', onUp);

        const autoplay = root.getAttribute('data-autoplay');
        if (autoplay && !prefersReducedMotion) {
          setInterval(() => goTo(index + 1), parseInt(autoplay, 10));
        }
      });
    },
  };

  /* ------------------------------------------------------------------
     PORTFOLIO / CATEGORY FILTER — chip group with [data-filter-value]
     toggles [data-hidden] on sibling items matching [data-category].
     ------------------------------------------------------------------ */
  const CategoryFilter = {
    init() {
      document.querySelectorAll('[data-filter-group]').forEach((group) => {
        const targetSelector = group.getAttribute('data-filter-group');
        const items = [...document.querySelectorAll(targetSelector)];
        const chips = [...group.querySelectorAll('[data-filter-value]')];

        chips.forEach((chip) => {
          chip.addEventListener('click', () => {
            chips.forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
            const value = chip.getAttribute('data-filter-value');
            items.forEach((item) => {
              const match = value === 'all' || item.getAttribute('data-category') === value;
              item.toggleAttribute('data-hidden', !match);
            });
          });
        });
      });
    },
  };

  /* ------------------------------------------------------------------
     PRICING BILLING TOGGLE — flips [data-billing] on a container
     between "monthly"/"yearly"; CSS in pricing.css shows/hides the
     matching price spans.
     ------------------------------------------------------------------ */
  const BillingToggle = {
    init() {
      document.querySelectorAll('.billing-toggle').forEach((toggle) => {
        const container = document.querySelector(toggle.getAttribute('data-billing-target') || 'body');
        const options = [...toggle.querySelectorAll('.billing-toggle__option')];
        options.forEach((opt) => {
          opt.addEventListener('click', () => {
            options.forEach((o) => o.setAttribute('aria-pressed', String(o === opt)));
            container.setAttribute('data-billing', opt.getAttribute('data-billing-value'));
          });
        });
      });
    },
  };

  /* ------------------------------------------------------------------
     FAQ SEARCH — filters .accordion-item by question text against
     the .faq-search input's value.
     ------------------------------------------------------------------ */
  const FaqSearch = {
    init() {
      document.querySelectorAll('.faq-search input').forEach((input) => {
        const scope = input.closest('[data-faq-scope]') || document;
        const items = [...scope.querySelectorAll('.accordion-item')];
        const empty = scope.querySelector('.faq-search__empty');

        input.addEventListener('input', () => {
          const query = input.value.trim().toLowerCase();
          let visibleCount = 0;
          items.forEach((item) => {
            const text = item.querySelector('.accordion-item__trigger')?.textContent.toLowerCase() || '';
            const match = text.includes(query);
            item.toggleAttribute('data-hidden', !match);
            if (match) visibleCount++;
          });
          empty?.toggleAttribute('data-visible', visibleCount === 0);
        });
      });
    },
  };

  /* ------------------------------------------------------------------
     SERVICE ROW — expandable rows (.service-row) toggle [data-open]
     ------------------------------------------------------------------ */
  const ServiceRows = {
    init() {
      document.querySelectorAll('.service-row').forEach((row) => {
        row.addEventListener('click', () => {
          const open = row.getAttribute('data-open') === 'true';
          document.querySelectorAll('.service-row[data-open="true"]').forEach((r) => {
            if (r !== row) r.setAttribute('data-open', 'false');
          });
          row.setAttribute('data-open', String(!open));
        });
      });
    },
  };

  /* ------------------------------------------------------------------
     LIGHTBOX — opens a shared <dialog class="lightbox"> populated with
     the src from any [data-lightbox-src] trigger.
     ------------------------------------------------------------------ */
  const Lightbox = {
    dialog: null,
    init() {
      this.dialog = document.querySelector('.lightbox');
      if (!this.dialog) return;
      const img = this.dialog.querySelector('img');
      document.querySelectorAll('[data-lightbox-src]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
          img.src = trigger.getAttribute('data-lightbox-src');
          img.alt = trigger.getAttribute('data-lightbox-alt') || '';
          this.dialog.showModal();
        });
      });
      const close = () => Modal.closeAnimated(this.dialog);
      this.dialog.querySelector('.lightbox__close')?.addEventListener('click', close);
      this.dialog.addEventListener('click', (e) => { if (e.target === this.dialog) close(); });
    },
  };

  /* ------------------------------------------------------------------
     DRAG SCROLL — adds pointer-drag scrolling to any horizontally
     scrollable track (portfolio-slider, gallery-slider) so desktop
     users aren't limited to trackpad/shift-scroll.
     ------------------------------------------------------------------ */
  const DragScroll = {
    init() {
      document.querySelectorAll('.portfolio-slider, .gallery-slider, [data-drag-scroll]').forEach((track) => {
        let isDown = false, startX = 0, scrollStart = 0;
        track.addEventListener('pointerdown', (e) => {
          isDown = true;
          track.setAttribute('data-dragging', 'true');
          startX = e.clientX;
          scrollStart = track.scrollLeft;
        });
        window.addEventListener('pointerup', () => { isDown = false; track.setAttribute('data-dragging', 'false'); });
        track.addEventListener('pointermove', (e) => {
          if (!isDown) return;
          track.scrollLeft = scrollStart - (e.clientX - startX);
        });
      });
    },
  };

  /* ------------------------------------------------------------------
     PARALLAX — sets --parallax-y on [data-parallax] elements based on
     scroll position, read by the CSS transform in motion.css. Batched
     through requestAnimationFrame with a "ticking" guard so a burst of
     scroll events collapses into one style write per frame rather than
     one per event — the difference between buttery and janky at 100+
     scroll events/second on a trackpad fling.
     ------------------------------------------------------------------ */
  const Parallax = {
    init() {
      const targets = document.querySelectorAll('[data-parallax]');
      if (!targets.length || prefersReducedMotion) return;
      let ticking = false;

      const apply = () => {
        targets.forEach((el) => {
          const rect = el.getBoundingClientRect();
          const speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
          const offset = (rect.top - window.innerHeight / 2) * speed;
          el.style.setProperty('--parallax-y', `${offset}px`);
        });
        ticking = false;
      };

      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(apply);
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      apply();
    },
  };

  /* ------------------------------------------------------------------
     SPOTLIGHT — cursor-follow glow for [data-spotlight] elements,
     sets --mx/--my read by motion.css.
     ------------------------------------------------------------------ */
  const Spotlight = {
    init() {
      if (prefersReducedMotion) return;
      document.querySelectorAll('[data-spotlight]').forEach((el) => {
        el.addEventListener('pointermove', (e) => {
          const rect = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
          el.style.setProperty('--my', `${e.clientY - rect.top}px`);
        });
      });
    },
  };

  /* ------------------------------------------------------------------
     MAGNETIC — [data-magnetic="0.3"] elements lean toward the pointer.
     Tracking is instant while the pointer is inside the element (the
     .is-magnet-active class in motion.css drops the transition to
     near-zero so it doesn't lag the cursor); on leave the class is
     removed so the element's default, slower --ease-magnetic transition
     springs it back to rest. No rAF loop needed — pointermove is
     already frame-throttled by the browser.
     ------------------------------------------------------------------ */
  const Magnetic = {
    init() {
      if (prefersReducedMotion) return;
      document.querySelectorAll('[data-magnetic]').forEach((el) => {
        const strength = parseFloat(el.getAttribute('data-magnetic')) || 0.3;

        el.addEventListener('pointerenter', () => el.classList.add('is-magnet-active'));
        el.addEventListener('pointermove', (e) => {
          const rect = el.getBoundingClientRect();
          const relX = e.clientX - rect.left - rect.width / 2;
          const relY = e.clientY - rect.top - rect.height / 2;
          el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
        });
        el.addEventListener('pointerleave', () => {
          el.classList.remove('is-magnet-active');
          el.style.transform = '';
        });
      });
    },
  };

  /* ------------------------------------------------------------------
     TEXT REVEAL — auto-splits any [data-text-reveal] element's text
     into per-word spans carrying --word-index, then hands it to
     ScrollReveal by adding [data-reveal="words"] so the existing
     IntersectionObserver (and, for above-the-fold headlines, the
     immediate on-load intersection) drives *when* it reveals — this
     module only owns the one-time DOM split. Markup authors never
     hand-wrap words in spans; a heading just opts in with the attribute.
     ------------------------------------------------------------------ */
  const TextReveal = {
    init() {
      document.querySelectorAll('[data-text-reveal]').forEach((el) => {
        const words = el.textContent.trim().split(/\s+/);
        el.textContent = '';
        el.setAttribute('data-reveal', 'words');
        words.forEach((word, i) => {
          const span = document.createElement('span');
          span.setAttribute('data-reveal-word', '');
          span.style.setProperty('--word-index', i);
          span.textContent = word;
          el.appendChild(span);
          el.appendChild(document.createTextNode(' '));
        });
      });
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
    Navbar.init();
    TextReveal.init(); // must run before ScrollReveal — it creates the [data-reveal] targets
    ScrollReveal.init();
    Tabs.init();
    Modal.init();
    Toast.init();
    Counter.init();
    Chips.init();
    Carousel.init();
    CategoryFilter.init();
    BillingToggle.init();
    FaqSearch.init();
    ServiceRows.init();
    Lightbox.init();
    DragScroll.init();
    Parallax.init();
    Spotlight.init();
    Magnetic.init();
  });

  window.Lumen = { toast: (opts) => Toast.show(opts), Theme };
})();
