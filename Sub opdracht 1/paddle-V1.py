import torch
import numpy as np
import cv2


class ObjectDetection:
    def __init__(self, capture_index, model_name):
        self.capture_index = capture_index
        self.model = self.load_model(model_name)
        self.classes = self.model.names
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print("\n\nDevice Used:",self.device)


    def load_model(self, model_name):
        if model_name:
            return torch.hub.load('ultralytics/yolov5', 'custom', path=model_name, force_reload=True)


    def score_frame(self, frame):
        self.model.to(self.device)
        frame = [frame]
        results = self.model(frame)
     
        # Labels and Coordinates of objects detected by model in the frame.
        labels, cord = results.xyxyn[0][:, -1], results.xyxyn[0][:, :-1]
        return labels, cord


    def class_to_label(self, x):
        # Return string value corresponding to label value
        return self.classes[int(x)]


    def plot_boxes(self, results, frame):
        labels, cord = results
        n = len(labels)
        x_shape, y_shape = frame.shape[1], frame.shape[0]
        for i in range(n):
            row = cord[i]
            if row[4] >= 0.2:
                x1, y1, x2, y2 = int(row[0]*x_shape), int(row[1]*y_shape), int(row[2]*x_shape), int(row[3]*y_shape)
                bgr = (0, 255, 0)
                cv2.rectangle(frame, (x1, y1), (x2, y2), bgr, 2)
                cv2.putText(frame, self.class_to_label(labels[i]), (x1, y1), cv2.FONT_HERSHEY_SIMPLEX, 0.9, bgr, 2)

        return frame


    def __call__(self):

        while True:
            img = cv2.imread('test_img2.jpg')
            results = self.score_frame(img)
            frame = self.plot_boxes(results, img)

            cv2.imshow("img", frame)

            if cv2.waitKey(1) & 0xFF == ord('q'):
                break


# Create a new object and execute.
detection = ObjectDetection(capture_index=0, model_name='Sub opdracht 1/model/model_paddle_V1.pt')
detection()