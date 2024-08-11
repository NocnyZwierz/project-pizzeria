import { select, classNames, templates } from "../settings";
import utils from "../utils";
import AmountWidget from "./AmountWidget";

class Product {
    constructor(id, data) {
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAmountWidget();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
    }
    //moduł 8 doczytaj jeszcze o tym!!!! podstawa e-comers
    renderInMenu () {
      const thisProduct = this;

      const generatedHTML = templates.menuProduct(thisProduct.data);
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      const menuContainer = document.querySelector(select.containerOf.menu);
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper); // matreiały poprowadziły jak dziecko za rączkę i do knajpy
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
  
      /* START: add event listener to clickable trigger on event click */
      thisProduct.accordionTrigger.addEventListener('click', function(event) {
        /* prevent default action for event */
        event.preventDefault(); // to naprostrze 
        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive); // https://stackoverflow.com/questions/67253336/issue-with-event-listener wszystko jest w necie
        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if (activeProduct && activeProduct !== thisProduct.element) { // sprawdzenie dwóch warunków jeden z zaprzeczeniem!
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive); //nasz toggle, sprytny!
      });
    }

    initOrderForm () {
      const thisProduct = this;
    
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
    
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }

    processOrder() {
      const thisProduct = this;
    
      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
    
      // set price to default price
      let price = thisProduct.data.price;
    
      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
    
        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];

          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //no z tym to miałem problem żeby dobrze zrozumieć, muszę to jeszcze poćwiczyć!
          // check if there is param with a name of paramId in formData and if it includes optionId
          if (optionSelected) {
            if (!option.default) {
              price += option.price;
            }
          } else {
            // Reduce price variable if the option is default and not selected
            if (option.default) {
              price -= option.price;
            }
          }
          //szukamy obrazu :/ 
          const optionImage = thisProduct.imageWrapper.querySelector('.' + paramId + '-' + optionId); //masakra 

          if (optionImage) { // te ify już łatwiej
            if (optionSelected) {
              optionImage.classList.add(classNames.menuProduct.imageVisible); // z materiałów wcześniej i poradnika i youtube
            } else {
              optionImage.classList.remove(classNames.menuProduct.imageVisible); //mam chyba mały kryzys bo idzie jak krew z nosa
            }
          }
        }
      }
      thisProduct.priceSingle = price;
      price *= thisProduct.amountWidget.value; //tu jest winowajca 
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget() {
      const thisProduct = this;
  
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      thisProduct.amountWidgetElem.addEventListener('updated', function() {
        thisProduct.processOrder();
      });
    }

    addToCart() {
        const thisProduct = this;
     
        //  app.cart.add(thisProduct.prepareCartProduct());
        const event = new CustomEvent('add-to-cart', {
          bubbles: true,
          detail: {
            product: thisProduct.prepareCartProduct(),
          },
        }
        );
        thisProduct.element.dispatchEvent(event);
     }
    
    prepareCartProduct() {
      const thisProduct = this;
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name, 
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: thisProduct.priceSingle * thisProduct.amountWidget.value,
        params: thisProduct.prepareCartProductParams()
      };
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;
      const formData = utils.serializeFormToObject(thisProduct.form);
      const params = {};
    
      for(let paramId in thisProduct.data.params) {
        const param = thisProduct.data.params[paramId];
    
        params[paramId] = {
          label: param.label,
          options: {}
        };
    
        for(let optionId in param.options) {
          const option = param.options[optionId];
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
          //sprytne
          if(optionSelected) {
            params[paramId].options[optionId] = option.label;
          }
        }
      }
      return params;
    }
  }
export default Product;