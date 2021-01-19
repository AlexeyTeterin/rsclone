import 'normalize.css';
import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  Swiper, SwiperOptions, Navigation, Pagination,
} from 'swiper';
import 'swiper/swiper-bundle.css';
import '../css/style.css';
import {
  getOMDBdata, searchMoviesOMDB, MovieData, SearchResult, RatingsArray,
  getUpcomingTMDB, getTMDBdata,
} from './movieData';

const searchBtn = document.querySelector('.search-button')!;
const input = <HTMLInputElement>document.querySelector('#movie-search');
const menu = document.querySelector('div.nav')!;
const tabs = Array.from(document.querySelectorAll('.tab-pane'));

Swiper.use([Navigation, Pagination]);
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
const moviesSwiper = new Swiper('.swiper-container.movies', swiperParams);
const favoritesSwiper = new Swiper('.swiper-container.favorites', swiperParams);

const initStorage = () => {
  if (!localStorage.VideoBox) {
    localStorage
      .setItem('VideoBox', JSON.stringify({ Movies: {}, Favorites: {} }));
  }
};

const createElement = (tag: string, className: string) => {
  const element = document.createElement(tag);
  element.classList.add(className);
  return element;
};

const createCard = (data: SearchResult) => {
  const storage = JSON.parse(localStorage.VideoBox);
  const slide = createElement('div', 'swiper-slide');
  const card = createElement('div', 'card');
  const cardTitle = createElement('div', 'card__title');
  const cardPoster = createElement('div', 'card__poster');
  const cardRating = createElement('div', 'card__rating');
  const cardFavButton = createElement('button', 'card__fav');
  const cardIsFav = Object.keys(storage.Favorites)
    .findIndex((el: string) => el === data.imdbID) >= 0;

  card.id = data.imdbID;
  cardTitle.textContent = `${data.Title}, ${data.Year}`;
  cardPoster.style.setProperty('background-image', `url(${data.Poster})`);
  cardFavButton.classList.toggle('isFav', cardIsFav);
  card.append(cardTitle, cardPoster, cardRating, cardFavButton);
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

const addRatingToCard = (card: HTMLElement, data: MovieData) => {
  const imdbRating = data.Ratings
    .find((r: RatingsArray) => r.Source === 'Internet Movie Database');
  const cardRating = card.querySelector('.card__rating')!;
  cardRating.textContent = imdbRating ? `IMDB: ${imdbRating.Value}` : 'n/a';
};

const loadFavorites = () => {
  const storage = JSON.parse(localStorage.VideoBox);
  favoritesSwiper.removeAllSlides();
  Object.values(storage.Favorites).forEach((movie) => {
    const card = createCard(movie as SearchResult);
    addRatingToCard(card, movie as MovieData);
    favoritesSwiper.appendSlide(card);
    favoritesSwiper.updateSlides();
  });
};

const createSlide = async (movie: SearchResult) => {
  const card = createCard(movie);
  const omdb = await getOMDBdata(movie.imdbID);
  moviesSwiper.appendSlide(card);
  addMovieToLocalStorage(omdb);
  addRatingToCard(card, omdb);
};

const handleSearchClick = () => {
  searchMoviesOMDB(input.value)
    .then((res) => {
      moviesSwiper.removeAllSlides();
      res.Search!.forEach(async (movie: SearchResult) => createSlide(movie));
      document.querySelector('#movies')!
        .dispatchEvent(new Event('click', { bubbles: true }));
    });
};

const animateTabChange = (current: Element | undefined, target: Element | undefined) => {
  current?.classList.remove('show');
  setTimeout(() => {
    current?.classList.remove('active');
    target?.classList.add('active');
  }, 150);
  setTimeout(() => {
    target?.classList.add('show');
  }, 200);
};

const handleMenuClick = (event: Event) => {
  const target = event.target! as HTMLElement;
  if (!target.classList.contains('nav-link')) return;
  const targetTab = tabs
    .find((tab) => tab instanceof HTMLElement && target.id.indexOf(tab.dataset.id!) >= 0);
  const currentTab = tabs
    .find((tab) => tab instanceof HTMLElement && tab.classList.contains('active'));

  Array.from(menu.children)
    .forEach((link) => link.classList.remove('disabled'));
  target.classList.add('disabled');
  animateTabChange(currentTab, targetTab);
};

const handleEnterPress = (event: KeyboardEvent) => {
  if (event.key !== 'Enter') return;
  searchBtn.dispatchEvent(new Event('click', { bubbles: true }));
};

const toggleCardFavButton = (id: string) => {
  const storage = JSON.parse(localStorage.VideoBox);
  const card = Array.from(moviesSwiper.slides).find((el) => el.querySelector('.card')?.id === id);
  const isFav = Object.keys(storage.Favorites)
    .findIndex((el) => el === id) >= 0;
  card?.querySelector('.card__fav')!.classList.toggle('isFav', isFav);
};

const handleFavClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.classList.contains('card__fav')) return;
  const id = target.parentElement!.id!;
  const storage = JSON.parse(localStorage.VideoBox);
  const cardIsFav = Object.keys(storage.Favorites)
    .find((el: string) => el === id);

  if (cardIsFav) delete storage.Favorites[id];
  if (!cardIsFav) storage.Favorites[id] = storage.Movies[id];

  target.classList.toggle('isFav', !cardIsFav);
  localStorage.VideoBox = JSON.stringify(storage);

  loadFavorites();
  toggleCardFavButton(id);
};

initStorage();
loadFavorites();
input.focus();
getUpcomingTMDB()
  .then((res) => {
    res.results?.slice(0, 10).forEach(async (movie: any) => {
      const tmdb = await getTMDBdata(movie.id);
      const omdb = await getOMDBdata(tmdb.imdb_id);
      createSlide(omdb);
    });
  });
searchBtn.addEventListener('click', handleSearchClick);
menu.addEventListener('click', handleMenuClick);
input.addEventListener('keypress', handleEnterPress);
document.addEventListener('click', handleFavClick);
