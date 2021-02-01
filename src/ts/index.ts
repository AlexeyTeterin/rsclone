import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swiper from 'swiper/bundle';
import swiperParams from './swiperParams';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import {
  getOMDBdata, OMDBMovieData, SearchResult, RatingsArray,
  getUpcomingTMDB, getTMDBdata, OMDBSearchResponce,
} from './movieData';
import {
  handleTabKeyress, settingsButton, settingsModal, showSettingsModal,
  toggleDarkModeAuto, toggleKeyboardControl, toggleMouseControl,
  toggleSwiperEffect, toggleSwiperPaginationType,
} from './settingsModal';
import Storage from './Storage';
import {
  animateHeader, applySystemTheme, isDarkMode, removeHeaderAnimation, themeSwitch, toggleTheme,
} from './theme';
import { showMovieModal } from './movieModal';
import { top101, top101observer } from './top101';
import {
  handleSearchClick, input, handleNextSearchPageLoad, searchBtn,
} from './search';
import {
  reloadFavorites, favoritesWrapper, createFavButton, handleSlideFavButtonClick, alertFavObserver,
} from './favorites';
import { handleMenuClick, menu } from './nav';

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

const init = () => {
  if (!localStorage.VideoBox) storage.save();
  else storage.load();

  if (storage.darkModeAuto && isDarkMode()) themeSwitch.checked = false;
  if ((!storage.darkModeAuto && storage.darkMode)) themeSwitch.checked = false;
  toggleTheme();

  wait(1000).then(() => showControls());
};

const createElement = (tag: string, ...classNames: Array<string>) => {
  const element = document.createElement(tag);
  classNames.forEach((className) => element.classList.add(className));
  return element;
};

const createSlide = (data: SearchResult) => {
  const slide = createElement('div', 'swiper-slide');
  const card = createElement('div', 'card');
  const cardTitle = createElement('div', 'card__title');
  const cardPoster = createElement('div', 'card__poster');
  const cardRating = createElement('div', 'card__rating', 'badge', 'bg-warning', 'badge-warning', 'text-dark');
  const cardFavButton = createFavButton(data, 'card__fav');
  const cardInfo = createElement('div', 'card__info');
  const cardInfoButton = createElement('button', 'card__info-button', 'btn', 'btn-warning');

  card.id = data.imdbID;
  cardTitle.textContent = `${data.Title}, ${data.Year}`;

  const img = document.createElement('img');
  img.src = data.Poster;
  img.onload = () => {
    cardPoster.style.setProperty('background-image', `url(${img.src})`);
    card.style.setProperty('opacity', '1');
  };
  img.onerror = () => {
    cardPoster.classList.add('no-image');
    card.style.setProperty('opacity', '1');
  };

  cardPoster.append(cardRating, cardFavButton);
  cardInfoButton.textContent = 'Learn more';
  cardInfoButton.dataset.id = data.imdbID;
  cardInfo.append(cardInfoButton);
  card.append(cardTitle, cardPoster, cardInfo);
  slide.append(card);
  return slide;
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
input.focus();
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

swiper.movies.on('activeIndexChange', handleNextSearchPageLoad);
document.addEventListener('click', handleRatingBadgeClick);
document.addEventListener('keydown', preventTabPress);
if (swiperParams.keyboard) document.addEventListener('keydown', handleTabKeyress);

alertFavObserver.observe(favoritesWrapper as Node, { childList: true });
top101observer.observe(top101 as Node, {
  childList: true,
  attributes: true,
});

export {
  state, storage, swiper, settingsButton, handleNextSearchPageLoad,
  reloadFavorites, wait, setAlertMessage, createSlide, addRatingToSlide,
  createElement,
};
