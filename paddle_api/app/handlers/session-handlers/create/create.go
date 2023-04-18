package create

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"os/exec"
	"paddle-api/services"
	util "paddle-api/utils"
	"strconv"
)

type handler struct {
	sessionService *services.SessionService
}

func NewHandlerCreateSession(sessionService *services.SessionService) *handler {
	return &handler{sessionService: sessionService}
}

func (h *handler) CreateSessionHandler(ctx *gin.Context) {
	sessionKey := ctx.Param("key")

	if sessionKey == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide session key!"})
	}

	session, getSessionError := h.sessionService.GetSessionsBySessionKey(sessionKey)
	if getSessionError != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "An error occurred while getting the session"})
		return
	}

	if session.SessionKey == nil || *session.SessionKeyUsed == true {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Incorrect or already used session key!"})
		return
	}

	roomInt, err := strconv.Atoi(*session.Room)
	if err != nil {
		log.Println(err)
	}

	if util.CreateVideoRoom(roomInt) == false {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Something went wrong, try again."})
	}

	if util.CreateTextRoom(roomInt) == false {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Something went wrong, try again."})
	}

	go func() {
		cmd := exec.Command("python3.9", "python/Stream.py", "-r", *session.Room)
		print(cmd.Err)
		// Execute the command
		output, err := cmd.Output()
		if err != nil {
			log.Println("Error executing Stream script:", err)
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Something went wrong, try again."})
			return
		}
		fmt.Println(*session.Room)
		fmt.Println(string(output))
	}()

	ctx.JSON(http.StatusOK, gin.H{"message": "session has started"})
}
