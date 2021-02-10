const keyboardIcon = document.querySelector('.fa-keyboard')!;
const moviesTab = document.querySelector('#movies')!;
const top101Tab = document.querySelector('#top101')!;
const settingsButton = document.querySelector('#settings')!;
const settingsModal = document.querySelector('#settingsModal')!;
const movieModal = document.querySelector('#movieModal')!;
const movieModalTitle = movieModal.querySelector('#modalTitle')!;
const movieModalBody = movieModal.querySelector('#movieModal .modal-body')! as HTMLElement;
const menu = document.querySelector('div.nav')!;
const h1 = document.querySelector('h1')!;
const tabs = Array.from(document.querySelectorAll('.tab-pane'));
const searchAlert = document.querySelector('#movies>.alert')!;
const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites')!;
const favoritesAlert = document.querySelector('.alert.favorites')!;
const themeSwitch = document.querySelector('#themeSwitch') as HTMLInputElement;
const headerTextSpans = document.querySelectorAll('h1 span:not(:nth-child(2))');
const searchInput = <HTMLInputElement>document.querySelector('#movie-search');
const searchBtn = document.querySelector('.search-button')!;
const keyboardOffButton = () => document.querySelector('#off')!;
const keyboardEnterButton = () => document.querySelector('#enter')!;

const themeSwithableElements = [
  { selector: 'html', classes: ['bg-dark'] },
  { selector: 'header', classes: ['text-light'] },
  { selector: 'footer', classes: ['text-muted'] },
  { selector: '#movieModal .modal-content', classes: ['dark', 'text-light'] },
  { selector: '#settingsModal .modal-content', classes: ['dark', 'text-light'] },
  { selector: '#top101', classes: ['text-light'] },
  { selector: '.film', classes: ['invert'] },
  { selector: '.keyboard', classes: ['bg-dark'] },
];

export {
  keyboardIcon, moviesTab, top101Tab, settingsButton, settingsModal,
  menu, tabs, themeSwitch, headerTextSpans, searchBtn,
  searchInput, movieModal, movieModalTitle, movieModalBody,
  searchAlert, favoritesAlert, favoritesWrapper, themeSwithableElements,
  keyboardOffButton, keyboardEnterButton, h1,
};
