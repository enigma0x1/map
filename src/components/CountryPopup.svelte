<script>
  import { fade, slide } from 'svelte/transition';
  import { categories } from '../data.js';

  export let selectedCountry;
  export let closePopup;
  export let activeCategory = 'overview';

  // InfoCard bileşeni (inline olarak tanımlanabilir)
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
</style>
