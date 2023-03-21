package handlerPicture

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
	"paddle-api/services"
	"time"
)

type handler struct {
	videoService *services.VideoService
}

func NewHandlerPicture(videoService *services.VideoService) *handler {
	return &handler{videoService: videoService}
}

func (h *handler) CreatePictureHandler(ctx *gin.Context) {

	//check if file is set
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// generating unique filename
	originalFilename := file.Filename
	filename := generateUniqueFilename(originalFilename)
	fmt.Println(filename)
}

func generateUniqueFilename(filename string) string {
	timestamp := time.Now().UnixNano()
	return fmt.Sprintf("%d_%s", timestamp, filename)
}
