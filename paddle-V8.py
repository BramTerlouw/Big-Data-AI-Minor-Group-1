from typing import Union

import cv2
import numpy
import torch
from numpy import ndarray
from ultralytics import YOLO


class ObjectDetectionV8:
    def __init__(self, model_name: str):
        self.model = self.load_model(model_name)
        self.classes = self.model.names
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.generate_frame()

    def class_id_to_label(
            self,
            class_id: int
    ) -> str:
        return self.classes[class_id]

    def load_model(self, model_name: str) -> YOLO:
        if model_name:
            return YOLO(model_name)
        else:
            raise ValueError("Model not found: " + model_name)

    def plot_boxes(
            self,
            frame: numpy.ndarray,
            bounding_box: numpy.ndarray,
            confidence: numpy.float32,
            class_id: int
    ) -> Union[ndarray, ndarray]:

        cv2.rectangle(
            frame,
            (int(bounding_box[0]), int(bounding_box[1])),
            (int(bounding_box[2]), int(bounding_box[3])),
            (0, 255, 0),
            2
        )

        cv2.putText(
            frame,
            f"Label {self.class_id_to_label(class_id)}, confidence: {confidence}",
            (int(bounding_box[0]), int(bounding_box[1]) - 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (0, 255, 0),
            2
        )

        return frame

    def score_frame(
            self,
            frame: numpy.ndarray
    ) -> Union[ndarray, ndarray]:

        detection_output = self.model.predict(source=frame, conf=0.25, save=False)
        bounding_box_data_result = detection_output[0].cpu()

        for result in bounding_box_data_result:
            boxes = result.boxes
            box = boxes[0]

            bounding_box = box.xyxy.numpy()[0]
            class_id = box.cls.numpy()[0]
            confidence = box.conf.numpy()[0]

            self.plot_boxes(frame, bounding_box, confidence, class_id)

        return frame

    def generate_frame(self):
        frame = cv2.imread('images/test_img4.jpg')  # best image for pedestrian detection
        processed_frame = self.score_frame(frame)

        cv2.imshow("Processed Image", processed_frame)
        cv2.waitKey(0)
        cv2.destroyAllWindows()


# Create a new object and execute.
detection = ObjectDetectionV8(model_name='model/YOLOv8/model_paddle_v8.1.pt')
