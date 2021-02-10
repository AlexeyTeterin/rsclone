import React from 'react';
import ReactDOM from 'react-dom';
import * as bootstrap from 'bootstrap';
import { storage } from './index';
import { OMDBMovieData } from './API';
import { movieModal, movieModalDialog } from './dom_elements';
import MovieModal from './MovieModalComponent';

const movieBootstrapModal = new bootstrap.Modal(movieModal, { keyboard: true });

const onLearnMoreClick = (event: Event) => {
  const target = event.target as HTMLElement;
  const targetIsLearnMoreBtn = target.classList.contains('card__info-button') || target.classList.contains('row__info-button');
  if (!targetIsLearnMoreBtn) return;

  storage.load();
  const { id } = target.dataset;
  const data: OMDBMovieData = storage.Movies[id!];

  ReactDOM.unmountComponentAtNode(movieModalDialog);
  ReactDOM.render(<MovieModal movie={data} />, movieModalDialog);

  movieBootstrapModal.toggle();
};

export default onLearnMoreClick;
