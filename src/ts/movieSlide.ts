import { updateFavorites } from './tab_favorites';
import { top101 } from './dom_elements';
import { storage, swiper } from './index';

const toggleMovieCardIsFav = (id: string, isFav: boolean) => {
  const targetCard = Array.from(swiper.movies.slides)
    .find((el) => el.querySelector('.card')?.id === id);
  targetCard?.querySelector('.card__fav')!.classList.toggle('isFav', isFav);
};

const toggleTop101CardIsFav = (id: string, isFav: boolean) => {
  const targetCard = Array.from(top101!.children)
    .find((el) => {
      const card = el as HTMLElement;
      return (card.dataset.id! === id) ? card : null;
    });
  targetCard?.querySelector('.row__fav')?.classList.toggle('isFav', isFav);
};

const onFavButtonClick = (event: Event) => {
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

const onRatingBadgeClick = (event: Event) => {
  const target = event.target as HTMLLinkElement;
  let id: string;
  const openMovieOnIMDB = () => window.open(`https://www.imdb.com/title/${id}/`);
  if (target.classList.contains('card__rating')) {
    id = target.parentElement?.parentElement?.id!;
    openMovieOnIMDB();
  }
  if (target.classList.contains('row__rating')) {
    id = target.parentElement?.parentElement?.dataset.id!;
    openMovieOnIMDB();
  }
  if (target.classList.contains('modal-rating')) {
    id = target.parentElement?.dataset.id!;
    openMovieOnIMDB();
  }
};

export {
  toggleMovieCardIsFav, toggleTop101CardIsFav, onFavButtonClick, onRatingBadgeClick,
};
