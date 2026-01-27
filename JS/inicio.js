
// =========================
// TOPBAR
// =========================
const topbar = document.getElementById("topbar");
const toggleBtn = topbar?.querySelector(".topbar__toggle");
const topbarMenu = topbar?.querySelector(".topbar__menu");

const navLinks = document.querySelectorAll('.topbar a[href^="#"]');
const sections = document.querySelectorAll("section[id]");

function setActiveLink(sectionId) {
  navLinks.forEach(link => {
    const hrefId = link.getAttribute("href").slice(1);
    link.classList.toggle("active", hrefId === sectionId);
  });
}

function openMenu() {
  if (!topbar || !toggleBtn) return;
  topbar.classList.add("is-open");
  toggleBtn.setAttribute("aria-expanded", "true");
  toggleBtn.setAttribute("aria-label", "Cerrar menú");
}

function closeMenu() {
  if (!topbar || !toggleBtn) return;
  topbar.classList.remove("is-open");
  toggleBtn.setAttribute("aria-expanded", "false");
  toggleBtn.setAttribute("aria-label", "Abrir menú");
}

toggleBtn?.addEventListener("click", () => {
  const isOpen = topbar.classList.contains("is-open");
  isOpen ? closeMenu() : openMenu();
});

document.addEventListener("click", (e) => {
  if (!topbar) return;
  if (!topbar.classList.contains("is-open")) return;
  if (!topbar.contains(e.target)) closeMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});


navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    const targetId = link.getAttribute("href").slice(1);
    const target = document.getElementById(targetId);

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveLink(targetId);
    }

    closeMenu();
  });
});

const topbarHeight = document.querySelector(".topbar")?.offsetHeight ?? 80;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        setActiveLink(id);
      }
    });
  },
  {
    root: null,
    threshold: 0.4,
    rootMargin: `-${topbarHeight}px 0px 0px`
  }
);

sections.forEach(section => observer.observe(section));

// =========================
// PRODUCTOS SWIPERS
// =========================

const swiperSabores = new Swiper(".sabores-swiper .swiper", {
  loop: true,
  speed: 1400,
  spaceBetween: 44,
  slidesPerView: 3,
  centeredSlides: true,

  allowTouchMove: true,
  grabCursor: true,

  autoplay: {
    delay: 900,
    disableOnInteraction: false,
  },

  navigation: {
    nextEl: ".sabores-swiper .swiper-span-next",
    prevEl: ".sabores-swiper .swiper-span-prev",
  },

  breakpoints: {
    0: { slidesPerView: 1, spaceBetween: 18 },
    480: { slidesPerView: 1, spaceBetween: 22 },
    768: { slidesPerView: 2, spaceBetween: 30 },
    1024: { slidesPerView: 3, spaceBetween: 44 },
  },
});


const swiperPaletas = new Swiper(".paletas-swiper .swiper", {
  loop: true,
  speed: 1500,
  spaceBetween: 110,
  slidesPerView: 3,

  allowTouchMove: true,
  grabCursor: true,

  autoplay: {
    delay: 500,
    disableOnInteraction: false,
    reverseDirection: true,
  },
  navigation: {
    nextEl: ".paletas-swiper .swiper-paletas-prev",
    prevEl: ".paletas-swiper .swiper-paletas-next",
  },

  breakpoints: {
    0: {
      slidesPerView: 2, 
      spaceBetween: 20,
    },
    480: {
      slidesPerView: 2,   
      spaceBetween: 24,
    },
    768: {
      slidesPerView: 3,
      spaceBetween: 40,
    },
    1024: {
      slidesPerView: 4,
      spaceBetween: 110,
    },
  },
});


const scriptURL = 'https://script.google.com/macros/s/AKfycbwHmTbi-AASZOLRXVgd7qmH9wqJQRt0ZHzn7ArL7mfj97seoiB5p5GEeN0ivRBHuvac/exec';

const form = document.getElementById('franquiciasForm');
const msg = document.getElementById('franquicias-mensaje');
const submitBtn = form.querySelector('.franq-btn-enviar');

let isSending = false;


function getFieldWrapper(el) {
  return el.closest('.franq-field') || el.parentElement;
}

function ensureErrorNode(el) {
  const wrap = getFieldWrapper(el);
  if (!wrap) return null;

  let node = wrap.querySelector('.field-error');
  if (!node) {
    node = document.createElement('p');
    node.className = 'field-error';
    node.setAttribute('aria-live', 'polite');
    wrap.appendChild(node);
  }
  return node;
}

function setError(el, text) {
  const node = ensureErrorNode(el);
  if (node) node.textContent = text;

  el.classList.add('is-invalid');
  el.classList.add('shake');
  setTimeout(() => el.classList.remove('shake'), 450);
}

function clearError(el) {
  const wrap = getFieldWrapper(el);
  const node = wrap?.querySelector('.field-error');
  if (node) node.textContent = '';

  el.classList.remove('is-invalid', 'shake');
}

function focusAndScrollTo(el) {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(() => el.focus({ preventScroll: true }), 200);
}

function getCustomMessage(el) {
  if (el.validity.valueMissing) {
    const label = (getFieldWrapper(el)?.querySelector('label')?.textContent || 'Este campo').trim();
    return `Completá: ${label}.`;
  }

  if (el.type === 'email' && el.validity.typeMismatch) {
    return 'Ingresá un email válido (ej: nombre@dominio.com).';
  }

  if (el.name === 'telefono' && el.validity.patternMismatch) {
    return 'Ingresá solo números (6 a 20 dígitos).';
  }

  if (el.validity.rangeUnderflow) {
    return 'El valor no puede ser menor al mínimo permitido.';
  }

  if (el.validity.badInput) {
    return 'Ingresá un valor válido.';
  }

  return 'Revisá este campo.';
}

function validateField(el, { show = true } = {}) {
  if (!el.matches('input, select, textarea')) return true;

  if (el.disabled) {
    clearError(el);
    return true;
  }

  const ok = el.checkValidity();
  if (ok) {
    clearError(el);
    return true;
  }

  if (show) setError(el, getCustomMessage(el));
  return false;
}

function validateForm({ show = true } = {}) {
  const fields = [...form.querySelectorAll('input, select, textarea')];
  let allOk = true;

  for (const el of fields) {
    const ok = validateField(el, { show });
    if (!ok) allOk = false;
  }
  return allOk;
}

const localPropio = document.getElementById('local-propio');
const tipoLocal = document.getElementById('tipo-local');
const metros = document.getElementById('metros');
const direccionLocal = document.getElementById('direccion-local');

const localFields = [tipoLocal, metros, direccionLocal].filter(Boolean);

function setLocalFieldsRequired(isRequired) {
  localFields.forEach((el) => {
    el.required = isRequired;

    el.disabled = !isRequired;

    if (!isRequired) {
      el.value = '';
      clearError(el);
    }
  });
}

function syncLocalRules() {
  const hasLocal = localPropio?.value === 'Sí';
  setLocalFieldsRequired(hasLocal);

}

if (localPropio) {
  syncLocalRules();

  localPropio.addEventListener('change', () => {
    syncLocalRules();
  });
}


form.addEventListener(
  'blur',
  (e) => {
    const el = e.target;
    if (el.matches('input, select, textarea')) validateField(el, { show: true });
  },
  true
);

form.addEventListener('input', (e) => {
  const el = e.target;
  if (!el.matches('input, textarea')) return;

  if (el.classList.contains('is-invalid')) {
    validateField(el, { show: true });
  }
});


form.addEventListener('change', (e) => {
  const el = e.target;
  if (el.matches('select')) validateField(el, { show: true });
});


form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (isSending) return;

  syncLocalRules();

  const ok = validateForm({ show: true });

  if (!ok) {
    const firstInvalid = form.querySelector('.is-invalid') || form.querySelector(':invalid');
    focusAndScrollTo(firstInvalid);
    msg.textContent = 'Faltan completar campos. Revisá los marcados en rojo.';
    return;
  }

  // Enviar
  isSending = true;
  submitBtn.classList.add('is-loading');
  msg.textContent = 'Enviando solicitud...';

  fetch(scriptURL, {
    method: 'POST',
    body: new FormData(form),
    mode: 'no-cors'
  })
    .then(() => {
      msg.textContent = '¡Gracias! Recibimos tu solicitud y nos vamos a contactar a la brevedad.';
      form.reset();

      form.querySelectorAll('input, select, textarea').forEach(clearError);

      syncLocalRules();
    })
    .catch((error) => {
      console.error('Error!', error);
      msg.textContent = 'Ocurrió un error al enviar el formulario. Intentá nuevamente.';
    })
    .finally(() => {
      isSending = false;
      submitBtn.classList.remove('is-loading');
    });
});

// ==========================
// CONTACTO 
// ==========================
const contactoForm = document.getElementById('contactoForm');
const contactoMsg = document.getElementById('contacto-mensaje');

if (contactoForm) {
  const contactoBtn = contactoForm.querySelector('.contacto-btn');
  let contactoSending = false;

  function ensureErrorNodeContacto(el) {
    const wrap = el.closest('.contacto-field') || el.parentElement;
    let node = wrap.querySelector('.field-error');
    if (!node) {
      node = document.createElement('p');
      node.className = 'field-error';
      node.setAttribute('aria-live', 'polite');
      wrap.appendChild(node);
    }
    return node;
  }

  function setErrorContacto(el, text) {
    const node = ensureErrorNodeContacto(el);
    node.textContent = text;

    el.classList.add('is-invalid', 'shake');
    setTimeout(() => el.classList.remove('shake'), 450);
  }

  function clearErrorContacto(el) {
    const wrap = el.closest('.contacto-field') || el.parentElement;
    const node = wrap.querySelector('.field-error');
    if (node) node.textContent = '';
    el.classList.remove('is-invalid', 'shake');
  }

  function focusAndScrollContacto(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el.focus({ preventScroll: true }), 200);
  }

  function getContactoMessage(el) {
    if (el.validity.valueMissing) {
      const label = (el.closest('.contacto-field')?.querySelector('label')?.textContent || 'Este campo').trim();
      return `Completá: ${label}.`;
    }
    if (el.type === 'email' && el.validity.typeMismatch) {
      return 'Ingresá un email válido (ej: nombre@dominio.com).';
    }
    if (el.name === 'telefono' && el.validity.patternMismatch) {
      return 'Ingresá solo números (6 a 20 dígitos).';
    }
    return 'Revisá este campo.';
  }

  function validateFieldContacto(el, { show = true } = {}) {
    if (!el.matches('input, textarea')) return true;

    const ok = el.checkValidity();
    if (ok) {
      clearErrorContacto(el);
      return true;
    }
    if (show) setErrorContacto(el, getContactoMessage(el));
    return false;
  }

  function validateContactoForm({ show = true } = {}) {
    const fields = [...contactoForm.querySelectorAll('input, textarea')];
    let allOk = true;
    for (const el of fields) {
      const ok = validateFieldContacto(el, { show });
      if (!ok) allOk = false;
    }
    return allOk;
  }

  contactoForm.addEventListener('blur', (e) => {
    const el = e.target;
    if (el.matches('input, textarea')) validateFieldContacto(el, { show: true });
  }, true);

  contactoForm.addEventListener('input', (e) => {
    const el = e.target;
    if (!el.matches('input, textarea')) return;

    if (el.classList.contains('is-invalid')) {
      validateFieldContacto(el, { show: true });
    }
  });

  contactoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (contactoSending) return;

    const ok = validateContactoForm({ show: true });

    if (!ok) {
      const firstInvalid = contactoForm.querySelector('.is-invalid') || contactoForm.querySelector(':invalid');
      focusAndScrollContacto(firstInvalid);
      contactoMsg.textContent = 'Faltan completar campos. Revisá los marcados en rojo.';
      return;
    }

    contactoSending = true;
    contactoBtn.classList.add('is-loading');

    fetch(scriptURL, {
      method: 'POST',
      body: new FormData(contactoForm),
      mode: 'no-cors'
    })
      .then(() => {
        contactoMsg.textContent = '¡Gracias! Recibimos tu mensaje.';
        contactoForm.reset();
        contactoForm.querySelectorAll('input, textarea').forEach(clearErrorContacto);
      })
      .catch((err) => {
        console.error('Error!', err);
        contactoMsg.textContent = 'Ocurrió un error al enviar. Intentá nuevamente.';
      })
      .finally(() => {
        contactoSending = false;
        contactoBtn.classList.remove('is-loading');
      });
  });
}

let _scrollY = 0;

function lockScroll() {
  _scrollY = window.scrollY || document.documentElement.scrollTop;
  document.body.style.overflow = "hidden";
  document.body.style.top = `-${_scrollY}px`;
  document.body.classList.add("modal-open");
}

function unlockScroll() {
  document.body.style.overflow = "";
  document.body.classList.remove("modal-open");
  document.body.style.top = "";
  window.scrollTo(0, _scrollY);
}


(() => {
  const modal = document.getElementById("saboresModal");
  const modalTitle = document.getElementById("saboresModalTitle");
  const modalList = document.getElementById("saboresModalList");
  const modalImg = document.getElementById("saboresModalImg");

  if (!modal || !modalTitle || !modalList || !modalImg) return;

  const closeModal = () => {
    modal.hidden = true;
    if (typeof swiperSabores !== "undefined" && swiperSabores?.autoplay) {
      swiperSabores.autoplay.start();
    }
    unlockScroll();

  };

  const openModal = (catEl) => {
    const group = catEl.dataset.open;
    const labelEl = catEl.querySelector(".chip__label");
    const imgEl = catEl.querySelector("img");

    modalTitle.textContent = labelEl ? labelEl.textContent.trim() : "Sabores";
    if (imgEl) {
      modalImg.src = imgEl.src;
      modalImg.alt = imgEl.alt || modalTitle.textContent;
      modalImg.style.display = "block";
    } else {
      modalImg.style.display = "none";
    }

    const items = document.querySelectorAll(`#saboresData .chip[data-group="${group}"]`);
    modalList.innerHTML = "";

    if (!items.length) {
      modalList.innerHTML = `
        <p style="margin:10px 4px; font:400 15px 'Lora', serif; color:#2E5A44;">
          Todavía no hay sabores cargados en esta categoría.
        </p>`;
    } else {
      items.forEach((chip) => {
        const clone = chip.cloneNode(true);
        clone.classList.remove("chip-category");
        clone.removeAttribute("data-open");

        const wrap = document.createElement("div");
        wrap.className = "sabores-modal__item";
        wrap.appendChild(clone);
        modalList.appendChild(wrap);

      });
    }

    modal.hidden = false;
    lockScroll();

    if (typeof swiperSabores !== "undefined" && swiperSabores?.autoplay) {
      swiperSabores.autoplay.stop();
    }
  };

  document.addEventListener("click", (e) => {
    const cat = e.target.closest(".sabores-swiper .chip-category");
    if (cat) {
      e.preventDefault();
      openModal(cat);
      return;
    }

    if (!modal.hidden && (e.target.matches("[data-close]") || e.target.closest("[data-close]"))) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!modal.hidden && e.key === "Escape") closeModal();
  });
})();

const btnTop = document.querySelector("#btn-top");

window.addEventListener("scroll", () => {

  if (window.scrollY > 350) {
    btnTop.classList.add("is-visible");
  } else {
    btnTop.classList.remove("is-visible");
  }
});

btnTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

