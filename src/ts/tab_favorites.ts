import {
  storage, wait, swiper,
} from './index';
import { SearchResult, OMDBMovieData } from './API';
import {
  createSlide, createRatingBadge, favoritesAlert, favoritesWrapper,
} from './dom_elements';

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

export const favoritesObserver = new MutationObserver((mutationRecords) => {
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
