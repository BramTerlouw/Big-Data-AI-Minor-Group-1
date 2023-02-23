import json
from ultralytics import YOLO
from numpy import ndarray
import numpy
from typing import Union

from Distance import Distance
distance = Distance()

from Debug import Debug
debug = Debug()

class Score:

    # Extra note !!!PLEASE USE OBJECT TYPE HINTING!!! and make file name same as class.
    def __init__(self):
        print('init')
    

    @classmethod
    def _load_model(cls, model_name: str) -> YOLO:
        if model_name:
            return YOLO(model_name)
        else:
            raise ValueError("Model not found: " + model_name)
    

    def _class_id_to_label(
        self,
        classes,
        class_id: int
    ) -> str:
        return classes[class_id]


    def score_frame(
        self,
        frame,
        classes,
        detection_output
    ) -> Union[ndarray, ndarray]:

        bounding_box_data_result = detection_output[0].cpu()
        dict_coordinates = {}

        for result in bounding_box_data_result:
            boxes = result.boxes
            box = boxes[0]

            class_id = box.cls.numpy()[0]
            confidence = box.conf.numpy()[0]
            bounding_box = box.xyxy.numpy()[0]

            if class_id in dict_coordinates:
                dict_coordinates[class_id].append(bounding_box)
            else:
                dict_coordinates[class_id] = [bounding_box]

            self._plot_boxes(frame, bounding_box, confidence, self._class_id_to_label(classes, class_id))

        self.process_score(frame, dict_coordinates)
        return frame
    

    @classmethod
    def process_score(
        cls,
        frame: numpy.ndarray,
        coordinates: dict
    ) -> Union[ndarray, ndarray]:

        padel_width = distance.calc_width_paddle(coordinates[0])
        distance.get_distance_humans(frame, padel_width, coordinates[1])
        distance.set_player_pos(frame, coordinates)
        distance.get_distance(frame, padel_width, coordinates[0], coordinates[1])
        
        return frame
    

    def _plot_boxes(
        self,
        frame: numpy.ndarray,
        bounding_box: numpy.ndarray,
        confidence: numpy.float32,
        class_id: int
    ) -> Union[ndarray, ndarray]:

        if class_id == 0:
            debug.draw_paddle(
                frame,
                int(bounding_box[0]),
                int(bounding_box[1]),
                int(bounding_box[2]),
                int(bounding_box[3])
            )
            debug.draw_text(
                frame, 
                f"Label: {class_id}",
                int(bounding_box[0]),
                int(bounding_box[1]),
                0.5,
                (153, 204, 0),
                2
            )
        else:
            debug.draw_human(
                frame,
                int(bounding_box[0]),
                int(bounding_box[1]),
                int(bounding_box[2]),
                int(bounding_box[3])
            )
            debug.draw_text(
                frame, 
                f"Label: {class_id}",
                int(bounding_box[0]),
                int(bounding_box[1]),
                0.5,
                (0, 255, 0),
                2
            )
        return frame
    

    @classmethod
    def calculate_score(cls):
        print('aveage score')


    @classmethod
    def serialize(cls, scores: dict) -> print():
        return print(json.dumps(
            scores
        ))
