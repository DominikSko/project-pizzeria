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
      thisProduct.initAccordion();   // dodaje w konstruktorze wywołanie metody init accordeon

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

    initAccordion (){         // tworze nową metode w klasie produkt
      const thisProduct = this;  // dodaje tą samą stałą ?

      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: click event listener to trigger */
      clickableTrigger.addEventListener('click', function(){
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
