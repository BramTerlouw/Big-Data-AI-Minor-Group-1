import cv2

from ObjectDetectionV8 import ObjectDetectionV8
v8 = ObjectDetectionV8.get_instance()

class ProcessVideo:

    def __init__(self):
        print('init')
    

    def load_input(self):
        video = cv2.VideoCapture("videos/camera4.mp4")
        fps = video.get(cv2.CAP_PROP_FPS)

        frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

        fourcc = cv2.VideoWriter_fourcc(*'mp4v')  # Codec for the new video file
        out_video = cv2.VideoWriter("videos/output_video.mp4", fourcc, fps, (frame_width, frame_height))

        while True:
            ret, frame = video.read()

            if not ret:
                break

            processed_frame = v8.generate_frame(frame)

            out_video.write(frame)
            cv2.imshow("Processed Frame", frame)

            if cv2.waitKey(1) == ord('q'):
                break

        video.release()
        out_video.release()

        # Close all windows (optional, for debugging purposes)
        cv2.destroyAllWindows()

proces = ProcessVideo()
proces.load_input()