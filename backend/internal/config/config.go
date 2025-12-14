package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port           string
	MongoURI       string
	DatabaseName   string
	JWTSecret      string
	JWTExpiry      int
	UploadDir      string
	AllowedOrigins string
}

func Load() *Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mongoURI := os.Getenv("MONGO_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	dbName := os.Getenv("DATABASE_NAME")
	if dbName == "" {
		dbName = "dyeink"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "dyeink-super-secret-key-change-in-production"
	}

	jwtExpiry := 24
	if exp := os.Getenv("JWT_EXPIRY_HOURS"); exp != "" {
		if val, err := strconv.Atoi(exp); err == nil {
			jwtExpiry = val
		}
	}

	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./uploads"
	}

	origins := os.Getenv("ALLOWED_ORIGINS")
	if origins == "" {
		origins = "http://localhost:5173"
	}

	return &Config{
		Port:           port,
		MongoURI:       mongoURI,
		DatabaseName:   dbName,
		JWTSecret:      jwtSecret,
		JWTExpiry:      jwtExpiry,
		UploadDir:      uploadDir,
		AllowedOrigins: origins,
	}
}
