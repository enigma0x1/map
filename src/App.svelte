<script>
  import { onMount, onDestroy } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import { fade, slide } from 'svelte/transition';
  import { countryInfo } from './lib/countryData';

  let map;
  let mapElement;
  let selectedCountry = null;
  let activeTab = 'president';
  let isLoading = false;
  let currentLayer = null;
  let geoJsonLayer = null;
  let tooltipVisible = false;
  let mapInitialized = false;
  let lastClickTime = 0;
  let activeAlliance = null;
  let currentTheme = 'light';

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
    color: '#2c3e50',
    opacity: 0.6,
    weight: 1.2
  });

  const getHighlightStyle = () => ({
    fillColor: '#2ecc71',
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '',
    fillOpacity: 0.7,
    className: 'country-highlight'
  });

  const getSelectedStyle = () => ({
    fillColor: '#e74c3c',
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '',
    fillOpacity: 0.7,
    className: 'country-selected'
  });

  const themeOptions = {
    light: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '©OpenStreetMap, ©CartoDB'
    },
    vintage: {
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg',
      attribution: 'Map tiles by Stamen Design'
    },
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      attribution: '©OpenStreetMap, ©CartoDB'
    },
    watercolor: {
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
      attribution: 'Map tiles by Stamen Design'
    },
    retro: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri'
    }
  };

  const handleCountryClick = async (e, feature, layer) => {
    isLoading = true;
    const currentTime = Date.now();
    const countryName = feature.properties.name;
    if (currentTime - lastClickTime < DOUBLE_CLICK_THRESHOLD) {
      return;
    }
    lastClickTime = currentTime;
    try {
      if (currentLayer) {
        currentLayer.setStyle(getBaseStyle());
      }
      const info = countryInfo[countryName];
      if (info) {
        selectedCountry = { name: countryName, data: info };
        activeTab = 'president';
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
    
    updateMapTheme();

    try {
      const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
      const data = await response.json();
      geoJsonLayer = L.geoJSON(data, {
        style: getBaseStyle,
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
  };

  function updateMapTheme() {
    if (!map) return;
    map.eachLayer(layer => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });
    const theme = themeOptions[currentTheme];
    L.tileLayer(theme.url, {
      attribution: theme.attribution,
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);
  }

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
          color: '#fff',
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
    updateMapTheme();
  }

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

<main>
  <div class="map" bind:this={mapElement}></div>

  <div class="theme-selector">
    <button class="theme-btn" class:active={currentTheme === 'light'} on:click={() => handleThemeChange('light')}>Light</button>
    <button class="theme-btn" class:active={currentTheme === 'vintage'} on:click={() => handleThemeChange('vintage')}>Vintage</button>
    <button class="theme-btn" class:active={currentTheme === 'dark'} on:click={() => handleThemeChange('dark')}>Dark</button>
    <button class="theme-btn" class:active={currentTheme === 'watercolor'} on:click={() => handleThemeChange('watercolor')}>Watercolor</button>
    <button class="theme-btn" class:active={currentTheme === 'retro'} on:click={() => handleThemeChange('retro')}>Retro</button>
  </div>

  <div class="alliance-box">
    <div class="box-header">
      <h2>Global Organizations</h2>
      {#if activeAlliance}
        <button class="reset-btn" on:click={() => {
          activeAlliance = null;
          highlightCountries(null);
        }}>
          <span class="reset-icon">↺</span>
          Reset
        </button>
      {/if}
    </div>

    <div class="alliance-content">
      <div class="alliance-buttons">
        {#each Object.entries(categories) as [key, category]}
          <div class="category-section">
            <h3>{category.label}</h3>
            {#each category.alliances as alliance}
              <button
                class="alliance-btn"
                class:active={activeAlliance === alliance.id}
                style="--alliance-color: {alliance.color}"
                on:click={() => handleAllianceClick(alliance)}
              >
                <div class="alliance-info">
                  <span class="alliance-dot" style="background: {alliance.color}"></span>
                  <span class="alliance-name">{alliance.name}</span>
                </div>
                <span class="alliance-desc">{alliance.desc}</span>
              </button>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>

  {#if selectedCountry}
    <div class="popup" transition:slide>
      <div class="popup-header">
        <h3>{selectedCountry.name}</h3>
        <button class="close-btn" on:click={closePopup}>×</button>
      </div>
      <div class="tabs">
        <button
          class="tab"
          class:active={activeTab === 'president'}
          on:click={() => activeTab = 'president'}
        >
          Başkan
        </button>
        <button
          class="tab"
          class:active={activeTab === 'general'}
          on:click={() => activeTab = 'general'}
        >
          Genel
        </button>
        <button
          class="tab"
          class:active={activeTab === 'military'}
          on:click={() => activeTab = 'military'}
        >
          Askeri
        </button>
      </div>
      <div class="tab-content">
        {#if activeTab === 'president'}
          <div class="president-info" transition:fade>
            <img
              src={selectedCountry.data.president.image}
              alt={selectedCountry.data.president.name}
              class="president-image"
              on:error={(e) => e.target.src = 'default-president.jpg'}
            >
            <div class="president-details">
              <div class="president-name">{selectedCountry.data.president.name}</div>
              <div class="president-bio">{selectedCountry.data.president.bio}</div>
            </div>
          </div>
        {:else if activeTab === 'general'}
          <div class="general-info" transition:fade>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Nüfus</div>
                <div class="info-value">{selectedCountry.data.general.population}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Başkent</div>
                <div class="info-value">{selectedCountry.data.general.capital}</div>
              </div>
              <div class="info-item">
                <div class="info-label">İttifak</div>
                <div class="info-value">{selectedCountry.data.general.alliance}</div>
              </div>
              <div class="info-item">
                <div class="info-label">GSYİH</div>
                <div class="info-value">{selectedCountry.data.general.gdp}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Ekonomi</div>
                <div class="info-value">{selectedCountry.data.general.economy}</div>
              </div>
            </div>
          </div>
        {:else}
          <div class="military-info" transition:fade>
            <div class="military-stats">
              <div class="military-stat">
                <div class="military-stat-label">Genel Bakış</div>
                <div class="military-stat-value">{selectedCountry.data.military.overview}</div>
              </div>
              <div class="military-stat">
                <div class="military-stat-label">Personel</div>
                <div class="military-stat-value">{selectedCountry.data.military.personnel}</div>
              </div>
              <div class="military-stat">
                <div class="military-stat-label">Ekipman</div>
                <div class="military-stat-value">{selectedCountry.data.military.equipment}</div>
              </div>
              <div class="military-stat">
                <div class="military-stat-label">Bütçe</div>
                <div class="military-stat-value">{selectedCountry.data.military.budget}</div>
              </div>
              <div class="military-stat">
                <div class="military-stat-label">Yetenekler</div>
                <div class="military-stat-value">{selectedCountry.data.military.capabilities}</div>
              </div>
            </div>
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
  /* Genel stil güncellemeleri */
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #f5f7fa;
  }
  :global(.leaflet-interactive) {
    outline: none !important;
  }
  /* Popup stil güncellemeleri */
  .popup {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 400px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-radius: 16px;
    overflow: hidden;
    z-index: 1000;
  }
  .popup-header {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: white;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .popup-header h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.5px;
  }
  .close-btn {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0 5px;
    transition: transform 0.2s ease;
  }
  .close-btn:hover {
    transform: scale(1.1);
  }
  /* Tab stil güncellemeleri */
  .tabs {
    display: flex;
    background: rgba(249, 250, 251, 0.8);
    padding: 15px 15px 0;
    border-bottom: 1px solid #dee2e6;
    gap: 8px;
  }
  .tab {
    padding: 10px 20px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 8px;
    font-size: 14px;
    color: #64748b;
    margin-right: 5px;
    transition: all 0.2s ease;
    font-weight: 500;
  }
  .tab:hover {
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
  }
  .tab.active {
    background: #6366f1;
    color: white;
  }
  /* İçerik stil güncellemeleri */
  .tab-content {
    background: white;
    padding: 20px;
  }
  .president-info {
    display: flex;
    gap: 15px;
  }
  .president-image {
    width: 120px;
    height: 150px;
    object-fit: cover;
    border-radius: 12px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
  }
  .president-image:hover {
    transform: scale(1.02);
  }
  .president-details {
    flex: 1;
  }
  .president-name {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #2c3e50;
  }
  .president-bio {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
  }
  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .info-item {
    background: rgba(249, 250, 251, 0.8);
    padding: 15px;
    border-radius: 12px;
    border-left: 4px solid #6366f1;
    transition: transform 0.2s ease;
  }
  .info-item:hover {
    transform: translateY(-2px);
  }
  .info-label {
    font-size: 12px;
    font-weight: 600;
    color: #666;
  }
  .info-value {
    font-size: 14px;
    color: #2c3e50;
    margin-top: 4px;
  }
  .military-stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .military-stat {
    background: rgba(249, 250, 251, 0.8);
    padding: 15px;
    border-radius: 12px;
    border: none;
    margin-bottom: 10px;
    transition: transform 0.2s ease;
  }
  .military-stat:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  .military-stat:hover {
    transform: translateX(4px);
  }
  .military-stat-label {
    font-size: 14px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 4px;
  }
  .military-stat-value {
    font-size: 13px;
    color: #666;
    line-height: 1.5;
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
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 1000;
  }
  .spinner {
    width: 30px;
    height: 30px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  /* Tooltip stil güncellemeleri */
  :global(.country-tooltip) {
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
    border: none;
    border-radius: 8px;
    color: white;
    font-size: 12px;
    padding: 6px 12px;
    font-weight: 500;
  }
  main {
    position: relative;
    width: 100%;
    height: 100vh;
  }
  .map {
    width: 100%;
    height: 100vh;
    z-index: 1;
  }
  @media (max-width: 768px) {
    .popup {
      width: 90%;
      top: auto;
      bottom: 0;
      right: 0;
      left: 0;
      border-radius: 16px 16px 0 0;
    }
    .info-grid {
      grid-template-columns: 1fr;
    }
    .president-info {
      flex-direction: column;
      align-items: center;
    }
    .president-image {
      width: 100px;
      height: 120px;
    }
    .alliance-box {
      width: 90%;
      left: 50%;
      transform: translateX(-50%);
      max-height: 50vh;
    }
  }

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

  .alliance-content {
    padding: 16px;
    max-height: 600px;
    overflow-y: auto;
  }

  .category-section {
    margin-bottom: 24px;
  }

  .category-section h3 {
    font-size: 14px;
    color: #868e96;
    margin: 0 0 12px 0;
    font-weight: 500;
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

  .theme-selector {
    position: absolute;
    top: 20px;
    left: 20px;
    display: flex;
    gap: 8px;
    z-index: 1000;
  }

  .theme-btn {
    padding: 8px 12px;
    border: none;
    background: #f1f3f5;
    color: #495057;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .theme-btn:hover {
    background: #e9ecef;
  }

  .theme-btn.active {
    background: #6366f1;
    color: white;
  }
</style>
