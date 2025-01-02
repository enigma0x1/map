<script>
  export let selectedCountry;
  export let closePopup;
  export let activeCategory = 'overview';
</script>

{#if selectedCountry}
  <div class="modern-popup">
    <div class="popup-header">
      <button class="close-button" on:click={closePopup}>×</button>
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

    <!-- Kategori Seçici -->
    <div class="category-selector">
      <button class:active={activeCategory === 'overview'} on:click={() => activeCategory = 'overview'}>
        Genel Bakış
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
      <button class:active={activeCategory === 'innovation'} on:click={() => activeCategory = 'innovation'}>
        İnovasyon
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

      {:else if activeCategory === 'economy'}
        <div class="info-grid">
          <div class="info-card">
            <div class="card-icon">💰</div>
            <div class="card-details">
              <span class="card-title">GSYİH</span>
              <span class="card-value">{selectedCountry.data.economy.gdp}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📈</div>
            <div class="card-details">
              <span class="card-title">GSYİH Sıralaması</span>
              <span class="card-value">{selectedCountry.data.economy.gdpRank}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📊</div>
            <div class="card-details">
              <span class="card-title">Büyüme</span>
              <span class="card-value">{selectedCountry.data.economy.gdpGrowth}</span>
            </div>
          </div>
          <div class="info-card full-width">
            <div class="card-icon">🏭</div>
            <div class="card-details">
              <span class="card-title">Ana Sektörler</span>
              <span class="card-value">{selectedCountry.data.economy.majorSectors.join(', ')}</span>
            </div>
          </div>
          <div class="info-card full-width">
            <div class="card-icon">🤝</div>
            <div class="card-details">
              <span class="card-title">Ticaret Ortakları</span>
              <span class="card-value">{selectedCountry.data.trade.tradingPartners.join(', ')}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📤</div>
            <div class="card-details">
              <span class="card-title">Ana İhracat</span>
              <span class="card-value">{selectedCountry.data.trade.mainExports.join(', ')}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📥</div>
            <div class="card-details">
              <span class="card-title">Ana İthalat</span>
              <span class="card-value">{selectedCountry.data.trade.mainImports.join(', ')}</span>
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

      {:else if activeCategory === 'innovation'}
        <div class="info-grid">
          <div class="info-card">
            <div class="card-icon">💡</div>
            <div class="card-details">
              <span class="card-title">Patent Sayısı</span>
              <span class="card-value">{selectedCountry.data.innovation.patents}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🚀</div>
            <div class="card-details">
              <span class="card-title">Startup Ekosistemi</span>
              <span class="card-value">{selectedCountry.data.innovation.startupEcosystem}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📊</div>
            <div class="card-details">
              <span class="card-title">Ar-Ge Harcamaları</span>
              <span class="card-value">{selectedCountry.data.innovation.rAndDSpending}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">🎓</div>
            <div class="card-details">
              <span class="card-title">Üniversite Sayısı</span>
              <span class="card-value">{selectedCountry.data.education.universities}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">👨‍🎓</div>
            <div class="card-details">
              <span class="card-title">Öğrenci Nüfusu</span>
              <span class="card-value">{selectedCountry.data.education.studentPopulation}</span>
            </div>
          </div>
          <div class="info-card">
            <div class="card-icon">📚</div>
            <div class="card-details">
              <span class="card-title">Akademik Yayın</span>
              <span class="card-value">{selectedCountry.data.education.researchOutput}</span>
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
