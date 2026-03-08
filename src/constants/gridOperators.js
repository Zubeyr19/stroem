// Top Danish DSOs (grid operators) with their GLN numbers from Energi Data Service.
// GLNs are verified from the DatahubPricelist API (energidataservice.dk).
export const GRID_OPERATORS = [
  {
    id: 'radius',
    name: 'Radius Elnet',
    gln: '5790000705689',
    area: 'DK2',
    region: 'Copenhagen & Zealand',
  },
  {
    id: 'n1_131',
    name: 'N1 (Nord)',
    gln: '5790001089030',
    area: 'DK1',
    region: 'North Jutland',
  },
  {
    id: 'n1_344',
    name: 'N1 (Øst)',
    gln: '5790000611003',
    area: 'DK1',
    region: 'East Jutland',
  },
  {
    id: 'cerius',
    name: 'Cerius',
    gln: '5790000705184',
    area: 'DK2',
    region: 'West Zealand',
  },
  {
    id: 'elnet_midt',
    name: 'Elnet Midt',
    gln: '5790001100520',
    area: 'DK1',
    region: 'Mid Jutland',
  },
  {
    id: 'trefor',
    name: 'TREFOR El-net (EWII)',
    gln: '5790000392261',
    area: 'DK1',
    region: 'South Jutland & Funen',
  },
  {
    id: 'flow',
    name: 'FLOW Elnet',
    gln: '5790000392551',
    area: 'DK2',
    region: 'Bornholm',
  },
  {
    id: 'konstant',
    name: 'Konstant Net',
    gln: '5790000704842',
    area: 'DK1',
    region: 'Mid Jutland',
  },
  {
    id: 'noe_net',
    name: 'NOE Net',
    gln: '5790000395620',
    area: 'DK2',
    region: 'North Zealand',
  },
  {
    id: 'vores_elnet',
    name: 'Vores Elnet',
    gln: '5790000610976',
    area: 'DK1',
    region: 'Jutland',
  },
];

export const DEFAULT_OPERATOR = GRID_OPERATORS[0]; // Radius
