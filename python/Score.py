import json


class Score:

    # Extra note !!!PLEASE USE OBJECT TYPE HINTING!!! and make file name same as class.
    def __init__(self):
        print('init')

    @classmethod
    def calculate_score(cls):
        print('aveage score')

    @classmethod
    def serialize(cls, scores: dict) -> print():
        return print(json.dumps(
            scores
        ))
