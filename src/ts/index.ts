import 'normalize.css';
import '../css/style.css';

async function getData(query: string) {
  const key = 'c1e288c0';
  const url = `http://www.omdbapi.com//?apikey=${key}&s=${query}`;
  const response = await fetch(url);
  const data = await response.json();
  console.log(data);
  return data;
}

getData('tenet');
