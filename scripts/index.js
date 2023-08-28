function loadContent(url) {
  fetch(url)
    .then((response) => response.text())
    .then((content) => {
      const main = document.querySelector('main');
      main.innerHTML = content;

      switch (url) {
        case 'reports.html':
          handleReportsManipulation();
          break;
        case 'expenses.html':
          handleExpensesManipulation();
          break;
        default:
          return -1;
      }
    })
    .catch((error) => console.error('Error loading content:', error));
}

function goUp() {
  window.scroll(0, 0);
}

window.loadContent = loadContent;
loadContent('home.html');
