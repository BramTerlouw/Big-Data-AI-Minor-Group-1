import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';

const getDefaultState = () => {
    return {
        user_id: 0,
        logged_in: false
    };
};
export default new Vuex.Store({
    strict: true,
    plugins: [createPersistedState()],
    state: getDefaultState(),
    getters: {
        isLoggedIn: state => {
            return state.logged_in;
        },
        getUserId: state => {
            return state.user_id;
        }
    },
    mutations: {
        SET_LOGGED_IN: (state, status) => {
            state.logged_in = status;
        },
        SET_USER_ID: (state, user_id) => {
            state.user_id = user_id;
        },
        RESET: state => {
            Object.assign(state, getDefaultState());
        }
    },
    actions: {
        setLoggedIn: ({ commit, dispatch }, { status }) => {
            commit('SET_LOGGED_IN', status);
        },setUserId: ({ commit, dispatch }, { user_id }) => {
            commit('SET_USER_ID', user_id);
            // set auth header
        },
        logout: ({ commit }) => {
            commit('RESET', '');
        }
    }
});