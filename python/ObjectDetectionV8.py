from typing import Union

import cv2
import numpy
import torch
from numpy import ndarray
from ultralytics import YOLO

from Score import Score

score = Score()


class ObjectDetectionV8:
    __instance = None

    def __init__(self):
        if ObjectDetectionV8.__instance is not None:
            raise Exception("Singleton instance already exists. Use get_instance() method to get the instance.")
        else:
            self.model_name = 'model/paddle_and_human_yolov8m_v2.pt'
            self.model = self._load_model(self.model_name)
            self.classes = self.model.names
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            ObjectDetectionV8.__instance = self

    @classmethod
    def get_instance(cls) -> 'ObjectDetectionV8':
        if ObjectDetectionV8.__instance is None:
            ObjectDetectionV8()
        return ObjectDetectionV8.__instance

    @classmethod
    def _load_model(cls, model_name: str) -> YOLO:
        if model_name:
            return YOLO(model_name)
        else:
            raise ValueError("Model not found: " + model_name)

    def generate_frame(self, frame):
        # frame1 = cv2.imread('images/test_img4.jpg')
        # frame2 = cv2.imread('images/test_img5.jpg')

        # score_frame1 = self.model.predict(source=frame1, conf=0.25, save=False)
        # score_frame2 = self.model.predict(source=frame2, conf=0.25, save=False)
        score_frame = self.model.predict(source=frame, conf=0.25, save=False)

        # processed_frame1 = score.score_frame(frame1, self.classes, score_frame1)
        # processed_frame2 = score.score_frame(frame2, self.classes, score_frame2)
        processed_frame = score.score_frame(frame, self.classes, score_frame)

        # cv2.imshow("Processed Image 1", processed_frame1)
        # cv2.imshow("Processed Image 2", processed_frame2)
        # cv2.imshow("Processed Image ", processed_frame)
        # cv2.waitKey(0)
        # cv2.destroyAllWindows()
        return processed_frame


# Create a new object and execute.
object_detection = ObjectDetectionV8.get_instance()
# object_detection.generate_frame()