import * as bootstrap from 'bootstrap';
import { storage, createElement } from './index';
import { OMDBMovieData } from './movieData';

const movieModal = document.getElementById('modal')!;
const movieModalBS = new bootstrap.Modal(movieModal, { keyboard: true });

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

export { movieModal, showMovieModal };
