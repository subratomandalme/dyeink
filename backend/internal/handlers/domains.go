package handlers

import (
	"net/http"

	"github.com/dyeink/backend/internal/services"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type DomainHandler struct {
	domainService *services.DomainService
}

func NewDomainHandler(domainService *services.DomainService) *DomainHandler {
	return &DomainHandler{domainService: domainService}
}

func (h *DomainHandler) Create(c *gin.Context) {
	userID := c.MustGet("userId").(primitive.ObjectID)

	var input services.CreateDomainInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	domain, err := h.domainService.Create(userID, &input)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"domain":       domain,
		"instructions": domain.GetDNSInstructions(),
	})
}

func (h *DomainHandler) List(c *gin.Context) {
	userID := c.MustGet("userId").(primitive.ObjectID)

	domains, err := h.domainService.ListByUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"domains": domains})
}

func (h *DomainHandler) GetInstructions(c *gin.Context) {
	userID := c.MustGet("userId").(primitive.ObjectID)
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid domain ID"})
		return
	}

	domain, err := h.domainService.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	if domain.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"error": "Access denied"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"domain":       domain,
		"instructions": domain.GetDNSInstructions(),
	})
}

func (h *DomainHandler) Delete(c *gin.Context) {
	userID := c.MustGet("userId").(primitive.ObjectID)
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid domain ID"})
		return
	}

	if err := h.domainService.Delete(id, userID); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Domain deleted successfully"})
}

func (h *DomainHandler) Verify(c *gin.Context) {
	userID := c.MustGet("userId").(primitive.ObjectID)
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid domain ID"})
		return
	}

	domain, err := h.domainService.Verify(id, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"domain": domain})
}
