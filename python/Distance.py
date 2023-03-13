from typing import Any

import numpy
import numpy as np

from Debug import Debug
from DTO.CoordsDTO import CoordsDTO

debug = Debug()


class Distance:
    def __init__(self):
        self.reference_width = 32

    def get_distance_humans(
            self,
            frame,
            paddle_width: int,
            coords_human: list[CoordsDTO]
    ) -> int:
        coords_human_1 = coords_human[0]
        coords_human_2 = coords_human[1]

        if coords_human_1.left < coords_human_2.left:
            distance = self.calc_distance(paddle_width, coords_human_2.left, coords_human_1.right)
            debug.draw_distance(
                frame,
                coords_human_2.left,
                coords_human_1.right,
                max(coords_human_1.top, coords_human_2.top),
                coords_human_1.right,
                distance
            )
            return distance
        else:
            distance = self.calc_distance(paddle_width, coords_human_1.left, coords_human_2.right)
            debug.draw_distance(
                frame,
                coords_human_1.left,
                coords_human_2.right,
                max(coords_human_1.top, coords_human_2.top),
                coords_human_2.right,
                distance
            )
            return distance

    def get_distance(self, frame, paddle_width: int, coords_paddle: CoordsDTO, coords_humans: list[CoordsDTO],
                     pos: str) -> int:
        if pos == 'left':
            coords = self.get_human_left(coords_humans)
            distance = self.calc_distance(
                paddle_width,
                coords_paddle.left,
                coords.right
            )
            self.handle_distance(
                frame,
                coords_paddle.left,
                coords.right,
                coords_paddle.top,
                coords_paddle.bottom,
                distance
            )
            return distance
        else:
            coords = self.get_human_right(coords_humans)
            distance = self.calc_distance(
                paddle_width,
                coords.left,
                coords_paddle.right
            )
            self.handle_distance(
                frame,
                coords.left,
                coords_paddle.right,
                coords_paddle.top,
                coords_paddle.bottom,
                distance
            )
            return distance

    @classmethod
    def handle_distance(cls, frame, start_x: int, end_x: int, y: int, y2: int, distance: int):
        if distance > 0:
            debug.draw_distance(frame, start_x, end_x, y, end_x, distance)
        else:
            debug.draw_possible_intersect(
                frame,
                (int(start_x), int(y + (y - (y - ((y2 - y) / 2)))))
            )

    def get_player_pos(
            self,
            frame,
            coords_paddle: CoordsDTO,
            coords_humans: list[CoordsDTO],
    ):
        h1_center = coords_humans[0].right - ((coords_humans[0].right - coords_humans[0].left) / 2)
        h2_center = coords_humans[1].right - ((coords_humans[1].right - coords_humans[1].left) / 2)
        p_center = coords_paddle.right - ((coords_paddle.right - coords_paddle.left) / 2)

        has_paddle = self.get_human_with_paddle(h1_center, h2_center, p_center)
        return self.set_player_without_paddle(frame, has_paddle, p_center)

    @classmethod
    def set_player_without_paddle(
            cls,
            frame,
            has_paddle: float,
            p_center: float
    ) -> str:
        if has_paddle < p_center:
            debug.draw_pos_player_without_paddle(
                frame,
                10,
                (frame.shape[0] - 3),
                325, (frame.shape[0] - 20),
                'Human without paddle is on the right'
            )
            return 'right'
        else:
            debug.draw_pos_player_without_paddle(
                frame,
                10,
                (frame.shape[0] - 3),
                325,
                (frame.shape[0] - 20),
                'Human without paddle is on the left'
            )
            return 'left'

    @classmethod
    def calc_width_paddle(
            cls,
            coords_paddle: numpy.ndarray
    ) -> int:
        return np.int32(np.round(coords_paddle[0][2] - coords_paddle[0][0]))

    @classmethod
    def calc_distance(
            cls,
            paddle_width: int,
            big_coord: float,
            small_coord: float
    ) -> int:
        return np.int32(np.round(32 / paddle_width * (big_coord - small_coord)))

    @classmethod
    def get_human_left(
            cls,
            coords_humans: list[CoordsDTO]
    ) -> CoordsDTO:
        if coords_humans[0].left < coords_humans[1].left:
            return coords_humans[0]
        else:
            return coords_humans[1]

    @classmethod
    def get_human_right(
            cls,
            coords_humans: list[CoordsDTO]
    ) -> CoordsDTO:
        if coords_humans[0].left > coords_humans[1].left:
            return coords_humans[0]
        else:
            return coords_humans[1]

    @classmethod
    def get_human_with_paddle(
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
    def get_biggest_two_humans(
            cls,
            coords_humans: dict[Any, list]
    ) -> list[CoordsDTO]:
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

        return [CoordsDTO(coords_humans[first_index]), CoordsDTO(coords_humans[second_index])]
