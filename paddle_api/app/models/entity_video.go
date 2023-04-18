package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type EntityVideo struct {
	Id                primitive.ObjectID `bson:"_id,omitempty"  json:"videoID,omitempty"`
	InputFilename     *string            `bson:"input_filename,omitempty"  json:"input_filename,omitempty"`
	ProcessedFilename *string            `bson:"processed_filename,omitempty"  json:"processed_filename,omitempty"`
	UserId            *string            `bson:"userId,omitempty"  json:"userId,omitempty"`
	Status            *string            `bson:"status,omitempty"  json:"status,omitempty"`
	Description       *string            `bson:"description,omitempty"  json:"description,omitempty"`
	UploadDate        *time.Time         `bson:"uploadDate,omitempty"  json:"uploadDate,omitempty"`
	OutputDate        *time.Time         `bson:"outputDate,omitempty"  json:"outputDate,omitempty"`
	Score             *[]ScoreData       `bson:"score,omitempty"  json:"score,omitempty"`
}

type InputCreateVideo struct {
	Id            primitive.ObjectID
	InputFilename string
	UserId        string
	Status        string
	Description   string
	UploadDate    time.Time
}

type InputUpdateVideo struct {
	Id                primitive.ObjectID
	Status            string
	ProcessedFilename string
	OutputDate        *time.Time
	Score             []ScoreData
}

type ScoreData struct {
	DistHumans        int    `bson:"distHumans,omitempty" json:"dist_humans"`
	PlayerPos         string `bson:"playerPos,omitempty" json:"player_pos"`
	PlayerHeight      int    `bson:"playerHeight,omitempty" json:"player_height"`
	DistPlayerPaddle  int    `bson:"distPlayerPaddle,omitempty" json:"dist_player_paddle"`
	PossibleIntersect bool   `bson:"possibleIntersect,omitempty" json:"possible_intersect"`
}
