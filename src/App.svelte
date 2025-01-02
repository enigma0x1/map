<script>
  import { onMount, onDestroy } from 'svelte';
  import 'leaflet/dist/leaflet.css';
  import { fade, slide } from 'svelte/transition';
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
    fillColor: 'transparent',
    weight: 2,
    opacity: 1,
    color: '#FFF8EB',
    fillOpacity: 0,
    className: 'country-pop'
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
  const countryInfo = {
    "Turkey": {
      code: "TR",
      general: {
        capital: "Ankara",
        population: "84.3 million",
        region: "Eurasia",
        language: "Turkish",
        currency: "Turkish Lira (TRY)"
      },
      leader: {
        name: "Recep Tayyip Erdoğan",
        title: "President",
        image: "/assets/leaders/erdogan.jpg"
      },
      flag: "/assets/flags/turkey.png",
      economy: {
        gdp: "$905 billion",
        gdpRank: "17th globally",
        gdpGrowth: "5.2%",
        majorSectors: [
          "Services",
          "Industry",
          "Agriculture"
        ]
      },
      military: {
        rank: "11th globally",
        personnel: {
          active: "355,200",
          reserve: "378,700"
        },
        equipment: {
          tanks: "3,022",
          aircraft: "1,067",
          navalAssets: "156"
        },
        budget: "$15.5 billion"
      },
      alliances: ["NATO", "G20"],
      keyStats: {
        literacy: "96.7%",
        lifeExpectancy: "77.7 years",
        urbanPopulation: "76.1%"
      },
      demographics: {
        ageStructure: {
          under15: "23.1%",
          age15to64: "67.8%",
          over65: "9.1%"
        },
        urbanization: "76.1%",
        literacyRate: "96.7%",
        languages: ["Turkish", "Kurdish", "Arabic"],
        ethnicGroups: ["Turkish", "Kurdish", "Other"],
        religions: {
          muslim: "99%",
          other: "1%"
        }
      },
      geography: {
        area: "783,562 km²",
        coastline: "7,200 km",
        climate: "Mediterranean",
        terrain: ["Mountains", "Plateaus", "Coastal plains"],
        naturalResources: ["Coal", "Chromium", "Mercury"],
        environmentalIssues: ["Air pollution", "Water pollution"]
      },
      infrastructure: {
        airports: 98,
        railways: "12,710 km",
        roadways: "67,333 km",
        ports: ["Istanbul", "Izmir", "Mersin"],
        internetUsers: "65.1 million"
      },
      education: {
        universities: 207,
        studentPopulation: "8.2 million",
        researchOutput: "Annual publications: 50,000+"
      },
      tourism: {
        annualVisitors: "51.2 million",
        topDestinations: ["Istanbul", "Antalya", "Cappadocia"],
        tourismRevenue: "$34.5 billion"
      },
      trade: {
        mainExports: ["Vehicles", "Machinery", "Electronics"],
        mainImports: ["Oil", "Gas", "Industrial machinery"],
        tradingPartners: ["EU", "Russia", "China", "USA"]
      },
      innovation: {
        patents: "Annual filings: 8,000+",
        startupEcosystem: "Value: $4 billion",
        rAndDSpending: "1.1% of GDP"
      }
    },
    "United States of America": {
      code: "US",
      general: {
        capital: "Washington, D.C.",
        population: "331 million",
        region: "North America",
        language: "English",
        currency: "US Dollar (USD)"
      },
      leader: {
        name: "Joe Biden",
        title: "President",
        image: "/assets/leaders/biden.jpg"
      },
      flag: "/assets/flags/usa.png",
      economy: {
        gdp: "$21.4 trillion",
        gdpRank: "1st globally",
        gdpGrowth: "2.3%",
        majorSectors: [
          "Services",
          "Manufacturing",
          "Technology"
        ]
      },
      military: {
        rank: "1st globally",
        personnel: {
          active: "1.4 million",
          reserve: "800,000"
        },
        equipment: {
          tanks: "6,287",
          aircraft: "13,247",
          navalAssets: "490"
        },
        budget: "$732 billion"
      },
      alliances: ["NATO", "G7", "G20"],
      keyStats: {
        literacy: "99%",
        lifeExpectancy: "78.8 years",
        urbanPopulation: "82.7%"
      },
      demographics: {
        ageStructure: {
          under15: "18.9%",
          age15to64: "65.9%",
          over65: "15.2%"
        },
        urbanization: "82.7%",
        literacyRate: "99%",
        languages: ["English", "Spanish"],
        ethnicGroups: ["White", "Black", "Hispanic", "Asian"],
        religions: {
          protestant: "46.5%",
          catholic: "20.8%",
          jewish: "1.9%",
          muslim: "0.9%",
          other: "29.9%"
        }
      },
      geography: {
        area: "9,833,520 km²",
        coastline: "19,924 km",
        climate: "Diverse",
        terrain: ["Mountains", "Plains", "Deserts"],
        naturalResources: ["Coal", "Oil", "Natural gas"],
        environmentalIssues: ["Air pollution", "Water pollution"]
      },
      infrastructure: {
        airports: 19633,
        railways: "224,000 km",
        roadways: "6,853,000 km",
        ports: ["New York", "Los Angeles", "Houston"],
        internetUsers: "313 million"
      },
      education: {
        universities: 4298,
        studentPopulation: "19.7 million",
        researchOutput: "Annual publications: 1.2 million+"
      },
      tourism: {
        annualVisitors: "79.6 million",
        topDestinations: ["New York City", "Los Angeles", "Orlando"],
        tourismRevenue: "$214 billion"
      },
      trade: {
        mainExports: ["Aircraft", "Vehicles", "Machinery"],
        mainImports: ["Oil", "Vehicles", "Electronics"],
        tradingPartners: ["Canada", "Mexico", "China", "Japan"]
      },
      innovation: {
        patents: "Annual filings: 350,000+",
        startupEcosystem: "Value: $1.5 trillion",
        rAndDSpending: "3.4% of GDP"
      }
    }
  };
  function InfoCard({ icon, title, value, trend }) {
    return (
      <div class="info-card">
        <div class="card-icon">{icon}</div>
        <div class="card-details">
          <span class="card-title">{title}</span>
          <span class="card-value">{value}</span>
          {#if trend}
            <span class="card-trend">{trend}</span>
          {/if}
        </div>
      </div>
    );
  }
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
  {#if selectedCountry}
    <div class="modern-popup" 
         transition:slide={{duration: 400, axis: 'x'}} 
         style="transform-origin: left">
      <!-- Ana Bilgi Kartı -->
      <div class="main-info-card">
        <div class="flag-container">
          <img src={selectedCountry.data.flag} alt={`${selectedCountry.name} flag`} />
        </div>
        <div class="country-meta">
          <h1>{selectedCountry.name}</h1>
          <div class="alliance-tags">
            {#each selectedCountry.data.alliances as alliance}
              <span class="tag">{alliance}</span>
            {/each}
          </div>
        </div>
      </div>
      <!-- Kategori Seçici -->
      <div class="category-selector">
        <button class:active={activeCategory === 'overview'} on:click={() => activeCategory = 'overview'}>Overview</button>
        <button class:active={activeCategory === 'demographics'} on:click={() => activeCategory = 'demographics'}>Demographics</button>
        <button class:active={activeCategory === 'economy'} on:click={() => activeCategory = 'economy'}>Economy</button>
        <button class:active={activeCategory === 'military'} on:click={() => activeCategory = 'military'}>Military</button>
        <button class:active={activeCategory === 'geography'} on:click={() => activeCategory = 'geography'}>Geography</button>
        <button class:active={activeCategory === 'innovation'} on:click={() => activeCategory = 'innovation'}>Innovation</button>
      </div>
      <!-- Dinamik İçerik Alanı -->
      <div class="content-area">
        {#if activeCategory === 'overview'}
          <div class="overview-grid">
            <!-- Temel İstatistikler -->
            <InfoCard
              icon="👥"
              title="Population"
              value={selectedCountry.data.general.population}
              trend="+1.2% annual"
            />
            <InfoCard
              icon="🏛️"
              title="Capital"
              value={selectedCountry.data.general.capital}
            />
            <InfoCard
              icon="💰"
              title="GDP"
              value={selectedCountry.data.economy.gdp}
            />
            <InfoCard
              icon="🌍"
              title="Region"
              value={selectedCountry.data.general.region}
            />
            <InfoCard
              icon="🗣️"
              title="Language"
              value={selectedCountry.data.general.language}
            />
            <InfoCard
              icon="🪙"
              title="Currency"
              value={selectedCountry.data.general.currency}
            />
          </div>
        {:else if activeCategory === 'demographics'}
          <div class="demographics-content">
            <InfoCard
              icon="👶"
              title="Under 15"
              value={selectedCountry.data.demographics.ageStructure.under15}
            />
            <InfoCard
              icon="🧑‍🤝‍🧑"
              title="15-64"
              value={selectedCountry.data.demographics.ageStructure.age15to64}
            />
            <InfoCard
              icon="👴"
              title="Over 65"
              value={selectedCountry.data.demographics.ageStructure.over65}
            />
            <InfoCard
              icon="🏙️"
              title="Urbanization"
              value={selectedCountry.data.demographics.urbanization}
            />
            <InfoCard
              icon="📚"
              title="Literacy Rate"
              value={selectedCountry.data.demographics.literacyRate}
            />
            <InfoCard
              icon="🗣️"
              title="Languages"
              value={selectedCountry.data.demographics.languages.join(', ')}
            />
            <InfoCard
              icon="👥"
              title="Ethnic Groups"
              value={selectedCountry.data.demographics.ethnicGroups.join(', ')}
            />
            <InfoCard
              icon="🙏"
              title="Religions"
              value={Object.entries(selectedCountry.data.demographics.religions).map(([key, value]) => `${key}: ${value}`).join(', ')}
            />
          </div>
        {:else if activeCategory === 'economy'}
          <div class="economy-content">
            <InfoCard
              icon="💰"
              title="GDP"
              value={selectedCountry.data.economy.gdp}
            />
            <InfoCard
              icon="📈"
              title="GDP Rank"
              value={selectedCountry.data.economy.gdpRank}
            />
            <InfoCard
              icon="📊"
              title="GDP Growth"
              value={selectedCountry.data.economy.gdpGrowth}
            />
            <InfoCard
              icon="🏭"
              title="Major Sectors"
              value={selectedCountry.data.economy.majorSectors.join(', ')}
            />
            <InfoCard
              icon="🤝"
              title="Trading Partners"
              value={selectedCountry.data.trade.tradingPartners.join(', ')}
            />
            <InfoCard
              icon="🚢"
              title="Main Exports"
              value={selectedCountry.data.trade.mainExports.join(', ')}
            />
            <InfoCard
              icon="🛢️"
              title="Main Imports"
              value={selectedCountry.data.trade.mainImports.join(', ')}
            />
          </div>
        {:else if activeCategory === 'military'}
          <div class="military-content">
            <InfoCard
              icon="🎖️"
              title="Military Rank"
              value={selectedCountry.data.military.rank}
            />
            <InfoCard
              icon="🪖"
              title="Active Personnel"
              value={selectedCountry.data.military.personnel.active}
            />
            <InfoCard
              icon="🛡️"
              title="Reserve Personnel"
              value={selectedCountry.data.military.personnel.reserve}
            />
            <InfoCard
              icon="🛩️"
              title="Aircraft"
              value={selectedCountry.data.military.equipment.aircraft}
            />
            <InfoCard
              icon="🚢"
              title="Naval Assets"
              value={selectedCountry.data.military.equipment.navalAssets}
            />
            <InfoCard
              icon="💰"
              title="Military Budget"
              value={selectedCountry.data.military.budget}
            />
          </div>
        {:else if activeCategory === 'geography'}
          <div class="geography-content">
            <InfoCard
              icon="🗺️"
              title="Area"
              value={selectedCountry.data.geography.area}
            />
            <InfoCard
              icon="🌊"
              title="Coastline"
              value={selectedCountry.data.geography.coastline}
            />
            <InfoCard
              icon="🌡️"
              title="Climate"
              value={selectedCountry.data.geography.climate}
            />
            <InfoCard
              icon="⛰️"
              title="Terrain"
              value={selectedCountry.data.geography.terrain.join(', ')}
            />
            <InfoCard
              icon="⛏️"
              title="Natural Resources"
              value={selectedCountry.data.geography.naturalResources.join(', ')}
            />
            <InfoCard
              icon="⚠️"
              title="Environmental Issues"
              value={selectedCountry.data.geography.environmentalIssues.join(', ')}
            />
          </div>
        {:else if activeCategory === 'innovation'}
          <div class="innovation-content">
            <InfoCard
              icon="💡"
              title="Patents"
              value={selectedCountry.data.innovation.patents}
            />
            <InfoCard
              icon="🚀"
              title="Startup Ecosystem"
              value={selectedCountry.data.innovation.startupEcosystem}
            />
            <InfoCard
              icon="🔬"
              title="R&D Spending"
              value={selectedCountry.data.innovation.rAndDSpending}
            />
            <InfoCard
              icon="🎓"
              title="Universities"
              value={selectedCountry.data.education.universities}
            />
            <InfoCard
              icon="🧑‍🎓"
              title="Student Population"
              value={selectedCountry.data.education.studentPopulation}
            />
            <InfoCard
              icon="📰"
              title="Research Output"
              value={selectedCountry.data.education.researchOutput}
            />
          </div>
        {/if}
      </div>
      <!-- Alt Bilgi Şeridi -->
      <div class="bottom-strip">
        <div class="quick-facts">
          <span>Time Zone: GMT+3</span>
          <span>Currency: TRY</span>
          <span>Calling Code: +90</span>
        </div>
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
  /* Modern Popup */
  .modern-popup {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 450px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
  }
  .main-info-card {
    padding: 24px;
    background: linear-gradient(135deg, #1a237e, #0d47a1);
    color: white;
  }
  .flag-container {
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 12px;
    margin-bottom: 20px;
  }
  .flag-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .country-meta h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  .alliance-tags {
    display: flex;
    gap: 8px;
    margin-top: 8px;
  }
  .tag {
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  .category-selector {
    display: flex;
    overflow-x: auto;
    padding: 12px;
    gap: 8px;
    background: #f5f5f5;
  }
  .category-selector button {
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    background: white;
    color: #333;
    font-weight: 500;
    white-space: nowrap;
    transition: all 0.3s ease;
  }
  .category-selector button.active {
    background: #1a237e;
    color: white;
  }
  .content-area {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
  }
  .overview-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  .bottom-strip {
    padding: 12px 24px;
    background: #f5f5f5;
    font-size: 12px;
  }
  .quick-facts {
    display: flex;
    justify-content: space-between;
    color: #666;
  }
  /* Animasyon için */
  @keyframes slideIn {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  .modern-popup {
    animation: slideIn 0.4s ease-out;
  }
  /* InfoCard Stilleri */
  .info-card {
    background: #fff;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }
  .card-icon {
    font-size: 24px;
    color: #1a237e;
  }
  .card-details {
    display: flex;
    flex-direction: column;
  }
  .card-title {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }
  .card-value {
    font-size: 16px;
    font-weight: 600;
    color: #1a237e;
  }
  .card-trend {
    font-size: 12px;
    color: #666;
  }
  /* Kıta isimleri için özel stil */
  :global(.continent-label) {
    font-family: 'Inter', sans-serif;
    color: rgba(139, 69, 19, 0.7);
    font-size: 24px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 2px;
    text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
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
