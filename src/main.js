import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false


// https://bootstrap-vue.org/docs
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
// Vue.use(IconsPlugin)

// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'

// Import our custom scss file
// import './custom.scss'

import VueStatic from 'vue-static'
Vue.use(VueStatic);


new Vue({
  render: h => h(App),
}).$mount('#app')
