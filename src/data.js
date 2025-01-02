export const categories = {
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

export const membershipData = {
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

export const countryInfo = {
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
