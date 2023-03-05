import json


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
            data_distance_player_paddle,
    ):
        score_summary = {
            'dist_humans': data_distance_humans,
            'player_pos': data_player_position,
            'dist_player_paddle': data_distance_player_paddle
        }
        Score.scores.append(score_summary)

    @classmethod
    def print_scores(cls):
        print(Score.scores)

    @classmethod
    def calculate_score(cls):
        print('average score')

    @classmethod
    def serialize(cls, scores: dict) -> print:
        return print(json.dumps(scores))
