import "./assets/main.css";
import {createApp} from "vue";
import store from './store'
import router from "./router";
import axios from 'axios';
import App from "./App.vue";
import StreamFeed from "./components/StreamFeed.js";

window.customElements.define('stream-feed', StreamFeed)

axios.defaults.baseURL = 'http://localhost:8081/api/v1'
const app = createApp(App)


const DEFAULT_TITLE = 'Paddle';

router.beforeEach((to, from, next) => {
    document.title = DEFAULT_TITLE + " | " + to.meta.title || DEFAULT_TITLE;

    if (to.path === '/') {
        if (!store.getters.isLoggedIn) {
            next({ name: 'login' });
        }else {
            next({name: 'dashboard'})
        }
    }

    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!store.getters.isLoggedIn) {
            next({name: 'login'})
        }
    }

    if (to.matched.some(record => record.meta.hideForAuth)) {
        if (store.getters.isLoggedIn) {
            next({name: 'dashboard'})
        }
    }

    next()

})

app.use(store) // use your store
app.use(router)
app.mount('#app')
