'use strict';
// The complete site remains readable and navigable without JavaScript.
document.querySelectorAll('[data-year]').forEach((element) => {
  element.textContent = String(new Date().getFullYear());
});