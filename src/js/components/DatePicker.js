/*global flatpickr*/

import {BaseWidget} from './BaseWidget.js';
import {utils} from '../utils.js';
import {select,settings} from '../settings.js';

export class DatePicker extends BaseWidget {
  constructor(wrapper){
    super(wrapper, utils.dateToStr(new Date())); //wywolanie constructora basewidgeta

    const thisWidget = this;

    thisWidget.dom.input = wrapper.querySelector(select.widgets.datePicker.input);

    thisWidget.initPlugin();
  }
  initPlugin(){
    const thisWidget = this;

    thisWidget.minDate = new Date(thisWidget.value);
    thisWidget.maxDate = new Date(utils.addDays(thisWidget.minDate, settings.datePicker.maxDaysInFuture));   // do omówienia!

    flatpickr(thisWidget.dom.input, {
      minDate: thisWidget.minDate,
      maxDate: thisWidget.maxDate,
      defaultDate: thisWidget.minDate,
      'disable': [
        function(date) {         // funkcja blokuje poniedzialek np, https://flatpickr.js.org/examples/#disabling-dates-by-a-function
          // return true to disable
          //return (date.getDay() === 0 || date.getDay() === 6);
          return (date.getDay() === 1);
        }
      ],
      'locale': {
        'firstDayOfWeek': 1 // start week on Monday
      },
      onChange: function (selectedDates, dateStr) {    // w momencie wykrycia zmiany wartości przez plugin, chcemy ustawiać wartość właściwości thisWidget.value na dateStr
        thisWidget.value = dateStr;
      },
    }); // Ogólna składania uruchomienia tego pluginu wygląda następująco: flatpickr(element, options damy sobie w obiekcie {});

  }
  parseValue(newValue) {         // metoda parseValue nie może pozostać domyślna, ponieważ wartością tego pluginu nie będzie liczba, więc musimy ją nadpisać tak, aby po prostu zwracała otrzymany argument, nie wykonując na nim żadnych operacji,
    return newValue;
  }
  isValid() {                    // metoda isValid też nie może pozostać domyślna, ale nie mamy dla niej zastosowania w tym widgecie, ponieważ plugin zajmie się dbaniem o poprawność danych, więc niech po prostu zwraca prawdę (true),
    return true;
  }
  renderValue(){                 // metoda renderValue również nie będzie nam potrzebna – możesz ją stworzyć z pustą wartością, tylko po to, aby nadpisać domyślną metodę w BaseWidget
  }
}
