import {geoConicConformal, geoPath, geoGraticule10} from 'd3-geo';
import * as topo from 'topojson-client';
import fs from 'fs';
const w = JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json'));
const countries = topo.feature(w, w.objects.countries);
const pick = {France: '250', Spain: '724', Belgium: '056', Italy: '380', Portugal: '620', Albania: '008'};
const box = {type: 'Feature', geometry: {type: 'MultiPoint', coordinates: [[-11, 36], [27, 36], [-8, 59], [24, 59], [8, 35.5]]}};
const proj = geoConicConformal().rotate([-9, 0]).parallels([38, 56]).fitExtent([[30, 560], [1050, 1470]], box);
proj.clipExtent([[-500, 0], [1600, 2400]]);
const path = geoPath(proj).digits(1);
const land = path(topo.merge(w, w.objects.countries.geometries));
const out = {land, countries: {}};
for (const [n, id] of Object.entries(pick)) {
  const f = countries.features.find((c) => c.id === id);
  // mainland only for France (skip overseas) — the clip extent already drops far territories
  out.countries[n] = {d: path(f), c: path.centroid(f)};
}
// fix France centroid to mainland (Paris-ish area of the hexagon)
out.countries.France.c = proj([2.4, 46.6]);
out.countries.Portugal.c = proj([-8.1, 39.6]);
out.countries.Italy.c = proj([12.5, 42.8]);
out.countries.Spain.c = proj([-3.7, 40.2]);
out.grat = path(geoGraticule10());
fs.writeFileSync('../src/geo.json', JSON.stringify(out));
console.log(Object.fromEntries(Object.entries(out.countries).map(([k, v]) => [k, v.c.map(Math.round)])), out.land.length);
