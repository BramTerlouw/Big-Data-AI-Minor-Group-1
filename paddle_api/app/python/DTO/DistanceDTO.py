class DistanceDTO:
    def __init__(self, distance_between_humans, pos_player_without_paddle, player_height, distance_between_human_player):
        self._distance_between_humans: int = distance_between_humans
        self._pos_player_without_paddle: int = pos_player_without_paddle
        self._player_height: int = player_height
        self._distance_between_human_player: int = distance_between_human_player

    @property
    def distance_between_humans(self) -> int:
        return self._distance_between_humans

    @distance_between_humans.setter
    def distance_between_humans(self, value: int):
        self._distance_between_humans = value

    @property
    def pos_player_without_paddle(self) -> int:
        return self._pos_player_without_paddle

    @pos_player_without_paddle.setter
    def pos_player_without_paddle(self, value: int):
        self._pos_player_without_paddle = value

    @property
    def player_height(self) -> int:
        return self._player_height

    @player_height.setter
    def player_height(self, value: int):
        self._player_height = value

    @property
    def distance_between_human_player(self) -> int:
        return self._distance_between_human_player

    @distance_between_human_player.setter
    def distance_between_human_player(self, value: int):
        self._distance_between_human_player = value

    # Can add more in future...
