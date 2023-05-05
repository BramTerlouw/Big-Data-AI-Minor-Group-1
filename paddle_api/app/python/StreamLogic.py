from FrameInput import FrameInput


def stream_logic(frame):
    frame_input = FrameInput(frame)
    frame_input.load_input()
    return frame_input.get_result()
