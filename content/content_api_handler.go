package content

import (
	"encoding/json"

	"net/http"
	"slices"
	"strconv"

	"github.com/rs/zerolog/log"

	"github.com/gorilla/mux"
)

type ContentRequestBody struct {
	Path string `json:"path"`
}

func ContentAPIHandler(w http.ResponseWriter, req *http.Request) {
	// vars := mux.Vars(req)
	// path, ok := vars["path"]
	// if !ok {
	// 	path = "."
	// }

	var body ContentRequestBody
	err := json.NewDecoder(req.Body).Decode(&body)
	log.Info().Msgf("%s", body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	relativePath := body.Path
	if relativePath == "" {
		relativePath = "."
	}
	log.Print("path :", relativePath)

	contentType := req.URL.Query().Get("type")
	format := req.URL.Query().Get("format")
	hash_str := req.URL.Query().Get("hash")

	allowedTypes := []string{"directory", "file", "notebook"}
	allowedFormats := []string{"text", "base64"}
	allowedHashes := []int{0, 1}

	if !(slices.Contains(allowedTypes, contentType)) {
		contentType = "file"
	}

	if !(slices.Contains(allowedFormats, format)) {
		format = "base64"
	}

	hash, err := strconv.Atoi(hash_str)
	if err != nil {
		log.Error().Err(err).Msg("")
	}

	if !(slices.Contains(allowedHashes, hash)) {
		hash = 0
	}

	contentModel := GetContent(relativePath, contentType, format, hash)
	// fmt.Println(contentModel)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(contentModel)
}

type ContentPayload struct {
	Extension   string `json:"ext"`
	ContentType string `json:"type"`
}

func ContentCreateAPIHandler(w http.ResponseWriter, req *http.Request) {
	log.Info().Msg("Post request received")

	var contentPayload ContentPayload
	_ = json.NewDecoder(req.Body).Decode(&contentPayload)
	data := newUntitled(contentPayload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(data)
}

type RenameContentPayload struct {
	Path string `json:"path"`
}

func ContentRenameAPIHandler(w http.ResponseWriter, req *http.Request) {
	log.Info().Msg("Patch request received")

	vars := mux.Vars(req)
	oldPath := vars["path"]

	log.Info().Msgf("old path : %s", oldPath)

	var renameContentPayload RenameContentPayload
	_ = json.NewDecoder(req.Body).Decode(&renameContentPayload)

	renameFile(oldPath, renameContentPayload.Path)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func ContentDeleteAPIHandler(w http.ResponseWriter, req *http.Request) {
	log.Info().Msg("Delete request received")
	vars := mux.Vars(req)
	path := vars["path"]
	log.Info().Msgf("path : %s", path)

	deleteFile(path)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
}

func NewErrorResponse(w http.ResponseWriter, i int, s string) {
	panic("unimplemented")
}