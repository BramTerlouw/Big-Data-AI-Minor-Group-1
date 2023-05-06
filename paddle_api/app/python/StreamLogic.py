from FrameInference import ProcessVideo
from Score import Score


def stream_logic(frame):
    score = Score.get_instance()
    proces = ProcessVideo(-1, frame, 10)
    proces.get_prediction(frame)
    return score.get_score()
