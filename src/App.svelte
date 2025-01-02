<script>
  import { onMount, onDestroy } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import { fade } from 'svelte/transition';

  // Veri setlerini içe aktar
  import { categories, membershipData, countryInfo } from './data.js';
  import CountryPopup from './components/CountryPopup.svelte';

  // Değişkenler
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
  let activeCategory = 'overview';
  const DOUBLE_CLICK_THRESHOLD = 300;
  let isAnimating = false;

  // Harita seçenekleri ve stilleri
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
    fillColor: 'transparent',
    weight: 2,
    opacity: 1,
    color: '#FFF8EB',
    fillOpacity: 0,
    className: 'country-pop'
  });

  const addContinentLabels = (map) => {
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

  // Ana fonksiyonlar
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
    L.tileLayer(themeOptions.retro.url, {
      maxZoom: 18,
      attribution: themeOptions.retro.attribution,
      className: themeOptions.retro.options.className
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
    addContinentLabels(map);
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

<nav class="compact-nav">
  <div class="nav-left">
    <button class="menu-btn">☰</button>
    <h1>World Map</h1>
  </div>
  <div class="nav-center">
    {#each Object.entries(categories) as [key, category]}
      <div class="alliance-group">
        {#each category.alliances as alliance}
          <button
            class="alliance-btn"
            class:active={activeAlliance === alliance.id}
            on:click={() => handleAllianceClick(alliance)}
          >
            <span class="dot" style="background: {alliance.color}"></span>
            {alliance.name}
          </button>
        {/each}
      </div>
    {/each}
  </div>
</nav>

<main>
  <div class="map" bind:this={mapElement}></div>
  <CountryPopup
    {selectedCountry}
    closePopup={closePopup}
  />
  {#if isLoading}
    <div class="loader" transition:fade>
      <div class="spinner"></div>
    </div>
  {/if}
</main>

<style>
  /* Genel Retro Stili */
  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #FAFAFA;
  }
  /* Retro Navigation */
  .compact-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(139, 69, 19, 0.2);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }
  .nav-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .menu-btn {
    font-size: 20px;
    background: none;
    border: none;
    cursor: pointer;
  }
  .compact-nav h1 {
    font-size: 18px;
    margin: 0;
  }
  .nav-center {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .alliance-group {
    display: flex;
    gap: 8px;
  }
  .alliance-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid rgba(139, 69, 19, 0.3);
    background: white;
    color: #8B4513;
    font-family: 'Inter', sans-serif;
    font-weight: 500;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  .alliance-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  }
  .alliance-btn.active {
    background: #8B4513;
    color: #FFF8EB;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
    transform: translateY(1px);
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  main {
    position: relative;
    width: 100%;
    height: 100vh;
  }
  .map {
    width: 100%;
    height: 100vh;
    padding-top: 40px;
    z-index: 1;
  }
  /* Loader stil güncellemeleri */
  .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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
  /* Sınır çizgisini pop-up şeklinde büyütmek için transform animasyonu */
  .country-pop {
    /* Animasyonun adı ve süresi */
    animation: pop-scale 0.5s ease-in-out forwards;
    /* transform-box ve transform-origin ayarları,
       SVG path'i kendi merkezinden ölçeklemeye yarar. */
    transform-box: fill-box;
    transform-origin: center;
  }
  /* Keyframes: 0% -> normal, 50% -> yaklaşık %10 büyüt, 100% -> normale dön */
  @keyframes pop-scale {
    0% {
      transform: scale(1);
      stroke-width: 2; /* İlk anda stroke kalınlığı */
    }
    50% {
      transform: scale(1.1);
      stroke-width: 3; /* Tepede biraz daha kalın görünebilir */
    }
    100% {
      transform: scale(1);
      stroke-width: 2;
    }
  }
</style>
