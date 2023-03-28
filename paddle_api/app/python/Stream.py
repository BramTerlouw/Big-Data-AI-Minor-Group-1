# import cv2
# import numpy as np
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("-r", "--room", type=str, help="Room number", required=True)
args = vars(parser.parse_args())

room = args['room']

print("Script worked, room: " + room)

