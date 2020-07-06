import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

import VueStatic from 'vue-static'
Vue.use(VueStatic);


new Vue({
  render: h => h(App),
}).$mount('#app')
