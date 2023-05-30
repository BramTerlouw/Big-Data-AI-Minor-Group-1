package repositories

import (
	"context"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"paddle-api/database"
	model "paddle-api/models"
	"time"
)

type SessionRepository struct {
	collection *mongo.Collection
}

func NewSessionRepository() *SessionRepository {
	client := database.GetMongoClient()
	collection := client.Database("paddle_app").Collection("sessions")

	return &SessionRepository{
		collection: collection,
	}
}

func (r *SessionRepository) InsertSession(session *model.EntitySession) (*model.EntitySession, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	result, err := r.collection.InsertOne(ctx, session)
	if err != nil {
		return nil, err
	}

	insertedID := result.InsertedID.(primitive.ObjectID)

	filter := bson.M{"_id": insertedID}
	var insertedSession *model.EntitySession
	err = r.collection.FindOne(ctx, filter).Decode(&insertedSession)
	if err != nil {
		return nil, err
	}

	return insertedSession, nil
}

func (r *SessionRepository) GetSessionsByUserID(userId string) ([]*model.EntitySession, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"userId": userId}
	cur, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	sessions := make([]*model.EntitySession, 0)

	for cur.Next(ctx) {
		var session model.EntitySession
		err := cur.Decode(&session)
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, &session)
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return sessions, nil
}

func (r *SessionRepository) GetSessionsBySessionKey(sessionKey string) (*model.EntitySession, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"session_key": sessionKey}
	cur, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cur.Close(ctx)

	var session model.EntitySession

	for cur.Next(ctx) {
		err := cur.Decode(&session)
		if err != nil {
			return nil, err
		}
	}

	if err := cur.Err(); err != nil {
		return nil, err
	}

	return &session, nil
}

func (r *SessionRepository) UpdateSession(session *model.EntitySession) error {

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"_id": session.Id}

	updateFields := bson.M{}

	if session.Status != nil && *session.Status != "" {
		updateFields["status"] = session.Status
	}

	if session.SessionKeyUsed != nil {
		updateFields["session_key_used"] = session.SessionKeyUsed
	}

	if session.AmountSocketJoins != nil {
		updateFields["amount_socket_joins"] = session.AmountSocketJoins
	}

	if session.OutputDate != nil {
		updateFields["outputDate"] = session.OutputDate
	}
	if session.Score != nil && len(*session.Score) != 0 {
		updateFields["score"] = session.Score
	}

	update := bson.M{"$set": updateFields}
	_, err := r.collection.UpdateOne(ctx, filter, update)

	return err
}
