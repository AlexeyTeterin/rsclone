import { updateFavorites } from './utils';
import { storage, swiper, keyboard } from '.';
import {
  keyboardButton, moviesTab, themeSwitch, top101Tab,
} from './dom_elements';
import {
  SearchResult, OMDBMovieData, Ratings, getTMDBdata, getOMDBdata,
} from './API';

const showMoviesTab = () => moviesTab.classList.add('show');

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
  const rowsNumber = top101Tab!.children.length;
  if (rowsNumber === 101) return;

  const row = createElement('div', 'top101-row');
  const position = createElement('div', 'row__position');
  const title = createElement('div', 'row__title');
  const poster = createElement('div', 'row__poster');
  const rating = createElement('div', 'row__rating', 'badge', 'bg-warning', 'text-dark');
  const infoButton = createElement('button', 'row__info-button', 'btn', 'btn-warning');

  position.textContent = `${top101Tab?.children.length! + 1}`;
  title.textContent = `${movie.title}`;
  infoButton.textContent = 'Learn more';

  row.append(position, poster, title, infoButton);
  top101Tab?.append(row);

  const tmdbData = await getTMDBdata(movie.id);
  const omdbData: OMDBMovieData = await getOMDBdata(tmdbData.imdb_id);
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
    top101Tab.classList.add('ready');
  }
};

const toggleMovieCardIsFav = (id: string, isFav: boolean) => {
  const targetCard = Array.from(swiper.movies.slides)
    .find((el) => el.querySelector('.card')?.id === id);
  targetCard?.querySelector('.card__fav')!.classList.toggle('isFav', isFav);
};

const toggleTop101CardIsFav = (id: string, isFav: boolean) => {
  const targetCard = Array.from(top101Tab.children)
    .find((el) => {
      const card = el as HTMLElement;
      return (card.dataset.id! === id) ? card : null;
    });
  targetCard?.querySelector('.row__fav')?.classList.toggle('isFav', isFav);
};

const onFavButtonClick = (event: Event) => {
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

const onRatingBadgeClick = (event: Event) => {
  const target = event.target as HTMLLinkElement;
  let id: string;
  const openMovieOnIMDB = () => window.open(`https://www.imdb.com/title/${id}/`);
  if (target.classList.contains('card__rating')) {
    id = target.parentElement?.parentElement?.id!;
    openMovieOnIMDB();
  }
  if (target.classList.contains('row__rating')) {
    id = target.parentElement?.parentElement?.dataset.id!;
    openMovieOnIMDB();
  }
  if (target.classList.contains('modal-rating')) {
    id = target.parentElement?.dataset.id!;
    openMovieOnIMDB();
  }
};

const onKeyboardButtonClick = () => {
  keyboardButton.classList.toggle('active');
  keyboard.toggleKeyboard();
};

export {
  showMoviesTab,
  createFavButton, createRatingBadge, createElement, createSlide, createTop101Card,
  toggleElementClasses, toggleMovieCardIsFav, toggleTop101CardIsFav,
  onFavButtonClick, onRatingBadgeClick, onKeyboardButtonClick,
};
