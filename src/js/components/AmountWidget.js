import { select,settings } from "../settings.js";
class AmountWidget {
    constructor (element) {
      const thisWidget = this;

      thisWidget.getElements(element);
      const initialValue = thisWidget.input.value || settings.amountWidget.defaultValue;
      thisWidget.setValue(initialValue);
      thisWidget.initActions();

      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });
    }

    getElements(element){
      const thisWidget = this;
    
      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(newValue) {
      const thisWidget = this;
  
      newValue = parseInt(newValue);

      const minValue = settings.amountWidget.defaultMin;
      const maxValue = settings.amountWidget.defaultMax;
  
      if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= minValue && newValue <= maxValue) {
        thisWidget.value = newValue;
        thisWidget.announce(); 
      }
  
      thisWidget.input.value = thisWidget.value;
    }

    announce() {
      const thisWidget = this;
    
      const event = new CustomEvent('updated', {
        bubbles: true
      });
    
      thisWidget.element.dispatchEvent(event);
    }

    initActions() {
      const thisWidget = this;
  
      thisWidget.input.addEventListener('change', function() {
        thisWidget.setValue(thisWidget.input.value);
      });
  
      thisWidget.linkDecrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });
  
      thisWidget.linkIncrease.addEventListener('click', function(event) {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }

  }

  export default AmountWidget;