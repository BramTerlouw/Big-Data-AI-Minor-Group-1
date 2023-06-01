import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

// Initial state
const getDefaultState = () => {
    return {
        user_id: 0,
        logged_in: false,
        name_coach: "",
        name_athlete: "",
        location: "",
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
    SET_NAME_COACH: (state, coach) => {
        state.name_coach = coach
    },
    SET_NAME_ATHLETE: (state, athlete) => {
        state.name_athlete = athlete
    },
    SET_LOCATION: (state, location) => {
        state.location = location
    },
    RESET_GAME_DATA: (state) => {
      state.name_coach = "";
      state.name_athlete = "";
      state.location = "";
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
    },
    getNameCoach: state => {
        return state.name_coach
    },
    getNameAthlete: state => {
        return state.name_athlete
    },
    getLocation: state => {
        return state.location
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
    setNameCoach: ({ commit }, coach) => {
        commit('SET_NAME_COACH', coach)
    },
    setNameAthlete: ({ commit }, ahtlete) => {
        commit('SET_NAME_ATHLETE', ahtlete)
    },
    setLocation: ({ commit }, location) => {
        commit('SET_LOCATION', location)
    },
    resetGameData: ({ commit}) => {
        commit('RESET_GAME_DATA')
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