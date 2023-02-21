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
    ):
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
    ):
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
    ):
        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (0, 255, 0),
            2
        )
    
    def draw_paddle(
        self,
        frame: numpy.ndarray,
        x1: int,
        y1: int,
        x2: int,
        y2: int
    ):
        cv2.rectangle(
            frame,
            (x1, y1),
            (x2, y2),
            (255, 0, 0),
            2
        )