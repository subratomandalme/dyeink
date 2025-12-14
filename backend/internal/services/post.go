package services

import (
	"context"
	"errors"
	"time"

	"github.com/dyeink/backend/internal/database"
	"github.com/dyeink/backend/internal/models"
	"github.com/gosimple/slug"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PostService struct{}

func NewPostService() *PostService {
	return &PostService{}
}

type CreatePostInput struct {
	Title      string `json:"title" binding:"required"`
	Content    string `json:"content"`
	Excerpt    string `json:"excerpt"`
	CoverImage string `json:"coverImage"`
	Published  bool   `json:"published"`
}

type UpdatePostInput struct {
	Title      *string `json:"title"`
	Content    *string `json:"content"`
	Excerpt    *string `json:"excerpt"`
	CoverImage *string `json:"coverImage"`
	Published  *bool   `json:"published"`
}

type PostQuery struct {
	Page      int
	Limit     int
	Published *bool
	UserID    *primitive.ObjectID
}

type PostListResponse struct {
	Posts      []models.Post `json:"posts"`
	Total      int64         `json:"total"`
	Page       int           `json:"page"`
	TotalPages int           `json:"totalPages"`
}

func (s *PostService) Create(userID primitive.ObjectID, input *CreatePostInput) (*models.Post, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	postSlug := slug.Make(input.Title)

	var existingPost models.Post
	counter := 0
	originalSlug := postSlug
	for {
		err := database.Posts().FindOne(ctx, bson.M{"slug": postSlug}).Decode(&existingPost)
		if err == mongo.ErrNoDocuments {
			break
		}
		counter++
		postSlug = originalSlug + "-" + string(rune('0'+counter))
	}

	post := &models.Post{
		Title:      input.Title,
		Slug:       postSlug,
		Content:    input.Content,
		Excerpt:    input.Excerpt,
		CoverImage: input.CoverImage,
		Published:  input.Published,
		UserID:     userID,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	if input.Published {
		post.Publish()
	}

	result, err := database.Posts().InsertOne(ctx, post)
	if err != nil {
		return nil, err
	}

	post.ID = result.InsertedID.(primitive.ObjectID)
	return post, nil
}

func (s *PostService) GetByID(id primitive.ObjectID) (*models.Post, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var post models.Post
	err := database.Posts().FindOne(ctx, bson.M{"_id": id}).Decode(&post)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("post not found")
		}
		return nil, err
	}

	var user models.User
	if err := database.Users().FindOne(ctx, bson.M{"_id": post.UserID}).Decode(&user); err == nil {
		post.User = &user
	}

	return &post, nil
}

func (s *PostService) GetBySlug(slugStr string) (*models.Post, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var post models.Post
	err := database.Posts().FindOne(ctx, bson.M{"slug": slugStr}).Decode(&post)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return nil, errors.New("post not found")
		}
		return nil, err
	}

	var user models.User
	if err := database.Users().FindOne(ctx, bson.M{"_id": post.UserID}).Decode(&user); err == nil {
		post.User = &user
	}

	return &post, nil
}

func (s *PostService) List(query *PostQuery) (*PostListResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	if query.Published != nil {
		filter["published"] = *query.Published
	}
	if query.UserID != nil {
		filter["userId"] = *query.UserID
	}

	total, err := database.Posts().CountDocuments(ctx, filter)
	if err != nil {
		return nil, err
	}

	if query.Limit <= 0 {
		query.Limit = 10
	}
	if query.Page <= 0 {
		query.Page = 1
	}

	skip := int64((query.Page - 1) * query.Limit)
	totalPages := int((total + int64(query.Limit) - 1) / int64(query.Limit))

	opts := options.Find().
		SetSort(bson.D{{Key: "createdAt", Value: -1}}).
		SetLimit(int64(query.Limit)).
		SetSkip(skip)

	cursor, err := database.Posts().Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var posts []models.Post
	if err := cursor.All(ctx, &posts); err != nil {
		return nil, err
	}

	if posts == nil {
		posts = []models.Post{}
	}

	for i := range posts {
		var user models.User
		if err := database.Users().FindOne(ctx, bson.M{"_id": posts[i].UserID}).Decode(&user); err == nil {
			posts[i].User = &user
		}
	}

	return &PostListResponse{
		Posts:      posts,
		Total:      total,
		Page:       query.Page,
		TotalPages: totalPages,
	}, nil
}

func (s *PostService) Update(id primitive.ObjectID, input *UpdatePostInput) (*models.Post, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	post, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	update := bson.M{"updatedAt": time.Now()}

	if input.Title != nil {
		update["title"] = *input.Title
		update["slug"] = slug.Make(*input.Title)
	}
	if input.Content != nil {
		update["content"] = *input.Content
	}
	if input.Excerpt != nil {
		update["excerpt"] = *input.Excerpt
	}
	if input.CoverImage != nil {
		update["coverImage"] = *input.CoverImage
	}
	if input.Published != nil {
		update["published"] = *input.Published
		if *input.Published && !post.Published {
			now := time.Now()
			update["publishedAt"] = now
		} else if !*input.Published {
			update["publishedAt"] = nil
		}
	}

	_, err = database.Posts().UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": update})
	if err != nil {
		return nil, err
	}

	return s.GetByID(id)
}

func (s *PostService) Delete(id primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := database.Posts().DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return errors.New("post not found")
	}
	return nil
}
