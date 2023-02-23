
import numpy
import cv2

from Debug import Debug
debug = Debug()

# Steps:
# Step 1, Get Frame Coords pixel height and width
# Step 2, Calculate distance between humans (in forground so people in tribune don't get recognized) and paddles
# Step 3, Calculate distance between hands (in for ground so people in tribune don't get recognized) and paddles
# Step 4, Determine which human is holding the paddle we can calc this or make an AI for it?
# Step 5, remember if human that's holding paddle on left or right and save static in class // memory
# Step 6, For next frame we use the human that we determined is holding the paddle as the paddler
#         and the other one the slayer
# Step 7, From here we can return correct distances and make scores ETC

# Extra. If we need to calc height from ground or for example speed or time Make
#        another class of it that uses this class internal. Always make sure these
#        class runs as first so we have the correct distance set.

# Extra note !!!PLEASE USE OBJECT TYPE HINTING!!! and make file name same as class.

class Distance:
    def __init__(self, reference_width: int):
        self.reference_width = reference_width
        self.human_is_left = None

    def get_frame_dimensions(frame: numpy.ndarray):
        return frame.shape[1], frame.shape[0]
    
    def calc_width_paddle(self, coordinates_paddle: numpy.ndarray):
        return int(coordinates_paddle[0][2] - coordinates_paddle[0][0])
    
    def calc_distance_humans(
        self,
        frame: numpy.ndarray,
        paddle_width: int,
        coordinates_human: numpy.ndarray
    ):
        h1_x1, h1_y1, h1_x2, h1_y2 = coordinates_human[0]
        h2_x1, h2_y1, h2_x2, h2_y2 = coordinates_human[1]

        if h1_x1 < h2_x1:
            distance = int(32 / paddle_width * (h2_x1 - h1_x2))
            
            debug.draw_line(
                frame,
                int(h1_x2),
                int(max(h1_y1, h2_y1)),
                int(h2_x1),
                int(max(h1_y1, h2_y1)),
                (255, 255, 255),
                2
            )
            debug.draw_text(
                frame,
                f"{distance} CM",
                int(h1_x2) + 15,
                int(max(h1_y1, h2_y1)) - 5,
                0.6,
                (255, 255, 255),
                2
            )
        else:
            distance = int(32 / paddle_width * (h1_x1 - h2_x2))

            debug.draw_line(
                frame,
                int(h2_x2),
                int(max(h1_y1, h2_y1)),
                int(h1_x1),
                int(max(h1_y1, h2_y1)),
                (255, 255, 255),
                2
            )
            debug.draw_text(
                frame,
                f"{distance} CM",
                int(h2_x2) + 15,
                int(max(h1_y1, h2_y1)) - 5,
                0.6,
                (255, 255, 255),
                2
            )

    def calc_distance(
        self, 
        frame: numpy.ndarray, 
        coordinates_paddle: numpy.ndarray, 
        coordinates_human: numpy.ndarray
    ):
        px1, py1, px2, py2 = coordinates_paddle[0]

        if self.human_is_left:
            hx1, hy1, hx2, hy2 = coordinates_human[0] if coordinates_human[0][0] < coordinates_human[1][0] else coordinates_human[1]
            distance = int(32 / (px2 - px1) * (px1 - hx2))

            debug.draw_line(
                frame,
                int(hx2),
                int(py1),
                int(px1),
                int(py1),
                (255, 255, 255),
                2
            )
            debug.draw_text(
                frame,
                f"{distance} CM",
                int(hx2) + 15,
                int(py1) - 5,
                0.6,
                (255, 255, 255),
                2
            )
        else:
            hx1, hy1, hx2, hy2 = coordinates_human[0] if coordinates_human[0][0] > coordinates_human[1][0] else coordinates_human[1]
            distance = int(32 / (px2 - px1) * (hx1 - px2))

            debug.draw_line(
                frame,
                int(px2),
                int(py1),
                int(hx1),
                int(py1),
                (255, 255, 255),
                2
            )
            debug.draw_text(
                frame,
                f"{distance} CM",
                int(px2) + 15,
                int(py1) - 5,
                0.6,
                (255, 255, 255),
                2
            )

    def set_player_pos(self, frame, coordinates: dict):
        h1_x1, h1_y1, h1_x2, h1_y2 = coordinates[1][0]
        h2_x1, h2_y1, h2_x2, h2_y2 = coordinates[1][1]
        px1, py1, px2, py2 = coordinates[0][0]

        h1_center = h1_x2 - ((h1_x2 - h1_x1) / 2)
        h2_center = h2_x2 - ((h2_x2 - h2_x1) / 2)
        p_center = px2 - ((px2 - px1) / 2)

        if abs(h1_center - p_center) > abs(h2_center - p_center):
            has_paddle = h2_center
        else:
            has_paddle = h1_center
        
        if has_paddle < p_center:
            self.human_is_left = False
            debug.draw_text_box(frame, 10, (frame.shape[0] - 3), 325, (frame.shape[0] - 20), 'Human without paddle is on the right')
            # debug.draw_text(frame, 'Human without paddle is on the right', 10, frame.shape[0] - 10, 0.5, (0,0,0), 2)
        else:
            self.human_is_left = True
            # debug.draw_text(frame, 'Human without paddle is on the Left', 10, frame.shape[0] - 10, 0.5, (0,0,0), 2)
            debug.draw_text_box(frame, 10, (frame.shape[0] - 3), 325, (frame.shape[0] - 20), 'Human without paddle is on the right')

    def __init__(self):
        print('init')
