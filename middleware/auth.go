package middleware
import (
	"ProblemTracker/database"
	"ProblemTracker/models"
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"github.com/golang-jwt/jwt/v5"
)
type contextKey string
const userIDKey contextKey = "userID"
func writeError(w http.ResponseWriter , ErrorMessage string) {
	w.Header().Set("Content-Type" , "application/json")
	w.WriteHeader(http.StatusUnauthorized)

	json.NewEncoder(w).Encode(map[string]string{
		"error-message": ErrorMessage,
	})
}

func UserIDExists(UserID int) bool {
	var user models.User
	err := database.DB.
		Where("user_id = ?" , UserID).
		First(&user).Error
	return err == nil
}

func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter , r *http.Request) {
		AuthHeader := r.Header.Get("Authorization")
		if AuthHeader == "" {
			writeError(w , "User is not logged in")
			return
		}
		parts := strings.Split(AuthHeader , " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			writeError(w , "Invalid authorization header format")
			return
		}
		tokenString := parts[1]
		token , err := jwt.Parse(tokenString , func(token *jwt.Token) (interface{} , error) {
			_ , ok := token.Method.(*jwt.SigningMethodHMAC)
			if !ok {
				return nil , http.ErrAbortHandler
			}
			return []byte(os.Getenv("JWT_SECRET")) , nil
		})
		if err != nil || !token.Valid {
			writeError(w , "Invalid JWT token")
			return
		}
		Claims , ok := token.Claims.(jwt.MapClaims)
		if !ok {
			writeError(w , "Invalid token claims")
			return
		}
		UserIDFloat , ok := Claims["user_id"].(float64)
		if !ok {
			writeError(w , "Invalid token payload(UserID)")
			return
		}
		UserID := int(UserIDFloat)
		if !UserIDExists(UserID) {
			writeError(w , "User is not in the database")
			return
		}
		ctx := context.WithValue(r.Context() , userIDKey , UserID)
		r = r.WithContext(ctx)
		next.ServeHTTP(w , r)
	})
}

func GetUserIDFromContext(r *http.Request) (int , bool) {
	UserID , ok := r.Context().Value(userIDKey).(int)
	return UserID , ok
}