<script>
export default {
  data() {
    return {
      pictureTaken: false,
      pictureProcessing: false,
      pictureApproved: true,
      imgDataURL: ''
    };
  },
  mounted() {
    this.setupCamera();
  },
  methods: {
    submitForm(event) {
      event.preventDefault();
      this.$router.push("/stream");
    },
    setupCamera() {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          this.$refs.video.srcObject = stream;
        })
        .catch((error) => {
          console.log('Error accessing the camera:', error);
        });
    },
    capture() {
      const video = this.$refs.video;
      const canvas = this.$refs.canvas;

      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imgDataURL = canvas.toDataURL('image/png');
      
      this.pictureTaken = true;
    },
    retry() {
      this.imgDataURL = '';
      this.pictureTaken = false;
    }
  },
};
</script>

<template>
  <section id="container">
    <div class="verify-wrapper">
      <div class="heading">
        <p class="heading-title">Step 1: Start training</p>
      </div>

      <div class="position-info">
        <ol>
          <li>Athlete takes position conform guidelines.</li>
          <li>Take picture of positioning.</li>
          <li>Wait for image to be processed.</li>
          <li>Retry at faulty image or continue.</li>
        </ol>
      </div>

      <div
        class="proccessing-info"
        :class="{
          'container-faulty-pos':
            pictureTaken && !pictureProcessing && !pictureApproved,
          'container-processing-pos': pictureTaken && pictureProcessing,
          'container-approved-pos': pictureTaken && pictureApproved,
        }"
      >
        <p>
          Picture status:
          <span
            class="picture-status"
            :class="{
              'status-faulty-pos':
                pictureTaken && !pictureProcessing && !pictureApproved,
              'status-processing-pos': pictureTaken && pictureProcessing,
              'status-approved-pos': pictureTaken && pictureApproved,
            }"
            >No picture</span
          >
        </p>
      </div>

      <div class="camera-press">
        <button v-if="!pictureTaken" @click="capture">Take picture</button>

        <span v-if="!pictureTaken" class="camera-press-info">Press to take picture</span>
      </div>

      <div class="button-section" v-if="pictureTaken && !pictureProcessing">
        <button @click="retry">Retry</button>
        <button
          @click="submitForm"
          :class="{
            'disabled-btn': pictureTaken && !pictureProcessing && !pictureApproved,
          }"
        >
          Continue
        </button>
      </div>
    </div>

    ->

    <div class="image-wrapper">
      <video :style="{ display: pictureTaken ? 'none' : 'block' }" ref="video" width="400" height="300" autoplay></video>
      <canvas :style="{ display: pictureTaken ? 'block' : 'none' }" ref="canvas" width="400" height="300"></canvas>
    </div>
  </section>
</template>

<style scoped>
#container {
  width: 100vw;
  height: 100%;

  display: flex;
  flex-direction: row;
  gap: 20px;
  align-items: center;
  justify-content: center;
}

.verify-wrapper {
  padding: 5px 15px 10px 15px;
  background-color: #e0e0e0;
}

.heading {
  padding: 5px 0;
  border-bottom: 1px solid #3db0f0;
}

.heading-title {
  font-style: italic;
  font-size: 14px;
  color: darkgrey;
}

.position-info {
  margin: 10px 20px;

  color: darkgray;
  font-style: italic;
  font-size: 12px;
}

.position-info ol {
  padding: 0;
}

.proccessing-info {
  margin: 20px 0;
  padding: 5px;
  background-color: #ffffff;
  border-radius: 2px;
}

.proccessing-info p {
  font-weight: bold;
}

.picture-status {
  font-weight: 400;
  font-style: italic;
}

.camera-press {
  margin: 20px 0 0 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.camera-press-info {
  font-size: 12px;
  font-style: italic;
}

.button-section {
  width: 100%;
  margin: 40px auto 10px auto;
  display: flex;
  justify-content: space-between;
}

.button-section button {
  width: 100px;
  padding: 5px;
  background-color: #3db0f0;
  border: none;
  color: #fff;
  cursor: pointer;
}

.image-wrapper {
  display: grid;
  place-items: center;
}

.container-faulty-pos {
  border: 1px solid red;
  background-color: #ffd2d2;
}

.container-processing-pos {
  border: 1px solid orange;
}

.container-approved-pos {
  border: 1px solid green;
}

.status-faulty-pos {
  color: red;
  font-weight: 600;
}

.status-processing-pos {
  color: orange;
  font-weight: 600;
}

.status-approved-pos {
  color: green;
  font-weight: 600;
}

.disabled-btn {
  background-color: #86d1fb !important;
  pointer-events: none;
}
</style>
