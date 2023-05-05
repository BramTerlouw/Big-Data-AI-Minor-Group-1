# hier dan een method die de frame ontvangt en door stuurt naar frameinput
# Dan de score hier direct doorgeeft aan de stream.py
# de logica moet er nog in voordat ie naar stream.py maakt maar dat doe ik wel.
# Dus voor nu alleen nog vanuit hier direct terugsturen
from FrameInput import FrameInput


def stream_logic(frame):
    frame_input = FrameInput(frame)
    frame_input.load_input()
    return frame_input.get_result()
