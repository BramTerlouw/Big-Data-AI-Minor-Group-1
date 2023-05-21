<script>
import axios from 'axios';
import SessionCard from "./SessionCard.vue";

export default {
  components: {
    SessionCard,
  },
  mounted() {
    this.fetchData()
  },
    computed: {
        userid () {
            return this.$store.getters.getUserId()
        }
    },
  data() {
    return {
      data: [],
    };
  },
  methods: {
    fetchData() {
      axios
        .get("http://localhost:8081/api/v1/session/results/"+ this.userid)
        .then((response) => {
          this.data = response.data;
          // console.log(this.data[0]['picture'])
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
    <SessionCard v-for="item in data" :key="item.id" :session="item['session_key']" :blob="item['picture']" />
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
