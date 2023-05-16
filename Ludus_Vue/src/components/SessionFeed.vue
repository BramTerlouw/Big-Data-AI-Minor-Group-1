<script setup>
import SessionCard from "./SessionCard.vue";
</script>

<template>
  <section class="feed">
    <SessionCard />
    <SessionCard />
  </section>
</template>

<style scoped>
.feed {
    display: flex;
}
</style>
