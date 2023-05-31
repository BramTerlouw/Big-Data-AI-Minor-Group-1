from typing import Optional, Any
import torch
import numpy as np


class ObjectDetectionV5:
    __instance = None

    def __init__(self):
        if ObjectDetectionV5.__instance is not None:
            raise Exception("Singleton instance already exists. Use get_instance() method to get the instance.")
        else:
            self.model_name = 'python/model/yolov5.pt'
            self.model = self._load_model(self.model_name)
            self.classes = self.model.names
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
            ObjectDetectionV5.__instance = self

    @classmethod
    def get_instance(cls) -> 'ObjectDetectionV5':
        if ObjectDetectionV5.__instance is None:
            ObjectDetectionV5()
        return ObjectDetectionV5.__instance

    @classmethod
    def _load_model(cls, model_name: str):
        if model_name:
            return torch.hub.load(
                'ultralytics/yolov5', 'custom',
                path=model_name,
                force_reload=True
            )
        else:
            raise ValueError("Model not found: " + model_name)

    def generate_predictions(self, frame):
        frame_predictions = self.model(frame)
        return self.convert_to_coordinates(frame_predictions)

    def convert_to_coordinates(self, detection_output) -> Optional[dict[Any, list[Any]]]:
        data_results = detection_output.xyxy[0].tolist()
        dict_coordinates = {}

        for result in data_results:

            bounding_box = np.array(result[:4])  # Slicing first 4 elements
            class_id = np.float32(result[5])  # Casting 5th element to integer

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
object_detection = ObjectDetectionV5.get_instance()
