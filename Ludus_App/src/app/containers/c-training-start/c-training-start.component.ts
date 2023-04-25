import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-c-training-start',
  templateUrl: './c-training-start.component.html',
  styleUrls: ['./c-training-start.component.scss'],
})
export class CTrainingStartComponent implements OnInit {
  @Output() stepEmitter: EventEmitter<any> = new EventEmitter()

  myForm!: FormGroup;

  constructor(
    private fb: FormBuilder) { }

  ngOnInit() {
    this.myForm = this.fb.group({
      name_coach: ['', [Validators.required]],
      name_athlete: ['', [Validators.required]],
      name_training: ['', [Validators.required]]
    });
  }

  public emitValue() {
    this.stepEmitter.emit('check');
  }

}
