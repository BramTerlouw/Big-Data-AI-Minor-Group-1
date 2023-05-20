<script>
export default {
  data() {
    return {
      name_coach: "",
      name_athlete: "",
      location: "",
    };
  },
  methods: {
    submitForm(event) {
      event.preventDefault();
      this.$router.push("/verify-position");
    },
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
        </div>

        <div class="form-item">
          <label>Name Athlete:</label>
          <input type="text" v-model="name_athlete" />
        </div>

        <div class="form-item">
          <label>Location:</label>
          <input type="text" v-model="location" />
        </div>

        <button type="submit">Start</button>
      </form>
    </div>
  </section>
</template>

<style scoped>
#container {
  width: 100vw;
  height: 100vh;

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
</style>
