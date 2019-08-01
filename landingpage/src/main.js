import { ConversationalForm, FlowEvents, EventDispatcher } from 'conversational-form';
import {
  TweenLite,
} from 'gsap/TweenMax';
import loadcss from 'loadcss';
import Tracking from './tracking';
import 'reset-css';
import './scss/main.scss';

const animTime = 0.8;
const themes = [
  'conversational-form-dark.min.css',
  'conversational-form.min.css',
  'conversational-form-purple.min.css',
  'conversational-form-irisblue.min.css',
  'conversational-form-red.min.css',
  'conversational-form-green.min.css',
];
let currentTheme = themes[0];

function preloadFormImages() {
  const images = [].slice.call(document.querySelectorAll('form *[cf-image]'));
  // eslint-disable-next-line no-return-assign
  images.map(el => (new Image()).src = el.getAttribute('cf-image'));
}

function loadThemes() {
  console.log('loadThemes');

  loadcss(themes.map(t => `./${t}`), (links) => {
    links.forEach(link => console.log(link));

    const stylesheets = [].slice.call(document.styleSheets);
    stylesheets.map((s, i) => {
      console.log(i, s.href);
      const filename = s.href.substring(s.href.lastIndexOf('/') + 1);
      if (
        filename.indexOf('conversational-form') > -1
        && filename.indexOf(themes[0]) === -1
        && filename.indexOf('main.') === -1
      ) {
        document.styleSheets[i].disabled = true;
      }
      return s;
    });
  });
}

function changeTheme(themeName) {
  if (currentTheme === themeName) return;

  console.log('changeTheme', currentTheme, themeName);
  const stylesheets = [].slice.call(document.styleSheets);
  stylesheets.map((s, i) => {
    const filename = s.href.substring(s.href.lastIndexOf('/') + 1);
    console.log('t', filename);
    if (
      document.styleSheets[i].disabled === false
      && filename.indexOf('conversational-form') > -1
    ) {
      console.log('disable theme', document.styleSheets[i].href);
      document.styleSheets[i].disabled = true;
    } else if (filename.indexOf(themeName) > -1) {
      document.styleSheets[i].disabled = false;
      currentTheme = themeName;
      console.log('enable theme', document.styleSheets[i].href);
    }

    return s;
  });
}

function animateIn() {
  const headerEl = document.querySelector('header');
  const headlineEl = document.querySelector('h1');
  const cfEl = document.querySelector('.cf');
  const aboutEl = document.querySelector('.about');

  if (
    window.innerHeight < 780
  ) {
    TweenLite.set(
      headlineEl,
      {
        css: {
          scale: 0.68,
          'margin-top': 60,
          'margin-bottom': 60,
        },
      },
    );
  }

  TweenLite.set(headerEl, { y: 10 });
  TweenLite.to(
    headerEl,
    animTime / 2,
    {
      opacity: 1,
      y: 0,
    },
  );

  TweenLite.set(headlineEl, { y: 20 });
  TweenLite.to(
    headlineEl,
    animTime,
    {
      opacity: 1,
      y: 0,
      // onComplete: scaleDownHeader(headlineEl),
      delay: animTime / 2,
    },
  );

  TweenLite.set(cfEl, { y: 40 });
  TweenLite.to(
    cfEl,
    animTime * 1.2,
    {
      opacity: 1,
      y: 0,
      delay: animTime,
    },
  );

  setTimeout(
    () => {
      window.ConversationalForm.start();
    },
    animTime * 0.6 * 1000,
  );

  TweenLite.to(
    aboutEl,
    animTime * 3,
    {
      opacity: 1,
      delay: animTime * 2,
    },
  );
}

function init() {
  loadThemes();
  changeTheme(themes[1]);
  preloadFormImages();
  Tracking.registerAllExternalLinks();

  const wrapperEl = document.querySelector('.wrapper');
  const formEl = document.querySelector('.form');
  const cfEl = document.querySelector('.cf');
  const dispatcher = new EventDispatcher();

  // We manually stop form execution if users bails on us
  dispatcher.addEventListener(FlowEvents.FLOW_UPDATE, (event) => {
    console.log(event);
    if (event.detail.tag.name === 'ending') {
      window.ConversationalForm.flowManager.stop();
      document.querySelector('#conversational-form').style['pointer-events'] = 'none';
    }
  }, false);

  const cfInstance = new ConversationalForm({
    formEl,
    context: cfEl,
    loadExternalStyleSheet: false,
    preventAutoFocus: true,
    preventAutoStart: true,
    eventDispatcher: dispatcher,
    submitCallback: () => {
      const formDataSerialized = cfInstance.getFormData(true);
      console.log('done', formDataSerialized);
      if (
        formDataSerialized.getstarted
        && formDataSerialized.getstarted.indexOf('no') === -1
      ) {
        cfInstance.addRobotChatResponse('Ok. Thank you for trying out Conversational Form.');
      }
    },
    flowStepCallback: (dto, success) => {
      Tracking.event('conversational form example', dto.tag.name, dto.tag.value);

      if (dto.tag.name === 'theme') changeTheme(dto.tag.value[0]);

      setTimeout(() => {
        if (
          dto.tag.name !== 'changeThemeAgain'
          || (
            dto.tag.name === 'changeThemeAgain'
            && dto.tag.value[0] !== 'yes'
          )
        ) {
          success();
        }

        if (
          dto.tag.name === 'changeThemeAgain'
          && dto.tag.value[0] === 'yes'
        ) {
          window.ConversationalForm.remapTagsAndStartFrom(3);
        }
      }, 0);
    },
  });

  TweenLite.to(
    wrapperEl,
    1,
    {
      opacity: 1,
      delay: animTime / 2,
      onComplete: animateIn,
    },
  );
}

document.addEventListener('DOMContentLoaded', init);
