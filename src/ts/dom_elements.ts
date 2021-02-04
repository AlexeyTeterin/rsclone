import { storage } from '.';
import {
  SearchResult, OMDBMovieData, Ratings, getTMDBdata,
} from './API';

const keyboardButton = document.querySelector('.fa-keyboard')!;
const top101 = document.querySelector('#top101')!;
const settingsButton = document.querySelector('#settings')!;
const settingsModal = document.querySelector('#settingsModal')!;
const menu = document.querySelector('div.nav')!;
const tabs = Array.from(document.querySelectorAll('.tab-pane'));
const searchAlert = document.querySelector('#movies>.alert')!;
const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites')!;
const favoritesAlert = document.querySelector('.alert.favorites')!;
const themeSwitch = document.querySelector('#themeSwitch') as HTMLInputElement;
const headerTextSpans = document.querySelectorAll('h1 span:not(:nth-child(2))');
const searchInput = <HTMLInputElement>document.querySelector('#movie-search');
const searchBtn = document.querySelector('.search-button')!;
const movieModal = document.getElementById('modal')!;

const createElement = (tag: string, ...classNames: Array<string>) => {
  const element = document.createElement(tag);
  classNames.forEach((className) => element.classList.add(className));
  return element;
};

const toggleElementClasses = (selectorName: string, ...classNames: Array<string>) => {
  classNames
    .forEach((className) => document.querySelector(selectorName)?.classList
      .toggle(className, !themeSwitch.checked));
};

const createFavButton = (movie: SearchResult, className: string) => {
  storage.load();
  const favButton = createElement('button', className);
  const isFav = Object.keys(storage.Favorites)
    .findIndex((el: string) => el === movie.imdbID) >= 0;
  favButton.classList.toggle('isFav', isFav);
  return favButton;
};

const createRatingBadge = (card: HTMLElement, data: OMDBMovieData) => {
  const imdbRating = data.Ratings
    .find((r: Ratings) => r.Source === 'Internet Movie Database');
  const cardRating = card.querySelector('.card__rating')!;
  cardRating.textContent = imdbRating ? `${imdbRating.Value.slice(0, -3)}` : 'n/a';
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
  const omdbData: OMDBMovieData = await getTMDBdata(tmdbData.imdb_id);
  storage.saveMovie(omdbData);
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

export {
  keyboardButton, top101, settingsButton, settingsModal,
  menu, tabs, themeSwitch, headerTextSpans, searchBtn,
  searchInput, movieModal, searchAlert, favoritesAlert, favoritesWrapper,
  createFavButton, createRatingBadge, createElement, createSlide,
  toggleElementClasses, createTop101Card,
};
