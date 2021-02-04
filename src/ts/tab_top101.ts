import { createFavButton } from './tab_favorites';
import { createElement, state, storage } from './index';
import {
  getOMDBdata, getTMDBdata, getTopRatedTMDB, OMDBMovieData,
} from './API';

export const top101 = document.querySelector('#top101')!;

export const createTop101Card = async (movie: any) => {
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

export const sortTop101 = () => {
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

export const appendTop101NextPage = async () => {
  const getTop101Page = async (page: number = 1) => {
    const top = await getTopRatedTMDB(page);
    return top;
  };
  const movies = await getTop101Page(state.top101page);
  if (!movies.length) top101?.classList.add('top101');
  movies.forEach((movie) => createTop101Card(movie));
};

export const top101observer = new MutationObserver(() => {
  const rows = Array.from(top101.children);

  if (rows.length! < 100) {
    state.top101page += 1;
    appendTop101NextPage();
  } else {
    const lastRowsReady = rows.slice(-5).filter((el: any) => el.classList.contains('ready')).length === 5;
    if (lastRowsReady && !top101.classList.contains('sorted')) sortTop101();
  }
});
