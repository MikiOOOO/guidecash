const handleExpensesManipulation = () => {
  const nameInputField = document.querySelector('.expenses__form-input--name');
  const categoryInputField = document.querySelector(
    '.expenses__form-input--category'
  );
  const priceInputField = document.querySelector(
    '.expenses__form-input--price'
  );
  const totalAddedField = document.querySelector(
    '.expenses__form-tools-added-value'
  );

  const submitButton = document.querySelector('.button--submit');
  const clearButton = document.querySelector('.button--clear');

  const calculateTotalAdded = () => {
    const purchases = JSON.parse(localStorage.getItem('purchases'));

    if (purchases) {
      totalAddedField.textContent = `${
        +totalAddedField.textContent + purchases.length
      }`;
    }
  };

  const clearExpensesForm = () => {
    nameInputField.value = '';
    categoryInputField.value = '';
    priceInputField.value = '';
  };

  const submitExpensesForm = (event) => {
    event.preventDefault();
    if (
      nameInputField.value &&
      categoryInputField.value &&
      priceInputField.value
    ) {
      const priceStringified = String(priceInputField.value);
      if (
        priceStringified.includes('.') &&
        priceStringified.split('.')[1].length > 2
      ) {
        console.log('more than 2 decimal places you cannot submit');
        return;
      }

      const purchase = {
        date: new Date().toISOString().slice(0, 10),
        name: nameInputField.value,
        category: categoryInputField.value,
        price: priceInputField.value,
      };
      const existingArrayJson = localStorage.getItem('purchases');
      let existingArray = [];
      if (existingArrayJson) {
        existingArray = JSON.parse(existingArrayJson);
        purchase.id = existingArray.length + 1;
        existingArray.push(purchase);
        const updatedArrayJson = JSON.stringify(existingArray);
        localStorage.setItem('purchases', updatedArrayJson);
      } else {
        purchase.id = 1;
        localStorage.setItem('purchases', JSON.stringify([purchase]));
      }

      totalAddedField.textContent = `${+totalAddedField.textContent + 1}`;

      clearExpensesForm();
      console.log('saved to local storage.');
    }
  };
  
  calculateTotalAdded();
  submitButton.addEventListener('click', submitExpensesForm);
  clearButton.addEventListener('click', clearExpensesForm);
};
  