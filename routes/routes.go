package routes

import(
	"net/http"
	"ProblemTracker/handlers"
	"ProblemTracker/middleware"
)
func SetupRoutes() *http.ServeMux {
	mux := http.NewServeMux();
	mux.HandleFunc("/" , handlers.HomeHandler)
	mux.HandleFunc("/signup" , handlers.SignupHandler)
	mux.HandleFunc("/login" , handlers.LoginHandler)

	mux.Handle("/post-problem" , middleware.AuthMiddleware(http.HandlerFunc(handlers.PostProblemHandler)))
	mux.Handle("/get-problem-by-name" , middleware.AuthMiddleware(http.HandlerFunc(handlers.GetProblemByNameHandler)))
	mux.Handle("/get-problem-by-url" , middleware.AuthMiddleware(http.HandlerFunc(handlers.GetProblemByURLHandler)))
	mux.Handle("/get-all-problems" , middleware.AuthMiddleware(http.HandlerFunc(handlers.GetAllProblemsHandler)))
	mux.Handle("/delete-problem" , middleware.AuthMiddleware(http.HandlerFunc(handlers.DeleteProblemHandler)))
	return mux
}