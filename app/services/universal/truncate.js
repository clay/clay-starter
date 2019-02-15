'use strict';

const truncate = require('html-truncate');

/**
 * truncateText
 *
 * Truncates text or text + HTML at a specified limit without breaking up inner HTML tags. If the text is truncated, return a button with the shortened and full text
 * (expansion behavior should be handled in client-side js and showing/hiding should be handled in css)
 *
 * @param {String} innerText the contents of the element to expand. Can be text or a mix of HTML + text
 * @param {Number} limit where in the string to start truncation
 * @returns {String} truncated HTML
 */
function truncateText(innerText, limit) {
  const truncated = truncate(innerText, limit);
  let fullText;

  if (truncated.length !== innerText.length) {
    fullText = `
    <div class="attribution truncated">
      <span class="shortened">${truncated} <button class="more-trigger">more</button></span>
      <span class="full">${innerText}</span>
    </div>
    `;
  } else {
    fullText = `
    <div class="attribution">
      <span class="full">${innerText}</span>
    </div>
    `;
  }

  return fullText;
}

module.exports = truncateText;
