// src/lib/countryData.js

export const countryInfo = {
  "Turkey": {
    flag: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Flag_of_Turkey.svg",
    alliances: ["NATO", "G20", "UN"],
    president: {
      name: "Recep Tayyip Erdoğan",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Recep_Tayyip_Erdogan_2019_(cropped).jpg/220px-Recep_Tayyip_Erdogan_2019_(cropped).jpg",
      bio: "2014'ten beri Türkiye Cumhuriyeti'nin 12. Cumhurbaşkanı olarak görev yapmaktadır."
    },
    general: {
      population: "84.3 Milyon",
      capital: "Ankara",
      region: "Avrasya",
      language: "Türkçe",
      currency: "TRY",
      alliance: "NATO Üyesi"
    },
    demographics: {
      ageStructure: {
        under15: "23.7%",
        age15to64: "67.2%",
        over65: "9.1%"
      },
      urbanization: "76.1%",
      literacyRate: "96.7%",
      languages: ["Türkçe", "Kürtçe"],
      ethnicGroups: ["Türk", "Kürt", "Diğer"],
      religions: {
        "İslam": "99%",
        "Diğer": "1%"
      }
    },
    economy: {
      gdp: "720 Milyar USD",
      gdpRank: "20",
      gdpGrowth: "1.8%",
      majorSectors: ["Hizmet", "Sanayi", "Tarım"]
    },
    trade: {
      tradingPartners: ["AB", "Rusya", "Çin", "ABD"],
      mainExports: ["Makine", "Araçlar", "Tekstil"],
      mainImports: ["Petrol", "Makine", "Kimyasallar"]
    },
    military: {
      rank: "11",
      overview: "NATO'nun en büyük ikinci ordusuna sahip",
      personnel: {
        active: "355,200",
        reserve: "378,700"
      },
      equipment: {
        aircraft: "1,067",
        navalAssets: "156"
      },
      budget: "18.2 Milyar USD",
      capabilities: "Kara, Hava, Deniz ve Siber savunma kapasitesi"
    },
    geography: {
      area: "783,562 km²",
      coastline: "7,200 km",
      climate: "Ilıman",
      terrain: ["Dağlar", "Platolar", "Kıyı ovaları"],
      naturalResources: ["Kömür", "Krom", "Cıva"],
      environmentalIssues: ["Hava kirliliği", "Su kirliliği"]
    },
    innovation: {
      patents: "Yıllık 8,500",
      startupEcosystem: "Gelişmekte",
      rAndDSpending: "GSYİH'nin %1.1'i"
    },
    education: {
      universities: "207",
      studentPopulation: "7.5 milyon",
      researchOutput: "Yıllık 55,000 akademik yayın"
    },
    timeline: [
      {
        year: 1923,
        event: "Cumhuriyet'in İlanı",
        category: "political",
        description: "Mustafa Kemal Atatürk önderliğinde Türkiye Cumhuriyeti kuruldu."
      },
      {
        year: 1932,
        event: "Türk Dil Kurumu'nun Kuruluşu",
        category: "social",
        description: "Türk dilinin geliştirilmesi için TDK kuruldu."
      },
      {
        year: 1952,
        event: "NATO'ya Katılım",
        category: "military",
        description: "Türkiye, Kuzey Atlantik Antlaşması Örgütü'ne katıldı."
      },
      {
        year: 1963,
        event: "Ankara Anlaşması",
        category: "economic",
        description: "Türkiye-AET Ortaklık Anlaşması imzalandı."
      },
      {
        year: 1987,
        event: "AB'ye Tam Üyelik Başvurusu",
        category: "political",
        description: "Türkiye, AB'ye tam üyelik için başvuruda bulundu."
      },
      {
        year: 1996,
        event: "Gümrük Birliği",
        category: "economic",
        description: "AB ile Gümrük Birliği anlaşması yürürlüğe girdi."
      },
      {
        year: 1999,
        event: "AB Adaylığı",
        category: "political",
        description: "Türkiye'nin Avrupa Birliği adaylığı resmen kabul edildi."
      },
      {
        year: 2001,
        event: "Ekonomik Reform",
        category: "economic",
        description: "Kapsamlı ekonomik reform programı başlatıldı."
      },
      {
        year: 2005,
        event: "AB Müzakereleri",
        category: "political",
        description: "AB ile tam üyelik müzakereleri başladı."
      }
    ],
    economicData: {
      gdpTrend: [
        { year: 2018, gdp: 771.4, growth: 2.9, inflation: 16.3 },
        { year: 2019, gdp: 760.8, growth: 0.9, inflation: 15.2 },
        { year: 2020, gdp: 720.1, growth: 1.8, inflation: 12.3 },
        { year: 2021, gdp: 815.3, growth: 11.0, inflation: 19.6 },
        { year: 2022, gdp: 905.5, growth: 5.5, inflation: 72.3 }
      ],
      keyIndicators: {
        exportValue: "225.4 Milyar USD",
        importValue: "271.7 Milyar USD",
        foreignInvestment: "14.2 Milyar USD",
        unemployment: "10.8%"
      }
    }
  },
  "United States": {
    flag: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Flag_of_the_United_States.svg",
    alliances: ["NATO", "G7", "UN"],
    president: {
      name: "Joe Biden",
      image: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Joe_Biden_presidential_portrait.jpg/220px-Joe_Biden_presidential_portrait.jpg",
      bio: "Amerika Birleşik Devletleri'nin 46. başkanı olarak görev yapmaktadır."
    },
    general: {
      population: "331 Milyon",
      capital: "Washington, D.C.",
      region: "Kuzey Amerika",
      language: "İngilizce",
      currency: "USD",
      alliance: "NATO Lideri"
    },
    demographics: {
      ageStructure: {
        under15: "18.7%",
        age15to64: "65.2%",
        over65: "16.1%"
      },
      urbanization: "82.8%",
      literacyRate: "99%",
      languages: ["İngilizce", "İspanyolca"],
      ethnicGroups: ["Beyaz", "Hispanik", "Siyahi", "Asyalı"],
      religions: {
        "Hristiyan": "65%",
        "Yahudi": "2%",
        "Diğer": "33%"
      }
    },
    economy: {
      gdp: "21 Trilyon USD",
      gdpRank: "1",
      gdpGrowth: "2.3%",
      majorSectors: ["Hizmet", "Sanayi", "Teknoloji"]
    },
    trade: {
      tradingPartners: ["Çin", "Kanada", "Meksika", "AB"],
      mainExports: ["Teknoloji", "Makine", "Havacılık"],
      mainImports: ["Tüketici Ürünleri", "Petrol", "Elektronik"]
    },
    military: {
      rank: "1",
      overview: "Dünyanın en güçlü ordusu",
      personnel: {
        active: "1.4 Milyon",
        reserve: "845,000"
      },
      equipment: {
        aircraft: "13,200",
        navalAssets: "490"
      },
      budget: "778 Milyar USD",
      capabilities: "Küresel operasyon kapasitesi"
    },
    geography: {
      area: "9,833,517 km²",
      coastline: "19,924 km",
      climate: "Çeşitli",
      terrain: ["Dağlar", "Ovalar", "Çöller"],
      naturalResources: ["Petrol", "Doğalgaz", "Kömür"],
      environmentalIssues: ["İklim değişikliği", "Su kıtlığı"]
    },
    innovation: {
      patents: "Yıllık 597,000",
      startupEcosystem: "Dünya lideri",
      rAndDSpending: "GSYİH'nin %2.8'i"
    },
    education: {
      universities: "4,360",
      studentPopulation: "19.6 milyon",
      researchOutput: "Yıllık 422,800 akademik yayın"
    },
    timeline: [
      {
        year: 1776,
        event: "Bağımsızlık İlanı",
        category: "political",
        description: "Amerika Birleşik Devletleri'nin kuruluşu"
      },
      {
        year: 1865,
        event: "İç Savaşın Sonu",
        category: "military",
        description: "Amerikan İç Savaşı'nın sona ermesi"
      },
      {
        year: 1945,
        event: "II. Dünya Savaşı'nın Sonu",
        category: "military",
        description: "ABD'nin süper güç olarak yükselişi"
      },
      {
        year: 1969,
        event: "Ay'a İniş",
        category: "social",
        description: "Apollo 11 ile ilk insanlı Ay'a iniş"
      },
      {
        year: 1991,
        event: "Soğuk Savaşın Sonu",
        category: "political",
        description: "Sovyetler Birliği'nin dağılması"
      }
    ],
    economicData: {
      gdpTrend: [
        { year: 2018, gdp: 20580, growth: 2.9, inflation: 2.4 },
        { year: 2019, gdp: 21430, growth: 2.3, inflation: 1.8 },
        { year: 2020, gdp: 20940, growth: -3.4, inflation: 1.2 },
        { year: 2021, gdp: 22990, growth: 5.7, inflation: 4.7 },
        { year: 2022, gdp: 25460, growth: 2.1, inflation: 8.0 }
      ],
      keyIndicators: {
        exportValue: "2.5 Trilyon USD",
        importValue: "3.1 Trilyon USD",
        foreignInvestment: "350.8 Milyar USD",
        unemployment: "3.7%"
      }
    }
  }
};

// Karşılaştırma kategorileri
export const comparisonCategories = {
  economy: ["GSYİH", "Büyüme Oranı", "Enflasyon"],
  military: ["Aktif Personel", "Savunma Bütçesi", "Ekipman"],
  demographics: ["Nüfus", "Ortalama Yaş", "Şehirleşme"],
  geography: ["Toplam Alan", "Sahil Şeridi", "İklim"]
};

// Karşılaştırma verilerini getiren fonksiyon
export function getComparisonData(country1, country2, category) {
  const data1 = countryInfo[country1];
  const data2 = countryInfo[country2];
  
  switch(category) {
    case 'economy':
      return {
        labels: comparisonCategories.economy,
        datasets: [
          {
            label: country1,
            data: [
              parseFloat(data1.economy.gdp),
              parseFloat(data1.economy.gdpGrowth),
              data1.economicData.gdpTrend[data1.economicData.gdpTrend.length - 1].inflation
            ]
          },
          {
            label: country2,
            data: [
              parseFloat(data2.economy.gdp),
              parseFloat(data2.economy.gdpGrowth),
              data2.economicData.gdpTrend[data2.economicData.gdpTrend.length - 1].inflation
            ]
          }
        ]
      };
    case 'military':
      return {
        labels: comparisonCategories.military,
        datasets: [
          {
            label: country1,
            data: [
              parseInt(data1.military.personnel.active.replace(/[^0-9]/g, '')),
              parseInt(data1.military.budget.replace(/[^0-9]/g, '')),
              parseInt(data1.military.equipment.aircraft.replace(/[^0-9]/g, ''))
            ]
          },
          {
            label: country2,
            data: [
              parseInt(data2.military.personnel.active.replace(/[^0-9]/g, '')),
              parseInt(data2.military.budget.replace(/[^0-9]/g, '')),
              parseInt(data2.military.equipment.aircraft.replace(/[^0-9]/g, ''))
            ]
          }
        ]
      };
    default:
      return null;
  }
}
