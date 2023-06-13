<script>
export default {
  data() {
    return {
      name_coach: "",
      name_athlete: "",
      location: "",
      error_coach: false,
      error_athlete: false,
      error_location: false,
    };
  },
  methods: {
    submitForm(event) {
      event.preventDefault();
      this.resetErrors();

      if (this.name_coach === "")
        this.error_coach = true;

      if (this.name_athlete === "")
        this.error_athlete = true;

      if (this.location === "")
        this.error_location = true;

      if (this.error_coach || this.error_athlete || this.error_location)
        return

      this.$store.commit('SET_NAME_COACH', this.name_coach)
      this.$store.commit('SET_NAME_ATHLETE', this.name_athlete)
      this.$store.commit('SET_LOCATION', this.location)

      this.$router.push({name: 'verify position'});
    },
    resetErrors() {
      this.error_coach = false;
      this.error_athlete = false;
      this.error_location = false;
    }
  },
};
</script>

<template>
  <section id="container">
    <div class="form-wrapper">
      <div class="heading">
        <p class="heading-title">Step 1: Start training</p>
      </div>

      <form class="form" @submit="submitForm">
        <div class="form-item">
          <label>Name coach:</label>
          <input type="text" v-model="name_coach" />
          <p v-if="error_coach" class="error-msg">Must enter a user ID!</p>
        </div>

        <div class="form-item">
          <label>Name Athlete:</label>
          <input type="text" v-model="name_athlete" />
          <p v-if="error_athlete" class="error-msg">Must enter a user ID!</p>
        </div>

        <div class="form-item">
          <label>Location:</label>
          <input type="text" v-model="location" />
          <p v-if="error_location" class="error-msg">Must enter a user ID!</p>
        </div>

        <button type="submit">Start</button>
      </form>
    </div>
  </section>
</template>

<style scoped>
#container {
  width: 100vw;
  height: calc(100vh - 5vh);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.form-wrapper {
  padding: 5px 15px 10px 15px;
  width: 250px;

  background-color: #e0e0e0;
}

.heading {
  padding: 5px 0;
  border-bottom: 1px solid #3db0f0;
}

.heading-title {
  font-style: italic;
  font-size: 14px;
  color: darkgrey;
}

.form,
.form-item {
  display: flex;
  flex-direction: column;
}

.form-item {
  margin: 5px 0 10px 0;
}

.form-item label {
  color: #3db0f0;
  font-weight: bold;
}

.form-item input {
  border-radius: 3px;
  border: 1px solid lightgray;
  padding: 3px;
}

.form button {
  padding: 5px;
  background-color: #3db0f0;
  border: none;
  color: #fff;
}

.error-msg {
  margin: 0;
  color: red;
  font-style: italic;
  font-size: 14px;
}
</style>
