<script>
  import { fade, slide } from 'svelte/transition';
  
  export let selectedCountry;
  export let closePopup;
  export let activeCategory;
</script>

{#if selectedCountry}
  <div class="modern-popup"
       transition:slide={{duration: 400, axis: 'x'}}
       style="transform-origin: left">
    <!-- Header with close button -->
    <div class="popup-header">
      <button class="close-button" on:click={closePopup}>×</button>
    </div>
    
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
          <div class="info-card">
            <div class="card-icon">👥</div>
            <div class="card-details">
              <span class="card-title">Population</span>
              <span class="card-value">{selectedCountry.data.general.population}</span>
              <span class="card-trend">+1.2% annual</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🏛️</div>
            <div class="card-details">
              <span class="card-title">Capital</span>
              <span class="card-value">{selectedCountry.data.general.capital}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">💰</div>
            <div class="card-details">
              <span class="card-title">GDP</span>
              <span class="card-value">{selectedCountry.data.economy.gdp}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🌍</div>
            <div class="card-details">
              <span class="card-title">Region</span>
              <span class="card-value">{selectedCountry.data.general.region}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🗣️</div>
            <div class="card-details">
              <span class="card-title">Language</span>
              <span class="card-value">{selectedCountry.data.general.language}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🪙</div>
            <div class="card-details">
              <span class="card-title">Currency</span>
              <span class="card-value">{selectedCountry.data.general.currency}</span>
            </div>
          </div>
        </div>
      {:else if activeCategory === 'demographics'}
        <div class="demographics-content">
          <div class="info-card">
            <div class="card-icon">👶</div>
            <div class="card-details">
              <span class="card-title">Under 15</span>
              <span class="card-value">{selectedCountry.data.demographics.ageStructure.under15}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🧑‍🤝‍🧑</div>
            <div class="card-details">
              <span class="card-title">15-64</span>
              <span class="card-value">{selectedCountry.data.demographics.ageStructure.age15to64}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">👴</div>
            <div class="card-details">
              <span class="card-title">Over 65</span>
              <span class="card-value">{selectedCountry.data.demographics.ageStructure.over65}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🏙️</div>
            <div class="card-details">
              <span class="card-title">Urbanization</span>
              <span class="card-value">{selectedCountry.data.demographics.urbanization}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📚</div>
            <div class="card-details">
              <span class="card-title">Literacy Rate</span>
              <span class="card-value">{selectedCountry.data.demographics.literacyRate}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🗣️</div>
            <div class="card-details">
              <span class="card-title">Languages</span>
              <span class="card-value">{selectedCountry.data.demographics.languages.join(', ')}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">👥</div>
            <div class="card-details">
              <span class="card-title">Ethnic Groups</span>
              <span class="card-value">{selectedCountry.data.demographics.ethnicGroups.join(', ')}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🙏</div>
            <div class="card-details">
              <span class="card-title">Religions</span>
              <span class="card-value">{Object.entries(selectedCountry.data.demographics.religions).map(([key, value]) => `${key}: ${value}`).join(', ')}</span>
            </div>
          </div>
        </div>
      {:else if activeCategory === 'economy'}
        <div class="economy-content">
          <div class="info-card">
            <div class="card-icon">💰</div>
            <div class="card-details">
              <span class="card-title">GDP</span>
              <span class="card-value">{selectedCountry.data.economy.gdp}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📈</div>
            <div class="card-details">
              <span class="card-title">GDP Rank</span>
              <span class="card-value">{selectedCountry.data.economy.gdpRank}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📊</div>
            <div class="card-details">
              <span class="card-title">GDP Growth</span>
              <span class="card-value">{selectedCountry.data.economy.gdpGrowth}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🏭</div>
            <div class="card-details">
              <span class="card-title">Major Sectors</span>
              <span class="card-value">{selectedCountry.data.economy.majorSectors.join(', ')}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🤝</div>
            <div class="card-details">
              <span class="card-title">Trading Partners</span>
              <span class="card-value">{selectedCountry.data.trade.tradingPartners.join(', ')}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🚢</div>
            <div class="card-details">
              <span class="card-title">Main Exports</span>
              <span class="card-value">{selectedCountry.data.trade.mainExports.join(', ')}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🛢️</div>
            <div class="card-details">
              <span class="card-title">Main Imports</span>
              <span class="card-value">{selectedCountry.data.trade.mainImports.join(', ')}</span>
            </div>
          </div>
        </div>
      {:else if activeCategory === 'military'}
        <div class="military-content">
          <div class="info-card">
            <div class="card-icon">🎖️</div>
            <div class="card-details">
              <span class="card-title">Military Rank</span>
              <span class="card-value">{selectedCountry.data.military.rank}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🪖</div>
            <div class="card-details">
              <span class="card-title">Active Personnel</span>
              <span class="card-value">{selectedCountry.data.military.personnel.active}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🛡️</div>
            <div class="card-details">
              <span class="card-title">Reserve Personnel</span>
              <span class="card-value">{selectedCountry.data.military.personnel.reserve}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🛩️</div>
            <div class="card-details">
              <span class="card-title">Aircraft</span>
              <span class="card-value">{selectedCountry.data.military.equipment.aircraft}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🚢</div>
            <div class="card-details">
              <span class="card-title">Naval Assets</span>
              <span class="card-value">{selectedCountry.data.military.equipment.navalAssets}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">💰</div>
            <div class="card-details">
              <span class="card-title">Military Budget</span>
              <span class="card-value">{selectedCountry.data.military.budget}</span>
            </div>
          </div>
        </div>
      {:else if activeCategory === 'geography'}
        <div class="geography-content">
          <div class="info-card">
            <div class="card-icon">🗺️</div>
            <div class="card-details">
              <span class="card-title">Area</span>
              <span class="card-value">{selectedCountry.data.geography.area}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🌊</div>
            <div class="card-details">
              <span class="card-title">Coastline</span>
              <span class="card-value">{selectedCountry.data.geography.coastline}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🌡️</div>
            <div class="card-details">
              <span class="card-title">Climate</span>
              <span class="card-value">{selectedCountry.data.geography.climate}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">⛰️</div>
            <div class="card-details">
              <span class="card-title">Terrain</span>
              <span class="card-value">{selectedCountry.data.geography.terrain.join(', ')}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">⛏️</div>
            <div class="card-details">
              <span class="card-title">Natural Resources</span>
              <span class="card-value">{selectedCountry.data.geography.naturalResources.join(', ')}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">⚠️</div>
            <div class="card-details">
              <span class="card-title">Environmental Issues</span>
              <span class="card-value">{selectedCountry.data.geography.environmentalIssues.join(', ')}</span>
            </div>
          </div>
        </div>
      {:else if activeCategory === 'innovation'}
        <div class="innovation-content">
          <div class="info-card">
            <div class="card-icon">💡</div>
            <div class="card-details">
              <span class="card-title">Patents</span>
              <span class="card-value">{selectedCountry.data.innovation.patents}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🚀</div>
            <div class="card-details">
              <span class="card-title">Startup Ecosystem</span>
              <span class="card-value">{selectedCountry.data.innovation.startupEcosystem}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🔬</div>
            <div class="card-details">
              <span class="card-title">R&D Spending</span>
              <span class="card-value">{selectedCountry.data.innovation.rAndDSpending}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🎓</div>
            <div class="card-details">
              <span class="card-title">Universities</span>
              <span class="card-value">{selectedCountry.data.education.universities}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🧑‍🎓</div>
            <div class="card-details">
              <span class="card-title">Student Population</span>
              <span class="card-value">{selectedCountry.data.education.studentPopulation}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📰</div>
            <div class="card-details">
              <span class="card-title">Research Output</span>
              <span class="card-value">{selectedCountry.data.education.researchOutput}</span>
            </div>
          </div>
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

<style>
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
  .popup-header {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
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
</style>
