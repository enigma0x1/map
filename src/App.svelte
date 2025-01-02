<script>
  import { onMount, onDestroy } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import { fade, slide } from 'svelte/transition';
  import { countryInfo } from './lib/countryData';

  let map;
  let mapElement;
  let selectedCountry = null;
  let activeTab = 'Details';
  let isLoading = false;
  let currentLayer = null;
  let geoJsonLayer = null;
  let mapInitialized = false;
  let lastClickTime = 0;
  let activeAlliance = null;
  let currentTheme = 'retro';
  const DOUBLE_CLICK_THRESHOLD = 300;
  const categories = {
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
        { id: "EU", name: "EU", color: "#7950F2", desc: "European Union" }
      ]
    }
  };
  const membershipData = {
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
    ]
  };
  const mapOptions = {
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
  const getBaseStyle = () => ({
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#5C2E0E',
    opacity: 0.6,
    weight: 1.2
  });
  const getHighlightStyle = () => ({
    fillColor: '#A0522D',
    weight: 2,
    opacity: 1,
    color: '#FFF8EB',
    dashArray: '',
    fillOpacity: 0.7,
    className: 'country-highlight'
  });
  const getSelectedStyle = () => ({
    fillColor: '#8B4513',
    weight: 2,
    opacity: 1,
    color: '#FFF8EB',
    dashArray: '',
    fillOpacity: 0.7,
    className: 'country-selected'
  });
  const themeOptions = {
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

  let isAnimating = false;

  const handleCountryClick = async (e, feature, layer) => {
    if (isAnimating) return;
    isAnimating = true;
    isLoading = true;
    const currentTime = Date.now();
    const countryName = feature.properties.name;
    if (currentTime - lastClickTime < DOUBLE_CLICK_THRESHOLD) {
      isAnimating = false;
      isLoading = false;
      return;
    }
    lastClickTime = currentTime;
    try {
      if (currentLayer) {
        currentLayer.setStyle(getBaseStyle());
      }
      const info = countryInfo[countryName];
      if (info) {
        selectedCountry = { name: countryName, data: info, layer };
        activeTab = 'Details';
        currentLayer = layer;
        layer.setStyle(getSelectedStyle());
        const bounds = layer.getBounds();
        const center = bounds.getCenter();
        await map.flyTo(center, 4, {
          duration: 1,
          easeLinearity: 0.25
        });
      }
    } catch (error) {
      console.error('Error handling country click:', error);
    } finally {
      isLoading = false;
      isAnimating = false;
    }
  };
  const handleMouseOver = (e, feature, layer) => {
    const countryName = feature.properties.name;
    if (selectedCountry?.name !== countryName) {
      layer.setStyle(getHighlightStyle());
      layer.bindTooltip(countryName, {
        permanent: false,
        direction: 'center',
        className: 'country-tooltip'
      }).openTooltip();
    }
  };
  const handleMouseOut = (e, feature, layer) => {
    const countryName = feature.properties.name;
    if (selectedCountry?.name !== countryName) {
      layer.setStyle(getBaseStyle());
    }
    layer.closeTooltip();
  };
  const initializeMap = async () => {
    if (mapInitialized) return;
    const L = await import('leaflet');
    map = L.map(mapElement, mapOptions);

    // Retro base map
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 18,
      attribution: '&copy; Esri',
      className: 'retro-map-tiles'
    }).addTo(map);

    // Canvas renderer
    const canvasRenderer = L.canvas();

    try {
      const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
      const data = await response.json();
      geoJsonLayer = L.geoJSON(data, {
        style: getBaseStyle,
        renderer: canvasRenderer,
        onEachFeature: (feature, layer) => {
          layer.on({
            mouseover: (e) => handleMouseOver(e, feature, layer),
            mouseout: (e) => handleMouseOut(e, feature, layer),
            click: (e) => handleCountryClick(e, feature, layer)
          });
        }
      }).addTo(map);
      mapInitialized = true;
    } catch (error) {
      console.error('Error initializing map:', error);
    }
    addContinentLabels();
    // Özel attribution ekleme
    L.control.attribution({
      prefix: false,
      position: 'bottomright'
    }).addAttribution('Created by Fatih Emre Aksoy').addTo(map);
  };
  function highlightCountries(allianceId) {
    if (!geoJsonLayer) return;
    geoJsonLayer.eachLayer(layer => {
      const countryName = layer.feature.properties.name;
      if (allianceId && membershipData[allianceId]?.includes(countryName)) {
        const alliance = Object.values(categories)
          .flatMap(cat => cat.alliances)
          .find(a => a.id === allianceId);
        layer.setStyle({
          fillColor: alliance.color,
          fillOpacity: 0.7,
          color: '#FFF8EB',
          weight: 1,
          opacity: 1
        });
      } else {
        layer.setStyle(getBaseStyle());
      }
    });
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
  const closePopup = () => {
    if (currentLayer) {
      currentLayer.setStyle(getBaseStyle());
      currentLayer = null;
    }
    selectedCountry = null;
    map.setView([20, 0], 2, {
      duration: 1,
      easeLinearity: 0.25
    });
  };
  function handleThemeChange(theme) {
    currentTheme = theme;
  }
  const addContinentLabels = () => {
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
  onMount(async () => {
    await initializeMap();
  });
  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>
<nav class="retro-nav" data-theme="retro">
  <div class="compass">🧭</div>
  {#each Object.entries(categories) as [key, category]}
    {#each category.alliances as alliance}
      <button
        class="retro-btn"
        class:active={activeAlliance === alliance.id}
        style="--alliance-color: {alliance.color}"
        on:click={() => handleAllianceClick(alliance)}
      >
        <span class="retro-dot" style="background: {alliance.color}"></span>
        {alliance.name}
      </button>
    {/each}
  {/each}
</nav>
<main>
  <div class="map" bind:this={mapElement}></div>
  {#if selectedCountry}
    <div class="retro-popup" transition:slide data-theme="retro">
      <div class="retro-header">
        <h3>{selectedCountry.name}</h3>
        <button class="retro-close" on:click={closePopup}>×</button>
      </div>
      <div class="retro-tabs">
        <button
          class="retro-tab"
          class:active={activeTab === 'Details'}
          on:click={() => activeTab = 'Details'}
        >
          Details
        </button>
        <button
          class="retro-tab"
          class:active={activeTab === 'Military'}
          on:click={() => activeTab = 'Military'}
        >
          Military
        </button>
        <button
          class="retro-tab"
          class:active={activeTab === 'Economy'}
          on:click={() => activeTab = 'Economy'}
        >
          Economy
        </button>
      </div>
      <div class="retro-content">
        {#if activeTab === 'Details'}
          <div class="retro-info-item">
            <div class="retro-label">Population</div>
            <div class="retro-value">{selectedCountry.data.general.population}</div>
          </div>
          <div class="retro-info-item">
            <div class="retro-label">Capital</div>
            <div class="retro-value">{selectedCountry.data.general.capital}</div>
          </div>
          <div class="retro-info-item">
            <div class="retro-label">Alliance</div>
            <div class="retro-value">{selectedCountry.data.general.alliance}</div>
          </div>
        {:else if activeTab === 'Military'}
          <div class="retro-info-item">
            <div class="retro-label">Overview</div>
            <div class="retro-value">{selectedCountry.data.military.overview}</div>
          </div>
          <div class="retro-info-item">
            <div class="retro-label">Personnel</div>
            <div class="retro-value">{selectedCountry.data.military.personnel}</div>
          </div>
          <div class="retro-info-item">
            <div class="retro-label">Equipment</div>
            <div class="retro-value">{selectedCountry.data.military.equipment}</div>
          </div>
        {:else if activeTab === 'Economy'}
          <div class="retro-info-item">
            <div class="retro-label">GDP</div>
            <div class="retro-value">{selectedCountry.data.general.gdp}</div>
          </div>
          <div class="retro-info-item">
            <div class="retro-label">Economy</div>
            <div class="retro-value">{selectedCountry.data.general.economy}</div>
          </div>
        {/if}
      </div>
    </div>
  {/if}
  {#if isLoading}
    <div class="loader" transition:fade>
      <div class="spinner"></div>
    </div>
  {/if}
</main>
<style>
  /* Genel Retro Stili */
  :global(body) {
    font-family: 'Courier New', monospace;
    background: #F5E6D3;
  }

  /* Retro Navigation */
  .retro-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 48px;
    background: #F5E6D3;
    border-bottom: 2px solid #8B4513;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 20px;
    box-shadow: 0 2px 4px rgba(139, 69, 19, 0.2);
    z-index: 1000;
  }

  .compass {
    font-size: 24px;
    margin-right: 16px;
  }

  .retro-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 16px;
    border: 2px solid #8B4513;
    background: #FFF8EB;
    color: #8B4513;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 2px 2px 0 #8B4513;
  }

  .retro-btn:hover {
    transform: translate(-1px, -1px);
    box-shadow: 3px 3px 0 #8B4513;
  }

  .retro-btn.active {
    background: #8B4513;
    color: #FFF8EB;
    box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.3);
    transform: translate(1px, 1px);
  }

  /* Retro Popup */
  .retro-popup {
    position: absolute;
    top: 60px;
    right: 20px;
    width: 400px;
    background: #F5E6D3;
    border: 2px solid #8B4513;
    box-shadow: 4px 4px 0 rgba(139, 69, 19, 0.3);
    z-index: 1000;
  }

  .retro-header {
    background: #8B4513;
    color: #F5E6D3;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #8B4513;
  }

  .retro-header h3 {
    margin: 0;
    font-family: 'Courier New', monospace;
    font-size: 18px;
  }

  .retro-close {
    background: none;
    border: none;
    color: #F5E6D3;
    font-size: 24px;
    cursor: pointer;
    padding: 0 5px;
  }

  .retro-tabs {
    display: flex;
    gap: 2px;
    padding: 12px;
    background: #E6D5C3;
  }

  .retro-tab {
    padding: 8px 16px;
    background: #F5E6D3;
    border: 2px solid #8B4513;
    color: #8B4513;
    font-family: 'Courier New', monospace;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
  }

  .retro-tab:hover {
    background: #FFE8CC;
  }

  .retro-tab.active {
    background: #8B4513;
    color: #F5E6D3;
  }

  /* Retro Content Styles */
  .retro-content {
    padding: 20px;
    background: url('paper-texture.png');
    border-top: 2px solid #8B4513;
  }

  .retro-info-item {
    margin-bottom: 16px;
    padding: 12px;
    border: 1px solid #8B4513;
    background: rgba(255, 248, 235, 0.7);
  }

  .retro-label {
    font-weight: bold;
    color: #8B4513;
    margin-bottom: 4px;
  }

  .retro-value {
    color: #5C2E0E;
  }

  /* Retro Scrollbar */
  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-track {
    background: #F5E6D3;
    border: 1px solid #8B4513;
  }

  ::-webkit-scrollbar-thumb {
    background: #8B4513;
    border: 2px solid #F5E6D3;
  }

  /* Retro Map Overlay */
  :global(.leaflet-control-zoom) {
    border: 2px solid #8B4513 !important;
    box-shadow: 3px 3px 0 rgba(139, 69, 19, 0.3) !important;
  }

  :global(.leaflet-control-zoom a) {
    background: #F5E6D3 !important;
    color: #8B4513 !important;
    border-color: #8B4513 !important;
  }

  :global(.leaflet-tooltip) {
    background: #F5E6D3 !important;
    border: 2px solid #8B4513 !important;
    color: #8B4513 !important;
    font-family: 'Courier New', monospace !important;
    box-shadow: 3px 3px 0 rgba(139, 69, 19, 0.3) !important;
  }

  /* Kıta isimleri için özel stil */
  :global(.continent-label) {
    font-family: 'Courier New', monospace;
    color: #8B4513;
    font-size: 24px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow:
      3px 3px 3px #F5E6D3,
      -3px -3px 3px #F5E6D3,
      3px -3px 3px #F5E6D3,
      -3px 3px 3px #F5E6D3;
    opacity: 0.7;
  }

  main {
    position: relative;
    width: 100%;
    height: 100vh;
  }

  .map {
    width: 100%;
    height: 100vh;
    padding-top: 48px;
    z-index: 1;
  }

  /* Loader stil güncellemeleri */
  .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .spinner {
    width: 30px;
    height: 30px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #8B4513;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
</style>
