<script context="module">
  export const categories = {
    military: {
      label: "Military Alliances",
      alliances: [
        { id: "NATO", name: "NATO", color: "#4C6EF5", desc: "North Atlantic Treaty Organization" },
        { id: "CSTO", name: "CSTO", color: "#FA5252", desc: "Collective Security Treaty Organization" },
        { id: "SCO", name: "SCO", color: "#12B886", desc: "Shanghai Cooperation Organisation" }
      ]
    },
    economic: {
      label: "Economic Organizations",
      alliances: [
        { id: "G7", name: "G7", color: "#40C057", desc: "Group of Seven" },
        { id: "G20", name: "G20", color: "#F59F00", desc: "Group of Twenty" },
        { id: "BRICS", name: "BRICS", color: "#228BE6", desc: "Brazil, Russia, India, China, South Africa" },
        { id: "EU", name: "EU", color: "#7950F2", desc: "European Union" },
        { id: "OECD", name: "OECD", color: "#E64980", desc: "Organisation for Economic Co-operation and Development" }
      ]
    },
    regional: {
      label: "Regional Organizations",
      alliances: [
        { id: "ASEAN", name: "ASEAN", color: "#20C997", desc: "Association of Southeast Asian Nations" },
        { id: "AU", name: "AU", color: "#FD7E14", desc: "African Union" },
        { id: "AL", name: "Arab League", color: "#BE4BDB", desc: "League of Arab States" },
        { id: "OIC", name: "OIC", color: "#15AABF", desc: "Organization of Islamic Cooperation" }
      ]
    },
    trade: {
      label: "Trade Organizations",
      alliances: [
        { id: "NAFTA", name: "NAFTA", color: "#FF922B", desc: "North American Free Trade Agreement" },
        { id: "MERCOSUR", name: "MERCOSUR", color: "#5C7CFA", desc: "Southern Common Market" },
        { id: "EFTA", name: "EFTA", color: "#FF6B6B", desc: "European Free Trade Association" }
      ]
    }
  };

  export const membershipData = {
    NATO: [
      "United States of America", "United Kingdom", "Turkey", "Spain", "Portugal",
      "Norway", "Netherlands", "Luxembourg", "Italy", "Iceland", "Greece",
      "Germany", "France", "Denmark", "Canada", "Belgium", "Poland", "Hungary",
      "Czech Republic", "Bulgaria", "Estonia", "Latvia", "Lithuania", "Romania",
      "Slovakia", "Slovenia", "Albania", "Croatia", "Montenegro", "North Macedonia"
    ],
    BRICS: [
      "Brazil", "Russia", "India", "China", "South Africa", "Iran", "Saudi Arabia",
      "Ethiopia", "Egypt", "Argentina", "United Arab Emirates"
    ],
    G7: [
      "United States of America", "United Kingdom", "Japan", "Italy", "Germany",
      "France", "Canada"
    ],
    G20: [
      "United States of America", "United Kingdom", "Turkey", "South Africa", "Saudi Arabia",
      "Russia", "Mexico", "South Korea", "Japan", "Italy", "Indonesia", "India",
      "Germany", "France", "China", "Canada", "Brazil", "Australia", "Argentina",
      "European Union"
    ],
    EU: [
      "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
      "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
      "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta",
      "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
      "Spain", "Sweden"
    ],
    ASEAN: [
      "Brunei", "Cambodia", "Indonesia", "Laos", "Malaysia", "Myanmar",
      "Philippines", "Singapore", "Thailand", "Vietnam"
    ],
    AU: [
      "Algeria", "Angola", "Benin", "Botswana", "Burkina Faso", "Burundi",
      "Cameroon", "Cape Verde", "Central African Republic", "Chad", "Comoros",
      "Congo", "Democratic Republic of the Congo", "Djibouti", "Egypt",
      "Equatorial Guinea", "Eritrea", "Ethiopia", "Gabon", "Gambia", "Ghana",
      "Guinea", "Guinea-Bissau", "Ivory Coast", "Kenya", "Lesotho", "Liberia",
      "Libya", "Madagascar", "Malawi", "Mali", "Mauritania", "Mauritius",
      "Morocco", "Mozambique", "Namibia", "Niger", "Nigeria", "Rwanda",
      "Sao Tome and Principe", "Senegal", "Seychelles", "Sierra Leone",
      "Somalia", "South Africa", "South Sudan", "Sudan", "Swaziland",
      "Tanzania", "Togo", "Tunisia", "Uganda", "Zambia", "Zimbabwe"
    ]
  };
</script>

<script>
  import { onMount, onDestroy } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  let map;
  let mapElement;
  let geoJsonLayer;
  let activeTab = 'military';
  let activeAlliance = null;
  let mapInitialized = false;
  const mapOptions = {
    center: [20, 0],
    zoom: 2,
    minZoom: 2,
    maxZoom: 8,
    zoomControl: true,
    maxBounds: [
      [-90, -180],
      [90, 180]
    ],
    maxBoundsViscosity: 1.0
  };
  const getBaseStyle = () => ({
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#2c3e50',
    weight: 1.2,
    opacity: 0.6
  });
  const initializeMap = async () => {
    if (mapInitialized) return;
    const L = await import('leaflet');
    
    map = L.map(mapElement, mapOptions);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©CartoDB',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
    try {
      const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
      const data = await response.json();
      
      geoJsonLayer = L.geoJSON(data, {
        style: getBaseStyle,
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: (e) => handleMouseOver(e, feature, layer),
            mouseout: (e) => handleMouseOut(e, feature, layer)
          });
        }
      }).addTo(map);
      mapInitialized = true;
    } catch (error) {
      console.error('Error loading map:', error);
    }
  };
  function highlightCountries(allianceId) {
    if (!geoJsonLayer) return;
    geoJsonLayer.eachLayer(layer => {
      const countryName = layer.feature.properties.name;
      
      if (allianceId && membershipData[allianceId]?.includes(countryName)) {
        const alliance = categories[activeTab].alliances.find(a => a.id === allianceId);
        layer.setStyle({
          fillColor: alliance.color,
          fillOpacity: 0.7,
          color: '#fff',
          weight: 1,
          opacity: 1
        });
      } else {
        layer.setStyle(getBaseStyle());
      }
    });
  }
  function handleMouseOver(e, feature, layer) {
    const countryName = feature.properties.name;
    
    if (activeAlliance && membershipData[activeAlliance]?.includes(countryName)) {
      return;
    }
    layer.bindTooltip(countryName, {
      permanent: false,
      direction: 'center',
      className: 'country-tooltip'
    }).openTooltip();
  }
  function handleMouseOut(e, feature, layer) {
    layer.closeTooltip();
  }
  function handleAllianceClick(alliance) {
    if (activeAlliance === alliance.id) {
      activeAlliance = null;
      highlightCountries(null);
    } else {
      activeAlliance = alliance.id;
      highlightCountries(alliance.id);
    }
  }
  onMount(() => {
    initializeMap();
  });
  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<!-- Template -->
<div>
  <!-- Bileşenin görünüm kısmı buraya -->
</div>

<style>
  .alliance-box {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 380px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    z-index: 1000;
  }
  .box-header {
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #e9ecef;
  }
  .box-header h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
  }
  .reset-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border: none;
    background: #f1f3f5;
    color: #495057;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .reset-btn:hover {
    background: #e9ecef;
  }
  .tab-container {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 8px;
    background: #f8f9fa;
  }
  .tab-button {
    padding: 8px 16px;
    border: none;
    background: none;
    font-size: 13px;
    font-weight: 500;
    color: #495057;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .tab-button:hover {
    background: #e9ecef;
  }
  .tab-button.active {
    background: #228be6;
    color: white;
  }
  .alliance-content {
    padding: 16px;
    max-height: 400px;
    overflow-y: auto;
  }
  .alliance-buttons {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .alliance-btn {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    padding: 12px;
    border: 1px solid #e9ecef;
    border-radius: 12px;
    background: white;
    text-align: left;
    cursor: pointer;
    transition: all 0.2s;
  }
  .alliance-btn:hover {
    border-color: var(--alliance-color);
    background: rgba(var(--alliance-color), 0.05);
  }
  .alliance-btn.active {
    background: var(--alliance-color);
    border-color: var(--alliance-color);
    color: white;
  }
  .alliance-info {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .alliance-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
  .alliance-name {
    font-weight: 500;
    font-size: 14px;
  }
  .alliance-desc {
    font-size: 12px;
    color: #868e96;
  }
  .alliance-btn.active .alliance-desc {
    color: rgba(255, 255, 255, 0.8);
  }
  .map {
    width: 100%;
    height: 100vh;
  }
  :global(.country-tooltip) {
    background: rgba(0, 0, 0, 0.8);
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    color: white;
    font-size: 12px;
  }
  @media (max-width: 768px) {
    .alliance-box {
      width: 90%;
      left: 50%;
      transform: translateX(-50%);
      max-height: 50vh;
    }
    .tab-container {
      overflow-x: auto;
      flex-wrap: nowrap;
    }
  }
</style>
