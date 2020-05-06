/* global $*/

import { Booking } from './components/Booking.js';
import { Cart } from './components/Cart.js';
import { Product } from './components/Product.js';
import { classNames, select, settings, templates } from './settings.js';

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
  initPages(){
    const thisApp = this;
    //znajdziemy wszystkie dzieci tego kontenera za pomocą .children. W ten sposób uzyskamy kolekcję wrapperów podstron.
    // thisApp.pages nie będziemy mieli zapisanej kolekcji elementów, ale tablicę (array) zawierającą elementy.
    thisApp.pages = Array.from(document.querySelector(select.containerOf.pages).children);
    //console.log(thisApp.pages);

    // zapiszemy jeszcze tablicę linków do podstron
    thisApp.navLinks = Array.from(document.querySelectorAll(select.nav.links));

    // znajdujaca sie podstrona pod indeksem 0, wywolanie metody z atrybutem id
    thisApp.activatePage(thisApp.pages[0].id);
    //console.log(thisApp.pages[0].id)

    // nie musimy używać metody getAttribute. Wystarczy odwołać się do właściwości id tego elementu.
    let pagesMatchingHash = [];

    if (window.location.hash.length > 2) {         // do omówienia całość
      const idFromHash = window.location.hash.replace('#/', '');

      pagesMatchingHash = thisApp.pages.filter(function (page) {
        return page.id == idFromHash;            // do omówienia całość
      });
      // do omówienia, dlaczego to juest odpowiedzialne ze strona zostaje po przeładowaniu ?
      thisApp.activatePage(pagesMatchingHash.length ? pagesMatchingHash[0].id : thisApp.pages[0].id);
    }


    for (let link of thisApp.navLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        // get page id from href
        const href = clickedElement.getAttribute('href');
        const id = href.replace('#', '');

        // activate page
        thisApp.activatePage(id);

        const cart = document.getElementById('cart');
        if (id === 'order') {
          cart.classList.add('exist');
        } else {
          cart.classList.remove('exist');
        }
      });
    }

  },
  activatePage(pageId){  // do omówienia
    const thisApp = this;

    for (let link of thisApp.navLinks) {
      link.classList.toggle(classNames.nav.active, link.getAttribute('href') == '#' + pageId);  //jeśli link jest taki sam jak id naszej podstrony nadaj mu klasę active.
      //console.log(link);
    }
    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.getAttribute('id') == pageId); //jesli id strony jest równe naszemy pageId czyli argumentowi tej funckji nadajemy jej klase active.
      //console.log(page);
    }
    // Dlatego wprowadzimy kolejną, bardzo przydatną funkcjonalność! Zmiana podstrony będzie zmieniać URL strony, a po odświeżeniu aktywna będzie strona, która jest podana w adresie.
    window.location.hash = '#/' + pageId; //zeby po odswiezeniu nie zmieniala sie podstrona i nie przewijała do elementu o id booking tylko pokazywala z samej gory
    //document.body.classList = pageId;
    console.log('aktywowano podstronę:', pageId);

  },
  initData: function(){         // pobieranie danych naszych produktow z dataSource
    const thisApp = this;       // this znowu, do wyjaśnienia

    //thisApp.data = dataSource;  // dlaczego zmieniamy dataSource na thisApp tj this.data ?
    // wrzucamy dane z API
    thisApp.data = {};
    //console.log(thisApp.data);
    // adres endpointu
    const url = settings.db.url + '/' + settings.db.product;

    // najciekawszy fragment, czyli wywołanie zapytania AJAX za pomocą funkcji fetch
    fetch(url)                 // wszystko do OMÓWIENIA
      .then(function(rawResponse){
        return rawResponse.json();
      })
      .then(function(parsedResponse){
        //console.log('parsedResponse', parsedResponse);

        // save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;

        // execute initMenu method
        thisApp.initMenu();

      });
    //console.log('thisApp.data', JSON.stringify(thisApp.data));

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
  initBooking: function(){
    //const thisApp = this;

    const widgetContainer = document.querySelector(select.containerOf.booking);

    new Booking(widgetContainer);
    //thisApp.booking = new Booking(thisApp.bookingContainer);
  },
  init: function () { //lista tresci skryptu
    const thisApp = this;
    //console.log('*** App starting ***');
    //console.log('thisApp:', thisApp);
    //console.log('classNames:', classNames);
    //console.log('settings:', settings);
    //console.log('templates:', templates);
    thisApp.initPages();
    thisApp.initData();
    thisApp.initCart();
    thisApp.initBooking();
    thisApp.initCarousel();
  },
  initCarousel() {
    const thisApp = this;
    $('.carousel').carousel({
      interval: 3000
    });

    const logo = document.querySelector('.logo');

    logo.addEventListener('click', function () {
      thisApp.initPages();
    });
  }
};

app.init();  // wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony
