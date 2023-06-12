<script>
export default {
  props: ["data"],
  data() {
    return {
        show: false,
    };
  },
  methods: {
    toggle() {
      this.show = !this.show
    }
  }
};
</script>

<template>
  <div class="card-wrapper">
    <div class="card" @click="toggle">
      <img :src="data['picture']" alt="img" />
      <div class="text-wrapper">
        <label class="text_header">Session Date</label>
        <p class="text-date">{{ data['uploadDate'].substring(0, data['uploadDate'].indexOf("T"))}}</p>
      </div>
    </div>

    <div :style="{display: show ? 'block' : 'none'}" class="card card-details">
      <ul>
        <li><span class="list-label">Athlete</span>: {{data['game_data']['athlete_name']}}</li>
        <li><span class="list-label">Coach</span>: {{data['game_data']['coach_name']}}</li>
        <li><span class="list-label">Location</span>: {{data['game_data']['location']}}</li>
        <li><span class="list-label">Date</span>: {{ data['uploadDate'].substring(0, data['uploadDate'].indexOf("T")) }}</li>
        <li><span class="list-label">Time</span>: {{ data['uploadDate'].substring(data['uploadDate'].indexOf("T") + 1, data['uploadDate'].indexOf("."))}}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.card-wrapper {
  display: flex;
  gap: 10px;
}
.card {
  width: 150px;

  display: flex;
  flex-direction: column;

  font-size: 12px;
  border: 1px solid lightgrey;
  border-radius: 5px;
  background-color: white;
  box-shadow: 5px 5px 5px lightgrey;
}

.card-details {
  padding: 10px;
}

ul, li {
margin: 0;
padding: 0;
}

li {
  list-style-type: none;
  font-style: italic;
}

.list-label {
  font-style: normal;
  font-weight: bold;
  color: #317eac;
}

.text_header {
  color: #317eac;
  margin: 0;
}

.text-date {
  color: lightgrey;
  font-style: italic;
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
