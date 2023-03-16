from typing import Any

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

parser.add_argument(
    "-f",
    "--file",
    type=str,
    help="file that needs to be processed",
    required=False, default='camera4.mp4'
)

parser.add_argument(
    "-u",
    "--userid",
    type=int,
    help="User id",
    required=False,
    default=42
)

parser.add_argument(
    "-fp",
    "--fps",
    type=int,
    help="Processing frames per second",
    default=30
)

parser.add_argument(
    "-t",
    "--type",
    type=str,
    help="",
    required=False, default='true'
)

args = vars(parser.parse_args())

userid = args['userid']
file = args['file']
fps_processing = args['fps']
is_video = args['type']

v8 = ObjectDetectionV8.get_instance()
score = Score.get_instance()
distance = Distance()
debug = Debug()


class ProcessVideo:

    def __init__(self):
        print('init')

    def load_input(self):
        video = cv2.VideoCapture("input/" + file)
        fps = video.get(cv2.CAP_PROP_FPS)

        frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

        out_video = self.create_output(fps, (frame_width, frame_height))

        if is_video == 'true':
            self.iterate_frames(video, out_video, fps)
        else:
            self.process(video)

        self.final(out_video, video)

    @classmethod
    def create_output(cls, fps: float, frame_size: tuple):
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        return cv2.VideoWriter(
            "processedVideos/" + str(userid) + "/" + file, fourcc, fps, (frame_size[0], frame_size[1])
        )

    def iterate_frames(self, video, out_video, fps):
        frame_count = 0

        while True:
            ret, frame = video.read()

            if not ret:
                break

            frame_count += 1
            if frame_count % round(fps / fps_processing) != 0:
                continue

            self.process(frame)

            out_video.write(frame)

        self.final(out_video, video)

    @classmethod
    def final(cls, out_video, video):
        video.release()
        out_video.release()
        score.serialize()

    def process(self, frame):
        # !!!!! ----- Step 1: Detection ----- !!!!!
        classes = v8.get_classes()
        predictions = v8.generate_predictions(frame)

        if predictions is not None:
            # !!!!! ----- Step 2: Calculation ----- !!!!!
            coords_human: list[CoordsDTO] = distance.get_biggest_two_humans(predictions[1])
            coords_paddle: CoordsDTO = CoordsDTO(predictions[0][0])
            distance_results: DistanceDTO = self.handle_calculations(
                frame,
                predictions,
                coords_paddle,
                coords_human
            )

            # !!!!! ----- Step 3: Show drawing (debug) ----- !!!!!
            coords = np.array([[coords_paddle], [coords_human[0], coords_human[1]]], dtype=object)
            self.show_predictions(frame, coords, classes)

            # !!!!! ----- Step 4: Get/Show score ----- !!!!!
            score.process_score(
                distance_results.distance_between_humans,
                distance_results.pos_player_without_paddle,
                distance_results.distance_between_human_player
            )

    @classmethod
    def handle_calculations(
            cls,
            frame,
            predictions: dict[Any, Any],
            coords_paddle: CoordsDTO,
            coords_human: [CoordsDTO]
    ) -> DistanceDTO:
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

        return DistanceDTO(distance_between_humans, pos_player_without_paddle, distance_between_human_player)

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
