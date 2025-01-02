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
  const DOUBLE_CLICK_THRESHOLD = 300;

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
    color: '#2c3e50',  // Koyu gri-mavi tonu
    opacity: 0.6,      // Orta seviye opaklık
    weight: 1.2        // Biraz daha kalın sınır
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

<main>
  <div class="map" bind:this={mapElement}></div>

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
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  }

  :global(.leaflet-interactive) {
    outline: none !important;
  }

  :global(.country-tooltip) {
    background: rgba(0, 0, 0, 0.8);
    border: none;
    border-radius: 4px;
    color: white;
    font-size: 12px;
    padding: 4px 8px;
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

  .popup {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 400px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    overflow: hidden;
    z-index: 1000;
  }

  .popup-header {
    background: linear-gradient(135deg, #3498db, #2ecc71);
    color: white;
    padding: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .popup-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
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

  .tabs {
    display: flex;
    background: #f8f9fa;
    padding: 10px 10px 0;
    border-bottom: 1px solid #dee2e6;
  }

  .tab {
    padding: 8px 15px;
    border: none;
    background: none;
    cursor: pointer;
    border-radius: 6px 6px 0 0;
    font-size: 14px;
    color: #666;
    margin-right: 5px;
    transition: all 0.3s ease;
  }

  .tab:hover {
    background: #e9ecef;
  }

  .tab.active {
    background: #3498db;
    color: white;
  }

  .tab-content {
    background: white;
    padding: 15px;
  }

  .president-info {
    display: flex;
    gap: 15px;
  }

  .president-image {
    width: 120px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
    background: #f8f9fa;
    padding: 10px;
    border-radius: 6px;
    border-left: 3px solid #3498db;
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
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
  }

  .military-stat:last-child {
    border-bottom: none;
    padding-bottom: 0;
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

  .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    z-index: 1000;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .popup {
      width: 90%;
      top: auto;
      bottom: 20px;
      right: 5%;
      left: 5%;
    }

    .info-grid {
      grid-template-columns: 1fr;
    }

    .president-info {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .president-image {
      width: 100px;
      height: 130px;
    }
  }
</style>
