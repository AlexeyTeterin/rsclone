import {
  storage, createSlide, createRatingBadge, wait, swiper,
} from './index';
import { SearchResult, OMDBMovieData } from './API';

export const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites')!;
export const alertFavorites = document.querySelector('.alert.favorites');

export const loadFavorites = () => {
  storage.load();
  favoritesWrapper.innerHTML = '';

  Object.values(storage.Favorites).forEach((savedMovie) => {
    const slide = createSlide(savedMovie as SearchResult);
    createRatingBadge(slide, savedMovie as OMDBMovieData);
    swiper.favorites.appendSlide(slide);
  });
};

export const updateFavorites = (target: HTMLElement) => {
  const targetSwiper = target.parentElement?.parentElement?.parentElement?.parentElement;
  const favoritesTabActive = targetSwiper?.classList.contains('favorites');
  if (favoritesTabActive) {
    target.parentElement?.parentElement?.style.setProperty('opacity', '0');
    wait(500).then(() => loadFavorites());
  } else loadFavorites();
};

export const alertFavObserver = new MutationObserver((mutationRecords) => {
  mutationRecords.forEach((record) => {
    if (record.target.hasChildNodes()) {
      const favCount = favoritesWrapper.children.length;
      alertFavorites!.innerHTML = `You have <b>${favCount}</b> favorite movies:`;
      if (favCount === 1) alertFavorites!.innerHTML = alertFavorites!.innerHTML.replace('movies', 'movie');
      alertFavorites?.classList.add('top');
    } else {
      alertFavorites!.innerHTML = 'Your favorite movies will be shown here';
      alertFavorites?.classList.remove('top');
    }
  });
});
