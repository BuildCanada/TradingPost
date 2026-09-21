// AUTO-GENERATED — do not edit by hand.
// Toronto's per-ward Census statistics, formatted for display.
// Source: Ward Profiles (25-Ward Model), City of Toronto Open Data, from
// Statistics Canada's 2021 and 2016 Census of Population.
// https://open.toronto.ca/dataset/ward-profiles-25-ward-model/
// Regenerate with: node scripts/gen-ward-profiles.mjs
// The hand-written briefs that accompany these live in ./wardProfiles.ts.

import type { WardStat } from "@/components/elections/WardProfile";

/** Statistics for each ward, keyed by the zero-padded ward token ("01".."25"),
 *  in the order they should be shown. */
export const WARD_STATS: Record<string, WardStat[]> = {
  "01": [
    {
      "label": "Population",
      "value": "115,120",
      "cityValue": "2,761,285",
      "note": "−1.6% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "2,380",
      "note": "48.4 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$81,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "45.5%",
      "cityValue": "48.1%",
      "note": "$1,328 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "34.2%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "41.9%",
      "cityValue": "46.7%",
      "note": "29.6% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "56.2%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "12.9%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "02": [
    {
      "label": "Population",
      "value": "117,200",
      "cityValue": "2,761,285",
      "note": "+1.0% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "3,138",
      "note": "37.4 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$100,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "32.6%",
      "cityValue": "48.1%",
      "note": "$1,574 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "39.2%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "39.4%",
      "cityValue": "46.7%",
      "note": "48.2% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "41.4%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "7.9%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "03": [
    {
      "label": "Population",
      "value": "139,920",
      "cityValue": "2,761,285",
      "note": "+9.7% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "3,499",
      "note": "40.0 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$90,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "43.1%",
      "cityValue": "48.1%",
      "note": "$1,592 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "40.9%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "46.7%",
      "cityValue": "46.7%",
      "note": "28.3% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "39.1%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "11.0%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "04": [
    {
      "label": "Population",
      "value": "104,715",
      "cityValue": "2,761,285",
      "note": "−1.6% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "6,831",
      "note": "15.3 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$85,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "56.3%",
      "cityValue": "48.1%",
      "note": "$1,492 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "39.7%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "38.3%",
      "cityValue": "46.7%",
      "note": "17.9% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "30.9%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "12.0%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "05": [
    {
      "label": "Population",
      "value": "115,675",
      "cityValue": "2,761,285",
      "note": "+0.5% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "4,631",
      "note": "25.0 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$72,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "51.9%",
      "cityValue": "48.1%",
      "note": "$1,196 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "34.8%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "40.6%",
      "cityValue": "46.7%",
      "note": "29.3% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "50.3%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "14.7%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "06": [
    {
      "label": "Population",
      "value": "107,355",
      "cityValue": "2,761,285",
      "note": "+3.5% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "3,036",
      "note": "35.4 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$82,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "50.2%",
      "cityValue": "48.1%",
      "note": "$1,448 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "36.1%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "43.3%",
      "cityValue": "46.7%",
      "note": "25.1% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "55.4%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "11.5%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "07": [
    {
      "label": "Population",
      "value": "111,200",
      "cityValue": "2,761,285",
      "note": "+3.2% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "3,622",
      "note": "30.7 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$73,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "52.0%",
      "cityValue": "48.1%",
      "note": "$1,261 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "33.2%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "41.1%",
      "cityValue": "46.7%",
      "note": "12.4% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "56.4%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "15.1%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "08": [
    {
      "label": "Population",
      "value": "114,820",
      "cityValue": "2,761,285",
      "note": "+1.7% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "5,067",
      "note": "22.7 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$97,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "46.6%",
      "cityValue": "48.1%",
      "note": "$1,588 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "38.0%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "33.4%",
      "cityValue": "46.7%",
      "note": "37.4% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "39.0%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "10.1%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "09": [
    {
      "label": "Population",
      "value": "104,730",
      "cityValue": "2,761,285",
      "note": "−2.5% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "8,655",
      "note": "12.1 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$85,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "48.2%",
      "cityValue": "48.1%",
      "note": "$1,552 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "41.3%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "18.7%",
      "cityValue": "46.7%",
      "note": "14.2% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "37.9%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "10.8%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "10": [
    {
      "label": "Population",
      "value": "135,400",
      "cityValue": "2,761,285",
      "note": "+18.4% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "10,570",
      "note": "12.8 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$89,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "58.1%",
      "cityValue": "48.1%",
      "note": "$1,988 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "43.7%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "88.0%",
      "cityValue": "46.7%",
      "note": "0.6% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "39.8%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "14.1%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "11": [
    {
      "label": "Population",
      "value": "102,385",
      "cityValue": "2,761,285",
      "note": "+1.9% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "7,528",
      "note": "13.6 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$84,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "56.9%",
      "cityValue": "48.1%",
      "note": "$1,976 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "48.8%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "51.1%",
      "cityValue": "46.7%",
      "note": "7.8% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "33.9%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "15.3%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "12": [
    {
      "label": "Population",
      "value": "114,095",
      "cityValue": "2,761,285",
      "note": "+8.7% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "8,696",
      "note": "13.1 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$86,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "61.4%",
      "cityValue": "48.1%",
      "note": "$1,768 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "44.6%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "56.6%",
      "cityValue": "46.7%",
      "note": "15.2% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "35.4%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "12.5%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "13": [
    {
      "label": "Population",
      "value": "116,930",
      "cityValue": "2,761,285",
      "note": "+17.4% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "19,954",
      "note": "5.9 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$65,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "70.0%",
      "cityValue": "48.1%",
      "note": "$1,520 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "43.1%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "85.2%",
      "cityValue": "46.7%",
      "note": "0.4% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "41.7%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "22.2%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "14": [
    {
      "label": "Population",
      "value": "104,555",
      "cityValue": "2,761,285",
      "note": "−0.8% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "5,027",
      "note": "20.8 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$93,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "45.1%",
      "cityValue": "48.1%",
      "note": "$1,424 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "37.8%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "22.0%",
      "cityValue": "46.7%",
      "note": "18.2% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "30.5%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "11.5%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "15": [
    {
      "label": "Population",
      "value": "101,025",
      "cityValue": "2,761,285",
      "note": "−0.8% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "3,334",
      "note": "30.3 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$102,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "48.0%",
      "cityValue": "48.1%",
      "note": "$1,716 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "40.9%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "40.1%",
      "cityValue": "46.7%",
      "note": "36.8% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "41.0%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "12.6%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "16": [
    {
      "label": "Population",
      "value": "94,335",
      "cityValue": "2,761,285",
      "note": "+1.3% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "4,109",
      "note": "23.0 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$78,500",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "55.7%",
      "cityValue": "48.1%",
      "note": "$1,492 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "39.1%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "58.9%",
      "cityValue": "46.7%",
      "note": "14.2% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "53.4%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "14.4%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "17": [
    {
      "label": "Population",
      "value": "112,590",
      "cityValue": "2,761,285",
      "note": "+3.2% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "4,611",
      "note": "24.4 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$84,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "43.2%",
      "cityValue": "48.1%",
      "note": "$1,754 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "43.6%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "56.1%",
      "cityValue": "46.7%",
      "note": "19.3% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "60.6%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "14.4%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "18": [
    {
      "label": "Population",
      "value": "117,130",
      "cityValue": "2,761,285",
      "note": "−0.2% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "5,928",
      "note": "19.8 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$81,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "42.0%",
      "cityValue": "48.1%",
      "note": "$1,880 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "49.3%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "60.7%",
      "cityValue": "46.7%",
      "note": "24.6% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "60.2%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "17.8%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "19": [
    {
      "label": "Population",
      "value": "108,500",
      "cityValue": "2,761,285",
      "note": "+0.1% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "6,458",
      "note": "16.8 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$89,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "44.2%",
      "cityValue": "48.1%",
      "note": "$1,370 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "38.6%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "25.2%",
      "cityValue": "46.7%",
      "note": "28.0% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "31.7%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "11.9%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "20": [
    {
      "label": "Population",
      "value": "110,095",
      "cityValue": "2,761,285",
      "note": "+1.7% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "3,912",
      "note": "28.1 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$79,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "45.7%",
      "cityValue": "48.1%",
      "note": "$1,196 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "32.3%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "34.0%",
      "cityValue": "46.7%",
      "note": "35.4% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "45.8%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "13.9%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "21": [
    {
      "label": "Population",
      "value": "111,560",
      "cityValue": "2,761,285",
      "note": "+1.0% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "3,955",
      "note": "28.2 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$78,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "43.2%",
      "cityValue": "48.1%",
      "note": "$1,338 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "35.8%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "41.5%",
      "cityValue": "46.7%",
      "note": "34.2% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "55.3%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "13.3%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "22": [
    {
      "label": "Population",
      "value": "103,690",
      "cityValue": "2,761,285",
      "note": "−0.5% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "4,845",
      "note": "21.4 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$77,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "33.8%",
      "cityValue": "48.1%",
      "note": "$1,358 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "36.0%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "47.2%",
      "cityValue": "46.7%",
      "note": "28.9% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "63.7%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "14.7%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "23": [
    {
      "label": "Population",
      "value": "94,025",
      "cityValue": "2,761,285",
      "note": "−3.7% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "3,089",
      "note": "30.4 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$87,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "20.6%",
      "cityValue": "48.1%",
      "note": "$1,408 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "33.3%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "22.4%",
      "cityValue": "46.7%",
      "note": "39.9% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "64.6%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "11.8%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "24": [
    {
      "label": "Population",
      "value": "102,755",
      "cityValue": "2,761,285",
      "note": "+1.6% since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "3,935",
      "note": "26.1 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$78,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "45.0%",
      "cityValue": "48.1%",
      "note": "$1,197 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "31.6%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "47.3%",
      "cityValue": "46.7%",
      "note": "33.7% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "53.4%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "14.7%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
  "25": [
    {
      "label": "Population",
      "value": "101,485",
      "cityValue": "2,761,285",
      "note": "No change since 2016"
    },
    {
      "label": "Residents per km²",
      "value": "1,877",
      "note": "54.1 km² of land"
    },
    {
      "label": "Median household income",
      "value": "$105,000",
      "cityValue": "$84,000"
    },
    {
      "label": "Renter households",
      "value": "20.6%",
      "cityValue": "48.1%",
      "note": "$1,362 average monthly rent"
    },
    {
      "label": "Renters spending 30%+ of income on housing",
      "value": "32.7%",
      "cityValue": "40.0%"
    },
    {
      "label": "Homes in buildings of five storeys or more",
      "value": "12.5%",
      "cityValue": "46.7%",
      "note": "54.7% single-detached"
    },
    {
      "label": "Residents born outside Canada",
      "value": "51.9%",
      "cityValue": "46.6%"
    },
    {
      "label": "Residents in low income",
      "value": "7.8%",
      "cityValue": "13.2%",
      "note": "Low-income measure, after tax"
    }
  ],
};

/** Where these figures come from, worded for the source line shown under a
 *  ward's statistics. */
export const WARD_STATS_SOURCE =
  "the 2021 Census of Population, via the City of Toronto’s ward profiles";
