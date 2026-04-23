'use strict';

// ============================================================
// MÓDULO: NAVEGACIÓN
// ============================================================
const NavModule = (() => {
  const topbar    = document.getElementById('topbar');
  const toggleBtn = topbar?.querySelector('.topbar__toggle');
  const navLinks  = document.querySelectorAll('.topbar a[href^="#"]');
  const sections  = document.querySelectorAll('section[id]');

  function openMenu() {
    topbar.classList.add('is-open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Cerrar menú');
  }

  function closeMenu() {
    topbar.classList.remove('is-open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Abrir menú');
  }

  function setActiveLink(id) {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href').slice(1) === id);
    });
  }

  function init() {
    if (!topbar || !toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      topbar.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    document.addEventListener('click', (e) => {
      if (topbar.classList.contains('is-open') && !topbar.contains(e.target)) closeMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.getAttribute('href').slice(1));
        target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveLink(link.getAttribute('href').slice(1));
        closeMenu();
      });
    });

    // IntersectionObserver para link activo según scroll
    const topbarHeight = topbar.offsetHeight ?? 80;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveLink(entry.target.id);
        });
      },
      { root: null, threshold: 0.4, rootMargin: `-${topbarHeight}px 0px 0px` }
    );

    sections.forEach(section => observer.observe(section));
  }

  return { init };
})();


// ============================================================
// MÓDULO: SCROLL LOCK (usado por modal)
// ============================================================
const ScrollLock = (() => {
  let savedY = 0;

  function lock() {
    savedY = window.scrollY;
    Object.assign(document.body.style, { overflow: 'hidden', top: `-${savedY}px` });
    document.body.classList.add('modal-open');
  }

  function unlock() {
    Object.assign(document.body.style, { overflow: '', top: '' });
    document.body.classList.remove('modal-open');
    window.scrollTo(0, savedY);
  }

  return { lock, unlock };
})();


// ============================================================
// MÓDULO: SWIPERS
// ============================================================
const SwipersModule = (() => {
  let swiperSabores;

  function init() {
    swiperSabores = new Swiper('.sabores-swiper .swiper', {
      loop: true,
      speed: 800,
      spaceBetween: 44,
      centeredSlides: true,
      observer: true,
      observeParents: true,
      loopedSlides: 4,
      grabCursor: true,
      autoplay: { delay: 2500, disableOnInteraction: false },
      navigation: {
        nextEl: '.sabores-swiper .swiper-span-next',
        prevEl: '.sabores-swiper .swiper-span-prev',
      },
      breakpoints: {
        0:    { slidesPerView: 1, spaceBetween: 18 },
        480:  { slidesPerView: 1, spaceBetween: 22 },
        768:  { slidesPerView: 2, spaceBetween: 30 },
        1024: { slidesPerView: 3, spaceBetween: 44 },
      },
    });

    new Swiper('.paletas-swiper .swiper', {
      loop: true,
      speed: 1500,
      spaceBetween: 110,
      grabCursor: true,
      autoplay: { delay: 500, disableOnInteraction: false, reverseDirection: true },
      navigation: {
        nextEl: '.paletas-swiper .swiper-paletas-prev',
        prevEl: '.paletas-swiper .swiper-paletas-next',
      },
      breakpoints: {
        0:    { slidesPerView: 2, spaceBetween: 20 },
        480:  { slidesPerView: 2, spaceBetween: 24 },
        768:  { slidesPerView: 3, spaceBetween: 40 },
        1024: { slidesPerView: 4, spaceBetween: 110 },
      },
    });
  }

  function pauseSabores()  { swiperSabores?.autoplay?.stop(); }
  function resumeSabores() { swiperSabores?.autoplay?.start(); }

  return { init, pauseSabores, resumeSabores };
})();


// ============================================================
// MÓDULO: MODAL DE SABORES
// ============================================================
const SaboresModal = (() => {
  const modal      = document.getElementById('saboresModal');
  const titleEl    = document.getElementById('saboresModalTitle');
  const listEl     = document.getElementById('saboresModalList');
  const imgEl      = document.getElementById('saboresModalImg');
  const dataSource = document.getElementById('saboresData');

  if (!modal || !titleEl || !listEl || !imgEl || !dataSource) return { init: () => {} };

  function open(catEl) {
    const group   = catEl.dataset.open;
    const labelEl = catEl.querySelector('.chip__label');
    const catImg  = catEl.querySelector('img');

    titleEl.textContent = labelEl?.textContent.trim() ?? 'Sabores';

    if (catImg) {
      imgEl.src   = catImg.src;
      imgEl.alt   = catImg.alt || titleEl.textContent;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
    }

    const items = dataSource.querySelectorAll(`.chip[data-group="${group}"]`);
    listEl.innerHTML = '';

    if (!items.length) {
      listEl.innerHTML = `<p style="margin:10px 4px;font:400 15px 'Lora',serif;color:#2E5A44;">
        Todavía no hay sabores cargados en esta categoría.
      </p>`;
    } else {
      items.forEach(chip => {
        const clone = chip.cloneNode(true);
        clone.classList.remove('chip-category');
        clone.removeAttribute('data-open');

        const wrap = document.createElement('div');
        wrap.className = 'sabores-modal__item';
        wrap.appendChild(clone);
        listEl.appendChild(wrap);
      });
    }

    modal.hidden = false;
    modal.removeAttribute('aria-hidden');
    ScrollLock.lock();
    SwipersModule.pauseSabores();

    // Foco al cerrar para accesibilidad
    modal.querySelector('.sabores-modal__close')?.focus();
  }

  function close() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    ScrollLock.unlock();
    SwipersModule.resumeSabores();
  }

  function init() {
    // Click en categorías (incluye soporte teclado con role=button)
    document.addEventListener('click', (e) => {
      const cat = e.target.closest('.sabores-swiper .chip-category');
      if (cat) { e.preventDefault(); open(cat); return; }

      if (!modal.hidden && (e.target.matches('[data-close]') || e.target.closest('[data-close]'))) {
        close();
      }
    });

    // Soporte teclado para chip-category (role=button)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.hidden) { close(); return; }

      if (e.key === 'Enter' || e.key === ' ') {
        const cat = e.target.closest('.chip-category');
        if (cat) { e.preventDefault(); open(cat); }
      }
    });
  }

  return { init };
})();


// ============================================================
// CLASE: FORM VALIDATOR (reutilizable para cualquier formulario)
// ============================================================
class FormValidator {
  /**
   * @param {HTMLFormElement} form
   * @param {object} options
   * @param {string} options.fieldSelector    - selector CSS del wrapper de campo
   * @param {string} options.inputSelector    - selector de inputs dentro del form
   */
  constructor(form, { fieldSelector = '.franq-field, .contacto-field', inputSelector = 'input, select, textarea' } = {}) {
    this.form          = form;
    this.fieldSelector = fieldSelector;
    this.inputSelector = inputSelector;
  }

  getWrapper(el) {
    return el.closest(this.fieldSelector) ?? el.parentElement;
  }

  ensureErrorNode(el) {
    const wrap = this.getWrapper(el);
    if (!wrap) return null;

    let node = wrap.querySelector('.field-error');
    if (!node) {
      node = Object.assign(document.createElement('p'), {
        className: 'field-error',
      });
      node.setAttribute('aria-live', 'polite');
      wrap.appendChild(node);
    }
    return node;
  }

  setError(el, text) {
    const node = this.ensureErrorNode(el);
    if (node) node.textContent = text;

    el.classList.add('is-invalid', 'shake');
    setTimeout(() => el.classList.remove('shake'), 450);
  }

  clearError(el) {
    const node = this.getWrapper(el)?.querySelector('.field-error');
    if (node) node.textContent = '';
    el.classList.remove('is-invalid', 'shake');
  }

  getMessage(el) {
    const { validity } = el;
    const label = (this.getWrapper(el)?.querySelector('label')?.textContent ?? 'Este campo').trim();

    if (validity.valueMissing)   return `Completá: ${label}.`;
    if (validity.typeMismatch && el.type === 'email') return 'Ingresá un email válido (ej: nombre@dominio.com).';
    if (validity.patternMismatch && el.name === 'telefono') return 'Ingresá solo números (6 a 20 dígitos).';
    if (validity.rangeUnderflow) return 'El valor no puede ser menor al mínimo permitido.';
    if (validity.badInput)       return 'Ingresá un valor válido.';
    return 'Revisá este campo.';
  }

  validateField(el, show = true) {
    if (!el.matches(this.inputSelector) || el.disabled) {
      this.clearError(el);
      return true;
    }

    if (el.checkValidity()) { this.clearError(el); return true; }
    if (show) this.setError(el, this.getMessage(el));
    return false;
  }

  validateAll(show = true) {
    let allOk = true;
    this.form.querySelectorAll(this.inputSelector).forEach(el => {
      if (!this.validateField(el, show)) allOk = false;
    });
    return allOk;
  }

  clearAll() {
    this.form.querySelectorAll(this.inputSelector).forEach(el => this.clearError(el));
  }

  focusFirst() {
    const el = this.form.querySelector('.is-invalid') ?? this.form.querySelector(':invalid');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el.focus({ preventScroll: true }), 200);
  }

  bindLiveValidation() {
    // Blur: validar al salir del campo
    this.form.addEventListener('blur', (e) => {
      if (e.target.matches(this.inputSelector)) this.validateField(e.target);
    }, true);

    // Input: re-validar si ya tiene error
    this.form.addEventListener('input', (e) => {
      if (e.target.matches('input, textarea') && e.target.classList.contains('is-invalid')) {
        this.validateField(e.target);
      }
    });

    // Change: para selects
    this.form.addEventListener('change', (e) => {
      if (e.target.matches('select')) this.validateField(e.target);
    });
  }
}


// ============================================================
// MÓDULO: FORMULARIO FRANQUICIAS
// ============================================================
const FranquiciasModule = (() => {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHmTbi-AASZOLRXVgd7qmH9wqJQRt0ZHzn7ArL7mfj97seoiB5p5GEeN0ivRBHuvac/exec';

  function init() {
    const form      = document.getElementById('franquiciasForm');
    const msgEl     = document.getElementById('franquicias-mensaje');
    const submitBtn = form?.querySelector('.franq-btn-enviar');

    if (!form) return;

    const validator     = new FormValidator(form);
    const localPropio   = document.getElementById('local-propio');
    const dependientes  = ['tipo-local', 'metros', 'direccion-local'].map(id => document.getElementById(id)).filter(Boolean);

    let sending = false;

    // Campos condicionales según si tienen local
    function syncLocalFields() {
      const hasLocal = localPropio?.value === 'Sí';
      dependientes.forEach(el => {
        el.required = hasLocal;
        el.disabled = !hasLocal;
        if (!hasLocal) { el.value = ''; validator.clearError(el); }
      });
    }

    localPropio?.addEventListener('change', syncLocalFields);
    syncLocalFields();
    validator.bindLiveValidation();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;

      syncLocalFields();

      if (!validator.validateAll()) {
        validator.focusFirst();
        if (msgEl) msgEl.textContent = 'Faltan completar campos. Revisá los marcados en rojo.';
        return;
      }

      sending = true;
      submitBtn?.classList.add('is-loading');

      try {
        await fetch(SCRIPT_URL, { method: 'POST', body: new FormData(form), mode: 'no-cors' });
        if (msgEl) msgEl.textContent = '¡Gracias! Recibimos tu solicitud y nos vamos a contactar a la brevedad.';
        form.reset();
        validator.clearAll();
        syncLocalFields();
      } catch (err) {
        console.error('Error al enviar formulario de franquicias:', err);
        if (msgEl) msgEl.textContent = 'Ocurrió un error al enviar el formulario. Intentá nuevamente.';
      } finally {
        sending = false;
        submitBtn?.classList.remove('is-loading');
      }
    });
  }

  return { init };
})();


// ============================================================
// MÓDULO: FORMULARIO CONTACTO
// ============================================================
const ContactoModule = (() => {
  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwHmTbi-AASZOLRXVgd7qmH9wqJQRt0ZHzn7ArL7mfj97seoiB5p5GEeN0ivRBHuvac/exec';

  function init() {
    const form      = document.getElementById('contactoForm');
    const msgEl     = document.getElementById('contacto-mensaje');
    const submitBtn = form?.querySelector('.contacto-btn');

    if (!form) return;

    const validator = new FormValidator(form);
    let sending = false;

    validator.bindLiveValidation();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (sending) return;

      if (!validator.validateAll()) {
        validator.focusFirst();
        if (msgEl) msgEl.textContent = 'Faltan completar campos. Revisá los marcados en rojo.';
        return;
      }

      sending = true;
      submitBtn?.classList.add('is-loading');

      try {
        await fetch(SCRIPT_URL, { method: 'POST', body: new FormData(form), mode: 'no-cors' });
        if (msgEl) msgEl.textContent = '¡Gracias! Recibimos tu mensaje.';
        form.reset();
        validator.clearAll();
      } catch (err) {
        console.error('Error al enviar formulario de contacto:', err);
        if (msgEl) msgEl.textContent = 'Ocurrió un error al enviar. Intentá nuevamente.';
      } finally {
        sending = false;
        submitBtn?.classList.remove('is-loading');
      }
    });
  }

  return { init };
})();


// ============================================================
// MÓDULO: BOTÓN VOLVER ARRIBA
// ============================================================
const BackToTopModule = (() => {
  function init() {
    const btn = document.getElementById('btn-top');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('is-visible', window.scrollY > 350);
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  return { init };
})();


// ============================================================
// INIT — arrancar todo cuando el DOM esté listo
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  NavModule.init();
  SwipersModule.init();
  SaboresModal.init();
  FranquiciasModule.init();
  ContactoModule.init();
  BackToTopModule.init();
});
