class DistanceDTO:
    def __init__(self):
        self.distance_between_humans = 0
        self.pos_player_without_paddle = 0
        self.distance_between_human_player = 0

    @property
    def distance_between_humans(self):
        return self.distance_between_humans

    @distance_between_humans.setter
    def distance_between_humans(self, value):
        self.distance_between_humans = value

    @property
    def pos_player_without_paddle(self):
        return self.pos_player_without_paddle

    @pos_player_without_paddle.setter
    def pos_player_without_paddle(self, value):
        self.pos_player_without_paddle = value

    @property
    def distance_between_human_player(self):
        return self.distance_between_human_player

    @distance_between_human_player.setter
    def distance_between_human_player(self, value):
        self.distance_between_human_player = value

    # Can add more in future...
