<script setup>
import NavBar from "../components/NavBar.vue";
import SessionFeed from "../components/SessionFeed.vue";
</script>

<template>
  <div class="page">
    <NavBar />
    <main class="main">
      <header>
        <h1>Recent sessions</h1>
        <p>A brief summary of previous sessions.</p>
      </header>
      <SessionFeed />
    </main>
  </div>
</template>

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
</style>
