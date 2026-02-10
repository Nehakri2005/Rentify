
  // Initialize the map and set view to Pune
  const map = L.map('map').setView([18.5204, 73.8567], 13);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add a marker for Pune
  const marker = L.marker([18.5204, 73.8567]).addTo(map)
    .bindPopup('You are here in Pune!')
    .openPopup();
