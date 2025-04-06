// Create a popup container
const popup = document.createElement("div");
popup.id = "popup";
popup.style.position = "absolute";
popup.style.display = "none";
// Remove inline styles since we're using the style.css file
document.body.appendChild(popup);

// Function to show the popup
export function showPopup(wonder: {
  name: string;
  description: string;
  quote: string;
  quoteAuthor: string;
  wikipedia: string;
  image: string;
}) {
  popup.innerHTML = `
      <div class="popup-content">
        <img src="${wonder.image}" alt="${wonder.name}" class="popup-image" />
        <div class="popup-text">
          <h3>${wonder.name}</h3>
          <p class="description">${wonder.description}</p>
          <blockquote>"${wonder.quote}"</blockquote>
          <p class="author">- ${wonder.quoteAuthor}</p>
        </div>
      </div>
      <a href="${wonder.wikipedia}" target="_blank" class="more-info">More info...</a>
    `;
  popup.style.display = "block";
}

// Function to hide the popup
export function hidePopup() {
  popup.style.display = "none";
}

// Export the popup element for positioning
export { popup };
