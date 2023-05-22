import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

// Initial state
const getDefaultState = () => {
    return {
        user_id: 0,
        logged_in: false
    }
}


// Mutations
const mutations = {
    SET_LOGGED_IN: (state, status) => {
        state.logged_in = status
    },
    SET_USER_ID: (state, user_id) => {
        state.user_id = user_id
    },
    RESET: state => {
        Object.assign(state, getDefaultState());
    }
}

// Getters
const getters = {
    isLoggedIn: state => {
        return state.logged_in
    },
    getUserId: state => {
        return state.user_id
    }
}

// Actions
const actions = {
    setLoggedIn: ({ commit }, status) => {
        commit('SET_LOGGED_IN', status)
    },
    setUserId: ({ commit }, user_id) => {
        commit('SET_USER_ID', user_id)
    },
    logout: ({ commit }) => {
        commit('RESET', '');
    }
}

export default createStore({
    strict: true,
    state: getDefaultState(),
    getters,
    mutations,
    actions,
    plugins: [createPersistedState()]
})