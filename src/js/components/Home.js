import { templates } from '../settings.js';
// import Flickity from 'flickity.js';


class Home {
  constructor(element, appInstance) {
    this.app = appInstance; 
    this.render(element);
    this.initWidgets();
  }

  render(element) {
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.wrapper = element;

    const generatedHTML = templates.homeContent();
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.orderOnline = thisHome.dom.wrapper.querySelector('#order-online');
    thisHome.dom.bookTable = thisHome.dom.wrapper.querySelector('#book-table');
    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector('.carousel');
  }

  initWidgets() {
    const thisHome = this;
    // doslownie z instrukci
    var elem = document.querySelector('.main-carousel');
    var flkty = new Flickity( elem, {
      // options
      cellAlign: 'left',
      contain: true
    });

    thisHome.dom.orderOnline.addEventListener('click', function () {
      window.location.hash = '#/order';
      thisHome.app.activatePage('order');
    });

    thisHome.dom.bookTable.addEventListener('click', function () {
      window.location.hash = '#/booking';
      thisHome.app.activatePage('booking');
    });
  }
}

export default Home;