package handlerPicture

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"log"
	"math/rand"
	"net/http"
	"os"
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
	err = ctx.SaveUploadedFile(file, "input/images/"+filename)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "please, provide correct image format!"})
		return
	}

	cmd := exec.Command("python3.9", "python/ImageInput.py", "-u", userid, "-f", filename)

	// Execute the command
	output, err := cmd.Output()
	if err != nil {
		fmt.Println("Error executing ImageInput script:", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Something went wrong, try again."})
		return
	}

	// Convert the output to lowercase and remove any whitespace
	str := strings.TrimSpace(strings.ToLower(string(output)))

	// Parse the boolean value
	outputBool, err := strconv.ParseBool(str)
	if err != nil {
		log.Fatal(err)
	}

	createdSession, createdSessionError := h.sessionService.CreateSession(&model.InputCreateSession{SessionKey: generateSessionKey().String(), SessionKeyUsed: false, Room: strconv.FormatInt(generateRoom(), 10), UserId: userid, CreatedAt: time.Now()})
	if createdSessionError != nil {
		log.Fatal(createdSessionError)
	}

	e := os.Remove("input/images/" + filename)
	if e != nil {
		log.Fatal(e)
	}

	if outputBool {
		ctx.JSON(http.StatusOK, gin.H{"message": "Persons are standing in correct position, proceed with filming!", "sessionCode": createdSession.SessionKey})
	} else {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Persons are standing to close"})
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
