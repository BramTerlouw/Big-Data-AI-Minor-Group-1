package handlerPicture

import (
	"github.com/gin-gonic/gin"
	"paddle-api/services"
)

type handler struct {
	videoService *services.VideoService
}

func NewHandlerPicture(videoService *services.VideoService) *handler {
	return &handler{videoService: videoService}
}

func (h *handler) CreatePictureHandler(ctx *gin.Context) {

}
