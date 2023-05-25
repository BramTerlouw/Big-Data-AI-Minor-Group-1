<script setup>
import NavBar from "../components/NavBar.vue";
import SessionFeed from "../components/SessionFeed.vue";
// import StreamFeed from "@/components/StreamFeed";

// window.customElements.define('stream-feed', StreamFeed)
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

<!--    <stream-feed></stream-feed>-->
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
</style>
