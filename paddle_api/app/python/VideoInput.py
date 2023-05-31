import argparse

from BaseInput import BaseInput

parser = argparse.ArgumentParser(
    description="ProcessVideo args", formatter_class=argparse.ArgumentDefaultsHelpFormatter
)

parser.add_argument(
    "-f",
    "--file",
    type=str,
    help="file that needs to be processed",
    required=False, default='camera4.mp4'
)

parser.add_argument(
    "-u",
    "--userid",
    type=int,
    help="User id",
    required=False,
    default=42
)

parser.add_argument(
    "-fp",
    "--fps",
    type=int,
    help="Processing frames per second",
    default=20
)

parser.add_argument(
    "-t",
    "--type",
    type=str,
    help="",
    required=False, default='true'
)

args = vars(parser.parse_args())


class VideoInput(BaseInput):
    def __init__(self):
        super().__init__(args['userid'], args['file'], args['type'], args['fps'])


video_input = VideoInput()
video_input.load_input()
