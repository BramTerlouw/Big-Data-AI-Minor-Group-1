class CoordsDTO:
    def __init__(self, bounding_box):
        self._left: int = bounding_box[0]
        self._top: int = bounding_box[1]
        self._right: int = bounding_box[2]
        self._bottom: int = bounding_box[3]

    @property
    def left(self) -> int:
        return self._left

    @property
    def right(self) -> int:
        return self._right

    @property
    def bottom(self) -> int:
        return self._bottom

    @property
    def top(self) -> int:
        return self._top
