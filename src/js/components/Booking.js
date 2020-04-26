
import { select, templates} from '../settings.js';
import { utils } from '../utils.js';
import { AmountWidget } from './AmountWidget.js';

export class Booking {
  constructor (){
    const thisBooking = this;

    thisBooking.render();
    thisBooking.initWidgets();
  }
  render(element){
    const thisBooking = this;

    // generowanie HTML za pomocą szablonu templates.bookingWidget
    const generatedHTML = templates.bookingWidget();

    // tworzyć pusty obiekt thisBooking.dom,
    thisBooking.dom = {};

    // zapisać do tego obiektu właściwość wrapper równą otrzymanemu argumentowi,
    thisBooking.dom.wrapper = element;

    //zawartość wrappera zamieniać na kod HTML wygenerowany z szablonu
    thisBooking.generatedDOM = utils.createDOMFromHTML(generatedHTML);  // do omówienia , dlaczego nie thisBooking.... = generatedHTML;?

    // we właściwości thisBooking.dom.peopleAmount zapisywać pojedynczy element znaleziony we wrapperze i pasujący do selektora
    thisBooking.dom.peopleAmount = thisBooking.generatedDOM.querySelector(select.booking.peopleAmount);

    // analogicznie do peopleAmount znaleźć i zapisać element dla hoursAmount.
    thisBooking.dom.hoursAmount = thisBooking.generatedDOM.querySelector(select.booking.hoursAmount);

  }
  initWidgets(){
    const thisBooking = this;

    // metoda initWidgets we właściwościach thisBooking.peopleAmount i thisBooking.hoursAmount zapisywać nowe instancje klasy AmountWidget,
    // którym jako argument przekazujemy odpowiednie właściwości z obiektu thisBooking.dom.
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);

  }
}
