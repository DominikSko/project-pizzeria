
import {Product} from './components/Product.js';
import {Cart} from './components/Cart.js';
import {select, settings, classNames} from './settings.js';

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
  initPages: function(){
    const thisApp = this;
    //znajdziemy wszystkie dzieci tego kontenera za pomocą .children. W ten sposób uzyskamy kolekcję wrapperów podstron.
    // thisApp.pages nie będziemy mieli zapisanej kolekcji elementów, ale tablicę (array) zawierającą elementy.
    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    console.log(thisApp.pages);

    // zapiszemy jeszcze tablicę linków do podstron
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    // znajdujaca sie podstrona pod indeksem 0, wywolanie metody z atrybutem id
    //thisApp.activatePage(thisApp.pages[0].id);
    // nie musimy używać metody getAttribute. Wystarczy odwołać się do właściwości id tego elementu.
    let pagesMatchingHash = [];

    if (window.location.hash.length > 2) {           // do omówienia całość
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function (page) {
        return page.id == idFromHash;                 // do omówienia całość
      });
    }
    // do omówienia
    thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);

    for(let link of thisApp.navLinks){
      link.addEventListener('click', function(event){
        const clickedElement = this;
        event.preventDefault();

        // get page id from href
        const id = clickedElement.getAttribute('href').replace('#', '');

        // activate page
        thisApp.activatePage(id);
      });
    }

  },
  activatePage: function(pageId){
    const thisApp = this;

    for(let link of thisApp.navLinks){
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);
      console.log(link);
    }
    for(let page of thisApp.pages){
      page.classList.toggle(classNames.pages.active, page.id = pageId);
      console.log(page);
    }
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
    thisApp.initPages();
    //thisApp.initMenu();
  },
  initCart: function(){  // initCart, która będzie inicjować instancję koszyka. Przekażemy jej wrapper (czyli kontener, element okalający) koszyka.
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart (cartElem);

    // dodajemy handler eventu z klasy Product
    thisApp.productList = document.querySelector(select.containerOf.menu); // do omówienia

    thisApp.productList.addEventListener('add-to-cart', function(event){   // do omówienia
      app.cart.add(event.detail.product);
    });
  },
};

app.init();  // wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony
