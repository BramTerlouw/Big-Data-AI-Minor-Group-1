from random import randint
import torch
import cv2
import math


class ObjectDetection:
    def __init__(self, capture_index, model_name):
        self.capture_index = capture_index
        self.model = self.load_model(model_name)
        self.classes = self.model.names
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        self.generate_image()

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
            print(frame.shape[1], frame.shape[0], row)
            if row[4] >= 0.2:
                x1, y1, x2, y2 = int(row[0] * x_shape), int(row[1] * y_shape), int(row[2] * x_shape), int(
                    row[3] * y_shape)
                bgr = (0, 255, 0)
                cv2.rectangle(frame, (x1, y1), (x2, y2), bgr, 2)
                cv2.putText(frame, self.class_to_label(labels[i]), (x1, y1), cv2.FONT_HERSHEY_SIMPLEX, 0.9, bgr, 2)

                distancex = x2 - x1
                distancey = y2 - y1

                for i in range(math.ceil(x_shape / distancex) + 1):
                    cv2.rectangle(frame, (0, 0), (i * distancex, distancey), (255, 255, 0), 2)
                    for j in range(math.ceil(y_shape / distancey) + 1):
                        cv2.rectangle(frame, (0, 0), (i * distancex, j * distancey), (255, 255, 0), 2)

                print(distancex, distancex)

        return frame

    def generate_image(self):

        HOGCV = cv2.HOGDescriptor()
        HOGCV.setSVMDetector(cv2.HOGDescriptor_getDefaultPeopleDetector())

        img = cv2.imread('KoolKidsKlubTest.jpeg')  # best image for pedestrian detection

        bbox_human, weights = HOGCV.detectMultiScale(img, winStride=(8, 8), padding=(4, 4), scale=1.5)

        for x, y, w, h in bbox_human:
            cv2.rectangle(img, (x, y), (x + w, y + h), (randint(0, 255), randint(0, 255), randint(0, 255)), 2)

        results = self.score_frame(img)
        frame = self.plot_boxes(results, img)

        cv2.imshow("img", frame)
        cv2.waitKey(0)
        cv2.destroyAllWindows()


# Create a new object and execute.
detection = ObjectDetection(capture_index=0, model_name='model/model_paddle_V1.pt')
