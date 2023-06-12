from FrameInference import ProcessVideo
from Score import Score


def stream_logic_last_score(frame):
    score = Score.get_instance()
    proces = ProcessVideo(-1, frame, 60)
    proces.get_prediction(frame)
    return score.get_score_stream()


def stream_logic_all_score():
    score = Score.get_instance()
    return score.get_score()
