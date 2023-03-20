import argparse

import cv2

from app.python.Input.BaseInput import BaseInput

parser = argparse.ArgumentParser(
    description="ProcessVideo args", formatter_class=argparse.ArgumentDefaultsHelpFormatter
)

parser.add_argument(
    "-f",
    "--file",
    type=str,
    help="file that needs to be processed",
    required=False, default='image.jpeg'
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

    def load_input(self):
        video = cv2.VideoCapture("input/" + self.filename)
        classes, coords_human, coords_paddle, distance_results = self.proces.get_prediction(video)

        # @TODO if something is wrong with these coords we returns true or false?
        return distance_results.distance_between_humans < 100


image_input = ImageInput()
image_input.load_input()
