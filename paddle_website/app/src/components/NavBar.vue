<script></script>

<template>
  <div class="sidebar">
    <ul>
      <li>
        <router-link to="/create-training">Start Training</router-link>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.sidebar {
  background-color: #f2f2f2;
  width: 200px;
  height: calc(100vh - 5vh);
  padding: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

li {
  margin-bottom: 10px;
}

a {
  text-decoration: none;
  color: #333;
}
</style>
