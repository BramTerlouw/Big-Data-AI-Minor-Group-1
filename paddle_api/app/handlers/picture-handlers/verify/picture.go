package handlerPicture

import (
	"encoding/base64"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"io"
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
	fileOpen, _ := file.Open()
	defer fileOpen.Close()

	// Buffer the first 512 bytes
	buffer := make([]byte, 512)
	_, err = fileOpen.Read(buffer)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to read file"})
		return
	}

	// Determine the content type of the image file
	contentType := http.DetectContentType(buffer)

	if contentType != "image/jpeg" && contentType != "image/png" {
		ctx.JSON(400, gin.H{"error": "Only jpeg or png images are allowed"})
		return
	}

	// Rewind the file to the beginning
	_, err = fileOpen.Seek(0, 0)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to rewind file"})
		return
	}

	// after validating the image format and rewinding the file
	blob, err := io.ReadAll(fileOpen)
	if err != nil {
		ctx.JSON(500, gin.H{"error": "Failed to read file"})
		return
	}

	// Convert the blob to a base64-encoded string
	blobString := base64.StdEncoding.EncodeToString(blob)

	// Create a Data URI
	uploadPictureBlob := "data:" + contentType + ";base64," + blobString

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
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Something went wrong, try again."})
		return
	}

	//Convert the output to lowercase and remove any whitespace
	str := strings.TrimSpace(strings.ToLower(string(output)))

	// Parse the boolean value
	outputBool, err := strconv.ParseBool(str)
	if err != nil {
		fmt.Println("Error parsing terminal output to boolean", err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Something went wrong, try again."})
		return
	}

	// removing picture and directory after processing
	e := os.RemoveAll("processedImages/" + userid)
	if e != nil {
		fmt.Println("Error removing directory", e)
	}

	if outputBool {
		createdSession, createdSessionError := h.sessionService.CreateSession(&model.InputCreateSession{SessionKey: generateSessionKey().String(), Picture: uploadPictureBlob, SessionKeyUsed: false, Room: strconv.FormatInt(generateRoom(), 10), UserId: userid, CreatedAt: time.Now(), Status: "Created", AmountSocketJoins: 0})
		if createdSessionError != nil {
			fmt.Println("Error executing createSession at service", err)
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Something went wrong, try again."})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"message": "Persons are standing in correct position, proceed with filming!", "sessionCode": createdSession.SessionKey, "room": createdSession.Room})
	} else {
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
