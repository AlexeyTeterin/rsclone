import layouts from './keyboardLayouts.js';
import soundOnIcon from '../assets/img/sound-on.svg';
import soundOffIcon from '../assets/img/sound-off.svg';
import onOffIcon from '../assets/img/on-off-icon.svg';

const textarea = document.querySelector('#movie-search');

export default class Keyboard {
  constructor() {
    this.properties = {
      value: '',
      capsLock: false,
      shift: false,
      english: null,
      sound: false,
      micOn: false,
      control: false,
      altGraph: false,
      alt: false,
    };
    this.elements = {
      main: null,
      keysContainer: null,
      keys: [],
      layouts,
    };
  }

  init() {
    this.elements.main = document.createElement('div');
    this.elements.keysContainer = document.createElement('div');

    this.elements.main.classList.add('keyboard', 'goDown');

    this.elements.keysContainer.className = 'keyboard__keys hidden';
    this.elements.keysContainer.appendChild(this.createKeys());

    this.elements.keys = this.elements.keysContainer.querySelectorAll('.keyboard__key');

    this.elements.main.appendChild(this.elements.keysContainer);
    document.querySelector('main').appendChild(this.elements.main);

    if (localStorage.capsLock === 'true') {
      this.toggleCapsLock();
      document.querySelector('#Caps').classList.add('keyboard__key--active');
    }

    if (localStorage.sound === 'true') {
      this.toggleSound();
      document.querySelector('#sound').classList.add('keyboard__key--active');
    }

    this.phisycalInput();
  }

  toggleCapsLock() {
    const {
      keys,
    } = this.elements;
    const {
      english,
      shift,
    } = this.properties;
    const {
      en,
      ru,
      enShifted,
      ruShifted,
    } = this.elements.layouts;

    this.properties.capsLock = !this.properties.capsLock;
    localStorage.capsLock = this.properties.capsLock;

    if (this.properties.capsLock) {
      keys.forEach((element, index) => {
        const key = element;
        const buttonIsSymbol = en[index].length === 1;
        if (buttonIsSymbol) {
          if (shift) {
            key.textContent = english ? enShifted[index] : ruShifted[index];
            key.textContent = key.textContent.toLowerCase();
          }
          if (!shift) {
            key.textContent = english ? en[index].toUpperCase() : ru[index].toUpperCase();
          }
        }
      });
    }
    if (!this.properties.capsLock) {
      keys.forEach((element, index) => {
        const key = element;
        const buttonIsSymbol = en[index].length === 1;
        if (buttonIsSymbol) {
          if (shift) {
            key.textContent = english ? enShifted[index] : ruShifted[index];
          }
          if (!shift) {
            key.textContent = english ? en[index].toLowerCase() : ru[index].toLowerCase();
          }
        }
      });
    }

    this.phisycalInput();
  }

  shiftPress() {
    const {
      keys,
    } = this.elements;
    const {
      en,
      ruShifted,
      enShifted,
    } = this.elements.layouts;
    const {
      english,
      capsLock,
    } = this.properties;

    keys.forEach((element, index) => {
      const key = element;
      const buttonIsSymbol = en[index].length === 1;
      if (buttonIsSymbol) {
        if (english) {
          key.textContent = capsLock ? enShifted[index].toLowerCase() : enShifted[index];
        }
        if (!english) {
          key.textContent = capsLock ? ruShifted[index].toLowerCase() : ruShifted[index];
        }
      }
    });

    this.properties.shift = true;
    document.querySelector('#Shift').classList.add('keyboard__key--active', 'red');
    this.phisycalInput();
  }

  shiftUnpress() {
    const {
      keys,
    } = this.elements;
    const {
      ru,
      en,
    } = this.elements.layouts;
    const {
      capsLock,
      english,
    } = this.properties;

    keys.forEach((element, index) => {
      const key = element;
      const buttonIsSymbol = en[index].length === 1;
      if (buttonIsSymbol) {
        if (english) {
          key.textContent = capsLock ? en[index].toUpperCase() : en[index];
        }
        if (!english) {
          key.textContent = capsLock ? ru[index].toUpperCase() : ru[index];
        }
      }
    });

    this.properties.shift = false;
    document.querySelector('#Shift').classList.remove('keyboard__key--active', 'red');
    this.phisycalInput();
  }

  createKeys() {
    const fragment = document.createDocumentFragment();
    let keyLayout = [];

    // Load stored language
    if (localStorage.english === 'false') {
      this.properties.english = false;
      keyLayout = this.elements.layouts.ru;
    } else {
      this.properties.english = true;
      keyLayout = this.elements.layouts.en;
    }

    // Create keys
    keyLayout.forEach((key) => {
      const keyElement = document.createElement('button');
      const insertLineBreak = ['backspace', '\\', 'enter', 'uarr'].indexOf(key) !== -1;

      keyElement.setAttribute('type', 'button');
      keyElement.classList.add('keyboard__key');
      keyElement.addEventListener('click', () => {
        textarea.focus();
      });

      switch (key) {
        case 'shift':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatable');
          keyElement.textContent = 'Shift';
          keyElement.id = 'Shift';

          keyElement.addEventListener('click', () => {
            if (!this.properties.shift) this.shiftPress();
            else this.shiftUnpress();
            this.soundClick('./assets/audio/switch-4.mp3');
          });
          break;

        case 'backspace':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.id = 'Backspace';
          keyElement.textContent = window.innerWidth > 600 ? 'Backspace' : 'Del';

          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-4.mp3');
            if (textarea
              .selectionStart === 0 && textarea
              .selectionEnd === textarea.selectionStart) {
              return;
            }
            if (textarea.selectionEnd === textarea.selectionStart) {
              textarea.setRangeText('', textarea.selectionStart - 1, textarea.selectionEnd, 'end');
            } else {
              textarea.setRangeText('', textarea.selectionStart, textarea.selectionEnd, 'end');
            }
            textarea.dispatchEvent(new Event('input'));
          });
          break;

        case 'tab':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.textContent = 'Tab';

          keyElement.addEventListener('click', (e) => {
            e.preventDefault();
            this.soundClick('./assets/audio/switch-10.mp3');
            textarea.setRangeText('\t', textarea.selectionStart, textarea.selectionEnd, 'end');
          });
          break;

        case 'caps':
          keyElement.classList.add('keyboard__key--wide', 'keyboard__key--activatable');
          keyElement.id = 'Caps';
          keyElement.textContent = window.innerWidth > 600 ? 'CapsLock' : 'Caps';

          keyElement.addEventListener('click', () => {
            this.toggleCapsLock();
            keyElement.classList.toggle('keyboard__key--active', this.properties.capsLock);
            this.soundClick('./assets/audio/switch-2.mp3');
          });
          break;

        case 'ctrl':
          keyElement.textContent = 'Ctrl';
          keyElement.id = 'ControlRight';
          if (window.innerWidth <= 600) keyElement.style.setProperty('letter-spacing', '-1px');
          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
          });
          break;

        case 'lctrl':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.textContent = 'Ctrl';
          keyElement.id = 'ControlLeft';
          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
          });
          break;

        case 'lang':
          keyElement.classList.add('keyboard__key--dark');
          keyElement.textContent = this.properties.english ? 'EN' : 'RU';
          keyElement.id = 'lang';
          keyElement.addEventListener('mousedown', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
            this.toggleLang();
          });
          break;

        case 'lalt':
          keyElement.textContent = 'Alt';
          keyElement.id = 'AltLeft';
          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
          });
          break;

        case 'alt':
          keyElement.textContent = 'Alt';
          keyElement.id = 'AltRight';
          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
          });
          break;

        case 'enter':
          keyElement.classList.add('keyboard__key--wide');
          keyElement.id = 'enter';
          keyElement.textContent = 'Enter';

          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-3.mp3');
            textarea.setRangeText('\n', textarea.selectionStart, textarea.selectionEnd, 'end');
          });
          break;

        case ' ':
          keyElement.classList.add('keyboard__key--extra-wide');
          keyElement.textContent = ' ';
          keyElement.id = 'Space';

          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
            textarea.setRangeText(' ', textarea.selectionStart, textarea.selectionEnd, 'end');
          });
          break;

        case 'darr':
          keyElement.textContent = '↓';
          keyElement.id = 'ArrowDown';

          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
            this.setCursorPos('end');
          });
          break;

        case 'uarr':
          keyElement.textContent = '↑';
          keyElement.id = 'ArrowUp';

          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
            this.setCursorPos('start');
          });
          break;

        case 'larr':
          keyElement.textContent = '←';
          keyElement.id = 'ArrowLeft';

          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
            this.setCursorPos('left');
          });
          break;

        case 'rarr':
          keyElement.textContent = '→';
          keyElement.id = 'ArrowRight';

          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
            this.setCursorPos('right');
          });
          break;

        case 'on/off':
          keyElement.classList.add('keyboard__key--dark', 'off', 'keyboard__key--activatable', 'keyboard__key--active');
          keyElement.id = 'off';
          keyElement.append(document.createElement('img'));
          keyElement.children[0].src = onOffIcon;
          keyElement.children[0].alt = 'OFF';
          keyElement.children[0].width = '20';
          keyElement.children[0].height = '20';

          keyElement.addEventListener('click', () => {
            this.soundClick('./assets/audio/switch-10.mp3');
            this.hideKeyboard();
            keyElement.classList.remove('keyboard__key--active');
          });
          break;

        case 'sound':
          keyElement.classList.add('keyboard__key--dark', 'sound', 'keyboard__key--activatable');
          keyElement.id = 'sound';
          keyElement.append(document.createElement('img'));
          keyElement.children[0].src = soundOffIcon;
          keyElement.children[0].alt = 'sound';
          keyElement.children[0].width = '20';
          keyElement.children[0].height = '20';
          keyElement.addEventListener('click', () => {
            this.toggleSound();
            this.soundClick('./assets/audio/switch-10.mp3');
          });
          break;

        case 'mic':
          keyElement.classList.add('keyboard__key--dark', 'mic', 'keyboard__key--activatable');
          keyElement.id = 'mic';
          keyElement.append(document.createElement('img'));
          keyElement.children[0].src = './assets/img/mic.svg';
          keyElement.children[0].alt = 'mic';

          keyElement.addEventListener('click', () => {
            this.toggleMic();
            this.soundClick('./assets/audio/switch-10.mp3');
          });
          break;

        default:
          keyElement.textContent = key.toLowerCase();

          keyElement.addEventListener('click', () => {
            textarea.setRangeText(keyElement.textContent, textarea.selectionStart, textarea.selectionEnd, 'end');
            this.soundClick('./assets/audio/switch-10.mp3');

            textarea.dispatchEvent(new Event('input'));
          });
          break;
      }

      fragment.appendChild(keyElement);

      if (insertLineBreak) {
        fragment.appendChild(document.createElement('br'));
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 600) {
        document.querySelector('#Caps').textContent = 'Caps';
        document.querySelector('#Backspace').textContent = 'Del';
        document.querySelector('#ControlRight').style.setProperty('letter-spacing', '-1px');
      } else {
        document.querySelector('#Caps').textContent = 'CapsLock';
        document.querySelector('#Backspace').textContent = 'Backspace';
        document.querySelector('#ControlRight').style.setProperty('letter-spacing', '0');
      }
    });

    return fragment;
  }

  hideKeyboard() {
    this.elements.keysContainer.classList.add('hidden');
    // textarea.blur();
    setTimeout(() => {
      this.elements.main.classList.add('goDown');
    }, 200);
  }

  showKeyboard() {
    this.elements.keysContainer.classList.remove('hidden');
    this.elements.main.classList.remove('goDown');
    document.querySelector('#off').classList.add('keyboard__key--active');
  }

  toggleKeyboard() {
    const keyboard = this.elements.main;
    if (keyboard.classList.contains('goDown')) this.showKeyboard();
    else this.hideKeyboard();
  }

  setCursorPos(pos) {
    if ('selectionStart' in textarea) {
      switch (pos) {
        case 'left':
          textarea.selectionStart -= 1;
          break;

        case 'right':
          textarea.selectionStart += 1;
          break;

        case 'start':
          textarea.selectionStart = 0;
          break;

        default:
          textarea.selectionStart = textarea.textLength;
          break;
      }
      textarea.selectionEnd = textarea.selectionStart;
    }
    return this.properties.value;
  }

  // Input from real keyboard
  phisycalInput() {
    const {
      whichCodes,
    } = this.elements.layouts;
    const {
      capsLock,
      shift,
    } = this.properties;
    const keySet = [];
    this.elements.keys.forEach((key) => {
      keySet.push(key.textContent);
    });

    document.onkeydown = (event) => {
      const pos = whichCodes.indexOf(event.which);
      const inputChar = pos > -1 ? keySet[pos].toLowerCase() : event.key;
      let counter = -1;

      document.querySelectorAll('.keyboard__key').forEach((key) => {
        counter += 1;
        if (key.innerText === event.code || event.code === key.id || pos === counter) {
          key.classList.add('red');
          if (event.key === 'AltGraph')(document.querySelector('#ControlLeft').classList.remove('red'));
        }
      });

      switch (event.key) {
        case 'Enter':
        case 'Backspace':
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'CapsLock':
        case 'Delete':
          break;

        case 'Shift':
          this.shiftPress();
          document.querySelector('#Shift').classList.add('red');
          break;

        case 'Tab':
          event.preventDefault();
          // textarea
          //   .setRangeText('\t', textarea.selectionStart, textarea.selectionEnd, 'end');
          break;

        case 'Alt':
          event.preventDefault();
          this.properties.alt = true;
          break;

        case 'AltGraph':
          event.preventDefault();
          this.properties.altGraph = true;
          this.properties.alt = false;
          this.properties.control = true;
          break;

        case 'Control':
          event.preventDefault();
          this.properties.control = true;
          if (this.properties.shift) this.toggleLang();
          break;

        default:
          event.preventDefault();
          if (event.key.length === 1) {
            if (capsLock === shift) {
              textarea
                .setRangeText(inputChar, textarea.selectionStart, textarea.selectionEnd, 'end');
            } else {
              textarea
                .setRangeText(inputChar.toUpperCase(), textarea.selectionStart, textarea.selectionEnd, 'end');
            }
            textarea.dispatchEvent(new Event('input'));
          }
          break;
      }
    };

    document.onkeyup = (event) => {
      const pos = whichCodes.indexOf(event.which);
      let counter = -1;

      switch (event.key) {
        case 'Tab':
          this.soundClick('./assets/audio/switch-10.mp3');
          break;

        case 'Enter':
          this.soundClick('./assets/audio/switch-3.mp3');
          break;

        case 'Backspace':
          this.soundClick('./assets/audio/switch-4.mp3');
          break;

        case 'Shift':
          this.soundClick('./assets/audio/switch-4.mp3');
          this.shiftUnpress();
          document.querySelector('#Shift').classList.remove('red');
          if (this.properties.control || this.properties.alt) this.toggleLang();
          break;

        case 'CapsLock':
          this.soundClick('./assets/audio/switch-2.mp3');
          document.querySelector('#Caps').classList.toggle('keyboard__key--active', !this.properties.capsLock);
          this.toggleCapsLock();
          break;

        case 'Alt':
          event.preventDefault();
          if (this.properties.shift) this.toggleLang();
          this.properties.alt = false;
          this.soundClick('./assets/audio/switch-10.mp3');
          break;

        case 'AltGraph':
          this.soundClick('./assets/audio/switch-10.mp3');
          this.properties.altGraph = false;
          this.properties.alt = false;
          this.properties.control = false;
          break;

        case 'Control':
          if (!this.properties.altGraph && this.properties.control) this.soundClick('./assets/audio/switch-10.mp3');
          this.properties.control = false;
          break;

        default:
          this.soundClick('./assets/audio/switch-10.mp3');
          break;
      }

      document.querySelectorAll('.keyboard__key').forEach((key) => {
        counter += 1;
        if (key.innerText === event.code || event.code === key.id || pos === counter) {
          key.classList.remove('red');
        }
        if (event.key === 'Shift') {
          this.shiftUnpress();
        }
      });
    };
  }

  toggleSound() {
    const {
      sound,
    } = this.properties;
    const soundBtn = document.querySelector('#sound');
    if (sound) {
      soundBtn.classList.remove('keyboard__key--active');
      soundBtn.children[0].src = soundOffIcon;
    } else {
      soundBtn.classList.add('keyboard__key--active');
      soundBtn.children[0].src = soundOnIcon;
    }
    this.properties.sound = !sound;
    localStorage.sound = !sound;
  }

  toggleMic() {
    const {
      micOn,
    } = this.properties;
    const micBtn = document.querySelector('#mic');
    if (micOn) {
      micBtn.classList.remove('keyboard__key--active', 'pressed');
    } else {
      micBtn.classList.add('keyboard__key--active', 'pressed');
    }
    this.properties.micOn = !micOn;
  }

  soundClick(sound) {
    const src = this.properties.english ? `${sound.slice(0, -4)}-en.mp3` : sound;
    const audio = new Audio(src);
    if (this.properties.sound) {
      audio.play();
    }
  }

  toggleLang() {
    const {
      ru,
      ruShifted,
      en,
      enShifted,
    } = this.elements.layouts;
    const {
      capsLock,
      shift,
      english,
    } = this.properties;
    const {
      keys,
    } = this.elements;
    const langButtonText = document.getElementById('lang').textContent;

    for (let index = 0; index < keys.length; index += 1) {
      const buttonIsSymbol = en[index].length === 1;
      // Change only symbol buttons
      if (buttonIsSymbol) {
        if (english) {
          if (capsLock) {
            keys[index].textContent = shift ? ruShifted[index] : ru[index].toUpperCase();
          } else {
            keys[index].textContent = shift ? ruShifted[index] : ru[index];
          }
        }
        if (!english) {
          if (capsLock) {
            keys[index].textContent = shift ? enShifted[index] : en[index].toUpperCase();
          } else {
            keys[index].textContent = shift ? enShifted[index] : en[index];
          }
        }
      }
    }

    if (langButtonText === 'EN') {
      document.getElementById('lang').textContent = 'RU';
    } else document.getElementById('lang').textContent = 'EN';

    localStorage.setItem('english', !this.properties.english);
    this.properties.english = !this.properties.english;

    this.phisycalInput();
  }
}
