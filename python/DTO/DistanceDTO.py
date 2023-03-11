class DistanceDTO:
    def __init__(self):
        self.distance_between_humans: int = 0
        self.pos_player_without_paddle: int = 0
        self.distance_between_human_player: int = 0

    @property
    def distance_between_humans(self) -> int:
        return self.distance_between_humans

    @distance_between_humans.setter
    def distance_between_humans(self, value: int):
        self.distance_between_humans = value

    @property
    def pos_player_without_paddle(self) -> int:
        return self.pos_player_without_paddle

    @pos_player_without_paddle.setter
    def pos_player_without_paddle(self, value: int):
        self.pos_player_without_paddle = value

    @property
    def distance_between_human_player(self) -> int:
        return self.distance_between_human_player

    @distance_between_human_player.setter
    def distance_between_human_player(self, value: int):
        self.distance_between_human_player = value

    # Can add more in future...
