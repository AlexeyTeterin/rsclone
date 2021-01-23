import 'normalize.css';
import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swiper from 'swiper/bundle';
import swiperParams from './swiperParams';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import {
  getOMDBdata,
  searchMoviesOMDB,
  MovieData,
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

const moviesSwiper = new Swiper('.swiper-container.movies', swiperParams);
const favoritesSwiper = new Swiper('.swiper-container.favorites', swiperParams);
const searchBtn = document.querySelector('.search-button')!;
const input = <HTMLInputElement>document.querySelector('#movie-search');
const menu = document.querySelector('div.nav')!;
const tabs = Array.from(document.querySelectorAll('.tab-pane'));
const top101 = document.querySelector('#top101');
const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites');
const nightSwitch = document.querySelector('#nightSwitch') as HTMLInputElement;
const alertFavorites = document.querySelector('.alert.favorites');
let nightSwitchTooltip = new bootstrap.Tooltip(nightSwitch);

const wait = (ms: number) => new Promise((resolve: any) => setTimeout(() => resolve(), ms));

const createElement = (tag: string, className: string) => {
  const element = document.createElement(tag);
  element.classList.add(className);
  return element;
};

const toggleNightMode = () => {
  if (nightSwitch.checked) {
    nightSwitch.title = 'Turn off the lights';
  }
  if (!nightSwitch.checked) {
    nightSwitch.title = 'Turn on the light';
  }
  document.querySelector('html')?.classList.toggle('bg-dark', !nightSwitch.checked);
  document.querySelector('header>h1')?.classList.toggle('text-light');

  document.querySelectorAll('.swiper-pagination')
    .forEach((swiper) => swiper.classList.toggle('text-light'));
  document.querySelector('#top101')?.classList.toggle('text-light');
  document.querySelector('.film')?.classList.toggle('invert');
  document.querySelector('footer .rsschool')?.classList.toggle('invert');
  nightSwitchTooltip.dispose();
  nightSwitchTooltip = new bootstrap.Tooltip(nightSwitch);

  const storage = JSON.parse(localStorage.VideoBox);
  storage.darkMode = !nightSwitch.checked;
  localStorage.VideoBox = JSON.stringify(storage);
};

const initStorage = () => {
  if (!localStorage.VideoBox) {
    localStorage.setItem('VideoBox', JSON.stringify({
      Movies: {}, Favorites: {}, darkMode: false,
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

const createSlide = (data: SearchResult) => {
  const storage = JSON.parse(localStorage.VideoBox);
  const slide = createElement('div', 'swiper-slide');
  const card = createElement('div', 'card');
  const cardTitle = createElement('div', 'card__title');
  const cardPoster = createElement('div', 'card__poster');
  const cardRating = createElement('div', 'card__rating');
  const cardFavButton = createElement('button', 'card__fav');
  const cardIsFav = Object.keys(storage.Favorites)
    .findIndex((el: string) => el === data.imdbID) >= 0;
  const cardInfo = createElement('div', 'card__info');
  const cardInfoButton = createElement('button', 'card__info-button');

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

  cardRating.classList.add('badge', 'bg-warning', 'text-dark');
  cardFavButton.classList.toggle('isFav', cardIsFav);
  cardPoster.append(cardRating, cardFavButton);
  cardInfoButton.textContent = 'Learn more';
  cardInfoButton.classList.add('btn', 'btn-warning');
  cardInfo.append(cardInfoButton);
  card.append(cardTitle, cardPoster, cardInfo);
  slide.append(card);
  return slide;
};

const addMovieToLocalStorage = (data: MovieData) => {
  const storage = JSON.parse(localStorage.getItem('VideoBox')!);
  if (!storage.Movies[data.imdbID]) {
    storage.Movies[data.imdbID] = data;
    localStorage.VideoBox = JSON.stringify(storage);
  }
};

const addRatingToSlide = (card: HTMLElement, data: MovieData) => {
  const imdbRating = data.Ratings
    .find((r: RatingsArray) => r.Source === 'Internet Movie Database');
  const cardRating = card.querySelector('.card__rating')!;
  cardRating.textContent = imdbRating ? `${imdbRating.Value.slice(0, -3)}` : 'n/a';
};

const loadFavorites = () => {
  const storage = JSON.parse(localStorage.VideoBox);
  favoritesSwiper.removeAllSlides();
  Object.values(storage.Favorites).forEach((movie) => {
    const slide = createSlide(movie as SearchResult);
    addRatingToSlide(slide, movie as MovieData);
    favoritesSwiper.appendSlide(slide);
    favoritesSwiper.updateSlides();
    favoritesSwiper.update();
  });
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
    addMovieToLocalStorage(omdb);
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

  Array.from(menu.children).forEach((link) => {
    link.classList.remove('disabled');
  });
  target.classList.add('disabled');
  animateTabChange(currentTab, targetTab);

  if (currentTab?.id === 'top101') currentTab?.classList.add('visually-hidden');
  if (targetTab?.id === 'top101') targetTab?.classList.remove('visually-hidden');
  favoritesSwiper.updateSlides();
  favoritesSwiper.update();
};

const handleEnterPress = (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return;
  searchBtn.dispatchEvent(new Event('click', { bubbles: true }));
};

const toggleCardFavButton = (id: string) => {
  const storage = JSON.parse(localStorage.VideoBox);
  const card = Array.from(moviesSwiper.slides)
    .find((el) => el.querySelector('.card')?.id === id);
  const isFav = Object.keys(storage.Favorites)
    .findIndex((el) => el === id) >= 0;
  card?.querySelector('.card__fav')!.classList.toggle('isFav', isFav);
};

const handleFavClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.classList.contains('card__fav')) return;
  const id = target.parentElement?.parentElement?.id!;
  const storage = JSON.parse(localStorage.VideoBox);
  const cardIsFav = Object.keys(storage.Favorites).find((el: string) => el === id);

  if (cardIsFav) delete storage.Favorites[id];
  if (!cardIsFav) storage.Favorites[id] = storage.Movies[id];

  target.classList.toggle('isFav', !cardIsFav);
  localStorage.VideoBox = JSON.stringify(storage);

  loadFavorites();
  toggleCardFavButton(id);
};

const createTop101Element = async (movie: any) => {
  console.log(movie);
  const row = createElement('div', 'top101-row');
  const position = createElement('div', 'row__position');
  const title = createElement('div', 'row__title');
  const poster = createElement('div', 'row__poster');
  const rating = createElement('div', 'row__rating');
  rating.classList.add('badge', 'bg-warning', 'text-dark');
  const infoButton = createElement('button', 'row__info-button');
  // const favButton = createElement('button', 'card__fav');

  position.textContent = `${top101?.children.length! + 1}`;
  title.textContent = `${movie.title}`;
  infoButton.textContent = 'Learn more';
  infoButton.classList.add('btn', 'btn-warning');
  poster.append(rating);
  row.append(position, poster, title, infoButton);
  top101?.append(row);

  const tmdbData = await getTMDBdata(movie.id);
  const omdbData: MovieData = await getOMDBdata(tmdbData.imdb_id);
  // console.log(omdbData);
  row.dataset.id = omdbData.imdbID;
  title.textContent += `, ${omdbData.Year}`;
  rating.textContent = `${movie.vote_average}`;
  poster.style.setProperty('background-image', `url(${omdbData.Poster})`);
};

const appendTop101NextPage = async () => {
  const getTop101Page = async (page: number = 1) => {
    const top = await getTopRatedTMDB(page);
    return top;
  };
  const movies = await getTop101Page(state.top101page);
  if (!movies.length) {
    top101?.classList.add('top101');
  }
  movies.forEach((movie) => createTop101Element(movie));
};

const top101observer = new MutationObserver(() => {
  if (top101?.children.length! < 100) {
    state.top101page += 1;
    appendTop101NextPage();
  }
});

const alertFavObserver = new MutationObserver((mutationRecords) => {
  mutationRecords.forEach((record) => {
    if (record.target.hasChildNodes()) alertFavorites?.classList.add('visually-hidden');
    else alertFavorites?.classList.remove('visually-hidden');
  });
});

initStorage();
loadFavorites();
input.focus();
getUpcomingTMDB()
  .then((res) => {
    res.results
      .forEach(async (movie: any) => {
        const tmdb = await getTMDBdata(movie.id);
        const omdb = await getOMDBdata(tmdb.imdb_id);
        const slide = createSlide(omdb);
        moviesSwiper.appendSlide(slide);
        addMovieToLocalStorage(omdb);
        addRatingToSlide(slide, omdb);
      });
  })
  .then(() => wait(150))
  .then(() => document.querySelector('#movies')?.classList.add('show'));

searchBtn.addEventListener('click', handleSearchClick);
menu.addEventListener('click', handleMenuClick);
input.addEventListener('keypress', handleEnterPress);
document.addEventListener('click', handleFavClick);
nightSwitch.addEventListener('click', toggleNightMode);
moviesSwiper.on('activeIndexChange', () => {
  const { activeIndex, slides } = moviesSwiper;
  if (slides.length - activeIndex === 6 && state.request) {
    state.page += 1;
    loadNextSearchPage();
  }
});
top101observer.observe(top101 as Node, {
  childList: true,
  attributes: true,
});
alertFavObserver.observe(favoritesWrapper as Node, { childList: true });
