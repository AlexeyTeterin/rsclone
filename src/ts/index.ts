import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swiper from 'swiper/bundle';
import swiperParams from './swiperParams';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import {
  getOMDBdata, OMDBMovieData, RatingsArray,
  getUpcomingTMDB, getTMDBdata, OMDBSearchResponce,
} from './API';
import {
  handleTabKeyress, settingsButton, settingsModal, showSettingsModal,
  toggleDarkModeAuto, toggleKeyboardControl, toggleMouseControl,
  toggleSwiperEffect, toggleSwiperPaginationType,
} from './modal_settings';
import Storage from './Storage';
import {
  animateHeader, applySystemTheme, isDarkMode, removeHeaderAnimation, themeSwitch, toggleTheme,
} from './theme';
import { showMovieModal } from './modal_movieInfo';
import { top101, top101observer } from './tab_top101';
import {
  handleSearchClick, input, handleNextSearchPageLoad, searchBtn,
} from './search';
import {
  reloadFavorites, favoritesWrapper, handleSlideFavButtonClick, alertFavObserver,
} from './tab_favorites';
import { handleMenuClick, menu } from './nav';
import Keyboard from '../js/keyboard';
import '../css/keyboard.css';
import { createSlide } from './creators';

const storage = new Storage();
const state = {
  page: 0,
  request: '',
  top101page: 1,
};
const swiper = {
  movies: new Swiper('.swiper-container.movies', swiperParams),
  favorites: new Swiper('.swiper-container.favorites', swiperParams),
};

const wait = (ms: number) => new Promise((resolve: any) => setTimeout(() => resolve(), ms));

const showControls = () => {
  settingsButton.classList.add('visible');
  themeSwitch.parentElement?.classList.add('visible');
};

const keyboard = new Keyboard();
const keyboardButton = document.querySelector('.fa-keyboard')!;

const init = () => {
  if (!localStorage.VideoBox) storage.save();
  else storage.load();

  if (window.innerWidth < 400) {
    keyboardButton.classList.add('hidden');
  }
  keyboard.init();

  if (storage.darkModeAuto && isDarkMode()) themeSwitch.checked = false;
  if ((!storage.darkModeAuto && storage.darkMode)) themeSwitch.checked = false;
  toggleTheme();

  input.focus();

  wait(1000).then(() => showControls());
};

const addRatingToSlide = (card: HTMLElement, data: OMDBMovieData) => {
  const imdbRating = data.Ratings
    .find((r: RatingsArray) => r.Source === 'Internet Movie Database');
  const cardRating = card.querySelector('.card__rating')!;
  cardRating.textContent = imdbRating ? `${imdbRating.Value.slice(0, -3)}` : 'n/a';
};

const setAlertMessage = (res: OMDBSearchResponce) => {
  const request = input.value;
  const alert = document.querySelector('#movies>.alert')!;
  alert.classList.remove('alert-success', 'alert-danger');
  const { totalResults } = res;
  if (!totalResults) {
    alert.textContent = res.Error;
    alert.classList.add('alert-danger');
  } else {
    alert.textContent = `${totalResults} movies found on request '${request}'`;
    alert.classList.add('alert-success');
  }
  alert.classList.remove('visually-hidden');
};

const handleEnterPress = (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return;
  searchBtn.dispatchEvent(new Event('click', { bubbles: true }));
};

const preventTabPress = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;
  event?.preventDefault();
};

const handleRatingBadgeClick = (event: Event) => {
  const target = event.target as HTMLLinkElement;
  let id: string;
  const openLink = () => window.open(`https://www.imdb.com/title/${id}/`);
  if (target.classList.contains('card__rating')) {
    id = target.parentElement?.parentElement?.id!;
    openLink();
  }
  if (target.classList.contains('row__rating')) {
    id = target.parentElement?.parentElement?.dataset.id!;
    openLink();
  }
  if (target.classList.contains('modal-rating')) {
    id = target.parentElement?.dataset.id!;
    openLink();
  }
};

init();
getUpcomingTMDB()
  .then((res) => {
    res.results
      .forEach(async (movie: any) => {
        const tmdb = await getTMDBdata(movie.id);
        const omdb = await getOMDBdata(tmdb.imdb_id);
        const slide = createSlide(omdb);
        swiper.movies.appendSlide(slide);
        storage.saveMovie(omdb);
        addRatingToSlide(slide, omdb);
      });
  })
  .then(() => wait(150))
  .then(() => document.querySelector('#movies')?.classList.add('show'))
  .then(() => reloadFavorites());

searchBtn.addEventListener('click', handleSearchClick);
menu.addEventListener('click', handleMenuClick);
input.addEventListener('keypress', handleEnterPress);
document.addEventListener('click', handleSlideFavButtonClick);
themeSwitch.addEventListener('click', toggleTheme);
document.addEventListener('click', showMovieModal);

settingsButton.addEventListener('click', showSettingsModal);
settingsModal.querySelector('#effectSelect')!.addEventListener('change', toggleSwiperEffect);
settingsModal.querySelector('#paginationSelect')!.addEventListener('change', toggleSwiperPaginationType);
settingsModal.querySelector('#keyboardControl')!.addEventListener('change', toggleKeyboardControl);
settingsModal.querySelector('#mouseControl')!.addEventListener('change', toggleMouseControl);
settingsModal.querySelector('#darkModeControl')!.addEventListener('change', toggleDarkModeAuto);
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);
document.querySelector('h1')!.addEventListener('mouseover', animateHeader);
document.querySelector('h1')!.addEventListener('mouseleave', removeHeaderAnimation);
document.addEventListener('click', handleRatingBadgeClick);
document.addEventListener('keydown', preventTabPress);
keyboardButton.addEventListener('click', () => {
  keyboardButton.classList.toggle('active');
  keyboard.toggleKeyboard();
});
document.querySelector('#off')!.addEventListener('click', () => {
  keyboardButton.classList.remove('active');
});
document.querySelector('#enter')!.addEventListener('click', () => searchBtn.dispatchEvent(new Event('click')));
window.addEventListener('resize', () => {
  if (window.innerWidth < 400) {
    keyboard.hideKeyboard();
    keyboardButton.classList.add('hidden');
    keyboardButton.classList.remove('active');
  } else {
    keyboardButton.classList.remove('hidden');
  }
});

swiper.movies.on('activeIndexChange', handleNextSearchPageLoad);
if (swiperParams.keyboard) document.addEventListener('keydown', handleTabKeyress);

alertFavObserver.observe(favoritesWrapper as Node, { childList: true });
top101observer.observe(top101 as Node, {
  childList: true,
  attributes: true,
});

export {
  state, storage, swiper, settingsButton, handleNextSearchPageLoad,
  reloadFavorites, wait, setAlertMessage, createSlide, addRatingToSlide,
};
