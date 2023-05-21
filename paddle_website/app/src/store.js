import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
export default new Vuex.Store({
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