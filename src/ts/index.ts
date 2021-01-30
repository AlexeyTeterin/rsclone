import 'normalize.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swiper from 'swiper/bundle';
import swiperParams from './swiperParams';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import {
  getOMDBdata, searchMoviesOMDB, OMDBMovieData, SearchResult, RatingsArray,
  getUpcomingTMDB, getTMDBdata, OMDBSearchResponce,
} from './movieData';
import {
  handleTabKeyress, settingsModal, showSettingsModal,
  toggleDarkModeAuto, toggleKeyboardControl, toggleMouseControl,
  toggleSwiperEffect, toggleSwiperPaginationType,
} from './settingsModal';
import Storage from './Storage';
import { isDarkMode, themeSwitch, toggleTheme } from './theme';
import { showMovieModal } from './movieModal';
import { top101, top101observer } from './top101';
import { loadFoundSlides, handleSearchClick, input } from './search';

const state = {
  page: 0,
  request: '',
  top101page: 1,
};

const storage = new Storage();
const swiper = {
  movies: new Swiper('.swiper-container.movies', swiperParams),
  favorites: new Swiper('.swiper-container.favorites', swiperParams),
};
const searchBtn = document.querySelector('.search-button')!;
const menu = document.querySelector('div.nav')!;
const tabs = Array.from(document.querySelectorAll('.tab-pane'));
const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites')!;
const settingsButton = document.querySelector('#settings')!;
const alertFavorites = document.querySelector('.alert.favorites');

const wait = (ms: number) => new Promise((resolve: any) => setTimeout(() => resolve(), ms));

const createElement = (tag: string, ...classNames: Array<string>) => {
  const element = document.createElement(tag);
  classNames.forEach((className) => element.classList.add(className));
  return element;
};

const showControls = () => {
  settingsButton.classList.add('visible');
  themeSwitch.parentElement?.classList.add('visible');
};

const init = () => {
  if (!localStorage.VideoBox) storage.save();
  else storage.load();

  if ((!storage.darkModeAuto && storage.darkMode) || (storage.darkModeAuto && isDarkMode)) {
    themeSwitch.checked = false;
    toggleTheme();
  } else themeSwitch.checked = true;

  wait(1000).then(() => showControls());
};

const createFavButton = (movie: SearchResult, className: string) => {
  storage.load();
  const favButton = createElement('button', className);
  const isFav = Object.keys(storage.Favorites)
    .findIndex((el: string) => el === movie.imdbID) >= 0;
  favButton.classList.toggle('isFav', isFav);
  return favButton;
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

const saveMovieToLocalStorage = (data: OMDBMovieData) => {
  storage.load();
  if (!storage.Movies[data.imdbID]) {
    storage.Movies[data.imdbID] = data;
    storage.save();
  }
};

const addRatingToSlide = (card: HTMLElement, data: OMDBMovieData) => {
  const imdbRating = data.Ratings
    .find((r: RatingsArray) => r.Source === 'Internet Movie Database');
  const cardRating = card.querySelector('.card__rating')!;
  cardRating.textContent = imdbRating ? `${imdbRating.Value.slice(0, -3)}` : 'n/a';
};

const animateTabChange = (current: Element | undefined, target: Element | undefined) => {
  current?.classList.remove('show');
  wait(150).then(() => {
    current?.classList.remove('active');
    target?.classList.add('active');
  });
  wait(200).then(() => target?.classList.add('show'));
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

const loadNextSearchPage = () => {
  searchMoviesOMDB(state.request, state.page)
    .then((res) => {
      if (res.Error) {
        setAlertMessage(res);
        return;
      }
      loadFoundSlides(res);
    });
};

const handleMenuClick = (event: Event) => {
  const target = event.target! as HTMLElement;
  if (!target.classList.contains('nav-link')) return;
  const targetTab = tabs
    .find((tab) => tab instanceof HTMLElement && target.id.indexOf(tab.dataset.id!) >= 0);
  const currentTab = tabs
    .find((tab) => tab instanceof HTMLElement && tab.classList.contains('active'));

  Array.from(menu.children).forEach((link) => link.classList.remove('disabled'));
  target.classList.add('disabled');
  animateTabChange(currentTab, targetTab);

  if (currentTab?.id === 'top101') currentTab?.classList.add('visually-hidden');
  if (targetTab?.id === 'top101') targetTab?.classList.remove('visually-hidden');
};

const handleEnterPress = (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return;
  searchBtn.dispatchEvent(new Event('click', { bubbles: true }));
};

const preventTabPress = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;
  event?.preventDefault();
};

const toggleMovieCardIsFav = (id: string, isFav: boolean) => {
  const targetCard = Array.from(swiper.movies.slides)
    .find((el) => el.querySelector('.card')?.id === id);
  targetCard?.querySelector('.card__fav')!.classList.toggle('isFav', isFav);
};

const toggleTop101CardIsFav = (id: string, isFav: boolean) => {
  const targetCard = Array.from(top101!.children)
    .find((el) => {
      const card = el as HTMLElement;
      return (card.dataset.id! === id) ? card : null;
    });
  targetCard?.querySelector('.row__fav')?.classList.toggle('isFav', isFav);
};

const reloadFavorites = () => {
  storage.load();
  favoritesWrapper.innerHTML = '';

  Object.values(storage.Favorites).forEach((savedMovie) => {
    const slide = createSlide(savedMovie as SearchResult);
    addRatingToSlide(slide, savedMovie as OMDBMovieData);
    swiper.favorites.appendSlide(slide);
  });

  if (favoritesWrapper?.childElementCount) alertFavorites?.classList.add('visually-hidden');
};

const updateFavorites = (target: HTMLElement) => {
  const targetSwiper = target.parentElement?.parentElement?.parentElement?.parentElement;
  const favoritesTabActive = targetSwiper?.classList.contains('favorites');
  if (favoritesTabActive) {
    target.parentElement?.parentElement?.style.setProperty('opacity', '0');
    wait(500).then(() => reloadFavorites());
  } else reloadFavorites();
};

const handleSlideFavButtonClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.classList.contains('card__fav') && !target.classList.contains('row__fav')) return;

  storage.load();
  const id: string = target.parentElement!.parentElement!.id!
    || target.parentElement!.parentElement!.dataset.id!;
  const cardIsFav: boolean = Object.keys(storage.Favorites)
    .findIndex((el: string) => el === id) >= 0;

  if (cardIsFav) delete storage.Favorites[id];
  if (!cardIsFav) storage.Favorites[id] = storage.Movies[id];

  target.classList.toggle('isFav', !cardIsFav);
  storage.save();

  toggleMovieCardIsFav(id, !cardIsFav);
  toggleTop101CardIsFav(id, !cardIsFav);
  updateFavorites(target);
};

const handleNextSearchPageLoad = () => {
  const { activeIndex, slides } = swiper.movies;
  if (slides.length - activeIndex === 7 && state.request) {
    state.page += 1;
    loadNextSearchPage();
  }
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

const alertFavObserver = new MutationObserver((mutationRecords) => {
  mutationRecords.forEach((record) => {
    if (record.target.hasChildNodes()) alertFavorites?.classList.add('visually-hidden');
    else alertFavorites?.classList.remove('visually-hidden');
  });
});

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
        saveMovieToLocalStorage(omdb);
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
  createElement, saveMovieToLocalStorage, createFavButton,
};
