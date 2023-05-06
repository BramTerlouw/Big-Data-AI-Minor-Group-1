# from FrameInput import FrameInput
from FrameInference import ProcessVideo
from Score import Score


def stream_logic(frame):
    score = Score.get_instance()
    proces = ProcessVideo(-1, frame, 10)
    proces.get_prediction(frame)
    score.get_score()

    # frame_input = FrameInput(frame)
    # frame_input.load_input()
    # return frame_input.get_result()
