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

        # return print(self.score.get_score()[0]['dist_humans'] > 20)
        self.check_score()

    def check_score(self):
        try:
            score = self.score.get_score()[0]
            height = int(score['player_height'])
            distance = int(score['dist_humans'])

            # with open('score_output.txt', 'w') as file:
            #     file.write(f"Height: {height}\n")
            #     file.write(f"Distance: {distance}\n")

            height_ranges = [
                (140, 170, 60, 80),
                (170, 200, 80, 100),
                (200, 220, 100, 120),
            ]

            for height_min, height_max, distance_min, distance_max in height_ranges:
                if height_min <= height < height_max and distance_min < distance <= distance_max:
                    return print('true')

            return print('false')
        except Exception as e:
            print(e)


image_input = ImageInput()
image_input.load_input()
image_input.get_result()
