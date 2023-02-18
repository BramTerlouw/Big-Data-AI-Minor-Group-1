
class Distance:

    # Steps:
    # Step 1, Get Frame Coords pixel height and width
    # Step 2, Calculate distance between humans (in for ground so people in tribune don't get recognized) and paddles
    # Step 3, Calculate distance between hands (in for ground so people in tribune don't get recognized) and paddles
    # Step 4, Determine which human is holding the paddle we can calc this or make an AI for it?
    # Step 5, remember if human that's holding paddle on left or right and save static in class // memory
    # Step 6, For next frame we use the human that we determined is holding the paddle as the paddler
    #         and the other one the slayer
    # Step 7, From here we can return correct distances and make scores ETC

    # Extra. If we need to calc height from ground or for example speed or time Make
    #        another class of it that uses this class internal. Always make sure these
    #        class runs as first so we have the correct distance set.

    # Extra note !!!PLEASE USE OBJECT TYPE HINTING!!! and make file name same as class.
    def __init__(self):
        print('init')
