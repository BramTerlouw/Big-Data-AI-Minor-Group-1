package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"log"
	"os"
	config "paddle-api/database"
	route "paddle-api/routes"
	util "paddle-api/utils"
)

func main() {
	router := SetupRouter()

	// Start the server
	if err := router.Run(":8080"); err != nil {
		fmt.Println("Error starting server:", err)
	}
	log.Fatal(router.Run(":" + util.GodotEnv("GO_PORT")))
}

func SetupRouter() *gin.Engine {
	//Setup database
	db := config.Connection()

	//Init router
	router := gin.Default()

	//Setup Mode Application
	if util.GodotEnv("GO_ENV") != "production" && util.GodotEnv("GO_ENV") != "test" {
		gin.SetMode(gin.DebugMode)
	} else if util.GodotEnv("GO_ENV") == "test" {
		gin.SetMode(gin.TestMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	// Create the input directory if it does not exist
	if _, err := os.Stat("input"); os.IsNotExist(err) {
		os.Mkdir("input", 0755)
	}
	// Create the output directory if it does not exist
	if _, err := os.Stat("processedVideos"); os.IsNotExist(err) {
		os.Mkdir("processedVideos", 0755)
	}

	//Init All Route
	route.InitVideoRoutes(db, router)

	return router
}
