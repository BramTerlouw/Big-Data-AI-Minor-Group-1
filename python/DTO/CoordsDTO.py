class CoordsDTO:
    def __init__(self, bounding_box):
        self._left = bounding_box[0]
        self._top = bounding_box[1]
        self._right = bounding_box[2]
        self._bottom = bounding_box[3]

    @property
    def left(self):
        return self._left

    @property
    def right(self):
        return self._right

    @property
    def bottom(self):
        return self._bottom

    @property
    def top(self):
        return self._top
