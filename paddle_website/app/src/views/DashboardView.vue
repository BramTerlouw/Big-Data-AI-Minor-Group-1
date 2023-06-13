<template>
  <div class="page">
    <NavBar />
    <main class="main">
      <header>
        <h1>Recent sessions</h1>
        <p>A brief summary of previous sessions.</p>
      </header>
      <div class="redirect-modal">
        <h1>
          Session finished
        </h1>
        <p>You will be redirected in a few seconds</p>
        <span id="countdown"></span>
      </div>
      <SessionFeed />
    </main>
  </div>
</template>

<script>
import NavBar from "../components/NavBar.vue";
import SessionFeed from "../components/SessionFeed.vue";

export default {
  components: {
    NavBar,
    SessionFeed,
  },
  mounted() {
    this.countdown();
  },
  methods: {
    countdown() {
      var span = document.getElementById("countdown");
      var count = 5;

      var interval = setInterval(() => {
        span.textContent = count;
        count--;

        if (count < 0) {
          clearInterval(interval);
          span.textContent = "Countdown Complete!";
        }
      }, 1000);
    },
  },
};
</script>

<style scoped>
.page {
  display: flex;
  flex-direction: row;
}

header {
  margin: 0 0 0 20px;
}

h1 {
  margin-bottom: 0;
}

.redirect-modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  padding: 10px;

  border: 1px solid black;
  border-radius: 5px;
}

.redirect-modal h1 {
  margin: 0;
}
</style>
