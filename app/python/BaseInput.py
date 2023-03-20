import cv2

from ProcessVideo import ProcessVideo
from Score import Score


class BaseInput:
    def __init__(self, userid, filename, file_type, fps_processing):
        self.score = Score.get_instance()

        self.filename = filename
        self.userid = userid
        self.file_type = file_type
        self.fps_processing = fps_processing

        self.proces = ProcessVideo(self.userid, self.filename, self.fps_processing)

    def load_input(self):
        video = cv2.VideoCapture("input/" + self.filename)
        fps = video.get(cv2.CAP_PROP_FPS)

        frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

        out_video = self.create_output(fps, (frame_width, frame_height))

        if self.file_type == 'true':
            self.proces.iterate_frames(video, out_video, fps)
        else:
            classes, coords_human, coords_paddle, distance_results = self.proces.get_prediction(video)
            self.proces.get_score(classes, coords_human, coords_paddle, distance_results, video)

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
