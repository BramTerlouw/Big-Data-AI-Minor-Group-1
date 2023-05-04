import argparse

from BaseInput import BaseInput

parser = argparse.ArgumentParser(
    description="FrameInput args", formatter_class=argparse.ArgumentDefaultsHelpFormatter
)

parser.add_argument(
    "-f",
    "--file",
    type=str,
    help="file that needs to be processed",
    required=False, default='image.jpg'
)

args = vars(parser.parse_args())


class FrameInput(BaseInput):
    def __init__(self):
        super().__init__(-1, args['file'], 'false', 10)

    def get_result(self):
        return print(self.score.get_score())


frame_input = FrameInput()
frame_input.load_input()
frame_input.get_result()
