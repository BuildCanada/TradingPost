// Toronto 2026 candidate questionnaire — the questions sent to every candidate.
// Every question also carries an optional free-text comment field on the live survey.

export type YesNoQuestion = {
  id: string;
  topic: string;
  question: string;
};

export type ChoiceQuestion = {
  id: string;
  question: string;
  options: { label: string; body: string }[];
};

export type QuestionSection = {
  id: string;
  number: string;
  title: string;
  questions: ChoiceQuestion[];
};

export const STAGE_ONE: YesNoQuestion[] = [
  {
    id: "S1",
    topic: "Housing",
    question:
      "Should Toronto permit substantially more housing as-of-right in every ward, including areas currently dominated by detached and semi-detached homes?",
  },
  {
    id: "S2",
    topic: "Encampments",
    question:
      "When a person living in a park has been offered an available indoor space that meets their accessibility, safety and household needs, should the city require them to leave the encampment?",
  },
  {
    id: "S3",
    topic: "Road pricing",
    question:
      "Should Toronto introduce road-pricing measures, such as congestion charges or tolls, if the revenue is dedicated to transportation improvements?",
  },
  {
    id: "S4",
    topic: "Infrastructure",
    question:
      "Should Toronto raise additional local revenue to address its infrastructure repair backlog rather than defer maintenance while seeking funding from other governments?",
  },
  {
    id: "S5",
    topic: "Transparency",
    question:
      "Should Toronto publish project-level budgets, schedules and performance updates for all major capital projects?",
  },
];

export const STAGE_TWO: QuestionSection[] = [
  {
    id: "housing-and-growth",
    number: "1",
    title: "Housing and Growth",
    questions: [
      {
        id: "1.1",
        question:
          "If Toronto could make one major housing intervention this term, which should receive the greatest emphasis?",
        options: [
          {
            label: "Permission",
            body: "Permit substantially more housing as-of-right",
          },
          {
            label: "Cost and speed",
            body: "Reduce approval times, development charges and other city-imposed costs",
          },
          {
            label: "Public delivery",
            body: "Build or finance substantially more affordable and supportive housing",
          },
        ],
      },
      {
        id: "1.2",
        question:
          "What should be Toronto's primary role in delivering affordable and supportive housing?",
        options: [
          {
            label: "Direct provider",
            body: "Build, acquire and own significantly more housing",
          },
          {
            label: "Partner and financier",
            body: "Supply land, funding and incentives to non-profit and private providers",
          },
          {
            label: "Regulator and enabler",
            body: "Focus primarily on permitting enough housing and reducing barriers to construction",
          },
        ],
      },
      {
        id: "1.3",
        question:
          "Where should Toronto permit the greatest increase in housing density?",
        options: [
          {
            label: "Across the city",
            body: "Permit more apartments and multiplexes in nearly every neighbourhood",
          },
          {
            label: "Along corridors and transit",
            body: "Concentrate growth on major streets and near rapid transit",
          },
          {
            label: "In designated centres",
            body: "Concentrate most growth downtown and in existing growth centres",
          },
        ],
      },
    ],
  },
  {
    id: "transit-and-transportation",
    number: "2",
    title: "Transit and Transportation",
    questions: [
      {
        id: "2.1",
        question:
          "What should receive the greatest share of the next available transit funding?",
        options: [
          {
            label: "Service",
            body: "More frequent and reliable service on existing routes",
          },
          {
            label: "Maintenance",
            body: "Vehicles, stations, signals and other state-of-good-repair work",
          },
          {
            label: "Expansion",
            body: "New rapid-transit lines and extensions",
          },
        ],
      },
      {
        id: "2.2",
        question:
          "When there is not enough street space for every use, which should generally receive priority?",
        options: [
          {
            label: "Passenger capacity",
            body: "Transit, walking and cycling",
          },
          {
            label: "Goods and essential access",
            body: "Deliveries, trades, emergency vehicles and accessibility",
          },
          {
            label: "General traffic and parking",
            body: "Automobile capacity and curbside parking",
          },
        ],
      },
      {
        id: "2.3",
        question:
          "If large-scale autonomous taxi service is introduced in Toronto, what should the city regulate most aggressively?",
        options: [
          {
            label: "Safety",
            body: "Collision standards and interaction with pedestrians, cyclists and other road users",
          },
          {
            label: "Street use",
            body: "Congestion, empty vehicles, pickups and curb access",
          },
          {
            label: "Public obligations",
            body: "Accessibility, geographic coverage and service standards",
          },
        ],
      },
    ],
  },
  {
    id: "public-safety-and-public-space",
    number: "3",
    title: "Public Safety and Public Space",
    questions: [
      {
        id: "3.1",
        question:
          "Which approach should receive the greatest additional investment to improve public safety?",
        options: [
          {
            label: "Enforcement",
            body: "Police, bylaw enforcement and a more visible official presence",
          },
          {
            label: "Crisis and prevention services",
            body: "Mental-health response, addiction treatment and youth intervention",
          },
          {
            label: "Public-space management",
            body: "Lighting, maintenance, sanitation and active use of streets and parks",
          },
        ],
      },
      {
        id: "3.2",
        question:
          "Over the next council term, the Toronto Police Service budget should:",
        options: [
          {
            label: "Increase",
            body: "above inflation to expand police staffing or services",
          },
          {
            label: "Hold",
            body: "approximately constant after inflation",
          },
          {
            label: "Decrease",
            body: "after inflation, with some responsibilities and funding transferred to civilian services",
          },
        ],
      },
      {
        id: "3.3",
        question:
          "How should Toronto govern automated licence-plate readers and similar surveillance technology used on public streets?",
        options: [
          {
            label: "Permit broad use",
            body: "Allow police and approved organizations to deploy them under existing privacy law",
          },
          {
            label: "Permit under strict rules",
            body: "Establish citywide limits on access, retention, auditing and data sharing",
          },
          {
            label: "Prohibit broad automated collection",
            body: "Restrict their use to narrowly authorized investigations",
          },
        ],
      },
    ],
  },
  {
    id: "city-government-and-service-delivery",
    number: "4",
    title: "City Government and Service Delivery",
    questions: [
      {
        id: "4.1",
        question:
          "Which change would do the most to reduce the cost of building housing in Toronto?",
        options: [
          {
            label: "Lower municipal charges",
            body: "Reduce development charges, parkland payments and related levies",
          },
          {
            label: "Faster approvals",
            body: "Expand as-of-right zoning and automate routine permits",
          },
          {
            label: "Simpler standards",
            body: "Reduce parking, design and other construction requirements",
          },
        ],
      },
      {
        id: "4.2",
        question:
          "What is the most important change Toronto should make to reduce capital-project delays and cost overruns?",
        options: [
          {
            label: "Improve project delivery",
            body: "Strengthen professional project management, procurement and contracting",
          },
          {
            label: "Control political changes",
            body: "Prevent councillors from altering scope after approval without identifying funding",
          },
          {
            label: "Limit the project pipeline",
            body: "Start fewer projects and fully fund them before construction begins",
          },
        ],
      },
      {
        id: "4.3",
        question: "Which service-delivery model should Toronto use more often?",
        options: [
          {
            label: "Direct delivery",
            body: "Expand permanent city staff and internal operational capacity",
          },
          {
            label: "External delivery",
            body: "Use competitive contracts and outside providers where they can deliver better value",
          },
          {
            label: "Specialized agencies",
            body: "Move major functions to arm's-length organizations with clear performance mandates",
          },
        ],
      },
    ],
  },
  {
    id: "taxes-spending-and-fiscal-sustainability",
    number: "5",
    title: "Taxes, Spending and Fiscal Sustainability",
    questions: [
      {
        id: "5.1",
        question:
          "Over the next council term, residential property-tax revenues should generally:",
        options: [
          {
            label: "Grow faster",
            body: "than inflation to improve or expand services",
          },
          {
            label: "Grow approximately",
            body: "with inflation and population",
          },
          {
            label: "Grow more slowly",
            body: "than inflation, requiring service restraint or alternative revenues",
          },
        ],
      },
      {
        id: "5.2",
        question:
          "Which type of additional revenue should Toronto rely on most heavily?",
        options: [
          {
            label: "Broad recurring revenue",
            body: "Property taxes or new municipal income or sales taxes, if authorized",
          },
          {
            label: "Growth and transaction revenue",
            body: "Land-transfer taxes, development charges and taxes on real-estate activity",
          },
          {
            label: "User and road charges",
            body: "Congestion charges, tolls, parking levies and service fees",
          },
        ],
      },
      {
        id: "5.3",
        question:
          "What should Toronto do first to address its infrastructure repair backlog?",
        options: [
          {
            label: "Raise dedicated revenue",
            body: "Introduce a levy or other recurring source reserved for maintenance",
          },
          {
            label: "Delay expansion",
            body: "Redirect money from new facilities and projects toward existing assets",
          },
          {
            label: "Reduce the asset base",
            body: "Sell, consolidate or close facilities the city cannot sustainably maintain",
          },
        ],
      },
    ],
  },
  {
    id: "governance-and-representation",
    number: "6",
    title: "Governance and Representation",
    questions: [
      {
        id: "6.1",
        question:
          "What should be Toronto's primary approach to the provincial government?",
        options: [
          {
            label: "Partnership",
            body: "Align with provincial priorities where doing so secures funding or approvals",
          },
          {
            label: "Advocacy",
            body: "Publicly press for greater authority, revenue and a different fiscal arrangement",
          },
          {
            label: "Self-reliance",
            body: "Plan budgets and services on the assumption that substantial new provincial support will not arrive",
          },
        ],
      },
    ],
  },
];

export type AdditionalQuestion = ChoiceQuestion & { topic: string };

export const ADDITIONAL: AdditionalQuestion[] = [
  {
    id: "O1",
    topic: "Cycling",
    question: "Over the next council term, Toronto should:",
    options: [
      {
        label: "Accelerate",
        body: "Expand the protected cycling network, including projects that remove traffic lanes or parking",
      },
      {
        label: "Complete existing commitments",
        body: "Finish approved projects but undertake few additional road reallocations",
      },
      {
        label: "Review and reverse",
        body: "Remove or redesign lanes that fail defined safety, ridership or congestion standards",
      },
    ],
  },
  {
    id: "O2",
    topic: "Protest and Access",
    question:
      "When demonstrations substantially block transportation or access to essential institutions, the city should prioritize:",
    options: [
      {
        label: "Maintaining access",
        body: "Keep major roads, transit, hospitals and essential facilities operating",
      },
      {
        label: "Protecting protest",
        body: "Accept significant disruption unless there is an immediate safety threat",
      },
      {
        label: "Predetermined limits",
        body: "Protect protest subject to clear rules for locations, access routes and duration",
      },
    ],
  },
  {
    id: "O3",
    topic: "Technology",
    question: "Where should Toronto direct its next major technology investment?",
    options: [
      {
        label: "Resident services",
        body: "Permits, licences, payments and service requests",
      },
      {
        label: "Internal operations",
        body: "Procurement, finance, staffing and administrative efficiency",
      },
      {
        label: "Performance management",
        body: "Public data and systems that measure outcomes and hold departments accountable",
      },
    ],
  },
  {
    id: "O4",
    topic: "Budget Decisions",
    question:
      "When Toronto faces a structural operating-budget gap, what should it do first?",
    options: [
      {
        label: "Reduce services",
        body: "Reduce or redesign lower-priority services",
      },
      {
        label: "Reduce overhead",
        body: "Reduce internal administration, staffing or contract costs",
      },
      {
        label: "Raise revenue",
        body: "Raise taxes, fees or other revenue",
      },
    ],
  },
  {
    id: "O5",
    topic: "Business Climate",
    question:
      "What is the most important municipal intervention for improving Toronto's business climate?",
    options: [
      {
        label: "Lower costs",
        body: "Reduce commercial taxes, fees and licensing expenses",
      },
      {
        label: "Reduce delay",
        body: "Accelerate permits, inspections and approvals",
      },
      {
        label: "Improve fundamentals",
        body: "Expand housing, transportation, public safety and infrastructure",
      },
    ],
  },
  {
    id: "O6",
    topic: "Investment Attraction",
    question:
      "How should Toronto attract major employers, investment and events?",
    options: [
      {
        label: "Targeted incentives",
        body: "Direct financial bids, tax measures or customized agreements",
      },
      {
        label: "Citywide fundamentals",
        body: "Housing affordability, transportation, safety and quality of life",
      },
      {
        label: "Sector strategy",
        body: "Concentrate resources on a small number of industries where Toronto has an existing advantage",
      },
    ],
  },
  {
    id: "O7",
    topic: "Construction Capacity",
    question:
      "What should Toronto prioritize to increase construction capacity?",
    options: [
      {
        label: "Predictable demand",
        body: "Maintain a stable, long-term pipeline of public projects",
      },
      {
        label: "Workforce supply",
        body: "Expand apprenticeships, training and recognition of international credentials",
      },
      {
        label: "Productivity",
        body: "Encourage modular construction, prefabrication and more efficient building methods",
      },
    ],
  },
  {
    id: "O8",
    topic: "Public Realm",
    question:
      "What should receive the greatest priority in Toronto's public-realm budget?",
    options: [
      {
        label: "Basic maintenance",
        body: "Cleanliness, roads, sidewalks, snow clearing, washrooms and routine park care",
      },
      {
        label: "Major improvements",
        body: "A smaller number of transformative parks, streets and public spaces",
      },
      {
        label: "Programming and activity",
        body: "Markets, events, patios, recreation and cultural programming",
      },
    ],
  },
  {
    id: "O9",
    topic: "Arts, Culture and Nightlife",
    question:
      "What should be Toronto's primary tool for supporting arts, culture and nightlife?",
    options: [
      {
        label: "Regulatory reform",
        body: "Simpler permits, flexible operating rules and later hours",
      },
      {
        label: "Public funding",
        body: "Grants, city facilities and affordable cultural space",
      },
      {
        label: "Protection from displacement",
        body: "Planning and property measures that preserve existing venues and workspaces",
      },
    ],
  },
  {
    id: "O10",
    topic: "Autonomous Vehicles",
    question:
      "If autonomous taxi services operate in Toronto, which condition should the city prioritize?",
    options: [
      {
        label: "Data disclosure",
        body: "Mandatory reporting on trips, collisions, congestion and curb use",
      },
      {
        label: "Service obligations",
        body: "Accessibility, geographic coverage and minimum service standards",
      },
      {
        label: "Limited municipal conditions",
        body: "Avoid additional requirements beyond provincial regulation",
      },
    ],
  },
];
