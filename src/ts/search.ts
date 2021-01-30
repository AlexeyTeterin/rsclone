import {
  createSlide, swiper,
  saveMovieToLocalStorage, setAlertMessage, state, wait, addRatingToSlide,
} from './index';
import { getOMDBdata, searchMoviesOMDB, SearchResult } from './movieData';

const input = <HTMLInputElement>document.querySelector('#movie-search');

const loadFoundSlides = (res: any) => {
  res.Search.forEach(async (movie: SearchResult) => {
    const omdb = await getOMDBdata(movie.imdbID);
    const slide = createSlide(omdb);
    swiper.movies.appendSlide(slide);
    saveMovieToLocalStorage(omdb);
    addRatingToSlide(slide, omdb);
  });
};

const handleSearchClick = () => {
  const toggleSearchSpinner = () => {
    const spinner = document.querySelector('button>span.spinner-border');
    const searchText = document.querySelector('button>span.search-text');
    spinner?.classList.toggle('visually-hidden');
    searchText?.classList.toggle('visually-hidden');
  };

  toggleSearchSpinner();
  document.querySelector('#movies')?.classList.remove('show');
  state.page = 1;
  state.request = input.value.trim();

  wait(150)
    .then(() => searchMoviesOMDB(state.request, state.page))
    .then((res) => {
      swiper.movies.removeAllSlides();
      if (res.Error) {
        setAlertMessage(res);
        return;
      }
      loadFoundSlides(res);
      setAlertMessage(res);
    })
    .then(() => document.querySelector('#movies-tab')?.dispatchEvent(new Event('click', { bubbles: true })))
    .then(toggleSearchSpinner);
};

export { input, handleSearchClick, loadFoundSlides };
