# statsnz_comp


This app was developed for the StatsNZ "There and back again" [data visualisation competition](https://www.stats.govt.nz/2018-census/there-and-back-again-data-visualisation-competition/). It visualises data from the 2018 NZ Census (travel for work & education) by overlaying selected data as "hops" on a map. Each hop's thickness is proportional to the number of people travelling between the areas at either end of the "hop".

All rights reserved, Darren Bruning, 2020

Contact: [darren@bruning.net.nz](mailto:darren@bruning.net.nz)

Source code: [github](https://github.com/dbruning/statsnz-comp-2020)

## Data sources

*   [Work & Education datasets](https://datafinder.stats.govt.nz/data/category/census/2018/commuter-view/) are from statsNZ
*   New Zealand map is [Statistical Area 2 2018 Generalised](https://datafinder.stats.govt.nz/layer/92212-statistical-area-2-2018-generalised/) (also from statsNZ) but has been simplified for performance with [mapshaper.org](https://mapshaper.org)

## Major components

*   [Three.js](https://threejs.org/) for visualisation (map and hops)
*   [Papa Parse](https://www.papaparse.com/) for download & parsing of csv data
*   [topojson-client](https://github.com/topojson/topojson-client) and [d3.js](https://d3js.org/) for processing of map data
*   [Vue.js](https://vuejs.org/), [BootstrapVue](https://bootstrap-vue.org) and [Bootstrap](https://getbootstrap.com/) for application framework.


## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
