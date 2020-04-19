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

      thisProduct.name = thisProduct.data.name;

      thisProduct.value = thisProduct.amountWidget.value;
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

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];  // Od razu stworzyliśmy tablicę thisCart.products, w której będziemy przechowywać produkty dodane do koszyka.

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }
    initActions(){
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }
    getElements(element){   // do omówienia, bierze z wrappera element?
      const thisCart = this;

      thisCart.dom = {};  // obiekt thisCart.dom. W nim będziemy przechowywać wszystkie elementy DOM, wyszukane w komponencie koszyka.
      //Ułatwi nam to ich nazewnictwo, ponieważ zamiast np. thisCart.amountElem będziemy mieli thisCart.dom.amount.
      thisCart.dom.wrapper = element;

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = document.querySelector(select.cart.productList);  // dlaczego tak definiujemy ?
    }
    add(menuProduct){  // Generowanie elementów DOM do koszyka
      const thisCart = this;

      console.log('adding product', menuProduct);

      const generatedHTML = templates.cartProduct(menuProduct); // tworzymy kod HTML
      console.log(generatedHTML);

      const generatedDOM = utils.createDOMFromHTML(generatedHTML); // Następnie ten kod zamieniamy na elementy DOM
      console.log(generatedDOM);

      thisCart.dom.productList.appendChild(generatedDOM); // Dodajemy te elementy DOM do thisCart.dom.productList

    }
  }

  const app = {      // obiekt który pomoże nam w organizacji kodu naszej aplikacji
    initMenu: function(){          // deklarację metody

      const thisApp = this;        // this znowu, do wyjaśnienia

      //console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
      // sprawdzamy czy dane są gotowe do uzycia poniżej, zastepujemy pętlą wyżej która iteruje po products
      //const testProduct = new Product();    //tworzymy instancje dla klasy
      //console.log('testProduct:', testProduct);  // wyswietlona w metodzie app.initMenu
    },
    initData: function(){         // pobieranie danych naszych produktow z dataSource
      const thisApp = this;       // this znowu, do wyjaśnienia

      thisApp.data = dataSource;  // dlaczego zmieniamy dataSource na thisApp tj this.data ?
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
      thisApp.initMenu();
    },
    initCart: function(){  // initCart, która będzie inicjować instancję koszyka. Przekażemy jej wrapper (czyli kontener, element okalający) koszyka.
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart (cartElem);
    },
  };

  app.init();  // wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony
}
