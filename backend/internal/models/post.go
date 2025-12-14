package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Post struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Slug        string             `bson:"slug" json:"slug"`
	Content     string             `bson:"content" json:"content"`
	Excerpt     string             `bson:"excerpt" json:"excerpt"`
	CoverImage  string             `bson:"coverImage" json:"coverImage"`
	Published   bool               `bson:"published" json:"published"`
	PublishedAt *time.Time         `bson:"publishedAt,omitempty" json:"publishedAt"`
	UserID      primitive.ObjectID `bson:"userId" json:"userId"`
	User        *User              `bson:"-" json:"user,omitempty"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt   time.Time          `bson:"updatedAt" json:"updatedAt"`
}

func (p *Post) Publish() {
	now := time.Now()
	p.Published = true
	p.PublishedAt = &now
}

func (p *Post) Unpublish() {
	p.Published = false
	p.PublishedAt = nil
}
