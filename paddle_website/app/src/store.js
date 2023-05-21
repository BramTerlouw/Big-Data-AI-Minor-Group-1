import { createStore } from 'vuex'

// initial state
const state = () => ({
    user_id: 0,
    logged_in: false
})

// getters
const getters = {
    isLoggedIn: state => {
        return state.logged_in
    },
    getUserId: state => {
        return state.user_id
    }
}

// mutations
const mutations = {
    SET_LOGGED_IN: (state, status) => {
        state.logged_in = status
    },
    SET_USER_ID: (state, user_id) => {
        state.user_id = user_id
    }
}

// actions
const actions = {
    setLoggedIn: ({ commit }, status) => {
        commit('SET_LOGGED_IN', status)
    },
    setUserId: ({ commit }, user_id) => {
        commit('SET_USER_ID', user_id)
    }
}

export default createStore({
    state,
    getters,
    mutations,
    actions
})