package database

import (
	"context"
	"log"
	"time"

	"github.com/dyeink/backend/internal/config"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	Client   *mongo.Client
	Database *mongo.Database
)

func Connect(cfg *config.Config) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(cfg.MongoURI)
	clientOptions.SetMaxPoolSize(100)
	clientOptions.SetMinPoolSize(10)

	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		return err
	}

	if err := client.Ping(ctx, nil); err != nil {
		return err
	}

	Client = client
	Database = client.Database(cfg.DatabaseName)

	log.Printf("Connected to MongoDB database: %s", cfg.DatabaseName)
	return nil
}

func Disconnect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return Client.Disconnect(ctx)
}

func GetCollection(name string) *mongo.Collection {
	return Database.Collection(name)
}

func Users() *mongo.Collection {
	return GetCollection("users")
}

func Posts() *mongo.Collection {
	return GetCollection("posts")
}

func Domains() *mongo.Collection {
	return GetCollection("domains")
}
