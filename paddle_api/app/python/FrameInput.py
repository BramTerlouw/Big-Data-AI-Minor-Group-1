from BaseInput import BaseInput


class FrameInput(BaseInput):
    def __init__(self, frame):
        super().__init__(-1, frame, 'false', 10)

    def load_input(self):
        self.proces.get_prediction(self, self.filename)

    def get_result(self):
        return self.score.get_score()