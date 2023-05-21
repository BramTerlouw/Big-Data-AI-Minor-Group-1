package model

import (
	"go.mongodb.org/mongo-driver/bson/primitive"
	"time"
)

type EntitySession struct {
	Id                primitive.ObjectID `bson:"_id,omitempty"  json:"videoID,omitempty"`
	SessionKey        *string            `bson:"session_key,omitempty"  json:"session_key,omitempty"`
	SessionKeyUsed    *bool              `bson:"session_key_used,omitempty"  json:"session_key_used,omitempty"`
	AmountSocketJoins *int               `bson:"amount_socket_joins,omitempty"  json:"amount_socket_joins,omitempty"`
	Picture           *string            `bson:"picture,omitempty"  json:"picture,omitempty"`
	Room              *string            `bson:"room,omitempty"  json:"room,omitempty"`
	UserId            *string            `bson:"userId,omitempty"  json:"userId,omitempty"`
	Status            *string            `bson:"status,omitempty"  json:"status,omitempty"`
	Description       *string            `bson:"description,omitempty"  json:"description,omitempty"`
	CreatedAt         *time.Time         `bson:"uploadDate,omitempty"  json:"uploadDate,omitempty"`
	OutputDate        *time.Time         `bson:"outputDate,omitempty"  json:"outputDate,omitempty"`
	Score             *[]ScoreData       `bson:"score,omitempty"  json:"score,omitempty"`
}

type InputCreateSession struct {
	SessionKey        string
	SessionKeyUsed    bool
	AmountSocketJoins int
	Picture           string
	Status            string
	Room              string
	UserId            string
	CreatedAt         time.Time
}

type InputUpdateSession struct {
	Id                primitive.ObjectID
	Status            string
	SessionKeyUsed    bool
	AmountSocketJoins int
	OutputDate        *time.Time
	Score             []ScoreData
}
