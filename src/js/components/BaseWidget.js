
export class BaseWidget{                     // klasa będzie szablonem, wedle którego ma działać każdy widget na naszej stronie.
  constructor(wrapperElement, initialValue){ // Konstruktor ma przyjmować dwa argumenty – wrapperElement i initialValue
    const thisWidget = this;

    thisWidget.dom = {};                      // Tworzymy też obiekt thisWidget.dom
    thisWidget.dom.wrapper = wrapperElement;  // i zapisujemy w obiekcie właściwość wrapper, której wartością ma być argument wrapperElement
    thisWidget.correctValue = initialValue;   // Następnie we właściwości thisWidget.correctValue zapisujemy wartość argumentu initialValue

  }
  get value(){        // do omówienia
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(assignedValue){  // do omówienia, Dzięki nim, przy odczytywaniu wartości z właściwości value zostanie uruchomiony getter get value
    const thisWidget = this;

    const newValue = thisWidget.parseValue(assignedValue);

    if(newValue != thisWidget.correctValue && thisWidget.isValid(newValue)){
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();
  }
  parseValue(newValue){      // wbudowana w przegladarke parseInt, Poradzi sobie np. z tekstem '5szt.' i zwróci liczbę 5. Jeśli nie uda jej się skonwertować argumentu, którym będzie np. tekst 'jeden', to zwróci wartość NaN, czyli Not a Number.
    return parseInt(newValue);
  }
  isValid(newValue){   // W metodzie isValid chcemy sprawdzić, czy ustawiana wartość jest poprawna.
    // Ta metoda ma zwrócić prawdę lub fałsz, więc po słowie return wpisujemy warunek – jest to funkcja isNaN (wbudowana w przeglądarkę), która zwraca prawdę, jeśli przekazano jej wartość NaN. Zanegowaliśmy tę funkcję za pomocą wykrzyknika !, ponieważ chcemy aby prawda oznaczała "to nie jest NaN".
    return !isNaN(newValue);
  }
  renderValue(){        // Klasa BaseWidget nie ma pojęcia o strukturze DOM widgetu, więc tylko wyświetli swoją wartość w konsoli.
    const thisWidget = this;

    console.log('widget value:', thisWidget.value);
  }
  announce(){     // jak announce w AmountWidget Zmieni się tylko element na którym wywołujemy event.
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.dom.wrapper.dispatchEvent(event);
  }
  // Przeczytaj jeszcze raz kod całej klasy, którą przed chwilą stworzyliśmy. Jak widzisz, jest to okrojona wersja klasy AmountWidget z kilkoma zmianami. Ta klasa wie tylko, że posiada jakiś wrapper i ma mieć swoją wartość value.
  // Dzięki temu przy próbie zmiany wartości, setter sprawdzi czy jest to poprawna wartość i różni się od wcześniejszej. Jeśli tak, to zostanie wywołany event informujący inne obiekty o zmianie wartości.

}
