import * as bootstrap from 'bootstrap';
import { storage } from './index';
import { OMDBMovieData } from './API';
import { createElement } from './dom_utils';
import { movieModal, movieModalBody, movieModalTitle } from './dom_elements';

const movieBootstrapModal = new bootstrap.Modal(movieModal, { keyboard: true });

const onLearnMoreClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const targetIsLearnMoreBtn = target.classList.contains('card__info-button') || target.classList.contains('row__info-button');
  if (!targetIsLearnMoreBtn) return;

  storage.load();
  const { id } = target.dataset;
  const data: OMDBMovieData = storage.Movies[id!];
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

  movieModalTitle.textContent = `${data.Title}, ${data.Year}`;
  movieModalBody.innerHTML = '';
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

  movieModalBody.append(poster, plot, releaseDate, country,
    genre, director, actors, imdbRating, runtime, awards, boxOffice);
  movieBootstrapModal.toggle();
};

export default onLearnMoreClick;
