import * as bootstrap from 'bootstrap';
import Swiper, { SwiperOptions } from 'swiper/bundle';
import { PaginationOptions } from 'swiper/types/components/pagination';
import swiperParams from './swiperParams';
import { applySystemTheme } from './theme';
import { onActiveIndexChange } from './search';
import { settingsButton, settingsModal } from './dom_elements';
import { storage, swiper } from './index';
import { loadFavorites } from './utils';

const settingsBootstrapModal = new bootstrap.Modal(settingsModal, {});
let pagination = swiperParams.pagination as PaginationOptions;

export const onSettingsButtonClick = () => {
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

  settingsBootstrapModal.toggle();
};

export const updateMoviesSwiper = () => {
  swiper.movies.destroy();
  swiper.movies = new Swiper('.swiper-container.movies', swiperParams);
  swiper.movies.on('activeIndexChange', onActiveIndexChange);
};

export const updateFavoritesSwiper = () => {
  swiper.favorites.destroy();
  swiper.favorites = new Swiper('.swiper-container.favorites', swiperParams);
};

export const onEffectSelectChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (target.id !== 'effectSelect') return;

  storage.load();

  const targetEffect = target.value as SwiperOptions['effect'];
  swiperParams.effect = targetEffect;

  updateMoviesSwiper();
  updateFavoritesSwiper();
  loadFavorites();

  storage.effect = targetEffect!;
  storage.save();
};

export const onPaginationSelectChange = (event: Event) => {
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

export const onTabKeypress = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;
  if (!swiperParams.keyboard) return;
  event.preventDefault();

  const nav = document.querySelector('#nav')!.children;
  const activeTabIndex = [].findIndex.call(nav, (tab: HTMLElement) => tab.classList.contains('active'));
  const lastTabActive = nav.length - activeTabIndex === 1;
  const nextTabIndex = (lastTabActive) ? 0 : activeTabIndex + 1;

  nav[nextTabIndex].dispatchEvent(new Event('click', { bubbles: true }));
};

export const onKeyboardControlChange = (event: Event) => {
  const target = event.target as HTMLInputElement;

  swiperParams.keyboard = target.checked;
  updateMoviesSwiper();
  updateFavoritesSwiper();
  loadFavorites();

  if (target.checked) document.addEventListener('keydown', onTabKeypress);
  if (!target.checked) document.removeEventListener('keydown', onTabKeypress);

  storage.keyboardControl = target.checked;
  storage.save();
};

export const onMouseControlChange = (event: Event) => {
  const target = event.target as HTMLInputElement;

  swiperParams.mousewheel = target.checked;
  updateMoviesSwiper();
  updateFavoritesSwiper();
  loadFavorites();

  storage.mouseControl = target.checked;
  storage.save();
};

export const onDarkModeControlChange = (event: Event) => {
  const target = event.target as HTMLInputElement;

  storage.darkModeAuto = target.checked;
  storage.save();

  if (target.checked) applySystemTheme();
};

export const runSettingsModalListeners = () => {
  settingsButton.addEventListener('click', onSettingsButtonClick);
  settingsModal.querySelector('#effectSelect')!.addEventListener('change', onEffectSelectChange);
  settingsModal.querySelector('#paginationSelect')!.addEventListener('change', onPaginationSelectChange);
  settingsModal.querySelector('#keyboardControl')!.addEventListener('change', onKeyboardControlChange);
  settingsModal.querySelector('#mouseControl')!.addEventListener('change', onMouseControlChange);
  settingsModal.querySelector('#darkModeControl')!.addEventListener('change', onDarkModeControlChange);
};
