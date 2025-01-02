// src/lib/countryData.ts

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
      }
    }
    // Diğer ülkeler eklenebilir...
};
