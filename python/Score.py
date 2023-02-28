import json
from ultralytics import YOLO
from numpy import ndarray
import numpy
from typing import Union

class Score:

    def __init__(self):
        print('init')


    @classmethod
    def process_score(
        cls,
        frame: numpy.ndarray,
        coordinates: dict
    ) -> Union[ndarray, ndarray]:
        padel_width = distance.calc_width_paddle(coordinates[0])
        distance.get_distance_humans(frame, padel_width, coordinates[1])
        distance.set_player_pos(frame, coordinates)
        distance.get_distance(frame, padel_width, coordinates[0], coordinates[1])

        return frame


    @classmethod
    def calculate_score(cls):
        print('aveage score')


    @classmethod
    def serialize(cls, scores: dict) -> print():
        return print(json.dumps(
            scores
        ))