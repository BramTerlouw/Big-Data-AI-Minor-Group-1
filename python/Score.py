import json
from typing import Union

import numpy
from numpy import ndarray


class Score:

    def __init__(self):
        print('init')

    @classmethod
    def process_score(
            cls,
            frame: numpy.ndarray,
            coordinates: dict
    ) -> Union[ndarray, ndarray]:
        # @TODO what is this distance for cause its not reference anywhere
        padel_width = distance.calc_width_paddle(coordinates[0])
        distance.get_distance_humans(frame, padel_width, coordinates[1])
        distance.set_player_pos(frame, coordinates)
        distance.get_distance(frame, padel_width, coordinates[0], coordinates[1])

        return frame

    @classmethod
    def calculate_score(cls):
        print('average score')

    @classmethod
    def serialize(cls, scores: dict) -> print():
        return print(
            json.dumps(
                scores
            )
        )
