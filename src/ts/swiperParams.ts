import { SwiperOptions } from 'swiper';

const swiperParams: SwiperOptions = {
  direction: 'horizontal',
  loop: false,
  slidesPerView: 1,
  spaceBetween: -50,
  centerInsufficientSlides: true,
  effect: 'coverflow',
  coverflowEffect: {
    rotate: 15,
    slideShadows: false,
  },
  pagination: {
    el: '.swiper-pagination',
    type: 'bullets',
    clickable: true,
    dynamicBullets: true,
    dynamicMainBullets: 3,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  scrollbar: {
    draggable: true,
  },
  observer: true,
  observeParents: true,
  observeSlideChildren: true,
  breakpoints: {
    568: {
      slidesPerView: 2,
    },
    850: {
      slidesPerView: 3,
    },
    1150: {
      slidesPerView: 4,
    },
  },
  mousewheel: {
    invert: false,
    sensitivity: 10,
  },
  keyboard: true,
};

export default swiperParams;
