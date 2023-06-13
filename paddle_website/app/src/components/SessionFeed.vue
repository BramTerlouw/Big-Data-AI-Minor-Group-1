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
            return this.$store.getters.getUserId
        },
        filteredData () {
          return this.data.filter(item => item['status'] === 'Processed')
        }
    },
    data() {
        return {
            data: [],
        };
    },
    methods: {
        fetchData() {
          axios.get("/session/results/" + this.userid)
              .then((response) => {
                if (response.status === 200) {
                  this.data = response.data;
                } else {
                  this.data = [];
                }
              })
              .catch((error) => {
                if (error.response && error.response.status === 404) {
                  this.data = []; // Set data to empty array for 404 Not Found
                } else {
                  console.error(error);
                }
              });
        },
    },
};
</script>

<template>
  <section class="feed">
    <SessionCard
        v-for="item in filteredData"
        :key="item.id"
        :data="item"/>
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
