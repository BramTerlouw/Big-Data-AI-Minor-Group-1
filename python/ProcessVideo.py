import cv2
import numpy as np
import argparse

from Debug import Debug
from Distance import Distance
from Score import Score
from ObjectDetectionV8 import ObjectDetectionV8
from DTO.CoordsDTO import CoordsDTO
from DTO.DistanceDTO import DistanceDTO

parser = argparse.ArgumentParser(
    description="ProcessVideo args", formatter_class=argparse.ArgumentDefaultsHelpFormatter
)
parser.add_argument("-v", "--video", type=str, help="Video that needs to be processed", required=True)
parser.add_argument("-u", "--userid", type=int, help="User id", required=True)
args = vars(parser.parse_args())

userid = args['userid']
video_file = args['video']

v8 = ObjectDetectionV8.get_instance()
score = Score.get_instance()
distance = Distance()
debug = Debug()


class ProcessVideo:

    def __init__(self):
        print('init')

    def load_input(self):
        video = cv2.VideoCapture("../input/" + video_file)
        fps = video.get(cv2.CAP_PROP_FPS)

        frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

        out_video = self.create_output(fps, (frame_width, frame_height))
        self.iterate_frames(video, out_video)

    @classmethod
    def create_output(cls, fps: float, frame_size: tuple):
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        return cv2.VideoWriter(
            "../processedVideos/" + str(userid) + "/" + video_file, fourcc, fps, (frame_size[0], frame_size[1])
        )

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
                distance_results = self.handle_calculations(frame, predictions, coords_paddle, coords_human)

                # !!!!! ----- Step 3: Show drawing (debug) ----- !!!!!
                coords = np.array([[coords_paddle], [coords_human[0], coords_human[1]]], dtype=object)
                self.show_predictions(frame, coords, classes)

                # !!!!! ----- Step 4: Get/Show score ----- !!!!!
                score.process_score(
                    distance_results.distance_between_humans,
                    distance_results.pos_player_without_paddle,
                    distance_results.distance_between_human_player
                )

            out_video.write(frame)

        video.release()
        out_video.release()
        score.serialize()

    @classmethod
    def handle_calculations(cls, frame, predictions, coords_paddle, coords_human):
        paddle_width = distance.calc_width_paddle(predictions[0])

        distance_between_humans = distance.get_distance_humans(
            frame,
            paddle_width,
            coords_human
        )

        pos_player_without_paddle = distance.get_player_pos(
            frame,
            coords_paddle,
            coords_human
        )

        distance_between_human_player = distance.get_distance(
            frame, paddle_width, coords_paddle, coords_human, pos_player_without_paddle
        )

        dto = DistanceDTO()
        dto.distance_between_humans = distance_between_humans
        dto.pos_player_without_paddle = pos_player_without_paddle
        dto.distance_between_human_player = distance_between_human_player
        return dto

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
