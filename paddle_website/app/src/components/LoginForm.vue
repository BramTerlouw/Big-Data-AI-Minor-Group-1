<script>
import store from "@/store";

export default {
  data() {
    return {
      inputValue: '',
      error: false
    };
  },
  methods: {
    submitForm(event) {
      event.preventDefault();
      if (this.inputValue === '') {
        this.error = true;
        return;
      }

        let userid = this.inputValue
        let status = true
        store.commit('SET_USER_ID', userid)
        store.commit('SET_LOGGED_IN', status)
      this.$router.push('/dashboard')
    }
  }
};
</script>

<template>
  <div class="form-wrapper">
    <div class="heading">
      <p class="heading-title">Login to the dashboard</p>
    </div>

    <form class="form" @submit="submitForm">
      <div class="form-item">
        <label>User ID</label>
        <input type="text" v-model="inputValue" />
        <p v-if="error" class="error-msg">Must enter a user ID!</p>
      </div>
      
      <button type="submit">Submit</button>
    </form>
  </div>
</template>

<style scoped>

.heading {
  padding: 5px 0;
  border-bottom: 1px solid #3DB0F0;
}

.heading-title {
  font-style: italic;
  font-size: 14px;
  color: darkgrey;
}

.form-wrapper {
  padding: 5px 15px 10px 15px;
  width: 250px;

  display: flex;
  flex-direction: column;

  border-radius: 5px;
  background-color: #E0E0E0;
}

.form, .form-item {
    display: flex;
    flex-direction: column;
}

.form-item {
    margin: 5px 0 10px 0;
}

.form-item label {
  color: #3DB0F0;
  font-weight: bold;
}

.form-item input {
  border-radius: 3px;
  border: 1px solid lightgray;
  padding: 3px;
}

.form button {
  padding: 5px;
  background-color: #3DB0F0;
  border: none;
  color: #fff;
}

.error-msg {
  color: red;
  font-style: italic;
  font-size: 14px;
}
</style>
