import numpy
import cv2

from Debug import Debug

debug = Debug()


class Distance:
    def __init__(self):
        self.reference_width = 32
        self.human_is_left = None

    def get_distance_humans(
            self,
            frame: numpy.ndarray,
            paddle_width: int,
            coords_human: numpy.ndarray
    ) -> None:
        h1_x1, h1_y1, h1_x2, h1_y2 = coords_human[0]
        h2_x1, h2_y1, h2_x2, h2_y2 = coords_human[1]

        if h1_x1 < h2_x1:
            distance = self.calc_distance(paddle_width, h2_x1, h1_x2)

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
            distance = self.calc_distance(paddle_width, h1_x1, h2_x2)

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

    def get_distance(
            self,
            frame: numpy.ndarray,
            padel_width: int,
            coords_paddle: numpy.ndarray,
            coords_humans: numpy.ndarray
    ) -> None:
        px1, py1, px2, py2 = coords_paddle[0]

        if self.human_is_left:
            hx1, hy1, hx2, hy2 = self.get_human_left(coords_humans)
            distance = self.calc_distance(padel_width, px1, hx2)

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
            hx1, hy1, hx2, hy2 = self.get_human_right(coords_humans)
            distance = self.calc_distance(padel_width, hx1, px2)

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

    def set_player_pos(
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
        self.set_player_without_padel(frame, has_paddle, p_center)

    def get_frame_dimensions(frame: numpy.ndarray) -> tuple:
        return frame.shape[1], frame.shape[0]

    def calc_width_paddle(self, coords_paddle: numpy.ndarray) -> int:
        return int(coords_paddle[0][2] - coords_paddle[0][0])

    def calc_distance(self, padel_width: int, big_coord: float(), small_coord: float()) -> int:
        return int(32 / padel_width * (big_coord - small_coord))

    def get_human_xcoords(self, coords_humans: dict) -> tuple:
        return coords_humans[0][0], coords_humans[1][0]

    def get_human_left(self, coords_humans: dict) -> int:
        human1_x1, human2_x1 = self.get_human_xcoords(coords_humans)

        if human1_x1 < human2_x1:
            return coords_humans[0]
        else:
            return coords_humans[1]

    def get_human_right(self, coords_humans: dict) -> int:
        human1_x1, human2_x1 = self.get_human_xcoords(coords_humans)

        if human1_x1 > human2_x1:
            return coords_humans[0]
        else:
            return coords_humans[1]

    def get_player_with_padel(
            self,
            h1_center: float,
            h2_center: float,
            p_center: float
    ) -> float:
        if max(h1_center, p_center) - min(h1_center, p_center) > max(h2_center, p_center) - min(h2_center, p_center):
            return h2_center
        else:
            return h1_center

    def set_player_without_padel(
            self,
            frame: numpy.ndarray,
            has_paddle: float,
            p_center: float
    ) -> None:
        if has_paddle < p_center:
            self.human_is_left = False
            debug.draw_text_box(
                frame,
                10,
                (frame.shape[0] - 3),
                325, (frame.shape[0] - 20),
                'Human without paddle is on the right'
            )
        else:
            self.human_is_left = True
            debug.draw_text_box(
                frame,
                10,
                (frame.shape[0] - 3),
                325,
                (frame.shape[0] - 20),
                'Human without paddle is on the left'
            )

    def __init__(self):
        print('init')