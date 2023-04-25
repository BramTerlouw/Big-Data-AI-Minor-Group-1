import { Component } from '@angular/core';

@Component({
  selector: 'app-c-training-stream',
  templateUrl: './c-training-stream.component.html',
  styleUrls: ['./c-training-stream.component.scss'],
})
export class CTrainingStreamComponent {

  public stream_started: Boolean = false;

  // private client: any;
  // private janusUrl = '';
  // private roomID = 123;
  // private feedID = 456;
  // private publisherHandle: any;

  // ngOnInit() {
  //   const JanusClient = require('janus-videoroom-client').Janus;

  //   this.client = new JanusClient({
  //     url: this.janusUrl
  //   });

  //   this.client.onConnected(() => {
  //     console.log('Connected to Janus server.');
  //     this.client.createSession().then((session: any) => {
  //       session.videoRoom().createVideoRoomHandle().then((videoRoomHandle: any) => {
  //         videoRoomHandle.join({
  //           room: this.roomID,
  //           ptype: 'publisher',
  //           display: 'My Stream',
  //           pin: '****' // use your pin here if required
  //         }).then((publisherHandle: any) => {
  //           console.log('Joined the room as a publisher.');

  //           // set the stream constraints (you may need to adjust these)
  //           const constraints = {
  //             audio: true,
  //             video: {
  //               width: { ideal: 1280 },
  //               height: { ideal: 720 },
  //               frameRate: { ideal: 30 }
  //             }
  //           };

  //           // get the user's media stream
  //           navigator.mediaDevices.getUserMedia(constraints).then((stream: MediaStream) => {
  //             // attach the user's media stream to the publisher handle
  //             publisherHandle.publish(stream).then(() => {
  //               console.log('Started publishing the stream.');
  //               this.stream_started = true;
  //             })
  //             .catch((error: any) => {
  //               console.error('Error publishing the stream:', error);
  //             });
  //           })
  //           .catch((error: any) => {
  //             console.error('Error getting user media:', error);
  //           });

  //           this.publisherHandle = publisherHandle;
  //         }).catch((error: any) => {
  //           console.error('Error joining the room as a publisher:', error);
  //         });
  //       }).catch((error: any) => {
  //         console.error('Error creating a video room handle:', error);
  //       });
  //     }).catch((error: any) => {
  //       console.error('Error creating a Janus session:', error);
  //     });
  //   });

  //   this.client.onDisconnected(() => {
  //     console.log('Disconnected from Janus server.');
  //   });

  //   this.client.onError((error: any) => {
  //     console.error('Janus error:', error);
  //   });
  // }

  // ngOnDestroy() {
  //   if (this.publisherHandle) {
  //     this.publisherHandle.unpublish();
  //     this.publisherHandle.leave();
  //   }

  //   this.client.destroy();
  // }

  setStreamStarted = () => {
    this.stream_started = !this.stream_started;

    if (this.stream_started)
      this.demo_terminal()
  }

  getRecColor = () => {
    if (this.stream_started) {
      return 'danger';
    }
    else {
      return 'light';
    }
  }

  demo_terminal = () => {
    let terminal = document.getElementById('terminal');
    var entry = document.createElement('li');

    entry.style.color = 'white';
    entry.style.margin = '0 0 5px 0';
    entry.appendChild(document.createTextNode('Possible Intersect.'));

    if (terminal) terminal.appendChild(entry);
  }
}
