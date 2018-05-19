import axios from 'axios';
import dompurify from 'dompurify';

const showResultsHTML = stores =>
  stores.map(store => `
    <a href="/store/${store.slug}" class="search__result">
      ${store.name}
    </a>
  `).join('');

export default function (search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name=search]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function () {
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    searchResults.style.display = 'block';

    axios
      .get(`/api/search?q=${this.value}`)
      .then(res => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(showResultsHTML(res.data));
          return;
        }

        searchResults.innerHTML = dompurify.sanitize(`
          <div class="search__result">No results for ${this.value}</div>
        `)
      });
  });

  searchInput.on('keyup', e => {
    if (![38, 40, 13].includes(e.keyCode)) return;

    const activeClass = 'search__result--active';
    const current = document.querySelector(`.${activeClass}`);
    const results = document.querySelectorAll('.search__result');
    let next;

    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || results[0];
    } else if (e.keyCode === 40) {
      next = results[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || results[results.length - 1];
    } else if (e.keyCode === 38) {
      next = results[results.length - 1];
    } else if (e.keyCode === 13 && current.href) {
      window.location = current.href;
    }

    current && current.classList.remove(activeClass);

    next && next.classList.add(activeClass);
  })
};