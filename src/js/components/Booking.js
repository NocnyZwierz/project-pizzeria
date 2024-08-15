import { classNames, select, settings, templates } from '../settings.js'; 
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    this.selectedTable = null; //zeby wiedzieć czy był wybrany czy nie
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
  
    let allAvailable = false;
  
    if (
      typeof thisBookings.booked[thisBookings.date] == 'undefined'
      ||
      typeof thisBookings.booked[thisBookings.date][thisBookings.hour] == 'undefined'
    ) {
      allAvailable = true;
    }
  
    for (let table of thisBookings.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }
  
      if (
        !allAvailable &&
        thisBookings.booked[thisBookings.date][thisBookings.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  
    // Resetowanie wybranego stolika po zmianie godziny i daty
    if (thisBookings.selectedTable) {
      const selectedTableElement = thisBookings.dom.wrapper.querySelector('.selected');
      if (selectedTableElement) {
        selectedTableElement.classList.remove('selected');
      }
      thisBookings.selectedTable = null;
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

    this.dom.tables = this.dom.wrapper.querySelectorAll(select.booking.tables); // pod stoliczek
  }

  selectTable(event) { // obsługa stoliczka
    const thisBookings = this;
  
    const clickedElement = event.target; // pobieramy element który został kliknięty
    const tableId = clickedElement.getAttribute(settings.booking.tableIdAttribute); // pobieramy Id stolika kliknietego
    // sprawdzamy czy stolik jest zajęty
    if (!clickedElement.classList.contains(classNames.booking.tableBooked)) {
      if (thisBookings.selectedTable == tableId) { // Sprawdzamy, czy aktualnie wybrany stolik jest tym samym, który został kliknięty
        clickedElement.classList.remove('selected'); // Jeśli tak, to odznaczamy ten stolik (usuwamy klasę 'selected')
        thisBookings.selectedTable = null;  // Resetujemy wartość `selectedTable` do `null`, ponieważ żaden stolik nie jest teraz wybrany
      } else {
        if (thisBookings.selectedTable != null) {// Jeśli inny stolik był już wybrany, usuwamy z niego klasę 'selected'
          const prevSelectedTable = this.dom.wrapper.querySelector('.selected'); // Znajdujemy poprzednio wybrany stolik za pomocą selektora
          if (prevSelectedTable) {  // Jeśli taki stolik istnieje, usuwamy z niego klasę 'selected'
            prevSelectedTable.classList.remove('selected');
          }
        }
        clickedElement.classList.add('selected'); // Dodajemy klasę 'selected' do nowo klikniętego stolika
        thisBookings.selectedTable = tableId; // Ustawiamy `selectedTable` na ID nowo wybranego stolika
      }
    } else { // komunikat na stronie że zajęte
      alert('Stolik zajęty!');
    } // no z tym to się namęczyłem ale jakoś działa
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    // tak jak w cart
    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.selectedTable ? parseInt(thisBooking.selectedTable) : null,
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: [],
      phone: thisBooking.dom.wrapper.querySelector('[name="phone"]').value,
      address: thisBooking.dom.wrapper.querySelector('[name="address"]').value,
    };

    // Pobranie wybranych starterów
    const starters = thisBooking.dom.wrapper.querySelectorAll('[name="starter"]:checked');
    for (let starter of starters) {
      payload.starters.push(starter.value);
    }
    //struktura podobna jak w cart tylko trzeba było dostosować do nowej funkcji
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then((response) => response.json())
      .then((parsedResponse) => {
        console.log('Booking response:', parsedResponse);

        // Dodanie rezerwacji do thisBookings.booked przy użyciu makeBooked
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);

        thisBooking.updateDOM();
      });
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
  
    this.dom.datePicker.addEventListener('updated', function() {
      thisBookings.updateDOM();
    });
  
    this.dom.hourPicker.addEventListener('updated', function() {
      thisBookings.updateDOM();
    });
    // Podobnie jak z wysyłką z cart
    this.dom.wrapper.querySelector('.booking-form').addEventListener('submit', function(event) {
      event.preventDefault(); // zapobiegamy domyślnej akcji submit
      thisBookings.sendBooking();
    });
    // Podpięcie event listenera do wszystkich stolików
    for (let table of thisBookings.dom.tables) {
      table.addEventListener('click', function(event) {
        thisBookings.selectTable(event);
      });
    }
  }
  
}

export default Booking;