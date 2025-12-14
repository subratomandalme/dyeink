package services

import (
	"context"
	"errors"
	"time"

	"github.com/dyeink/backend/internal/config"
	"github.com/dyeink/backend/internal/database"
	"github.com/dyeink/backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type AuthService struct {
	cfg *config.Config
}

func NewAuthService(cfg *config.Config) *AuthService {
	return &AuthService{cfg: cfg}
}

type RegisterInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
	Name     string `json:"name" binding:"required,min=2"`
}

type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
	Token string        `json:"token"`
	User  *models.User  `json:"user"`
}

func (s *AuthService) Register(input *RegisterInput) (*AuthResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var existingUser models.User
	err := database.Users().FindOne(ctx, bson.M{"email": input.Email}).Decode(&existingUser)
	if err == nil {
		return nil, errors.New("email already registered")
	}
	if err != mongo.ErrNoDocuments {
		return nil, err
	}

	user := &models.User{
		Email:     input.Email,
		Name:      input.Name,
		IsAdmin:   true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := user.HashPassword(input.Password); err != nil {
		return nil, err
	}

	result, err := database.Users().InsertOne(ctx, user)
	if err != nil {
		return nil, err
	}

	user.ID = result.InsertedID.(primitive.ObjectID)

	token, err := s.generateToken(user)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{Token: token, User: user}, nil
}

func (s *AuthService) Login(input *LoginInput) (*AuthResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := database.Users().FindOne(ctx, bson.M{"email": input.Email}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("invalid email or password")
		}
		return nil, err
	}

	if !user.CheckPassword(input.Password) {
		return nil, errors.New("invalid email or password")
	}

	token, err := s.generateToken(&user)
	if err != nil {
		return nil, err
	}

	return &AuthResponse{Token: token, User: &user}, nil
}

func (s *AuthService) GetUserByID(id primitive.ObjectID) (*models.User, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var user models.User
	err := database.Users().FindOne(ctx, bson.M{"_id": id}).Decode(&user)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (s *AuthService) generateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"userId":  user.ID.Hex(),
		"email":   user.Email,
		"name":    user.Name,
		"isAdmin": user.IsAdmin,
		"exp":     time.Now().Add(time.Hour * time.Duration(s.cfg.JWTExpiry)).Unix(),
		"iat":     time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(s.cfg.JWTSecret))
}
