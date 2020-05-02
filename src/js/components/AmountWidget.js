
import {settings, select} from '../settings.js';
import {BaseWidget} from './BaseWidget.js';

export class AmountWidget extends BaseWidget {     //dziedziczenie klas, dodaliśmy informację, że jest ona rozszerzeniem klasy BaseWidget,
  constructor(wrapper){

    super(wrapper, settings.amountWidget.defaultValue); // wywołania funkcji super. Pod tą nazwą kryje się konstruktor klasy BaseWidget. Właśnie dlatego podaliśmy mu dwa argumenty: element który jest wrapperem widgetu, oraz domyślną wartość odczytaną z obiektu settings.

    const thisWidget = this;

    thisWidget.getElements();
    thisWidget.initActions();
    thisWidget.value = settings.amountWidget.defaultValue;
    //thisWidget.setValue(thisWidget.input.value);
    //console.log('AmountWidget', thisWidget);
    //console.log('constructor arguments', element);
  }
  getElements(){  // Nie musimy też przekazywać argumentu metodzie getElements, ponieważ super (czyli konstruktor klasy BaseWidget) już zapisał argument wrapper we właściwości thisWidget.dom.wrapper.
    const thisWidget = this;

    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  isValid(newValue) {   // W metodzie isValid chcemy sprawdzić, czy ustawiana wartość jest poprawna.
    // Ta metoda ma zwrócić prawdę lub fałsz, więc po słowie return wpisujemy warunek – jest to funkcja isNaN (wbudowana w przeglądarkę), która zwraca prawdę, jeśli przekazano jej wartość NaN. Zanegowaliśmy tę funkcję za pomocą wykrzyknika !, ponieważ chcemy aby prawda oznaczała "to nie jest NaN".
    return !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax;
  }
  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.value = thisWidget.dom.input.value;
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.value--;
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.value++;
    });
  }
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }
}
