<script setup>
import LoginForm from "../components/LoginForm.vue";
</script>

<template>
  <div id="container">
    <LoginForm />
  </div>
</template>

<style scoped>
  #container {
    width: 100vw;
    height: calc(100vh - 5vh);

    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>