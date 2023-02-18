from random import randint
import torch
import cv2
import math
import numpy as np
import datetime
from ultralytics import YOLO

class ObjectDetection:
    def __init__(self, model_name):
        self.model = self.load_model(model_name)
        self.classes = self.model.names
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.generate_image()
    
    def class_to_label(self, x):
        return self.classes[int(x)]
    
    def load_model(self, model_name):
        if model_name:
            return YOLO(model_name)
    
    def plot_boxes(self, frame, bb, conf, clsID):
        cv2.rectangle(frame, (int(bb[0]), int(bb[1])), (int(bb[2]), int(bb[3])), (0, 255, 0), 2)
        cv2.putText(frame, f"Label {self.class_to_label(clsID)}, confidence: {conf}", (int(bb[0]), int(bb[1])-5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        return frame
    
    def score_frame_paddle(self, frame):
        detection_output = self.model.predict(source=frame, conf=0.25, save=False)
        
        np_result = detection_output[0].cpu()
        boxes = np_result[0].boxes
        box = boxes[0]
        
        bb = box.xyxy.numpy()[0]
        clsID = box.cls.numpy()[0]
        conf = box.conf.numpy()[0]

        self.plot_boxes(frame, bb, conf, clsID)
        return frame
    
    def generate_image(self):
        img = cv2.imread('images/test_img4.jpg')  # best image for pedestrian detection
        processed_frame = self.score_frame_paddle(img)

        cv2.imshow("Processed Image", processed_frame)
        cv2.waitKey(0)
        cv2.destroyAllWindows()



# Create a new object and execute.
detection = ObjectDetection(model_name='model/YOLOv8/model_paddle_v8.1.pt')
