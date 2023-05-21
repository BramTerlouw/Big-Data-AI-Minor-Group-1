import Vuex from 'vuex';

const getDefaultState = () => {
    return {
        user_id: 0,
        logged_in: false
    };
};
export default new Vuex.Store({
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
        logout: ({ commit }) => {
            commit('RESET', '');
        }
    }
});