import json
import numpy as np


class Score:
    __instance = None
    scores = []

    def __init__(self):
        if Score.__instance is not None:
            raise Exception("Singleton instance already exists. Use get_instance() method to get the instance.")
        else:
            Score.__instance = self

    @classmethod
    def get_instance(cls) -> 'Score':
        if Score.__instance is None:
            Score()
        return Score.__instance

    @classmethod
    def process_score(
            cls,
            data_distance_humans,
            data_player_position,
            data_player_height,
            data_distance_player_paddle,
    ):
        score_summary = {
            'dist_humans': data_distance_humans,
            'player_pos': data_player_position,
            'player_height': data_player_height,
            'dist_player_paddle': data_distance_player_paddle,
            'possible_intersect': True if data_distance_player_paddle < 0 else False
        }
        Score.scores.append(score_summary)

    @classmethod
    def calculate_score(cls):
        print('average score')

    @classmethod
    def serialize(cls) -> print:
        return print(json.dumps(Score.scores, default=lambda x: int(x) if isinstance(x, np.int32) else x))

    def get_score(self):
        return self.scores

    def get_score_stream(self):
        return self.scores[-1]