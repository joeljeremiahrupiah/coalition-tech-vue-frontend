import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from "element-plus";
import ViewUIPlus from 'view-ui-plus'

import "element-plus/dist/index.css";
import 'view-ui-plus/dist/styles/viewuiplus.css'


const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(ViewUIPlus)

app.mount('#app')
