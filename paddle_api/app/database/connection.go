package database

import (
	"context"
	util "paddle-api/utils"
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
		ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()

		client, err := mongo.Connect(ctx, options.Client().ApplyURI(util.GodotEnv("MONGODB_URL")))
		if err != nil {
			panic(err)
		}

		clientInstance = client
	})

	return clientInstance
}
