import * as React from 'react';

const headerCloseBtn = <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>;

const footerCloseBtn = <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>;

export default class MovieModal extends React.Component {
  movie = this.props.movie;

  row = (title = '', value = '') => <p><b>{title}:</b> {value}</p>

  title = <h5 className="modal-title" id="modalTitle">{this.movie.Title}</h5>;

  poster = <img className='modal-poster rounded mx-auto d-block' src={this.movie.Poster}></img>

  plot = <p className='lh-sm fst-italic text-center text-plot'>{this.movie.Plot}</p>

  releaseDate = this.row('Release date', this.movie.Released);

  country = this.row('Country', this.movie.Country);

  genre = this.row('Genre', this.movie.Genre);

  director = this.row('Director', this.movie.Director);

  actors = this.row('Actors', this.movie.Actors);

  ratingBadge = <span className="badge bg-warning text-dark modal-rating">{this.movie.imdbRating}</span>

  imdbRating = (
    <p data-id={this.movie.imdbID}>
      <b>IMDB Rating:</b> {this.ratingBadge} ({this.movie.imdbVotes} votes)
    </p>
  )

  runtime = this.row('Runtime', this.movie.Runtime);

  awards = this.row('Awards', this.movie.Awards);

  boxOffice = this.row('Box Office', this.movie.BoxOffice);

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
        <div className="modal-footer">
          {footerCloseBtn}
        </div>
      </div>
    );
  }
}
