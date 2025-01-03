<script>
  import { onMount, onDestroy } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import { fade, slide } from 'svelte/transition';
  // Veri setlerini içe aktar
  import { categories, membershipData } from './lib/WorldOrganizations.svelte';
  import { countryInfo, comparisonCategories, getComparisonData } from './lib/countryData.js';
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
  let isSidebarOpen = false;
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
    },
    neofuturistic: {
      url: 'https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; CartoDB',
      options: {
        maxZoom: 18,
        tileSize: 512,
        zoomOffset: -1,
        className: 'neofuturistic-map-tiles'
      }
    }
  };
  const getBaseStyle = () => ({
    fillColor: currentTheme === 'neofuturistic' ? '#1a2333' : 'transparent',
    fillOpacity: currentTheme === 'neofuturistic' ? 0.3 : 0,
    color: currentTheme === 'neofuturistic' ? '#40dcff' : '#5C2E0E',
    opacity: currentTheme === 'neofuturistic' ? 0.4 : 0.6,
    weight: currentTheme === 'neofuturistic' ? 1 : 1.2,
    className: currentTheme === 'neofuturistic' ? 'neon-border' : ''
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
  const addCityLights = (map) => {
    const cities = [
      { name: "New York", coords: [40.7128, -74.0060], size: 8 },
      { name: "London", coords: [51.5074, -0.1278], size: 7 },
      { name: "Tokyo", coords: [35.6762, 139.6503], size: 8 },
      { name: "Paris", coords: [48.8566, 2.3522], size: 7 },
      { name: "Shanghai", coords: [31.2304, 121.4737], size: 8 },
      { name: "Dubai", coords: [25.2048, 55.2708], size: 6 },
      { name: "Singapore", coords: [1.3521, 103.8198], size: 6 },
      { name: "Hong Kong", coords: [22.3193, 114.1694], size: 7 },
      { name: "Moscow", coords: [55.7558, 37.6173], size: 7 },
      { name: "Istanbul", coords: [41.0082, 28.9784], size: 6 },
      // Daha fazla şehir ekleyebilirsiniz
    ];

    cities.forEach(city => {
      // Işık efekti
      L.circle(city.coords, {
        radius: 50000,
        className: 'city-glow',
        stroke: false,
        fillOpacity: 0.5
      }).addTo(map);

      // Merkez nokta
      L.circle(city.coords, {
        radius: 20000,
        className: 'city-center',
        stroke: false,
        fillOpacity: 0.8
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
        activeCategory = 'overview'; // Reset category when new country is selected
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
    
    // Başlangıç temasını ayarla
    L.tileLayer(themeOptions[currentTheme].url, themeOptions[currentTheme].options).addTo(map);
    
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
    if (currentTheme === 'neofuturistic') {
      addCityLights(map);
    }
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
    if (map) {
      // Mevcut tile layer'ı kaldır
      map.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          map.removeLayer(layer);
        }
      });
      // Yeni tema için tile layer ekle
      L.tileLayer(themeOptions[theme].url, themeOptions[theme].options).addTo(map);
      
      // Tema değişikliğine göre stil güncelleme
      document.body.className = theme;
      if (theme === 'neofuturistic') {
        addCityLights(map);
      } else {
        map.eachLayer(layer => {
          if (layer instanceof L.Circle) {
            map.removeLayer(layer);
          }
        });
      }
    }
  }
  const toggleSidebar = () => {
    isSidebarOpen = !isSidebarOpen;
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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;600&display=swap" rel="stylesheet">
</svelte:head>
<nav class="compact-nav">
  <div class="nav-left">
    <button class="menu-btn" on:click={toggleSidebar}>☰</button>
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
  {#if selectedCountry}
    <CountryPopup
      {selectedCountry}
      {closePopup}
      bind:activeCategory
    />
  {/if}
  {#if isLoading}
    <div class="loader" transition:fade>
      <div class="spinner"></div>
    </div>
  {/if}
  {#if isSidebarOpen}
    <div 
      class="sidebar-backdrop" 
      on:click={toggleSidebar} 
      on:keydown={(e) => e.key === 'Escape' && toggleSidebar()}
      role="button"
      tabindex="0"
      transition:fade={{duration: 200}}
    >
      <div 
        class="sidebar"
        role="dialog"
        aria-modal="true"
        transition:slide={{duration: 300, axis: 'x'}}
        on:click|stopPropagation
      >
        <div class="sidebar-header">
          <h2>Menu</h2>
          <button class="close-btn" on:click={toggleSidebar}>&times;</button>
        </div>
        <div class="sidebar-content">
          <div class="sidebar-section">
            <h3>Map Settings</h3>
            <button class="sidebar-btn" on:click={() => handleThemeChange('retro')}>
              Retro Theme
            </button>
            <button class="sidebar-btn" on:click={() => handleThemeChange('neofuturistic')}>
              Neo-Futuristic Theme
            </button>
            <button class="sidebar-btn" on:click={() => map.setZoom(2)}>
              Reset Zoom
            </button>
          </div>
          <div class="sidebar-section">
            <h3>Alliances</h3>
            {#each Object.entries(categories) as [key, category]}
              <div class="sidebar-category">
                <h4>{category.label}</h4>
                {#each category.alliances as alliance}
                  <button 
                    class="sidebar-alliance-btn"
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
        </div>
      </div>
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
  /* svelte-ignore unused-selector */
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
  .sidebar-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1001;
  }
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 300px;
    background: white;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
    padding: 20px;
    overflow-y: auto;
  }
  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
  .sidebar-header h2 {
    margin: 0;
    font-size: 20px;
    color: #333;
  }
  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
  }
  .close-btn:hover {
    background: #f5f5f5;
    color: #333;
  }
  .sidebar-section {
    margin-bottom: 24px;
  }
  .sidebar-section h3 {
    font-size: 16px;
    color: #666;
    margin: 0 0 12px 0;
  }
  .sidebar-btn {
    width: 100%;
    padding: 10px;
    margin-bottom: 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    font-size: 14px;
  }
  .sidebar-btn:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }
  .sidebar-category {
    margin-bottom: 16px;
  }
  .sidebar-category h4 {
    font-size: 14px;
    color: #666;
    margin: 0 0 8px 0;
  }
  .sidebar-alliance-btn {
    width: 100%;
    padding: 8px 12px;
    margin-bottom: 6px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    color: #333;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .sidebar-alliance-btn:hover {
    background: #f5f5f5;
    border-color: #ccc;
  }
  .sidebar-alliance-btn.active {
    background: #f0f0f0;
    border-color: #bbb;
    font-weight: 500;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    display: inline-block;
  }
  /* Neo-fütüristik tema için güncellenmiş stiller */
  :global(body.neofuturistic) {
    background: #0a0f18;
    color: #ffffff;
  }

  :global(body.neofuturistic) .compact-nav {
    background: rgba(10, 15, 24, 0.85);
    border-bottom: 1px solid rgba(64, 220, 255, 0.2);
    box-shadow: 0 2px 15px rgba(64, 220, 255, 0.15);
    backdrop-filter: blur(10px);
  }

  :global(body.neofuturistic) .compact-nav h1 {
    color: #fff;
    text-shadow: 0 0 10px rgba(64, 220, 255, 0.5);
  }

  :global(body.neofuturistic) .alliance-btn {
    background: rgba(10, 15, 24, 0.9);
    border: 1px solid rgba(64, 220, 255, 0.3);
    color: #40dcff;
    backdrop-filter: blur(5px);
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(64, 220, 255, 0.1);
    transition: all 0.3s ease;
  }

  :global(body.neofuturistic) .alliance-btn:hover {
    background: rgba(64, 220, 255, 0.15);
    border-color: #40dcff;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(64, 220, 255, 0.2);
  }

  :global(body.neofuturistic) .alliance-btn.active {
    background: rgba(64, 220, 255, 0.2);
    border-color: #40dcff;
    box-shadow: 0 0 20px rgba(64, 220, 255, 0.3), 
                inset 0 0 10px rgba(64, 220, 255, 0.2);
  }

  :global(body.neofuturistic) .country-highlight {
    filter: drop-shadow(0 0 15px rgba(64, 220, 255, 0.5));
  }

  :global(body.neofuturistic) .country-tooltip {
    background: rgba(10, 15, 24, 0.95) !important;
    border: 1px solid rgba(64, 220, 255, 0.3) !important;
    color: #40dcff !important;
    backdrop-filter: blur(5px);
    border-radius: 8px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
    padding: 8px 12px;
    font-weight: 500;
  }

  :global(body.neofuturistic) .continent-label {
    color: rgba(64, 220, 255, 0.8);
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 0 0 15px rgba(64, 220, 255, 0.4);
  }

  :global(body.neofuturistic) .sidebar {
    background: rgba(10, 15, 24, 0.95);
    border-right: 1px solid rgba(64, 220, 255, 0.2);
    box-shadow: 5px 0 20px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
  }

  :global(body.neofuturistic) .sidebar-btn {
    background: rgba(64, 220, 255, 0.1);
    border: 1px solid rgba(64, 220, 255, 0.3);
    color: #40dcff;
    border-radius: 8px;
    transition: all 0.3s ease;
  }

  :global(body.neofuturistic) .sidebar-btn:hover {
    background: rgba(64, 220, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(64, 220, 255, 0.2);
  }

  /* Özel scrollbar */
  :global(body.neofuturistic) ::-webkit-scrollbar {
    width: 8px;
  }

  :global(body.neofuturistic) ::-webkit-scrollbar-track {
    background: rgba(10, 15, 24, 0.9);
  }

  :global(body.neofuturistic) ::-webkit-scrollbar-thumb {
    background: rgba(64, 220, 255, 0.3);
    border-radius: 4px;
  }

  :global(body.neofuturistic) ::-webkit-scrollbar-thumb:hover {
    background: rgba(64, 220, 255, 0.5);
  }

  /* Loader animasyonu */
  :global(body.neofuturistic) .loader {
    background: rgba(10, 15, 24, 0.9);
    border: 1px solid rgba(64, 220, 255, 0.3);
    box-shadow: 0 0 30px rgba(64, 220, 255, 0.2);
  }

  :global(body.neofuturistic) .spinner {
    border: 3px solid rgba(64, 220, 255, 0.1);
    border-top: 3px solid #40dcff;
    box-shadow: 0 0 20px rgba(64, 220, 255, 0.3);
  }
  /* Neo-fütüristik gece efektleri */
  :global(body.neofuturistic) .city-glow {
    fill: rgba(64, 220, 255, 0.15);
    filter: blur(10px);
    animation: pulse 4s ease-in-out infinite;
  }

  :global(body.neofuturistic) .city-center {
    fill: rgba(64, 220, 255, 0.8);
    filter: blur(2px);
    animation: flicker 2s ease-in-out infinite;
  }

  /* Atmosfer efekti */
  :global(body.neofuturistic) .map::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
      circle at 50% 50%,
      rgba(64, 220, 255, 0.05) 0%,
      rgba(10, 15, 24, 0.2) 100%
    );
    pointer-events: none;
    z-index: 2;
  }

  /* Aurora efekti */
  :global(body.neofuturistic) .map::
