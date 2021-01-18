import 'normalize.css';
import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/style.css';
import {
  getMovieData, searchMovies, MovieData, SearchResult, RatingsArray,
} from './movieData';

const searchBtn = document.querySelector('.search-button')!;
const slider = document.querySelector('.slider')!;
const menu = document.querySelector('nav')!;
const tabs = Array.from(document.querySelectorAll('.tab-pane'));

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

const clearSlider = () => {
  slider.innerHTML = '';
};

const createCard = (data: SearchResult) => {
  const card = createElement('div', 'card');
  const cardTitle = createElement('div', 'card__title');
  const cardPoster = createElement('div', 'card__poster');
  const cardYear = createElement('div', 'card__year');
  const cardRating = createElement('div', 'card__rating');
  const cardFavButton = createElement('button', 'card__fav');

  card.id = data.imdbID;
  cardTitle.textContent = data.Title;
  cardYear.textContent = data.Year;
  cardPoster.style.setProperty('background-image', `url(${data.Poster})`);
  card.append(cardTitle, cardPoster, cardYear, cardRating, cardFavButton);
  return card;
};

const addMovieToLocalStorage = (data: MovieData) => {
  const storage = JSON.parse(localStorage.getItem('VideoBox')!);
  if (!storage.Movies[data.imdbID]) {
    storage.Movies[data.imdbID] = data;
    localStorage.VideoBox = JSON.stringify(storage);
  }
};

const handleSearchClick = () => {
  const input = <HTMLInputElement>document.querySelector('#movie-search');
  searchMovies(input.value)
    .then((res) => {
      clearSlider();
      res.Search!.forEach(async (movie: SearchResult) => {
        const card = createCard(movie);
        slider.append(card);

        const data = await getMovieData(movie.imdbID);
        const imdbRating = data.Ratings
          .find((r: RatingsArray) => r.Source === 'Internet Movie Database');

        addMovieToLocalStorage(data);
        if (imdbRating) card.querySelector('.card__rating')!.textContent = `IMDB: ${imdbRating.Value}`;
      });
    });
};

const handlePosterClick = async (event: Event) => {
  const card = event.target! as HTMLElement;
  if (!card.classList.contains('card__poster')) return;
  const { id } = card.parentElement!;
  const data: MovieData = await getMovieData(id);
  addMovieToLocalStorage(data);
};

const handleMenuClick = (event: Event) => {
  const target = event.target! as HTMLElement;
  if (!target.classList.contains('nav-link')) return;
  const targetTab = tabs
    .find((tab) => tab instanceof HTMLElement && tab.dataset.id === target.id);
  Array.from(menu.children)
    .forEach((link) => link.classList.remove('disabled'));
  tabs.forEach((tab) => tab.classList.remove('show', 'active'));
  target.classList.add('disabled');
  targetTab!.classList.add('show', 'active');
};

initStorage();
searchBtn.addEventListener('click', handleSearchClick);
slider.addEventListener('click', handlePosterClick);
menu.addEventListener('click', handleMenuClick);
