import "./assets/main.css";
import { createApp } from "vue";
import store from './store'
import router from "./router";
import axios from 'axios';

import App from "./App.vue";

axios.defaults.baseURL = 'http://localhost:8081'
const app = createApp(App)

app.use(store) // use your store
app.use(router)
app.mount('#app')
