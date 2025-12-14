package models

import (
	"time"

	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Domain struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Domain      string             `bson:"domain" json:"domain"`
	Verified    bool               `bson:"verified" json:"verified"`
	VerifyToken string             `bson:"verifyToken" json:"verifyToken"`
	UserID      primitive.ObjectID `bson:"userId" json:"userId"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

func (d *Domain) GenerateVerifyToken() {
	if d.VerifyToken == "" {
		d.VerifyToken = uuid.New().String()
	}
}

func (d *Domain) GetDNSInstructions() map[string]string {
	return map[string]string{
		"type":  "TXT",
		"name":  "_dyeink-verification." + d.Domain,
		"value": d.VerifyToken,
	}
}
