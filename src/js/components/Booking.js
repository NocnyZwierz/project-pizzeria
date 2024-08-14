import { classNames, select, settings, templates } from '../settings.js'; 
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
    this.getData();
  }
  getData () {
    const thisBookings = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBookings.datePicker.minDate);
    const endDateParams = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBookings.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParams,
        
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParams,
      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParams,
      ],
    };

    const urls = {
      booking:       settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events   + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events   + '?' + params.eventsRepeat.join('&'),
    }

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),

        ])
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBookings.parseData(bookings, eventsCurrent, eventsRepeat);
      }) 
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBookings = this;

    thisBookings.booked ={};

    for(let item of bookings) {
      thisBookings.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent) {
      thisBookings.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    //BĄDŹ UWAŻNY co piszesz!!!!
    const minDate = thisBookings.datePicker.minDate;
    const maxDate = thisBookings.datePicker.maxDate;


    for(let item of eventsRepeat) {
      if(item.repeat == 'daily') {
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBookings.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBookings.updateDOM();
  }

  // LITERÓWKI !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! PILNU SIĘ przykładaj uwagę do szczegółów!!!!!!!!!!!!!!!!
  makeBooked(date, hour, duration, table) {
    const thisBookings = this;

    if(typeof thisBookings.booked[date] == 'undefined') {
      thisBookings.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if(typeof thisBookings.booked[date][hourBlock] == 'undefined') {
        thisBookings.booked[date][hourBlock] = [];
      }
      thisBookings.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBookings = this;
  
    thisBookings.date = thisBookings.datePicker.value;
    thisBookings.hour = utils.hourToNumber(thisBookings.hourPicker.value);
  
    console.log('Date:', thisBookings.date);
    console.log('Hour:', thisBookings.hour);
    console.log('Booked:', thisBookings.booked);
  
    let allAvailable = false;
  
    if (
      typeof thisBookings.booked[thisBookings.date] == 'undefined'
      ||
      typeof thisBookings.booked[thisBookings.date][thisBookings.hour] == 'undefined'
    ){
      allAvailable = true;
    }
  
    for(let table of thisBookings.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }
  
      if(
        !allAvailable
        &&
        thisBookings.booked[thisBookings.date][thisBookings.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  render(element) {
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.innerHTML = templates.bookingWidget();

    this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount); 
    this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);

    this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables);
  }

  initWidgets() {
    const thisBookings = this;

    this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
    this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
    this.datePicker = new DatePicker(this.dom.datePicker);
    this.hourPicker = new HourPicker(this.dom.hourPicker);

    this.dom.peopleAmount.addEventListener('updated', function() {
      thisBookings.updateDOM();
    });

    this.dom.hoursAmount.addEventListener('updated', function() {
      thisBookings.updateDOM();
    });
  }
}

export default Booking;