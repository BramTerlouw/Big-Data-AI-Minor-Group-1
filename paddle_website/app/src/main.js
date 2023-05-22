import "./assets/main.css";
import { createApp } from "vue";
import store from './store'
import router from "./router";
import axios from 'axios';

import App from "./App.vue";

axios.defaults.baseURL = 'http://localhost:8081/api/v1'
const app = createApp(App)



const DEFAULT_TITLE = 'Paddle';





router.beforeEach((to, from, next) => {
    document.title = DEFAULT_TITLE + " | " + (to.meta.title || DEFAULT_TITLE);
    // Check if the route requires authentication
    console.log(store)

    //
    // if (!store.getters.logged_in) {
    //     console.log(1)
    //     // Redirect to the login page if not logged in
    //     next({ name: 'login' });
    // }
    console.log(store.getters.logged_in)
    if (to.matched.some(record => record.meta.requiresAuth)){

        if (!store.getters.logged_in) {
            // Redirect to the login page if not logged in
            console.log(3)
            next({ name: 'login' });
        }
    }

    if (to.matched.some(record => !record.meta.requiresAuth)){

        if (store.getters.logged_in) {
            // Redirect to the login page if not logged in
            console.log(3)
            next({ name: 'dashboard' });
        }
    }




    console.log(4)
    next()
});

app.use(store) // use your store
app.use(router)
app.mount('#app')
