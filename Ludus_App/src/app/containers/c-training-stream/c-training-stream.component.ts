import { Component } from '@angular/core';

@Component({
  selector: 'app-c-training-stream',
  templateUrl: './c-training-stream.component.html',
  styleUrls: ['./c-training-stream.component.scss'],
})
export class CTrainingStreamComponent {

  public stream_started: Boolean = false;

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
