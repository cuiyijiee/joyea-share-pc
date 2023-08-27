const state = {
    token: "",
    name: "",
    email: "",
    isAdmin:false
};

const getters = {
    userInfo: function (state) {
        return {
            token:state.token,
            name:state.name,
            email:state.email,
            isAdmin:state.isAdmin
        }
    },
}

const mutations = {
    refreshSession(state, newToken) {
        state.token = newToken
    },
    cleanSession(state) {
        state.token = ""
    },
    updateUserInfo(state, userInfo) {
        state.token =  userInfo.token;
        state.name =  userInfo.name;
        state.email =  userInfo.email;
        state.isAdmin = userInfo.isAdmin
    },
};


const actions = {
    clearUserSessionFunc(state) {
        state.commit("cleanSession")
    },
    updateUserInfoFunc(state, userInfo) {
        state.commit("updateUserInfo", userInfo)
    },
    refreshSessionFunc(state, token) {
        state.commit("refreshSession", token)
    },
};

export default {
    namespaced: true,
    state,
    getters,
    mutations,
    actions
}