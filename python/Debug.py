from typing import Union
from numpy import ndarray

import cv2
import numpy


class Debug:

    def draw_line(
            self,
            frame: numpy.ndarray,
            x1: int,
            y1: int,
            x2: int,
            y2: int,
            color: tuple,
            thickness: int
    ) -> None:
        cv2.line(
            frame,
            (x1, y1),
            (x2, y2),
            color,
            thickness
        )

    def draw_text(
            self,
            frame: numpy.ndarray,
            text: str,
            x: int,
            y: int,
            font_size: float,
            color: tuple,
            thickness: int
    ) -> None:
        cv2.putText(
            frame,
            text,
            (x, y - 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            font_size,
            color,
            thickness
        )

    def draw_human(
            self,
            frame: numpy.ndarray,
            x1: int,
            y1: int,
            x2: int,
            y2: int
    ) -> None:
        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            1
        )

    def draw_paddle(
            self,
            frame: numpy.ndarray,
            x1: int,
            y1: int,
            x2: int,
            y2: int
    ) -> None:
        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (153, 204, 0),
            1
        )

    def draw_pos_player_without_padel(
            self,
            frame,
            x1: int,
            y1: int,
            x2: int,
            y2: int,
            text
    ) -> None:
        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (255, 255, 255),
            -1
        )
        cv2.putText(
            frame,
            text,
            (x1, y1 - 5),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 0, 0),
            1
        )
    
    def draw_distance(self, frame, x1, x2, y, txt_coord, distance):
        self.draw_line(
                frame,
                int(x1),
                int(y),
                int(x2),
                int(y),
                (255, 255, 255),
                2
            )
        self.draw_text(
            frame,
            f"{distance} CM",
            int(txt_coord) + 15,
            int(y) - 5,
            0.6,
            (255, 255, 255),
            2
        )
    
    def show_class(
        self,
        frame: numpy.ndarray,
        bounding_box: numpy.ndarray,
        class_id: int
    ) -> Union[ndarray, ndarray]:

        if class_id == 0:
            self.draw_paddle(
                frame,
                int(bounding_box[0]),
                int(bounding_box[1]),
                int(bounding_box[2]),
                int(bounding_box[3])
            )
            self.draw_text(
                frame,
                f"Label: {class_id}",
                int(bounding_box[0]),
                int(bounding_box[1]),
                0.5,
                (153, 204, 0),
                2
            )
        else:
            self.draw_human(
                frame,
                int(bounding_box[0]),
                int(bounding_box[1]),
                int(bounding_box[2]),
                int(bounding_box[3])
            )
            self.draw_text(
                frame,
                f"Label: {class_id}",
                int(bounding_box[0]),
                int(bounding_box[1]),
                0.5,
                (0, 255, 0),
                2
            )
        return frame