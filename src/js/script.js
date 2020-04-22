/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = { //obiekt zawierający selektory, które będą nam potrzebne w tym module,
    templateOf: {
      menuProduct: '#template-menu-product',  //selektor do naszego szablonu produktu.
      cartProduct: '#template-cart-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
  };

  const classNames = {    // nazwy klas, którymi nasz skrypt będzie manipulował (nadawał i usuwał),
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    cart: {
      wrapperActive: 'active',
    },
  };

  const settings = {       // ustawienia naszego skryptu,
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    },
    cart: {
      defaultDeliveryFee: 20,
    },
    db: {
      url: '//localhost:3131',
      product: 'product',
      order: 'order',
    },
  };

  const templates = {
    // metoda menuProduct jest tworzona za pomocą biblioteki Handlebars.
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
  };

  class Product{     // stworzenia klasy Product tj. szablon obiektu, szablon instancji które będa działać wg. tej klasy
    constructor(id, data){    // to specjalna metoda, która uruchomi się przy tworzeniu każdej instancji
      const thisProduct = this;   // this reprezentuje pojedyńczą instancję tego szablonu

      thisProduct.id = id;      // musimy zapisać właściwości instancji, która jest reprezentowana przez obiekt this.
      thisProduct.data = data;  // dla czytelności zapisujemy go w stałej thisProduct,

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();   // dodaje w konstruktorze wywołanie metody init accordeon
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();

      //console.log('new Product:', thisProduct);  //wyświetlona przez konstruktor klasy
    }

    renderInMenu(){    // tworzymy metodę renderInMenu, która będzie renderować nasze produkty na stronie.
      const thisProduct = this;

      // generowanie HTML based on template
      const generatedHTML = templates.menuProduct(thisProduct.data);  // skąd dokładnie bierzemy data?

      //  tworzenie elementu DOM uzywająć utils.crateElementFromHTML
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);  // creating DOM,DOM to obiekt wygenerowany przez przeglądarkę na podstawie kodu HTML
      // JS nie ma wbudowanej metody, która służy do tego celu – dlatego skorzystamy z jednej z funkcji zawartych w obiekcie utils

      // znajdujemy kontener menu
      const menuContainer = document.querySelector(select.containerOf.menu);

      // dodajemy stworzony element na stronę
      menuContainer.appendChild(thisProduct.element);  // za pomocą metody appendChild dodajemy stworzony element do menu!
    }
    getElements(){   // tworzymy metodę aby wyszukiować elementy DOM, pod obliczanie ceny produktów
      const thisProduct = this;

      // wlaściwosci z wartością
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);   // formularz zamówienia produktu
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);   // form.queryALL ?  // wszystkie jego kontrolki (checkboksy, selecty, etc.),
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); // pojedynczy element o selektorze zapisanym w select.menuProduct.imageWrapper, wyszukany w elemencie thisProduct.element.
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }
    initAccordion(){         // tworze nową metode w klasie produkt
      const thisProduct = this;  // dodaje tą samą stałą ?

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function(){  // wykorzystana zmienna z metody getElements
        //console.log('clicked');


        /* prevent default action for event */
        event.preventDefault();

        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');    // toggle - dodanie klasy jesli jej nie bylo i vice versa

        /* find all active products */

        const activeProducts = document.querySelectorAll('article.active');

        /* START LOOP: for each active product */
        for (let activeProduct of activeProducts) {

          /* START: if the active product isn't the element of thisProduct */
          if (activeProduct !== thisProduct.element) {       // !== do omówienia i thisProduct.element ?

            //* remove class active for the active product */
            activeProduct.classList.remove('active');   // trzeba dodac classlist przed add/remove/toggle itd

            //* END: if the active product isn't the element of thisProduct */
          }
          /* END LOOP: for each active product */
        }
        /* END: click event listener to trigger */
      });
    }
    initOrderForm(){      // tworzymy kolejne metody w klasie product
      const thisProduct = this;
      //console.log(this.initOrderFrom);

      thisProduct.form.addEventListener('submit', function(event){  // do omówienia
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){                     // do omówienia
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(){  // do omówienia
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });

    }
    processOrder(){   //  która iteruje przez wszystkie opcje wszystkich parametrów.
      const thisProduct = this;

      // read all data from the form (using utils.serializeFormToObject) and save it to const formData
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      thisProduct.params = {};

      // set variable price to equal thisProduct.data.price
      let price = thisProduct.data.price;
      //console.log(price);

      // START LOOP: for each paramId in thisProduct.data.params
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId]; // save the element in thisProduct.data.params with key paramId as const param
        //console.log('param:',param);

        // START LOOP: for each optionId in param.options
        for(let optionId in param.options){
          const option = param.options[optionId];  // save the element in param.options with key optionId as const option
          //console.log('option', option);

          // do wytłumaczenia ta stała > -1;
          const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
          // START IF: if option is selected and option is not default
          if(optionSelected && !option.default){

            // add price of option to variable price
            price += option.price;
          }
          // START ELSE IF: if option is not selected and option is default
          else if(!optionSelected && option.default){

            // deduct price of option from price
            price -= option.price;

          } // END ELSE IF,

          //make constant and add to it all images for option

          const optionImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);  // DO OMÓWIENIA
          //console.log('IMAGES:', optionImages);

          // if else dla obrazków mamy klucz parametru, klucz opcji i info. czy opcja jets zaznaczona

          if(optionSelected){
            if(!thisProduct.params[paramId]){  // DO OMÓWIENIA

              thisProduct.params[paramId] = {  // DO OMÓWIENIA
                label: param.label,            // DO OMÓWIENIA
                options: {},                   // DO OMÓWIENIA
              };
            }
            thisProduct.params[paramId].options[optionId] = option.label; // DO OMÓWIENIA

            for (let images of optionImages) {    // DO OMÓWIENIA
              images.classList.add(classNames.menuProduct.imageVisible);   // DO OMÓWIENIA
            }
          }
          else {
            for(let images of optionImages) {  // DO OMÓWIENIA
              images.classList.remove(classNames.menuProduct.imageVisible);  // DO OMÓWIENIA
            }
          }

        }   // END LOOP: for each optionId in param.options
      }     // END LOOP: for each paramId in thisProduct.data.params

      // multiply price by amount
      // W ten sposób, tuż przed wyświetleniem ceny obliczonej z uwzględnieniem opcji,
      //pomnożymy ją przez ilość sztuk wybraną w widgecie!
      //price *= thisProduct.amountWidget.value;
      thisProduct.priceSingle = price;
      thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;
      // set the contents of thisProduct.priceElem to be the value of variable price
      // metoda ustawia zawartość thisProduct.priceElem na wartość zmiennej price.
      thisProduct.priceElem.innerHTML = thisProduct.price;

      //console.log(thisProduct.params);
    }
    initAmountWidget(){
      const thisProduct = this;
      // nowa metoda initAmountWidget bedzie tworzyla instacje klasy AmountWidget i zapisywala ja we wlasciowsci produktu
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        thisProduct.processOrder();
      });
    }
    addToCart(){
      const thisProduct = this;
      //console.log(thisProduct);

      thisProduct.name = thisProduct.data.name;

      thisProduct.amount = thisProduct.amountWidget.value;
      //console.log(thisProduct.name);
      //console.log(thisProduct.value);
      app.cart.add(thisProduct);   // skad odwołanie ?
    }
  }

  class AmountWidget{      // do omówienia
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

  class Cart{
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

      thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee']; // do omówienia

      for(let key of thisCart.renderTotalsKeys){              // do omówienia
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
      }
      // Wychwycenie submitu formularza, wysylanie zamowien do API
      thisCart.dom.form = document.querySelector(select.cart.form);

      thisCart.dom.phone = document.querySelector(select.cart.phone);
      thisCart.dom.address = document.querySelector(select.cart.address);
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
        totalPrice: thisCart.totalPrice,
        products: [], // Obiekt payload musi też zawierać tablicę products, która na razie będzie pusta
      };

      for(let oneProduct of thisCart.products){  // Pod obiektem payload dodaj pętlę iterującą po wszystkich thisCart.products, i dla każdego produktu wywołaj jego metodę getData. Wynik zwracany przez tą metodą dodaj do tablicy payload.products.
        oneProduct.getData();
        console.log(oneProduct);

        payload.products.push(oneProduct);
        console.log(payload.products);
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

  class CartProduct { // klasa CartProduct, odpowiedzialna za funkcjonowanie pojedynczej pozycji w koszyku.
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
      }
      return productData;
    }
  }

  const app = {      // obiekt który pomoże nam w organizacji kodu naszej aplikacji
    initMenu: function(){          // deklarację metody

      const thisApp = this;        // this znowu, do wyjaśnienia

      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        // new Product(productData, thisApp.data.products[productData]); // wykorzystujemy KLUCZ produktu
        // Zamiast klucza, wykorzystamy teraz właściwość id:
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]); // do omówienia całe
      }
      // sprawdzamy czy dane są gotowe do uzycia poniżej, zastepujemy pętlą wyżej która iteruje po products
      //const testProduct = new Product();    //tworzymy instancje dla klasy
      //console.log('testProduct:', testProduct);  // wyswietlona w metodzie app.initMenu
    },
    initData: function(){         // pobieranie danych naszych produktow z dataSource
      const thisApp = this;       // this znowu, do wyjaśnienia

      //thisApp.data = dataSource;  // dlaczego zmieniamy dataSource na thisApp tj this.data ?
      // wrzucamy dane z API
      thisApp.data = {};
      console.log(thisApp.data);
      // adres endpointu
      const url = settings.db.url + '/' + settings.db.product;

      // najciekawszy fragment, czyli wywołanie zapytania AJAX za pomocą funkcji fetch
      fetch(url)                 // wszystko do OMÓWIENIA
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse', parsedResponse);

          // save parsedResponse as thisApp.data.products
          thisApp.data.products = parsedResponse;

          // execute initMenu method
          thisApp.initMenu();

        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));


    },
    init: function(){
      const thisApp = this;
      //console.log('*** App starting ***');
      //console.log('thisApp:', thisApp);
      //console.log('classNames:', classNames);
      //console.log('settings:', settings);
      //console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
      //thisApp.initMenu();
    },
    initCart: function(){  // initCart, która będzie inicjować instancję koszyka. Przekażemy jej wrapper (czyli kontener, element okalający) koszyka.
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart (cartElem);
    },
  };

  app.init();  // wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony
}
