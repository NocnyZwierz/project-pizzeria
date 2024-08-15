import { templates } from '../settings.js'; // Importuj odpowiednie moduły, tak jak w klasie Booking

class Home {
  constructor(element) {
    this.render(element);
    this.initWidgets();
  }

  render(element) {
    // Metoda renderująca widok na podstawie szablonu
    const thisHome = this;

    thisHome.dom = {};
    thisHome.dom.wrapper = element;

    // Wygenerowanie HTML na podstawie szablonu
    const generatedHTML = templates.homeContent();
    thisHome.dom.wrapper.innerHTML = generatedHTML;

    // Pobranie referencji do istotnych elementów DOM
    thisHome.dom.orderOnline = thisHome.dom.wrapper.querySelector('#order-online');
    thisHome.dom.bookTable = thisHome.dom.wrapper.querySelector('#book-table');
    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector('.carousel');
  }

  initWidgets() {
    const thisHome = this;


  }
}

export default Home;