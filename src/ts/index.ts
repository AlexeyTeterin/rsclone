import 'normalize.css';
import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swiper, { SwiperOptions } from 'swiper/bundle';
import { PaginationOptions } from 'swiper/types/components/pagination';
import swiperParams from './swiperParams';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import {
  getOMDBdata, searchMoviesOMDB, OMDBMovieData, SearchResult, RatingsArray,
  getUpcomingTMDB, getTMDBdata, OMDBSearchResponce, getTopRatedTMDB,
} from './movieData';

const state = {
  page: 0,
  request: '',
  top101page: 1,
};

let storage: any;
const getStorage = () => {
  storage = JSON.parse(localStorage.VideoBox);
};
const saveStorage = () => {
  localStorage.VideoBox = JSON.stringify(storage);
};
let pagination = swiperParams.pagination as PaginationOptions;
let moviesSwiper = new Swiper('.swiper-container.movies', swiperParams);
let favoritesSwiper = new Swiper('.swiper-container.favorites', swiperParams);
const searchBtn = document.querySelector('.search-button')!;
const input = <HTMLInputElement>document.querySelector('#movie-search');
const menu = document.querySelector('div.nav')!;
const tabs = Array.from(document.querySelectorAll('.tab-pane'));
const top101 = document.querySelector('#top101');
const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites')!;
const themeSwitch = document.querySelector('#themeSwitch') as HTMLInputElement;
const settingsButton = document.querySelector('#settings')!;
const alertFavorites = document.querySelector('.alert.favorites');
const movieModal = document.getElementById('modal')!;
const movieModalBS = new bootstrap.Modal(movieModal, { keyboard: true });
const settingsModal = document.querySelector('#settingsModal')!;
const settingsModalBS = new bootstrap.Modal(settingsModal, {});

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
  toggleElementClasses('footer .rsschool', 'invert');

  getStorage();
  storage.darkMode = !themeSwitch.checked;
  saveStorage();
};

const showControls = () => {
  settingsButton.classList.add('visible');
  themeSwitch.parentElement?.classList.add('visible');
};

const init = () => {
  if (!localStorage.VideoBox) {
    localStorage.setItem('VideoBox', JSON.stringify({
      Movies: {},
      Favorites: {},
      darkMode: false,
      effect: 'coverflow',
      pagination: 'fraction',
      keyboardControl: true,
      mouseControl: true,
    }));
  } else {
    getStorage();
    if (storage.darkMode) {
      themeSwitch.checked = false;
      toggleTheme();
    } else themeSwitch.checked = true;
  }
  wait(1000).then(() => showControls());
};

const createFavButton = (movie: SearchResult, className: string) => {
  getStorage();
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
  getStorage();
  if (!storage.Movies[data.imdbID]) {
    storage.Movies[data.imdbID] = data;
    saveStorage();
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
    moviesSwiper.appendSlide(slide);
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
      moviesSwiper.removeAllSlides();
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

const handleTabKeyress = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return;
  const nav = document.querySelector('#nav')!.children;
  const activeTabIndex = [].findIndex.call(nav, (tab: HTMLElement) => tab.classList.contains('active'));
  const lastTabActive = nav.length - activeTabIndex === 1;
  const nextTabIndex = (lastTabActive) ? 0 : activeTabIndex + 1;

  nav[nextTabIndex].dispatchEvent(new Event('click', { bubbles: true }));
};

const toggleMovieCardIsFav = (id: string, isFav: boolean) => {
  const targetCard = Array.from(moviesSwiper.slides)
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

  getStorage();
  const id: string = target.parentElement!.parentElement!.id!
    || target.parentElement!.parentElement!.dataset.id!;
  const cardIsFav: boolean = Object.keys(storage.Favorites)
    .findIndex((el: string) => el === id) >= 0;

  if (cardIsFav) delete storage.Favorites[id];
  if (!cardIsFav) storage.Favorites[id] = storage.Movies[id];

  target.classList.toggle('isFav', !cardIsFav);
  saveStorage();

  toggleMovieCardIsFav(id, !cardIsFav);
  toggleTop101CardIsFav(id, !cardIsFav);
  updateFavorites(target);
};

const showMovieModal = (event: Event) => {
  const target = event.target as HTMLElement;
  const targetIsLearnMoreBtn = target.classList.contains('card__info-button') || target.classList.contains('row__info-button');
  if (!targetIsLearnMoreBtn) return;

  getStorage();
  const { id } = target.dataset;
  const data: OMDBMovieData = storage.Movies[id!];
  const modalBody = movieModal.querySelector('.modal-body')! as HTMLElement;
  const poster = createElement('img', 'modal-poster', 'rounded', 'mx-auto', 'd-block') as HTMLImageElement;
  const releaseDate = createElement('p');
  const director = createElement('p');
  const actors = createElement('p');
  const plot = createElement('p', 'lh-sm', 'fst-italic', 'text-center', 'text-plot');
  const imdbRating = createElement('p');
  const runtime = createElement('p');

  movieModal.querySelector('#modalTitle')!.textContent = `${data.Title}, ${data.Year}`;
  modalBody.innerHTML = '';
  poster.src = data.Poster;
  releaseDate.innerHTML = `<b>Release date:</b> ${data.Released}`;
  director.innerHTML = `<b>Director:</b> ${data.Director}`;
  actors.innerHTML = `<b>Actors:</b> ${data.Actors}`;
  plot.innerHTML = `${data.Plot}`;
  imdbRating.dataset.id = data.imdbID;
  imdbRating.innerHTML = `<b>IMDB Rating:</b> <span class="badge bg-warning text-dark modal-rating">${data.imdbRating}</span> (${data.imdbVotes} votes)`;
  runtime.innerHTML = `<b>Runtime:</b> ${data.Runtime}`;

  modalBody.append(poster, plot, releaseDate, director, actors, imdbRating, runtime);
  movieModalBS.toggle();
};

const showSettingsModal = () => {
  getStorage();
  const activeEffect = storage.effect;
  const activePaginationType = storage.pagination;
  const { keyboardControl, mouseControl } = storage;
  const optionSlide = settingsModal.querySelector('#option-slide')! as HTMLOptionElement;
  const optionCoverflow = settingsModal.querySelector('#option-coverflow')! as HTMLOptionElement;
  const optionFraction = settingsModal.querySelector('#option-fraction')! as HTMLOptionElement;
  const optionBullets = settingsModal.querySelector('#option-bullets')! as HTMLOptionElement;
  const keyboardControlToggle = settingsModal.querySelector('#keyboardControl')! as HTMLInputElement;
  const mouseControlToggle = settingsModal.querySelector('#mouseControl')! as HTMLInputElement;

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

  settingsModalBS.toggle();
};

const handleNextSearchPageLoad = () => {
  const { activeIndex, slides } = moviesSwiper;
  if (slides.length - activeIndex === 7 && state.request) {
    state.page += 1;
    loadNextSearchPage();
  }
};

const updateMoviesSwiper = () => {
  moviesSwiper.destroy();
  moviesSwiper = new Swiper('.swiper-container.movies', swiperParams);
  moviesSwiper.on('activeIndexChange', handleNextSearchPageLoad);
};

const updateFavoritesSwiper = () => {
  favoritesSwiper.destroy();
  favoritesSwiper = new Swiper('.swiper-container.favorites', swiperParams);
};

const reloadFavorites = () => {
  getStorage();
  favoritesWrapper.innerHTML = '';

  Object.values(storage.Favorites).forEach((savedMovie) => {
    const slide = createSlide(savedMovie as SearchResult);
    addRatingToSlide(slide, savedMovie as OMDBMovieData);
    favoritesSwiper.appendSlide(slide);
  });

  if (favoritesWrapper?.childElementCount) alertFavorites?.classList.add('visually-hidden');
};

const toggleSwiperEffect = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (target.id !== 'effectSelect') return;

  getStorage();
  const targetEffect = target.value as SwiperOptions['effect'];
  swiperParams.effect = targetEffect;

  updateMoviesSwiper();
  // updateFavoritesSwiper();

  favoritesSwiper.params.effect = targetEffect;
  reloadFavorites();

  storage.effect = targetEffect;
  saveStorage();
};

const toggleSwiperPaginationType = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  if (target.id !== 'paginationSelect') return;

  document.querySelectorAll('.swiper-pagination')
    .forEach((el) => {
      const swiper = el;
      swiper.className = 'swiper-pagination';
    });
  const targetPaginationType = target.value as PaginationOptions['type'];
  pagination = moviesSwiper.params.pagination as PaginationOptions;
  pagination.type = targetPaginationType;

  moviesSwiper.params.pagination = pagination;
  moviesSwiper.pagination.init();
  moviesSwiper.pagination.render();
  moviesSwiper.pagination.update();

  favoritesSwiper.params.pagination = pagination;
  favoritesSwiper.pagination.init();
  favoritesSwiper.pagination.render();
  favoritesSwiper.pagination.update();

  swiperParams.pagination = pagination;
  getStorage();
  storage.pagination = targetPaginationType;
  saveStorage();
};

const toggleKeyboardControl = (event: Event) => {
  const target = event.target as HTMLInputElement;

  swiperParams.keyboard = target.checked;
  updateMoviesSwiper();
  updateFavoritesSwiper();
  reloadFavorites();

  if (target.checked) document.addEventListener('keydown', handleTabKeyress);
  if (!target.checked) document.removeEventListener('keydown', handleTabKeyress);

  storage.keyboardControl = target.checked;
  saveStorage();
};

const toggleMouseControl = (event: Event) => {
  const target = event.target as HTMLInputElement;

  swiperParams.mousewheel = target.checked;
  updateMoviesSwiper();
  updateFavoritesSwiper();
  reloadFavorites();

  storage.mouseControl = target.checked;
  saveStorage();
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

const createTop101Element = async (movie: any) => {
  if (top101!.children.length > 100) return;

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
};

const appendTop101NextPage = async () => {
  const getTop101Page = async (page: number = 1) => {
    const top = await getTopRatedTMDB(page);
    return top;
  };
  const movies = await getTop101Page(state.top101page);
  if (!movies.length) top101?.classList.add('top101');
  movies.forEach((movie) => createTop101Element(movie));
};

const top101observer = new MutationObserver(async () => {
  if (top101?.children.length! < 100) {
    state.top101page += 1;
    await appendTop101NextPage();
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
        moviesSwiper.appendSlide(slide);
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
document.querySelector('#effectSelect')!.addEventListener('change', toggleSwiperEffect);
document.querySelector('#paginationSelect')!.addEventListener('change', toggleSwiperPaginationType);
document.querySelector('#keyboardControl')!.addEventListener('change', toggleKeyboardControl);
document.querySelector('#mouseControl')!.addEventListener('change', toggleMouseControl);
moviesSwiper.on('activeIndexChange', handleNextSearchPageLoad);
document.addEventListener('click', handleRatingBadgeClick);
document.addEventListener('keydown', preventTabPress);
if (swiperParams.keyboard) document.addEventListener('keydown', handleTabKeyress);

alertFavObserver.observe(favoritesWrapper as Node, { childList: true });
top101observer.observe(top101 as Node, {
  childList: true,
  attributes: true,
});
