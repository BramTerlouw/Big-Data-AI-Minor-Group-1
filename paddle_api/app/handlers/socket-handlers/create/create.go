package create

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"net/http"
	model "paddle-api/models"
	"paddle-api/services"
	"sync"
)

type handler struct {
	sessionService *services.SessionService
	upgrader       websocket.Upgrader
	rooms          map[string]*Room
	mu             sync.Mutex
}

type Room struct {
	id      string
	clients []*websocket.Conn
	mu      sync.Mutex
}

func newRoom(id string) *Room {
	return &Room{
		id:      id,
		clients: []*websocket.Conn{},
	}
}

func (r *Room) join(conn *websocket.Conn) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.clients = append(r.clients, conn)
}

func (r *Room) leave(conn *websocket.Conn) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for i, c := range r.clients {
		if c == conn {
			r.clients = append(r.clients[:i], r.clients[i+1:]...)
			break
		}
	}
}

func (r *Room) broadcast(msg []byte) {
	r.mu.Lock()
	defer r.mu.Unlock()
	for _, c := range r.clients {
		c.WriteMessage(websocket.TextMessage, msg)
	}
}

func NewHandlerCreateSocket(sessionService *services.SessionService) *handler {
	return &handler{
		sessionService: sessionService,
		upgrader: websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
		rooms: make(map[string]*Room),
	}
}

func (h *handler) CreateSocketHandler(ctx *gin.Context) {

	sessionKey := ctx.Param("key")

	if sessionKey == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Please provide session key!"})
	}

	session, getSessionError := h.sessionService.GetSessionsBySessionKey(sessionKey)
	if getSessionError != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "An error occurred while getting the session"})
		return
	}

	if session.SessionKey == nil || *session.AmountSocketJoins >= 2 {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Incorrect or already used session key!"})
		return
	} else {
		// Set key as used
		e := h.sessionService.UpdateSession(&model.InputUpdateSession{Id: session.Id, AmountSocketJoins: *session.AmountSocketJoins + 1})

		if e != nil {
			fmt.Println("Failed to update amount socket joins:", e)
		}
	}

	conn, err := h.upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		fmt.Println("Failed to set websocket upgrade:", err)
		return
	}

	// checking if room is already created, if so then return the existing value
	h.mu.Lock()
	room, exists := h.rooms[*session.Room]
	if !exists {
		room = newRoom(*session.Room)
		h.rooms[*session.Room] = room
	}
	h.mu.Unlock()

	room.join(conn)
	defer room.leave(conn)

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			break
		}
		room.broadcast(msg)
	}
}
