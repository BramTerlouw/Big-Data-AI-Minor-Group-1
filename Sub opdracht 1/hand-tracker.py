# V: Python 3.9.13
# pip install cvzone
# pip install mediapipe

import cv2
import math
import cvzone
import numpy as np
from cvzone.HandTrackingModule import HandDetector



detector = HandDetector(detectionCon=0.8, maxHands=2)
cap = cv2.VideoCapture(0)
cap.set(3, 1280)
cap.set(4, 720)



x = [300, 245, 200, 170, 145, 130, 112, 103, 93, 87, 80, 75, 70, 67, 62, 59, 57]    # Raw Data
y = [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100]           # Corrosponding CM values
coff = np.polyfit(x,y,2)
average_hand_width = 8



# Diagonal of points is sqrt of width + sqrt of height
def calc_diagonal(p1, p2):
    x1, y1 = p1
    x2, y2 = p2
    return math.sqrt((y2-y1)**2 + (x2-x1)**2)



def calc_distance_cam(p1, p2):
    diagonal_distance = calc_diagonal(p1, p2)

    # Get A, B and C for equation y = Ax^2 + Bx + C
    A, B, C = coff

    # Distance between points increases and decreases depending on camera distance
    return A*diagonal_distance**2 + B*diagonal_distance + C



def calc_distance_hands(hand_p1, hand_p2, hand_c1, hand_c2):
    diagonal_distance_reference = calc_diagonal(hand_p1, hand_p2)
    diagonal_distance_hands = calc_diagonal(hand_c1, hand_c2)

    return average_hand_width / diagonal_distance_reference * diagonal_distance_hands



def set_bound_box(img, x, y, w, h):
    # Add border box to hand
    cv2.rectangle(img, (x,y), (x+w, y+h), (255,0,255), 3)

    # Add distance to hand
    cvzone.putTextRect(img, f'{int(distance)} cm', (x, y))




while True:
    success, img = cap.read()
    hands= detector.findHands(img, draw=False)

    if hands:
        hand1 = hands[0]
        landmark_list1 = hand1["lmList"]
        x, y, w, h = hand1["bbox"]
        center_point1 = hand1["center"]
        handType1 = hand1["type"]

        distance = calc_distance_cam(landmark_list1[5][:2], landmark_list1[17][:2])
        set_bound_box(img, x, y, w, h)

        if len(hands) == 2:
            hand2 = hands[1]
            landmark_list2 = hand2["lmList"]
            x, y, w, h = hand2["bbox"]
            center_point2 = hand2["center"]
            handType2 = hand2["type"]

            distance = calc_distance_cam(landmark_list2[5][:2], landmark_list2[17][:2])
            set_bound_box(img, x, y, w, h)

            length, info, img = detector.findDistance(center_point1, center_point2, img)
            distance_between_hands = calc_distance_hands(landmark_list1[5][:2], landmark_list1[17][:2], center_point1, center_point2)

            cvzone.putTextRect(img, f'Distance between hands: {int(distance_between_hands)}', (100, 75), scale=3, offset=20)

    cv2.imshow("image", img)
    cv2.waitKey(1)