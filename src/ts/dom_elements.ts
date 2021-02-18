export const keyboardIcon = document.querySelector('.fa-keyboard')!;
export const moviesTab = document.querySelector('#movies')!;
export const top101Tab = document.querySelector('#top101')!;
export const settingsButton = document.querySelector('#settings')!;
export const settingsModal = document.querySelector('#settingsModal')!;
export const movieModal = document.querySelector('#movieModal')!;
export const movieModalDialog = document.querySelector('#movieModal .modal-dialog')!;
export const movieModalTitle = movieModal.querySelector('#modalTitle')!;
export const movieModalBody = movieModal.querySelector('#movieModal .modal-body')! as HTMLElement;
export const menu = document.querySelector('div.nav')!;
export const h1 = document.querySelector('h1')!;
export const tabs = Array.from(document.querySelectorAll('.tab-pane'));
export const searchAlert = document.querySelector('#movies>.alert')!;
export const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites')!;
export const favoritesAlert = document.querySelector('.alert.favorites')!;
export const themeSwitch = document.querySelector('#themeSwitch') as HTMLInputElement;
export const headerTextSpans = document.querySelectorAll('h1 span:not(:nth-child(2))');
export const searchInput = <HTMLInputElement>document.querySelector('#movie-search');
export const searchBtn = document.querySelector('.search-button')!;
export const footerEl = document.querySelector('footer');
export const keyboardOffButton = () => document.querySelector('#off')!;
export const keyboardEnterButton = () => document.querySelector('#enter')!;

export const themeSwithableElements = [
  { selector: 'html', classes: ['bg-dark'] },
  { selector: 'header', classes: ['text-light'] },
  { selector: 'footer', classes: ['text-muted'] },
  { selector: '#movieModal .modal-dialog', classes: ['dark', 'text-light'] },
  { selector: '#settingsModal .modal-dialog', classes: ['dark', 'text-light'] },
  { selector: '#top101', classes: ['text-light'] },
  { selector: '.film', classes: ['invert'] },
  { selector: '.keyboard', classes: ['bg-dark'] },
];
