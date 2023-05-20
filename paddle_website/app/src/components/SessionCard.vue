<script>
export default {
  props: ["session", "blob"],
};
</script>

<template>
  <div class="card">
    <img :src="blob" alt="img" />
    <div class="text-wrapper">
      <p>Session: {{ session }}</p>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 150px;

  display: flex;
  flex-direction: column;

  font-size: 12px;
  border: 1px solid darkgray;
  background-color: white;
}

img {
  width: 125px;
  height: 125px;
  margin: 10px auto;
}

.text-wrapper {
  margin: 0 0 0 15px;
  color: black;
}
</style>
