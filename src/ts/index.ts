import 'normalize.css';
import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swiper from 'swiper/bundle';
import swiperParams from './swiperParams';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import {
  getOMDBdata, searchMoviesOMDB, OMDBMovieData, SearchResult, RatingsArray,
  getUpcomingTMDB, getTMDBdata, OMDBSearchResponce, getTopRatedTMDB,
} from './movieData';
import {
  handleTabKeyress, settingsModal, showSettingsModal,
  toggleDarkModeAuto, toggleKeyboardControl, toggleMouseControl,
  toggleSwiperEffect, toggleSwiperPaginationType,
} from './settingsModal';
import Storage from './Storage';

const state = {
  page: 0,
  request: '',
  top101page: 1,
};

const storage = new Storage();
const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const swiper = {
  movies: new Swiper('.swiper-container.movies', swiperParams),
  favorites: new Swiper('.swiper-container.favorites', swiperParams),
};
const searchBtn = document.querySelector('.search-button')!;
const input = <HTMLInputElement>document.querySelector('#movie-search');
const menu = document.querySelector('div.nav')!;
const tabs = Array.from(document.querySelectorAll('.tab-pane'));
const top101 = document.querySelector('#top101')!;
const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites')!;
const themeSwitch = document.querySelector('#themeSwitch') as HTMLInputElement;
const settingsButton = document.querySelector('#settings')!;
const alertFavorites = document.querySelector('.alert.favorites');
const movieModal = document.getElementById('modal')!;
const movieModalBS = new bootstrap.Modal(movieModal, { keyboard: true });

const wait = (ms: number) => new Promise((resolve: any) => setTimeout(() => resolve(), ms));

const createElement = (tag: string, ...classNames: Array<string>) => {
  const element = document.createElement(tag);
  classNames.forEach((className) => element.classList.add(className));
  return element;
};

const toggleTheme = () => {
  const toggleElementClasses = (selectorName: string, ...classNames: Array<string>) => classNames
    .forEach((className) => document.querySelector(selectorName)?.classList
      .toggle(className, !themeSwitch.checked));

  toggleElementClasses('html', 'bg-dark');
  toggleElementClasses('header', 'text-light');
  toggleElementClasses('#modal .modal-content', 'dark', 'text-light');
  toggleElementClasses('#settingsModal .modal-content', 'dark', 'text-light');
  toggleElementClasses('#top101', 'text-light');
  toggleElementClasses('.film', 'invert');
  toggleElementClasses('footer', 'text-muted');

  storage.load();
  storage.darkMode = !themeSwitch.checked;
  storage.save();
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

const loadFoundSlides = (res: any) => {
  res.Search.forEach(async (movie: SearchResult) => {
    const omdb = await getOMDBdata(movie.imdbID);
    const slide = createSlide(omdb);
    swiper.movies.appendSlide(slide);
    saveMovieToLocalStorage(omdb);
    addRatingToSlide(slide, omdb);
  });
};

const handleSearchClick = () => {
  const toggleSearchSpinner = () => {
    const spinner = document.querySelector('button>span.spinner-border');
    const searchText = document.querySelector('button>span.search-text');
    spinner?.classList.toggle('visually-hidden');
    searchText?.classList.toggle('visually-hidden');
  };

  toggleSearchSpinner();
  document.querySelector('#movies')?.classList.remove('show');
  state.page = 1;
  state.request = input.value.trim();

  wait(150)
    .then(() => searchMoviesOMDB(state.request, state.page))
    .then((res) => {
      swiper.movies.removeAllSlides();
      if (res.Error) {
        setAlertMessage(res);
        return;
      }
      loadFoundSlides(res);
      setAlertMessage(res);
    })
    .then(() => document.querySelector('#movies-tab')?.dispatchEvent(new Event('click', { bubbles: true })))
    .then(toggleSearchSpinner);
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

export const reloadFavorites = () => {
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

const showMovieModal = (event: Event) => {
  const target = event.target as HTMLElement;
  const targetIsLearnMoreBtn = target.classList.contains('card__info-button') || target.classList.contains('row__info-button');
  if (!targetIsLearnMoreBtn) return;

  storage.load();
  const { id } = target.dataset;
  const data: OMDBMovieData = storage.Movies[id!];
  const modalBody = movieModal.querySelector('.modal-body')! as HTMLElement;
  const poster = createElement('img', 'modal-poster', 'rounded', 'mx-auto', 'd-block') as HTMLImageElement;
  const releaseDate = createElement('p');
  const country = createElement('p');
  const genre = createElement('p');
  const director = createElement('p');
  const actors = createElement('p');
  const plot = createElement('p', 'lh-sm', 'fst-italic', 'text-center', 'text-plot');
  const imdbRating = createElement('p');
  const runtime = createElement('p');
  const awards = createElement('p');
  const boxOffice = createElement('p');

  movieModal.querySelector('#modalTitle')!.textContent = `${data.Title}, ${data.Year}`;
  modalBody.innerHTML = '';
  poster.src = data.Poster;
  releaseDate.innerHTML = `<b>Release date:</b> ${data.Released}`;
  country.innerHTML = `<b>Country:</b> ${data.Country}`;
  genre.innerHTML = `<b>Genre:</b> ${data.Genre}`;
  director.innerHTML = `<b>Director:</b> ${data.Director}`;
  actors.innerHTML = `<b>Actors:</b> ${data.Actors}`;
  awards.innerHTML = `<b>Awards:</b> ${data.Awards}`;
  boxOffice.innerHTML = `<b>Box Office:</b> ${data.BoxOffice}`;
  plot.innerHTML = `${data.Plot}`;
  imdbRating.dataset.id = data.imdbID;
  imdbRating.innerHTML = `<b>IMDB Rating:</b> <span class="badge bg-warning text-dark modal-rating">${data.imdbRating}</span> (${data.imdbVotes} votes)`;
  runtime.innerHTML = `<b>Runtime:</b> ${data.Runtime}`;

  modalBody.append(poster, plot, releaseDate, country,
    genre, director, actors, imdbRating, runtime, awards, boxOffice);
  movieModalBS.toggle();
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

const createTop101Card = async (movie: any) => {
  const rowsNumber = top101!.children.length;
  if (rowsNumber === 101) return;

  const row = createElement('div', 'top101-row');
  const position = createElement('div', 'row__position');
  const title = createElement('div', 'row__title');
  const poster = createElement('div', 'row__poster');
  const rating = createElement('div', 'row__rating', 'badge', 'bg-warning', 'text-dark');
  const infoButton = createElement('button', 'row__info-button', 'btn', 'btn-warning');

  position.textContent = `${top101?.children.length! + 1}`;
  title.textContent = `${movie.title}`;
  infoButton.textContent = 'Learn more';

  row.append(position, poster, title, infoButton);
  top101?.append(row);

  const tmdbData = await getTMDBdata(movie.id);
  const omdbData: OMDBMovieData = await getOMDBdata(tmdbData.imdb_id);
  saveMovieToLocalStorage(omdbData);
  const favButton = createFavButton(omdbData, 'row__fav');
  poster.append(rating, favButton);
  row.dataset.id = omdbData.imdbID;
  row.dataset.rating = omdbData.imdbRating;
  infoButton.dataset.id = omdbData.imdbID;
  title.textContent += `, ${omdbData.Year}`;
  rating.textContent = `${omdbData.imdbRating}`;
  poster.style.setProperty('background-image', `url(${omdbData.Poster})`);

  if (rowsNumber > 95) {
    row.classList.add('ready');
    top101.classList.add('ready');
  }
};

const sortTop101 = () => {
  const rows = Array.from(top101.children);
  const sorted = rows.slice().sort((a: Element, b: Element) => {
    const el1 = a as HTMLElement; const el2 = b as HTMLElement;
    const rating1: number = +el1.dataset.rating!;
    const rating2: number = +el2.dataset.rating!;
    if (rating1 > rating2) return -1;
    if (rating2 > rating1) return 1;
    return 0;
  });
  rows.forEach((el: Element) => {
    const row = el as HTMLElement;
    row.style.setProperty('order', `${sorted.indexOf(row)}`);
    row.querySelector('.row__position')!.textContent = `${sorted.indexOf(row) + 1}`;
  });
  top101.classList.add('sorted');
};

const appendTop101NextPage = async () => {
  const getTop101Page = async (page: number = 1) => {
    const top = await getTopRatedTMDB(page);
    return top;
  };
  const movies = await getTop101Page(state.top101page);
  if (!movies.length) top101?.classList.add('top101');
  movies.forEach((movie) => createTop101Card(movie));
};

const top101observer = new MutationObserver(() => {
  const rows = Array.from(top101.children);

  if (rows.length! < 100) {
    state.top101page += 1;
    appendTop101NextPage();
  } else {
    const lastRowsReady = rows.slice(-5).filter((el: any) => el.classList.contains('ready')).length === 5;
    if (lastRowsReady && !top101.classList.contains('sorted')) sortTop101();
  }
});

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
  storage, swiper, settingsButton, handleNextSearchPageLoad,
};
