import numpy

from Debug import Debug
from DTO.CoordsDTO import CoordsDTO

debug = Debug()


class Distance:
    def __init__(self):
        self.reference_width = 32

    def get_distance_humans(
            self,
            paddle_width: int,
            coords_human: list[CoordsDTO]
    ) -> int:
        coords_human_1 = coords_human[0]
        coords_human_2 = coords_human[1]

        if coords_human_1.top_left < coords_human_2.top_left:
            return self.calc_distance(paddle_width, coords_human_2.top_left,  coords_human_1.top_left)
        else:
            return self.calc_distance(paddle_width, coords_human_1.top_left, coords_human_2.top_left)

    def get_distance(
            self,
            paddle_width: int,
            coords_paddle: CoordsDTO,
            coords_humans: list[CoordsDTO],
            pos: str
    ) -> int:
        if pos == 'left':
            coords = self.get_human_left(coords_humans)
            return self.calc_distance(
                paddle_width,
                coords_paddle.top_left,
                coords.bottom_left,
            )
        else:
            coords = self.get_human_right(coords_humans)
            return self.calc_distance(
                paddle_width,
                coords.top_left,
                coords_paddle.bottom_left
            )

    def get_player_pos(
            self,
            coords_paddle: CoordsDTO,
            coords_humans: list[CoordsDTO],
    ):
        h1_center = coords_humans[0].bottom_left - ((coords_humans[0].bottom_left - coords_humans[0].top_right) / 2)
        h2_center = coords_humans[1].bottom_left - ((coords_humans[1].bottom_left - coords_humans[1].top_right) / 2)
        p_center = coords_paddle.bottom_left - ((coords_paddle.bottom_left - coords_paddle.top_right) / 2)

        has_paddle = self.get_human_with_paddle(h1_center, h2_center, p_center)
        return self.set_player_without_paddle(has_paddle, p_center)

    @classmethod
    def set_player_without_paddle(
            cls,
            has_paddle: float,
            p_center: float
    ) -> str:
        if has_paddle < p_center:
            return 'right'
        else:
            return 'left'

    @classmethod
    def calc_width_paddle(
            cls,
            coords_paddle: numpy.ndarray
    ) -> int:
        return int(coords_paddle[0][2] - coords_paddle[0][0])

    @classmethod
    def calc_distance(
            cls,
            paddle_width: int,
            big_coord: float,
            small_coord: float
    ) -> int:
        return int(32 / paddle_width * (big_coord - small_coord))

    @classmethod
    def get_human_left(
            cls,
            coords_humans: list[CoordsDTO]
    ) -> CoordsDTO:
        if coords_humans[0].top_left < coords_humans[1].top_left:
            return coords_humans[0]
        else:
            return coords_humans[1]

    @classmethod
    def get_human_right(
            cls,
            coords_humans: list[CoordsDTO]
    ) -> CoordsDTO:
        if coords_humans[0].top_left > coords_humans[1].top_left:
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

        return [CoordsDTO(coords_humans[first_index]), CoordsDTO(coords_humans[second_index])]
