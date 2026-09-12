// Single source of truth for Oman's governorates and wilayats lives in the
// frontend data folder (the picker and the API must agree on the exact
// strings). The backend reads the same file rather than keeping a copy.
const GOVERNORATES = require('../../frontend/src/data/oman-locations.json');

const wilayatsByGovernorate = new Map(
  GOVERNORATES.map(g => [g.value, g.wilayats.map(w => w.value)])
);
const governorateByWilayat = new Map(
  GOVERNORATES.flatMap(g => g.wilayats.map(w => [w.value, g.value]))
);

module.exports = {
  GOVERNORATES,
  wilayatsOf: governorate => wilayatsByGovernorate.get(governorate) || [],
  governorateOf: wilayat => governorateByWilayat.get(wilayat) || '',
};
