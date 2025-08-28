package main

import (
    "net/http"
    "github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()
    
    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status": "OK",
            "service": "go-service",
            "version": "1.0.0",
        })
    })
    
    r.GET("/api/data", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "message": "Hello from Captain Guthilda's Go service!",
            "data": []string{"item1", "item2", "item3"},
        })
    })
    
    r.Run(":8080")
}
