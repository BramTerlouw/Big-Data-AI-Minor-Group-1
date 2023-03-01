import numpy
import cv2

from Debug import Debug

debug = Debug()


class Distance:
    def __init__(self):
        self.reference_width = 32

    def get_distance_humans(
            self,
            frame: numpy.ndarray,
            paddle_width: int,
            coords_human: numpy.ndarray
    ) -> int:
        h1_x1, h1_y1, h1_x2, h1_y2 = coords_human[0]
        print(coords_human[0])
        h2_x1, h2_y1, h2_x2, h2_y2 = coords_human[1]

        if h1_x1 < h2_x1:
            distance = self.calc_distance(paddle_width, h2_x1, h1_x2)
            # debug.draw_distance(
            #     frame,
            #     h2_x1,
            #     h1_x2,
            #     max(h1_y1, h2_y1),
            #     h1_x2,
            #     distance
            # )
            return self.calc_distance(paddle_width, h2_x1, h1_x2)
        else:
            distance = self.calc_distance(paddle_width, h1_x1, h2_x2)
            # debug.draw_distance(
            #     frame,
            #     h1_x1,
            #     h2_x2,
            #     max(h1_y1, h2_y1),
            #     h2_x2,
            #     distance
            # )
            return self.calc_distance(paddle_width, h1_x1, h2_x2)

    def get_distance(
            self,
            frame: numpy.ndarray,
            padel_width: int,
            coords_paddle: numpy.ndarray,
            coords_humans: numpy.ndarray,
            pos: str
    ) -> int:

        px1, py1, px2, py2 = coords_paddle[0]
        if pos == 'left':
            hx1, hy1, hx2, hy2 = self.get_human_left(coords_humans)
            distance = self.calc_distance(
                padel_width,
                px1,
                hx2
            )
            # debug.draw_distance(
            #     frame,
            #     hx2,
            #     px1,
            #     py1,
            #     hx2,
            #     distance
            # )
            return distance
        else:
            hx1, hy1, hx2, hy2 = self.get_human_right(coords_humans)
            distance = self.calc_distance(
                padel_width,
                hx1,
                px2
            )
            # debug.draw_distance(
            #     frame,
            #     px2,
            #     hx1,
            #     py1,
            #     px2,
            #     distance
            # )
            return distance

    def get_player_pos(
            self,
            frame: numpy.ndarray,
            coords: dict
    ):
        h1_x1, h1_y1, h1_x2, h1_y2 = coords[1][0]
        h2_x1, h2_y1, h2_x2, h2_y2 = coords[1][1]
        px1, py1, px2, py2 = coords[0][0]

        h1_center = h1_x2 - ((h1_x2 - h1_x1) / 2)
        h2_center = h2_x2 - ((h2_x2 - h2_x1) / 2)
        p_center = px2 - ((px2 - px1) / 2)

        has_paddle = self.get_player_with_padel(h1_center, h2_center, p_center)
        return self.set_player_without_padel(frame, has_paddle, p_center)

    @classmethod
    def set_player_without_padel(
            cls,
            frame: numpy.ndarray,
            has_paddle: float,
            p_center: float
    ) -> None:
        if has_paddle < p_center:
            # debug.draw_pos_player_without_padel(
            #     frame,
            #     10,
            #     (frame.shape[0] - 3),
            #     325, (frame.shape[0] - 20),
            #     'Human without paddle is on the right'
            # )
            return 'right'
        else:
            # debug.draw_pos_player_without_padel(
            #     frame,
            #     10,
            #     (frame.shape[0] - 3),
            #     325,
            #     (frame.shape[0] - 20),
            #     'Human without paddle is on the left'
            # )
            return 'left'

    def get_frame_dimensions(
            frame: numpy.ndarray
    ) -> tuple:
        return frame.shape[1], frame.shape[0]

    @classmethod
    def calc_width_paddle(
            cls,
            coords_paddle: numpy.ndarray
    ) -> int:
        return int(coords_paddle[0][2] - coords_paddle[0][0])

    @classmethod
    def calc_distance(
            cls,
            padel_width: int,
            big_coord: float,
            small_coord: float
    ) -> int:
        return int(32 / padel_width * (big_coord - small_coord))

    @classmethod
    def get_human_xcoords(
            cls,
            coords_humans: dict
    ) -> tuple:
        return coords_humans[0][0], coords_humans[1][0]

    def get_human_left(
            self,
            coords_humans: dict
    ) -> int:
        human1_x1, human2_x1 = self.get_human_xcoords(coords_humans)

        if human1_x1 < human2_x1:
            return coords_humans[0]
        else:
            return coords_humans[1]

    def get_human_right(
            self,
            coords_humans: dict
    ) -> int:
        human1_x1, human2_x1 = self.get_human_xcoords(coords_humans)

        if human1_x1 > human2_x1:
            return coords_humans[0]
        else:
            return coords_humans[1]

    @classmethod
    def get_player_with_padel(
            cls,
            h1_center: float,
            h2_center: float,
            p_center: float
    ) -> float:
        if max(h1_center, p_center) - min(h1_center, p_center) > max(h2_center, p_center) - min(h2_center, p_center):
            return h2_center
        else:
            return h1_center

    @classmethod
    def get_biggest_two_humans(cls, coords_humans):
        first_height = float('-inf')
        second_height = float('-inf')
        first_index = 0
        second_index = 0

        for i in range(len(coords_humans)):
            height = coords_humans[i][3] - coords_humans[i][1]
            if height > first_height:
                second_height = first_height
                second_index = first_index
                first_height = height
                first_index = i
            elif height > second_height:
                second_index = i
                second_height = height
        return [coords_humans[first_index], coords_humans[second_index]]
