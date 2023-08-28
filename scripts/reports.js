const handleReportsManipulation = () => {
  const searchField = document.querySelector('.reports__form-input--search');
  const categoryField = document.querySelector(
    '.reports__form-input--category'
  );
  const dateStartField = document.querySelector(
    '.reports__form-input--date-start'
  );
  const dateEndField = document.querySelector('.reports__form-input--date-end');
  const sortByField = document.querySelector('.reports__form-input--sort-by');
  const paginationBlocksField = document.querySelector('.pagination__blocks');
  const paginationButtonSwitchRight = document.getElementById(
    'pagination__switch-button-right'
  );
  const paginationButtonSwitchLeft = document.getElementById(
    'pagination__switch-button-left'
  );
  const tableHeader = document.querySelector('.reports__table-header');
  const tableHeaders = [
    ...document.querySelectorAll('.reports__table-header-data'),
  ].map((tableHeader) => tableHeader.textContent);
  const tableBody = document.querySelector('.reports__table-body');
  const tableNoDataInfoField = document.querySelector(
    '.reports__table-body-no-data-info'
  );
  const resetButton = document.querySelector('.reports__form-reset-button');
  const deleteButton = document.querySelector('.button--delete');
  const reportsSummaryField = document.querySelector('.reports__summary');
  const totalPriceField = document.querySelector(
    '.reports__summary-total-price'
  );
  const paginationStep = 5;

  let searchedValue = '';
  let categoryValue = 'all';
  let sortBy = 'initial';
  let dateStartValue = '';
  let dateEndValue = '';
  let currentPage = 1;
  let rowSelected;

  const handleExistingPurchasesFetch = () => {
    const purchaseKeys = [
      ...document.querySelectorAll('.reports__table-header-data'),
    ].map((purchaseKey) => purchaseKey.textContent);
    const purchaseValues = [
      ...document.querySelectorAll('.reports__table-body-data'),
    ].map((purchaseValue) => purchaseValue.textContent);
    const purchases = [];

    while (purchaseValues.length) {
      const purchase = {};
      for (const purchaseKey of purchaseKeys) {
        purchase[purchaseKey.toLowerCase()] = purchaseValues.shift();
      }
      purchases.push(purchase);
    }

    return purchases;
  };

  const handlePurchasesFromLocalStorageFetch = () => {
    const json = localStorage.getItem('purchases');
    const purchases = JSON.parse(json);
    return purchases;
  };

  const handlePurchaseDelete = () => {
    const purchaseToDelete = purchases.find(
      (purchase) => purchase === purchasesCopy[rowSelected]
    );
    purchasesCopy = purchasesCopy.filter(
      (purchase) => purchase !== purchaseToDelete
    );
    purchases = purchases.filter((purchase) => purchase !== purchaseToDelete);
    const oldPurchases = handlePurchasesFromLocalStorageFetch();

    if (oldPurchases) {
      const updatedPurchases = oldPurchases.filter(
        (purchase) => purchase.id !== purchaseToDelete.id
      );
      localStorage.setItem('purchases', JSON.stringify(updatedPurchases));
    }

    deleteButton.style.display = 'none';
    rowSelected = undefined;
    handlePurchasesDisplay();
    handleTotalPriceSum();
  };

  const handlePurchasesFilter = () => {
    purchasesCopy = purchases.filter((purchase) => {
      const isName = purchase.name.includes(searchedValue.trim().toLowerCase());
      let isCategory = categoryValue === 'all';
      let isAfterStartDate = true;
      let isBeforeEndDate = true;

      if (!isCategory) {
        isCategory = purchase.category === categoryValue;
      }

      if (dateStartValue) {
        const limitDate = new Date(dateStartValue);
        const purchaseDate = new Date(purchase.date);

        isAfterStartDate = limitDate.getTime() <= purchaseDate.getTime();
      }

      if (dateEndValue) {
        const limitDate = new Date(dateEndValue);
        const purchaseDate = new Date(purchase.date);

        isBeforeEndDate = limitDate.getTime() >= purchaseDate.getTime();
      }

      return isName && isCategory && isAfterStartDate && isBeforeEndDate;
    });

    if (sortBy !== 'initial') {
      handlePurchasesSort();
    }
  };

  const handlePurchasesDisplay = () => {
    if (!purchasesCopy.length) {
      tableHeader.style.display = 'none';
      tableNoDataInfoField.style.display = 'block';
      reportsSummaryField.style.display = 'none';
    } else {
      tableHeader.style.display = 'table-header-group';
      tableNoDataInfoField.style.display = 'none';
      reportsSummaryField.style.display = 'flex';
    }

    tableBody.innerHTML = '';
    let endIndex = currentPage * paginationStep;
    const startIndex = endIndex - paginationStep;
    let purchaseCount = 0;
    purchasesCopy.slice(startIndex, endIndex).forEach((purchase, index) => {
      const tr = document.createElement('tr');
      tr.classList.add('reports__table-row');

      tableHeaders.forEach((tableHeader) => {
        const td = document.createElement('td');
        td.classList.add('reports__table-body-data');

        if (tableHeader === 'Price') {
          td.classList.add('reports__table-body-data--price');
        }

        if (rowSelected !== undefined && rowSelected === index) {
          td.classList.add('reports__table-body-data--active');
        }

        td.textContent = purchase[tableHeader.toLowerCase()];
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
      purchaseCount++;
    });

    const blankRowsNumber = paginationStep - purchaseCount;

    if (blankRowsNumber) {
      for (let i = 0; i < blankRowsNumber; i++) {
        const tr = document.createElement('tr');
        tr.classList.add('reports__table-row');

        tableHeaders.forEach((tableHeader) => {
          const td = document.createElement('td');
          td.classList.add('reports__table-body-data');
          td.textContent = 'oks';
          td.style.opacity = 0;
          tr.appendChild(td);
        });
        tableBody.appendChild(tr);
      }
    }
  };

  const handlePurchasesSort = () => {
    switch (sortBy) {
      case 'initial':
        purchasesCopy = [...purchases];
        handleFormReset();
        break;
      case 'name':
        purchasesCopy.sort((firstPurchase, secondPurchase) =>
          firstPurchase.name.localeCompare(secondPurchase.name)
        );
        break;
      case 'date':
        purchasesCopy.sort((firstPurchase, secondPurchase) => {
          const firstDate = new Date(firstPurchase.date);
          const secondDate = new Date(secondPurchase.date);

          console.log(firstDate, secondDate, firstDate.getTime());

          return firstDate.getTime() - secondDate.getTime();
        });
        break;
      case 'price':
        purchasesCopy.sort(
          (firstPurchase, secondPurchase) =>
            Number(firstPurchase.price) - Number(secondPurchase.price)
        );
        break;
    }
  };

  const handleCategoriesSet = () => {
    const categories = purchases.reduce((uniqueCategories, purchase) => {
      if (!uniqueCategories.includes(purchase.category)) {
        uniqueCategories.push(purchase.category);
      }
      return uniqueCategories;
    }, []);

    categories.forEach((category) => {
      const option = document.createElement('option');
      option.setAttribute('value', category);
      option.textContent = category;
      categoryField.appendChild(option);
    });
  };

  const handlePaginationSet = () => {
    paginationBlocksField.innerHTML = '';

    const numberOfBlocks = Math.ceil(purchasesCopy.length / paginationStep);

    if (numberOfBlocks <= 1) {
      paginationButtonSwitchLeft.style.display = 'none';
      paginationButtonSwitchRight.style.display = 'none';
      return;
    } else {
      paginationButtonSwitchLeft.style.display = 'block';
      paginationButtonSwitchRight.style.display = 'block';
    }

    for (let i = 1; i <= numberOfBlocks; i++) {
      const paginationBlock = document.createElement('div');
      paginationBlock.classList.add('pagination__block');
      paginationBlock.textContent = i;
      paginationBlocksField.appendChild(paginationBlock);
    }

    const paginationBlocks = document.querySelectorAll('.pagination__block');

    [...paginationBlocks].forEach((paginationBlock, index) => {
      paginationBlock.addEventListener('click', () => {
        currentPage = index + 1;
        handleCurrentActivePageSet();
        handlePurchasesDisplay();
      });
    });

    return numberOfBlocks;
  };

  const handleCurrentActivePageSet = () => {
    const paginationBlocks = document.querySelectorAll('.pagination__block');
    [...paginationBlocks].forEach((paginationBlock, index) => {
      paginationBlock.classList.remove('pagination__block--active');

      if (index + 1 === currentPage) {
        paginationBlock.classList.add('pagination__block--active');
      }
    });
  };

  const handleTotalPriceSum = () => {
    if (purchasesCopy) {
      const prices = purchasesCopy.map((purchaseCopy) => +purchaseCopy.price);
      const maxDecimalPlaces = 2;

      const fractionalPrices = prices.filter((price) => price % 1);
      const fractionalPricesMultiplied = fractionalPrices.map(
        (price) => price * 10 ** maxDecimalPlaces
      );
      const fractionalPricesSum =
        fractionalPricesMultiplied.reduce(
          (priceSum, currentPrice) => priceSum + currentPrice,
          0
        ) /
        10 ** maxDecimalPlaces;

      const nonFractionalPrices = prices.filter(
        (price) => !fractionalPrices.includes(price)
      );
      const nonFractionalPricesSum = nonFractionalPrices.reduce(
        (priceSum, currentPrice) => priceSum + currentPrice,
        0
      );

      const totalPrice = nonFractionalPricesSum + fractionalPricesSum;

      totalPriceField.textContent = `${totalPrice}`;
    }
  };

  const handleRowNumberFind = (target) => {
    const rows = tableBody.querySelectorAll('.reports__table-row');
    let rowNumber = 0;

    for (const row of rows) {
      let tableBodyCells = row.querySelectorAll('.reports__table-body-data');

      for (const tableBodyCell of tableBodyCells) {
        if (target === tableBodyCell) {
          return rowNumber;
        }
      }

      rowNumber++;
    }
  };

  const handleInputChange = () => {
    currentPage = 1;
    handlePurchasesFilter();
    handlePurchasesDisplay();
    numberOfBlocks = handlePaginationSet();
    handleCurrentActivePageSet();
    handleTotalPriceSum();
  };

  const handleFormReset = () => {
    searchField.value = '';
    categoryField.value = '';
    dateStartField.value = '';
    dateEndField.value = '';
    sortByField.value = '';
    searchedValue = '';
    categoryValue = 'all';
    sortBy = 'initial';
    dateStartValue = '';
    dateEndValue = '';
    rowSelected = undefined;
    handleInputChange();
  };

  const handleCurrentPageChange = () => {
    handleCurrentActivePageSet();
    rowSelected = undefined;
    handlePurchasesDisplay();
  };

  const purchasesFromLocalStorage = handlePurchasesFromLocalStorageFetch();
  let purchases = purchasesFromLocalStorage
    ? [...purchasesFromLocalStorage, ...handleExistingPurchasesFetch()]
    : [...handleExistingPurchasesFetch()];
  let purchasesCopy = [...purchases];
  handleCategoriesSet();
  let numberOfBlocks = handlePaginationSet();
  handleCurrentActivePageSet();
  handlePurchasesDisplay();
  handleTotalPriceSum();

  searchField.addEventListener('input', (event) => {
    searchedValue = event.target.value;
    handleInputChange();
  });

  categoryField.addEventListener('change', (event) => {
    categoryValue = event.target.value;
    handleInputChange();
  });

  sortByField.addEventListener('change', (event) => {
    console.log(event.target.value);
    sortBy = event.target.value;
    handlePurchasesSort();
    handlePurchasesDisplay();
    handleTotalPriceSum();
  });

  dateStartField.addEventListener('change', (event) => {
    dateStartValue = event.target.value;
    dateEndField.min = dateStartValue;
    handleInputChange();
  });

  dateEndField.addEventListener('change', (event) => {
    dateEndValue = event.target.value;
    handleInputChange();
  });

  paginationButtonSwitchLeft.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      handleCurrentPageChange();
    }
  });

  paginationButtonSwitchRight.addEventListener('click', () => {
    if (currentPage < numberOfBlocks) {
      currentPage++;
      handleCurrentPageChange();
    }
  });

  resetButton.addEventListener('click', handleFormReset);

  tableBody.addEventListener('dblclick', (event) => {
    const target = event.target;
    console.log(1);
    if (target.tagName === 'TD') {
      rowSelected = handleRowNumberFind(target);
      deleteButton.style.display = 'block';
      handlePurchasesDisplay();
    }
  });

  deleteButton.addEventListener('click', handlePurchaseDelete);

  window.addEventListener('click', (event) => {
    const target = event.target;
    const isWithinTable = tableBody.contains(target);
    const isDeleteButton = target === deleteButton;

    if (!isWithinTable && !isDeleteButton) {
      rowSelected = undefined;
      deleteButton.style.display = 'none';
      handlePurchasesDisplay();
    }
  });
};
  