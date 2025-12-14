package services

import (
	"context"
	"errors"
	"net"
	"strings"
	"time"

	"github.com/dyeink/backend/internal/database"
	"github.com/dyeink/backend/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type DomainService struct{}

func NewDomainService() *DomainService {
	return &DomainService{}
}

type CreateDomainInput struct {
	Domain string `json:"domain" binding:"required"`
}

func (s *DomainService) Create(userID primitive.ObjectID, input *CreateDomainInput) (*models.Domain, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	domainName := strings.ToLower(strings.TrimSpace(input.Domain))

	var existing models.Domain
	err := database.Domains().FindOne(ctx, bson.M{"domain": domainName}).Decode(&existing)
	if err == nil {
		return nil, errors.New("domain already registered")
	}
	if err != mongo.ErrNoDocuments {
		return nil, err
	}

	d := &models.Domain{
		Domain:    domainName,
		UserID:    userID,
		Verified:  false,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	d.GenerateVerifyToken()

	result, err := database.Domains().InsertOne(ctx, d)
	if err != nil {
		return nil, err
	}

	d.ID = result.InsertedID.(primitive.ObjectID)
	return d, nil
}

func (s *DomainService) ListByUser(userID primitive.ObjectID) ([]models.Domain, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := database.Domains().Find(ctx, bson.M{"userId": userID})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var domains []models.Domain
	if err := cursor.All(ctx, &domains); err != nil {
		return nil, err
	}

	if domains == nil {
		domains = []models.Domain{}
	}

	return domains, nil
}

func (s *DomainService) GetByID(id primitive.ObjectID) (*models.Domain, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var domain models.Domain
	err := database.Domains().FindOne(ctx, bson.M{"_id": id}).Decode(&domain)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("domain not found")
		}
		return nil, err
	}
	return &domain, nil
}

func (s *DomainService) Delete(id primitive.ObjectID, userID primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := database.Domains().DeleteOne(ctx, bson.M{"_id": id, "userId": userID})
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return errors.New("domain not found")
	}
	return nil
}

func (s *DomainService) Verify(id primitive.ObjectID, userID primitive.ObjectID) (*models.Domain, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	domain, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	if domain.UserID != userID {
		return nil, errors.New("unauthorized")
	}

	if domain.Verified {
		return domain, nil
	}

	txtRecords, err := net.LookupTXT("_dyeink-verification." + domain.Domain)
	if err != nil {
		return nil, errors.New("could not lookup DNS records")
	}

	verified := false
	for _, txt := range txtRecords {
		if strings.TrimSpace(txt) == domain.VerifyToken {
			verified = true
			break
		}
	}

	if !verified {
		return nil, errors.New("verification token not found in DNS")
	}

	_, err = database.Domains().UpdateOne(ctx, bson.M{"_id": id}, bson.M{
		"$set": bson.M{
			"verified":  true,
			"updatedAt": time.Now(),
		},
	})
	if err != nil {
		return nil, err
	}

	domain.Verified = true
	return domain, nil
}
