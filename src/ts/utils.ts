import {
  storage, wait, swiper, state,
} from './index';
import {
  SearchResult, OMDBMovieData,
  getOMDBdata, getTMDBdata, getUpcomingTMDB, getTopRatedTMDB,
} from './API';
import { favoritesAlert, favoritesWrapper, top101Tab } from './dom_elements';
import { createSlide, createRatingBadge, createTop101Card } from './dom_utils';

const loadFavorites = () => {
  storage.load();
  favoritesWrapper.innerHTML = '';

  Object.values(storage.Favorites).forEach((savedMovie) => {
    const slide = createSlide(savedMovie as SearchResult);
    createRatingBadge(slide, savedMovie as OMDBMovieData);
    swiper.favorites.appendSlide(slide);
  });
};

const updateFavorites = (target: HTMLElement) => {
  const targetSwiper = target.parentElement?.parentElement?.parentElement?.parentElement;
  const isFavoritesTabActive = targetSwiper?.classList.contains('favorites');
  if (isFavoritesTabActive) {
    target.parentElement?.parentElement?.style.setProperty('opacity', '0');
    wait(500).then(() => loadFavorites());
  } else loadFavorites();
};

const favoritesObserver = new MutationObserver((mutationRecords) => {
  mutationRecords.forEach((record) => {
    if (record.target.hasChildNodes()) {
      const favCount = favoritesWrapper.children.length;
      favoritesAlert!.innerHTML = `You have <b>${favCount}</b> favorite movies:`;
      if (favCount === 1) favoritesAlert!.innerHTML = favoritesAlert!.innerHTML.replace('movies', 'movie');
      favoritesAlert?.classList.add('top');
    } else {
      favoritesAlert!.innerHTML = 'Your favorite movies will be shown here';
      favoritesAlert?.classList.remove('top');
    }
  });
});

const loadUpcomingMovies = async () => {
  getUpcomingTMDB()
    .then((res) => {
      res.results
        .forEach(async (movie: any) => {
          const tmdbData = await getTMDBdata(movie.id);
          const omdbData = await getOMDBdata(tmdbData.imdb_id);
          const slide = createSlide(omdbData);
          swiper.movies.appendSlide(slide);
          storage.saveMovie(omdbData);
          createRatingBadge(slide, omdbData);
        });
    });
};

const sortTop101 = () => {
  const rows = Array.from(top101Tab.children);
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
  top101Tab.classList.add('sorted');
};

const appendTop101NextPage = async () => {
  const getTop101Page = async (page: number = 1) => {
    const top = await getTopRatedTMDB(page);
    return top;
  };
  const movies = await getTop101Page(state.top101page);
  if (!movies.length) top101Tab?.classList.add('top101');
  movies.forEach((movie) => createTop101Card(movie));
};

const top101observer = new MutationObserver(() => {
  const rows = Array.from(top101Tab.children);

  if (rows.length! < 100) {
    state.top101page += 1;
    appendTop101NextPage();
  } else {
    const lastRowsReady = rows.slice(-5).filter((el: any) => el.classList.contains('ready')).length === 5;
    if (lastRowsReady && !top101Tab.classList.contains('sorted')) sortTop101();
  }
});

export {
  loadFavorites, updateFavorites, favoritesObserver,
  loadUpcomingMovies, sortTop101, appendTop101NextPage, top101observer,
};
