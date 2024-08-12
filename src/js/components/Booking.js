import { select, templates } from '../settings.js'; 
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
  }

  render(element) {
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = templates.bookingWidget();

    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount); 
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
  }

  initWidgets() {
    this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);

    this.dom.peopleAmount.addEventListener('updated', function() {
      // callback na razie pusty
    });

    this.dom.hoursAmount.addEventListener('updated', function() {
      // callback na razie pusty
    });
  }
}

export default Booking;