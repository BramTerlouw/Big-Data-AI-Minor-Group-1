import "./assets/main.css";
import store from './store';
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import axios from 'axios';
axios.defaults.baseURL = 'http://localhost:8081'

App.use(store) // use your store

App.mount('#app')
