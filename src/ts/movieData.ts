export async function searchMovies(query:string) {
  const key = 'c1e288c0';
  const url = `http://www.omdbapi.com//?apikey=${key}&s=${query}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

export async function getMovieData(id: string) {
  const key = 'c1e288c0';
  const url = `http://www.omdbapi.com//?apikey=${key}&i=${id}`;
  const responce = await fetch(url);
  const data = await responce.json();
  return data;
}

export type SearchResult = {
  Title: string;
  Year: string;
  Poster: string;
  imdbID: string;
}

export type RatingsArray = {
  Source: string,
  Value: string,
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
