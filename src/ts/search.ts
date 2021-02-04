import {
  swiper, state, wait, storage,
} from './index';
import {
  getOMDBdata, OMDBSearchResponce, searchMoviesOMDB, SearchResult,
} from './API';
import {
  createRatingBadge, createSlide, searchInput, searchAlert,
} from './dom_elements';

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
  searchAlert.classList.remove('alert-success', 'alert-danger');
  const { totalResults } = res;
  if (!totalResults) {
    searchAlert.textContent = res.Error;
    searchAlert.classList.add('alert-danger');
  } else {
    searchAlert.textContent = `${totalResults} movies found on request '${request}'`;
    searchAlert.classList.add('alert-success');
  }
  searchAlert.classList.remove('visually-hidden');
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
