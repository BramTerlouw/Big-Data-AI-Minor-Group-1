from BaseInput import BaseInput


class FrameInput(BaseInput):
    def __init__(self, frame):
        super().__init__(-1, frame, 'false', 10)

    def get_result(self):
        return self.score.get_score()

# frame_input = FrameInput(frame)
# frame_input.load_input()
# frame_input.get_result()
