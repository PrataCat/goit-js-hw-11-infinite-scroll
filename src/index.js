import axios from 'axios';
import Notiflix from 'notiflix';
Notiflix.Notify.init({
  timeout: 4000,
  clickToClose: true,
});
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.getElementById('search-form');
const input = document.querySelector("input[name='searchQuery']");
const list = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
let pageNumber = 1;
let totalElNumber = 0;
const firstElNumber = 40;
let currentElNumber = firstElNumber;

const URL = 'https://pixabay.com/api/';
const KEY = '33638129-981d5a332eef74e1c5d750a3a';
let searchName = '';

form.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', onClick);

async function onSubmit(e) {
  e.preventDefault();
  if (!loadMoreBtn.classList.contains('is-hidden')) {
    loadMoreBtn.classList.add('is-hidden');
  } else {
  }
  searchName = input.value;
  pageNumber = 1;
  currentElNumber = firstElNumber;
  clearGallery();

  try {
    const res = await fetchImgs(searchName);
    const hits = await res.data.hits;
    if (hits.length >= 1) {
      const CardList = createCardList(hits);
      loadMoreBtn.classList.remove('is-hidden');
      pageNumber += 1;
      currentElNumber += firstElNumber;
      totalElNumber = res.data.totalHits;
      Notiflix.Notify.info(`Hooray! We found ${totalElNumber} images.`);
    } else {
      const warning = Notiflix.Notify.warning(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch {
    Notiflix.Notify.warning('Oops, something went wrong. Try again');
  }
}

async function onClick() {
  try {
    if (currentElNumber < totalElNumber + firstElNumber - 1) {
      loadMoreBtn.disabled = true;
      loadMoreBtn.textContent = 'Loading...';
      const res = await fetchImgs(searchName);
      const hits = await res.data.hits;
      const newPackPhoto = createCardList(hits);
      loadMoreBtn.textContent = 'Load more';
      loadMoreBtn.disabled = false;
      pageNumber += 1;
      currentElNumber += firstElNumber;
      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });
    } else {
    }
    if (currentElNumber >= totalElNumber) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreBtn.classList.add('is-hidden');
    }
  } catch {
    Notiflix.Notify.warning('Oops');
  }
}

async function fetchImgs() {
  const options = {
    params: {
      q: `${searchName}`,
      page: pageNumber,
      per_page: firstElNumber,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
    },
  };
  return axios.get(`${URL}?key=${KEY}`, options);
}

function clearGallery() {
  list.innerHTML = '';
}

function createCardList(arr) {
  let photoCard = arr
    .map(
      item =>
        `<a href="${item.largeImageURL}"><div class="photo-card">
      <img src="${item.webformatURL}" alt="${item.tags}" title="<b>Likes: </b>${item.likes} <b>/</b>  <b>Downloads: </b>${item.downloads}" loading="lazy" /></div>
      <div class="info">
        <p class="info-item">
          <b><span class='item-value'>Likes:</span></b><span class='item-value'>${item.likes}</span>
        </p>
        <p class="info-item">
          <b><span class='item-value'>Views:</span></b><span class='item-value'>${item.views}</span>
        </p>
        <p class="info-item">
          <b><span class='item-value'>Comments:</span></b><span class='item-value'>${item.comments}</span></b>
        </p>
        <p class="info-item">
          <b><span class='item-value'>Downloads:</span></b><span class='item-value'>${item.downloads}</span></b>
        </p>
      </div>
    </a>`
    )
    .join('');
  list.insertAdjacentHTML('beforeend', photoCard);
  var lightbox = new SimpleLightbox('.gallery a', {
    href: '${item.largeImageURL}',
    src: '${item.webformatURL}',
    alt: '${item.tags}',
    captions: true,
    captionSelector: 'img',
    captionType: 'attr',
    captionsData: 'title',
    captionPosition: 'bottom',
    captionDelay: 250,
    captionClass: '',
  });
  lightbox.refresh();
}
