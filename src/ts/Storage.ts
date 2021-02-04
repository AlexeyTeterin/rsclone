import { OMDBMovieData } from './API';

export default class Storage {
  constructor() {
    this.Movies = {};
    this.Favorites = {};
    this.darkMode = false;
    this.darkModeAuto = false;
    this.effect = 'coverflow';
    this.pagination = 'fraction';
    this.keyboardControl = true;
    this.mouseControl = true;
  }

  Movies: { [k: string]: any };

  Favorites: { [k: string]: any };

  darkMode: boolean;

  darkModeAuto: boolean;

  effect: string;

  pagination: string;

  keyboardControl: boolean;

  mouseControl: boolean;

  load = () => {
    Object.assign(this, JSON.parse(localStorage.VideoBox));
    return this;
  };

  save = () => {
    localStorage.VideoBox = JSON.stringify(this);
  }

  saveMovie = (data: OMDBMovieData) => {
    this.load();
    if (!this.Movies[data.imdbID]) {
      this.Movies[data.imdbID] = data;
      this.save();
    }
  };
}
