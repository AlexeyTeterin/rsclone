import React from 'react';
import { OMDBMovieData } from './API';

const headerCloseBtn = (
  <button
    type="button"
    className="btn-close"
    data-bs-dismiss="modal"
    aria-label="Close"
  />
);

const footerCloseBtn = (
  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
    Close
  </button>
);

const row = (title = '', value = '') => (
  <p>
    <b>
      {title}
      :
    </b>
    {' '}
    {value}
  </p>
);

interface Props {
  movie: OMDBMovieData,
}

export default class MovieModal extends React.Component<Props> {
  movie = this.props.movie;

  title = (
    <h5 className="modal-title" id="modalTitle">
      {this.movie.Title}
    </h5>
  );

  poster = (
    <img
      className="modal-poster rounded mx-auto d-block"
      src={this.movie.Poster}
      alt={this.movie.Title}
    />
  );

  plot = (
    <p className="lh-sm fst-italic text-center text-plot">{this.movie.Plot}</p>
  );

  releaseDate = row('Release date', this.movie.Released);

  country = row('Country', this.movie.Country);

  genre = row('Genre', this.movie.Genre);

  director = row('Director', this.movie.Director);

  actors = row('Actors', this.movie.Actors);

  ratingBadge = (
    <span className="badge bg-warning text-dark modal-rating">
      {this.movie.imdbRating}
    </span>
  );

  imdbRating = (
    <p data-id={this.movie.imdbID}>
      <b>IMDB Rating:</b>
      {' '}
      {this.ratingBadge}
      {' '}
      (
      {this.movie.imdbVotes}
      {' '}
      votes)
    </p>
  );

  runtime = row('Runtime', this.movie.Runtime);

  awards = row('Awards', this.movie.Awards);

  boxOffice = row('Box Office', this.movie.BoxOffice);

  render() {
    return (
      <div className="modal-content">
        <div className="modal-header">
          {this.title}
          {headerCloseBtn}
        </div>
        <div className="modal-body">
          {this.poster}
          {this.plot}
          {this.releaseDate}
          {this.country}
          {this.genre}
          {this.director}
          {this.actors}
          {this.imdbRating}
          {this.runtime}
          {this.awards}
          {this.boxOffice}
        </div>
        <div className="modal-footer">{footerCloseBtn}</div>
      </div>
    );
  }
}
