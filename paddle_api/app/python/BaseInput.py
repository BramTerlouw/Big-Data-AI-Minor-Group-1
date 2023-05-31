import cv2

from FrameInference import ProcessVideo
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
        if self.file_type == 'true':
            # # video = cv2.VideoCapture("C:/Users/merli/Downloads/2.mp4")
            # video = cv2.VideoCapture("C:/Users/bramt/Downloads/test videos/Normal.mp4")
            video = cv2.VideoCapture("input/videos/" + self.filename)

            fps = video.get(cv2.CAP_PROP_FPS)

            width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

            # width = 640
            # height = 640
            # aspect_ratio = width / float(height)
            # if width > height:
            #     new_width = 640
            #     new_height = int(new_width / aspect_ratio)
            # else:
            #     new_height = 640
            #     new_width = int(new_height * aspect_ratio)

            out_video = self.create_output(fps, (width, height))

            # Process and write frames to the output video
            self.proces.iterate_frames(video, out_video, fps)

            # Release the video resources and finalize the output video
            self.final(out_video, video)
        else:
            im = cv2.imread("processedImages/" + str(self.userid) + "/" + self.filename)
            self.proces.get_prediction(im)

    def create_output(self, fps: float, frame_size: tuple):
        output_path = "test.mp4"
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        return cv2.VideoWriter(output_path, fourcc, fps, (frame_size[0], frame_size[1]))

    def final(self, out_video, video):
        # Release the video writer and input video objects
        out_video.release()
        video.release()
        # self.score.serialize()

