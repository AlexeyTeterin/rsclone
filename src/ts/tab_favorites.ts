import {
  storage, createSlide, addRatingToSlide, wait, swiper, createElement,
} from './index';
import { SearchResult, OMDBMovieData } from './API';
import { top101 } from './tab_top101';

export const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites')!;
export const alertFavorites = document.querySelector('.alert.favorites');

export const reloadFavorites = () => {
  storage.load();
  favoritesWrapper.innerHTML = '';

  Object.values(storage.Favorites).forEach((savedMovie) => {
    const slide = createSlide(savedMovie as SearchResult);
    addRatingToSlide(slide, savedMovie as OMDBMovieData);
    swiper.favorites.appendSlide(slide);
  });
};

export const updateFavorites = (target: HTMLElement) => {
  const targetSwiper = target.parentElement?.parentElement?.parentElement?.parentElement;
  const favoritesTabActive = targetSwiper?.classList.contains('favorites');
  if (favoritesTabActive) {
    target.parentElement?.parentElement?.style.setProperty('opacity', '0');
    wait(500).then(() => reloadFavorites());
  } else reloadFavorites();
};

export const createFavButton = (movie: SearchResult, className: string) => {
  storage.load();
  const favButton = createElement('button', className);
  const isFav = Object.keys(storage.Favorites)
    .findIndex((el: string) => el === movie.imdbID) >= 0;
  favButton.classList.toggle('isFav', isFav);
  return favButton;
};

export const toggleMovieCardIsFav = (id: string, isFav: boolean) => {
  const targetCard = Array.from(swiper.movies.slides)
    .find((el) => el.querySelector('.card')?.id === id);
  targetCard?.querySelector('.card__fav')!.classList.toggle('isFav', isFav);
};

export const toggleTop101CardIsFav = (id: string, isFav: boolean) => {
  const targetCard = Array.from(top101!.children)
    .find((el) => {
      const card = el as HTMLElement;
      return (card.dataset.id! === id) ? card : null;
    });
  targetCard?.querySelector('.row__fav')?.classList.toggle('isFav', isFav);
};

export const handleSlideFavButtonClick = (event: Event) => {
  const target = event.target as HTMLElement;
  if (!target.classList.contains('card__fav') && !target.classList.contains('row__fav')) return;

  storage.load();
  const id: string = target.parentElement!.parentElement!.id!
    || target.parentElement!.parentElement!.dataset.id!;
  const cardIsFav: boolean = Object.keys(storage.Favorites)
    .findIndex((el: string) => el === id) >= 0;

  if (cardIsFav) delete storage.Favorites[id];
  if (!cardIsFav) storage.Favorites[id] = storage.Movies[id];

  target.classList.toggle('isFav', !cardIsFav);
  storage.save();

  toggleMovieCardIsFav(id, !cardIsFav);
  toggleTop101CardIsFav(id, !cardIsFav);
  updateFavorites(target);
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
