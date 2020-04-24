
import {select} from '../settings.js';
import {AmountWidget} from './AmountWidget.js';

export class CartProduct { // klasa CartProduct, odpowiedzialna za funkcjonowanie pojedynczej pozycji w koszyku.
  constructor(menuProduct, element){
    const thisCartProduct = this;

    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params)); // skopiowalismy obiekt

    thisCartProduct.getElements(element);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();

    //console.log('new CartProduct', thisCartProduct);
    //console.log('product data', menuProduct);

  }
  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {};

    thisCartProduct.dom.wrapper = element;  // dom.wrapper ??
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);

  }
  initAmountWidget(){
    const thisCartProduct = this;
    // nowa metoda initAmountWidget bedzie tworzyla instacje klasy AmountWidget i zapisywala ja we wlasciowsci produktu
    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);

    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){ // dodajemy DOM znowu, do omówienia DOM skad sie bierze
      // handler eventu
      thisCartProduct.amount = thisCartProduct.amountWidget.value;
      thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

      thisCartProduct.dom.price.innerHTML = thisCartProduct.price; // do omówienia dom.price.innerHTML
    });
  }
  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles:true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });
    console.log(event);

    thisCartProduct.dom.wrapper.dispatchEvent(event);
    // Podobnie jak w AmountWidget, wykorzystujemy tutaj CustomEvent z właściwością bubbles.
    //Dodatkowo jednak wykorzystujemy właściwość detail. Możemy w niej przekazać dowolne informacje do handlera eventu.
  } // W tym przypadku przekazujemy odwołanie do tej instancji, dla której kliknięto guzik usuwania.
  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(event){
      event.preventDefault();
    });

    thisCartProduct.dom.remove.addEventListener('click', function(event){
      event.preventDefault();
      thisCartProduct.remove();
    });
  }
  getData(){  // getData ma zwracać wszystkie informacje o zamawianym produkcie – id, amount, price, priceSingle oraz params
    const thisCartProduct = this;

    const productData = {
      OrderedItems: {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        params: thisCartProduct.params,
      }
    };
    return productData;
  }
}
