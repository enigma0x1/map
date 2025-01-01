<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import { fade, slide } from 'svelte/transition';
  import { countryInfo } from './lib/countryData';

  let map: L.Map;
  let mapElement: HTMLDivElement;
  let selectedCountry: { name: string; data: any } | null = null;
  let activeTab = 'president';
  let isLoading = false;
  let geoJsonLayer: L.GeoJSON | null = null;

  const getBaseStyle = () => ({
    fillColor: '#3498db',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.5
  });

  const getHighlightStyle = () => ({
    fillColor: '#2ecc71',
    weight: 2,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.7
  });

  const handleCountryClick = async (e: L.LeafletMouseEvent, countryName: string) => {
    isLoading = true;
    const info = countryInfo[countryName];
    if (info) {
      selectedCountry = { name: countryName, data: info };
      activeTab = 'president';
      await map.flyTo(e.latlng, 4, {
        duration: 1,
        easeLinearity: 0.25
      });
    }
    isLoading = false;
  };

  const handleMouseOver = (layer: L.Layer, countryName: string) => {
    if (selectedCountry?.name !== countryName) {
      layer.setStyle(getHighlightStyle());
      layer.bindTooltip(countryName, {
        permanent: false,
        direction: 'center'
      }).openTooltip();
    }
  };

  const handleMouseOut = (layer: L.Layer, countryName: string) => {
    if (selectedCountry?.name !== countryName) {
      layer.setStyle(getBaseStyle());
    }
    layer.closeTooltip();
  };

  onMount(async () => {
    const L = await import('leaflet');
    map = L.map(mapElement, {
      center: [20, 0],
      zoom: 2,
      minZoom: 2,
      maxZoom: 8
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '©OpenStreetMap, ©CartoDB'
    }).addTo(map);

    const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
    const data = await response.json();

    geoJsonLayer = L.geoJSON(data, {
      style: getBaseStyle,
      onEachFeature: (feature, layer) => {
        const countryName = feature.properties.name;
        layer.on('mouseover', () => handleMouseOver(layer, countryName));
        layer.on('mouseout', () => handleMouseOut(layer, countryName));
        layer.on('click', (e) => handleCountryClick(e, countryName));
      }
    }).addTo(map);
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
    if (geoJsonLayer) {
      geoJsonLayer.remove();
    }
  });
</script>

<main>
  <div class="map" bind:this={mapElement}></div>
  {#if selectedCountry}
    <div class="popup" transition:slide>
      <div class="popup-header">
        <h3>{selectedCountry.name}</h3>
        <button class="close-btn" on:click={() => selectedCountry = null}>×</button>
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
            >
            <div class="president-details">
              <div class="president-name">{selectedCountry.data.president.name}</div>
              <div class="president-bio">{selectedCountry.data.president.bio}</div>
            </div>
          </div>
        {:else if activeTab === 'general'}
          <div class="general-info" transition:fade>
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
        {:else}
          <div class="military-info" transition:fade>
            <div class="military-stat">
              <div class="military-stat-label">Genel Bakış</div>
              <div>{selectedCountry.data.military.overview}</div>
            </div>
            <div class="military-stat">
              <div class="military-stat-label">Personel</div>
              <div>{selectedCountry.data.military.personnel}</div>
            </div>
            <div class="military-stat">
              <div class="military-stat-label">Ekipman</div>
              <div>{selectedCountry.data.military.equipment}</div>
            </div>
            <div class="military-stat">
              <div class="military-stat-label">Bütçe</div>
              <div>{selectedCountry.data.military.budget}</div>
            </div>
            <div class="military-stat">
              <div class="military-stat-label">Yetenekler</div>
              <div>{selectedCountry.data.military.capabilities}</div>
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
  main {
    position: relative;
    width: 100%;
    height: 100vh;
  }
  .map {
    width: 100%;
    height: 100vh;
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
  .general-info {
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
  .military-info {
    font-size: 13px;
    color: #666;
    line-height: 1.5;
  }
  .military-stat {
    margin-bottom: 12px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eee;
  }
  .military-stat:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  .military-stat-label {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 4px;
  }
  .loader {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(255, 255, 255, 0.8);
    padding: 20px;
    border-radius: 10px;
    z-index: 1001;
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
</style>
