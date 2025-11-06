import { apiClient } from '../helpers/Api.helper.js'

import start from './start.js';
import traviata from './traviata.js';
import requiem from './requiem.js';
import operagala from './operagala.js';

const main = document.querySelector('main');

function resetBodyClass() {
  document.body.classList.remove('traviata-bg', 'requiem-bg', 'operagala-bg');
}

// Funktion som bestämmer vilken sida som ska visas
function render() {
  const page = location.hash.slice(1);
  if (!page) {
    resetBodyClass();
    main.innerHTML = start();
    document.title = "Opera Emporium";
    return;
  }

  if (page === "traviata") {
    resetBodyClass();
    document.body.classList.add('traviata-bg')

    main.innerHTML = traviata();
  }
  else if (page === "requiem") {
    resetBodyClass();
    document.body.classList.add('requiem-bg')
    main.innerHTML = requiem();
  }
  else if (page === "operagala") {
    resetBodyClass();
    document.body.classList.add('operagala-bg');

    main.innerHTML = operagala();
  }
  else {
    resetBodyClass();
    main.innerHTML = start();
    document.title = "Opera Emporium";
    return;
  }


  // Uppdatera flikens titel automatiskt från <h2> om det finns
  const title = document.querySelector('main h2');
  if (title) {
    document.title = title.textContent;
  } else {
    document.title = "Opera Emporium";
  }
}

// När sidan laddas eller hash ändras:
window.addEventListener('DOMContentLoaded', render);
window.addEventListener('hashchange', render);