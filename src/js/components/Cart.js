import { select, classNames, templates, settings } from "../settings";
import utils from "../utils";
import CartProduct from "./CartProduct";

class Cart { //znow to samo!!! czytaj ze zrozumieniem i nie kombinuj, to musia działać!!!!!!!
    constructor(element) {
      const thisCart = this;
      thisCart.products = [];
      thisCart.getElements(element);
      thisCart.initActions();
    }

    getElements(element) {
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

      //w koszyczku
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);

      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
      thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    }
  

    initActions() {
      const thisCart = this;
    
      thisCart.dom.toggleTrigger.addEventListener('click', function() {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    
      thisCart.dom.productList.addEventListener('updated', function() {
        thisCart.update();
      });
    
      thisCart.dom.productList.addEventListener('remove', function(event) {
        thisCart.remove(event.detail.cartProduct);
      });
    
      thisCart.dom.form.addEventListener('submit', function(event) {
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    add(menuProduct) {
      const thisCart = this;
      const generatedHTML = templates.cartProduct(menuProduct);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      thisCart.dom.productList.appendChild(generatedDOM);
      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      thisCart.update();
    }

    update() {
      const thisCart = this;
  
      let totalNumber = 0;
      let subtotalPrice = 0;
  
      for(let product of thisCart.products) {
        totalNumber += product.amount;
        subtotalPrice += product.price;
      }
  
      const deliveryFee = subtotalPrice > 0 ? settings.cart.defaultDeliveryFee : 0;
      const totalPrice = subtotalPrice + deliveryFee;
  
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
  
      if (thisCart.dom.totalPrice instanceof NodeList) {
        thisCart.dom.totalPrice.forEach(priceElem => {
          priceElem.innerHTML = totalPrice;
        });
      } else {
        thisCart.dom.totalPrice.innerHTML = totalPrice;
      }
    }

    remove(cartProduct) {
      const thisCart = this;
  
      const index = thisCart.products.indexOf(cartProduct);
      if (index !== -1) {
        thisCart.products.splice(index, 1);
        cartProduct.dom.wrapper.remove();
        thisCart.update();
      }
    }

    sendOrder() {
      const thisCart = this;
      
      const url = settings.db.url + '/' + settings.db.orders;
    
      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.dom.deliveryFee.innerHTML,
        products: [],
      };
    
      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
    
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
    
      fetch(url, options)
        .then(function(response) {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(function(parsedResponse) {
          console.log('Order response:', parsedResponse);
        })
        .catch(function(error) {
          console.error('Error:', error);
        });
    }
  }

  export default Cart;