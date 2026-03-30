# Upgrade to Java 25 to match your local Windows compiler
FROM eclipse-temurin:25-jdk-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the compiled JAR file from your target folder into the container
COPY target/*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Command to boot the Spring application
ENTRYPOINT ["java", "-jar", "app.jar"]