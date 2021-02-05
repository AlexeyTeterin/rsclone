const keyboardButton = document.querySelector('.fa-keyboard')!;
const moviesTab = document.querySelector('#movies')!;
const top101Tab = document.querySelector('#top101')!;
const settingsButton = document.querySelector('#settings')!;
const settingsModal = document.querySelector('#settingsModal')!;
const movieModal = document.querySelector('#movieModal')!;
const movieModalTitle = movieModal.querySelector('#modalTitle')!;
const movieModalBody = movieModal.querySelector('#movieModal .modal-body')! as HTMLElement;
const menu = document.querySelector('div.nav')!;
const tabs = Array.from(document.querySelectorAll('.tab-pane'));
const searchAlert = document.querySelector('#movies>.alert')!;
const favoritesWrapper = document.querySelector('.swiper-wrapper.favorites')!;
const favoritesAlert = document.querySelector('.alert.favorites')!;
const themeSwitch = document.querySelector('#themeSwitch') as HTMLInputElement;
const headerTextSpans = document.querySelectorAll('h1 span:not(:nth-child(2))');
const searchInput = <HTMLInputElement>document.querySelector('#movie-search');
const searchBtn = document.querySelector('.search-button')!;

export {
  keyboardButton, moviesTab, top101Tab, settingsButton, settingsModal,
  menu, tabs, themeSwitch, headerTextSpans, searchBtn,
  searchInput, movieModal, movieModalTitle, movieModalBody,
  searchAlert, favoritesAlert, favoritesWrapper,
};
