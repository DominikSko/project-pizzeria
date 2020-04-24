
import {settings, select} from '../settings.js';

export class AmountWidget{      // do omówienia
  constructor(element){
    const thisWidget = this;

    thisWidget.getElements(element);
    thisWidget.value = settings.amountWidget.defaultValue;
    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();
    //console.log('AmountWidget', thisWidget);
    //console.log('constructor arguments', element);
  }
  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
  }
  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);

    // walidacja DO OMÓWIENIA NEWVALUE ?
    if (newValue != thisWidget.value && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }

    thisWidget.input.value = thisWidget.value;
    // Na razie ta metoda tylko zapisuje we właściwości thisWidget.value wartość przekazanego argumentu,
    //po przekonwertowaniu go na liczbę. Robimy to na wypadek, gdyby argument był tekstem – a tak właśnie będzie
    //w przypadku odczytania wartości inputa.
  }
  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){  // do omówienia
      thisWidget.setValue(thisWidget.input.value);
    });
    thisWidget.linkDecrease.addEventListener('click', function(event){  // do omówienia
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });
    thisWidget.linkIncrease.addEventListener('click', function(event){  // do omówienia
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });
  }
  announce(){  // Zacznijmy od stworzenia metody announce. Będzie ona tworzyła instancje klasy Event,
    const thisWidget = this;                       //  wbudowanej w silnik JS (czyli w przeglądarkę).

    const event = new CustomEvent('updated', {
      bubbles: true    // bubbles, bąbelkowanie,  ten event po wykonaniu na jakimś elemencie będzie przekazany jego rodzicowi, oraz rodzicowi rodzica, i tak dalej – aż do samego <body>, document i window.
    });
    thisWidget.element.dispatchEvent(event);
  }
}
