import { state } from './index';
import {
  getTopRatedTMDB,
} from './API';
import { top101, createTop101Card } from './dom_elements';

export const sortTop101 = () => {
  const rows = Array.from(top101.children);
  const sorted = rows.slice().sort((a: Element, b: Element) => {
    const el1 = a as HTMLElement; const el2 = b as HTMLElement;
    const rating1: number = +el1.dataset.rating!;
    const rating2: number = +el2.dataset.rating!;
    if (rating1 > rating2) return -1;
    if (rating2 > rating1) return 1;
    return 0;
  });
  rows.forEach((el: Element) => {
    const row = el as HTMLElement;
    row.style.setProperty('order', `${sorted.indexOf(row)}`);
    row.querySelector('.row__position')!.textContent = `${sorted.indexOf(row) + 1}`;
  });
  top101.classList.add('sorted');
};

export const appendTop101NextPage = async () => {
  const getTop101Page = async (page: number = 1) => {
    const top = await getTopRatedTMDB(page);
    return top;
  };
  const movies = await getTop101Page(state.top101page);
  if (!movies.length) top101?.classList.add('top101');
  movies.forEach((movie) => createTop101Card(movie));
};

export const top101observer = new MutationObserver(() => {
  const rows = Array.from(top101.children);

  if (rows.length! < 100) {
    state.top101page += 1;
    appendTop101NextPage();
  } else {
    const lastRowsReady = rows.slice(-5).filter((el: any) => el.classList.contains('ready')).length === 5;
    if (lastRowsReady && !top101.classList.contains('sorted')) sortTop101();
  }
});
