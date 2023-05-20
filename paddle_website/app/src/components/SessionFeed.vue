<script>
import SessionCard from "./SessionCard.vue";

export default {
  components: {
    SessionCard,
  },
  data() {
    return {
      data: [
        {
          id: 1,
        },
        {
          id: 2,
        },
      ],
    };
  },
  methods: {
    fetchData() {
      axios
        .get("https://api.example.com/data")
        .then((response) => {
          this.data = response.data;
        })
        .catch((error) => {
          console.error(error);
        });
    },
  },
};
</script>

<template>
  <section class="feed">
    <SessionCard v-for="item in data" :key="item.id" />
  </section>
</template>

<style scoped>
.feed {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 20px;
}
</style>
