export async function searchMoviesOMDB(query: string, page: number = 1) {
  const key = 'd8e35ecc';
  const url = `https://www.omdbapi.com//?apikey=${key}&s=${query}&page=${page}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function getOMDBdata(id: string) {
  const key = 'd8e35ecc';
  const url = `https://www.omdbapi.com//?apikey=${key}&i=${id}`;
  const responce = await fetch(url);
  const data = await responce.json();
  return data;
}

export async function getUpcomingTMDB() {
  const key = 'c37ec6b736685a1db9bc20250a85960a';
  const url = `https://api.themoviedb.org/3/movie/upcoming?api_key=${key}`;
  const responce = await fetch(url);
  const data = await responce.json();
  return data;
}

export async function getTopRatedTMDB(n: number) {
  const page = n;
  const result = [];
  const key = 'c37ec6b736685a1db9bc20250a85960a';
  async function getPartResult() {
    const url = `https://api.themoviedb.org/3/movie/top_rated?api_key=${key}&page=${page}`;
    const responce = await fetch(url);
    const data = await responce.json();
    return data.results.filter((movie: any) => movie.vote_count > 5000);
  }
  const partResult = await getPartResult();
  result.push(...partResult);
  return result;
}

export async function getTMDBdata(id: string) {
  const key = 'c37ec6b736685a1db9bc20250a85960a';
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${key}`;
  const responce = await fetch(url);
  const data = await responce.json();
  return data;
}

export type Ratings = {
  Source: string,
  Value: string,
}

export type SearchResult = {
  Title: string;
  Year: string;
  Poster: string;
  imdbID: string;
  Ratings: Array<Ratings>;
}

export type OMDBMovieData = {
  Actors: string;
  Awards: string;
  BoxOffice: string;
  Country: string;
  DVD: string;
  Director: string;
  Genre: string;
  Language: string;
  Metascore: string;
  Plot: string;
  Poster: string;
  Production: string;
  Rated: string;
  Ratings: Array<Ratings>;
  Released: string;
  Response: string;
  Runtime: string;
  Title: string;
  Type: string;
  Website: string;
  Writer: string;
  Year: string;
  imdbID: string;
  imdbRating: string;
  imdbVotes: string;
}

export type OMDBSearchResponce = {
  Responce: string;
  Search: Array<Object>;
  totalResults: number;
  Error: string;
}
