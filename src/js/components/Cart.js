
import {settings, classNames, select, templates} from '../settings.js';
import {utils} from '../utils.js';
import {CartProduct} from './CartProduct.js';

export class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];  // Od razu stworzyliśmy tablicę thisCart.products, w której będziemy przechowywać produkty dodane do koszyka.

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.getElements(element);
    thisCart.initActions();

    //console.log('new Cart', thisCart);
  }
  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    // Nasłuchujemy tutaj na liście produktów, w której umieszczamy produkty, w których znajduje się widget liczby sztuk, który generuje ten event. Dzięki właściwości bubbles "usłyszymy" go na tej liście i możemy wtedy wykonać metodę update.
    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function (){  // wychwycenie eventu remove
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(){ // wysylanie zamowienia do API, guzik send order
      event.preventDefault();
      thisCart.sendOrder();
    });

  }
  getElements(element){   // do omówienia, bierze z wrappera element?
    const thisCart = this;

    thisCart.dom = {};  // obiekt thisCart.dom. W nim będziemy przechowywać wszystkie elementy DOM, wyszukane w komponencie koszyka.
    //Ułatwi nam to ich nazewnictwo, ponieważ zamiast np. thisCart.amountElem będziemy mieli thisCart.dom.amount.
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = document.querySelector(select.cart.productList);  // dlaczego tak definiujemy ?
    thisCart.dom.form = document.querySelector(select.cart.form);
    thisCart.dom.phone = document.querySelector(select.cart.phone);
    thisCart.dom.address = document.querySelector(select.cart.address);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee']; // do omówienia

    for(let key of thisCart.renderTotalsKeys){              // do omówienia
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }
    // Wychwycenie submitu formularza, wysylanie zamowien do API
  }
  add(menuProduct){  // Generowanie elementów DOM do koszyka
    const thisCart = this;

    //console.log('adding product', menuProduct);

    const generatedHTML = templates.cartProduct(menuProduct); // tworzymy kod HTML
    //console.log(generatedHTML);

    const generatedDOM = utils.createDOMFromHTML(generatedHTML); // Następnie ten kod zamieniamy na elementy DOM
    //console.log(generatedDOM);

    thisCart.dom.productList.appendChild(generatedDOM); // Dodajemy te elementy DOM do thisCart.dom.productList

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM)); // W ten sposób jednocześnie stworzymy nową instancję klasy new CartProduct oraz dodamy ją do tablicy thisCart.products.
    //console.log('thisCart.products', thisCart.products);
    thisCart.update();
  }
  update(){
    const thisCart = this;

    thisCart.totalNumber = 0;

    thisCart.subtotalPrice = 0;

    for(let thisCartProduct of thisCart.products){

      thisCart.subtotalPrice = thisCart.subtotalPrice + thisCartProduct.price;
      //console.log(thisCart.subtotalPrice);

      thisCart.totalNumber = thisCart.totalNumber + thisCartProduct.amount;
      //console.log(thisCart.totalNumber);
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    //console.log(thisCart.totalPrice);

    for(let key of thisCart.renderTotalsKeys){
      for(let elem of thisCart.dom[key]){
        elem.innerHTML = thisCart[key];
      }
    }
  }
  remove(cartProduct){  //Cart.remove
    const thisCart = this;

    // zadeklarować stałą index, której wartością będzie indeks cartProduct w tablicy thisCart.products,
    const index = thisCart.products.indexOf(cartProduct);
    console.log(index);

    // użyć metody splice do usunięcia elementu o tym indeksie z tablicy thisCart.products,
    thisCart.products.splice(index,1);
    console.log(thisCart.products);

    // usunąć z DOM element cartProduct.dom.wrapper,
    cartProduct.dom.wrapper.remove();

    // wywołać metodę update w celu przeliczenia sum po usunięciu produktu.
    thisCart.update();
  }
  sendOrder(){  // metoda sendorder do wysylania danych do API, przyciskiem sendorder w iniactions
    const thisCart = this;
    const url = settings.db.url + '/' + settings.db.order; // umieszczamy endpoint zamówienia order

    const payload = {                      // deklarujemy stałą payload, czyli ładunek,
      phone : thisCart.dom.phone,
      address: thisCart.dom.address,            // Tak bardzo często określa się dane, które będą wysłane do serwera.
      totalPrice : thisCart.totalPrice,
      subtotalPrice : thisCart.subtotalPrice,
      totalNumber : thisCart.totalNumber,
      deliveryFee : thisCart.deliveryFee,
      products: [], // Obiekt payload musi też zawierać tablicę products, która na razie będzie pusta
    };

    for(let oneProduct of thisCart.products){  // Pod obiektem payload dodaj pętlę iterującą po wszystkich thisCart.products, i dla każdego produktu wywołaj jego metodę getData. Wynik zwracany przez tą metodą dodaj do tablicy payload.products.
      oneProduct.getData();
      //console.log(oneProduct);

      payload.products.push(oneProduct);
      //console.log(payload.products);
    }

    const options = {            //  stała – options – zawiera opcje, które skonfigurują zapytanie
      method: 'POST',            // zmieniamy GET na POST, która służy do wysyłania nowych danych do API
      headers: {
        'Content-Type': 'application/json',    // nagłówek, aby nasz serwer wiedział, że wysyłamy dane w postaci JSONa
      },
      body: JSON.stringify(payload),       // Ostatni z nagłówków to body, czyli treść którą wysyłamy. Używamy tutaj metody JSON.stringify
    };                                     // aby przekonwertować obiekt payload na ciąg znaków w formacie JSON.

    // wysłanie zapytania do serwera, dodalismy drugi argument options
    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse', parsedResponse);
      });

  }
}
