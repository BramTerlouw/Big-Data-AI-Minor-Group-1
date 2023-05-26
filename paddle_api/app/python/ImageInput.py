import argparse
import os
from BaseInput import BaseInput

parser = argparse.ArgumentParser(
    description="ProcessVideo args", formatter_class=argparse.ArgumentDefaultsHelpFormatter
)

parser.add_argument(
    "-f",
    "--file",
    type=str,
    help="file that needs to be processed",
    required=False, default='image.jpg'
)

parser.add_argument(
    "-u",
    "--userid",
    type=int,
    help="User id",
    required=False,
    default=42
)

args = vars(parser.parse_args())


class ImageInput(BaseInput):
    def __init__(self):
        super().__init__(args['userid'], args['file'], 'false', 10)

    def get_result(self):
        if not self.score.get_score():
            return print(False)

        return print(self.score.get_score()[0]['dist_humans'] > 20)


image_input = ImageInput()
image_input.load_input()
image_input.get_result()
