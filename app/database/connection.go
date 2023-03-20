package database

import (
	"context"
	"sync"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	clientInstance *mongo.Client
	clientOnce     sync.Once
)

// GetMongoClient returns a MongoDB client instance
func GetMongoClient() *mongo.Client {
	clientOnce.Do(func() {
		uri := "mongodb://root:secret@mongo:27017"
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
		if err != nil {
			panic(err)
		}

		clientInstance = client
	})

	return clientInstance
}
