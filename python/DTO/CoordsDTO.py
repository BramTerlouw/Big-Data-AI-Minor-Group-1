class CoordsDTO:
    def __init__(self, bounding_box):
        self._top_left = bounding_box[0]
        self._top_right = bounding_box[1]
        self._bottom_left = bounding_box[2]
        self._bottom_right = bounding_box[3]

    @property
    def top_left(self):
        return self._top_left

    @top_left.setter
    def top_left(self, value):
        self._top_left = value

    @property
    def top_right(self):
        return self._top_right

    @top_right.setter
    def top_right(self, value):
        self._top_right = value

    @property
    def bottom_left(self):
        return self._bottom_left

    @bottom_left.setter
    def bottom_left(self, value):
        self._bottom_left = value

    @property
    def bottom_right(self):
        return self._bottom_right

    @bottom_right.setter
    def bottom_right(self, value):
        self._bottom_right = value
