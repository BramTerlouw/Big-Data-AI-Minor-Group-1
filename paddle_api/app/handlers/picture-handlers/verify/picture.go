package handlerPicture

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"math/rand"
	"net/http"
	"os/exec"
	model "paddle-api/models"
	"paddle-api/services"
	"strconv"
	"strings"
	"time"
)

type handler struct {
	sessionService *services.SessionService
}

func NewHandlerPicture(sessionService *services.SessionService) *handler {
	return &handler{sessionService: sessionService}
}

func (h *handler) CreatePictureHandler(ctx *gin.Context) {

	//check if file is set
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "please, provide image!"})
		return
	}

	// generating unique filename
	originalFilename := file.Filename
	filename := generateUniqueFilename(originalFilename)

	// getting post values
	userid := ctx.PostForm("user_id")

	// Save the file to disk
	err = ctx.SaveUploadedFile(file, "processedImages/"+userid+"/"+filename)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "please, provide correct image format!"})
		return
	}

	cmd := exec.Command("python3.9", "python/ImageInput.py", "-u", userid, "-f", filename)

	// Execute the command
	output, err := cmd.Output()
	if err != nil {
		fmt.Println("Error executing ImageInput script:", err)
		_, createdSessionError := h.sessionService.CreateSession(&model.InputCreateSession{PictureFilename: filename, UserId: userid, CreatedAt: time.Now(), Status: "Failed"})
		if createdSessionError != nil {
			return
		}
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Something went wrong, try again."})
		return
	}

	//Convert the output to lowercase and remove any whitespace
	str := strings.TrimSpace(strings.ToLower(string(output)))

	// Parse the boolean value
	outputBool, err := strconv.ParseBool(str)
	if err != nil {
		fmt.Println("Error parsing terminal output to boolean", err)

		_, createdSessionError := h.sessionService.CreateSession(&model.InputCreateSession{PictureFilename: filename, UserId: userid, CreatedAt: time.Now(), Status: "Failed"})
		if createdSessionError != nil {
			fmt.Println("Error executing createSession at service", err)
			return
		}
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Something went wrong, try again."})
		return
	}

	if outputBool {
		createdSession, createdSessionError := h.sessionService.CreateSession(&model.InputCreateSession{SessionKey: generateSessionKey().String(), PictureFilename: filename, SessionKeyUsed: false, Room: strconv.FormatInt(generateRoom(), 10), UserId: userid, CreatedAt: time.Now(), Status: "Created"})
		if createdSessionError != nil {
			fmt.Println("Error executing createSession at service", err)
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Something went wrong, try again."})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"message": "Persons are standing in correct position, proceed with filming!", "sessionCode": createdSession.SessionKey, "room": createdSession.Room})
	} else {

		_, createdSessionError := h.sessionService.CreateSession(&model.InputCreateSession{PictureFilename: filename, UserId: userid, CreatedAt: time.Now(), Status: "Failed"})
		if createdSessionError != nil {
			return
		}
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Position is not correct"})
	}
}

func generateUniqueFilename(filename string) string {
	timestamp := time.Now().UnixNano()
	return fmt.Sprintf("%d_%s", timestamp, filename)
}

func generateSessionKey() uuid.UUID {
	return uuid.New()
}

func generateRoom() int64 {
	min := int64(1111)
	max := int64(99999999)
	// set seed
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	return r.Int63n(max-min) + min
}
