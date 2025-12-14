package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/dyeink/backend/internal/config"
	"github.com/dyeink/backend/internal/database"
	"github.com/dyeink/backend/internal/handlers"
	"github.com/dyeink/backend/internal/middleware"
	"github.com/dyeink/backend/internal/services"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()

	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.CORSMiddleware(cfg))

	r.Static("/uploads", cfg.UploadDir)

	authService := services.NewAuthService(cfg)
	postService := services.NewPostService()
	domainService := services.NewDomainService()

	authHandler := handlers.NewAuthHandler(authService)
	postHandler := handlers.NewPostHandler(postService)
	domainHandler := handlers.NewDomainHandler(domainService)
	uploadHandler := handlers.NewUploadHandler(cfg.UploadDir)

	api := r.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(cfg), authHandler.Me)
		}

		posts := api.Group("/posts")
		{
			posts.GET("", postHandler.ListPublished)
			posts.GET("/:slug", postHandler.GetBySlug)
		}

		admin := api.Group("/admin")
		admin.Use(middleware.AuthMiddleware(cfg))
		{
			admin.GET("/posts", postHandler.List)
			admin.GET("/posts/:id", postHandler.GetByID)
			admin.POST("/posts", postHandler.Create)
			admin.PUT("/posts/:id", postHandler.Update)
			admin.DELETE("/posts/:id", postHandler.Delete)

			admin.GET("/domains", domainHandler.List)
			admin.POST("/domains", domainHandler.Create)
			admin.GET("/domains/:id", domainHandler.GetInstructions)
			admin.DELETE("/domains/:id", domainHandler.Delete)
			admin.POST("/domains/:id/verify", domainHandler.Verify)

			admin.POST("/upload", uploadHandler.Upload)
		}
	}

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "name": "DyeInk API", "database": "MongoDB"})
	})

	srv := &http.Server{
		Addr:    ":" + cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("DyeInk API server starting on port %s (MongoDB)", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	if err := database.Disconnect(); err != nil {
		log.Printf("Error disconnecting from MongoDB: %v", err)
	}

	log.Println("Server exited")
}
