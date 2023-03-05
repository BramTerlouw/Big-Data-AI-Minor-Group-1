class CoordsDTO:
    def __init__(self, bounding_box):
        self._left = bounding_box[0]
        self._top = bounding_box[1]
        self._right = bounding_box[2]
        self._bottom = bounding_box[3]

    @property
    def left(self):
        return self._left

    @left.setter
    def left(self, value):
        self._left = value

    @property
    def right(self):
        return self._right

    @right.setter
    def right(self, value):
        self._right = value

    @property
    def bottom(self):
        return self._bottom

    @bottom.setter
    def bottom(self, value):
        self._bottom = value

    @property
    def top(self):
        return self._top

    @top.setter
    def top(self, value):
        self._top = value
