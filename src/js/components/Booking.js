
import {select, templates, settings, classNames} from '../settings.js';
import {utils} from '../utils.js';
import {AmountWidget} from './AmountWidget.js';
import {DatePicker} from './DatePicker.js';
import {HourPicker} from './HourPicker.js';

export class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();
  }
  render(element){
    const thisBooking = this;
    // generowanie HTML za pomocą szablonu templates.bookingWidget
    const generatedHTML = templates.bookingWidget();

    // tworzyć pusty obiekt thisBooking.dom,
    thisBooking.dom = {};

    // zapisać do tego obiektu właściwość wrapper równą otrzymanemu argumentowi,
    thisBooking.dom.wrapper = element;

    // //zawartość wrappera zamieniać na kod HTML wygenerowany z szablonu,
    thisBooking.dom.wrapper.innerHTML = generatedHTML; // tu był błąd
    // inner HTML podmienia tresc elementu

    // we właściwości thisBooking.dom.peopleAmount zapisywać pojedynczy element znaleziony we wrapperze i pasujący do selektora
    thisBooking.dom.peopleAmount = element.querySelector(select.booking.peopleAmount);

    // analogicznie do peopleAmount znaleźć i zapisać element dla hoursAmount.
    thisBooking.dom.hoursAmount = element.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = element.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = element.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = element.querySelectorAll(select.booking.tables);

  }
  initWidgets(){
    const thisBooking = this;

    // metoda initWidgets we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget,
    // którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom.
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    // W metodzie initWidgets dodaj dla wrappera listener eventu updated, którego handler wywołuje metodę updateDOM.
    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

  }
  getData(){
    const thisBooking = this;

    // Najpierw tworzymy obiekt zawierający daty minDate i maxDate, ustawione w widgecie wyboru daty. To dobre źródło tych wartości, ponieważ potrzebujemy informacji tylko dla dat, które można wybrać w date-pickerze.
    const startEndDates = {};
    startEndDates[settings.db.dateStartParamKey] = utils.dateToStr(thisBooking.datePicker.minDate);
    startEndDates[settings.db.dateEndParamKey] = utils.dateToStr(thisBooking.datePicker.maxDate);

    // Następnie tworzymy obiekt endDate, który zawiera wyłącznie datę końcową. Kluczami w obu tych obiektach są parametry zapisane w settings.db – czyli ciągi znaków 'date_lte' i 'date_gte'. Do uzyskania dat w postaci 2019-01-01 wykorzystaliśmy kolejną z przygotowanych przez nas funkcji pomocniczych – utils.dateToStr.
    const endDate = {};
    endDate[settings.db.dateEndParamKey] = startEndDates[settings.db.dateEndParamKey];

    // Wreszcie, całość składamy w całość w obiekcie params, który ma po jednej właściwości dla każdego rodzaju danych, które będą nam potrzebne. Dodaliśmy też console.log – zobacz w konsoli, jak wyglądają przygotowane przez nas parametry zapytań do API.
    const params = {
      booking: utils.queryParams(startEndDates),
      eventsCurrent: settings.db.notRepeatParam + '&' + utils.queryParams(startEndDates),
      eventsRepeat: settings.db.repeatParam + '&' + utils.queryParams(endDate),
    };

    //console.log('getData params', params);

    // pełne adresy zapytań, bardzo podobne do przykładowych, które podaliśmy powyżej. Różnią się od nich głównie datami, a także brakiem przedrostka http: – pominięcie go pozwala na używanie tego samego adresu zarówno na stronach wykorzystujących protokół HTTP (nieszyfrowany), jak i HTTPS (szyfrowany).
    const urls = {
      booking: settings.db.url + '/' + settings.db.booking + '?' + params.booking,
      eventsCurrent: settings.db.url + '/' + settings.db.event + '?' + params.eventsCurrent,
      eventsRepeat: settings.db.url + '/' + settings.db.event + '?' + params.eventsRepeat,
    };

    //console.log('getData urls', urls);

    // Teraz chcielibyśmy wysłać zapytania pod te trzy adresy, i wykonać jakieś operacje dopiero kiedy wszystkie trzy zwrócą nam odpowiedzi
    // używamy Promise.all dwukrotnie. Najpierw z pomocą tej metody wysyłamy trzy zapytania pod przygotowane wcześniej adresy. Następnie, w pierwszym .then, ponownie używamy Promise.all, aby sparsować odpowiedzi wszystkich trzech zapytań.
    // Nowością jest też to, że dzięki zastosowaniu Promise.all, obie funkcje w metodach .then otrzymują jeden argument, który jest tablicą.
    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function([bookingsResponse, eventsCurrentResponse, eventsRepeatResponse]){
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      // Po przetworzeniu odpowiedzi z API na obiekty, przekazujemy je do metody thisBooking.parseData, którą za chwilę napiszemy.
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {     // do omowienia całe
    const thisBooking = this;

    thisBooking.booked = {};
    //console.log('eventsCurrent', eventsCurrent);

    for (let event of eventsCurrent) {
      //console.log('event from eventsCurrent', event);
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }

    for (let event of bookings) {
      //console.log('event from bookings', event);
      thisBooking.makeBooked(event.date, event.hour, event.duration, event.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let event of eventsRepeat) {
      //console.log('event from eventsRepeat', event);
      if (event.repeat == 'daily') {
        for (let eventDate = minDate; eventDate <= maxDate; eventDate = utils.addDays(eventDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(eventDate), event.hour, event.duration, event.table);
        }
      }
    }
    console.log('thisBooking.booked', thisBooking.booked);

    // komunikat updateDOM nie wyświetla się jednak, jeśli po odświeżeniu strony nie zmienimy daty ani godziny. Aby temu zaradzić, dodaj wywołanie metody updateDOM na końcu metody parseData.
    thisBooking.updateDOM();

  }
  makeBooked(date, hour, duration, table) {           // do omowienia całe
    const thisBooking = this;
    if (typeof (thisBooking.booked[date]) == 'undefined') {
      thisBooking.booked[date] = {};
    }
    //console.log(thisBooking.booked[date]);

    const bookedHour = utils.hourToNumber(hour);

    for (let hourBlock = bookedHour; hourBlock < bookedHour + duration; hourBlock += 0.5) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
        //console.log('thisBooking.booked[date][hourBlock]: ', thisBooking.booked[date][hourBlock]);
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }
  updateDOM() {   // do omowienia całe
    const thisBooking = this;

    console.log('updated dom');

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (typeof thisBooking.booked[thisBooking.date] !== 'undefined' &&
        typeof thisBooking.booked[thisBooking.date][thisBooking.hour] !== 'undefined' &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].indexOf(tableId) > -1) {

        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        table.classList.remove(classNames.booking.tableChoosed);
      }
    }
  }
}
