import "./assets/main.css";
import store from './store';
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import axios from 'axios';
import Vuex from 'vuex';
axios.defaults.baseURL = 'http://localhost:8081'


createApp(App).use(router).use(store).use(Vuex).mount('#app')
