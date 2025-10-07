const baseOpts = {
    loop: true,
    speed: 600,
    spaceBetween: 28,
    autoplay: { delay: 1800, disableOnInteraction: false },
    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
        0: { slidesPerView: 1.3 },
        480: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1100: { slidesPerView: 4 }
    }
};

new Swiper('.helados-swiper', baseOpts);
new Swiper('.paletas-swiper', baseOpts);