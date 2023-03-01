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
            frame: numpy.ndarray
    ) -> Union[ndarray, ndarray]:

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
