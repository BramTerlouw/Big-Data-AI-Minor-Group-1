from typing import Optional, Any

import torch
from ultralytics import YOLO


class ObjectDetectionV8:
    __instance = None

    def __init__(self):
        if ObjectDetectionV8.__instance is not None:
            raise Exception("Singleton instance already exists. Use get_instance() method to get the instance.")
        else:
            self.model_name = 'app/python/model/paddle_and_human_yolov8m_v2.pt'
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

    def generate_predictions(self, frame):
        frame_predictions = self.model.predict(source=frame, conf=0.25, save=False)
        return self.convert_to_coordinates(frame_predictions)

    def convert_to_coordinates(self, detection_output) -> Optional[dict[Any, list[Any]]]:
        data_results = detection_output[0].cpu()
        dict_coordinates = {}

        for result in data_results:
            box = result.boxes[0]

            class_id = box.cls.numpy()[0]
            bounding_box = box.xyxy.numpy()[0]

            if class_id in dict_coordinates:
                dict_coordinates[class_id].append(bounding_box)
            else:
                dict_coordinates[class_id] = [bounding_box]

        return dict_coordinates if self.predictions_are_valid(dict_coordinates) else None

    @classmethod
    def predictions_are_valid(cls, dict_coordinates):
        return 0 in dict_coordinates and len(dict_coordinates[1]) >= 2

    def get_classes(self):
        return self.classes


# Create a new object and execute.
object_detection = ObjectDetectionV8.get_instance()
