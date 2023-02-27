import cv2

from ObjectDetectionV8 import ObjectDetectionV8

v8 = ObjectDetectionV8.get_instance()


class ProcessVideo:

    def __init__(self):
        print('init')

    def load_input(self):
        video = cv2.VideoCapture("input/camera4.mp4")
        fps = video.get(cv2.CAP_PROP_FPS)

        frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for the new video file
        out_video = cv2.VideoWriter("output/output_video.mp4", fourcc, fps, (frame_width, frame_height))

        while True:
            ret, frame = video.read()

            if not ret:
                break

            processed_frame = v8.generate_frame(frame)
            out_video.write(frame)


        video.release()
        out_video.release()

proces = ProcessVideo()
proces.load_input()