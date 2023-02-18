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



    def load_model(self, model_name):
        if model_name:
            return torch.hub.load('ultralytics/yolov5', 'custom', path=model_name, force_reload=True)



    def score_frame_paddle(self, frame):
        self.model.to(self.device)
        frame = [frame]
        results = self.model(frame)

        # Labels and Coordinates of objects detected by model in the frame.
        labels, cord = results.xyxyn[0][:, -1], results.xyxyn[0][:, :-1]
        return labels, cord
    


    def score_frame_humans(self, frame):
        HOGCV = cv2.HOGDescriptor()
        HOGCV.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())
        return HOGCV.detectMultiScale(frame, winStride=(8, 8), padding=(8, 8), scale=1.5)



    def detect_most_right_human(self, bbox_human):
        max_right = -np.inf
        most_right_human = None
        for x, y, w, h in bbox_human:
            if x + w > max_right:
                max_right = x + w
                most_right_human = (x, y, x + w, y + h)
        return most_right_human



    def class_to_label(self, x):
        return self.classes[int(x)]
    


    def draw_matrix(self, frame, frame_width, frame_height, distancex, distancey):
        # Draw boxes horizontally
        for i in range(math.ceil(frame_width / distancex) + 1):
            cv2.rectangle(frame, (0, 0), (i * distancex, distancey), (255, 255, 0), 1)
            
            # Draw boxes vertically
            for j in range(math.ceil(frame_height / distancey) + 1):
                cv2.rectangle(frame, (0, 0), (i * distancex, j * distancey), (255, 255, 0), 1)



    def score_is_sufficient(self, confidence, min_value):
        return confidence >= min_value
    


    def get_paddle_bbox(self, row, frame_width, frame_height):
        return int(row[0] * frame_width), int(row[1] * frame_height), int(row[2] * frame_width), int(
                    row[3] * frame_height)



    def plot_boxes_paddle(self, results, frame):
        labels, cord = results
        frame_width, frame_height = frame.shape[1], frame.shape[0]
        
        for i in range(len(labels)):
            row = cord[i]
            if self.score_is_sufficient(row[4], 0.2):

                # Get all corners of bounding box
                x1, y1, x2, y2 = self.get_paddle_bbox(row, frame_width, frame_height)
                
                # Draw rectangle and label
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, self.class_to_label(labels[i]), (x1, y1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 1)

                # Draw matrix using paddle dimensions
                # self.draw_matrix(frame, frame_width, frame_height, (x2-x1), (y2-y1))
        return frame
    


    def plot_boxes_humans(self, bbox_human, frame):
        for x, y, w, h in bbox_human:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (randint(0, 255), randint(0, 255), randint(0, 255)), 3)
        return frame
    


    def get_distance_between_human_and_paddle(self, frame, most_right_human, results_paddle):
        labels, cord = results_paddle

        px1, py1, px2, py2 = self.get_paddle_bbox(cord[0], frame.shape[1], frame.shape[0])
        right_border_human = most_right_human[0]

        # 30CM / pixel value of width padel x pixel value of distance between bboxes
        distance_between_paddle_and_human = int(30 / (px2-px1) * (right_border_human-px2))

        cv2.line(frame, (px2, py1), (int(right_border_human), int(py1)), (255,0,0), 2)
        cv2.putText(frame, f"{distance_between_paddle_and_human} CM", (px2, py1-5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 1)
        return distance_between_paddle_and_human
    


    def summarize_results(self, frame, results_paddle, results_human, distance):
        px1, py1, px2, py2 = self.get_paddle_bbox(results_paddle[1][0], frame.shape[1], frame.shape[0])
        hx1, hy1, hw, hh = results_human

        file = open('scores_V5.txt', 'a')
        file.write(f'Score: {datetime.datetime.now()}\n')

        file.write('Paddle bounding box (top-left(px1), bottom-left(py1), top-right(px2), bottom-right(py2):)\n')
        file.write(f'{px1, py1, px2, py2}\n\n')

        file.write('Right human bounding box (top-left(hx1), bottom-left(hy1), width(hw), height(hh):)\n')
        file.write(f'{hx1, hy1, hw, hh}\n\n')

        file.write('Distance measured between paddle and human:\n')
        file.write(f'{distance} CM \n\n')
        file.close()


    def generate_image(self):
        img = cv2.imread('images/test_img4.jpg')  # best image for pedestrian detection

        results_humans, weights = self.score_frame_humans(img)
        results_paddle = self.score_frame_paddle(img)

        most_right_human = self.detect_most_right_human(results_humans)
        
        frame = self.plot_boxes_paddle(results_paddle, img)
        if most_right_human is not None:
            frame = self.plot_boxes_humans([most_right_human], frame)
            distance = self.get_distance_between_human_and_paddle(frame, most_right_human, results_paddle)
            self.summarize_results(frame, results_paddle, most_right_human, distance)

        cv2.imshow("Processed Image", frame)
        cv2.waitKey(0)
        cv2.destroyAllWindows()


# Create a new object and execute.
detection = ObjectDetection(model_name='model/YOLOv5/model_paddle_V5.pt')
