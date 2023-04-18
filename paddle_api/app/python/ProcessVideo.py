from typing import Any

import numpy as np

from DTO.CoordsDTO import CoordsDTO
from DTO.DistanceDTO import DistanceDTO
from BoundingBoxRenderer import BoundingBoxRenderer
from Distance import Distance
from ObjectDetectionV8 import ObjectDetectionV8
from Score import Score


class ProcessVideo:
    userid = None
    file = None
    fps_processing = None

    def __init__(self, userid, file, fps_processing):
        self.userid = userid
        self.file = file
        self.fps_processing = fps_processing

        self.v8 = ObjectDetectionV8.get_instance()
        self.score = Score.get_instance()
        self.distance = Distance()
        self.bounding_box_renderer = BoundingBoxRenderer()

    def iterate_frames(self, video, out_video, fps):
        frame_count = 0

        while True:
            ret, frame = video.read()

            if not ret:
                break

            frame_count += 1
            if frame_count % round(fps / self.fps_processing) != 0:
                continue

            self.get_prediction(frame)

            out_video.write(frame)

    def get_prediction(self, frame):
        # !!!!! ----- Step 1: Detection ----- !!!!!
        predictions = self.v8.generate_predictions(frame)

        if predictions is not None:
            # !!!!! ----- Step 2: Calculation ----- !!!!!
            coords_human: list[CoordsDTO] = self.distance.get_biggest_two_humans(predictions[1])
            coords_paddle: CoordsDTO = CoordsDTO(predictions[0][0])
            distance_results: DistanceDTO = self.handle_calculations(
                frame,
                predictions,
                coords_paddle,
                coords_human
            )

            # !!!!! ----- Step 3: Show drawing (debug) ----- !!!!!
            coords = np.array([[coords_paddle], [coords_human[0], coords_human[1]]], dtype=object)
            self.show_predictions(frame, coords, self.v8.get_classes())

            # !!!!! ----- Step 4: Get/Show score ----- !!!!!
            self.score.process_score(
                distance_results.distance_between_humans,
                distance_results.pos_player_without_paddle,
                distance_results.player_height,
                distance_results.distance_between_human_player
            )

    def get_score(self, classes, coords_human, coords_paddle, distance_results, frame):
        # !!!!! ----- Step 3: Show drawing (debug) ----- !!!!!
        coords = np.array([[coords_paddle], [coords_human[0], coords_human[1]]], dtype=object)
        self.show_predictions(frame, coords, classes)

        # !!!!! ----- Step 4: Get/Show score ----- !!!!!
        self.score.process_score(
            distance_results.distance_between_humans,
            distance_results.pos_player_without_paddle,
            distance_results.player_height,
            distance_results.distance_between_human_player
        )

    def handle_calculations(
            self,
            frame,
            predictions: dict[Any, Any],
            coords_paddle: CoordsDTO,
            coords_human: [CoordsDTO]
    ) -> DistanceDTO:
        paddle_width = self.distance.calc_width_paddle(predictions[0])

        distance_between_humans = self.distance.get_distance_humans(
            frame,
            paddle_width,
            coords_human
        )

        pos_player_without_paddle = self.distance.get_player_pos(
            frame,
            coords_paddle,
            coords_human
        )

        player_height = self.distance.get_height_of_player(
            frame,
            coords_human,
            paddle_width,
            pos_player_without_paddle
        )

        distance_between_human_player = self.distance.get_distance(
            frame, paddle_width, coords_paddle, coords_human, pos_player_without_paddle
        )

        return DistanceDTO(
            distance_between_humans,
            pos_player_without_paddle,
            player_height,
            distance_between_human_player
        )

    def show_predictions(self, frame, predictions, classes):
        for i in range(len(predictions)):
            for y in range(len(predictions[i])):
                self.bounding_box_renderer.show_class(frame, predictions[i][y], classes[i])
