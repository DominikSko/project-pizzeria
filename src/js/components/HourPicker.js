
import {BaseWidget} from './BaseWidget.js';
import {utils} from '../utils.js';
import {select,settings} from '../settings.js';

export class HourPicker extends BaseWidget{
  constructor(wrapper){
    super(wrapper, settings.hours.open);

    const thisWidget = this;

    thisWidget.dom.input = wrapper.querySelector(select.widgets.hourPicker.input);
    thisWidget.dom.output = wrapper.querySelector(select.widgets.hourPicker.output);

    thisWidget.initPlugin();
    thisWidget.value = thisWidget.dom.input.value;   // Aby po odświeżeniu strony była od razu widoczna godzina, musisz jeszcze na końcu konstruktora, pod wywołaniem metody initPlugin, dodać to samo przypisanie wartości, którego użyliśmy w handlerze eventu.
  }
  initPlugin(){
    const thisWidget = this;
    // Do uruchomienia pluginu wystarczy jedna linia kodu:
    rangeSlider.create(thisWidget.dom.input);

    thisWidget.dom.input.addEventListener('input', function(){
      thisWidget.value = thisWidget.dom.input.value;   // W handlerze tego eventu przypisz wartości widgetu (thisWidget.value) wartość tego elementu.
    });
  }
  parseValue(newValue){   // Metoda parseValue ma przekazywać otrzymaną wartość do funkcji utils.numberToHour i zwracać wartość otrzymaną z tej funkcji. Ta funkcja zamienia liczby na zapis godzinowy, czyli np. 12 na '12:00', a 12.5 na '12:30'.
    return utils.numberToHour(newValue);
  }
  isValid(){              // Metoda isValid może zawsze zwracać prawdę true
    return true;
  }
  renderValue(){
    const thisWidget = this;
    // Metoda renderValue ma zamieniać zawartość elementu thisWidget.dom.output na wartość widgetu.
    thisWidget.dom.output.innerHTML = thisWidget.value; // INNER HTML PAMIĘTAĆ !! zawartość
  }
}
