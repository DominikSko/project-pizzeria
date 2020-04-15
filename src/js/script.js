/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = { //obiekt zawierający selektory, które będą nam potrzebne w tym module,
    templateOf: {
      menuProduct: '#template-menu-product',  //selektor do naszego szablonu produktu.
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
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {    // nazwy klas, którymi nasz skrypt będzie manipulował (nadawał i usuwał),
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {       // ustawienia naszego skryptu,
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    // metoda menuProduct jest tworzona za pomocą biblioteki Handlebars.
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {     // stworzenia klasy Product tj. szablon obiektu, szablon instancji które będa działać wg. tej klasy
    constructor(id, data){    // to specjalna metoda, która uruchomi się przy tworzeniu każdej instancji
      const thisProduct = this;   // this reprezentuje pojedyńczą instancję tego szablonu

      thisProduct.id = id;      // musimy zapisać właściwości instancji, która jest reprezentowana przez obiekt this.
      thisProduct.data = data;  // dla czytelności zapisujemy go w stałej thisProduct,

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();   // dodaje w konstruktorze wywołanie metody init accordeon
      thisProduct.initOrderForm();
      thisProduct.processOrder();

      console.log('new Product:', thisProduct);  //wyświetlona przez konstruktor klasy
    }

    renderInMenu (){    // tworzymy metodę renderInMenu, która będzie renderować nasze produkty na stronie.
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

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);   // formularz zamówienia produktu
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);   // form.queryALL ?  // wszystkie jego kontrolki (checkboksy, selecty, etc.),
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); // pojedynczy element o selektorze zapisanym w select.menuProduct.imageWrapper, wyszukany w elemencie thisProduct.element.
    }

    initAccordion(){         // tworze nową metode w klasie produkt
      const thisProduct = this;  // dodaje tą samą stałą ?

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: click event listener to trigger */
      thisProduct.accordionTrigger.addEventListener('click', function(){  // wykorzystana zmienna z metody getElements
        console.log('clicked');


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
      console.log(this.initOrderFrom);

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
      });

    }

    processOrder(){
      const thisProduct = this;

      // read all data from the form (using utils.serializeFormToObject) and save it to const formData
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData', formData);

      thisProduct.params = {}; // dlaczego tworzymy obiekt? nie ma go w algorytmie

      // set variable price to equal thisProduct.data.price
      let price = thisProduct.data.price;
      console.log(price);

      // START LOOP: for each paramId in thisProduct.data.params
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId]; // save the element in thisProduct.data.params with key paramId as const param
        console.log('param:',param);

        // START LOOP: for each optionId in param.options
        for(let optionId in param.options){
          const option = param.options[optionId];  // save the element in param.options with key optionId as const option
          console.log('option', option);

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

      // set the contents of thisProduct.priceElem to be the value of variable price
      thisProduct.priceElem.innerHTML = price;
    }

  }

  const app = {      // obiekt który pomoże nam w organizacji kodu naszej aplikacji
    initMenu: function(){          // deklarację metody

      const thisApp = this;        // this znowu, do wyjaśnienia

      console.log('thisApp.data:', thisApp.data);

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
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initMenu();
    },
  };

  app.init();  // wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony
}
