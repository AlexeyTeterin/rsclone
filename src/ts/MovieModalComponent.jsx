import * as React from 'react';

export default class MovieModal extends React.Component {
  movie = this.props.movie;

  title = <h5 className="modal-title" id="modalTitle">{this.movie.Title}</h5>;

  headerCloseBtn = <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>;

  footerCloseBtn = <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>;

  poster = <img className='modal-poster rounded mx-auto d-block' src={this.movie.Poster}></img>

  plot = <p className='lh-sm fst-italic text-center text-plot'>{this.movie.Plot}</p>

  render() {
    return (
      <div className="modal-content">
        <div className="modal-header">
          {this.title}
          {this.headerCloseBtn}
        </div>
        <div className="modal-body">
          {this.poster}
          {this.plot}
          {this.releaseDate}
        </div>
        <div className="modal-footer">
          {this.footerCloseBtn}
        </div>
      </div>
    );
  }
}
