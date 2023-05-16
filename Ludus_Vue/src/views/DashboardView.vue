<script setup>
import NavBar from "../components/NavBar.vue";
import SessionFeed from "../components/SessionFeed.vue";
</script>

<template>
  <div class="page">
    <NavBar />
    <SessionFeed />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: row;
}
</style>
