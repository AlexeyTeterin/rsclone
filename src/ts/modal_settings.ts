import * as bootstrap from 'bootstrap';
import Swiper, { SwiperOptions } from 'swiper/bundle';
import { PaginationOptions } from 'swiper/types/components/pagination';
import swiperParams from './swiperParams';
import {
  storage, swiper, reloadFavorites, handleNextSearchPageLoad,
} from './index';
import { applySystemTheme } from './theme';

export const settingsButton = document.querySelector('#settings')!;
export const settingsModal = document.querySelector('#settingsModal')!;
const settingsModalBS = new bootstrap.Modal(settingsModal, {});
let pagination = swiperParams.pagination as PaginationOptions;

export const showSettingsModal = () => {
  storage.load();
  const activeEffect = storage.effect;
  const activePaginationType = storage.pagination;
  const { keyboardControl, mouseControl, darkModeAuto } = storage;
  const optionSlide = settingsModal.querySelector('#option-slide')! as HTMLOptionElement;
  const optionCoverflow = settingsModal.querySelector('#option-coverflow')! as HTMLOptionElement;
  const optionFraction = settingsModal.querySelector('#option-fraction')! as HTMLOptionElement;
  const optionBullets = settingsModal.querySelector('#option-bullets')! as HTMLOptionElement;
  const keyboardControlToggle = settingsModal.querySelector('#keyboardControl')! as HTMLInputElement;
  const mouseControlToggle = settingsModal.querySelector('#mouseControl')! as HTMLInputElement;
  const darkModeControlToggle = settingsModal.querySelector('#darkModeControl') as HTMLInputElement;

  if (activeEffect === 'slide') {
    optionSlide.selected = true;
    optionCoverflow.selected = false;
  } else {
    optionSlide.selected = false;
    optionCoverflow.selected = true;
  }

  if (activePaginationType === 'fraction') {
    optionFraction.selected = true;
    optionBullets.selected = false;
  } else {
    optionBullets.selected = true;
    optionFraction.selected = false;
  }

  if (keyboardControl) keyboardControlToggle.checked = true;
  if (mouseControl) mouseControlToggle.checked = true;
  if (darkModeAuto) darkModeControlToggle.checked = true;

  settingsModalBS.toggle();
};

export const updateMoviesSwiper = () => {
  swiper.movies.destroy();
  swiper.movies = new Swiper('.swiper-container.movies', swiperParams);
  swiper.movies.on('activeIndexChange', handleNextSearchPageLoad);
};

export const updateFavoritesSwiper = () => {
  swiper.favorites.destroy();
  swiper.favorites = new Swiper('.swiper-container.favorites', swiperParams);
};

export const toggleSwiperEffect = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (target.id !== 'effectSelect') return;

  storage.load();

  const targetEffect = target.value as SwiperOptions['effect'];
  swiperParams.effect = targetEffect;

  updateMoviesSwiper();
  updateFavoritesSwiper();
  reloadFavorites();

  storage.effect = targetEffect!;
  storage.save();
};

export const toggleSwiperPaginationType = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (target.id !== 'paginationSelect') return;

  document.querySelectorAll('.swiper-pagination')
    .forEach((el) => {
      const swip = el;
      swip.className = 'swiper-pagination';
    });
  const targetPaginationType = target.value as PaginationOptions['type'];
  pagination = swiper.movies.params.pagination as PaginationOptions;
  pagination.type = targetPaginationType;

  swiper.movies.params.pagination = pagination;
  swiper.movies.pagination.init();
  swiper.movies.pagination.render();
  swiper.movies.pagination.update();

  swiper.favorites.params.pagination = pagination;
  swiper.favorites.pagination.init();
  swiper.favorites.pagination.render();
  swiper.favorites.pagination.update();

  swiperParams.pagination = pagination;
  storage.load();
  storage.pagination = targetPaginationType!;
  storage.save();
};

export const handleTabKeyress = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;
  const nav = document.querySelector('#nav')!.children;
  const activeTabIndex = [].findIndex.call(nav, (tab: HTMLElement) => tab.classList.contains('active'));
  const lastTabActive = nav.length - activeTabIndex === 1;
  const nextTabIndex = (lastTabActive) ? 0 : activeTabIndex + 1;

  nav[nextTabIndex].dispatchEvent(new Event('click', { bubbles: true }));
};

export const toggleKeyboardControl = (event: Event) => {
  const target = event.target as HTMLInputElement;

  swiperParams.keyboard = target.checked;
  updateMoviesSwiper();
  updateFavoritesSwiper();
  reloadFavorites();

  if (target.checked) document.addEventListener('keydown', handleTabKeyress);
  if (!target.checked) document.removeEventListener('keydown', handleTabKeyress);

  storage.keyboardControl = target.checked;
  storage.save();
};

export const toggleMouseControl = (event: Event) => {
  const target = event.target as HTMLInputElement;

  swiperParams.mousewheel = target.checked;
  updateMoviesSwiper();
  updateFavoritesSwiper();
  reloadFavorites();

  storage.mouseControl = target.checked;
  storage.save();
};

export const toggleDarkModeAuto = (event: Event) => {
  const target = event.target as HTMLInputElement;

  storage.darkModeAuto = target.checked;
  storage.save();

  if (target.checked) applySystemTheme();
};
