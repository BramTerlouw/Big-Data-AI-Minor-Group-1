import argparse

import cv2

from ProcessVideo import ProcessVideo
from Score import Score

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
    default=30
)

parser.add_argument(
    "-t",
    "--type",
    type=str,
    help="",
    required=False, default='true'
)

args = vars(parser.parse_args())


class VideoInput:
    def __init__(self):
        self.userid = args['userid']
        self.filename = args['file']
        self.fps_processing = args['fps']
        self.is_video = args['type']
        self.proces = ProcessVideo(self.userid, self.filename, self.fps_processing)
        self.score = Score.get_instance()

    def load_input(self):
        video = cv2.VideoCapture("input/" + self.filename)
        fps = video.get(cv2.CAP_PROP_FPS)

        frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

        out_video = self.create_output(fps, (frame_width, frame_height))

        if self.is_video == 'true':
            self.proces.iterate_frames(video, out_video, fps)
        else:
            self.proces.get_score_from_prediction(video)

        self.final(out_video, video)

    def create_output(self, fps: float, frame_size: tuple):
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        return cv2.VideoWriter(
            "processedVideos/" + str(self.userid) + "/" + self.filename, fourcc, fps, (frame_size[0], frame_size[1])
        )

    def final(self, out_video, video):
        video.release()
        out_video.release()
        self.score.serialize()


video_input = VideoInput()
video_input.load_input()
