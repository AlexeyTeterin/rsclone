import {
  createSlide, swiper,
  state, wait, createRatingBadge, storage,
} from './index';
import {
  getOMDBdata, OMDBSearchResponce, searchMoviesOMDB, SearchResult,
} from './API';

export const searchInput = <HTMLInputElement>document.querySelector('#movie-search');
export const searchBtn = document.querySelector('.search-button')!;

export const loadFoundSlides = (res: any) => {
  res.Search.forEach(async (movie: SearchResult) => {
    const omdb = await getOMDBdata(movie.imdbID);
    const slide = createSlide(omdb);
    swiper.movies.appendSlide(slide);
    storage.saveMovie(omdb);
    createRatingBadge(slide, omdb);
  });
};

const setAlertMessage = (res: OMDBSearchResponce) => {
  const request = searchInput.value;
  const alert = document.querySelector('#movies>.alert')!;
  alert.classList.remove('alert-success', 'alert-danger');
  const { totalResults } = res;
  if (!totalResults) {
    alert.textContent = res.Error;
    alert.classList.add('alert-danger');
  } else {
    alert.textContent = `${totalResults} movies found on request '${request}'`;
    alert.classList.add('alert-success');
  }
  alert.classList.remove('visually-hidden');
};

export const onSearchButtonClick = () => {
  const toggleSearchSpinner = () => {
    const spinner = document.querySelector('button>span.spinner-border');
    const searchText = document.querySelector('button>span.search-text');
    spinner?.classList.toggle('visually-hidden');
    searchText?.classList.toggle('visually-hidden');
  };

  toggleSearchSpinner();
  document.querySelector('#movies')?.classList.remove('show');
  state.page = 1;
  state.request = searchInput.value.trim();

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

export const loadNextSearchPage = () => {
  searchMoviesOMDB(state.request, state.page)
    .then((res) => {
      if (res.Error) {
        setAlertMessage(res);
        return;
      }
      loadFoundSlides(res);
    });
};

export const onActiveIndexChange = () => {
  const { activeIndex, slides } = swiper.movies;
  if (slides.length - activeIndex === 7 && state.request) {
    state.page += 1;
    loadNextSearchPage();
  }
};
