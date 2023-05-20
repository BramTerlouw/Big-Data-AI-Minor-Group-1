import "./assets/main.css";

import { createApp } from "vue";
import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

import App from "./App.vue";
import router from "./router";

const store = createStore({
  state() {
    return {
      loggedIn: false,
      user_id: "11",
    };
  },
  mutations: {
    login(state) {
      state.loggedIn = true;
    },
    logout(state) {
      state.loggedIn = false;
    },
    setUserId(state, user_id) {
      state.user_id = user_id
    }
  },
  plugins: [createPersistedState()],
});

const app = createApp(App);

app.use(router);
app.use(store);

app.mount("#app");
