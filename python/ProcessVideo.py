import cv2

from Debug import Debug
from Distance import Distance
from ObjectDetectionV8 import ObjectDetectionV8

v8 = ObjectDetectionV8.get_instance()
distance = Distance()
debug = Debug()


class ProcessVideo:

    def __init__(self):
        print('init')

    def load_input(self):
        video = cv2.VideoCapture("input/camera4.mp4")
        fps = video.get(cv2.CAP_PROP_FPS)

        frame_width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))

        out_video = self.create_output(fps, (frame_width, frame_height))
        self.iterate_frames(video, out_video)

    @classmethod
    def create_output(cls, fps: float, frame_size: tuple):
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        return cv2.VideoWriter("output/output_video.mp4", fourcc, fps, (frame_size[0], frame_size[1]))

    def iterate_frames(self, video, out_video):
        while True:
            ret, frame = video.read()

            if not ret:
                break

            # !!!!! ----- Step 1: Detection ----- !!!!!
            classes = v8.get_classes()
            predictions = v8.generate_predictions(frame)

            if predictions is not None:
                # !!!!! ----- Step 2: Calculation ----- !!!!!
                predictions[1] = distance.get_biggest_two_humans(predictions[1])

                padel_width = distance.calc_width_paddle(predictions[0])
                distance_betw_humans = distance.get_distance_humans(frame, padel_width, predictions[1])
                pos_player_without_padel = distance.get_player_pos(frame, predictions)
                distance_betw_human_player = distance.get_distance(
                    frame, padel_width, predictions[0], predictions[1], pos_player_without_padel
                    )

                # !!!!! ----- Step 3: Show drawing (debug) ----- !!!!!
                self.show_predictions(frame, predictions, classes)
                # Show distance humans?
                # Show who is without padel?
                # Show distance player and padel?

                # !!!!! ----- Step 4: Get/Show score ----- !!!!!

            out_video.write(frame)

        video.release()
        out_video.release()

    def show_predictions(self, frame, predictions, classes):
        for i in range(len(predictions)):
            for y in range(len(predictions[i])):
                debug.show_class(frame, predictions[i][y], self._class_id_to_label(classes, i))

    @classmethod
    def _class_id_to_label(
            cls,
            classes,
            class_id: int
    ) -> int:
        return classes[class_id]


proces = ProcessVideo()
proces.load_input()
