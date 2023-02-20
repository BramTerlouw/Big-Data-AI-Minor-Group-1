
import numpy
import cv2

class Distance:
    def __init__(self, reference_width: int):
        self.reference_width = reference_width
        self.human_is_left = None

    # Steps:
    # Step 1, Get Frame Coords pixel height and width
    def get_frame_dimensions(frame: numpy.ndarray):
        return frame.shape[1], frame.shape[0]
    
    # Step 2, Calculate distance between humans (in forground so people in tribune don't get recognized) and paddles
    # Step 3, Calculate distance between hands (in for ground so people in tribune don't get recognized) and paddles
    # Step 4, Determine which human is holding the paddle we can calc this or make an AI for it?
    # Step 5, remember if human that's holding paddle on left or right and save static in class // memory
    # Step 6, For next frame we use the human that we determined is holding the paddle as the paddler
    #         and the other one the slayer

    # Step 7, From here we can return correct distances and make scores ETC
    def calc_distance(
        self, 
        frame: numpy.ndarray, 
        coordinates_paddle: numpy.ndarray, 
        coordinates_human: numpy.ndarray
    ):
        
        paddle_x1, paddle_y1, paddle_x2, paddle_y2 = coordinates_paddle
        human_x1, human_y1, human_x2, human_y2 = coordinates_human

        if self.human_is_left:
            distance = int(self.reference_width / (paddle_x2, paddle_y1) * (human_x1 - paddle_x2))
        else:
            distance = int(self.reference_width / (paddle_x2, paddle_y1) * (paddle_x1 - human_x2))

        cv2.line(
            frame, 
            (paddle_x2, paddle_y1), 
            (human_x1, int(paddle_y1)), 
            (255, 0, 0), 
            2
        )

        cv2.putText(
            frame, 
            f"{distance} CM", 
            (paddle_x2, paddle_y1 - 5), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            0.6,
            (255, 0, 0), 
            1
        )

    # Extra. If we need to calc height from ground or for example speed or time Make
    #        another class of it that uses this class internal. Always make sure these
    #        class runs as first so we have the correct distance set.

    # Extra note !!!PLEASE USE OBJECT TYPE HINTING!!! and make file name same as class.
    def __init__(self):
        print('init')
