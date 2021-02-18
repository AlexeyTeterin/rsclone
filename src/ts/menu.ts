import { tabs } from './dom_elements';
import { wait } from './utils';

const animateTabChange = (current: Element, target: Element) => {
  current?.classList.remove('show');
  wait(150).then(() => {
    current?.classList.remove('active');
    target?.classList.add('active');
  });
  wait(200).then(() => target?.classList.add('show'));

  if (current?.id === 'top101') current?.classList.add('visually-hidden');
  if (target?.id === 'top101') target?.classList.remove('visually-hidden');
};

const onNavLinkClick = (event: Event) => {
  const target = event.target! as HTMLElement;
  const isNavLinkClick = target.classList.contains('nav-link');
  const currentTab = tabs.find((tab) => tab.classList.contains('active'))!;
  const targetTab = tabs
    .find((elem) => {
      const tab = elem as HTMLElement;
      const isTargetTab = target.id.indexOf(tab.dataset.id!) >= 0;
      return isTargetTab ? tab : null;
    })!;

  if (!isNavLinkClick) return;

  animateTabChange(currentTab, targetTab);
};

export default onNavLinkClick;
