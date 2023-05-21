<script>
import axios from 'axios';

export default {
  data() {
    return {
      pictureTaken: false,
      pictureProcessing: false,
      pictureApproved: false,
      imgDataURL: '',
      message: '',
      room: '',
      session: ''
    };
  },
  mounted() {
    this.setupCamera();
  },
  methods: {
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
      this.uploadImage()
    },
    uploadImage() {
      const formData = new FormData();
      const imageFile = this.dataURLtoFile(this.imgDataURL, 'image.png');
      formData.append('file', imageFile);
      formData.append('user_id', 3)

      this.pictureProcessing = true;

      axios.post('http://localhost:8081/api/v1/session/verify', formData)
        .then(response => {
          console.log('approved!')
          this.pictureProcessing = false;
          this.pictureApproved = true;
          
          let data = response.data;
          this.message = data['message'];
          this.room = data['room'];
          this.session = data['sessionCode'];
        })
        .catch(error => {
          this.pictureProcessing = false;
          console.error('Error uploading image:', error);
        });
    },
    dataURLtoFile(dataURL, filename) {
      const arr = dataURL.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    },
    startSession() {
      axios.post('http://localhost:8081/api/v1/session/start/' + this.session)
        .then(response => {
          console.log(response)
          this.$router.push("/stream?room=" + this.room + '&sessionCode=' + this.session);
        })
        .catch(error => {
          console.error('Error starting session:', error);
        });
    },
    retry() {
      this.imgDataURL = '';
      this.pictureTaken = false;
    },
    getPictureStatus() {
      if (!this.pictureTaken)
        return 'No picture'
      else if (this.pictureProcessing)
        return 'Processing ...'
      else if (this.pictureTaken && this.pictureApproved)
        return 'Position approved!'
      else
        return 'Wrong Position'
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
            >{{ getPictureStatus() }}</span
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
          @click="startSession"
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
  height: calc(100vh - 5vh);

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
  margin: 0;
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
  margin: 0;
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
