import {
  createSlide, storage, createRatingBadge, swiper,
} from '.';
import { getOMDBdata, getTMDBdata, getUpcomingTMDB } from './API';

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

export default loadUpcomingMovies;
