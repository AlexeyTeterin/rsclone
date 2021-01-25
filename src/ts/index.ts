import 'normalize.css';
import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swiper, { EffectCoverflow } from 'swiper/bundle';
import swiperParams from './swiperParams';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import {
  getOMDBdata,
  searchMoviesOMDB,
  OMDBMovieData,
  SearchResult,
  RatingsArray,
  getUpcomingTMDB,
  getTMDBdata,
  OMDBSearchResponce,
  getTopRatedTMDB,
} from './movieData';

const state = {
  page: 0,
  request: '',
  top101page: 1,
};

swiperParams.effect = JSON.parse(localStorage.VideoBox).effect;
let moviesSwiper = new Swiper('.swiper-container.movies', swiperParams);
const favoritesSwiper = new Swiper('.swiper-container.favorites', swiperParams);
const searchBtn = document.querySelector('.search-button')!;
const input = <HTMLInputElement>document.querySelector('#movie-search');
const menu = document.querySelector('div.nav')!;
const tabs = Array.from(document.querySelectorAll('.tab-pane'));
const top101 = document.querySelector('#top101');
const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites')!;
const nightSwitch = document.querySelector('#nightSwitch') as HTMLInputElement;
const alertFavorites = document.querySelector('.alert.favorites');
let nightSwitchTooltip = new bootstrap.Tooltip(nightSwitch);
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

const toggleNightMode = () => {
  if (nightSwitch.checked) nightSwitch.title = 'Turn off the lights';
  if (!nightSwitch.checked) nightSwitch.title = 'Turn on the light';

  const toggleClassOfElement = (selectorName: string, ...classNames: Array<string>) => {
    classNames.forEach((className) => document.querySelector(selectorName)?.classList
      .toggle(className, !nightSwitch.checked));
  };

  toggleClassOfElement('html', 'bg-dark');
  toggleClassOfElement('header', 'text-light');
  toggleClassOfElement('#modal .modal-content', 'dark', 'text-light');
  toggleClassOfElement('#settingsModal .modal-content', 'dark', 'text-light');
  toggleClassOfElement('#top101', 'text-light');
  toggleClassOfElement('.film', 'invert');
  toggleClassOfElement('footer .rsschool', 'invert');

  document.querySelectorAll('.swiper-pagination')
    .forEach((swiper) => swiper.classList.toggle('text-light', !nightSwitch.checked));

  nightSwitchTooltip.dispose();
  nightSwitchTooltip = new bootstrap.Tooltip(nightSwitch);

  const storage = JSON.parse(localStorage.VideoBox);
  storage.darkMode = !nightSwitch.checked;
  localStorage.VideoBox = JSON.stringify(storage);
};

const init = () => {
  if (!localStorage.VideoBox) {
    localStorage.setItem('VideoBox', JSON.stringify({
      Movies: {},
      Favorites: {},
      darkMode: false,
      effect: 'coverflow',
    }));
  } else {
    const storage = JSON.parse(localStorage.VideoBox);
    if (storage.darkMode) {
      nightSwitch.checked = false;
      toggleNightMode();
    } else nightSwitch.checked = true;
    wait(500).then(() => nightSwitch.parentElement?.classList.add('visible'));
  }
};

const createFavButton = (movie: SearchResult, className: string) => {
  const storage = JSON.parse(localStorage.VideoBox);
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
  const cardRating = createElement('div', 'card__rating', 'badge', 'bg-warning', 'text-dark');
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
  const storage = JSON.parse(localStorage.getItem('VideoBox')!);
  if (!storage.Movies[data.imdbID]) {
    storage.Movies[data.imdbID] = data;
    localStorage.VideoBox = JSON.stringify(storage);
  }
};

const addRatingToSlide = (card: HTMLElement, data: OMDBMovieData) => {
  const imdbRating = data.Ratings
    .find((r: RatingsArray) => r.Source === 'Internet Movie Database');
  const cardRating = card.querySelector('.card__rating')!;
  cardRating.textContent = imdbRating ? `${imdbRating.Value.slice(0, -3)}` : 'n/a';
};

const reloadFavorites = () => {
  const storage = JSON.parse(localStorage.VideoBox);
  favoritesWrapper.innerHTML = '';

  Object.values(storage.Favorites).forEach((savedMovie) => {
    const slide = createSlide(savedMovie as SearchResult);
    addRatingToSlide(slide, savedMovie as OMDBMovieData);
    favoritesSwiper.appendSlide(slide);
  });

  if (favoritesWrapper?.childElementCount) alertFavorites?.classList.add('visually-hidden');
};

const animateTabChange = (current: Element | undefined, target: Element | undefined) => {
  current?.classList.remove('show');
  wait(150).then(() => {
    current?.classList.remove('active');
    target?.classList.add('active');
  });
  wait(200).then(() => target?.classList.add('show'));
};

const toggleSearchSpinner = () => {
  const spinner = document.querySelector('button>span.spinner-border');
  const searchText = document.querySelector('button>span.search-text');
  spinner?.classList.toggle('visually-hidden');
  searchText?.classList.toggle('visually-hidden');
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

const loadSlides = (res: any) => {
  res.Search.forEach(async (movie: SearchResult) => {
    const omdb = await getOMDBdata(movie.imdbID);
    const slide = createSlide(omdb);
    moviesSwiper.appendSlide(slide);
    saveMovieToLocalStorage(omdb);
    addRatingToSlide(slide, omdb);
  });
};

const handleSearchClick = () => {
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
      loadSlides(res);
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
      loadSlides(res);
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

const toggleMovieCardFavButton = (id: string, isFav: boolean) => {
  const targetCard = Array.from(moviesSwiper.slides)
    .find((el) => el.querySelector('.card')?.id === id);
  targetCard?.querySelector('.card__fav')!.classList.toggle('isFav', isFav);
};

const toggleTop101CardFavButton = (id: string, isFav: boolean) => {
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

const handleFavClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.classList.contains('card__fav') && !target.classList.contains('row__fav')) return;

  const id: string = target.parentElement!.parentElement!.id!
    || target.parentElement!.parentElement!.dataset.id!;
  const storage = JSON.parse(localStorage.VideoBox);
  const cardIsFav: boolean = Object.keys(storage.Favorites)
    .findIndex((el: string) => el === id) >= 0;
  console.log(id, cardIsFav);

  if (cardIsFav) delete storage.Favorites[id];
  if (!cardIsFav) storage.Favorites[id] = storage.Movies[id];

  target.classList.toggle('isFav', !cardIsFav);
  localStorage.VideoBox = JSON.stringify(storage);

  toggleMovieCardFavButton(id, !cardIsFav);
  toggleTop101CardFavButton(id, !cardIsFav);
  updateFavorites(target);
};

const showMovieModal = (event: Event) => {
  const target = event.target as HTMLElement;
  const targetIsLearnMoreBtn = target.classList.contains('card__info-button') || target.classList.contains('row__info-button');
  if (!targetIsLearnMoreBtn) return;

  const storage = JSON.parse(localStorage.VideoBox);
  const { id } = target.dataset;
  const data: OMDBMovieData = storage.Movies[id!];

  movieModal.querySelector('#modalTitle')!.textContent = `${data.Title}, ${data.Year}`;
  const modalBody = movieModal.querySelector('.modal-body')! as HTMLElement;
  modalBody.innerHTML = '';
  const poster = createElement('img', 'modal-poster', 'rounded', 'mx-auto', 'd-block') as HTMLImageElement;
  poster.src = data.Poster;

  const releaseDate = createElement('p');
  releaseDate.innerHTML = `<b>Release date:</b> ${data.Released}`;

  const director = createElement('p');
  director.innerHTML = `<b>Director:</b> ${data.Director}`;

  const actors = createElement('p');
  actors.innerHTML = `<b>Actors:</b> ${data.Actors}`;

  const plot = createElement('p', 'lh-sm', 'fst-italic', 'text-center', 'text-plot');
  plot.innerHTML = `${data.Plot}`;

  const imdbRating = createElement('p');
  imdbRating.innerHTML = `<b>IMDB Rating:</b> <span class="badge bg-warning text-dark">${data.imdbRating}</span> (${data.imdbVotes} votes)`;

  const runtime = createElement('p');
  runtime.innerHTML = `<b>Runtime:</b> ${data.Runtime}`;

  modalBody.append(poster, plot, releaseDate, director, actors, imdbRating, runtime);
  movieModalBS.toggle();
};

const showSettingsModal = () => {
  const storage = JSON.parse(localStorage.VideoBox);
  const activeEffect = swiperParams.effect;
  const radioSlide = settingsModal.querySelector('#radio-slide')! as HTMLInputElement;
  const radioCoverflow = settingsModal.querySelector('#radio-coverflow')! as HTMLInputElement;
  if (activeEffect === 'slide') {
    radioSlide.checked = true;
    radioCoverflow.checked = false;
  } else {
    radioSlide.checked = false;
    radioCoverflow.checked = true;
  }

  localStorage.setItem('VideoBox', JSON.stringify(storage));
  settingsModalBS.toggle();
};

const handleEffectChange = (event: Event) => {
  const targetBtn = event.target as HTMLElement;
  if (!targetBtn.classList.contains('btn')) return;
  if (targetBtn.classList.contains('close')) return;

  const storage = JSON.parse(localStorage.VideoBox);
  const targetRadio = settingsModal.querySelector(`#${targetBtn.getAttribute('for')}`);
  const targetEffect: any = targetRadio?.id.substr(6);
  swiperParams.effect = targetEffect;

  moviesSwiper.destroy();
  moviesSwiper = new Swiper('.swiper-container.movies', swiperParams);

  favoritesSwiper.params.effect = targetEffect;
  reloadFavorites();

  storage.effect = targetEffect;
  localStorage.VideoBox = JSON.stringify(storage);
};

const createTop101Element = async (movie: any) => {
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
document.addEventListener('click', handleFavClick);
nightSwitch.addEventListener('click', toggleNightMode);
moviesSwiper.on('activeIndexChange', () => {
  const { activeIndex, slides } = moviesSwiper;
  if (slides.length - activeIndex === 7 && state.request) {
    state.page += 1;
    loadNextSearchPage();
  }
});
document.addEventListener('click', showMovieModal);
document.querySelector('#settings')!.addEventListener('click', showSettingsModal);
settingsModal.addEventListener('click', handleEffectChange);

alertFavObserver.observe(favoritesWrapper as Node, { childList: true });
top101observer.observe(top101 as Node, {
  childList: true,
  attributes: true,
});
