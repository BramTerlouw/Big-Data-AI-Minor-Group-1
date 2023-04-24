package util

import (
	"bytes"
	"encoding/json"
	"errors"
	"github.com/google/uuid"
	"io"
	"log"
	"net/http"
	"strconv"
)

func StartSession(room int) bool {
	if createVideoRoom(room) {
		return true
	} else {
		return false
	}
}

func EndSession(room int) bool {
	if destroyVideoRoom(room) {
		return true
	} else {
		return false
	}
}

func createVideoRoom(room int) bool {
	transactionId := generateTransaction().String()

	sessionEndpoint, errSessionEndpoint := createSessionEndpoint(transactionId)
	if errSessionEndpoint != nil {
		return false
	}

	pluginEndpoint, errPluginEndpoint := createPluginEndpoint(transactionId, sessionEndpoint, "janus.plugin.videoroom")
	if errPluginEndpoint != nil {
		return false
	}

	baseUrl := "http://janus-gateway:8088/janus/" + sessionEndpoint + "/" + pluginEndpoint

	data := struct {
		Janus       string `json:"janus"`
		Transaction string `json:"transaction"`
		Body        struct {
			Request    string `json:"request"`
			Room       int    `json:"room"`
			Permanent  bool   `json:"permanent"`
			IsPrivate  bool   `json:"is_private"`
			Publishers int    `json:"publishers"`
		} `json:"body"`
	}{
		Janus:       "message",
		Transaction: transactionId,
		Body: struct {
			Request    string `json:"request"`
			Room       int    `json:"room"`
			Permanent  bool   `json:"permanent"`
			IsPrivate  bool   `json:"is_private"`
			Publishers int    `json:"publishers"`
		}{
			Request:    "create",
			Room:       room,
			Permanent:  true,
			IsPrivate:  false,
			Publishers: 2,
		},
	}

	// Encode the data as JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}

	// Create a new HTTP request with the desired URL and HTTP method
	req, err := http.NewRequest("POST", baseUrl, bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}

	// Set the content type header
	req.Header.Set("Content-Type", "application/json")

	// Create a new HTTP client and send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.Println(err)
		}
	}(resp.Body)

	response := decodeResponseVideoRoom(resp)

	if response.Janus != "success" {
		return false
	}

	return true
}

func destroyVideoRoom(room int) bool {
	transactionId := generateTransaction().String()
	sessionEndpoint, errSessionEndpoint := createSessionEndpoint(transactionId)
	if errSessionEndpoint != nil {
		return false
	}

	pluginEndpoint, errPluginEndpoint := createPluginEndpoint(transactionId, sessionEndpoint, "janus.plugin.videoroom")
	if errPluginEndpoint != nil {
		return false
	}

	baseUrl := "http://janus-gateway:8088/janus/" + sessionEndpoint + "/" + pluginEndpoint

	data := struct {
		Janus       string `json:"janus"`
		Transaction string `json:"transaction"`
		Body        struct {
			Request   string `json:"request"`
			Room      int    `json:"room"`
			Permanent bool   `json:"permanent"`
		} `json:"body"`
	}{
		Janus:       "message",
		Transaction: transactionId,
		Body: struct {
			Request   string `json:"request"`
			Room      int    `json:"room"`
			Permanent bool   `json:"permanent"`
		}{
			Request:   "destroy",
			Room:      room,
			Permanent: true,
		},
	}

	// Encode the data as JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}

	// Create a new HTTP request with the desired URL and HTTP method
	req, err := http.NewRequest("POST", baseUrl, bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}

	// Set the content type header
	req.Header.Set("Content-Type", "application/json")

	// Create a new HTTP client and send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.Println(err)
		}
	}(resp.Body)

	response := decodeResponseVideoRoom(resp)

	if response.PluginData.Data.VideoRoom != "destroyed" {
		return false
	}

	return true
}

func createSessionEndpoint(transactionId string) (string, error) {
	// Set the request URL and data
	baseUrl := "http://janus-gateway:8088/janus"
	data := struct {
		Janus       string `json:"janus"`
		Transaction string `json:"transaction"`
	}{
		Janus:       "create",
		Transaction: transactionId,
	}

	// Encode the data as JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}

	// Create a new HTTP request with the desired URL and HTTP method
	req, err := http.NewRequest("POST", baseUrl, bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}

	// Set the content type header
	req.Header.Set("Content-Type", "application/json")

	// Create a new HTTP client and send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.Println(err)
		}
	}(resp.Body)

	sessionCreate := decodeResponseSessionCreate(resp)

	if strconv.FormatInt(sessionCreate.Data.ID, 10) == "" {
		log.Println("Error while retrieving SessionCreate")
		return "", errors.New("error while retrieving SessionCreate")
	}

	return strconv.FormatInt(sessionCreate.Data.ID, 10), nil
}

func createPluginEndpoint(transactionId, sessionId, plugin string) (string, error) {
	baseUrl := "http://janus-gateway:8088/janus/" + sessionId

	data := struct {
		Janus       string `json:"janus"`
		Transaction string `json:"transaction"`
		Plugin      string `json:"plugin"`
	}{
		Janus:       "attach",
		Transaction: transactionId,
		Plugin:      plugin,
	}

	// Encode the data as JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		panic(err)
	}

	// Create a new HTTP request with the desired URL and HTTP method
	req, err := http.NewRequest("POST", baseUrl, bytes.NewBuffer(jsonData))
	if err != nil {
		panic(err)
	}

	// Set the content type header
	req.Header.Set("Content-Type", "application/json")

	// Create a new HTTP client and send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			log.Println(err)
		}
	}(resp.Body)

	pluginCreate := decodeResponsePluginCreate(resp)

	if strconv.FormatInt(pluginCreate.Data.ID, 10) == "" {
		log.Println("Error while retrieving SessionCreate")
		return "", errors.New("error while retrieving sessionCreate")
	}

	return strconv.FormatInt(pluginCreate.Data.ID, 10), nil
}

func decodeResponseSessionCreate(resp *http.Response) responseCreateSession {
	// Decode the JSON response
	var response responseCreateSession
	err := json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		log.Println("Error decoding JSON response")
	}

	return response
}

func decodeResponsePluginCreate(resp *http.Response) responseCreatePlugin {
	// Decode the JSON response
	var response responseCreatePlugin
	err := json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		log.Println("Error decoding JSON response")
	}

	return response
}

func decodeResponseVideoRoom(resp *http.Response) videoRoomResponse {
	// Decode the JSON response
	var response videoRoomResponse
	err := json.NewDecoder(resp.Body).Decode(&response)
	if err != nil {
		log.Println("Error decoding JSON response")
	}

	return response
}

func generateTransaction() uuid.UUID {
	return uuid.New()
}

type responseCreateSession struct {
	Janus       string `json:"janus"`
	Transaction string `json:"transaction"`
	Data        struct {
		ID int64 `json:"id"`
	} `json:"data"`
}

type responseCreatePlugin struct {
	Janus       string `json:"janus"`
	Transaction string `json:"transaction"`
	SessionID   int64  `json:"session_id"`
	Data        struct {
		ID int64 `json:"id"`
	} `json:"data"`
}

type videoRoomResponse struct {
	Janus       string `json:"janus"`
	SessionId   int64  `json:"session_id"`
	Transaction string `json:"transaction"`
	Sender      int64  `json:"sender"`
	PluginData  struct {
		Plugin string `json:"plugin"`
		Data   struct {
			VideoRoom string `json:"videoroom"`
			Room      int    `json:"room"`
			Permanent bool   `json:"permanent"`
		} `json:"data"`
	} `json:"plugindata"`
}
