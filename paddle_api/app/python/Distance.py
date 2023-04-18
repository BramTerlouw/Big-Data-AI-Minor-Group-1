import numpy
import numpy as np

from DTO.CoordsDTO import CoordsDTO
from BoundingBoxRenderer import BoundingBoxRenderer


class Distance:
    def __init__(self):
        self.reference_width = 32
        self.bounding_box_renderer = BoundingBoxRenderer()

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
            self.bounding_box_renderer.draw_distance(
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
            self.bounding_box_renderer.draw_distance(
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

    def handle_distance(self, frame, start_x: int, end_x: int, y: int, y2: int, distance: int):
        if distance > 0:
            self.bounding_box_renderer.draw_distance(frame, start_x, end_x, y, end_x, distance)
        else:
            self.bounding_box_renderer.draw_possible_intersect(
                frame,
                (int(start_x), int(y + (y - (y - ((y2 - y) / 2)))))
            )

    def set_player_without_paddle(
            self,
            frame,
            has_paddle: float,
            p_center: float
    ) -> str:
        if has_paddle < p_center:
            self.bounding_box_renderer.draw_pos_player_without_paddle(
                frame,
                10,
                (frame.shape[0] - 3),
                325, (frame.shape[0] - 20),
                'Human without paddle is on the right'
            )
            return 'right'
        else:
            self.bounding_box_renderer.draw_pos_player_without_paddle(
                frame,
                10,
                (frame.shape[0] - 3),
                325,
                (frame.shape[0] - 20),
                'Human without paddle is on the left'
            )
            return 'left'

    def get_player_pos(self, frame, coords_paddle: CoordsDTO, coords_humans: list[CoordsDTO]):
        h1_center, h2_center = [c.right - ((c.right - c.left) / 2) for c in coords_humans]
        p_center = coords_paddle.right - ((coords_paddle.right - coords_paddle.left) / 2)
        has_paddle = self.get_human_with_paddle(h1_center, h2_center, p_center)
        return self.set_player_without_paddle(frame, has_paddle, p_center)

    @classmethod
    def calc_width_paddle(cls, coords_paddle: numpy.ndarray) -> int:
        return np.int32(np.round(coords_paddle[0][2] - coords_paddle[0][0]))

    @classmethod
    def calc_distance(cls, paddle_width: int, big_coord: float, small_coord: float) -> int:
        return np.int32(np.round(32 / paddle_width * (big_coord - small_coord)))

    @classmethod
    def get_human_left(cls, coords_humans: list[CoordsDTO]) -> CoordsDTO:
        return min(coords_humans, key=lambda c: c.left)

    @classmethod
    def get_human_right(cls, coords_humans: list[CoordsDTO]) -> CoordsDTO:
        return max(coords_humans, key=lambda coords: coords.left)

    @classmethod
    def get_human_with_paddle(cls, h1_center: float, h2_center: float, p_center: float) -> float:
        return h2_center if abs(h2_center - p_center) < abs(h1_center - p_center) else h1_center

    @classmethod
    def get_biggest_two_humans(cls, coords_humans: list) -> list[CoordsDTO]:
        sorted_humans = sorted(coords_humans, key=lambda coords: coords[3] - coords[1], reverse=True)
        return [CoordsDTO(human) for human in sorted_humans[:2]]

    def get_height_of_player(self, frame, coords_humans: list[CoordsDTO], paddle_width: int, pos: str) -> int:
        if pos == 'left':
            player = self.get_human_left(coords_humans)
        else:
            player = self.get_human_right(coords_humans)

        player_height = self.calc_distance(
                paddle_width,
                player.bottom,
                player.top
        )

        self.bounding_box_renderer.draw_player_height(
            frame,
            player,
            pos,
            player_height
        )

        return player_height