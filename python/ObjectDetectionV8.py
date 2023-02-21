from typing import Union

import cv2
import numpy
import torch
from numpy import ndarray
from ultralytics import YOLO

from Distance import Distance
distance = Distance()

from Debug import Debug
debug = Debug()

class ObjectDetectionV8:
    __instance = None

    def __init__(self):
        if ObjectDetectionV8.__instance is not None:
            raise Exception("Singleton instance already exists. Use get_instance() method to get the instance.")
        else:
            self.model_name = 'model/YOLOv8/paddle_and_human_yolov8m_v2.pt'
            self.model = self._load_model(self.model_name)
            self.classes = self.model.names
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            ObjectDetectionV8.__instance = self

    @classmethod
    def get_instance(cls) -> 'ObjectDetectionV8':
        if ObjectDetectionV8.__instance is None:
            ObjectDetectionV8()
        return ObjectDetectionV8.__instance

    def _class_id_to_label(
            self,
            class_id: int
    ) -> str:
        return self.classes[class_id]

    @classmethod
    def _load_model(cls, model_name: str) -> YOLO:
        if model_name:
            return YOLO(model_name)
        else:
            raise ValueError("Model not found: " + model_name)

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
            f"Label: {self._class_id_to_label(class_id)}",
            int(bounding_box[0]),
            int(bounding_box[1]),
            0.5,
            (0, 0, 255),
            2
        )
        return frame

    @classmethod
    def process_score(
        cls,
        frame: numpy.ndarray,
        scores: dict
    ):
        distance.calc_distance(frame, scores[0], scores[1])
        return frame

    def score_frame(
            self,
            frame: numpy.ndarray
    ) -> Union[ndarray, ndarray]:

        detection_output = self.model.predict(source=frame, conf=0.25, save=False)
        bounding_box_data_result = detection_output[0].cpu()
        dict_coordinates = {}

        for result in bounding_box_data_result:
            boxes = result.boxes
            box = boxes[0]

            class_id = box.cls.numpy()[0]
            confidence = box.conf.numpy()[0]
            bounding_box = box.xyxy.numpy()[0]

            # Can be used in Distance class, dictionary with all detected classes and all corresponding cords
            if class_id in dict_coordinates:
                dict_coordinates[class_id].append(bounding_box)
            else:
                dict_coordinates[class_id] = [bounding_box]

            self._plot_boxes(frame, bounding_box, confidence, class_id)

        self.process_score(frame, dict_coordinates)
        return frame

    def generate_frame(self):
        frame = cv2.imread('images/test_img4.jpg')  # best image for pedestrian detection
        processed_frame = self.score_frame(frame)

        cv2.imshow("Processed Image", processed_frame)
        cv2.waitKey(0)
        cv2.destroyAllWindows()


# Create a new object and execute.
object_detection = ObjectDetectionV8.get_instance()
object_detection.generate_frame()
