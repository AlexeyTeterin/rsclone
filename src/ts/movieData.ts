export async function searchMoviesOMDB(query:string) {
  const key = 'c1e288c0';
  const url = `http://www.omdbapi.com//?apikey=${key}&s=${query}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function getOMDBdata(id: string) {
  const key = 'c1e288c0';
  const url = `http://www.omdbapi.com//?apikey=${key}&i=${id}`;
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

export async function getTMDBdata(id: string) {
  const key = 'c37ec6b736685a1db9bc20250a85960a';
  const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${key}`;
  const responce = await fetch(url);
  const data = await responce.json();
  return data;
}

export type RatingsArray = {
  Source: string,
  Value: string,
}

export type SearchResult = {
  Title: string;
  Year: string;
  Poster: string;
  imdbID: string;
  Ratings: Array<RatingsArray>;
}

export type MovieData = {
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
  Ratings: Array<RatingsArray>;
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
