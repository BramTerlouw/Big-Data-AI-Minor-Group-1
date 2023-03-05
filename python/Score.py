import json
import numpy as np


class Score:

    __instance = None

    def __init__(self):
        if Score.__instance is not None:
            raise Exception("Score class is a singleton! Use 'get_instance()' method to get the instance.")
        else:
            Score.__instance = self
            print('init')

    @classmethod
    def get_instance(cls):
        if Score.__instance is None:
            Score()
        return Score.__instance

    @classmethod
    def process_score(cls, frame: np.ndarray) -> np.ndarray:
        return frame

    @classmethod
    def calculate_score(cls):
        print('average score')

    @classmethod
    def serialize(cls, scores: dict) -> print:
        return print(json.dumps(scores))
