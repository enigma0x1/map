export const mapOptions = {
  center: [20, 0],
  zoom: 2,
  minZoom: 2,
  maxZoom: 8,
  zoomControl: true,
  attributionControl: false,
  maxBounds: [
    [-90, -180],
    [90, 180]
  ],
  maxBoundsViscosity: 1.0,
  zoomAnimation: false,
  fadeAnimation: false,
  markerZoomAnimation: false,
  preferCanvas: true
};

export const themeOptions = {
  retro: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    options: {
      maxZoom: 18,
      tileSize: 512,
      zoomOffset: -1,
      className: 'retro-map-tiles'
    }
  }
};

export const getBaseStyle = () => ({
  fillColor: 'transparent',
  fillOpacity: 0,
  color: '#5C2E0E',
  opacity: 0.6,
  weight: 1.2
});

export const getHighlightStyle = () => ({
  fillColor: '#A0522D',
  weight: 2,
  opacity: 1,
  color: '#FFF8EB',
  dashArray: '',
  fillOpacity: 0.7,
  className: 'country-highlight'
});

export const getSelectedStyle = () => ({
  fillColor: 'transparent',
  weight: 2,
  opacity: 1,
  color: '#FFF8EB',
  fillOpacity: 0,
  className: 'country-pop'
});

export const addContinentLabels = (map) => {
  const continents = [
    { name: 'NORTH AMERICA', coords: [45, -100] },
    { name: 'SOUTH AMERICA', coords: [-15, -60] },
    { name: 'EUROPE', coords: [50, 15] },
    { name: 'AFRICA', coords: [0, 20] },
    { name: 'ASIA', coords: [45, 90] },
    { name: 'OCEANIA', coords: [-25, 135] }
  ];

  continents.forEach(continent => {
    L.marker(continent.coords, {
      icon: L.divIcon({
        className: 'continent-label',
        html: `<div>${continent.name}</div>`
      })
    }).addTo(map);
  });
};
