import { SwiperOptions } from 'swiper';

const swiperParams: SwiperOptions = {
  direction: 'horizontal',
  loop: false,
  slidesPerView: 1,
  spaceBetween: -50,
  centerInsufficientSlides: true,
  effect: 'coverflow',
  coverflowEffect: {
    rotate: 30,
    slideShadows: false,
  },
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
  },
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },
  scrollbar: {
    el: '.swiper-scrollbar',
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
};

export default swiperParams;
