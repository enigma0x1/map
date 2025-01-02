<script>
  import { onMount } from 'svelte';
  import Chart from 'chart.js/auto';
  import { getComparisonData, countryInfo } from '../lib/countryData.js';

  export let selectedCountry;
  export let closePopup;
  export let activeCategory = 'overview';
  
  // Karşılaştırma modu için state'ler
  let compareMode = false;
  let comparedCountry = null;
  let comparisonCategory = 'economy';
  let chart = null;
  let timelineChart = null;

  // DOM elementleri için referanslar
  let chartCanvas;
  let timelineCanvas;

  // Grafik renkleri
  const chartColors = {
    primary: 'rgba(26, 35, 126, 0.7)',
    secondary: 'rgba(13, 71, 161, 0.7)',
    border: {
      primary: 'rgb(26, 35, 126)',
      secondary: 'rgb(13, 71, 161)'
    }
  };

  // Ekonomik trend grafiğini oluştur
  function createEconomicTrendChart() {
    if (chart) chart.destroy();
    
    const ctx = chartCanvas.getContext('2d');
    const data = selectedCountry.data.economicData.gdpTrend;

    chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.year),
        datasets: [
          {
            label: 'GSYİH (Milyar $)',
            data: data.map(d => d.gdp),
            borderColor: chartColors.border.primary,
            backgroundColor: chartColors.primary,
            yAxisID: 'y'
          },
          {
            label: 'Büyüme (%)',
            data: data.map(d => d.growth),
            borderColor: chartColors.border.secondary,
            backgroundColor: chartColors.secondary,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'GSYİH (Milyar $)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Büyüme (%)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  }

  // Zaman çizelgesi grafiğini oluştur
  function createTimelineChart() {
    if (timelineChart) timelineChart.destroy();

    const ctx = timelineCanvas.getContext('2d');
    const timeline = selectedCountry.data.timeline;
    const categories = ['political', 'economic', 'military', 'social'];
    
    const datasets = categories.map((category, index) => ({
      label: category.charAt(0).toUpperCase() + category.slice(1),
      data: timeline
        .filter(event => event.category === category)
        .map(event => ({
          x: event.year,
          y: index,
          event: event.event,
          description: event.description
        })),
      pointStyle: 'circle',
      pointRadius: 8,
      pointHoverRadius: 12
    }));

    timelineChart = new Chart(ctx, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return categories[value]?.charAt(0).toUpperCase() + categories[value]?.slice(1);
              }
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const point = context.raw;
                return `${point.event}: ${point.description}`;
              }
            }
          }
        }
      }
    });
  }

  // Karşılaştırma grafiğini oluştur
  function createComparisonChart() {
    if (!comparedCountry) return;
    
    if (chart) chart.destroy();
    
    const compData = getComparisonData(
      selectedCountry.name,
      comparedCountry.name,
      comparisonCategory
    );

    if (!compData) return;

    const ctx = chartCanvas.getContext('2d');
    chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: compData.labels,
        datasets: compData.datasets.map((dataset, index) => ({
          ...dataset,
          backgroundColor: index === 0 ? chartColors.primary : chartColors.secondary,
          borderColor: index === 0 ? chartColors.border.primary : chartColors.border.secondary,
          borderWidth: 1
        }))
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Karşılaştırma modunu aç/kapa
  function toggleCompareMode() {
    compareMode = !compareMode;
    if (!compareMode) {
      comparedCountry = null;
      createEconomicTrendChart();
    }
  }

  // Karşılaştırılacak ülkeyi seç
  function selectComparedCountry(country) {
    comparedCountry = country;
    createComparisonChart();
  }

  // Karşılaştırma kategorisini değiştir
  function changeComparisonCategory(category) {
    comparisonCategory = category;
    if (comparedCountry) {
      createComparisonChart();
    }
  }

  onMount(() => {
    createEconomicTrendChart();
    createTimelineChart();
  });
</script>

{#if selectedCountry}
  <div class="modern-popup">
    <div class="popup-header">
      <button class="close-button" on:click={closePopup}>×</button>
      <button class="compare-button" on:click={toggleCompareMode}>
        {compareMode ? 'Karşılaştırmayı Kapat' : 'Ülke Karşılaştır'}
      </button>
    </div>
    
    <!-- Ana Bilgi Kartı -->
    <div class="main-info-card">
      <div class="country-header">
        <div class="flag-container">
          <img src={selectedCountry.data.flag} alt={`${selectedCountry.name} flag`} />
        </div>
        <h1>{selectedCountry.name}</h1>
      </div>
      
      <!-- President Section -->
      <div class="president-section">
        <div class="president-image">
          <img src={selectedCountry.data.president.image} alt={selectedCountry.data.president.name} />
        </div>
        <div class="president-info">
          <h2>{selectedCountry.data.president.name}</h2>
          <p>{selectedCountry.data.president.bio}</p>
        </div>
      </div>

      <div class="alliance-tags">
        {#each selectedCountry.data.alliances as alliance}
          <span class="tag">{alliance}</span>
        {/each}
      </div>
    </div>

    <!-- Karşılaştırma Modu -->
    {#if compareMode}
      <div class="comparison-controls">
        <select bind:value={comparisonCategory}>
          <option value="economy">Ekonomi</option>
          <option value="military">Askeri</option>
          <option value="demographics">Demografi</option>
          <option value="geography">Coğrafya</option>
        </select>
        
        <select bind:value={comparedCountry}>
          <option value={null}>Ülke Seçin</option>
          {#each Object.entries(countryInfo) as [name, data]}
            {#if name !== selectedCountry.name}
              <option value={{ name, data }}>{name}</option>
            {/if}
          {/each}
        </select>
      </div>
    {/if}

    <!-- Kategori Seçici -->
    <div class="category-selector">
      <button class:active={activeCategory === 'overview'} on:click={() => activeCategory = 'overview'}>
        Genel Bakış
      </button>
      <button class:active={activeCategory === 'timeline'} on:click={() => activeCategory = 'timeline'}>
        Zaman Çizelgesi
      </button>
      <button class:active={activeCategory === 'demographics'} on:click={() => activeCategory = 'demographics'}>
        Demografi
      </button>
      <button class:active={activeCategory === 'economy'} on:click={() => activeCategory = 'economy'}>
        Ekonomi
      </button>
      <button class:active={activeCategory === 'military'} on:click={() => activeCategory = 'military'}>
        Askeri
      </button>
      <button class:active={activeCategory === 'geography'} on:click={() => activeCategory = 'geography'}>
        Coğrafya
      </button>
    </div>

    <!-- Dinamik İçerik Alanı -->
    <div class="content-area">
      {#if activeCategory === 'overview'}
        <div class="info-grid">
          <div class="info-card">
            <div class="card-icon">👥</div>
            <div class="card-details">
              <span class="card-title">Nüfus</span>
              <span class="card-value">{selectedCountry.data.general.population}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🏛️</div>
            <div class="card-details">
              <span class="card-title">Başkent</span>
              <span class="card-value">{selectedCountry.data.general.capital}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🌍</div>
            <div class="card-details">
              <span class="card-title">Bölge</span>
              <span class="card-value">{selectedCountry.data.general.region}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🗣️</div>
            <div class="card-details">
              <span class="card-title">Dil</span>
              <span class="card-value">{selectedCountry.data.general.language}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">💰</div>
            <div class="card-details">
              <span class="card-title">Para Birimi</span>
              <span class="card-value">{selectedCountry.data.general.currency}</span>
            </div>
          </div>
        </div>

      {:else if activeCategory === 'timeline'}
        <div class="timeline-container">
          <canvas bind:this={timelineCanvas}></canvas>
          <div class="timeline-legend">
            <div class="legend-item">
              <span class="dot political"></span>
              <span>Siyasi</span>
            </div>
            <div class="legend-item">
              <span class="dot economic"></span>
              <span>Ekonomik</span>
            </div>
            <div class="legend-item">
              <span class="dot military"></span>
              <span>Askeri</span>
            </div>
            <div class="legend-item">
              <span class="dot social"></span>
              <span>Sosyal</span>
            </div>
          </div>
        </div>

      {:else if activeCategory === 'economy'}
        <div class="chart-container">
          <canvas bind:this={chartCanvas}></canvas>
        </div>
        <div class="economic-indicators">
          <h3>Temel Ekonomik Göstergeler</h3>
          <div class="indicators-grid">
            <div class="indicator-card">
              <span class="indicator-label">İhracat</span>
              <span class="indicator-value">{selectedCountry.data.economicData.keyIndicators.exportValue}</span>
            </div>
            <div class="indicator-card">
              <span class="indicator-label">İthalat</span>
              <span class="indicator-value">{selectedCountry.data.economicData.keyIndicators.importValue}</span>
            </div>
            <div class="indicator-card">
              <span class="indicator-label">Yabancı Yatırım</span>
              <span class="indicator-value">{selectedCountry.data.economicData.keyIndicators.foreignInvestment}</span>
            </div>
            <div class="indicator-card">
              <span class="indicator-label">İşsizlik</span>
              <span class="indicator-value">{selectedCountry.data.economicData.keyIndicators.unemployment}</span>
            </div>
          </div>
        </div>

      {:else if activeCategory === 'demographics'}
        <div class="info-grid">
          <div class="info-card">
            <div class="card-icon">👶</div>
            <div class="card-details">
              <span class="card-title">15 Yaş Altı</span>
              <span class="card-value">{selectedCountry.data.demographics.ageStructure.under15}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">👨</div>
            <div class="card-details">
              <span class="card-title">15-64 Yaş</span>
              <span class="card-value">{selectedCountry.data.demographics.ageStructure.age15to64}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">👴</div>
            <div class="card-details">
              <span class="card-title">65 Yaş Üstü</span>
              <span class="card-value">{selectedCountry.data.demographics.ageStructure.over65}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🏙️</div>
            <div class="card-details">
              <span class="card-title">Şehirleşme</span>
              <span class="card-value">{selectedCountry.data.demographics.urbanization}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📚</div>
            <div class="card-details">
              <span class="card-title">Okur Yazarlık</span>
              <span class="card-value">{selectedCountry.data.demographics.literacyRate}</span>
            </div>
          </div>
          <div class="info-card full-width">
            <div class="card-icon">🗣️</div>
            <div class="card-details">
              <span class="card-title">Diller</span>
              <span class="card-value">{selectedCountry.data.demographics.languages.join(', ')}</span>
            </div>
          </div>
          <div class="info-card full-width">
            <div class="card-icon">👥</div>
            <div class="card-details">
              <span class="card-title">Etnik Gruplar</span>
              <span class="card-value">{selectedCountry.data.demographics.ethnicGroups.join(', ')}</span>
            </div>
          </div>
        </div>

      {:else if activeCategory === 'military'}
        <div class="info-grid">
          <div class="info-card full-width">
            <div class="card-icon">⚔️</div>
            <div class="card-details">
              <span class="card-title">Genel Bakış</span>
              <span class="card-value">{selectedCountry.data.military.overview}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🎖️</div>
            <div class="card-details">
              <span class="card-title">Dünya Sıralaması</span>
              <span class="card-value">{selectedCountry.data.military.rank}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">👥</div>
            <div class="card-details">
              <span class="card-title">Aktif Personel</span>
              <span class="card-value">{selectedCountry.data.military.personnel.active}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🪖</div>
            <div class="card-details">
              <span class="card-title">Yedek Personel</span>
              <span class="card-value">{selectedCountry.data.military.personnel.reserve}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">✈️</div>
            <div class="card-details">
              <span class="card-title">Hava Araçları</span>
              <span class="card-value">{selectedCountry.data.military.equipment.aircraft}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🚢</div>
            <div class="card-details">
              <span class="card-title">Deniz Araçları</span>
              <span class="card-value">{selectedCountry.data.military.equipment.navalAssets}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">💰</div>
            <div class="card-details">
              <span class="card-title">Savunma Bütçesi</span>
              <span class="card-value">{selectedCountry.data.military.budget}</span>
            </div>
          </div>
        </div>

      {:else if activeCategory === 'geography'}
        <div class="info-grid">
          <div class="info-card">
            <div class="card-icon">📏</div>
            <div class="card-details">
              <span class="card-title">Yüzölçümü</span>
              <span class="card-value">{selectedCountry.data.geography.area}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🌊</div>
            <div class="card-details">
              <span class="card-title">Sahil Şeridi</span>
              <span class="card-value">{selectedCountry.data.geography.coastline}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🌡️</div>
            <div class="card-details">
              <span class="card-title">İklim</span>
              <span class="card-value">{selectedCountry.data.geography.climate}</span>
            </div>
          </div>
          <div class="info-card full-width">
            <div class="card-icon">⛰️</div>
            <div class="card-details">
              <span class="card-title">Arazi Yapısı</span>
              <span class="card-value">{selectedCountry.data.geography.terrain.join(', ')}</span>
            </div>
          </div>
          <div class="info-card full-width">
            <div class="card-icon">🏞️</div>
            <div class="card-details">
              <span class="card-title">Doğal Kaynaklar</span>
              <span class="card-value">{selectedCountry.data.geography.naturalResources.join(', ')}</span>
            </div>
          </div>
          <div class="info-card full-width">
            <div class="card-icon">⚠️</div>
            <div class="card-details">
              <span class="card-title">Çevresel Sorunlar</span>
              <span class="card-value">{selectedCountry.data.geography.environmentalIssues.join(', ')}</span>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
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
    z-index: 9999;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    z-index: 1;
  }

  .compare-button {
    background: rgba(26, 35, 126, 0.8);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
  }

  .compare-button:hover {
    background: rgba(26, 35, 126, 1);
    transform: translateY(-1px);
  }

  .comparison-controls {
    padding: 16px;
    background: #f5f5f5;
    display: flex;
    gap: 12px;
  }

  .comparison-controls select {
    flex: 1;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
  }

  .chart-container {
    padding: 20px;
    background: white;
    border-radius: 12px;
    margin: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  }

  .timeline-container {
    padding: 20px;
    background: white;
    border-radius: 12px;
    margin: 16px;
  }

  .timeline-legend {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 16px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .dot.political { background: #1a237e; }
  .dot.economic { background: #0d47a1; }
  .dot.military { background: #2e7d32; }
  .dot.social { background: #c62828; }

  .economic-indicators {
    padding: 20px;
  }

  .indicators-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: 16px;
  }

  .indicator-card {
    background: white;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .indicator-label {
    font-size: 14px;
    color: #666;
  }

  .indicator-value {
    font-size: 16px;
    font-weight: 500;
    color: #1a237e;
  }

  .popup-header {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .close-button {
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .main-info-card {
    padding: 24px;
    background: linear-gradient(135deg, #1a237e, #0d47a1);
    color: white;
  }

  .country-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 20px;
  }

  .flag-container {
    width: 60px;
    height: 40px;
    overflow: hidden;
    border-radius: 4px;
  }

  .flag-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .country-header h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }

  .president-section {
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(255, 255, 255, 0.1);
    padding: 16px;
    border-radius: 12px;
    margin: 16px 0;
    transition: all 0.3s ease;
  }

  .president-section:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 0.15);
  }

  .president-image {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid rgba(255, 255, 255, 0.3);
  }

  .president-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .president-info {
    flex: 1;
  }

  .president-info h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 500;
  }

  .president-info p {
    margin: 8px 0 0;
    font-size: 14px;
    opacity: 0.9;
    line-height: 1.4;
  }

  .alliance-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
  }

  .tag {
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
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
    cursor: pointer;
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

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .info-card {
    background: white;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
  }

  .info-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .info-card.full-width {
    grid-column: 1 / -1;
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
    color: #666;
  }

  .card-value {
    font-size: 16px;
    font-weight: 500;
    color: #333;
  }

  /* Scrollbar stilleri */
  .content-area::-webkit-scrollbar {
    width: 8px;
  }

  .content-area::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  .content-area::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  .content-area::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>
