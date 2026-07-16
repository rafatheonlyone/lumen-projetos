/* ==========================================================================
   BRASA & SAL — MOTION LAYER (behavior)
   Small, page-scoped modules that complement design-system/main.js
   without modifying it. Each module no-ops if its markup isn't present.
   Loaded after main.js, so window.Lumen (toast API) is already defined.
   ========================================================================== */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     PRELOADER — waits for a short minimum + full page load (images
     included), whichever is longer, capped by a hard timeout so a slow
     asset can never block the page indefinitely.
     ------------------------------------------------------------------ */
  const Preloader = {
    init() {
      const el = document.querySelector('.preloader');
      if (!el) return;

      if (reduceMotion) {
        el.remove();
        return;
      }

      document.documentElement.style.overflow = 'hidden';

      const minDelay = new Promise((resolve) => setTimeout(resolve, 380));
      const pageLoaded = new Promise((resolve) => {
        if (document.readyState === 'complete') { resolve(); return; }
        window.addEventListener('load', resolve, { once: true });
      });
      const hardTimeout = new Promise((resolve) => setTimeout(resolve, 2500));

      Promise.race([Promise.all([minDelay, pageLoaded]), hardTimeout]).then(() => {
        el.setAttribute('data-hidden', 'true');
        document.documentElement.style.overflow = '';
        let removed = false;
        const remove = () => {
          if (removed) return;
          removed = true;
          el.remove();
        };
        el.addEventListener('transitionend', remove, { once: true });
        setTimeout(remove, 900); // safety net if transitionend never fires
      });
    },
  };

  /* ------------------------------------------------------------------
     HERO TEXT REVEAL — splits the hero title into words so it cascades
     in rather than arriving as one flat block. Uses the design
     system's own [data-reveal-word] contract (see motion.css).
     ------------------------------------------------------------------ */
  const HeroReveal = {
    init() {
      const title = document.getElementById('hero-title');
      if (!title) return;

      const words = title.textContent.trim().split(/\s+/);
      title.innerHTML = words
        .map((word, i) => `<span data-reveal-word style="--word-index:${i}">${word}</span>`)
        .join(' ');

      if (reduceMotion) {
        title.setAttribute('data-revealed', 'true');
        return;
      }
      setTimeout(() => title.setAttribute('data-revealed', 'true'), 520);
    },
  };

  /* ------------------------------------------------------------------
     IMAGE FADE-IN — avoids raw/unstyled image pop-in on slower
     connections. No-ops instantly for already-cached images.
     ------------------------------------------------------------------ */
  const ImageFade = {
    init() {
      document.querySelectorAll('img.img-fade').forEach((img) => {
        if (img.complete) {
          img.classList.add('is-loaded');
          return;
        }
        img.addEventListener('load', () => img.classList.add('is-loaded'), { once: true });
      });
    },
  };

  /* ------------------------------------------------------------------
     FORM FLOW — reservation + newsletter forms borrow the existing
     .btn[data-loading] spinner and the shared Toast module, so the
     "submit" moment feels acknowledged rather than a silent no-op.
     ------------------------------------------------------------------ */
  const FormFlow = {
    bind(formId, { loadingMs = 1100, toast }) {
      const form = document.getElementById(formId);
      if (!form) return;

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        if (!btn || btn.getAttribute('data-loading') === 'true') return;

        btn.setAttribute('data-loading', 'true');
        btn.setAttribute('aria-disabled', 'true');

        setTimeout(() => {
          btn.removeAttribute('data-loading');
          btn.removeAttribute('aria-disabled');
          form.reset();
          if (window.Lumen && typeof window.Lumen.toast === 'function') {
            window.Lumen.toast(toast);
          }
        }, reduceMotion ? 150 : loadingMs);
      });
    },
    init() {
      this.bind('reservation-form', {
        loadingMs: 1100,
        toast: {
          variant: 'success',
          title: 'Reserva recebida',
          text: 'Entraremos em contato em breve para confirmar sua mesa.',
        },
      });
      this.bind('newsletter-form', {
        loadingMs: 800,
        toast: {
          variant: 'success',
          title: 'Inscrição confirmada',
          text: 'Você vai receber nossas próximas novidades.',
        },
      });
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    Preloader.init();
    HeroReveal.init();
    ImageFade.init();
    FormFlow.init();
  });
})();
