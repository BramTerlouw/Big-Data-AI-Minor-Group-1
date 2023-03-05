import cv2
import numpy as np

from Debug import Debug
from Distance import Distance
from ObjectDetectionV8 import ObjectDetectionV8
from DTO.CoordsDTO import CoordsDTO

v8 = ObjectDetectionV8.get_instance()
distance = Distance()
debug = Debug()


class ProcessVideo:

    def __init__(self):
        print('init')

    def load_input(self):
        video = cv2.VideoCapture("input/camera4.mp4")
        fps = video.get(cv2.CAP_PROP_FPS)

        frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

        out_video = self.create_output(fps, (frame_width, frame_height))
        self.iterate_frames(video, out_video)

    @classmethod
    def create_output(cls, fps: float, frame_size: tuple):
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        return cv2.VideoWriter("output/output_video.mp4", fourcc, fps, (frame_size[0], frame_size[1]))

    def iterate_frames(self, video, out_video):
        while True:
            ret, frame = video.read()

            if not ret:
                break

            # !!!!! ----- Step 1: Detection ----- !!!!!
            classes = v8.get_classes()
            predictions = v8.generate_predictions(frame)

            if predictions is not None:
                # !!!!! ----- Step 2: Calculation ----- !!!!!
                coords_human = distance.get_biggest_two_humans(predictions[1])
                coords_paddle = CoordsDTO(predictions[0][0])

                paddle_width = distance.calc_width_paddle(predictions[0])
                distance_betw_humans = distance.get_distance_humans(frame, paddle_width, coords_human)
                pos_player_without_paddle = distance.get_player_pos(frame, coords_paddle, coords_human)
                distance_betw_human_player = distance.get_distance(
                    frame, paddle_width, coords_paddle, coords_human, pos_player_without_paddle
                )

                # !!!!! ----- Step 3: Show drawing (debug) ----- !!!!!
                coords = np.array([[coords_paddle], [coords_human[0], coords_human[1]]])
                self.show_predictions(frame, coords, classes)

                # Show distance humans?
                # Show who is without padel?
                # Show distance player and padel?

                # !!!!! ----- Step 4: Get/Show score ----- !!!!!

            out_video.write(frame)

        video.release()
        out_video.release()

    def show_predictions(self, frame, predictions, classes):
        for i in range(len(predictions)):
            for y in range(len(predictions[i])):
                debug.show_class(frame, predictions[i][y], self._class_id_to_label(classes, i))

    @classmethod
    def _class_id_to_label(
            cls,
            classes,
            class_id: int
    ) -> int:
        return classes[class_id]


proces = ProcessVideo()
proces.load_input()
