import "./assets/main.css";
import store from './store';
import { createApp } from "vue";
import router from "./router";
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8081'
import App from "./App.vue";
const app = createApp(App);



app.use(store) // use your store
app.use(router)
app.mount('#app')
